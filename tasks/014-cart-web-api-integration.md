# Task: Web Cart와 Cart API 연동

**Status:** 구현 완료, 커밋 전

## Goal

Web Cart의 Product ID와 수량 source를 browser `localStorage`에서 NestJS Cart API로 전환한다.
사용자가 Product Detail에서 담기, `/cart`에서 수량 변경과 제거를 수행하면 다음 경로로 처리한다.

```text
Browser CartProvider
        ↓ same-origin fetch
Next.js route handler
        ↓ server-only API_BASE_URL
NestJS Cart API
        ↓ CartRepository / Prisma 7
PostgreSQL
```

현재 화면의 Product 조회, `DIRECT_PURCHASE`와 `QUOTE_REQUIRED` 규칙, Cart 응답 표시와 접근성
구조는 유지한다. 이번 task의 완료 조건은 다음과 같다.

- CartProvider가 초기화할 때 Cart API를 조회한다.
- Cart 추가, 수량 변경, 제거와 Undo가 API 성공 뒤 서버 응답으로 화면을 갱신한다.
- browser에는 Cart 항목 대신 익명 Cart session ID만 저장한다.
- API 오류가 발생해도 SQL, credential, URL과 stack trace를 사용자에게 표시하지 않는다.
- 기존 `GET /api/products`, Product detail, `/health`와 Cart API의 HTTP 계약을 유지한다.
- Web/API 전체 lint, typecheck, test, build와 실제 HTTP/browser 경로를 검증한다.

## Context

`tasks/013-cart-api.md`에서 NestJS와 PostgreSQL Cart API를 추가했다. API는
`X-Cart-Session-Id` header를 사용하고 Product ID와 양의 정수 수량만 저장한다. 현재 Web Cart는
`CartProvider` reducer와 `phytoworks-shop.cart.v1` localStorage payload를 사용한다.

인증과 Customer가 아직 없으므로 session ID는 ownership을 보장하지 않는 Demo 식별자다. 기존
localStorage Cart를 자동으로 API Cart에 합치면 이미 서버에 있는 수량과 중복될 수 있으므로,
이번 task에서는 자동 migration 또는 삭제를 하지 않는다. 기존 key는 읽지 않고 남겨 두며, 별도
정책을 결정한 뒤 migration task에서 처리한다.

## Current State

- 기준 branch는 `uiuuymin/cart-web-api-integration`이며 `main`의 `872a326 Cart API 작업 통합`에서 생성했다.
- `apps/web/components/cart/CartProvider.tsx`는 Cart API hydrate와 mutation 상태를 담당한다.
- `apps/web/components/cart/CartView.tsx`와 `CartLineItem.tsx`는 Cart context를 읽어 화면을 만든다.
- `apps/web/lib/product-api.ts`는 server-only Product API fetch를 제공한다.
- `apps/api`는 `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId`와
  `DELETE /api/cart/items/:productId`를 제공한다.
- Web에는 Cart API client helper와 same-origin proxy route handler가 추가되었다.

## Options Considered

### Browser에서 NestJS API를 직접 호출한다

- 장점: route handler 없이 구현이 짧다.
- 단점: API base URL을 client에 공개해야 하고 CORS, local/production origin과 credential 경계를
  함께 관리해야 한다.

### Next.js same-origin route handler를 proxy로 사용한다

- 장점: browser는 same-origin만 호출하고 `API_BASE_URL`은 Next.js server에만 남는다. CORS 설정을
  추가하지 않고 API 오류 응답도 한곳에서 안전하게 전달할 수 있다.
- 단점: Web route handler와 NestJS API 사이의 forwarding 코드가 추가된다.

**선택:** Next.js route handler proxy를 사용한다.

### Cart mutation을 optimistic하게 먼저 반영한다

- 장점: 화면 응답이 빠르게 보인다.
- 단점: API 실패 시 rollback, 동시 mutation과 서버 수량 정합성을 별도로 처리해야 한다.

### API 성공 뒤 응답으로 state를 교체한다

- 장점: PostgreSQL Cart를 source of truth로 유지하고 수량 merge 결과를 그대로 반영한다.
- 단점: network round trip 동안 pending 상태가 필요하다.

