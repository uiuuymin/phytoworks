# Task: Product Detail 구조 선택과 구현

**Status:** 구현 완료

## Goal

PhytoWorks Shop의 정적 Product 세 건을 각각 확인할 수 있는 `/products/[productId]` 상세 화면을 구현하기 전에 page와 component의 책임, 정적 data 계약, media placeholder, 판매 방식별 표현, responsive layout과 접근성 기준을 확정한다. 사용자 승인 후에는 ProductCard에서 상세 화면으로 이동하는 흐름과 정상 Product 및 존재하지 않는 Product 처리를 이 task의 범위 안에서만 구현한다.

이번 task의 완료 조건은 다음과 같다.

- ProductCard에서 각 Product의 유효한 `/products/[productId]` 상세 route로 이동할 수 있다.
- `nitro`, `thermal-imaging`과 `chlorophyll-fluorescence`의 정적 상세 화면을 제공한다.
- 세 상세 route는 정적 Product data를 기준으로 build 시점에 생성한다.
- 존재하지 않는 `productId`는 빈 화면이나 일반 오류가 아니라 Product 전용 not-found 화면으로 처리한다.
- 실제 제품 이미지의 사용 권한이 확인되기 전까지, 이미지처럼 오인되거나 대체 텍스트를 꾸며 내지 않는 자체 placeholder를 사용한다.
- 공식 자료에서 확인한 제품 맥락과 학습용 Shop에서 제안한 Product 및 판매 방식을 내부 기록에서 명확하게 구분한다.
- 가격, 재고, 배송, 납기, 할인, 결제 조건과 확인되지 않은 수치 사양을 화면이나 data에 추가하지 않는다.
- `QUOTE_REQUIRED`에는 유효한 공식 문의 행동을 제공하고, `DIRECT_PURCHASE`에는 Cart가 없는 현재 단계에서 동작하지 않는 구매 CTA를 표시하지 않는다.
- 375px, 768px와 1280px에서 상세 정보의 읽기 순서, media와 정보의 배치, CTA 너비와 horizontal overflow를 검증한다.
- heading, landmark, link, button, keyboard, visible focus와 최소 44px 조작 영역 기준을 지킨다.
- lint, typecheck와 production build가 통과하고 정상 Product 세 건 및 존재하지 않는 Product를 browser에서 확인한다.
- Home, Catalog와 Product Detail 어디에도 프로젝트 성격을 설명하는 별도 banner, Demo boundary 또는 장문의 공식 정보 안내를 추가하지 않는다. 학습용 Shop 표시는 기존 SiteHeader의 `Shop Demo` label로 충분하다.

## Context

현재 `/products`는 정적 Product 세 건을 ProductGrid와 ProductCard로 보여 주지만, card에는 link나 CTA가 없다. 사용자는 category, 이름, 짧은 설명과 구매 방법을 비교한 뒤에도 제품을 더 알아보거나 다음 행동을 선택할 수 없다. Product Detail은 Proposed IA에 포함되어 있지만 route, 상세 data, media 정책과 판매 방식별 행동은 아직 구현되지 않았다.

현재 Product data는 API나 DB가 아닌 `apps/web/data/products.ts`의 임시 정적 UI data다. NITRO는 공식 사이트에서 확인한 제품이지만 온라인 판매 조건은 확인되지 않았다. Thermal Imaging과 Chlorophyll Fluorescence는 공식 NITRO의 이미징 항목으로 확인되지만, 독립 판매 Product라는 경계와 `DIRECT_PURCHASE` 분류는 학습용 Shop의 Proposed 또는 Demo 설정이다.

