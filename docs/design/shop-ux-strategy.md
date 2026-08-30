# Shop IA and UI Strategy

## 문서 목적과 상태

이 문서는 PhytoWorks Shop의 Information Architecture, responsive UI, interaction과 최소 design system 방향의 원본이다. 구현 세부사항은 각 task에서 다시 검증하되, 화면을 만들기 전에 전체 흐름과 공통 원칙을 확인하기 위해 사용한다.

- **Current:** 2026-08-30의 코드, Next.js route manifest와 browser 관찰로 확인한 현재 상태
- **Proposed:** 후속 task의 계획 기준이며 아직 구현되지 않은 방향
- **Deferred:** 핵심 주문·결제 흐름 이후에 다시 평가할 항목
- **Excluded:** 현재 학습 범위에는 넣지 않는 항목

이 문서는 domain 규칙을 대체하지 않는다. Product, Cart, Order와 Payment 규칙은 `docs/domain/`의 각 문서를 기준으로 하며, 회사의 실제 사업과 Demo 경계는 `docs/context/company-reference.md`를 기준으로 한다.

## Current IA

직접 작성된 route는 `/`와 `/products`다. Next.js가 생성한 `/_not-found`, `/_global-error`는 framework fallback이며 프로젝트가 설계한 사용자 화면으로 세지 않는다.

```text
Root layout
├─ SiteHeader
│  ├─ Home·Products navigation
│  └─ Mobile disclosure
├─ / Home
│  ├─ Shop 소개
│  └─ Catalog CTA
└─ /products Product Catalog
   ├─ Catalog 설명
   └─ responsive ProductGrid
      ├─ NITRO Plant Growth System
      ├─ Thermal Imaging Module
      └─ Chlorophyll Fluorescence Module
```

### Current 사용자 흐름

```text
Home
→ Products
→ 정적 Product 세 건 비교
```

- 공통 SiteHeader, Home·Products navigation, 현재 route 표시와 mobile disclosure가 있다. Footer는 아직 없다.
- Product Detail, Cart, Checkout, Payment result, Order status route는 없다.
- Product는 `apps/web/data/products.ts`의 정적 TypeScript 배열이며 API와 DB를 사용하지 않는다. SiteHeader의 mobile disclosure만 client state를 사용한다.
- Home의 LinkButton과 SiteHeader로 내부 route를 이동한다. 학습용 Shop이라는 맥락은 SiteHeader의 `Shop Demo` label에서 한 번만 알린다.
- Native CSS foundation 위에 component·route별 CSS Module, 1열·2열·3열 ProductGrid와 responsive SiteHeader가 구현되었다.
- 현재 semantic markup은 `lang="ko"`, SiteHeader, navigation list, skip link, `main`, heading hierarchy, `section`, `article`, Product list와 `aria-labelledby`·`aria-current`를 사용한다.

## Current UX/UI 문제

### Critical

| 문제 | 사용자 영향 |
| --- | --- |
| Product Detail 접근이 없음 | 상품을 비교한 다음 더 알아보거나 구매 판단을 이어갈 수 없다. |
| `견적 문의`, `온라인 구매`가 정보 표시임 | 구매 방법은 비교할 수 있지만 Product Detail과 다음 행동은 아직 없다. |
| Cart부터 Payment까지의 흐름이 없음 | 쇼핑몰의 핵심 학습 흐름을 시작할 수 없다. |
| 가격, 직접 구매 대상과 Product URL 규칙이 미확정임 | card, detail과 CTA의 안정적인 정보 계약을 만들 수 없다. |

### Important

| 문제 | 사용자 영향 |
| --- | --- |
| Product image와 상세 사양이 없음 | card에서 용도와 판매 방식은 비교할 수 있지만 실제 장비 형태와 기술 차이를 충분히 판단하기 어렵다. |
| Product Detail 이후의 responsive 규칙이 구현되지 않음 | Catalog는 검증되었지만 gallery, Cart와 Checkout의 구조 변화는 아직 없다. |
| Loading, Empty, Error pattern이 없음 | API 연결 후 상태별 임시 구현이 분산될 수 있다. |

