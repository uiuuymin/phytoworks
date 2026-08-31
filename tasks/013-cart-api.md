# Task: Cart API와 PostgreSQL 저장소 구현

**Status:** 구현 완료, 커밋 전

## Goal

현재 browser `localStorage`에만 존재하는 Cart 선택 목록을 NestJS와 PostgreSQL에서
관리할 수 있는 최소 API를 구현한다. 이번 task의 완료 조건은 다음과 같다.

- `X-Cart-Session-Id`로 식별한 익명 Cart를 조회하고 생성할 수 있다.
- Product가 `DIRECT_PURCHASE`인 경우에만 Cart에 담을 수 있다.
- 같은 Product를 다시 담으면 한 항목으로 합쳐지고 수량이 증가한다.
- Cart 항목의 수량을 양의 정수로 변경하고 명시적으로 제거할 수 있다.
- 알 수 없는 Product, `QUOTE_REQUIRED` Product와 잘못된 요청을 안전한 HTTP 오류로 처리한다.
- PostgreSQL schema와 migration이 Cart와 CartItem의 ownership, relation과 unique 규칙을 표현한다.
- Product, Health API의 기존 계약을 유지한다.
- 가격, 재고, 옵션별 추가 금액, Customer, Order, Payment와 인증을 임의로 추가하지 않는다.
- API unit, HTTP endpoint와 PostgreSQL integration 검증이 통과한다.

## Context

Current Demo의 Cart는 Product ID와 수량만 browser `localStorage`에 저장한다. 서버 Cart는 아직
없으며, Product는 Prisma 7 stable을 통해 PostgreSQL에서 읽는다. 주문이나 결제를 만들기 전에는
Cart를 주문 확정 데이터로 신뢰할 수 없으므로, 이번 API도 선택 목록의 저장과 조회만 담당한다.

인증과 Customer 모델이 아직 없기 때문에 이번 MVP는 요청의 `X-Cart-Session-Id` header를 익명
세션 식별자로 사용한다. 이 값은 사용자가 조작할 수 있는 입력이며 Cart ownership을 보장하지
않는다. production에서는 Customer 또는 서버가 발급한 secure session cookie를 별도 결정해야 한다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/architecture-overview.md`
- `docs/domain/product.md`
- `docs/domain/cart.md`
- `docs/adr/003-prisma-postgresql-access.md`
- `docs/development/testing-strategy.md`
- `docs/development/workflow.md`
- `tasks/006-cart.md`
- `tasks/009-product-database.md`
- `tasks/011-product-pricing-options-api.md`
- `tasks/012-product-web-api-integration.md`

## Current State

- 기준 branch는 `uiuuymin/cart-api`이며 `uiuuymin/product-web-api-integration`의 `691aa74`에서 생성했다.
- Product DB schema에는 `Product`만 있고 Cart 또는 CartItem 모델은 없다.
- `Prisma7Service`와 `PrismaProductRepository`가 PostgreSQL 접근을 담당한다.
- `ProductService`는 Product 존재 여부와 `purchaseMode`를 읽을 수 있지만 Cart API는 없다.
- Web Cart는 `CartProvider`와 `localStorage`를 사용하며 이번 task에서는 Web fetch 연결을 변경하지 않는다.
- `DATABASE_URL`이 없으면 Prisma client가 기동 시 연결을 만들 때 오류가 발생한다. 실제 credential은 저장하지 않는다.

## API Contract

Cart는 `X-Cart-Session-Id` header가 있는 요청만 처리한다. 세션 ID는 비어 있지 않은 1자 이상
128자 이하의 문자열로 제한한다. 응답에는 세션 ID, DB Cart ID, 가격, 재고와 Product snapshot을
포함하지 않는다.

```http
GET /api/cart
X-Cart-Session-Id: demo-session-1
```

```json
{
  "items": [
    { "productId": "thermal-imaging", "quantity": 2 }
  ],
  "totalQuantity": 2
}
```

```http
POST /api/cart/items
X-Cart-Session-Id: demo-session-1
Content-Type: application/json

