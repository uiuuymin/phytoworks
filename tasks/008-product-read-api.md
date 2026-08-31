# Task: Product read API 설계

**Status:** Implemented, static API 완료. PostgreSQL·ORM은 별도 task로 남아 있다.

## Goal

현재 `apps/web/data/products.ts`에 존재하는 Product 정보를 NestJS API의 read model과 GET endpoint로 제공한다. 이 task는 승인된 static API 구현과 그 설계·검증 기록을 함께 보존한다. PostgreSQL, ORM과 migration은 별도 database task로 분리한다.

승인된 구현은 다음과 같다.

- Product API의 첫 구현은 API 내부의 임시 정적 read data를 사용한다.
- PostgreSQL과 ORM은 이번 구현에서 도입하지 않고 별도 database task로 분리한다.
- API의 business endpoint는 `/api/products` namespace를 사용한다.
- 기존 `GET /health`와 `HealthModule`은 유지하며 Product 기능의 sibling module을 추가한다.
- 현재 web은 API를 호출하지 않는다. web의 fetch 전환은 별도 task로 남긴다.

이 선택은 최종 database source of truth를 부정하는 것이 아니다. Product의 장기 source of truth는 PostgreSQL 후보로 남기되, schema·migration·ORM을 결정하고 실제 DB를 검증하는 일은 별도 승인과 ADR이 필요한 범위로 분리한다.

## Context

### 현재 상태

현재 Product는 `apps/web/data/products.ts`의 정적 `products` 배열이다. 배열에는 다음 세 상품이 있다.

- `nitro`: `NITRO Plant Growth System`, `QUOTE_REQUIRED`
- `thermal-imaging`: `Thermal Imaging Module`, `DIRECT_PURCHASE`
- `chlorophyll-fluorescence`: `Chlorophyll Fluorescence Module`, `DIRECT_PURCHASE`

현재 web의 Product 목록 요청은 다음 경로를 사용한다.

```text
Browser → Next.js Server Component → apps/web/data/products.ts → Browser
```

`/products`는 `ProductGrid`와 `ProductCard`로 목록을 렌더링하고, `/products/[productId]`는 `getProductById`로 상세 Product를 조회한다. Product Detail은 `details.summary`, `details.features`, `details.mediaLabel`과 `purchaseMode`를 사용한다. `DIRECT_PURCHASE`만 `AddToCartButton`을 제공하고 `QUOTE_REQUIRED`는 공식 문의 link를 제공한다.

구현 전 `apps/api`에는 `HealthModule`과 `HealthController`만 있었다. `AppModule`은 `HealthModule`을 import하고, `GET /health`는 `{ "status": "ok" }`를 반환했다. 구현 후에는 `ProductModule`이 sibling으로 추가되었지만 web은 여전히 API를 호출하지 않는다. 따라서 Product 화면 요청 경로에는 아직 NestJS와 PostgreSQL이 포함되지 않는다.

### 해결할 문제

다음 단계에서는 Product 정보를 API 경계에서 조회할 수 있어야 한다.

- Product 목록과 상세 조회가 같은 API read model을 사용해야 한다.
- 현재 정적 Product 필드와 API 응답 필드의 매핑을 명확히 해야 한다.
- `QUOTE_REQUIRED`와 `DIRECT_PURCHASE`의 의미를 API에서 보존해야 한다.
- 없는 Product와 잘못된 path의 HTTP 계약을 정해야 한다.
- read API가 아직 결정되지 않은 가격, 재고, Customer, 주문과 결제 상태를 만들어 내지 않아야 한다.
- API를 먼저 만들더라도 PostgreSQL 도입 시 API 계약과 module 경계를 불필요하게 다시 만들지 않아야 한다.

### 이번 단계의 경계

이번 설계에서 Product read model과 API 계약은 구체화하지만, PostgreSQL을 함께 도입할지는 분리해서 판단한다.

| 구분 | 이번 task의 구현안 | PostgreSQL을 바로 도입하는 경우 |
| --- | --- | --- |
| Product source | API 내부의 임시 정적 read data | PostgreSQL table과 seed data |
| API | Product 목록·상세 GET endpoint | 같은 endpoint와 DB repository |
| ORM | 설치하지 않음 | Prisma, Drizzle, TypeORM 또는 직접 SQL을 별도 선택 |
| schema·migration | 만들지 않음 | schema, migration, 실행 방법과 rollback 책임을 결정 |
| DB 실행 환경 | 만들지 않음 | 로컬 PostgreSQL, Docker 또는 외부 DB를 결정 |
| web 연결 | 하지 않음 | 여전히 별도 web integration task로 분리 |
| 검증 | API unit/application test와 실제 HTTP 요청 | 위 검증에 DB integration test와 test database를 추가 |

## Relevant Knowledge

다음 문서를 읽고 현재 상태와 규칙을 맞췄다.

- [`AGENTS.md`](../AGENTS.md)
- [`docs/context/index.md`](../docs/context/index.md)
- [`docs/context/company-reference.md`](../docs/context/company-reference.md)
- [`docs/context/project-overview.md`](../docs/context/project-overview.md)
- [`docs/context/architecture-overview.md`](../docs/context/architecture-overview.md)
- [`docs/design/shop-ux-strategy.md`](../docs/design/shop-ux-strategy.md)
- [`docs/development/workflow.md`](../docs/development/workflow.md)
- [`docs/development/testing-strategy.md`](../docs/development/testing-strategy.md)
- [`docs/adr/README.md`](../docs/adr/README.md)
- [`docs/adr/001-use-pnpm-workspace.md`](../docs/adr/001-use-pnpm-workspace.md)
- [`docs/adr/002-use-esm-for-nest-api.md`](../docs/adr/002-use-esm-for-nest-api.md)
- [`tasks/README.md`](README.md)
- [`tasks/001-bootstrap-monorepo.md`](001-bootstrap-monorepo.md)
- [`tasks/006-cart.md`](006-cart.md)
- [`tasks/007-api-bootstrap.md`](007-api-bootstrap.md)
- [`docs/domain/product.md`](../docs/domain/product.md)
- [`docs/domain/cart.md`](../docs/domain/cart.md)

관련 코드와 설정은 다음과 같다.

- `apps/web/data/products.ts`
- `apps/web/app/products/page.tsx`
- `apps/web/app/products/[productId]/page.tsx`
- `apps/web/components/commerce/ProductCard.tsx`
- `apps/web/components/commerce/ProductGrid.tsx`
- `apps/web/components/commerce/ProductPurchasePanel.tsx`
- `apps/web/components/commerce/ProductMediaPlaceholder.tsx`
- `apps/web/components/cart/CartProvider.tsx`
- `apps/web/components/cart/cart-storage.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/health/health.module.ts`
- `apps/api/src/health/health.controller.ts`
- `apps/api/src/main.ts`
- `apps/api/package.json`
- root `package.json`
- root `pnpm-lock.yaml`

## Current State

### Git과 실행 기준선