### Nice-to-have

- Product hover image 전환
- section reveal
- 장식적인 transition
- gallery 확대와 세밀한 motion

이 항목은 핵심 흐름과 상태 feedback을 구현한 뒤에 검토한다.

## Proposed 목표 IA

복잡한 대형 쇼핑몰이 아니라 Product 탐색부터 주문·결제 상태 확인까지 연결되는 최소 구조를 사용한다.

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

| 영역 | 상태 | 역할과 이유 |
| --- | --- | --- |
| Home `/` | Proposed | 브랜드 맥락, 대표 Product와 Shop 진입점을 제공한다. |
| Products `/products` | Proposed | Product 탐색과 비교를 담당한다. |
| Product Detail `/products/[productId]` | Proposed | 이미지, 설명, 사양, 판매 방식과 CTA를 제공한다. |
| Cart `/cart` | Proposed | `DIRECT_PURCHASE` Demo Product의 수량과 합계를 확인한다. |
| Checkout `/checkout` | Proposed | 주문 입력을 확인하고 서버에 Order 생성을 요청한다. |
| Payment success/fail | Proposed | 브라우저 인증 결과와 서버 승인 결과를 혼동하지 않도록 분리한다. |
| Order status `/orders/[orderId]` | Proposed | 특정 Order와 Payment 상태를 확인한다. |
| Orders 목록 | Deferred | Customer 식별과 인증 정책이 먼저 필요하다. |
| Wishlist | Deferred | 주문·결제 기술 흐름에 필수적이지 않다. |
| Admin | Excluded | 인증·권한·운영 규칙 없이 관리 화면을 만들지 않는다. |
| 자체 견적 문의 form | Deferred | 개인정보 처리와 저장 범위를 결정하기 전에는 공식 문의 경로를 사용한다. |

`/orders/[orderId]`는 화면 위치 후보일 뿐 접근 권한을 결정하지 않는다. 추측 가능한 URL만으로 주문을 조회하지 않도록 Customer 식별, 인증과 authorization 규칙을 구현 전에 별도로 확정한다.

### Proposed 직접 구매 흐름

```text
Home
→ Products
→ Product Detail
→ Add to Cart
→ Cart
→ Checkout
→ Order PENDING 생성
→ Toss Payments 테스트 인증
→ NestJS 서버 승인
→ Payment success 또는 fail
→ Order status
```

### Proposed 견적 문의 흐름

```text
Home 또는 Products
→ Product Detail
→ 견적 문의 CTA
→ PhytoWorks 공식 문의 경로로 외부 이동
```

`QUOTE_REQUIRED` Product는 Cart에 담지 않으며 `DIRECT_PURCHASE`로 명시한 Demo Product만 Cart로 연결한다.

## PhytoWorks 브랜드를 Shop으로 변환하는 원칙

### 공식 사이트에서 확인한 표현

- 연구·육종·AI 표현형 분석을 중심으로 한 전문적인 B2B 기술 기업 tone
- 큰 영문 headline과 간결한 한국어 설명의 조합
- Inter, SUIT, system sans-serif 계열의 절제된 typography
- 짙은 배경과 밝은 본문, muted surface를 사용하는 높은 대비
- 넓은 section whitespace와 큰 이미지 영역
- 제품 전체, 실제 동작 장면, RGB·열화상·엽록소 형광 데이터와 dashboard를 함께 제시
- 가격보다 문제, 기술, 분석 결과, 상세 사양과 문의 순서로 Product를 설명
- 밝은 primary CTA와 투명한 secondary CTA
- 작은 화면에서 sticky header와 menu toggle 사용

확인 출처:

- PhytoWorks 한국어 홈페이지: <https://phyto-works.com/ko>
- NITRO 제품 페이지: <https://phyto-works.com/ko/nitro>

### Shop에 적용할 Proposed 원칙

