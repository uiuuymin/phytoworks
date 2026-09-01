# PhytoWorks API

`apps/api`는 PhytoWorks Shop의 NestJS API 애플리케이션입니다.

## 로컬 실행

저장소 루트에서 다음 명령을 실행합니다.

```bash
pnpm --filter @phytoworks/api dev
```

기본 주소는 `http://localhost:3001`입니다. Product API를 호출하려면 PostgreSQL 연결을 위해 `DATABASE_URL` 환경변수가 필요합니다. 실제 credential은 저장소에 기록하지 않습니다.

```text
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

## HTTP API

Health endpoint는 데이터베이스 조회 없이 동작합니다.

```http
GET /health
```

```json
{
  "status": "ok"
}
```

Product Read API는 다음 경로를 제공합니다.

```http
GET /api/products
GET /api/products/:productId
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:productId
DELETE /api/cart/items/:productId
POST /api/orders
GET /api/orders/:orderId
POST /api/payments/confirm
```

두 응답은 기존 Product 필드를 유지하면서 `pricing`과 `optionGroups`를 추가로 반환합니다. 현재 가격은 NITRO의 brochure reference와 두 모듈의 demo reference이며, 모두 checkout을 확정하는 값이 아닙니다. Product API는 재고와 옵션별 추가 금액을 확정하지 않으며, 주문 금액은 Order API가 별도 규칙으로 계산합니다.

Cart API는 Customer 인증 도입 전의 익명 session입니다. Web proxy가 발급한 서명 token을
`X-Cart-Session-Token` header로 받아 검증하며, 평문 session ID는 받지 않습니다. Cart에는
Product ID와 수량만 저장하고, 같은 Product를 다시 추가하면 수량을 합칩니다.

```http
X-Cart-Session-Token: <signed-cart-session-token>
```

```json
{
  "items": [{ "productId": "thermal-imaging", "quantity": 2 }],
  "totalQuantity": 2
}
```

Cart API는 가격, 재고, 옵션별 추가 금액, Customer, 주문과 결제를 확정하지 않습니다. session
ownership, secure cookie 또는 Customer 인증은 별도 작업에서 결정합니다.

Order API는 현재 Cart에서 `PENDING` Order를 준비하는 학습용 Demo 경계입니다. 주문 생성 시
서버가 `DIRECT_PURCHASE` Product와 Cart를 다시 확인하고 Product의 Demo 가격으로 총액을
계산합니다. 이 가격은 실제 운영 결제 금액이 아니며 응답의 `pricingSource`는 `DEMO`입니다.
OrderItem에는 주문 시점의 상품명, 단가와 수량을 snapshot으로 저장하고, 생성과 Cart 비우기는
하나의 PostgreSQL transaction으로 처리합니다.

```json
{
  "id": "cm-order-id",
  "status": "PENDING",
  "currency": "KRW",
  "pricingSource": "DEMO",
  "totalAmount": 5000000,
  "items": [{
    "productId": "thermal-imaging",
    "productName": "Thermal Imaging Module",
    "unitAmount": 5000000,
    "quantity": 1,
    "lineAmount": 5000000
  }]
}
```

주문 조회에도 같은 `X-Cart-Session-Token` header가 필요합니다. Web은 token을 HttpOnly
cookie에 저장하고 API와 `CART_SESSION_SECRET`을 공유합니다. 이 방식은 익명 token 위조를
막지만 Customer 계정 기반 ownership은 제공하지 않습니다.

Payment confirm API는 Web 결제창에서 받은 `paymentKey`, `orderId`, `amount`를 전달받습니다.
서버는 저장된 Order 금액을 다시 확인한 뒤 `TOSS_SECRET_KEY`로 Toss Payments confirm API를
호출합니다. 성공하면 Payment는 `DONE`, Order는 `PAID`가 됩니다. 실패하면 Payment에 `FAILED`를
기록하고 Order는 `PENDING`으로 유지합니다. 같은 성공 요청은 외부 API를 다시 호출하지 않습니다.

```http
POST /api/payments/confirm
X-Cart-Session-Token: <signed-cart-session-token>
Content-Type: application/json
```

```json
{
  "paymentKey": "test_payment_key",
  "orderId": "cm-order-id",
  "amount": 5000000
}
```

Web checkout은 same-origin proxy를 통해 이 confirm endpoint를 호출합니다. Web의 결제창에는
`NEXT_PUBLIC_TOSS_CLIENT_KEY`, API에는 `TOSS_SECRET_KEY`가 필요합니다.

## Prisma와 데이터베이스

현재 PostgreSQL 접근 계층은 Prisma 7 stable baseline입니다. Prisma schema와 migration은 `prisma/`에 있으며, Product repository는 `src/product/`에서 Prisma 결과를 API와 분리합니다.

```bash
pnpm --filter @phytoworks/api prisma:generate
pnpm --filter @phytoworks/api prisma:migrate:deploy
pnpm --filter @phytoworks/api prisma:seed
```

Cart schema 변경을 개발 데이터베이스에 적용할 때는 다음 명령을 사용합니다.

```bash
pnpm --filter @phytoworks/api prisma:migrate:cart
```

Order schema 변경을 개발 데이터베이스에 적용할 때는 다음 명령을 사용합니다.

```bash
pnpm --filter @phytoworks/api prisma:migrate:order
```

Payment schema 변경을 개발 데이터베이스에 적용할 때는 다음 명령을 사용합니다.

```bash
pnpm --filter @phytoworks/api prisma:migrate:payment
```

개발 데이터베이스의 생성과 실행 방법, Docker와 배포 환경 설정은 별도 작업 범위입니다.

## 배포 환경변수

Web과 API는 다음 값을 플랫폼의 secret/environment variable 설정에 등록해야 합니다.

- Web: `API_BASE_URL`, `CART_SESSION_SECRET`, `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- API: `DATABASE_URL`, `CART_SESSION_SECRET`, `TOSS_SECRET_KEY`

