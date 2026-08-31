# Task 015: Order 생성·조회 API

**Status:** 구현 완료

## Goal

현재 서버 Cart를 바탕으로 결제 전에 사용할 `PENDING` Order를 생성하고 조회하는 최소
백엔드 vertical slice를 구현한다. 브라우저가 보낸 가격을 신뢰하지 않고 NestJS가 Cart와
Product를 다시 확인한 뒤 상품명, 단가, 수량과 주문 금액을 계산한다.

완료 조건은 다음과 같다.

- `POST /api/orders`가 session Cart에서 `PENDING` Order를 생성한다.
- `DIRECT_PURCHASE` Product만 주문에 포함한다.
- OrderItem이 주문 시점의 상품명과 단가를 snapshot으로 보존한다.
- Order 총액은 서버가 계산하며 요청 body에 가격을 받지 않는다.
- 주문 생성과 Cart 항목 삭제가 하나의 PostgreSQL transaction으로 처리된다.
- `GET /api/orders/:orderId`가 생성한 session에서만 주문을 반환한다.
- 빈 Cart, 견적 상품, 없는 상품과 없는 주문이 안전한 HTTP 오류로 반환된다.
- API unit, HTTP, PostgreSQL integration test와 기존 API 회귀 검증이 통과한다.

## Context

현재 Cart API는 PostgreSQL에 Product ID와 수량만 저장한다. Cart는 주문이 아니므로 가격이나
재고를 보장하지 않으며, 주문 생성 시 서버가 Product 규칙을 다시 확인해야 한다. Order domain은
결제창 전에 `PENDING` Order를 준비하고 승인 성공 뒤 `PAID`로 변경하는 흐름을 제안하지만,
이번 task에서는 결제 승인과 상태 변경을 구현하지 않는다.