이번 화면의 요청 경로는 계속 `Browser → Next.js Server Component → 정적 Product data → Browser`다. NestJS, PostgreSQL, fetch와 client-side 구매 state는 사용하지 않는다. Product Detail의 정적 정보와 layout은 Server Component로 유지하고, browser state가 필요한 기능은 이번 범위에 추가하지 않는다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/context/company-reference.md`
- `docs/design/shop-ux-strategy.md`
- `docs/domain/product.md`
- `docs/domain/cart.md`
- `docs/adr/001-use-pnpm-workspace.md`
- `tasks/003-ui-foundation.md`
- `tasks/004-shop-catalog.md`
- PhytoWorks 한국어 홈페이지: <https://phyto-works.com/ko>
- NITRO 공식 제품 페이지: <https://phyto-works.com/ko/nitro>
- Next.js Dynamic Route Segments: <https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes>
- Next.js `generateStaticParams`: <https://nextjs.org/docs/app/api-reference/functions/generate-static-params>
- Next.js Error Handling과 `notFound`: <https://nextjs.org/docs/app/getting-started/error-handling>
- Next.js `Link`: <https://nextjs.org/docs/app/api-reference/components/link>
- WCAG 2.2 Link Purpose: <https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html>
- WCAG 2.2 Target Size Minimum: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

공식 PhytoWorks 홈페이지와 NITRO 페이지는 2026-08-30에 다시 확인했다. NITRO의 전반적인 기능과 공식 문의 전환은 확인했지만, 현재 내부 Product 문서에 반영되지 않은 수치 사양을 이번 정적 상세 data에 가져오지는 않는다. 정확한 사양표가 필요해지는 후속 작업에서는 출처, 확인 날짜와 제품 구성 범위를 다시 검증한다.

## Current State

- 현재 branch는 `uiuuymin/product-detail`이며 HEAD는 기준 commit `694b761 Shop Catalog 탐색 화면 구현`과 일치한다.
- 계획 작성 전 `git status --short --branch`에서 repository 변경 사항이 없는 깨끗한 worktree를 확인했다.
- 직접 작성한 route는 `/`와 `/products`뿐이다. Next.js가 생성하는 `/_not-found`와 `/_global-error`는 프로젝트가 설계한 상세 화면이 아니다.
- `apps/web`은 Next.js 16.3.3 App Router, React 19.2.8과 TypeScript 7.0.2를 사용한다.
- `products.ts`에는 `id`, `name`, `category`, `description`과 `purchaseMode`만 있는 `CatalogProduct` 세 건이 있다.
- 현재 Product ID는 `nitro`, `thermal-imaging`과 `chlorophyll-fluorescence`다. 이 ID는 이번 정적 UI route의 slug로 사용하지만 최종 DB Product 식별자 형식을 확정하지 않는다.
- ProductCard는 `<article>` 안에 category, `h3`, 설명과 구매 방법을 표시한다. 상세 link, 실제 구매 동작과 media는 없다.
- ProductGrid는 ProductCard를 semantic list로 렌더링하고 375px, 768px와 1280px에서 각각 1열, 2열, 3열을 사용한다.
- SiteHeader는 정확히 `/products`일 때만 Products navigation에 `aria-current="page"`를 표시한다. Product Detail 하위 route에서도 Products 영역을 현재 위치로 표시하도록 조건을 보완해야 한다.
- `globals.css`에는 640px과 1024px breakpoint, 1280px container, semantic color와 spacing token, visible focus와 reduced motion 기준이 있다.
- `Button`은 현재 문서에서 실행하는 동작, `LinkButton`은 내부 route 이동을 담당한다. 외부 링크를 Button이나 Next.js Link로 위장하지 않는다는 기존 semantic 경계가 있다.
- 현재 lint 명령은 이미 `app`, `components`, `data`와 `next.config.ts`를 검사하므로 새 source 디렉터리를 위해 package script를 바꿀 필요가 없다.
- 실제 PhytoWorks logo와 Product image의 repository 재사용 권한은 확인되지 않았다.
- Cart, Cart badge, Add to Cart state, 가격, 재고, API와 DB는 아직 없다.

## Information Status and Content Policy

화면은 일반적인 실제 쇼핑몰의 Product Detail처럼 간결하게 구성하되, 내부 data와 task 기록에서는 다음 상태를 구분한다.

| 정보 | 내부 상태 | 이번 화면에서 사용하는 기준 |
| --- | --- | --- |
| NITRO 이름과 생육·표현형 분석 플랫폼 맥락 | Confirmed | 공식 사이트에서 확인한 범위를 짧게 요약한다. |
| 환경 제어, 비파괴 연속 관찰, 멀티모달 이미징과 AI 기반 분석 | Confirmed | 정확한 의미를 유지해 주요 기능으로 표현한다. |
| Thermal과 Chlorophyll Fluorescence 이미징 기능 | Confirmed | NITRO의 이미징 맥락에서 확인한 기능만 표현한다. |
| Thermal과 Chlorophyll Fluorescence를 독립 Product로 보는 경계 | Proposed | 학습용 Shop의 정적 Product 구성으로만 취급한다. |
| `nitro`, `thermal-imaging`, `chlorophyll-fluorescence` URL slug | Proposed UI contract | 이번 정적 route에서만 사용하며 최종 DB ID로 확정하지 않는다. |
| NITRO의 `QUOTE_REQUIRED` 분류 | Proposed | 공식 사이트가 문의 중심이라는 근거에 맞춘 현재 Shop 모델이다. |
| 두 이미징 모듈의 `DIRECT_PURCHASE` 분류 | Demo | Toss Payments 학습을 위한 판매 방식이며 실제 PhytoWorks 정책으로 표현하지 않는다. |
| media label과 자체 placeholder | Demo UI | 제품 이미지가 아니며 제품 형태, 크기나 구성을 암시하지 않는다. |
| 가격, 재고, 배송, 납기, 할인, 세금과 결제 조건 | Not Confirmed | data와 화면에서 모두 제외한다. |

정적 상세 data에는 Product 이름, category, 요약 설명, 확인된 범위의 주요 기능, 판매 방식과 placeholder 식별 문구만 둔다. 수치 사양, 호환성, 구성품, 보증, 설치, 유지보수와 판매 조건은 공식 근거와 적용 대상이 별도로 확인될 때까지 추가하지 않는다. 화면에는 `Confirmed`, `Proposed`와 `Demo`를 해설하는 장문의 안내를 넣지 않고, 이 구분은 이 task와 관련 context 및 domain 문서에서 관리한다.

## Options Considered

### Product URL과 존재하지 않는 Product 처리

#### 1. Product마다 고정 route 파일을 세 개 만든다

- 장점: 각 page가 단순하고 정적 생성 여부가 명확하다.
- 단점: 동일한 layout, metadata와 not-found 처리가 세 파일에 반복된다. Product가 추가될 때 route 파일도 계속 늘어난다.

#### 2. `/products/[productId]` 하나에서 정적 data를 조회하고 `generateStaticParams`를 사용한다

- 장점: URL 구조와 page 책임이 하나로 모이고 Product data의 ID가 route 계약이 된다. 현재 세 ID를 build 시점에 생성할 수 있으며 Product가 늘어도 같은 page를 재사용한다.
- 단점: `params`가 Promise인 Next.js 16 계약, static params와 not-found 처리를 정확하게 구현해야 한다.

#### 3. `/products/detail?id=...` query string을 사용한다

- 장점: route 파일을 새 dynamic segment로 만들지 않아도 된다.
- 단점: Product의 고유 URL 구조가 약하고 Proposed IA의 `/products/[productId]`와 맞지 않는다. query가 없거나 잘못된 경우의 계약도 불명확하다.

**선택:** Option 2를 선택한다. `generateStaticParams`가 세 Product ID를 반환해 정상 Product를 build 시점에 생성한다. 알려지지 않은 ID도 page에서 정적 data를 조회한 뒤 `notFound()`를 호출하여 Product 전용 not-found 화면으로 보낸다. `app/products/[productId]/not-found.tsx`는 Product를 찾을 수 없다는 명확한 heading과 유효한 `/products` 복귀 link만 제공한다.

### ProductCard에서 상세 화면으로 이동하는 방식

#### 1. ProductCard 전체를 하나의 link로 만든다

- 장점: pointer 사용자가 넓은 영역을 클릭할 수 있다.
- 단점: 미래에 구매 CTA나 다른 link가 추가되면 중첩 interactive element 문제가 생긴다. Card의 모든 내용이 link 이름이 되어 screen reader에서 장황하게 들릴 수 있다.

#### 2. Product 이름만 상세 link로 만든다

- 장점: 일반적인 Catalog 패턴이며 heading과 목적지가 직접 연결된다. 추가 markup이 적다.
- 단점: 이미지가 없는 현재 card에서는 link가 눈에 잘 띄지 않으면 상세 진입을 놓칠 수 있다.

#### 3. Card 하단에 `상세 보기` link를 하나 둔다

- 장점: 목적과 조작 영역을 명확하게 표시하며 미래의 판매 CTA와 분리하기 쉽다. Card 전체를 interactive element로 만들지 않는다.
- 단점: Product 이름 자체는 클릭할 수 없으므로 pointer 이동 거리가 조금 늘어난다.

**선택:** Option 3을 선택한다. ProductCard 하단의 구매 방법 정보와 구분되는 위치에 `상세 보기` 내부 link를 한 개 제공한다. 같은 목적지로 가는 이름 link를 중복하지 않는다. Link는 최소 44px 높이와 전역 visible focus를 유지하며 card의 `<article>`과 ProductGrid의 list semantics는 그대로 둔다.

### 정적 상세 data의 구성

#### 1. Catalog 배열과 별도의 Product Detail 배열을 만든다

- 장점: Card가 필요한 data와 상세 화면 data를 물리적으로 구분할 수 있다.
- 단점: ID, 이름, category, 설명과 판매 방식이 중복되고 두 배열이 서로 달라질 위험이 있다.

#### 2. 현재 Product object에 `details`를 추가하고 하나의 정적 배열을 사용한다

- 장점: 한 Product의 목록과 상세 정보가 같은 object에 있어 route 조회와 정합성 검토가 단순하다. API와 DB 없이도 단일 정적 source를 유지한다.
- 단점: ProductCard가 사용하지 않는 상세 field도 포함한 object를 prop으로 받는다. 이 type이 최종 domain entity가 아니라는 경계를 계속 밝혀야 한다.

#### 3. Product ID별 상세 data를 route 파일 안에 작성한다

- 장점: page와 문구를 한 파일에서 읽을 수 있다.
- 단점: route가 data source 역할까지 맡고 Product 추가 및 metadata 생성 시 같은 정보를 반복하게 된다.

**선택:** Option 2를 선택한다. 기존 정적 Product object에 상세 요약, 주요 기능 목록과 placeholder label을 중첩된 `details`로 추가한다. `getProductById`와 같은 작은 조회 함수를 같은 data module에 두어 page가 배열 검색 방법을 반복하지 않게 한다. 이 구조는 정적 UI read model이며 API response, DB entity 또는 신뢰 가능한 판매 source가 아니다.

### Media와 placeholder 정책

#### 1. 공식 사이트의 Product image를 repository에 복사한다

- 장점: 실제 장비 형태를 가장 직접적으로 보여 줄 수 있다.
- 단점: 공개된 웹 이미지라는 사실만으로 재사용 권한이 확인되지 않는다. 출처와 라이선스가 불명확한 asset을 저장소에 포함하게 된다.

#### 2. 외부 공식 image URL을 Next.js Image로 직접 표시한다

- 장점: repository에 파일을 복사하지 않고 실제 이미지를 보여 줄 수 있다.
- 단점: hotlink, remote image 허용 설정, 외부 변경과 권리 문제가 남는다. 공식 사이트 장애나 URL 변경이 Shop 상세 화면에 직접 영향을 준다.

#### 3. Product별 식별 문구와 CSS만 사용하는 자체 placeholder를 만든다

- 장점: 권한 문제가 없고 layout의 media 비율과 responsive 동작을 먼저 검증할 수 있다. 실제 이미지처럼 잘못된 사양이나 형태를 암시하지 않는다.
- 단점: 사용자가 실제 장비 외형을 파악할 수 없으며 Product Detail의 정보량이 제한된다.

**선택:** Option 3을 선택한다. `ProductMediaPlaceholder`는 CSS surface, Product category와 짧은 식별 문구만 사용한다. 실제 이미지가 아니므로 `role="img"`와 꾸며 낸 `alt`를 붙이지 않고, 상세 heading과 중복되는 placeholder 내용은 `aria-hidden="true"`로 보조 기술에서 제외한다. `이미지 준비 중`이라는 상태 문구도 표시하지 않는다. 승인된 asset이 생기면 별도 task에서 source URL, 권리 상태와 의미 있는 alt text를 검토한 뒤 이 component 내부를 실제 media로 교체한다.

### 판매 방식별 정보 구조와 CTA

#### `QUOTE_REQUIRED` 후보

1. 자체 견적 문의 form을 만든다.
   - 장점: Shop 안에서 문의를 마칠 수 있다.
   - 단점: 개인정보 수집, 전송, 저장, 동의와 응답 운영 정책이 없으므로 현재 범위를 크게 넘는다.
2. 공식 PhytoWorks 문의 페이지로 이동하는 외부 link를 제공한다.
   - 장점: 현재 유효한 행동을 제공하며 자체 form과 개인정보 처리를 만들지 않는다.
   - 단점: Shop 밖으로 이동하며 외부 페이지의 URL과 동작이 바뀔 수 있다.
3. `견적 문의`를 text label로만 표시한다.
   - 장점: 외부 의존성이 없다.
   - 단점: Catalog와 같은 정보 표시만 반복하고 상세 화면에서 실제 다음 행동을 제공하지 못한다.

**선택:** Option 2를 선택한다. `ProductPurchasePanel`은 `구매 방법`, `견적 문의`와 짧은 설명을 보여 주고 `PhytoWorks에 견적 문의` 외부 link를 제공한다. 2026-08-30에 NITRO 공식 페이지의 문의 link가 연결한 `https://phyto-works.com/ko?source=nitro`를 사용한다. 새 창을 강제로 열지 않으며 Next.js 내부 Link가 아닌 native `<a>`를 사용한다.