- 현재 branch는 `uiuuymin/product-read-api`다.
- 현재 `HEAD`는 `d23a66c`이며 `uiuuymin/api-bootstrap` branch와 같은 commit이다.
- 이 worktree는 API bootstrap 완료 commit을 기준으로 생성되었다.
- 조사 시작 시 `git status --short --branch`는 branch 정보만 출력했으며 tracked 변경은 없었다.
- 로컬 version baseline은 Node.js `v24.14.0`, pnpm `11.24.0`, TypeScript `7.0.2`, NestJS package `12.0.1`이다.
- root `package.json`의 `packageManager`는 `pnpm@11.24.0`이다.
- root에는 `apps/*`를 대상으로 하는 `dev`, `build`, `lint`, `typecheck`, `test` script가 이미 있다.
- `apps/api/package.json`에는 `clean`, `dev`, `build`, `start`, `lint`, `typecheck`, `test` script가 이미 있다.
- API는 ESM과 TypeScript `NodeNext`를 사용한다. 상대 import에는 `.js` 확장자를 사용해야 한다.
- root `pnpm-lock.yaml`은 repository의 단일 lockfile이다.

### 현재 Product와 판매 방식

현재 `CatalogProduct`는 다음 필드를 가진다.

```ts
type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  purchaseMode: "QUOTE_REQUIRED" | "DIRECT_PURCHASE";
  details: {
    summary: string;
    features: readonly string[];
    mediaLabel: string;
  };
};
```

이 데이터는 학습용 Demo다. 공식 사이트에서 실제 가격, 재고, 직접 구매 가능 여부와 결제 조건을 확인한 것이 아니다. `QUOTE_REQUIRED`는 제품 구성과 도입 상담을 공식 문의 경로로 보내며 Cart에 담지 않는다. `DIRECT_PURCHASE`는 현재 Demo에서만 Cart CTA를 제공한다.

현재 Product data에는 `price`, `currency`, `stockQuantity`, `isActive`, `Customer`, 주문과 결제 상태가 없다. API가 이 값을 임의로 채우면 Demo 데이터와 실제 정책의 경계가 흐려지고 이후 주문 신뢰 경계와 충돌한다.

### 기존 API module 경계

`HealthModule`은 application 기동과 HTTP 응답 가능 여부만 확인한다. Health 응답에 Product, Cart, DB, 외부 서비스나 사업 상태를 포함하지 않는다. Product 기능은 `HealthModule`을 교체하거나 그 안에 추가하지 않고 `ProductModule`이라는 sibling module로 `AppModule`에 import한다.

## Options Considered

### 1. API가 임시 정적 data를 읽는다

API에 현재 Product data의 API용 snapshot을 두고 `ProductService`가 목록과 상세를 반환한다. web의 `apps/web/data/products.ts`를 상대 경로로 import하지 않고 API application 내부의 data로 둔다.

장점은 다음과 같다.

- PostgreSQL, ORM, migration, Docker와 database credential 없이 API 경계를 먼저 검증할 수 있다.
- 현재 API bootstrap의 build, unit test, application test와 실제 HTTP 검증 방식을 그대로 확장할 수 있다.
- Product read model과 route 계약을 빠르게 검토할 수 있다.
- dependency와 root lockfile을 변경하지 않는다.
- 현재 web을 건드리지 않아 API 설계와 web fetch 전환의 학습 경계를 분리할 수 있다.

단점과 위험은 다음과 같다.

- web 정적 data와 API snapshot 사이에 중복이 생긴다.
- 두 data가 달라지는 drift를 자동으로 막지 못한다.
- persistence, schema, migration과 DB 장애를 학습하지 못한다.
- 임시 data가 장기 source of truth처럼 남을 수 있다.

위험 완화 방법은 API data를 임시 fixture 또는 snapshot이라고 명시하고, DB 도입 전까지 web과 API가 서로의 source라고 주장하지 않는 것이다. web이 API를 호출하는 task에서 data를 한 곳으로 옮기거나 DB 응답으로 대체하는 migration을 수행한다.

### 2. PostgreSQL을 지금 바로 도입한다

Product table, schema, migration, PostgreSQL 연결과 repository를 이번 Product read API 구현에 포함한다.

장점은 다음과 같다.

- API가 처음부터 지속 가능한 source of truth를 읽는다.
- schema, query, migration과 DB integration test를 실제로 학습할 수 있다.
- 이후 server Cart와 Order가 Product 가격·재고를 재조회하는 기반이 생긴다.

단점과 위험은 다음과 같다.

- 아직 정해지지 않은 ORM, schema ownership, migration, local DB 실행과 test database 전략을 한 task에서 함께 정해야 한다.
- PostgreSQL 설치 또는 Docker, `DATABASE_URL`, seed와 운영 환경 경계가 범위에 들어온다.
- Node.js 24와 TypeScript 7에 대한 ORM의 명시적 호환성 근거가 서로 다르다.
- DB가 기동하지 않으면 API unit test와 별개로 application test가 불안정해질 수 있다.
- 현재 사용자 화면은 여전히 정적 data를 사용하므로 API와 DB를 넣어도 end-to-end Product 화면은 연결되지 않는다.

이 선택은 장기적으로 유효할 수 있지만, 현재 저장소의 PostgreSQL 상태가 Proposed이고 ORM과 migration이 TBD라는 사실에 비해 변경 범위가 크다. 따라서 이번 구현에서는 선택하지 않는다.

### 3. API 계약을 먼저 정하고 database task를 분리한다

이번 task에서는 정적 API read model과 GET 계약만 구현하고, 별도 database task에서 PostgreSQL과 ORM을 선택한 뒤 같은 `ProductService` 계약 뒤에 repository를 연결한다.

이 방법은 1번의 빠른 검증과 2번의 장기 DB 전환을 분리한다. 임시 snapshot이라는 단점은 남지만, ORM과 schema 결정을 서두르지 않으면서 API 경계를 먼저 사람과 함께 검토할 수 있다. 이 task의 권장안이다.

별도 database task는 다음 내용을 포함해야 한다.

- PostgreSQL version과 local 실행 방식
- ORM 또는 직접 SQL 선택을 담은 Proposed ADR
- Product schema, constraint, seed와 migration 책임
- `DATABASE_URL` 등 환경변수의 안전한 예시
- repository와 transaction의 책임
- 실제 PostgreSQL을 사용하는 integration test와 test database 격리
- 정적 API fixture에서 DB source로 이전하는 절차

### PostgreSQL 접근 방법 비교

NestJS 공식 문서는 Nest가 database agnostic이며 Node.js driver, SQL library 또는 ORM을 사용할 수 있다고 설명한다. Nest가 TypeORM과 Sequelize에 통합 기능을 제공하지만, Prisma와 직접 SQL도 사용할 수 있다. 그러므로 Nest module을 만든다는 이유만으로 TypeORM을 자동 선택하지 않는다.

