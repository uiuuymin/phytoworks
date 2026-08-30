# Architecture Overview

## 문서 상태

- **Current:** pnpm workspace와 `apps/web` Next.js 애플리케이션이 있으며 `/` 화면까지 실행된다.
- **Proposed:** NestJS 이후의 구조는 구현 전 검토할 초기 목표이며 확정된 배포 구조가 아니다.
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

**Current:** `apps/web`에 Next.js 16.3.3 App Router가 생성되었고 `/`에서 PhytoWorks의 NITRO·이미징 모듈 맥락을 반영한 학습용 목록을 렌더링한다. 현재 페이지는 기본 Server Component이며 API나 DB 데이터는 사용하지 않는다.

**Proposed:** 이후 상품·장바구니·주문·결제 결과 화면을 제공하고 NestJS API와 통신한다. 어떤 기능을 Server Component, Server Action 또는 브라우저 코드에서 처리할지는 기능별 task에서 결정한다.

### Web route와 component 경계

**Current:** 직접 작성된 route는 `/` 하나다. `apps/web/app`에는 `layout.tsx`, `page.tsx`와 `globals.css`가 있다. Native CSS foundation은 semantic token, global typography, responsive container, focus와 reduced motion을 제공한다. 공통 navigation, 별도 component directory, component별 CSS Module과 client state는 아직 없다. Next.js가 생성한 `/_not-found`, `/_global-error`는 framework fallback이다.

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

정적 layout, Product 목록과 설명은 Server Component를 우선한다. Cart 조작, toast, Wishlist와 image gallery처럼 browser state와 event가 필요한 작은 leaf만 Client Component 후보로 둔다. 실제 data fetching, cache와 mutation 경계는 API 구현 task에서 확정한다.

IA, responsive와 공통 component 방향은 [`../design/shop-ux-strategy.md`](../design/shop-ux-strategy.md)를 기준으로 하며 이 route는 아직 구현되지 않은 `Proposed` 구조다.

### NestJS

**Proposed:** 서비스 규칙과 신뢰 경계를 담당하는 API다. 입력 검증, 상품·주문·결제 규칙 적용, PostgreSQL 접근과 Toss Payments 서버 승인 요청을 수행한다. 브라우저가 보낸 금액이나 결제 결과를 그대로 신뢰하지 않는다.

### PostgreSQL

**Proposed:** 상품, 주문, 결제 등 지속적으로 보존해야 할 데이터를 저장한다. 최종 table, relation, constraint, transaction과 migration 방식은 `TBD`다.

### Toss Payments

**Proposed:** 테스트 환경에서 결제 인증과 서버 승인을 학습하기 위한 외부 서비스다. 브라우저 결제창과 서버 승인 단계의 역할이 다르며, secret key를 사용하는 통신은 NestJS의 서버 경계 안에서만 수행해야 한다. 실제 연동 시 공식 문서를 다시 확인한다.

### Docker와 Vercel

- **Docker — Proposed:** 로컬 PostgreSQL 등 재현 가능한 개발 의존성을 실행하는 용도로 검토한다. Docker Compose와 서비스 범위는 아직 만들지 않았다.
- **Vercel — Proposed:** 우선 Next.js 배포 대상으로 고려한다. NestJS API와 PostgreSQL을 어디에 배포할지는 `TBD`이며 별도 ADR이 필요할 수 있다.

## 요청이 통과하는 경로

현재 구현된 경로는 `Browser → Next.js app/page.tsx → Browser`다. 개발 서버는 `/` 요청을 `apps/web/app/page.tsx`의 React 컴포넌트와 연결한다.

상품 조회의 초기 후보 흐름은 `Browser → Next.js → NestJS → PostgreSQL → NestJS → Next.js → Browser`다. 결제는 여기에 Toss Payments 인증과 NestJS의 서버 승인 요청이 추가된다. 캐싱, 직접 서버 렌더링 데이터 접근 또는 API 경계 변경은 아직 확정하지 않았다.

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
- `apps/api/` — **Proposed:** NestJS API 애플리케이션
- `packages/contracts/` — **Proposed:** web과 API가 합의해야 하는 타입 또는 schema의 공유 위치. 무엇을 공유할지는 `TBD`다.
- `packages/database/` — **Proposed:** schema, migration 또는 DB 접근 코드의 후보 위치. ORM을 선택하기 전에는 생성하지 않는다.
- `packages/config/` — **Proposed:** TypeScript, lint 등 반복 설정의 공유 후보 위치. 모든 설정을 무조건 공통화하지 않는다.

`apps/*`와 `packages/*`를 pnpm workspace 범위로 사용하기로 ADR-001에서 결정했다. 현재는 필요한 `apps/web`만 생성했으며 나머지 디렉터리는 각 구현 task에서 책임을 확정한 뒤 만든다.

## 주요 TBD

- Next.js와 NestJS가 사용할 API 형식과 계약 생성 방식
- ORM 또는 SQL 접근 방식
- cart 저장 위치와 customer 식별 방식
- 주문·결제 transaction 및 idempotency 경계
- 로컬 Docker 구성과 개발용 seed 전략
- web, API와 PostgreSQL의 배포 topology
- logging, monitoring, error response와 보안 정책
