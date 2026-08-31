# Architecture Overview

## 문서 상태

- **Current:** pnpm workspace에 `apps/web` Next.js 애플리케이션과 `apps/api` NestJS 애플리케이션이 있다. web에서는 Home, Product Catalog, Product Detail과 browser Cart가 실행되며 API에서는 Health, Product read, 익명 session Cart, Cart 기반 Demo Order API와 Toss confirm 기반 Payment API가 실행된다.
- **Proposed:** 결제창, redirect와 운영 수준의 외부 서비스 연동은 아직 별도 task에서 확정한다.
- **TBD:** 구체적인 도구나 책임 경계를 추가 조사해야 한다.

## 논리 구조

```text
Browser
   ↓
Next.js 16
   ↓
NestJS
   ↓
PostgreSQL

NestJS
   ↕
Toss Payments
```

### Browser

사용자가 상품을 보고 장바구니와 결제를 조작하는 곳이다. 화면 입력은 신뢰할 수 없는 외부 입력으로 취급해야 하며, 가격과 결제 성공 여부 같은 중요한 판단을 브라우저 값만으로 확정하지 않는다.

### Next.js 16

**Current:** `apps/web`에 Next.js 16.3.3 App Router가 생성되었고 `/`, `/products`, Product Detail 세 건과 `/cart`를 렌더링한다. Home, Product 목록, card, detail과 Cart page shell은 Server Component이며 Product data는 API를 사용한다. Root CartProvider, SiteHeader, AddToCartButton, CartView와 CartLineItem은 browser state, event와 Cart API 호출이 필요하므로 Client Component다. Cart 항목은 API와 PostgreSQL에 저장하고 browser에는 익명 Cart session ID만 저장한다.

**Proposed:** 이후 상품·장바구니·주문·결제 결과 화면을 제공하고 NestJS API와 통신한다. 어떤 기능을 Server Component, Server Action 또는 브라우저 코드에서 처리할지는 기능별 task에서 결정한다.

### Web route와 component 경계

**Current:** 직접 작성된 route는 `/`, `/products`, `/products/[productId]`와 `/cart`다. Root layout의 CartProvider는 SiteHeader와 route content를 감싸며 Product Detail, SiteHeader와 Cart가 같은 browser state를 사용하게 한다. Server Component `children`은 CartProvider 안에서도 server rendering 경계를 유지한다. SiteHeader는 Home·Products·Cart link, `Shop Demo` label, Cart 총 수량, 현재 route와 mobile disclosure state를 소유한다. Home은 Shop 소개와 Catalog 진입을, `/products`는 정적 Product 탐색을, Product Detail은 정적 data 조회, 설명, placeholder와 판매 방식 표현을 담당한다. `/cart` page는 metadata와 page shell을, CartView와 CartLineItem은 hydration, empty state, 수량 변경, 제거와 Undo를 담당한다. 세 Product ID는 `generateStaticParams`로 정적 생성하며 알려지지 않은 ID는 page의 `notFound()`와 Product 전용 not-found 화면으로 처리한다. 각 route에는 Demo 경계를 반복해서 설명하는 notice가 없다. `components/layout`, `components/ui`, `components/commerce`, `components/cart`에 역할별 component가 있고 각 component와 route는 CSS Module을 사용한다. Native CSS foundation은 계속 semantic token, global typography, responsive container, focus와 reduced motion만 제공한다. Next.js가 생성한 `/_global-error`와 전체 application의 `/_not-found`는 framework fallback이다.

**Proposed:** 최소 Shop route는 다음과 같다.

```text
/
├─ products
│  └─ [productId]
├─ cart
├─ checkout
├─ payment
│  ├─ success
│  └─ fail
└─ orders
   └─ [orderId]
```

정적 layout, Product 목록과 설명은 Server Component를 우선한다. Cart Context는 Client Component에서만 읽으며 browser state와 event가 필요한 작은 leaf만 client bundle에 포함한다. 실제 data fetching, cache와 mutation 경계는 API 구현 task에서 확정한다.

IA, responsive와 공통 component 방향은 [`../design/shop-ux-strategy.md`](../design/shop-ux-strategy.md)를 기준으로 한다. 위 구조에서 `/`, `/products`, `/products/[productId]`와 `/cart`는 Current이며 나머지 route는 아직 Proposed다.

### NestJS