| 후보 | 공식 자료에서 확인한 방식 | 현재 baseline과의 근거 | 장점 | 위험과 TBD |
| --- | --- | --- | --- | --- |
| Prisma | Prisma schema와 generated typed client를 사용하고 `prisma migrate`로 migration을 관리한다. Nest 공식 recipe도 PrismaService를 Nest service 안에 두는 방식을 설명한다. | 2026-08-31 registry metadata에서 stable `@prisma/client` `7.10.0`은 Node.js `^20.19 || ^22.12 || >=24.0`, TypeScript peer `>=5.4`를 선언한다. 따라서 Node.js `24.14.0`과 TypeScript `7.0.2`가 최소 범위에는 들어간다. 다만 현재 `prisma` CLI metadata에는 `8.0.0-rc.12`도 보이며 stable과 RC의 조합을 선택할 근거는 TBD다. | schema와 generated client가 read model의 타입을 강하게 연결하고 query API가 명확하다. | generated client의 ESM/CJS 설정, TypeScript 7, Prisma 7과 8 RC의 조합을 이 repository에서 실제 build·runtime으로 검증해야 한다. Prisma 7 Nest recipe는 generated client의 module format을 별도로 설정하는 내용을 포함하므로 ADR에서 ESM-호환 구성을 확인해야 한다. |
| Drizzle | `drizzle-orm/pg-core`와 PostgreSQL driver를 사용하고, `drizzle-kit generate`와 `drizzle-kit migrate`로 SQL migration을 관리한다. 공식 문서는 database-first와 codebase-first를 모두 설명한다. | 2026-08-31 registry metadata에서 `drizzle-orm` `0.45.2`와 `drizzle-kit` `0.31.10`을 확인했다. `drizzle-orm` metadata에는 Node.js engine과 TypeScript peer가 없고, `pg >=8`은 optional peer다. Node.js 24와 TypeScript 7을 조합한 공식 보증 문서는 이 조사에서 찾지 못했으므로 `TBD`다. | SQL과 schema의 관계가 비교적 직접적이고 Nest의 ESM application에 별도 Nest ORM integration 없이 연결할 수 있다. migration SQL을 리뷰하기 쉽다. | Node.js·TypeScript 지원 범위를 package metadata만으로 확정할 수 없다. `drizzle-kit`과 `drizzle-orm`의 버전을 함께 고정하고 PostgreSQL driver, ESM build와 migration CLI를 실제로 검증해야 한다. |
| TypeORM | Entity, `DataSource`, repository와 migration을 사용한다. TypeORM 공식 문서는 PostgreSQL driver, ESM/CommonJS, TypeScript와 migration CLI를 지원한다고 설명한다. Nest는 `@nestjs/typeorm` 통합을 제공한다. | TypeORM 공식 문서는 TypeScript `4.5+`, `experimentalDecorators`와 `emitDecoratorMetadata`를 요구하는 구성을 설명한다. 2026-08-31 registry metadata에서 TypeORM `1.1.0`은 Node.js `^20.19.0 || ^22.13.0 || >=24.11.0`, PostgreSQL peer `pg ^8.5.1`을 선언하므로 Node.js `24.14.0`은 범위에 들어간다. `@nestjs/typeorm 12.0.1`은 Nest 12와 TypeORM `^0.3.0 || ^1.0.0-dev` peer를 선언한다. | Nest의 공식 통합, DI 기반 repository와 익숙한 entity 구조를 사용할 수 있다. | TypeScript 7에 대한 명시적인 TypeORM·Nest 통합 보증은 확인하지 못했다. decorator metadata와 ESM, TypeORM 1.x 및 Nest adapter의 실제 build·runtime을 검증해야 한다. |
| ORM 없이 PostgreSQL driver와 SQL을 직접 사용한다 | Nest 공식 문서의 database agnostic 원칙에 따라 Node.js PostgreSQL driver와 별도 SQL migration 도구를 사용한다. | Nest가 특정 ORM을 강제하지 않는다는 점은 확인했지만, driver·query builder·migration 도구의 조합은 별도 선택이다. | SQL, query와 성능을 직접 이해할 수 있고 ORM의 generated code를 줄일 수 있다. | row mapping, query composition, migration, transaction과 test double을 직접 관리해야 한다. Product 하나에는 단순하지만 Cart·Order·Payment로 확장할 때 반복과 오류 위험이 커질 수 있다. |

### ORM 선택에 대한 현재 판단

이번 task에서는 ORM을 선택하지 않는다. 현재 목표는 API 계약과 Product read module의 경계를 검토하는 것이며, PostgreSQL이 아직 설치·설계되지 않았기 때문이다. ORM 선택은 database task에서 공식 자료와 실제 compatibility test를 다시 확인한 뒤 Proposed ADR로 제시한다.

## API Boundary and Contract

### Namespace 후보

| 후보 | 장점 | 단점과 영향 | 판단 |
| --- | --- | --- | --- |
| `/products` | web route와 이름이 같고 가장 단순하다. | API와 web route가 같은 origin에 놓일 때 책임 구분이 약하다. 향후 global prefix를 도입하면 기존 endpoint와 migration을 함께 검토해야 한다. | 후보 |
| `/api/products` | business API임을 경로에서 구분하고 web의 `/products`와 충돌을 줄인다. 기존 `/health`를 그대로 유지할 수 있다. | 현재 API에 global prefix가 없으므로 controller prefix 또는 별도 route 설정이 필요하다. | **현재 구현 선택** |
| `/api/v1/products` | versioning 정책을 처음부터 명시할 수 있다. | 아직 versioning 정책, breaking change 기준과 운영 client가 없어 한 기능에 과한 규칙이 생긴다. | 후보, 이번에는 선택하지 않음 |

우선안은 global prefix를 `api`로 설정하지 않고 Product controller의 route를 `api/products`로 두는 방식이다. 이렇게 하면 기존 `GET /health` 계약이 `GET /api/health`로 바뀌지 않는다. 실제 구현 전에 이 namespace를 ADR 후보로 승인받는다. `/api`와 versioning은 장기 API 경계이므로 쉽게 교체할 수 있는 단순 controller 내부 구현과 구분한다.

### Endpoint 후보와 선택

현재 구현 계약은 다음과 같다.

```text
GET /api/products
GET /api/products/:productId
```

`/products`와 `/products/:productId`를 선택하면 경로를 줄일 수 있지만, web route와 API route를 구분하기 어렵다. `/api/v1`은 versioning 정책이 확정될 때 별도 ADR에서 도입한다.

### Product read model

응답은 현재 정적 data의 의미를 보존하면서 API 소비자가 `details`의 UI 구조를 알아야 하는 부담을 줄이도록 다음처럼 평탄화한다.

```ts
type ProductReadModel = {
  id: string;
  name: string;
  category: string;
  description: string;
  summary: string;
  features: readonly string[];
  mediaLabel: string;
  purchaseMode: "QUOTE_REQUIRED" | "DIRECT_PURCHASE";
};
```

매핑은 다음과 같다.

| API field | 현재 정적 source | 정책 |
| --- | --- | --- |
| `id` | `product.id` | URL과 Product identity에 사용한다. 현재는 세 문자열 ID를 그대로 유지한다. 형식 검증 규칙은 TBD다. |
| `name` | `product.name` | 고객에게 보이는 Product 이름을 그대로 제공한다. |
| `category` | `product.category` | 목록과 상세의 분류 정보를 제공한다. |
| `description` | `product.description` | 목록 card와 상세 lead에 사용되는 설명을 제공한다. |
| `summary` | `product.details.summary` | 상세 개요를 top-level read field로 제공한다. |
| `features` | `product.details.features` | 순서가 의미 있는 문자열 배열로 제공한다. |
| `mediaLabel` | `product.details.mediaLabel` | 실제 image URL이 아니라 현재 placeholder에 필요한 임시 label이다. 실제 asset, 권한과 image schema는 이 계약에서 만들지 않는다. |
| `purchaseMode` | `product.purchaseMode` | `QUOTE_REQUIRED` 또는 `DIRECT_PURCHASE`만 허용한다. |