`CART_SESSION_SECRET`은 Web과 API에 같은 값으로 등록하고, 최소 32자 이상의 무작위 값으로
생성합니다. 실제 값은 `.env.example`, 저장소와 로그에 기록하지 않습니다. 배포 순서는 API에
Prisma migration을 적용하고 API를 기동한 뒤, Web의 `API_BASE_URL`을 API의 HTTPS 주소로
설정하는 순서로 진행합니다.

## 검증

```bash
pnpm --filter @phytoworks/api lint
pnpm --filter @phytoworks/api typecheck
pnpm --filter @phytoworks/api test
pnpm --filter @phytoworks/api build
```

PostgreSQL 통합 테스트는 `DATABASE_URL`이 설정된 테스트 데이터베이스에서 별도로 실행합니다.

```bash
pnpm --filter @phytoworks/api test:integration
```

## Module 경계

- `HealthModule`은 `/health` 계약만 소유합니다.
- `ProductModule`은 Product controller, service, repository port와 Prisma adapter를 소유합니다.
- `ProductService`는 Prisma를 직접 참조하지 않으며, repository 결과를 API read model로 보강합니다.
- `CartModule`은 `CartController`, `CartService`, `CartRepository` port와 Prisma adapter를 소유합니다.
- `CartService`는 ProductService로 `DIRECT_PURCHASE`를 확인한 뒤 CartRepository에 변경을 요청합니다.
- `OrderModule`은 `OrderController`, `OrderService`, `OrderRepository` port와 Prisma adapter를 소유합니다.
- `OrderService`는 Cart와 Product를 다시 확인하고 서버에서 Demo 주문 금액을 계산합니다.
- `PrismaOrderRepository`는 Order snapshot 저장과 Cart 항목 삭제를 하나의 transaction으로 처리합니다.
- `PaymentModule`은 Payment controller, service, gateway, repository port와 Prisma adapter를 소유합니다.
- `PaymentService`는 저장된 Order 금액과 session을 검증한 뒤 Toss 승인 결과를 Payment와 Order에 반영합니다.
- Web 애플리케이션은 Product와 Cart API를 연동했지만, Toss 결제창과 confirm API를 호출하는 checkout 흐름은 별도 작업입니다.