**Current:** `apps/api`에 NestJS 12.0.1과 ESM 기반 application 경계가 있다. `AppModule`은 `HealthModule`, `ProductModule`, `CartModule`, `OrderModule`과 `PaymentModule`을 조합한다. `HealthModule`과 `HealthController`는 `GET /health`만 담당하며, 이 endpoint는 application이 기동하고 HTTP 요청에 응답할 수 있다는 사실만 나타낸다. `ProductModule`과 `ProductController`는 Prisma 7 PostgreSQL repository를 통해 `GET /api/products`와 `GET /api/products/:productId`를 제공한다. `CartModule`과 `CartController`는 `X-Cart-Session-Id`로 식별한 익명 Cart의 `GET /api/cart`, item POST, PATCH와 DELETE를 제공한다. `OrderModule`과 `OrderController`는 같은 session Cart에서 `POST /api/orders`로 `PENDING` Demo Order를 생성하고 `GET /api/orders/:orderId`로 같은 session의 주문을 조회한다. `PaymentModule`과 `PaymentController`는 `POST /api/payments/confirm`으로 Toss 승인과 Payment·Order 상태 변경을 처리한다. OrderItem은 상품명과 Demo 단가를 snapshot으로 보존하며, Order 생성과 Cart 삭제는 PostgreSQL transaction으로 처리한다. Payment 승인 성공 시 Payment `DONE`과 Order `PAID` 변경을 PostgreSQL transaction으로 처리한다. Product 상세 조회에서 없는 ID는 404로 응답하며 Cart와 Order에는 `DIRECT_PURCHASE` Product만 허용한다. API는 기본 port 3001을 사용하고 유효한 `PORT` 환경변수로 변경할 수 있다. Web Cart는 same-origin Next.js route handler를 통해 Cart API mutation과 hydrate를 호출한다.

**Proposed:** 이후 서비스 규칙과 신뢰 경계를 담당하는 feature module을 추가로 확장한다. 입력 검증, 상품·주문·결제 규칙 적용, PostgreSQL 접근과 Toss Payments 서버 승인 요청은 각 기능의 경계 안에서 유지한다. 브라우저가 보낸 금액이나 결제 결과를 그대로 신뢰하지 않는다.

### PostgreSQL

**Current:** Product, Cart, CartItem, Order, OrderItem과 Payment가 `apps/api/prisma` schema와 migration으로 저장된다. CartItem은 Cart와 Product에 연결되고 Cart별 Product 중복은 unique constraint로 막는다. OrderItem은 Product relation과 함께 상품명·단가·수량 snapshot을 저장하며 Order 생성과 Cart 삭제는 transaction으로 묶는다. Payment 승인 성공 시 Payment `DONE`과 Order `PAID` 변경을 transaction으로 묶는다. 익명 session ownership, authoritative price와 재고는 `TBD`다.
**Proposed:** production ownership, 최종 relation, transaction, idempotency와 migration 운영 방식은 `TBD`다.

### Toss Payments

**Current:** 테스트 환경의 서버 승인 단계는 `TossPaymentsGateway`가 담당하며 secret key를 사용하는 통신은 NestJS의 서버 경계 안에서만 수행한다. 결제창과 성공·실패 redirect를 포함한 Web 흐름은 아직 구현하지 않았다. 실제 연동 시 공식 문서를 다시 확인한다.

### Docker와 Vercel

- **Docker — Proposed:** 로컬 PostgreSQL 등 재현 가능한 개발 의존성을 실행하는 용도로 검토한다. Docker Compose와 서비스 범위는 아직 만들지 않았다.
- **Vercel — Proposed:** 우선 Next.js 배포 대상으로 고려한다. NestJS API와 PostgreSQL을 어디에 배포할지는 `TBD`이며 별도 ADR이 필요할 수 있다.

## 요청이 통과하는 경로

현재 Product 탐색 요청은 `Browser → Next.js SiteHeader·page Server Component → Product Read API → Browser` 경로를 사용한다. `/` 요청은 Home에, `/products` 요청은 ProductGrid와 ProductCard에, `/products/[productId]` 요청은 Product 상세 page와 전용 commerce component에 연결된다. Product Detail의 `DIRECT_PURCHASE` 분기에는 Client leaf인 AddToCartButton만 추가된다.