`price`, `currency`, `stockQuantity`, `isActive`, `sourceStatus`, `sourceUrl`, Customer, 주문과 결제 상태는 현재 source에 없으므로 응답에 추가하지 않는다. 향후 Product schema가 이 필드를 갖더라도 read API task에서 의미와 신뢰 경계를 먼저 결정해야 한다.

### 목록 응답

목록은 향후 metadata를 추가할 수 있도록 배열을 envelope 안에 둔다. pagination을 이번 단계에 제공하지 않으므로 `items` 외의 pagination metadata는 반환하지 않는다.

```http
GET /api/products
```

```json
{
  "items": [
    {
      "id": "nitro",
      "name": "NITRO Plant Growth System",
      "category": "생육·표현형 분석 시스템",
      "description": "환경 제어, 멀티모달 이미징과 AI 기반 형질 분석을 연결하는 연구 플랫폼입니다.",
      "summary": "독립적인 생육 환경 제어와 반복 촬영으로 식물의 반응을 관찰하고, 수집한 데이터를 정량적인 형질 분석으로 연결합니다.",
      "features": [
        "온도, 습도, 광, 관수와 CO₂를 연구 조건에 맞춰 제어합니다.",
        "RGB, 열화상과 엽록소 형광으로 식물을 비파괴 방식으로 반복 관찰합니다.",
        "촬영한 이미지와 환경 데이터를 AI 기반 형질 분석과 연결합니다."
      ],
      "mediaLabel": "NITRO",
      "purchaseMode": "QUOTE_REQUIRED"
    }
  ]
}
```

실제 구현에서는 현재 source의 세 Product를 source 순서대로 반환한다. 목록 응답이 빈 배열일 때의 의미는 `200`과 `{"items":[]}`로 유지할 수 있지만, 현재 fixture에서는 빈 배열이 되지 않도록 test로 고정한다.

### 상세 응답

```http
GET /api/products/thermal-imaging
```

정상 응답은 하나의 `ProductReadModel` object를 직접 반환한다.

```json
{
  "id": "thermal-imaging",
  "name": "Thermal Imaging Module",
  "category": "이미징 모듈",
  "description": "적외선 열화상으로 식물의 온도 변화와 스트레스 패턴을 관찰합니다.",
  "summary": "식물에서 나타나는 온도 차이를 열화상 데이터로 확인하여 생육 반응과 스트레스 변화를 비교할 수 있습니다.",
  "features": [
    "식물 표면의 온도 변화를 열화상 데이터로 시각화합니다.",
    "눈에 보이는 변화 전후의 스트레스 패턴을 비교해 관찰합니다.",
    "반복 촬영한 결과를 시간의 흐름에 따라 살펴볼 수 있습니다."
  ],
  "mediaLabel": "THERMAL",
  "purchaseMode": "DIRECT_PURCHASE"
}
```

### 판매 방식의 의미 보존

- `QUOTE_REQUIRED`는 API가 Product가 목록과 상세 조회 대상임을 알리지만, 가격이나 구매 가능 수량을 제공한다는 뜻이 아니다. web은 이 값을 공식 문의 CTA로 표현하고 Cart item을 만들지 않는다.
- `DIRECT_PURCHASE`는 현재 Demo에서 Cart CTA를 제공할 수 있는 판매 방식이다. 이 값만으로 실제 재고가 있거나 주문·결제가 가능하다고 확정하지 않는다.
- API는 두 값을 임의로 boolean `isPurchasable`로 바꾸지 않는다. 기존 domain 용어와 화면 분기의 의미를 보존한다.

### 없는 Product의 404 계약

`GET /api/products/unknown-product`는 `404 Not Found`를 반환한다. 서비스는 `NotFoundException`을 사용하고, 구현에서는 다음과 같은 최소 JSON error shape를 계약으로 확인한다.

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

이 오류는 Product가 없다는 사실만 나타내며, 가격·재고·구매 가능성의 판단 결과로 사용하지 않는다. NestJS의 기본 error response를 활용할지 자체 error DTO를 둘지는 현재 GET path 범위에서는 후자가 과하므로 기본 응답을 우선 사용한다. 응답 문구를 전역 계약으로 고정할 필요가 생기면 별도 error contract task에서 결정한다.

### 잘못된 path와 query

- `GET /api/product`처럼 resource 이름이 잘못된 path는 `404`다.
- `GET /api/products/thermal-imaging/extra`처럼 segment가 더 많은 path는 `404`다.
- `GET /api/products/`는 framework의 trailing slash 처리에 따라 같은 목록 route로 취급될 수 있으므로 별도 의미를 부여하지 않는다.
- path parameter는 현재 문자열 lookup만 수행한다. UUID, 숫자와 slug 중 하나를 강제하는 validation은 이번 단계에 추가하지 않는다.
- pagination, filtering과 sorting query는 이번 단계 계약에 넣지 않는다. 지원하지 않는 query의 동작을 새로운 기능처럼 기록하지 않으며, query 계약이 필요해지는 task에서 validation과 함께 결정한다.

### 이번 API가 하지 않는 일

Product read API는 다음 값을 만들거나 확정하지 않는다.

- 가격, 통화, 할인, 세금과 배송비
- 재고 수량, 품절, 예약과 차감
- Customer 식별, 인증과 권한
- Cart 저장, 주문 생성과 주문 상태
- Payment 상태, Toss Payments 승인과 결제 성공 여부
- 실제 image asset, image URL과 사용 권한

이는 단순히 필드를 생략하는 규칙이 아니라 read API의 신뢰 경계다. 브라우저 Cart가 가진 Product ID와 수량은 이후 server Cart 또는 Order task에서 Product API와 서버 규칙으로 다시 검증해야 한다.

## Data Ownership and Migration Plan

### 현재 구현의 ownership

이번 static API 구현에서는 `apps/api/src/product/product.data.ts`를 API 응답의 임시 source로 둔다. 이는 `apps/web/data/products.ts`를 API가 직접 import하지 않기 위한 경계다. web과 API는 현재 각각 독립된 application이므로 한 application이 다른 application 내부 파일을 runtime dependency로 참조하지 않는다.

이 구조는 두 snapshot을 만든다. 따라서 다음을 명시한다.

- `apps/web/data/products.ts`는 web이 API를 호출하지 않는 동안 현재 UI의 source다.
- `apps/api/src/product/product.data.ts`는 Product API를 검증하기 위한 임시 fixture다.
- 어느 snapshot도 실제 PhytoWorks 가격·재고·판매 정책의 source가 아니다.
- API fixture의 변경은 Product API task의 변경으로 보고, web 화면의 변경은 별도 task로 검토한다.
- web integration task에서 API가 source가 되면 web 정적 data를 제거하거나 shared contract를 도입하는 이전 계획을 확정한다.

장기 제안은 PostgreSQL을 Product의 source of truth로 삼는 것이다. 이 결정은 schema와 migration이 확정될 때 Proposed ADR로 작성하고 승인받아야 한다.

### PostgreSQL 이전 계획