- Home은 공식 사이트의 기술 narrative와 여백을 참고하되 문구와 layout을 그대로 복제하지 않는다.
- Product List는 category, 판매 방식, 짧은 설명과 CTA를 비교하기 쉬운 card로 바꾼다.
- Product Detail은 제품 이미지와 기술 사양을 중심에 두고 `견적 문의` 또는 `장바구니 담기`를 명확히 분기한다.
- 가격과 재고를 추가할 때에는 허구의 판매 조건을 실제 회사 정책처럼 보이게 하지 않되, 일반적인 Catalog 화면마다 장문의 Demo 안내를 반복하지 않는다.
- 소비재식 할인 압박, 마감 임박과 과장된 판매 문구는 사용하지 않는다.
- 학습용 Shop이라는 경계는 SiteHeader의 `Shop Demo` label로 유지하고, 공식 자료의 출처와 실제 판매 정책과의 차이는 사용자 화면이 아니라 context와 task 문서에 기록한다.

### Brand asset 정책

공개 웹사이트에 보인다는 이유만으로 로고와 이미지를 repository에 복제하지 않는다. 사용 권한이 확인되기 전에는 비율과 역할만 표현하는 자체 placeholder를 사용한다.

필요한 자산 후보:

- 승인된 PhytoWorks logo SVG
- NITRO 정면, 측면과 상세부 이미지
- NITRO 실제 운영 장면
- RGB, Thermal, Chlorophyll Fluorescence 비교 이미지
- 옵션 모듈 이미지
- 기관 logo의 별도 사용 허가

실제 자산을 추가하는 task는 source URL, 권리 상태, repository 사용 여부와 alt text를 함께 기록한다.

## Proposed Responsive Web 전략

현재 CSS framework와 breakpoint가 없으므로 아래 값은 구현 task에서 검증할 초기 기준이다. mobile-first CSS를 우선하며 Tailwind 설치를 전제로 하지 않는다.

```text
Mobile:  0–639px
Tablet:  640–1023px
Desktop: 1024px 이상
Wide container: max-width 1200–1280px
```

| 요소 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Header | brand, menu, Cart만 우선 노출 | 핵심 nav를 제한적으로 노출 | 전체 horizontal nav와 상태 indicator |
| Navigation | 펼침 menu 또는 drawer | 단순 horizontal nav | 전체 horizontal nav |
| Product grid | 1열 | 2열 | 3열 |
| Product detail | image 다음에 정보와 CTA | 공간에 따라 1열 또는 2열 전환 | gallery와 구매 정보를 2열 배치 |
| Cart | 항목별 card와 하단 summary | 넓은 card 또는 간단한 표 | 항목 목록과 sticky summary |
| Checkout | 한 열, 단계별 section | 한 열 중심 | form과 order summary 2열 |
| Image gallery | swipe 가능한 main image와 indicator | main image와 하단 thumbnail | 세로 thumbnail과 main image |
| Buttons | 핵심 CTA full width, 최소 44px 높이 | 문맥에 따라 full 또는 inline | inline CTA |
| Modal / Toast | bottom sheet 또는 하단 toast, safe area 고려 | 중앙 dialog 또는 하단 toast | 중앙 dialog와 우측 상단 toast |

Responsive behavior는 마지막 별도 작업으로 붙이지 않는다. 각 화면 task의 완료 조건에 Mobile, Tablet과 Desktop 검증을 포함한다.

## Micro Interaction 평가