#### `DIRECT_PURCHASE` 후보

1. `장바구니 담기` button을 disabled 상태로 표시한다.
   - 장점: 미래 구매 흐름의 위치를 미리 보여 줄 수 있다.
   - 단점: 동작하지 않는 구매 button과 준비 중 상태를 노출하므로 사용자 요청에 어긋난다.
2. 존재하지 않는 `/cart`로 미리 연결한다.
   - 장점: 미래 URL 계약을 화면에서 먼저 사용할 수 있다.
   - 단점: 사용자를 존재하지 않는 route로 보내며 정상적인 쇼핑몰 행동이 아니다.
3. 공식 문의 link를 직접 구매 Product에도 사용한다.
   - 장점: 유효한 외부 행동은 제공할 수 있다.
   - 단점: `DIRECT_PURCHASE`와 `QUOTE_REQUIRED`의 차이를 흐리고 직접 구매 Product를 견적 상품처럼 바꾼다.
4. 구매 방법만 `온라인 구매`로 표시하고 구매 CTA를 렌더링하지 않는다.
   - 장점: 현재 data 계약을 보여 주되 제공할 수 없는 동작을 약속하지 않는다. Cart task에서 실제 state와 API 경계가 생길 때 올바른 button을 추가할 수 있다.
   - 단점: 이번 Product Detail만으로 직접 구매를 완료하거나 시작할 수 없다.