별도 database task에서 다음 순서로 이전한다.

1. Product schema와 `purchaseMode` constraint를 정의한다.
2. 현재 세 Product를 Demo seed 또는 명시적인 migration data로 옮긴다.
3. ORM 또는 직접 SQL repository가 `ProductService`가 요구하는 목록·상세 read contract를 구현한다.
4. 정적 fixture와 DB 결과의 field mapping과 순서를 비교한다.
5. API integration test가 실제 PostgreSQL을 읽는 것을 확인한다.
6. web integration task에서 Next.js fetch와 cache 경계를 정한 뒤 web의 정적 source를 제거한다.

schema와 migration의 책임은 database task가 소유한다. API Product module은 query와 API mapping을 소유하고, schema 생성·migration 실행·seed의 lifecycle을 Product controller 안에 넣지 않는다. ORM을 API만 사용하는 동안 `packages/database`를 자동으로 만들지 않으며, 여러 application이 같은 database code를 실제로 공유해야 할 때만 공통 package를 다시 검토한다.

### web contract와 cache 경계

현재 web은 API를 호출하지 않으므로 shared TypeScript type, OpenAPI 문서와 generated client를 만들지 않는다. web이 API를 호출하는 별도 task에서 다음을 결정한다.

- API response type을 수동 공유할지 schema 기반 contract로 관리할지
- Server Component fetch, Server Action과 browser fetch 중 어느 경계를 사용할지
- Next.js fetch cache, revalidation, no-store와 stale data의 의미
- API와 Next.js 사이의 오류·loading·not-found mapping
- `/api/products`를 same-origin proxy로 호출할지 별도 API origin으로 호출할지

이번 API는 application cache를 도입하지 않는다. 정적 fixture라는 이유로 HTTP cache, ETag와 revalidation 정책을 꾸며 내지 않는다.

## Module and File Boundary

현재 static API 구현의 최소 파일 경계는 다음과 같다.

```text
apps/api/src/
├─ app.module.ts                         # 기존 HealthModule과 ProductModule 조합
├─ health/                               # 기존 sibling, 변경하지 않음
└─ product/
   ├─ product.module.ts                  # Product feature module
   ├─ product.controller.ts              # GET route와 HTTP mapping
   ├─ product.service.ts                 # 목록·상세 read use case
   ├─ product.data.ts                    # 임시 API static fixture
   ├─ product.types.ts                   # read model과 purchaseMode type
   └─ product.controller.spec.ts         # controller/application 경계 unit test

apps/api/test/
└─ product.e2e-spec.ts                   # 실제 Nest application HTTP test
```

실제 구현에서는 test 배치가 기존 API test 규칙과 더 잘 맞는지 확인하되, module의 책임은 바꾸지 않는다.

### Module 책임

- `ProductModule`은 Product controller와 service를 제공한다.
- `ProductController`는 route parameter를 받고 HTTP response를 반환한다. query, body와 business state를 추가하지 않는다.
- `ProductService`는 목록 순서, ID lookup과 없는 Product의 not-found 규칙을 담당한다.
- `product.data.ts`는 정적 source의 임시 위치다. controller가 배열을 직접 읽지 않는다.
- `product.types.ts`는 API read model의 명시적인 TypeScript 경계를 둔다.
- static 단계에는 `ProductRepository` interface를 만들지 않는다. DB로 교체할 때까지 사용처가 하나뿐인 abstraction은 현재 학습 목표에 비해 과하다.
- DB 단계에서 실제 persistence 경계가 생기면 `ProductRepository` 또는 ORM repository adapter의 필요성을 다시 판단한다.

`HealthModule`은 `ProductModule`로 교체하지 않는다. `AppModule`은 feature module을 조합하는 역할만 유지한다. Product, Cart, Customer, Order와 Payment의 공통 service, 범용 repository, DTO package와 `packages/contracts`는 실제 두 consumer가 생기기 전까지 만들지 않는다.

### Dependency 경계

이번 static API 구현에는 다음 dependency를 추가하지 않는다.

- Nest CLI
- `@nestjs/config`
- `class-validator`, `class-transformer` 또는 별도 validation library
- Swagger/OpenAPI package
- PostgreSQL driver
- Prisma, Drizzle, TypeORM과 각 migration CLI
- Docker와 test container package
- 사용처가 없는 공통 package

NestJS 12의 validation 기능을 사용할 수 있다는 사실만으로 validation dependency를 추가하지 않는다. 이번 endpoint에는 body와 query 계약이 없고 path는 static string lookup으로 처리할 수 있다. config package도 DB connection 설정이 없는 단계에서는 필요하지 않다. API documentation과 CORS는 web이 실제로 API를 호출하는 task의 요구사항을 확인한 뒤 별도 검토한다.

## Testing and Verification

### Static API 구현 시 자동 검증

기존 API의 Vitest와 Supertest 구성을 유지한다.

- `ProductService` unit test는 세 Product 목록, known ID 상세와 unknown ID의 `NotFoundException`을 확인한다.
- `ProductController` unit test는 목록 envelope, 상세 read model mapping과 `purchaseMode` 보존을 확인한다.
- 실제 Nest application endpoint test는 `AppModule`부터 HTTP adapter까지 구성한다.
- `GET /api/products`의 `200`, JSON `items` 배열과 세 Product의 주요 field를 확인한다.
- `GET /api/products/thermal-imaging`의 `200`, ID·summary·features·`DIRECT_PURCHASE`를 확인한다.
- `GET /api/products/unknown-product`의 `404`와 error shape를 확인한다.
- `GET /api/product`와 `GET /api/products/thermal-imaging/extra`의 `404`를 확인한다.
- 기존 `GET /health`가 계속 `200`과 `{ "status": "ok" }`를 반환하는지 확인한다.
- `GET /products`처럼 API namespace가 아닌 path가 Product API로 잘못 연결되지 않는지 확인한다.

### DB를 선택하는 경우의 추가 검증

PostgreSQL을 이번 task에 포함하기로 변경하면 아래 조건을 먼저 추가 승인받아야 한다.

- migration을 빈 test database에 적용한다.
- Demo seed 또는 fixture를 넣고 실제 PostgreSQL query로 목록·상세를 읽는다.
- 없는 ID가 repository와 HTTP 양쪽에서 `404`로 변환되는지 확인한다.
- schema constraint가 `purchaseMode` 외부 값을 막는지 확인한다.
- 각 test run이 다른 test data와 격리되는지 확인한다.
- test 종료 뒤 connection pool과 database resource를 정리한다.
- migration 실패·재실행·rollback 전략을 확인한다.

test database 전략은 현재 `TBD`다. 후보는 Docker 기반 disposable PostgreSQL, Testcontainers 기반 database와 별도 schema/database다. Docker와 test container dependency는 이번 static API 범위에 넣지 않는다.

### Script와 lockfile 검증

static API 구현에서는 기존 script를 재사용하며 root 또는 API script를 변경하지 않는 것을 우선한다.

- `pnpm --filter @phytoworks/api lint`
- `pnpm --filter @phytoworks/api typecheck`
- `pnpm --filter @phytoworks/api test`
- `pnpm --filter @phytoworks/api build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm install --frozen-lockfile`