| 후보 | 사용자 이점 | 난이도 | 접근성·모바일·성능 위험 | 학습 관련성 | 분류 |
| --- | --- | --- | --- | --- | --- |
| Button hover, pressed, loading, disabled | 제출 상태와 중복 실행 여부를 명확히 함 | 낮음 | 색만으로 상태를 표현하지 않고 loading label을 제공해야 함 | 높음 | Must have |
| Cart toast와 badge 갱신 | 담기 성공을 즉시 확인함 | 중간 | `aria-live`, badge label과 focus 흐름 필요; 모바일 가치 큼 | 높음 | Must have |
| Cart 삭제 후 Undo toast | 흐름을 막지 않고 실수를 복구함 | 중간 | Undo 시간과 keyboard 접근을 보장해야 함 | 높음 | Must have |
| Cart 삭제 confirm dialog | 비가역 작업을 보호함 | 중간 | 단일 항목 삭제에는 과도하며 focus trap이 필요함 | 중간 | Do not implement for a cart line |
| Wishlist heart와 indicator | 저장 상태를 빠르게 인지함 | 중간 | `aria-pressed`, accessible label과 저장 정책 필요 | 중간 | Could have |
| Product 전체 image에서 상세·사용 image로 hover 전환 | 제품 이해를 도움 | 중간 | hover-only 정보를 만들지 않고 모바일 gallery 대안 필요 | 중간 | Should have |
| 여러 각도의 image 자동 순환 | 시선을 끌 수 있음 | 높음 | motion 제어, 인지 방해와 image preload 비용이 큼 | 낮음 | Do not implement |
| Section reveal | 긴 페이지의 흐름을 보조할 수 있음 | 중간 | `prefers-reduced-motion`과 content visibility 유지 필요 | 낮음 | Could have |

Cart의 단일 항목 삭제는 즉시 반영하고 Undo를 제공한다. Order 취소처럼 영향이 크고 복구가 어려운 작업만 confirm dialog 후보로 본다.

Motion은 상태 변화와 공간 관계를 설명할 때만 사용한다. 단순 장식 animation을 위해 새 library를 설치하지 않는다.

## 최소 Design System 방향

대규모 design system package를 만들지 않고 web app 안에 작은 foundation을 둔다.

| 영역 | Proposed 기준 |
| --- | --- |
| Color | `background`, `surface`, `text`, `muted`, `border`, `primary`, `success`, `warning`, `danger` semantic token |
| Typography | 14, 16, 18, 24, 36, 48px의 제한된 scale 후보 |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64, 80px scale 후보 |
| Radius | input 6–8px, button 10px, card 12px 후보 |
| Button | primary, secondary, ghost, danger와 loading·disabled state |
| Input | default, hover, focus, invalid, disabled state |
| Card | image → category/status → title → description → price/CTA 순서 |
| Icon | 한 가지 outline style, 20px와 24px 중심 |
| Motion | 120, 180, 240ms와 transform·opacity 중심; reduced motion 지원 |
| Focus | 모든 interactive element에 명확한 `:focus-visible` outline |
| Container | max-width 1200–1280px, mobile 16px, tablet 24px, desktop 32px gutter 후보 |

공식 사이트에서 관찰한 dark background, light text와 muted surface는 palette 참고점으로만 사용했다. 실제 값은 [`tasks/003-ui-foundation.md`](../../tasks/003-ui-foundation.md)에서 contrast를 검증한 Demo Shop palette이며 공식 brand token이 아니다. Font package와 icon library는 필요성이 생길 때 라이선스와 bundle 비용을 확인한 뒤 선택한다.

### CSS foundation 선택

[`tasks/003-ui-foundation.md`](../../tasks/003-ui-foundation.md)에서 다음 방향을 선택했다.

- 전역 token·reset·typography·focus·container는 `app/globals.css`에 native CSS로 작성한다.
- Component별 style은 해당 component를 처음 구현할 때 CSS Modules로 분리한다.
- Tailwind, Sass, CSS-in-JS, UI library와 webfont는 foundation 범위에 포함하지 않는다.
- Dark theme 하나와 system font stack으로 시작하며 색상은 공식 brand 값이 아닌 Demo Shop palette로 구분한다.
- Foundation은 semantic token, 전역 기본값, responsive container, focus와 reduced motion까지만 담당한다.
- Button과 상태별 token은 실제 사용처가 생기는 후속 task에서 정의한다.

이 방식은 현재 dependency를 늘리지 않고 CSS의 cascade와 custom property를 직접 학습하면서, 화면별 selector 충돌은 CSS Modules로 제한하기 위한 선택이다. Native CSS의 반복과 유지 비용이 실제 문제로 확인되면 별도 task에서 framework 도입을 다시 비교한다.

### Current foundation

