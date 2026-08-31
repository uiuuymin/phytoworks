# Project Overview

## 프로젝트 정체성

- **프로젝트명:** PhytoWorks Shop
- **목적:** 웹서비스 개발 기술 스택과 AI-assisted development workflow 학습
- **결과물:** PhytoWorks의 연구·육종 장비와 분석 서비스 맥락을 반영한 학습용 B2B 데모 쇼핑몰
- **우선순위:** 결과물의 완성도나 출시 속도보다 기술을 이해하고, 선택 이유·검증 결과·시행착오를 기록하는 과정을 우선한다.

## 회사 맥락과 Demo 경계

- **Confirmed:** 공식 사이트는 NITRO 생육·표현형 분석 시스템, 환경 제어, 멀티모달 이미징, 클라우드 모니터링과 AI 분석을 소개한다.
- **Confirmed:** 공식 사이트의 구매 전환은 온라인 결제가 아니라 카탈로그 다운로드와 문의 중심이다.
- **Proposed:** 쇼핑몰 Product는 생육 시스템, 이미징 모듈, 환경·관수 옵션과 분석 서비스로 구성한다.
- **Demo:** 구현을 위해 추가하는 가격, 재고와 직접 구매 가능 여부는 실제 PhytoWorks 정책이 아니다.

근거와 미확정 범위는 [`company-reference.md`](./company-reference.md)를 기준으로 한다.

## 목표 기술 스택

아래 항목은 프로젝트가 학습 대상으로 정한 **목표 기술**과 현재 구현 상태다. 설치되지 않은 항목의 버전과 세부 구성은 관련 구현 task에서 확인하고 기록해야 한다.

| 영역 | 목표 기술 | 현재 상태 |
| --- | --- | --- |
| 언어 | TypeScript 7 | Current — 7.0.2 |
| 웹 | Next.js 16 | Current — 16.3.3, `apps/web` |
| API | NestJS | Current — 12.0.1, `apps/api` |
| monorepo | pnpm workspace | Current — pnpm 11.24.0 |
| 데이터베이스 | PostgreSQL | Proposed — 미설치·미설계 |
| 개발 환경 | Docker | Proposed — 미구성 |
| 결제 | Toss Payments 테스트 연동 | Proposed — 미연동 |
| 배포 | Vercel | Proposed — 미설정 |
| 작업 방식 | Git, Git worktree, Orca, Codex, LLM Wiki | Current — bootstrap worktree에서 적용 중 |

## 구현 예정 기능

- 상품 목록
- 상품 상세
- 장바구니
- 주문 생성
- 주문 상태 확인
- Toss Payments 테스트 결제
- 결제 성공 처리
- 결제 실패 처리
- 주문·결제 상태 확인 화면
- Vercel Preview 및 배포

기능 구현 순서와 세부 완료 조건은 각 task에서 정한다.

## 목표 Shop 화면 구조

**Proposed:** 최소 사용자 흐름은 `Home → Products → Product Detail → Cart → Checkout → Payment result → Order status`다. 모든 후보 화면을 넣지 않고 다음 경계를 사용한다.

- Home, Product List와 Product Detail은 기능 개발 전에 UI foundation과 함께 먼저 구축한다.
- Cart의 첫 단계는 Product ID와 수량만 저장하는 browser 기능으로 구현한다. 가격·재고·Customer와 주문 신뢰 경계는 NestJS·PostgreSQL을 도입하는 후속 vertical slice에서 다시 검증한다.
- Wishlist와 Orders 목록은 Customer 식별 방식이 정해질 때까지 미룬다.
- 인증·권한이 필요한 Admin은 현재 범위에서 제외한다.
- `QUOTE_REQUIRED` Product는 공식 문의 경로로 보내고 `DIRECT_PURCHASE` Demo Product만 Cart로 연결한다.

Current IA, 전체 Proposed route, responsive와 interaction 기준은 [`../design/shop-ux-strategy.md`](../design/shop-ux-strategy.md)를 원본으로 한다.

## 프로젝트 범위

이 프로젝트는 학습용 demo다. 실제 고객을 대상으로 한 운영용 결제, 실물 장비 배송·설치·정산, 운영 수준의 모든 B2B 판매 기능과 공식 사이트의 그대로 된 복제는 현재 범위에 포함하지 않는다. 표시 가격과 판매 조건은 Demo임을 밝히고, 참고 이미지나 자료를 사용할 경우 출처와 사용 가능 여부를 기록한다.

장기적으로는 Next.js와 NestJS의 연결, PostgreSQL의 주문·결제 상태 보존, Toss Payments 테스트 흐름, Vercel에서 확인 가능한 결과와 주요 결정·시행착오 기록을 함께 갖춘 상태를 목표로 한다.

## 비기능 목표

- **학습 가능성:** 초보 개발자가 요청과 데이터가 시스템을 통과하는 경로를 설명할 수 있어야 한다.
- **추적 가능성:** 중요한 선택, 변경, 검증과 실패 원인을 Git 및 Wiki에서 다시 찾을 수 있어야 한다.
- **타입 안정성:** TypeScript의 타입 검사를 우회하기보다 경계를 명확히 표현한다.
- **보안 기본기:** 실제 credential을 저장소나 브라우저 코드에 넣지 않는다.
- **검증 가능성:** 기능마다 자동 검증과 필요한 수동 확인 방법을 기록한다.
- **작은 변경:** 하나의 task와 worktree가 하나의 명확한 목표를 다루도록 한다.
- **Responsive baseline — Proposed:** 각 화면은 Mobile, Tablet과 Desktop에서 정보 구조와 interaction을 함께 검증한다.
- **접근성 baseline — Proposed:** semantic HTML, keyboard, visible focus, 상태 feedback과 reduced motion을 기능별 완료 조건에 포함한다.