**선택:** Option 4를 선택한다. `DIRECT_PURCHASE`의 `ProductPurchasePanel`은 `구매 방법`과 `온라인 구매`라는 정보만 표시한다. 화면에는 disabled button, `준비 중` 안내, `/cart` link와 견적 문의 대체 CTA를 넣지 않는다. 사용자는 breadcrumb와 주요 navigation으로 Catalog에 돌아갈 수 있다. 직접 구매 행동이 없는 한계는 사용자 화면의 해설 영역이 아니라 이 task의 Follow-up에 기록한다.

### Page와 component 경계

#### 1. Dynamic page 파일 하나에 모든 markup과 판매 방식 분기를 작성한다

- 장점: 파일 수가 가장 적다.
- 단점: route 처리, 상세 layout, placeholder 정책과 판매 방식 분기가 한 파일에 섞인다. 실제 image와 Cart 행동을 추가할 때 page가 빠르게 복잡해진다.

#### 2. Page는 route와 조합을 맡고 media 및 판매 panel만 전용 component로 분리한다

- 장점: 현재 필요한 책임만 분리한다. 정적 설명과 주요 기능 markup은 한 route에서 읽을 수 있고, asset과 Cart가 추가될 때 변경될 경계만 component로 격리된다.
- 단점: 현재는 간단한 placeholder와 panel에도 파일이 추가된다.

#### 3. ProductDetail, ProductSummary, ProductFeatureList와 Badge까지 모두 component로 분리한다

- 장점: 작은 부분별 교체와 재사용 가능성이 높다.
- 단점: 한 route에서만 사용하는 정적 markup까지 추상화하여 파일 이동과 prop 전달이 늘어난다.

**선택:** Option 2를 선택한다.

- `app/products/[productId]/page.tsx`는 params 해석, Product 조회, metadata, not-found 호출과 전체 정보 순서를 담당한다.
- `ProductMediaPlaceholder`는 권한 확인 전 media의 시각 영역과 접근성 정책을 담당한다.
- `ProductPurchasePanel`은 `purchaseMode`에 따른 정보와 유효한 외부 CTA 유무를 담당한다.
- Product 설명과 주요 기능 목록은 현재 한 route에서만 사용하므로 page markup에 둔다.
- ProductCard는 상세 route 진입 link만 추가하고 상세 data 표현이나 구매 행동을 소유하지 않는다.
- 별도 `ProductDetail`, `PurchaseModeBadge`, gallery, 범용 Card와 범용 external-link component는 만들지 않는다.

### CSS Module 파일 구성

#### 1. Product Detail style을 기존 `/products/page.module.css`에 추가한다

- 장점: Products 관련 route의 CSS가 한 파일에 모인다.
- 단점: Catalog와 동적 상세 route의 selector 소유권이 섞이며 파일 위치와 사용 route가 일치하지 않는다.

#### 2. Route와 전용 component마다 CSS Module을 나란히 둔다

- 장점: layout, placeholder, 판매 panel과 not-found 표현의 책임을 파일 위치에서 확인할 수 있다. 기존 Catalog task의 component별 CSS 원칙을 유지한다.
- 단점: 작은 stylesheet가 여러 개 생긴다.

#### 3. 모든 새 style을 `globals.css`에 추가한다

- 장점: import가 줄어든다.
- 단점: 전역 foundation과 route별 style이 섞이며 `tasks/003-ui-foundation.md`의 결정에 어긋난다.

**선택:** Option 2를 선택한다.

- `app/products/[productId]/page.module.css`는 breadcrumb, page padding, detail grid, 설명과 주요 기능 section을 소유한다.
- `app/products/[productId]/not-found.module.css`는 Product 전용 not-found layout과 복귀 link 너비를 소유한다.
- `ProductMediaPlaceholder.module.css`는 aspect ratio, surface와 장식만 소유한다.
- `ProductPurchasePanel.module.css`는 구매 정보 panel과 견적 외부 link를 소유한다.
- `ProductCard.module.css`는 상세 link를 포함한 card 내부 배치만 확장한다.
- token, reset, global focus, `.container`와 640px 및 1024px breakpoint는 기존 `globals.css`를 그대로 사용한다.

## Decision

다음 구조를 구현안으로 제안한다.

```text
apps/web/
├─ app/
│  └─ products/
│     ├─ page.tsx
│     ├─ page.module.css
│     └─ [productId]/
│        ├─ page.tsx
│        ├─ page.module.css
│        ├─ not-found.tsx
│        └─ not-found.module.css
├─ components/
│  ├─ commerce/
│  │  ├─ ProductCard.tsx
│  │  ├─ ProductCard.module.css
│  │  ├─ ProductGrid.tsx
│  │  ├─ ProductGrid.module.css
│  │  ├─ ProductMediaPlaceholder.tsx
│  │  ├─ ProductMediaPlaceholder.module.css
│  │  ├─ ProductPurchasePanel.tsx
│  │  └─ ProductPurchasePanel.module.css
│  └─ layout/
│     └─ SiteHeader.tsx
└─ data/
   └─ products.ts
```

- Product Detail route와 새 commerce component는 모두 Server Component로 유지한다.
- 세 Product object에 상세 요약, 주요 기능과 placeholder label을 추가하고 같은 배열에서 Catalog와 Detail을 렌더링한다.
- 세 ID는 `generateStaticParams`로 build 시점에 생성하고 그 밖의 ID는 Product 전용 not-found 화면으로 보낸다.
- ProductCard에는 목적지가 한 번만 나타나는 `상세 보기` link를 제공한다.
- Placeholder는 실제 image semantics를 만들지 않고 layout의 media 역할만 표현한다.
- `QUOTE_REQUIRED`만 검증된 공식 문의 외부 link를 제공한다.
- `DIRECT_PURCHASE`는 현재 구매 방법 정보만 보여 주며 Cart가 생기기 전에는 구매 CTA를 제공하지 않는다.
- SiteHeader는 `/products`와 `/products/*`에서 Products navigation을 현재 영역으로 표시한다.
- 가격, 재고와 직접 구매 행동을 만들지 않으므로 Product domain, Cart domain과 API 계약을 확정하지 않는다.
- 이 결정은 현재 정적 UI 내부에서 쉽게 변경할 수 있으며 장기 시스템 경계를 확정하지 않으므로 새 ADR은 만들지 않는다.

## Responsive Layout

Mobile-first로 같은 DOM 순서와 같은 정보를 사용하며, 기존 40rem과 64rem breakpoint만 재사용한다.