- `canvas #0b0f0d`, `text #f4f7f5`, `action #b8f34b`, `focus #d7ff72`를 포함한 10개 semantic color token을 사용한다.
- 본문·보조 본문·action은 인접 배경에서 4.5:1 이상이며 border는 canvas와 surface에서 3:1 이상이다.
- 14·16·18·24·36·48px type scale, 4–80px spacing scale, 세 radius와 120·180·240ms motion scale을 사용한다.
- Container는 1280px max-width이며 640px와 1024px breakpoint에서 gutter가 16px, 24px, 32px로 바뀐다.
- `prefers-reduced-motion: reduce`에서는 motion duration token이 `0.01ms`로 줄고 smooth scrolling을 사용하지 않는다.
- 375px viewport와 200% text 확대에서 horizontal overflow가 없음을 browser에서 확인했다.

### Current Catalog component와 responsive 동작

- SiteHeader는 Home·Products navigation, `aria-current`, skip link와 mobile disclosure를 제공한다. 현재 route와 disclosure state가 필요하므로 새 component 중 유일한 Client Component다.
- Button은 현재 문서의 동작, LinkButton은 내부 route 이동을 담당하며 `primary`와 `secondary` variant만 사용한다.
- Home은 Product 목록을 중복하지 않고 간결한 Shop 소개와 `/products` 진입만 제공한다.
- `/products`는 정적 Catalog data 세 건을 ProductGrid와 ProductCard Server Component로 렌더링한다.
- Home과 `/products`에는 프로젝트 성격을 해설하는 별도 notice를 두지 않으며 ProductCard의 구매 방법은 `견적 문의`와 `온라인 구매`로 간결하게 표시한다.
- ProductGrid는 375px에서 1열, 768px에서 2열, 1280px에서 3열이며 각 viewport와 200% text 확대에서 horizontal overflow가 없다.
- Mobile menu와 navigation link, Home CTA의 조작 영역은 44px 이상이며 Enter·Space·Escape, skip link focus와 visible focus를 browser에서 확인했다.

### Current와 Proposed 위치

```text
apps/web/
├─ app/
│  ├─ globals.css
│  ├─ page.tsx
│  ├─ page.module.css
│  └─ products/
│     ├─ page.tsx
│     └─ page.module.css
├─ components/
│  ├─ layout/
│  │  └─ SiteHeader
│  ├─ commerce/
│  │  ├─ ProductCard
│  │  └─ ProductGrid
│  └─ ui/
│     ├─ Button
│     └─ LinkButton
└─ data/
   └─ products.ts
```

- `app/globals.css`: **Current** — token, reset, global typography, focus와 responsive container
- `components/layout/`: **Current** — SiteHeader. SiteFooter와 별도 Container component는 아직 없다.
- `components/commerce/`: **Current** — ProductCard와 ProductGrid. Cart·Checkout component는 아직 없다.
- `components/ui/`: **Current** — Button과 LinkButton. Badge와 상태 표현은 아직 없다.
- `data/products.ts`: **Current** — API·DB 이전 단계의 정적 Catalog data와 UI용 type

현재 단순 구조를 `src/`로 옮기는 대규모 refactor는 이 foundation task에 포함하지 않는다.

## 공통 Component 후보

### Current Catalog component

- `SiteHeader`
- `Button`
- `LinkButton`
- `ProductCard`
- `ProductGrid`

### 후속 UI에서 필요한 것

- `SiteFooter`
- 별도 Container component가 실제로 필요한지 재검토
- `PurchaseModeBadge`
- `ProductPurchaseAction`

`ProductPurchaseAction`은 `purchaseMode`에 따라 `견적 문의`와 `장바구니 담기`를 분기한다. 정적 layout과 card는 Server Component를 우선하고, 실제 browser state가 필요한 작은 leaf만 Client Component로 만든다.

### 해당 기능을 구현할 때 필요한 것

- `ProductImageGallery`
- `Price`
- `QuantitySelector`
- `AddToCartButton`
- `CartLineItem`
- `CartSummary`
- `Toast`
- `EmptyState`
- `LoadingState`
- `ErrorState`

### 지금 만들지 않을 것