구체적인 성능 budget, 접근성 적합 수준, 지원 browser 범위, 가용성과 운영 수준의 보안 목표는 `TBD`다.

## 현재 프로젝트 단계

현재는 **Stage 7: Product read API** 단계다. 다음 항목이 구현되었다.

- pnpm workspace 루트와 단일 lockfile
- Next.js 16 App Router 기반 `apps/web`
- web과 API의 TypeScript 7 typecheck 및 공통 Biome lint
- web과 API를 일관되게 실행하는 루트의 `dev`, `lint`, `typecheck`, `test`, `build` 명령
- NestJS 12와 ESM 기반의 `apps/api`
- application 기동과 HTTP 응답 가능 여부만 나타내는 `GET /health`
- API 내부 정적 fixture를 읽는 `ProductModule`과 Product 목록·상세 GET endpoint
- Product read model, `QUOTE_REQUIRED`·`DIRECT_PURCHASE` mapping과 없는 Product의 404 응답
- API controller unit test와 실제 Nest application을 구성하는 Vitest·Supertest endpoint test
- 브라우저에서 확인 가능한 `/` 학습 화면
- Native CSS semantic token, dark Demo palette와 system font
- Global typography, responsive container, visible focus와 reduced motion 기준
- 공통 SiteHeader, PhytoWorks 홈 link, Products navigation, Login link, Cart utility, Cart 총 수량과 mobile disclosure
- 동작과 내부 이동의 의미를 분리한 Button·LinkButton
- Shop 진입 역할의 Home과 Product 비교 역할의 `/products`
- 정적 Catalog data, ProductCard와 1열·2열·3열 responsive ProductGrid
- ProductCard의 상세 진입 link와 `/products/[productId]` 정적 상세 route 세 건
- Product별 카탈로그 이미지, 요약·주요 기능과 판매 방식 panel
- `QUOTE_REQUIRED`의 공식 문의 link와 `DIRECT_PURCHASE`의 실제 Add to Cart CTA
- Product 전용 not-found 화면과 Catalog 복귀 경로
- `/cart`의 hydration, empty state, Product별 수량 변경, 제거와 한 건 Undo
- 같은 Product의 한 줄 병합과 Product ID·수량만 저장하는 version 1 localStorage schema
- 손상된 Cart data, 존재하지 않는 ID와 `QUOTE_REQUIRED` 저장 항목의 안전한 정리
- localStorage 저장 실패 시 현재 tab의 memory state 유지와 사용자 상태 안내
- 가격과 Checkout이 없는 단계의 Product 및 수량 관리 경계
- Component·route별 CSS Modules와 skip link

현재 `/`는 Shop을 간결하게 소개하고 `/products`로 안내한다. `/login`은 인증 API 연결 전 Email과 Password 입력 및 `/signup` 진입 링크를 제공하며, `/signup`은 계정 생성 API 연결 전 Name, Email과 Password 입력 및 `/login` 진입 링크를 제공한다. 두 화면의 패널과 진입 링크는 가운데 정렬한다. `/products`는 정적 Product 세 건을 비교 가능한 card로 렌더링하고 각 `/products/[productId]` 상세 화면으로 연결한다. NITRO는 기존 공식 문의 경로를 유지하며, 두 `DIRECT_PURCHASE` Product는 실제 `장바구니 담기` button을 제공한다. `/cart`는 Product와 수량을 관리하고 같은 Product를 한 줄로 합치며, route 이동과 새로고침 뒤 browser Cart를 복원한다. 학습용 Shop이라는 표시는 공통 SiteHeader의 `Shop Demo` label로 한정하며 각 route에는 별도 해설 notice를 두지 않는다. 가격, 재고, 합계, Checkout, Payment result와 Order status는 아직 구현되지 않았다.

NestJS API에는 `HealthModule`과 sibling인 `ProductModule`이 있으며, Product API는 API 내부 정적 fixture를 읽는다. web은 아직 API를 호출하지 않는다. Product 화면 요청은 계속 `Browser → Next.js Server Component → 정적 Product data → Browser` 경로를 사용하며 Cart 조작은 `Browser event → CartProvider reducer → browser memory → localStorage` 안에서만 처리한다. API Product 요청은 `HTTP client → NestJS HTTP adapter → ProductController → ProductService → API static fixture → JSON response` 경로를 사용하고, health 요청은 기존 `HealthController` 경계를 사용한다. PostgreSQL, Docker, Toss Payments와 Vercel 설정은 아직 존재하지 않는다.

## 아직 결정되지 않은 사항

- `TBD` — Next.js, TypeScript와 pnpm의 장기 업데이트 정책
- `TBD` — ORM 또는 데이터 접근 방법과 migration 전략
- `TBD` — API 방식과 web/API 간 계약 관리 방법
- `TBD` — 고객 식별 및 인증 범위
- `TBD` — 서버 Cart의 소유 방식, Customer 식별과 현재 localStorage Cart의 병합·이관 정책
- `TBD` — 주문과 결제의 최종 상태 모델 및 취소·환불 범위
- `TBD` — 재고 차감·예약 시점과 동시성 처리
- `TBD` — Next.js test runner와 domain·integration test 데이터 전략
- `TBD` — Docker가 담당할 로컬 서비스 범위
- `TBD` — NestJS API와 PostgreSQL의 실제 배포 위치 및 Vercel 연결 구조