**선택:** API 성공 뒤 response를 reducer에 반영한다. pending 동안 Cart 조작을 비활성화한다.

## API and Session Boundary

Client는 same-origin 경로를 호출한다.

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`

Next.js route handler가 server-only `API_BASE_URL`로 NestJS에 전달하고, 모든 요청에
`X-Cart-Session-Id`를 넣는다. API 응답은 `items`와 `totalQuantity`만 사용하며 가격, 재고,
옵션별 추가 금액, Customer, Order와 Payment를 추가하지 않는다.

session ID는 `phytoworks-shop.cart-session.v1` key로 localStorage에 보관한다. localStorage를
사용할 수 없으면 현재 tab의 memory ID를 사용하지만 새로고침 후 같은 Cart를 복원할 수 없다는
상태를 표시한다. 이 ID는 인증 token이나 production ownership 증명이 아니다.

## State and Error Handling

- 초기 state는 `hasHydrated: false`이고 Cart API GET 성공 또는 실패 뒤 true가 된다.
- GET 실패 시 빈 화면과 안전한 `Cart API를 사용할 수 없습니다.` 상태를 표시한다. 현재 tab에서
  임의로 local Cart를 계속 authoritative하게 사용하지 않는다.
- mutation은 API 성공 뒤 `sync` reducer action으로 전체 items를 교체한다.
- 제거 성공 시 이전 항목을 memory에 보관해 Undo를 제공한다. Undo는 해당 수량으로 API POST를
  다시 호출한 뒤 성공할 때 복원한다.
- API 오류는 일반적인 사용자 메시지만 표시하고 response body의 내부 내용은 렌더링하지 않는다.
- API에 의해 이미 검증된 Product ID는 Web에서 Product 목록과 연결해 표시한다. 없는 Product는
  화면에서 제외하지만 server state를 Web이 임의로 삭제하지 않는다.

## Scope and Non-goals

### Scope

- Next.js Cart proxy route handlers와 client Cart API helper
- session ID storage helper
- CartProvider의 API hydrate와 mutation 연결
- Cart UI의 pending, API 오류와 기존 Undo 표시 갱신
- API/Web 문서와 task 기록

### Non-goals

- NestJS Cart API schema, migration, repository와 endpoint 변경
- 기존 localStorage Cart 자동 migration 또는 merge
- Customer 인증, secure cookie와 ownership 보장
- 가격, 재고, 품절, 옵션 선택 저장, Quote, Order, Payment와 Checkout
- API base URL을 public env로 노출하거나 CORS 설정 추가
- Vercel, Docker와 운영 credential

## Plan

1. Cart client contract, session helper와 same-origin proxy를 추가한다.
2. CartProvider에서 localStorage item persistence를 제거하고 API hydrate/mutation을 연결한다.
3. CartLineItem, AddToCartButton과 CartView의 async/pending/error 상태를 맞춘다.
4. API route handler와 client helper unit test를 추가하거나 기존 test 방식으로 검증한다.
5. root lint, typecheck, test, build와 실제 API/Web HTTP 검증을 수행한다.
6. API 오류, 새 session, 같은 Product merge와 browser 새로고침 동작을 확인한다.

## Changes

- `apps/web/lib/cart-session.ts`에 익명 Cart session ID 생성과 `phytoworks-shop.cart-session.v1` localStorage 저장을 추가했다. localStorage를 사용할 수 없는 경우 현재 tab의 memory ID를 사용한다.
- `apps/web/lib/cart-api.ts`에 Cart API 호출, 응답 envelope 검증과 안전한 `CartApiError`를 추가했다. item 수량과 총 수량은 안전한 양의 정수 또는 0인지 확인한다.
- `apps/web/lib/cart-api-proxy.ts`와 `apps/web/app/api/cart/**` route handler에 same-origin proxy를 추가했다. NestJS 주소는 서버 전용 `API_BASE_URL`을 사용하고, 연결 실패는 안전한 503 응답으로 변환한다.
- `CartProvider`, `CartView`, `CartLineItem`, `AddToCartButton`을 API 기반 hydrate와 비동기 mutation에 맞게 변경했다. 요청 중 중복 조작을 막고 API 성공 응답으로 전체 Cart state를 교체한다.
- 기존 `apps/web/components/cart/cart-storage.ts`와 Cart item localStorage read/write를 제거했다. 기존 `phytoworks-shop.cart.v1` 값은 자동 migration하거나 삭제하지 않는다.
- `apps/web/README.md`, `docs/context/architecture-overview.md`, `docs/domain/cart.md`에 Web Cart의 source of truth, proxy 경계와 session 제한을 반영했다.

## Problems Encountered

- 초기 Web lint에서 새 파일의 line ending과 Biome format 차이가 발견되었다.
- API 중단 시 client가 upstream response body를 그대로 노출하지 않도록 proxy와 client에서 안전한 오류 경계를 별도로 유지해야 했다.
- TypeScript 7 환경에서 `unknown` 값에 대한 수량 검증은 `typeof` 확인을 포함해야 typecheck를 통과할 수 있었다.
- 개발 shell에서 매 명령마다 `SSL_CERT_FILE`이 없는 Conda cleanup warning이 출력되었다. 프로젝트 코드나 dependency와 관계없는 환경 warning으로 기록하며 이번 task에서 shell profile은 변경하지 않았다.

## Resolution

- Biome으로 Web 파일을 포맷하고 수량 응답 검증을 안전한 정수 범위로 제한했다.
- proxy 연결 실패는 `Cart API unavailable` 503으로 변환하며 SQL, credential, URL과 stack trace를 응답에 포함하지 않는다.
- 기존 localStorage Cart의 자동 migration과 session ownership은 중복과 소유권을 안전하게 판단할 근거가 없으므로 구현하지 않았다. 이 제한은 Follow-up으로 남긴다.

## Verification

다음 항목을 검증한다.

- 새 session에서 Cart API hydrate
- Product Detail의 direct purchase 추가
- 같은 Product의 수량 merge
- PATCH 수량 변경
- DELETE와 API 기반 Undo
- 새로고침 뒤 session 기반 Cart 복원
- `QUOTE_REQUIRED` Product가 추가되지 않음
- API 중단 시 안전한 Web 오류 상태
- Product API, Cart API와 Health API 회귀
- root lint, typecheck, test, build

실행 결과:

- Web lint, typecheck와 production build 통과
- root lint와 typecheck 통과
- API test 8 files, 26 tests 통과
- root build 통과
- PostgreSQL 연결 상태에서 Web proxy HTTP 검증 통과: Cart GET 200, item POST 201, merge 결과 수량 3, PATCH 200, DELETE 200
- `QUOTE_REQUIRED` 추가 422, 없는 Product 추가 404, `/health` 200과 `{ "status": "ok" }` 확인
- NestJS API 중단 뒤 Web Cart proxy 503과 안전한 JSON 응답 확인
- `/products`와 `/products/thermal-imaging` 200 확인
- 별도 session으로 Cart를 조회하여 session별 저장 경계를 확인

## Diff Review

Web proxy, Cart client, provider/component, task와 필요한 문서만 변경되었는지 확인한다.
NestJS schema/migration, 가격, 재고, Customer, Order, Payment, credential이 범위 밖 변경으로
들어오지 않았는지 확인한다.

검토 결과: `apps/api`와 Prisma schema/migration은 변경하지 않았으며, 가격·재고·주문·결제·credential 변경도 없다.

## Follow-up

- 기존 localStorage Cart의 API migration과 duplicate merge 정책을 결정한다.
- Customer 또는 secure cookie 기반 session ownership을 도입한다.
- API/Web shared contract 필요성을 검토한다.
- browser mutation의 retry, offline queue와 multi-tab 동기화를 검토한다.

## Lessons Learned

Cart item을 browser에 저장하지 않고 API 응답 전체로 교체하면 PostgreSQL Cart를 source of truth로 유지할 수 있다. 다만 익명 session ID는 인증이나 소유권 증명이 아니므로 production Cart로 확장하기 전에 Customer 또는 secure cookie 기반 ownership 모델을 결정해야 한다.