{ "productId": "thermal-imaging", "quantity": 1 }
```

POST의 `quantity` 기본값은 1이며 기존 항목이 있으면 현재 수량에 더한다.

```http
PATCH /api/cart/items/thermal-imaging
X-Cart-Session-Id: demo-session-1
Content-Type: application/json

{ "quantity": 3 }
```

```http
DELETE /api/cart/items/thermal-imaging
X-Cart-Session-Id: demo-session-1
```

POST, PATCH와 DELETE는 변경 후의 동일한 Cart 응답을 반환한다. 빈 Cart는
`{ "items": [], "totalQuantity": 0 }`을 반환한다.

오류 응답은 NestJS의 기본 `{ "statusCode": number, "message": string, "error": string }`
shape를 사용하되 SQL, credential과 내부 stack trace를 message에 넣지 않는다.

- header 누락 또는 요청 body 오류: 400
- 알 수 없는 Product: 404
- `QUOTE_REQUIRED` Product: 422
- 존재하지 않는 Cart item: 404
- persistence 오류: 500과 `Cart data unavailable`

## Options Considered

### Cart owner 식별

1. Customer 인증을 먼저 구현한다.
   - ownership이 명확하지만 현재 범위를 인증·Customer까지 확장한다.
2. 서버가 secure cookie를 발급한다.
   - browser 흐름에 자연스럽지만 cookie 설정, CSRF와 session lifecycle을 함께 결정해야 한다.
3. `X-Cart-Session-Id` header를 사용한다.
   - 인증 dependency 없이 API와 repository를 빠르게 검증할 수 있다. 다만 값이 위조될 수 있다.

**선택:** 3번을 선택한다. 현재는 학습용 익명 session MVP이며, production ownership은 Proposed다.

### Cart persistence 경계

1. Controller에서 Prisma를 직접 호출한다.
   - 파일 수가 적지만 HTTP 계약과 persistence가 섞이고 테스트가 어렵다.
2. CartService가 Prisma를 직접 호출한다.
   - CRUD는 빠르지만 service가 Prisma API에 고정된다.
3. CartRepository port와 Prisma adapter를 분리한다.
   - Product API와 같은 경계를 유지하고 static/in-memory test double을 사용할 수 있다.

**선택:** 3번을 선택한다. `CartController → CartService → CartRepository → Prisma7Service` 경계를
유지한다.

### 요청 변경 방식

1. Cart 전체를 한 번에 교체한다.
   - client 구현은 단순하지만 동시 변경과 개별 항목 오류 처리가 불명확하다.
2. item 단위 POST, PATCH, DELETE를 제공한다.
   - 현재 Cart UI 동작과 맞고 repository transaction 범위를 작게 확인할 수 있다.

**선택:** 2번을 선택한다. Cart aggregate 응답은 변경 직후 다시 읽어 반환한다.

## Data Ownership and Schema

- Cart의 소유 식별자는 `sessionId`이며 MVP에서만 사용한다.
- CartItem은 `cartId + productId` unique로 같은 Product를 한 줄로 유지한다.
- Product와 CartItem은 foreign key로 연결하며, Product의 이름과 판매 방식은 현재 Product table을
  기준으로 다시 확인한다.
- CartItem에는 가격, 통화, 재고, option selection 또는 snapshot을 저장하지 않는다.
- `quantity`는 PostgreSQL `Int`와 service의 양의 안전한 정수 검증으로 제한한다.
- Cart 삭제 시 CartItem은 cascade 삭제한다. Product 삭제는 CartItem 때문에 임의로 허용하지 않으며
  실제 Product lifecycle 정책은 별도 task다.
- schema와 migration은 `apps/api/prisma/`가 소유하고, Prisma 결과를 API model로 바꾸는 adapter는
  `apps/api/src/cart/`가 소유한다.

## Module Boundary

```text
CartController
        ↓
CartService ──→ ProductService
        ↓
CartRepository port
        ↓
PrismaCartRepository
        ↓