| 검증 viewport | Product Detail layout | Media와 정보 | 구매 영역 |
| --- | --- | --- | --- |
| 375px | breadcrumb 다음에 한 열로 media, 기본 정보, 구매 방법과 주요 기능을 배치한다. | Placeholder는 content 폭을 채우고 긴 영문 Product 이름과 기능 문구가 줄바꿈된다. | 견적 외부 link는 사용 가능한 폭을 채우며 최소 44px 높이를 유지한다. 직접 구매형에는 CTA 공간을 비워 두기 위한 빈 element를 만들지 않는다. |
| 768px | 상단 detail을 media와 기본 정보의 2열로 전환하고 주요 기능은 아래에서 전체 폭을 사용한다. | 약 1:1 비율의 두 열과 24px gutter 안에서 어느 열도 `min-width` 때문에 넘치지 않게 한다. | 구매 panel은 기본 정보 열 안에 배치하고 CTA는 panel 폭을 사용할 수 있다. |
| 1280px | 32px gutter와 1280px container 안에서 media를 정보 열보다 넓게 배치한다. | Media와 정보의 비율은 약 7:5로 두고 설명의 읽기 폭을 제한한다. | 구매 panel은 정보 흐름 안에 두며 불필요한 sticky 동작은 추가하지 않는다. |

375px에서 root font를 200%로 확대해도 heading, breadcrumb, placeholder label, 기능 목록과 구매 panel이 잘리지 않고 horizontal overflow가 없어야 한다. 정보 순서는 모든 viewport에서 Product 식별, 설명, 구매 방법, 주요 기능 순서를 유지하며 CSS의 시각적 재배치로 DOM 읽기 순서를 뒤집지 않는다.

## Accessibility Criteria

### Heading과 landmark

- 각 정상 상세 route에는 `main#main-content` 하나와 Product 이름인 `h1` 하나를 둔다.
- `main`에는 기존 skip link가 focus를 전달할 수 있도록 `tabIndex={-1}`를 유지한다.
- breadcrumb는 `<nav aria-label="현재 위치">`와 list로 구성하고 현재 Product 이름에는 link를 만들지 않는다.
- Product 전체 내용은 하나의 `<article>`로 묶고 주요 기능과 구매 방법은 명확한 `h2`로 구분한다.
- Product 전용 not-found 화면에는 `main#main-content`, `h1`과 `/products` 복귀 link를 제공한다.

### Link와 button

- ProductCard의 `상세 보기`, breadcrumb의 `제품`과 not-found의 복귀 행동은 Next.js Link를 사용한다.
- 공식 문의 CTA는 외부 목적지가 드러나는 `PhytoWorks에 견적 문의` 문구의 native `<a>`를 사용한다.
- 같은 목적지로 가는 Product 이름 link와 `상세 보기` link를 한 card에 중복하지 않는다.
- Card 전체에 click handler를 붙이거나 `<div>`를 button 또는 link처럼 사용하지 않는다.
- 이번 Product Detail에는 실제로 실행할 page-level button이 없으므로 구매 button을 만들지 않는다. SiteHeader의 native menu button 계약은 유지한다.
- link와 button은 최소 44px 높이, 충분한 text label과 기존 전역 `:focus-visible` outline을 유지한다.
- 외부 문의 link를 새 창에서 강제로 열지 않으며 아이콘이나 색상만으로 외부 이동을 알리지 않는다.

### Keyboard와 visible focus

- Tab과 Shift+Tab 순서는 SiteHeader, breadcrumb link, 견적 문의 link 또는 not-found 복귀 link의 DOM 순서와 같아야 한다.
- Product Detail을 여는 데 hover, drag, carousel, pointer gesture와 JavaScript keyboard handler가 필요하지 않아야 한다.
- ProductCard, breadcrumb, 견적 문의와 not-found link의 focus outline이 card, panel과 sticky header의 overflow에 잘리지 않아야 한다.
- `DIRECT_PURCHASE` 화면에는 focus를 받을 수 없는 빈 CTA, disabled 구매 button이나 숨겨진 `/cart` link가 없어야 한다.
- Placeholder는 interactive element나 image landmark가 아니며 keyboard focus를 받지 않는다.

## Scope

### 포함하는 범위

- ProductCard에서 Product Detail로 이동하는 명확한 내부 link
- `/products/[productId]` dynamic route와 route metadata
- 세 Product의 정적 상세 요약, 주요 기능과 placeholder label
- 정적 Product 조회 함수와 build 시점 params 생성
- 정상 Product 세 건과 존재하지 않는 Product 처리
- Product 전용 not-found 화면과 Catalog 복귀 link
- 권한 확인 전 ProductMediaPlaceholder
- `QUOTE_REQUIRED`와 `DIRECT_PURCHASE`의 상세 정보 구조
- NITRO 견적형 Product의 공식 문의 외부 link
- Cart가 없는 상태의 `DIRECT_PURCHASE` 무 CTA 정책
- Product Detail 전용 commerce component와 CSS Modules
- SiteHeader의 하위 Products route `aria-current` 처리
- 375px, 768px와 1280px responsive layout
- heading, landmark, link, keyboard, visible focus와 44px 조작 영역 검증
- 구현 결과에 맞는 task, context, architecture와 design 문서 갱신

### 포함하지 않는 범위

- Cart, Cart badge, Add to Cart state와 `/cart`
- 가격, 재고, 할인, 세금, 배송비, 납기, 결제 조건과 환불 정책
- API, NestJS, PostgreSQL, fetch, cache와 repository abstraction
- Checkout, Order, Payment와 Toss Payments
- 자체 견적 문의 form, 개인정보 입력과 저장
- 실제 PhytoWorks logo, Product image, 외부 image hotlink와 권한이 확인되지 않은 brand asset
- 상세 수치 사양, 구성품, 보증, 설치와 유지보수 정보
- Product options, quantity selector와 variant 선택
- gallery, thumbnail, zoom, carousel, swipe와 animation
- 사용처가 없는 범용 Card, Badge, Media, Modal, EmptyState와 external-link component
- Product domain의 최종 ID, DB entity와 판매 정책 확정
- `globals.css`, dependency, package script와 lockfile 변경
- 프로젝트 성격을 설명하는 banner, Demo boundary와 장문의 공식 정보 안내
- 지원 browser 범위 확정과 전체 WCAG 적합성 audit

## Files Planned to Change

### 새로 추가할 runtime 파일

- `apps/web/app/products/[productId]/page.tsx`
- `apps/web/app/products/[productId]/page.module.css`
- `apps/web/app/products/[productId]/not-found.tsx`
- `apps/web/app/products/[productId]/not-found.module.css`
- `apps/web/components/commerce/ProductMediaPlaceholder.tsx`
- `apps/web/components/commerce/ProductMediaPlaceholder.module.css`
- `apps/web/components/commerce/ProductPurchasePanel.tsx`
- `apps/web/components/commerce/ProductPurchasePanel.module.css`