새 dependency가 없으면 `pnpm-lock.yaml` importer와 전체 lockfile이 변경되지 않아야 한다. DB 선택으로 dependency가 생기면 package manifest, peer dependency, Node engine, ESM build와 lockfile diff를 별도로 검토한다. `pnpm-lock.yaml`은 계속 root 단일 lockfile로 유지한다.

### 실제 HTTP 요청 검증

API build 결과 또는 development server를 별도 terminal에서 실행한 뒤 다음 요청을 보낸다.

1. `GET http://localhost:3001/health`가 기존 `200`인지 확인한다.
2. `GET http://localhost:3001/api/products`가 `200`과 JSON 목록을 반환하는지 확인한다.
3. `GET http://localhost:3001/api/products/thermal-imaging`가 `200`과 상세 read model을 반환하는지 확인한다.
4. `GET http://localhost:3001/api/products/unknown-product`가 `404`인지 확인한다.
5. `GET http://localhost:3001/api/product`와 `GET http://localhost:3001/api/products/thermal-imaging/extra`가 `404`인지 확인한다.
6. `GET http://localhost:3001/products`가 Product API의 `200`으로 잘못 응답하지 않는지 확인한다.
7. 실행한 server process를 종료하고 port 3001에 남은 listener가 없는지 확인한다.

실제 HTTP 요청은 자동 test 통과만으로 대체하지 않는다. response status, `Content-Type`, body와 route를 함께 확인한다.

## Official Sources and Version Evidence

조사 기준일은 `2026-08-31`이다. 아래 version은 이 날짜의 local baseline 또는 package registry metadata를 기록한 것이며, 구현 시점에 다시 확인한다.

### Framework와 runtime