Prisma7Service → PostgreSQL
```

`CartModule`은 `ProductModule`과 `Prisma7Module`을 import하고, `HealthModule`과는 독립적인
sibling feature module로 `AppModule`에 등록한다. ProductService는 Cart 변경을 알지 못한다.

## Scope and Non-goals

### Scope

- Cart와 CartItem Prisma schema 및 최초 migration
- `CartRepository` port와 Prisma adapter
- `CartModule`, Controller, Service와 DTO 입력 검증
- Cart API unit, HTTP endpoint와 PostgreSQL integration test
- API README와 이 task의 실행 기록 갱신

### Non-goals

- Next.js에서 Cart API를 호출하도록 변경
- 기존 localStorage Cart 자동 병합 또는 migration
- Customer, 인증, secure cookie와 session ownership 보장
- 가격, 재고, 품절, 옵션별 추가 금액과 판매 정책
- Quote, Order, Payment, Checkout
- Docker, 배포, production credential과 운영 환경값
- Swagger/OpenAPI와 공통 contracts package

## Plan

1. Prisma schema에 Cart와 CartItem relation을 추가한다.
2. Prisma generate와 migration을 실행하고 fresh/test database에서 schema를 확인한다.
3. Cart repository port, Prisma adapter와 Cart service를 구현한다.
4. Controller에서 header와 body를 검증하고 안전한 HTTP 오류 계약을 적용한다.
5. static/in-memory repository를 사용하는 unit test와 실제 Nest HTTP endpoint test를 추가한다.
6. PostgreSQL integration에서 session isolation, merge, quantity update, remove와 purchase mode를 확인한다.
7. lint, typecheck, test, build, migration 재실행과 실제 HTTP 요청을 수행한다.

## Changes

- `apps/api/prisma/schema.prisma`에 `Cart`, `CartItem`과 Product relation을 추가했다.
- `apps/api/prisma/migrations-prisma7/20260831160455_cart_init/migration.sql`을 생성하고 PostgreSQL에 적용했다.
- `apps/api/src/cart/`에 Cart read model, repository port, Prisma adapter, in-memory test double,
  service, controller와 module을 추가했다.
- `CartService`는 ProductService로 Product 존재 여부와 `DIRECT_PURCHASE`를 확인한다.
- `POST /api/cart/items`는 같은 session과 Product의 수량을 합치고, PATCH와 DELETE는 item 단위로 변경한다.
- Cart 응답은 Product ID, 수량과 `totalQuantity`만 포함한다.
- `apps/api/test/cart.e2e-spec.ts`와 Cart service/repository test를 추가했다.
- `apps/api/package.json`에 Cart migration script를 추가하고 integration test glob을 확장했다.
- API README, Cart domain, architecture context를 현재 서버 Cart 상태에 맞게 갱신했다.
- Web lint script에서 이미 삭제된 `apps/web/data` 경로를 제거했다. Product Web API 연동에서 발생한
  통합 lint 오류를 해결하기 위한 최소 수정이며 Web fetch 동작은 변경하지 않았다.

## Problems Encountered

구현 중 다음 문제가 발생했다.

- 새 worktree는 setup을 건너뛰었으므로 첫 Prisma 명령에서 package link가 없었다.
- pnpm 일반 install과 Prisma script 실행은 `@prisma/engines`와 `prisma` build approval이 없어서
  `ERR_PNPM_IGNORED_BUILDS`로 중단되었다.
- `DATABASE_URL`이 없으면 Prisma config의 `env()`가 generate 단계부터 실패했다.
- Biome 자동 정리가 Nest DI용 ProductService import를 type-only import로 바꾸어 첫 HTTP test에서
  `CartService` dependency resolution이 실패했다.
- 기존 Web lint script가 삭제된 `apps/web/data` 경로를 계속 검사했다.
- shell 초기화 script가 존재하지 않는 `SSL_CERT_FILE`을 제거하려는 경고를 반복했다.

## Resolution

다음과 같이 해결했다.

- `pnpm install --offline --frozen-lockfile --ignore-scripts`로 이 worktree의 package link만 완료했다.
  `--ignore-scripts`는 permanent pnpm policy 해결책으로 사용하지 않았다.
- `DATABASE_URL`은 로컬 PowerShell process에만 placeholder가 아닌 기존 로컬 테스트 DB 연결값으로
  주입했으며 파일에는 저장하지 않았다.
- `prisma generate`와 `prisma migrate dev --name cart-init`을 성공시켰다.
- ProductService는 Nest runtime metadata가 필요하므로 import를 runtime import로 복구하고 Biome
  ignore를 추가했다.
- Web lint script에서 존재하지 않는 `data` 경로만 제거했다.
- `SSL_CERT_FILE` 경고는 repository 변경과 무관하므로 shell profile은 수정하지 않았다.

## Verification

실행한 명령과 결과는 다음과 같다.

- `pnpm install --offline --frozen-lockfile --ignore-scripts` → 성공, lockfile 변경 없음
- `pnpm --filter @phytoworks/api prisma:generate` → 성공, Prisma Client 7.10.0 생성
- `pnpm --filter @phytoworks/api prisma:migrate:cart` → 성공, Cart migration 최초 생성·적용
- `pnpm --filter @phytoworks/api prisma:migrate:deploy` → 성공, 2 migrations 발견·pending 없음
- `pnpm --filter @phytoworks/api prisma:seed` → 성공, Product 3건 seed
- `pnpm --filter @phytoworks/api exec prisma validate` → 성공
- `pnpm --filter @phytoworks/api exec prisma migrate status` → 성공, schema up to date
- `pnpm --filter @phytoworks/api test:integration` → 성공, Product와 Cart integration 4 tests
- `pnpm --filter @phytoworks/api lint` → 성공
- `pnpm --filter @phytoworks/api typecheck` → 성공
- `pnpm --filter @phytoworks/api test` → 성공, 8 files, 26 tests
- `pnpm --filter @phytoworks/api build` → 성공
- root `pnpm lint` → 성공, API와 Web 각 41 files
- root `pnpm typecheck` → 성공
- root `pnpm test` → 성공, API 8 files, 26 tests
- root `pnpm build` → 성공, API와 Web build
- 실제 HTTP API → 성공. `GET /health` 200, Product 목록 3건, Cart 빈 조회 0, 추가 1, 반복 추가 3,
  수량 변경 4, 삭제 후 0을 확인했다.

- 정상 Cart 빈 목록
- Product 추가와 같은 Product merge
- 수량 변경과 제거
- 알 수 없는 Product와 `QUOTE_REQUIRED` Product
- 잘못된 header와 body
- 다른 session 간 Cart 격리
- Product API와 `GET /health` 회귀
- migration 최초 실행과 재실행
- lint, typecheck, test와 build

## Diff Review

최종 검증 전에 Cart API와 관련된 schema, migration, API source, test, README, context와 task만
변경되었는지 확인한다. 가격, 재고, Customer, Order, Payment, Web fetch와 credential이 diff에
없는지 확인한다. generated Prisma client는 schema 변경에 따른 산출물로만 포함한다.

`git diff --check`는 수동 source와 migration에는 문제가 없었으나 Prisma 7 generated client가
생성한 주석의 trailing whitespace를 추가된 줄로 보고했다. generated 파일을 수동 수정하지 않고
이 known artifact를 남겼다. 다음 Prisma 버전 또는 generated output 정책을 검토할 때 다시 확인한다.

## Follow-up

- Customer 인증 또는 secure session cookie를 도입하고 Cart ownership을 보장한다.
- localStorage Cart와 서버 Cart의 병합·이관 정책을 결정한다.
- Product 활성 상태, 재고와 주문 생성 직전의 최신 검증을 추가한다.
- 주문 금액을 확정할 때 Product price snapshot과 transaction 경계를 별도 설계한다.
- option 조합을 CartItem identity에 포함할지 결정한다.
- 필요하면 Cart API와 Web 사이의 shared contract를 별도 task에서 검토한다.

## Lessons Learned

- NestJS ESM에서 constructor dependency는 runtime import가 필요하며 `import type`으로 바꾸면
  TypeScript는 통과해도 application bootstrap이 실패할 수 있다.
- Prisma schema를 추가할 때 generated client, migration, repository adapter와 integration test를
  함께 확인해야 API가 compile만 통과하는 상태를 피할 수 있다.
- browser Cart와 API Cart는 session identity와 병합 정책을 먼저 정하지 않으면 Web 연동에서
  사용자가 가진 localStorage 항목을 임의로 잃을 수 있다.