### 수정할 runtime 파일

- `apps/web/data/products.ts`: 정적 상세 data와 ID 조회 함수를 추가한다.
- `apps/web/components/commerce/ProductCard.tsx`: 각 Product의 상세 link를 추가한다.
- `apps/web/components/commerce/ProductCard.module.css`: 상세 link와 구매 방법 영역의 배치를 추가한다.
- `apps/web/components/layout/SiteHeader.tsx`: Product Detail 하위 route에서도 Products navigation에 `aria-current="page"`를 적용한다.

### 구현 후 갱신할 기록 파일

- `tasks/005-product-detail.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/design/shop-ux-strategy.md`

`docs/domain/product.md`와 `docs/domain/cart.md`는 이번 task가 기존 Proposed 규칙을 바꾸지 않으므로 계획된 변경 대상에서 제외한다. 구현 중 새로운 domain 규칙이 필요하다고 확인되면 임의로 확정하지 않고 원인과 선택지를 기록한 뒤 사용자에게 다시 확인한다.

### 변경하지 않을 파일과 영역

- `apps/web/app/globals.css`의 foundation token, reset, breakpoint와 focus 기준
- `apps/web/app/products/page.tsx`와 `apps/web/app/products/page.module.css`의 Catalog 구조
- `apps/web/components/commerce/ProductGrid.tsx`와 `ProductGrid.module.css`
- `apps/web/components/ui/Button.tsx`, `LinkButton.tsx`와 `Button.module.css`
- `apps/web/package.json`, root `package.json`, `pnpm-lock.yaml`과 dependency
- `docs/adr/`와 monorepo 구조
- API, DB, Docker, Toss Payments와 배포 설정

구현 과정에서 위 목록 밖의 변경이 필요해지면 범위를 자동으로 넓히지 않고 task에 근거를 기록한 뒤 사용자에게 확인한다.

## Plan

1. `products.ts`의 세 Product에 상세 요약, 주요 기능과 placeholder label을 추가하고 ID 조회 함수를 만든다.
2. `[productId]/page.tsx`에 `generateStaticParams`, 정적 metadata, Product 조회와 `notFound()` 처리를 구현한다.
3. Product Detail page에 breadcrumb, Product article, media, category, `h1`, 설명, 구매 방법과 주요 기능 순서를 작성한다.
4. 실제 image semantics를 만들지 않는 `ProductMediaPlaceholder`를 구현한다.
5. `ProductPurchasePanel`에서 `QUOTE_REQUIRED`는 공식 문의 외부 link를, `DIRECT_PURCHASE`는 구매 방법 정보만 렌더링한다.
6. Product 전용 `not-found.tsx`에 명확한 오류 heading과 `/products` 복귀 LinkButton을 제공한다.
7. ProductCard 하단에 Product별 `상세 보기` link를 하나 추가한다.
8. SiteHeader의 Products current 조건을 `/products`와 그 하위 route까지 포함하도록 조정한다.
9. Route와 component별 CSS Module에 mobile-first layout을 작성하고 40rem에서 2열, 64rem에서 넓은 media 비율로 조정한다.
10. lint, typecheck와 production build를 순차적으로 실행한다.
11. Browser에서 ProductCard 세 link, 정상 상세 세 건, 존재하지 않는 ID, 공식 문의 외부 URL과 navigation current 상태를 확인한다.
12. 375px, 768px와 1280px layout, 375px의 200% text 확대, keyboard 순서, visible focus, 44px target과 overflow를 검증한다.
13. `git diff`, `git diff --check`와 최종 status를 검토하고 실제 변경, 문제, 해결, 검증 결과와 남은 위험을 이 task 및 관련 context와 design 문서에 갱신한다.

## Verification Plan

### 자동 검증

- `pnpm.cmd lint`: `app`, `components`, `data`와 `next.config.ts`의 format 및 lint를 검사한다.
- `pnpm.cmd typecheck`: dynamic params, 정적 data, component prop과 not-found 경계의 타입을 검사한다.
- `pnpm.cmd build`: `/products/[productId]`의 세 정적 path, metadata, not-found와 CSS Module production bundling을 확인한다.
- `git diff --check`: whitespace 오류를 확인한다.
- `git status --short --branch`: 계획하지 않은 파일과 범위 밖 변경이 없는지 확인한다.

현재 unit test runner가 없고 이번 범위에는 계산이나 상태 전이 domain logic이 없다. 새 test dependency는 추가하지 않는다. 정적 조회와 route mapping은 typecheck, production build와 browser route 검증으로 확인한다.

### Browser와 수동 검증

- `/products`의 Product 세 건에 `상세 보기` link가 한 번씩 있고 각각 올바른 ID route로 이동하는지 확인한다.
- `/products/nitro`, `/products/thermal-imaging`과 `/products/chlorophyll-fluorescence`가 각각 올바른 이름, category, 설명, 주요 기능과 구매 방법을 한 번씩 표시하는지 확인한다.
- 각 정상 상세 route에 Product image 대신 자체 placeholder가 있고 `img`, 꾸며 낸 `alt`, image role과 `이미지 준비 중` 문구가 없는지 확인한다.
- NITRO 상세에는 `견적 문의`와 `PhytoWorks에 견적 문의` 외부 link가 있고 목적지가 `https://phyto-works.com/ko?source=nitro`인지 확인한다.
- 두 `DIRECT_PURCHASE` 상세에는 `온라인 구매` 정보만 있고 button, disabled CTA, 준비 중 안내와 `/cart` link가 없는지 확인한다.
- `/products/not-a-product`가 Product 전용 not-found 화면을 보여 주고 `/products` 복귀 link가 실제 Catalog로 이동하는지 확인한다.
- Home, Catalog와 Product Detail에 SiteHeader의 `Shop Demo` 외에 Demo·공식 정보 banner, aside와 장문의 안내 section이 추가되지 않았는지 확인한다.
- `/products`와 세 Product Detail에서 Products navigation에 `aria-current="page"`가 적용되고 Home에서는 Home link만 현재 위치인지 확인한다.
- 각 정상 상세 route와 not-found에 `main#main-content`와 `h1`이 각각 하나인지 확인한다.
- Breadcrumb의 label, list 구조, `/products` link와 현재 Product text가 올바른지 확인한다.
- 375px에서 한 열 배치, full-width 견적 link, 긴 영문 Product 이름 줄바꿈과 horizontal overflow 부재를 확인한다.
- 768px에서 media와 기본 정보가 2열이고 주요 기능이 아래 전체 폭에 배치되며 두 열이 container 밖으로 넘치지 않는지 확인한다.
- 1280px에서 32px gutter, media와 정보의 약 7:5 비율, 제한된 읽기 폭과 불필요한 sticky 영역 부재를 확인한다.
- 375px에서 root font를 32px로 바꿔 200% text 확대를 재현하고 heading, breadcrumb, 기능 목록, 구매 panel과 link가 잘리거나 겹치지 않는지 확인한다.
- Tab과 Shift+Tab으로 skip link, brand, mobile menu 또는 desktop navigation, breadcrumb, 견적 또는 복귀 link를 DOM 순서대로 이동한다.
- ProductCard 상세 link, breadcrumb, 견적 link와 not-found 복귀 link의 target 높이가 44px 이상이며 focus outline이 card와 panel 경계에서 잘리지 않는지 확인한다.
- Placeholder가 focus 순서에 들어오지 않고 page에 carousel, animation, drag와 pointer 전용 interaction이 없는지 확인한다.