- [NestJS 12 migration guide](https://docs.nestjs.com/migration-guide)는 Nest 12 application 실행의 최소 Node.js를 `v20.19+` 또는 Node.js 22 계열의 `v22.12+`로, `nest new`와 `nest generate` 같은 CLI schematic의 최소 version을 `v22.22.3`, `v24.15+` 또는 `v26+`으로 구분한다. 현재 Node.js `24.14.0`은 application 실행에는 충분하지만 CLI generator 기준에는 도달하지 않는다.
- 같은 migration guide는 NestJS 12 package가 ESM으로 배포되며 application의 module format은 별도로 선택할 수 있다고 설명한다. 이 repository의 ESM 선택은 [ADR-002](../docs/adr/002-use-esm-for-nest-api.md)의 Accepted 결정으로 유지한다.
- [NestJS database technique](https://docs.nestjs.com/techniques/database)는 Nest가 database agnostic이고 Node.js driver, SQL library 또는 ORM을 사용할 수 있다고 설명한다. TypeORM과 Sequelize에는 공식 통합이 있지만 특정 ORM을 자동으로 선택해야 한다는 규칙은 없다.
- [NestJS Prisma recipe](https://docs.nestjs.com/recipes/prisma)는 Prisma schema, generated client, PrismaService와 PostgreSQL 연결 예를 설명한다. 현재 문서의 Prisma version과 이 repository의 ESM·TypeScript 7 조합은 구현 시 다시 검증한다.
- [Node.js v24 CLI documentation](https://nodejs.org/download/release/v24.0.2/docs/api/cli.html#--watch)는 `node --watch`가 변경된 entry point와 import module을 감시하고 process를 재시작하며 Node.js v22.0.0과 v20.13.0부터 stable이라고 설명한다. API bootstrap의 기존 watch script와 맞는다.
- [TypeScript documentation](https://www.typescriptlang.org/docs/)과 [decorator documentation](https://www.typescriptlang.org/docs/handbook/decorators)는 TypeScript의 decorator와 `emitDecoratorMetadata`가 compiler configuration 및 runtime metadata와 연결되는 방식을 설명한다. TypeORM을 선택할 때 TypeScript 7의 실제 build를 별도로 검증해야 한다.
- [pnpm Workspace](https://pnpm.io/workspaces), [pnpm Filtering](https://pnpm.io/filtering)과 [pnpm run](https://pnpm.io/cli/run)을 기준으로 root의 workspace와 filter script를 유지한다. 현재 root package manager는 `pnpm@11.24.0`이다.

### ORM과 database 접근

- [Prisma system requirements](https://docs.prisma.io/docs/orm/reference/system-requirements)는 현재 문서에서 latest Prisma ORM의 Node.js와 TypeScript 최소 범위를 설명한다. 이 조사에서는 stable `@prisma/client 7.10.0`의 registry metadata도 확인했다. 해당 metadata는 Node.js `^20.19 || ^22.12 || >=24.0`, TypeScript peer `>=5.4`를 선언한다.
- [Prisma 7 getting started](https://docs.prisma.io/docs/getting-started)와 [Prisma upgrade to v7](https://docs.prisma.io/docs/orm/v6/more/upgrades/to-v7)는 Prisma 7의 현재 setup과 ESM·client generation 변경을 설명한다. `prisma` CLI metadata에는 이 조사일에 `8.0.0-rc.12`가 보여 stable/RC 선택이 불확실하므로 `TBD`로 남긴다.
- [Drizzle PostgreSQL guide](https://orm.drizzle.team/docs/get-started/postgresql-existing)는 `drizzle-orm/node-postgres`, PostgreSQL schema와 `drizzle-kit generate`·`drizzle-kit migrate` 사용을 설명한다.
- [Drizzle migrations guide](https://orm.drizzle.team/docs/migrations)는 database-first와 codebase-first migration을 모두 지원하고 `drizzle-kit`이 migration을 관리할 수 있다고 설명한다.
- [Drizzle ORM official repository package.json](https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/package.json)은 `drizzle-orm`의 package metadata와 optional peer driver 목록을 확인하는 근거다. 이 조사일 registry metadata는 `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10`이었고 Node.js engine 및 TypeScript peer를 명시하지 않았다. 따라서 Node.js 24·TypeScript 7 호환성은 공식 명시 근거가 부족하여 `TBD`다.
- [TypeORM Getting Started](https://typeorm.io/docs/getting-started/)는 TypeScript `4.5+`, PostgreSQL driver, ESM/CommonJS와 migration을 설명한다.
- [TypeORM PostgreSQL driver](https://typeorm.io/docs/drivers/postgres/)는 PostgreSQL에 `pg` driver가 필요하다고 설명한다. [TypeORM official repository package.json](https://github.com/typeorm/typeorm/blob/master/package.json)은 이 조사일의 current package metadata에서 Node.js `^20.19.0 || ^22.13.0 || >=24.11.0`과 PostgreSQL peer `pg ^8.5.1`을 확인하는 근거다.
- [NestJS database technique](https://docs.nestjs.com/techniques/database)는 ORM 없이 직접 driver 또는 일반적인 Node.js database library를 사용할 수 있다는 비교 근거다.

공식 자료는 각 도구의 일반 지원 범위를 보여 주지만, `NestJS 12 + ESM + Node.js 24.14.0 + TypeScript 7.0.2` 전체 조합의 통합 성공을 보장하지 않는다. 그러므로 위 compatibility 판단은 `Proposed`이며, 실제 dependency를 추가할 때 clean install, typecheck, build, test와 실제 PostgreSQL 요청으로 다시 확인한다.

## Decision and ADR Classification

### 이번 task의 선택

이번 task의 구현은 다음과 같다.

1. Product API는 `/api/products`와 `/api/products/:productId`로 제공한다.
2. `ProductModule`은 `HealthModule`의 sibling으로 추가한다.
3. static 단계에서는 `ProductService`가 API 내부의 immutable fixture를 읽고, repository interface는 만들지 않는다.
4. 목록은 `{ items: ProductReadModel[] }`, 상세는 `ProductReadModel`을 반환한다.
5. `QUOTE_REQUIRED`와 `DIRECT_PURCHASE`를 그대로 보존하고 가격·재고·Customer·주문·결제 상태는 반환하지 않는다.
6. pagination, filtering과 sorting은 이번 단계에서 지원하지 않는다.
7. PostgreSQL, ORM, migration, Docker, Swagger/OpenAPI와 web fetch 연결은 별도 task로 분리한다.

### ADR 후보

다음 결정은 장기 영향이 있으므로 구현 전에 Proposed ADR을 만들고 사용자 승인을 받는다.

- **ORM 또는 직접 SQL 선택:** Prisma, Drizzle, TypeORM과 직접 driver의 compatibility, migration과 query ownership을 결정한다.
- **Product data ownership과 PostgreSQL source of truth:** 정적 snapshot에서 DB source로 옮기는 시점, schema·seed·migration 책임과 기존 Cart/Order에 미치는 영향을 결정한다.
- **API namespace와 versioning:** `/products`, `/api/products`와 `/api/v1/products` 중 장기 API 경계와 breaking change 규칙을 결정한다.
- **web/API contract 관리:** shared package, schema 기반 contract 또는 수동 type 중 여러 consumer에 지속될 방식을 결정한다.

### ADR이 아닌 task 기록

다음 사항은 현재 Product read API task에 기록하고, 별도 ADR은 만들지 않는다.

- controller와 service의 파일 배치
- static fixture의 임시 위치
- 목록 envelope와 상세 object의 response shape
- `details`를 `summary`, `features`와 `mediaLabel`로 평탄화하는 mapping
- `NotFoundException`을 사용한 단일 Product의 404 처리
- pagination, filtering과 sorting을 이번 단계에 넣지 않는 범위
- controller/service unit test와 실제 HTTP endpoint test의 세부 사례

이 항목들은 API consumer와 장기 source ownership이 바뀌면 task에서 함께 교체할 수 있는 구현 세부사항이다. 단, response shape가 여러 consumer에 공개되거나 contract generation으로 고정되는 시점에는 ADR 필요성을 다시 판단한다.

## Changes

이번 구현에서 실제로 변경한 파일은 다음과 같다.

### 실제 변경한 파일

- `apps/api/src/app.module.ts`
- `apps/api/src/product/product.module.ts`
- `apps/api/src/product/product.controller.ts`
- `apps/api/src/product/product.service.ts`
- `apps/api/src/product/product.data.ts`
- `apps/api/src/product/product.types.ts`
- `apps/api/src/product/product.controller.spec.ts`
- `apps/api/src/product/product.service.spec.ts`
- `apps/api/test/product.e2e-spec.ts`
- `biome.json`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/design/shop-ux-strategy.md`
- `tasks/008-product-read-api.md`

`biome.json`에는 NestJS parameter decorator를 TypeScript 7 parser가 읽을 수 있도록 `unsafeParameterDecoratorsEnabled`를 추가했다. Product route의 `@Param()`을 lint·format하는 데 필요한 최소 설정이다.

### 주요 구현 파일

정적 API 구현에 사용한 주요 파일은 다음과 같다.

- `apps/api/src/app.module.ts`
- `apps/api/src/product/product.module.ts`
- `apps/api/src/product/product.controller.ts`
- `apps/api/src/product/product.service.ts`
- `apps/api/src/product/product.data.ts`
- `apps/api/src/product/product.types.ts`
- `apps/api/src/product/product.controller.spec.ts`
- `apps/api/test/product.e2e-spec.ts`

Product fixture는 API application 내부에 두었으며 web data를 runtime import하지 않는다.

### 변경하지 않을 파일과 영역

- `apps/web/data/products.ts`와 Product route·component
- `apps/web`의 fetch, Server Action, cache와 UI
- `apps/api/src/health/`와 `GET /health` 계약
- `apps/api/package.json`과 root `package.json`의 script
- `pnpm-lock.yaml`과 별도 lockfile
- PostgreSQL, ORM, migration, seed와 repository abstraction
- `packages/contracts`, `packages/database`와 기타 공통 package
- Docker, credential, 운영 환경값과 배포 설정
- Swagger/OpenAPI, CORS, global prefix, versioning과 validation dependency
- Cart, Customer, Order, Payment, Checkout과 Toss Payments
- 가격, 재고, 할인, 세금, 배송과 실제 판매 정책

Product API는 Product read 범위만 다룬다. Product 이외의 domain은 API module, response와 test fixture에 포함하지 않는다.

## Plan

사용자 승인 후 다음 순서로 구현했다.

1. 승인된 API namespace와 response contract를 기준으로 `ProductReadModel`과 `purchaseMode` type을 확정한다.
2. API 내부 fixture를 만들고 현재 세 Product의 field mapping을 옮긴다. web data를 import하지 않는다.
3. `ProductModule`, `ProductController`와 `ProductService`를 기존 `HealthModule`과 sibling으로 추가한다.
4. 목록·상세·없는 ID와 잘못된 path의 unit/application test를 추가한다.
5. API 단독 lint, typecheck, test와 build를 실행한다.
6. root lint, typecheck, test와 build를 실행해 web 회귀를 확인한다.
7. 실제 HTTP 요청으로 `health`, Product 목록, 상세, 404와 잘못된 path를 확인한다.
8. `git diff`, `git diff --check`, 변경 파일 목록과 lockfile 변경 여부를 검토한다.
9. 구현 결과와 static snapshot의 한계를 이 task에 기록한다.
10. PostgreSQL 도입은 별도 database task와 Proposed ADR을 만든 뒤 다시 승인받는다.

PostgreSQL을 이번 task에 포함하자는 결정으로 바뀌면 위 계획을 실행하지 않고 먼저 범위를 다시 작성한다. ORM, schema, migration, local DB와 test database를 포함한 새 계획 없이는 dependency나 DB를 추가하지 않는다.

## Completion Criteria

### 이 설계 task의 완료 조건

- 현재 Product가 `apps/web/data/products.ts`의 정적 data이고 web이 API를 호출하지 않는다는 사실이 기록되어 있다.
- Product read model과 PostgreSQL 도입 범위가 분리되어 있고, 구현안이 명시되어 있다.
- static API, PostgreSQL 직접 도입, ORM 후보와 별도 database task 대안을 비교했다.
- Prisma, Drizzle, TypeORM과 직접 SQL 후보의 공식 자료, 확인 날짜, version, Node engine, peer dependency와 TypeScript 호환성의 확인 수준을 기록했다.
- `/api/products`, `/api/products/:productId`, namespace 후보, field mapping, 판매 방식, 404와 API의 신뢰 경계가 구체적으로 기록되어 있다.
- data ownership, DB 이전, schema·migration 책임, web contract·cache와 별도 web task 여부가 기록되어 있다.
- ProductModule, controller, service, static data의 최소 파일 경계와 HealthModule sibling 경계가 기록되어 있다.
- unit test, 실제 Nest application endpoint test, HTTP 요청, DB를 선택할 때의 integration test와 script·lockfile 검증 계획이 기록되어 있다.
- 변경·비변경 파일, Product 이외의 제외 범위와 Docker·credential·운영값·Swagger/OpenAPI·web fetch 연결의 제외가 기록되어 있다.
- ORM, data ownership, API namespace와 contract 관리의 ADR 후보 및 task에만 남길 세부사항이 구분되어 있다.
- 구현 과정에서 dependency manifest와 lockfile은 변경되지 않았고, 승인 전 설계 단계의 범위 밖 변경을 만들지 않았다.

### static 구현의 완료 조건

- `GET /api/products`가 현재 세 Product의 read model을 `{ "items": [...] }`로 반환한다.
- `GET /api/products/:productId`가 known ID의 상세 read model을 반환한다.
- `QUOTE_REQUIRED`와 `DIRECT_PURCHASE`가 응답에서 보존된다.
- 없는 Product ID와 잘못된 path가 `404`로 응답한다.
- API가 가격, 재고, Customer, 주문과 결제 상태를 꾸며 내지 않는다.
- `HealthModule`과 `GET /health`가 기존 계약을 유지한다.
- API와 root의 기존 lint, typecheck, test와 build가 통과한다.
- 실제 HTTP 요청에서 status, JSON content type, body와 process 종료를 확인한다.
- static fixture가 임시 source라는 한계와 PostgreSQL 이전 follow-up이 task에 남아 있다.

## Verification

설계와 구현 단계에서 실행한 검증은 다음과 같다.

- `git status --short --branch`로 현재 branch와 시작 상태를 확인했다.
- `git log --oneline --decorate`와 `git merge-base HEAD uiuuymin/api-bootstrap`로 `HEAD`가 `d23a66c`이고 `uiuuymin/api-bootstrap`와 같은 commit인지 확인했다.
- 지정된 context, design, development, domain, ADR과 관련 task를 읽었다.
- `apps/web/data/products.ts`와 Product route·component를 읽어 현재 field mapping과 purchase mode 분기를 확인했다.
- `apps/api`의 module, health endpoint, package와 script를 읽어 기존 API 경계를 확인했다.
- 공식 NestJS, Node.js, TypeScript, pnpm, Prisma, Drizzle와 TypeORM 자료를 확인했다.
- 2026-08-31에 package registry metadata를 조회해 Prisma, Drizzle, TypeORM, `@nestjs/typeorm`의 version, engine과 peer dependency를 비교했다.
- 초기 구현에서 `import type`으로 바꾼 ProductService 때문에 NestJS DI metadata가 사라져 application test가 실패했다. runtime import와 Biome 예외 주석으로 수정했다.
- `pnpm --filter @phytoworks/api lint` → 성공, 18개 파일을 확인했다.
- `pnpm --filter @phytoworks/api typecheck` → 성공했다.
- `pnpm --filter @phytoworks/api test` → 성공, 5개 test file과 12개 test가 통과했다.
- `pnpm --filter @phytoworks/api build` → 성공했다.
- `pnpm lint` → 성공, API 18개 파일과 web 35개 파일을 확인했다.
- `pnpm typecheck` → 성공, web과 API가 모두 통과했다.
- `pnpm test` → 성공, API 12개 test가 통과했다.
- `pnpm build` → 성공, API build와 Next.js 16.3.3 static build가 모두 통과했다.
- port 3001에서 production API를 실행하고 실제 HTTP 요청을 보냈다. `/health`와 Product 목록·상세는 200, 없는 ID와 잘못된 path는 404였다.
- HTTP 검증 후 port 3001 listener가 남아 있지 않음을 확인했다.
- 공식 package metadata 확인 중 실수로 `pnpm exec tsc --version`을 호출했다. pnpm이 기존 lockfile 기준의 ignored `node_modules`를 채웠지만 manifest와 `pnpm-lock.yaml`은 변경되지 않았다. 이후 dependency install 명령은 실행하지 않는다.

문서 작성 후 다음 명령으로 문서 자체와 범위 밖 변경을 확인한다.

- `git diff --check`
- `git status --short --branch`
- `git diff --stat`
- `git diff -- tasks/008-product-read-api.md`

## Problems Encountered

- PowerShell login 초기화 과정에서 존재하지 않는 `SSL_CERT_FILE` 환경변수를 제거하려는 Conda 경고가 출력되었다. 파일과 Git 조회 결과에는 영향을 주지 않았다.
- PowerShell 기본 encoding으로 한글 문서가 깨져 보이는 문제가 있었다. 이후 `Get-Content -Encoding utf8`로 읽었으며 깨진 출력은 판단 근거로 사용하지 않았다.
- 공식 metadata 확인 중 `pnpm exec tsc --version`이 local executable을 찾지 못하고 workspace package를 기존 lockfile 기준으로 준비했다. tracked 파일과 lockfile 변경은 없었지만, 이번 task의 의도와 맞지 않는 명령이므로 이후 설치 명령을 사용하지 않는다.
- Biome가 TypeScript 7 parser에서 parameter decorator를 기본 허용하지 않아 `@Param()` controller가 처음 lint·parse에 실패했다. 공통 설정에 필요한 parser option을 추가했다.
- Biome의 type-only import 제안대로 `ProductService`를 `import type`으로 바꾼 첫 수정은 NestJS가 constructor dependency의 runtime class를 찾지 못하게 했다. Nest DI 대상은 runtime import로 유지했다.

## Follow-up

- static API 구현은 완료되었으며, 다음 단계는 PostgreSQL Product source task다.
- PostgreSQL을 Product source of truth로 채택할지는 별도 database task와 Proposed ADR에서 결정한다.
- ORM, schema·migration ownership, test database와 local PostgreSQL 실행 방식은 별도 database task 승인 전까지 확정하지 않는다.
- web이 API를 호출하는 task에서 fetch, error mapping, contract sharing과 cache boundary를 결정한다.
- web 정적 Product data와 API fixture의 drift를 DB 이전 또는 contract sharing으로 해소한다.
- 가격, 재고, Cart, Customer, Order와 Payment의 신뢰 경계는 각 domain vertical slice에서 다시 검증한다.
- 실제 image asset과 `mediaLabel`의 관계, source URL과 사용 권한은 Product media task에서 결정한다.

## Lessons Learned

- API route와 DB source는 한 번에 결정할 필요가 없다. read contract를 먼저 검토하고 persistence 선택을 별도 task로 분리하면 장기 결정과 임시 학습 경계를 구분할 수 있다.
- NestJS가 특정 database library를 강제하지 않으므로, Nest module 경계와 ORM 선택은 서로 독립적으로 비교해야 한다.
- package의 최소 engine과 TypeScript peer 범위가 현재 repository의 ESM·Node.js·TypeScript 전체 조합을 보장하는 것은 아니다. 실제 dependency를 추가할 때 clean build와 runtime 검증이 필요하다.
- `HealthModule`은 application health의 최소 경계로 유지하고, Product 같은 사업 기능은 sibling feature module로 추가해야 health 의미가 변하지 않는다.