- `WishlistButton`
- 구체적인 사용처가 없는 범용 `Modal`
- 자동 재생 carousel
- Admin table
- 범용 form abstraction

`MobileNavigation`은 SiteHeader의 책임이 복잡해질 때 분리하며 처음부터 파일 수를 늘리지 않는다.

## Task와 Worktree 로드맵

UI foundation과 Shop Catalog는 각각 독립된 worktree에서 구현되었다. 나머지 작업도 아래 순서와 경계를 유지한다.

| 순서 | 작업 후보 | 목표 | 주요 선행 조건 | 핵심 검증 |
| --- | --- | --- | --- | --- |
| 1 | `chore/ui-foundation` | token, typography, container, focus와 reduced motion | bootstrap commit | lint, typecheck, build, contrast, keyboard |
| 2 | `feat/shop-catalog` | Button, SiteHeader, Home 역할 정리, `/products`, responsive ProductGrid | 1 | route 이동, 375/768/1280px, keyboard |
| 3 | `feat/product-detail` | `/products/[productId]`, placeholder gallery와 판매 방식별 CTA | Product ID와 purchaseMode 결정 | 정상·없는 ID, CTA 분기, responsive detail |
| 4 | `chore/api-bootstrap` | NestJS application 경계 생성 | bootstrap 안정화 | lint, typecheck, health API |
| 5 | `feat/product-read-api` | Product read model과 DB/API 연결 | ORM·DB ADR | API와 DB integration test |
| 6 | `feat/cart-flow` | Add to Cart, badge, 수량, 삭제와 Undo | Cart 저장 방식 결정 | 합계 unit test, reload, mobile, accessibility |
| 7 | `feat/checkout-order` | Checkout와 `PENDING` Order 생성 | Customer·금액 규칙 결정 | form validation, API, DB test |
| 8 | `feat/toss-payment` | 테스트 결제와 success/fail feedback | Toss 공식 문서 재검증 | 성공, 취소, 실패, timeout, 중복 승인 |
| 9 | `feat/order-status` | Order와 Payment 상태 확인 | 상태 모델 확정 | 상태별 UI와 API test |
| 10 | `feat/wishlist` | 필요성이 남아 있을 때 관심 Product 저장 | Customer 또는 저장 방식 결정 | reload, keyboard, mobile |
| 11 | `chore/ui-a11y-polish` | 전체 접근성, motion과 성능 점검 | 핵심 흐름 완료 | keyboard, reduced motion, browser audit |

1번과 2번은 Current이며 3번 이후는 Proposed다.

Responsive와 접근성은 11번까지 미루지 않고 각 기능 task의 완료 조건에 포함한다. 11번은 누락된 전체 흐름을 다시 점검하는 단계다.

## UI를 먼저 만들 범위

기능 개발 전에 다음까지만 중간 완성도로 구축한다.

1. 최소 design foundation
2. SiteHeader와 navigation
3. Home과 Product List 역할 분리
4. responsive ProductCard와 grid
5. Product Detail
6. `QUOTE_REQUIRED`와 `DIRECT_PURCHASE` CTA 분기
7. focus, loading, disabled, empty state의 기본 pattern
8. 권한 확인 전 image placeholder 정책

이후에는 UI 전체를 정적 mock으로 먼저 완성하지 않는다. Cart부터는 NestJS와 PostgreSQL의 저장·검증 규칙을 결정하고 UI, API와 DB를 하나의 vertical slice로 구현한다.

```text
UI foundation
→ Home / Products / Product Detail
→ UI 선행 구축 중단
→ NestJS / PostgreSQL 기능 개발
→ Cart부터 UI와 기능을 vertical slice로 함께 구현
```

Wishlist, Admin, 자동 image rotation, section reveal, 실제 brand asset과 pixel-level polish는 핵심 주문·결제 흐름 이후에 다시 평가한다.

## References

- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/context/company-reference.md`
- `docs/domain/product.md`
- `docs/domain/cart.md`
- `docs/domain/order.md`
- `docs/domain/payment.md`
- `tasks/002-plan-shop-ia-ui.md`