## Changes

- `tasks/005-product-detail.md`를 추가해 구현 전 선택지, content 경계, 선택한 구조, 변경 파일, 완료 조건과 검증 계획을 기록했다.
- `products.ts`의 정적 Product 세 건에 상세 요약, 주요 기능과 placeholder label을 추가하고 `getProductById` 조회 함수와 공통 구매 방법 label을 정의했다.
- `/products/[productId]` page에 Product별 metadata, `generateStaticParams`, 정적 data 조회, breadcrumb, media, 설명, 구매 방법과 주요 기능을 구현했다.
- ProductMediaPlaceholder는 자체 CSS surface와 Product 식별 문구만 사용하며 image role, `img`, 가짜 alt text와 준비 중 문구를 만들지 않았다.
- ProductPurchasePanel은 NITRO의 `QUOTE_REQUIRED`에만 공식 문의 외부 link를 제공하고 두 `DIRECT_PURCHASE`에는 `온라인 구매` 정보만 표시한다.
- Product 전용 not-found 화면에 명확한 heading, 설명과 `/products` 복귀 LinkButton을 추가했다.
- ProductCard 하단에 44px 높이의 `상세 보기` link를 한 개씩 추가했다. Card 전체 link와 중복되는 이름 link는 만들지 않았다.
- SiteHeader가 `/products`뿐 아니라 `/products/*`에서도 Products navigation에 `aria-current="page"`를 표시하도록 current route 판정을 확장했다.
- Product Detail은 기존 breakpoint를 재사용해 375px에서 한 열, 768px에서 균등한 2열, 1280px에서 약 7:5 비율의 2열로 구현했다.
- `docs/context/project-overview.md`, `docs/context/architecture-overview.md`와 `docs/design/shop-ux-strategy.md`를 Product Detail의 실제 구현 상태에 맞춰 갱신했다.
- 가격, 재고, Cart, Add to Cart, API, DB, 실제 Product image, dependency와 lockfile은 변경하지 않았다.

## Problems Encountered

- 첫 PowerShell 문서 출력은 기본 인코딩 때문에 한글이 깨졌다. `Get-Content -Encoding utf8`로 필수 문서 전체를 다시 읽었으며 깨진 출력은 판단 근거로 사용하지 않았다.
- 공식 문의 link의 정확한 목적지를 직접 요청하는 과정에서 공식 서버가 429 응답을 반환했다. 공식 NITRO 페이지의 실제 link navigation을 별도로 확인해 `https://phyto-works.com/ko?source=nitro` 목적지를 검증했다.
- 첫 lint는 새 파일의 LF line ending과 Biome의 Windows formatter 기준 차이로 실패했다.
- Orca computer-use runtime은 처음에는 준비 상태였지만 browser 상태를 읽는 과정에서 `runtime_unavailable`로 연결을 종료했다.
- 첫 browser 검증에서 375px의 200% text 확대 시 견적 panel의 최소 콘텐츠 너비 때문에 document가 client width보다 53px 넓어졌다.
- 처음 사용한 `dynamicParams = false`는 알려지지 않은 ID가 page의 `notFound()`에 도달하기 전에 404를 반환하여 Product 전용 not-found 대신 framework fallback을 표시했다.
- Next.js 개발 서버가 `apps/web/AGENTS.md`와 `apps/web/CLAUDE.md`를 자동 생성했다.

## Resolution

- 문서와 source를 읽는 명령에는 UTF-8 인코딩을 명시했다.
- 외부 문의 URL은 검색 결과의 추측값을 사용하지 않고 2026-08-30의 공식 NITRO 페이지에 있는 문의 link가 실제로 연결한 주소만 계획에 기록했다.
- `pnpm.cmd --filter @phytoworks/web lint --write`로 새 source와 CSS를 프로젝트의 Windows line-ending 및 format 기준에 맞춘 뒤 lint를 다시 실행했다.
- computer-use의 다른 실행 파일로 우회하지 않고 별도의 임시 headless Edge profile과 DevTools Protocol로 responsive, DOM, link, keyboard와 focus를 검증했다.
- ProductPurchasePanel과 견적 link에 `min-width: 0`을 적용하고 link의 긴 단어가 줄바꿈될 수 있게 하여 200% text 확대의 horizontal overflow를 제거했다.
- `dynamicParams = false`를 제거하고 알려지지 않은 ID를 page의 data 조회와 `notFound()`로 처리했다. 정상 Product 세 건은 계속 `generateStaticParams`로 정적 생성된다.
- 검증을 마친 뒤 개발 서버와 이 worktree에서 시작한 headless Edge process를 종료하고 임시 profile, screenshot, 검증 script 및 자동 생성된 agent rule 파일을 제거했다.

## Verification