현재 Product의 직접 구매 가격은 공식 판매 가격이 아니라 학습용 Demo reference다. 따라서 이번
주문은 `pricingSource: "DEMO"`를 응답에 포함하며, Toss Payments 승인에 사용할 운영 가격으로
표현하지 않는다. authoritative price, 재고와 할인·세금·배송비 정책은 별도 결정이 필요하다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/architecture-overview.md`
- `docs/domain/product.md`
- `docs/domain/cart.md`
- `docs/domain/order.md`
- `docs/domain/payment.md`
- `docs/adr/003-prisma-postgresql-access.md`
- `docs/development/testing-strategy.md`
- `tasks/013-cart-api.md`
- `apps/api/src/cart/`
- `apps/api/src/product/`

## Current State

- `apps/api`는 NestJS 12 ESM application이며 Health, Product, Cart module을 제공한다.
- Cart는 `X-Cart-Session-Id`로 익명 session을 식별하고, Product ID와 수량만 저장한다.
- Product 직접 구매 항목의 가격은 API catalog metadata에 있는 Demo reference다.
- `Order`, `OrderItem`, 주문 module과 주문 endpoint는 아직 없다.
- `backend-develop`는 로컬 `main`의 최신 통합 커밋까지 fast-forward 되었으며, 구현 전 worktree는 깨끗했다.

## Options Considered

### Controller에서 Cart와 Product를 읽어 OrderRepository에 전달한다

- 장점: 기존 `CartService`와 `ProductService`를 재사용하고 API 입력 경계를 단순하게 유지한다.
- 단점: Cart 확인과 Order 저장 사이에 동시 변경이 발생할 수 있다.

### OrderRepository가 Cart, Product와 가격 정책을 모두 직접 읽는다

- 장점: DB transaction 안에서 모든 조회와 저장을 결합하기 쉽다.
- 단점: Order module이 Product catalog 정책과 Prisma 세부 구현에 강하게 결합된다.

**선택:** 첫 번째 방법을 선택한다. Service가 domain 검증과 금액 계산을 담당하고, repository는
검증된 snapshot을 transaction 안에 저장한다. Repository는 transaction 직전에 Cart의 현재
항목을 다시 비교하여 service가 읽은 Cart와 달라졌으면 저장하지 않는다.

### 주문 생성 뒤 Cart를 별도 요청으로 비운다

- 장점: 구현이 단순하다.
- 단점: Order만 생성되고 Cart가 남거나, Cart만 비워지는 부분 실패가 발생할 수 있다.

### Order 생성과 Cart 삭제를 같은 transaction으로 처리한다

- 장점: PostgreSQL 기준으로 주문 생성과 Cart 정리의 원자성을 확보한다.
- 단점: transaction 경계와 동시 요청 충돌을 별도로 다뤄야 한다.

**선택:** 두 번째 방법을 선택한다. 중복 주문 요청에 대한 idempotency key와 재시도 정책은
결제·checkout task에서 별도로 확정한다.

## Plan

1. Order status, pricing source, Order와 OrderItem snapshot schema를 추가한다.
2. Prisma migration과 generated client를 갱신한다.
3. Order repository port, Prisma adapter와 in-memory test double을 구현한다.
4. Cart·Product service를 재사용하는 OrderService와 controller/module을 구현한다.
5. Order service, HTTP endpoint와 PostgreSQL integration test를 추가한다.
6. API README, architecture와 Order domain의 Current Demo 범위를 갱신한다.
7. lint, typecheck, test, build, migration과 실제 HTTP를 검증한다.

## Changes

- `apps/api/prisma/schema.prisma`에 `OrderStatus`, `OrderPricingSource`, `Order`와 `OrderItem`을 추가했다.
- OrderItem에 Product relation과 상품명, 단가, 수량 snapshot을 저장하도록 했다.
- `20260831171322_order_init` migration을 생성하고 개발 PostgreSQL에 적용했다.
- `apps/api/src/order/`에 Order controller, service, repository port, Prisma adapter, in-memory test double과 read model을 추가했다.
- `POST /api/orders`는 session Cart를 읽고 `DIRECT_PURCHASE` Product의 Demo 단가로 서버에서 총액을 계산한다.
- `GET /api/orders/:orderId`는 `X-Cart-Session-Id`가 주문 생성 session과 일치할 때만 주문을 반환한다.
- Prisma repository는 Cart 항목을 다시 비교한 뒤 Order snapshot 생성과 Cart 항목 삭제를 하나의 transaction으로 처리한다.
- API README, Order domain과 architecture context를 현재 Demo 주문 경계에 맞게 갱신했다.

## Problems Encountered

- Prisma schema 변경 뒤 generated client가 갱신되어 기존 Product와 Cart generated 파일도 함께 변경되었다.
- Biome이 새 파일의 줄바꿈과 import 순서를 오류로 보고했다.
- `git diff --check`에서 Prisma generated client의 주석에 trailing whitespace가 보고되었다.
- 개발 셸은 모든 명령에서 존재하지 않는 `SSL_CERT_FILE`을 정리하려는 환경 경고를 출력했다.

## Resolution

- `prisma generate`로 Prisma 7.10.0 generated client를 갱신하고 migration을 적용했다.
- Biome 자동 포맷을 적용한 뒤 API lint를 다시 실행해 통과를 확인했다.
- generated client의 trailing whitespace는 생성기 산출물이며 수동으로 수정하지 않았다. 기존 Cart task에도 기록된 known artifact로 남겼다.
- `SSL_CERT_FILE` 경고는 저장소 코드와 무관하므로 shell profile은 변경하지 않았다.

## Verification

- `pnpm --filter @phytoworks/api prisma:generate` → 성공
- `pnpm --filter @phytoworks/api prisma:migrate:order` → 성공, `20260831171322_order_init` 적용
- `pnpm --filter @phytoworks/api lint` → 성공, 51 files
- `pnpm --filter @phytoworks/api typecheck` → 성공
- `pnpm --filter @phytoworks/api test` → 성공, 10 files, 32 tests
- `pnpm --filter @phytoworks/api test:integration` → 성공, 3 files, 6 tests
- `pnpm --filter @phytoworks/api build` → 성공
- `pnpm lint` → 성공, Web·API lint
- `pnpm typecheck` → 성공, Web·API typecheck
- `pnpm test` → 성공, API 10 files, 32 tests
- `pnpm build` → 성공, Web·API production build
- 실제 HTTP → Cart 추가 2개, Order 생성 `PENDING`·총액 10,000,000 KRW, Order 조회, Cart 비움, 빈 Cart 400을 확인

실제 검증은 저장소에 credential을 기록하지 않고 현재 PowerShell process에만 개발 PostgreSQL
연결 문자열을 주입해 수행했다.

## Diff Review

Order schema, migration, generated Prisma client, API module/source/test, API README, Order domain,
architecture context와 이 task만 변경되었는지 확인했다. Toss Payments, Customer 인증, Web
checkout, 운영 가격과 실제 secret key는 변경하지 않았다.

`git diff --check`는 수동 작성 파일에는 문제가 없었고 Prisma generated client의 trailing
whitespace만 남겼다. 이는 Prisma 7 generated output의 known artifact다.

## Scope and Non-goals

### Scope

- Order와 OrderItem PostgreSQL schema 및 migration
- Cart 기반 `POST /api/orders`
- session 제한이 있는 `GET /api/orders/:orderId`
- 서버 가격 계산과 상품명·단가 snapshot
- Order module, repository, service, controller와 test double
- 기존 Cart 삭제 transaction

### Non-goals

- Toss Payments 인증·승인·취소·환불
- `PAID` 또는 `CANCELLED` 상태를 변경하는 API
- authoritative price, 재고 예약, 할인, 세금과 배송비
- Customer 인증, secure cookie와 운영 수준 session ownership
- checkout 화면, 주문 목록과 배포 설정
- idempotency key와 중복 주문 재시도 정책

## Verification

구현 후 API unit·HTTP test, PostgreSQL integration test, lint, typecheck, build와 실제 HTTP
요청을 실행하고 결과를 이 문서에 기록한다.

## Follow-up

- Demo 가격을 authoritative checkout price로 대체할 source-of-truth를 결정한다.
- 주문 생성 중복 방지를 위한 idempotency key를 설계한다.
- Toss Payment와 Order 상태 전이, 승인 금액 검증과 실패 복구를 구현한다.
- 인증 또는 secure cookie로 익명 session ownership을 production 수준으로 보강한다.

## Lessons Learned

Cart와 Order를 같은 PostgreSQL transaction으로 처리하면 주문 생성 성공과 Cart 정리를 함께
확정할 수 있다. 다만 service가 읽은 Cart와 transaction 직전 Cart가 달라지는 경우를 비교해
저장을 중단할 뿐, 중복 주문 요청을 식별하는 idempotency key까지 제공하지는 않는다. 현재 Demo
가격은 상품명·단가 snapshot과 함께 보존되지만 authoritative checkout 가격이 아니므로 Toss
Payments 연동 전에 가격 source-of-truth를 확정해야 한다.