현재 browser Cart 조작과 복원 경로는 `Browser event → CartProvider → same-origin Next.js route handler → CartController → CartService → ProductService·CartRepository → Prisma7Service → PostgreSQL`이다. browser에는 `phytoworks-shop.cart-session.v1` session ID만 저장하며 Cart item과 수량은 API 응답으로 hydrate한다. API 성공 뒤 CartProvider는 서버 응답으로 전체 item state를 교체하고, 요청 중에는 중복 조작을 막는다. 기존 `phytoworks-shop.cart.v1` localStorage Cart는 자동 병합하지 않는다. 존재하지 않거나 `DIRECT_PURCHASE`가 아닌 Product와 잘못된 수량은 API에서 거부한다. 어느 저장소도 주문 금액, 재고와 판매 가능 여부의 신뢰 가능한 기준이 아니다.

현재 API health 요청은 `HTTP client → NestJS HTTP adapter → HealthController → JSON response` 경로를 사용한다. `GET /health`는 HTTP 200과 `{ "status": "ok" }`를 반환한다. Product read 요청은 `HTTP client → NestJS HTTP adapter → ProductController → ProductService → PrismaProductRepository → PostgreSQL → JSON response` 경로를 사용한다. Cart 요청은 Web에서는 same-origin proxy를 거쳐 위의 Cart module 경로를 사용한다. Order 생성 요청은 `HTTP client → OrderController → OrderService → CartService·ProductService → PrismaOrderRepository → PostgreSQL transaction → JSON response` 경로를 사용한다. Payment 승인 요청은 `HTTP client → PaymentController → PaymentService → PaymentRepository → PostgreSQL(PENDING) → PaymentGateway → Toss Payments → PaymentRepository → PostgreSQL transaction(DONE·PAID) → JSON response` 경로를 사용한다. OrderItem snapshot과 총액은 서버가 만들며 브라우저 금액을 받지 않는다. Product와 Cart·Order·Payment controller의 `api/*` route prefix는 전역 prefix 설정이 아니며, API versioning과 Web/API shared contract 방식은 아직 확정하지 않았다.

현재 Product, Cart, Order와 Payment API는 Prisma 7을 통해 PostgreSQL을 읽고 쓴다. Web Cart의 현재 흐름은 `Browser → Next.js route handler → NestJS → PostgreSQL → NestJS → Next.js → Browser`이며, Order와 Payment API는 아직 Web checkout에서 호출하지 않는다. browser Cart와 API Cart의 자동 병합과 인증 ownership은 아직 확정하지 않았다. Payment confirm API에는 Toss Payments 서버 승인 요청이 구현되어 있지만, 결제창과 redirect를 포함한 Web 흐름은 별도 작업이다. web 캐싱, 직접 서버 렌더링 데이터 접근 또는 API contract 공유 방식은 아직 확정하지 않았다.

## Monorepo 구조

```text
apps/
├─ web/
└─ api/

packages/
├─ contracts/
├─ database/
└─ config/
```

- `apps/web/` — **Current:** Next.js 사용자 애플리케이션
- `apps/api/` — **Current:** NestJS API application과 독립적인 build·test 경계
- `packages/contracts/` — **Proposed:** web과 API가 합의해야 하는 타입 또는 schema의 공유 위치. 무엇을 공유할지는 `TBD`다.
- `packages/database/` — **Proposed:** schema, migration 또는 DB 접근 코드의 후보 위치. ORM을 선택하기 전에는 생성하지 않는다.
- `packages/config/` — **Proposed:** TypeScript, lint 등 반복 설정의 공유 후보 위치. 모든 설정을 무조건 공통화하지 않는다.

`apps/*`와 `packages/*`를 pnpm workspace 범위로 사용하기로 ADR-001에서 결정했다. 현재는 `apps/web`과 `apps/api`를 생성했으며 `packages/*` 후보는 실제 공유 책임이 생기는 구현 task에서 확정한 뒤 만든다. Biome 설정은 사용처가 두 애플리케이션으로 늘어나서 root `biome.json`에서 공유하지만, web과 API의 TypeScript 설정은 runtime과 compiler 책임이 달라 각각 유지한다.

## 주요 TBD

- Next.js와 NestJS가 사용할 API 형식과 계약 생성 방식
- ORM 또는 SQL 접근 방식
- 서버 Cart 저장 위치, Customer 식별 방식과 현재 localStorage Cart의 병합·이관 방식
- 주문·결제 transaction 및 idempotency 경계
- 로컬 Docker 구성과 개발용 seed 전략
- web, API와 PostgreSQL의 배포 topology
- logging, monitoring, error response와 보안 정책