- 요청된 필수 문서, 관련 context, Product와 Cart domain 문서, 관련 ADR, task template, UI foundation 및 Catalog task를 읽었다.
- `apps/web`의 현재 route, layout, global CSS, Product data, ProductCard, ProductGrid, SiteHeader, Button, LinkButton와 각 CSS Module을 읽었다.
- 현재 branch가 `uiuuymin/product-detail`이고 HEAD가 기준 commit `694b761`과 정확히 일치하며 초기 worktree가 깨끗한 것을 확인했다.
- Next.js 16 공식 문서에서 dynamic route의 `params`가 Promise인 점, `generateStaticParams`, `dynamicParams`와 `notFound()` 처리 방식을 다시 확인했다.
- 2026-08-30의 공식 PhytoWorks 홈페이지와 NITRO 페이지에서 NITRO의 제품 맥락과 공식 문의 전환을 다시 확인했다.
- 한국어 문법과 문장 구조를 검토하고 viewport 열거에 사용하는 조사를 일관되게 교정했다.
- Markdown code fence 두 개가 짝을 이루고 표 구문이 유지되는 것을 확인했다.
- 새 파일을 대상으로 `git diff --no-index --check -- NUL tasks/005-product-detail.md`를 실행했으며 whitespace 오류가 없었다. Exit code 1과 LF에서 CRLF로 바뀐다는 안내는 untracked 파일과 Windows line-ending 차이 때문에 발생한 결과다.
- `pnpm.cmd install --frozen-lockfile`을 실행해 고정된 lockfile 그대로 68개 package link를 복원했다. Dependency 선언과 lockfile은 바뀌지 않았다.
- `pnpm.cmd lint`는 성공했으며 Biome가 `app`, `components`, `data`와 `next.config.ts`의 25개 파일을 검사했다.
- `pnpm.cmd typecheck`는 성공했으며 `tsc --noEmit`이 dynamic params, Product data와 component prop을 검사했다.
- `pnpm.cmd build`는 성공했으며 `/`, `/products`, `/_not-found`와 Product Detail 세 건을 생성했다. 세 Product Detail은 `generateStaticParams`를 사용하는 SSG path로 표시되었다.
- HTTP status는 세 정상 Product가 각각 200이고 `/products/not-a-product`가 404인 것을 확인했다.
- `/products`에는 ProductCard 세 건과 44px 높이의 `상세 보기` link 세 개가 있고, 첫 link를 실제로 활성화했을 때 `/products/nitro`와 해당 `h1`으로 이동했다.
- 정상 상세 세 건에는 `main#main-content`와 `h1`이 각각 하나, breadcrumb 하나, `구매 방법`, `제품 개요`, `주요 기능` `h2`와 주요 기능 세 항목이 있었다.
- 세 상세 route 모두 Products navigation에 `aria-current="page"`를 표시했다.
- NITRO에는 45.1875px 높이의 `PhytoWorks에 견적 문의` link와 정확한 공식 URL이 있었다. 두 `DIRECT_PURCHASE`에는 외부 문의 link, button과 `/cart` link가 없고 `온라인 구매` 정보만 있었다.
- 모든 상세 route에 `img`, image role, `aside`, 준비 중 문구와 page-level button이 없었다.
- 375px에서는 328px 한 열, 768px에서는 340.5px 두 열, 1280px에서는 672.578px과 480.422px의 약 7:5 두 열을 사용했다. 세 viewport 모두 document scroll width와 client width가 같았다.
- 375px에서 root font를 32px로 바꾼 200% text 확대 후에도 document scroll width와 client width가 360px로 같았다.
- 첫 Tab focus는 `본문으로 건너뛰기` link였고 3px focus outline과 3px offset이 표시되었다. Enter로 활성화하면 hash가 `#main-content`로 바뀌고 active element가 `main#main-content`가 되었다.
- Product 전용 not-found에는 `main`, `h1`, 45.1875px 높이의 `제품 목록으로 돌아가기` link와 not-found metadata title이 있었다.
- 375px, 768px와 1280px의 NITRO 및 1280px의 직접 구매 Product screenshot에서 dark palette, 정보 위계, placeholder, line wrapping과 판매 panel을 직접 확인했다.

## Diff Review

- Runtime 변경은 계획한 Product Detail route, Product 전용 commerce component, ProductCard link, SiteHeader current 판정과 정적 Product data로 제한했다.
- 가격, 재고, Cart, API, DB, 실제 brand asset, animation, dependency와 lockfile 변경은 diff에 없다.
- `globals.css`, ProductGrid, Catalog route, Button, LinkButton와 domain 및 ADR 문서는 변경하지 않았다.
- 검증용 script, profile, screenshot과 개발 서버가 만든 agent rule 파일은 최종 diff에 남기지 않았다.
- 사용자가 VS Code와 diff에서 특히 확인할 부분은 `page.tsx`의 static params 및 not-found 경계, ProductPurchasePanel의 판매 방식 분기, ProductMediaPlaceholder의 accessibility 경계와 200% text 확대 수정이다.

## Follow-up

- Cart task에서 `DIRECT_PURCHASE` Product의 실제 Add to Cart button, 가격, 재고, 저장 방식, API와 DB 신뢰 경계를 함께 결정한다. 그때 ProductPurchasePanel의 직접 구매 분기에 처음으로 동작 가능한 CTA를 추가한다.
- 승인된 Product image가 생기면 별도 asset task에서 source URL, 재사용 권한, repository 포함 여부, image dimension, 성능과 alt text를 검토한다.
- 정확한 기술 사양을 화면에 추가하려면 공식 자료의 버전, 적용 Product와 구성 옵션을 다시 검증하고 내부 company 및 Product 문서를 먼저 갱신한다.

## Lessons Learned

- Product Detail이 생겼다는 이유만으로 아직 존재하지 않는 구매 흐름까지 화면에 미리 만들면 정보 구조보다 잘못된 행동 계약이 먼저 생긴다. 현재 제공할 수 있는 유효한 행동만 표시해야 한다.
- 공식 사이트에서 확인한 이미징 기능과 학습용 Shop이 만든 독립 Product 및 직접 구매 가능성은 서로 다른 정보 상태다. 같은 Product object에 들어가더라도 task와 domain 문서에서 근거를 분리해야 한다.
- 실제 이미지가 없을 때 placeholder에 image role과 가짜 alt text를 붙이는 것보다, 장식 영역으로 명확히 제한하고 상세 정보를 text로 제공하는 편이 보조 기술과 정보 정확성에 더 적합하다.
- Dynamic route는 정상 path 생성만 확인하지 않고 알려지지 않은 ID의 사용자 복귀 경로, metadata와 상위 navigation current 상태까지 함께 설계해야 한다.
- `dynamicParams = false`가 404 status를 만든다는 사실만 확인해서는 충분하지 않다. Route별 not-found UI가 실제로 렌더링되는지도 browser에서 확인해야 한다.
- Text 확대 검증에서는 document 전체 폭뿐 아니라 grid item의 기본 `min-width: auto`와 긴 CTA 문구가 만드는 최소 콘텐츠 너비도 함께 측정해야 한다.
