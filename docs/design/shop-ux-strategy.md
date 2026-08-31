# Shop IA and UI Strategy

## 문서 목적과 상태

이 문서는 PhytoWorks Shop의 Information Architecture, responsive UI, interaction과 최소 design system 방향의 원본이다. 구현 세부사항은 각 task에서 다시 검증하되, 화면을 만들기 전에 전체 흐름과 공통 원칙을 확인하기 위해 사용한다.

- **Current:** 2026-08-31의 코드, Next.js route manifest와 browser 관찰로 확인한 현재 상태
- **Proposed:** 후속 task의 계획 기준이며 아직 구현되지 않은 방향
- **Deferred:** 핵심 주문·결제 흐름 이후에 다시 평가할 항목
- **Excluded:** 현재 학습 범위에는 넣지 않는 항목

이 문서는 domain 규칙을 대체하지 않는다. Product, Cart, Order와 Payment 규칙은 `docs/domain/`의 각 문서를 기준으로 하며, 회사의 실제 사업과 Demo 경계는 `docs/context/company-reference.md`를 기준으로 한다.

## Current IA

직접 작성된 route는 `/`, `/products`, `/products/[productId]`와 `/cart`다. Next.js가 생성한 `/_global-error`와 전체 application의 `/_not-found`는 framework fallback이며 프로젝트가 설계한 사용자 화면으로 세지 않는다.

```text
Root layout
├─ CartProvider
│  ├─ SiteHeader
│  │  ├─ Home·Products·Cart navigation과 Cart 총 수량
│  │  └─ Mobile disclosure
│  └─ route content
├─ / Home
│  ├─ Shop 소개
│  └─ Catalog CTA
├─ /products Product Catalog
   ├─ Catalog 설명
   ├─ responsive ProductGrid
   │  ├─ NITRO Plant Growth System
   │  ├─ Thermal Imaging Module
   │  └─ Chlorophyll Fluorescence Module
   └─ /products/[productId] Product Detail
      ├─ ProductMediaPlaceholder
      ├─ 제품 설명과 주요 기능
      ├─ ProductPurchasePanel
      └─ Product 전용 not-found
└─ /cart Browser Cart
   ├─ hydration과 localStorage 복원
   ├─ empty state와 Catalog link
   └─ Product별 수량 변경, 제거와 Undo
```

### Current 사용자 흐름

```text
Home
→ Products
→ 정적 Product 세 건 비교
→ Product Detail
├─ NITRO는 공식 견적 문의
└─ 직접 구매 Product는 Add to Cart
   → Cart에서 수량 변경·제거
```

- 공통 SiteHeader, Home·Products·Cart navigation, Cart 총 수량, 현재 route 표시와 mobile disclosure가 있다. Footer는 아직 없다.
- Product Detail과 `/cart`가 있으며 Checkout, Payment result와 Order status route는 없다.
- Product는 `apps/web/data/products.ts`의 정적 TypeScript 배열이며 API와 DB를 사용하지 않는다. 세 Product Detail은 `generateStaticParams`로 생성하며 CartProvider, SiteHeader와 Cart 전용 leaf만 client state를 사용한다.
- Home의 LinkButton과 SiteHeader로 내부 route를 이동한다. 학습용 Shop이라는 맥락은 SiteHeader의 `Shop Demo` label에서 한 번만 알린다.
- Native CSS foundation 위에 component·route별 CSS Module, 1열·2열·3열 ProductGrid, responsive SiteHeader와 1열·2열 Product Detail이 구현되었다.
- ProductCard는 `상세 보기` link로 각 detail에 연결한다. NITRO의 `QUOTE_REQUIRED`는 공식 문의 link를 유지하고, 두 `DIRECT_PURCHASE` detail은 실제 `장바구니 담기` button을 제공한다.
- `/cart`는 Product ID와 수량만 localStorage에 저장하고 hydration 뒤 검증한다. 같은 Product는 한 줄로 합치며 존재하지 않거나 직접 구매할 수 없는 Product는 제외한다.
- 현재 semantic markup은 `lang="ko"`, SiteHeader, navigation과 breadcrumb list, skip link, `main`, heading hierarchy, `section`, `article`, Product 및 Cart list, `fieldset`, label, `role="status"`, `aria-labelledby`와 `aria-current`를 사용한다.

## Current UX/UI 문제

### Critical

| 문제 | 사용자 영향 |
| --- | --- |
| Checkout부터 Payment까지의 흐름이 없음 | Product를 Cart에 담고 수량을 관리할 수 있지만 주문과 결제를 시작할 수 없다. |
| 가격과 직접 구매 조건이 미확정임 | Cart에서 합계와 주문 가능 금액을 확인할 수 없고 Checkout을 설계할 신뢰 가능한 판매 계약이 없다. |

### Important

| 문제 | 사용자 영향 |
| --- | --- |
| 실제 Product image와 상세 사양이 없음 | 자체 placeholder와 확인된 주요 기능은 제공하지만 실제 장비 형태와 구체적인 기술 차이를 충분히 판단하기 어렵다. |
| Checkout 이후의 responsive 규칙이 구현되지 않음 | Cart까지 검증되었지만 Checkout 이후의 구조 변화는 아직 없다. |
| 공통 Loading, Empty, Error pattern이 없음 | Cart에는 기능 전용 hydration·empty·저장 실패 상태가 있지만 API 연결 후 사용할 공통 pattern은 아직 없다. |

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
| Home `/` | Current | 브랜드 맥락과 Shop 진입점을 제공한다. |
| Products `/products` | Current | Product 탐색과 비교를 담당한다. |
| Product Detail `/products/[productId]` | Current | 자체 media placeholder, 설명, 주요 기능, 판매 방식과 CTA를 제공한다. |
| Cart `/cart` | Current | `DIRECT_PURCHASE` Demo Product를 browser에 임시 저장하고 수량을 관리한다. 가격이 없으므로 합계와 Checkout은 제공하지 않는다. |
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
- 가격을 추가할 때에는 허구의 판매 조건을 실제 회사 정책처럼 보이게 하지 않는다. 현재 가격은 카드와 상세에서 출처가 표시된 Demo 또는 카탈로그 참고값으로만 사용한다.
- 재고는 현재 Shop 범위에서 제공하지 않으며, 품절·재고 부족 상태도 표시하지 않는다.
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
| Cart | Product 정보와 수량 control을 한 열 card로 배치 | Card 내부를 Product와 조작 영역의 두 열로 배치 | 제한된 폭의 항목 목록과 정렬된 조작 열. 가격이 생기기 전에는 summary를 만들지 않음 |
| Checkout | 한 열, 단계별 section | 한 열 중심 | form과 order summary 2열 |
| Image gallery | swipe 가능한 main image와 indicator | main image와 하단 thumbnail | 세로 thumbnail과 main image |
| Buttons | 핵심 CTA full width, 최소 44px 높이 | 문맥에 따라 full 또는 inline | inline CTA |
| Modal / Toast | bottom sheet 또는 하단 toast, safe area 고려 | 중앙 dialog 또는 하단 toast | 중앙 dialog와 우측 상단 toast |

Responsive behavior는 마지막 별도 작업으로 붙이지 않는다. 각 화면 task의 완료 조건에 Mobile, Tablet과 Desktop 검증을 포함한다.

## Micro Interaction 평가

| 후보 | 사용자 이점 | 난이도 | 접근성·모바일·성능 위험 | 학습 관련성 | 분류 |
| --- | --- | --- | --- | --- | --- |
| Button hover, pressed, loading, disabled | 제출 상태와 중복 실행 여부를 명확히 함 | 낮음 | 색만으로 상태를 표현하지 않고 loading label을 제공해야 함 | 높음 | Must have |
| Cart 상태 알림과 badge 갱신 | 담기 성공을 즉시 확인함 | 중간 | `aria-live`, badge label과 focus 흐름 필요; 모바일 가치 큼 | 높음 | Current |
| Cart 삭제 후 inline Undo | 흐름을 막지 않고 실수를 복구함 | 중간 | keyboard 접근과 상태 알림을 보장해야 함 | 높음 | Current |
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

### Current Catalog, Product Detail과 Cart component 및 responsive 동작

- SiteHeader는 Home·Products·Cart navigation, Cart 총 수량, `aria-current`, skip link와 mobile disclosure를 제공한다. 현재 route, disclosure와 Cart state가 필요하므로 Client Component다.
- Button은 현재 문서의 동작, LinkButton은 내부 route 이동을 담당하며 `primary`와 `secondary` variant만 사용한다.
- Home은 Product 목록을 중복하지 않고 간결한 Shop 소개와 `/products` 진입만 제공한다.
- `/products`는 정적 Catalog data 세 건을 ProductGrid와 ProductCard Server Component로 렌더링한다.
- ProductCard의 `상세 보기` link는 세 `/products/[productId]` route로 연결된다. 각 detail은 ProductMediaPlaceholder와 ProductPurchasePanel을 포함한 Server Component 구조다.
- Home, `/products`와 Product Detail에는 프로젝트 성격을 해설하는 별도 notice를 두지 않으며 ProductCard와 detail의 구매 방법은 `견적 문의`와 `온라인 구매`로 간결하게 표시한다.
- NITRO detail은 공식 문의 외부 link를 제공한다. 두 `DIRECT_PURCHASE` detail은 Client leaf인 AddToCartButton을 통해 실제 Cart state를 갱신한다.
- 실제 Product image 대신 image role과 가짜 alt text가 없는 자체 placeholder를 사용한다. 알려지지 않은 ID는 Product 전용 not-found와 Catalog 복귀 link로 처리한다.
- ProductGrid는 375px에서 1열, 768px에서 2열, 1280px에서 3열이며 각 viewport와 200% text 확대에서 horizontal overflow가 없다.
- Product Detail은 375px에서 한 열, 768px에서 균등한 2열, 1280px에서 약 7:5의 2열을 사용한다. 세 viewport와 375px의 200% text 확대에서 horizontal overflow가 없다.
- Root CartProvider는 Context와 reducer를 제공하고 Product ID 및 수량만 version 1 localStorage에 저장한다. Server와 첫 client render는 미복원 상태로 일치시키고 mount effect에서 저장 data를 검증한다.
- CartView는 hydration, empty, non-empty, Undo와 storage 실패 상태를 분기하고 CartLineItem은 Product 상세 link, 수량 input, 증가·감소와 제거를 담당한다.
- 같은 Product는 한 줄로 합치고, 수량은 1 이상의 정수로 유지하며 0은 삭제로 처리하지 않는다. 명시적인 제거 뒤 마지막 한 건을 Undo할 수 있다.
- Cart는 375px에서 한 열 card, 768px에서 Product와 조작 영역의 두 열, 1280px에서 제한된 list 폭과 정렬된 조작 열을 사용한다. 세 viewport와 375px의 200% text 확대에서 horizontal overflow가 없다.
- 가격과 통화가 없으므로 합계, 무료, Checkout CTA와 빈 sticky summary를 표시하지 않는다.
- Mobile menu와 navigation link, Home CTA의 조작 영역은 44px 이상이며 Enter·Space·Escape, skip link focus와 visible focus를 browser에서 확인했다.
- Cart의 Product link, button과 input은 44px 이상이며 keyboard, 연결된 수량 label, Product 이름을 포함한 button label, 3px visible focus와 polite live status를 browser에서 확인했다.

### Current와 Proposed 위치

```text
apps/web/
├─ app/
│  ├─ globals.css
│  ├─ page.tsx
│  ├─ page.module.css
│  ├─ cart/
│  │  ├─ page.tsx
│  │  └─ page.module.css
│  └─ products/
│     ├─ page.tsx
│     ├─ page.module.css
│     └─ [productId]/
│        ├─ page.tsx
│        ├─ page.module.css
│        ├─ not-found.tsx
│        └─ not-found.module.css
├─ components/
│  ├─ layout/
│  │  └─ SiteHeader
│  ├─ commerce/
│  │  ├─ ProductCard
│  │  ├─ ProductGrid
│  │  ├─ ProductMediaPlaceholder
│  │  └─ ProductPurchasePanel
│  ├─ cart/
│  │  ├─ AddToCartButton
│  │  ├─ CartLineItem
│  │  ├─ CartProvider
│  │  ├─ CartView
│  │  ├─ cart-state
│  │  └─ cart-storage
│  └─ ui/
│     ├─ Button
│     └─ LinkButton
└─ data/
   └─ products.ts
```

- `app/globals.css`: **Current** — token, reset, global typography, focus와 responsive container
- `app/cart/`: **Current** — Cart metadata와 Server Component page shell
- `components/layout/`: **Current** — SiteHeader와 Cart navigation 및 총 수량. SiteFooter와 별도 Container component는 아직 없다.
- `components/commerce/`: **Current** — ProductCard, ProductGrid, ProductMediaPlaceholder와 ProductPurchasePanel
- `components/cart/`: **Current** — Cart Context·reducer·storage, Add to Cart, Cart view와 line item
- `components/ui/`: **Current** — Button과 LinkButton. 별도 범용 Badge component는 없다.
- `data/products.ts`: **Current** — API·DB 이전 단계의 정적 Catalog 및 Product Detail data와 UI용 type

현재 단순 구조를 `src/`로 옮기는 대규모 refactor는 이 foundation task에 포함하지 않는다.

## 공통 Component 후보

### Current Shop component

- `SiteHeader`
- `Button`
- `LinkButton`
- `ProductCard`
- `ProductGrid`
- `ProductMediaPlaceholder`
- `ProductPurchasePanel`
- `AddToCartButton`
- `CartProvider`
- `CartView`
- `CartLineItem`

### 후속 UI에서 필요한 것

- `SiteFooter`
- 별도 Container component가 실제로 필요한지 재검토
- `PurchaseModeBadge`
- `ProductPurchaseAction`

현재 ProductPurchasePanel은 `QUOTE_REQUIRED`의 공식 문의 link와 `DIRECT_PURCHASE`의 실제 AddToCartButton을 분기한다. 정적 layout과 Product 정보는 Server Component에 두고, 실제 browser state가 필요한 AddToCartButton만 Client leaf로 만들었다.

### 해당 기능을 구현할 때 필요한 것

- `ProductImageGallery`
- `Price`
- API 또는 재고 규칙과 연결된 `QuantitySelector`
- 가격과 Checkout이 생겼을 때의 `CartSummary`
- 여러 화면에서 반복되는 필요가 확인되었을 때의 범용 `Toast`
- 여러 화면에서 반복되는 필요가 확인되었을 때의 범용 `EmptyState`
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
| 1 | `ui-foundation` | token, typography, container, focus와 reduced motion | bootstrap commit | lint, typecheck, build, contrast, keyboard |
| 2 | `shop-catalog` | Button, SiteHeader, Home 역할 정리, `/products`, responsive ProductGrid | 1 | route 이동, 375/768/1280px, keyboard |
| 3 | `product-detail` | `/products/[productId]`, media placeholder와 판매 방식별 정보 및 유효한 CTA | Product ID와 purchaseMode 결정 | 정상·없는 ID, 판매 방식 분기, responsive detail |
| 4 | `browser-cart` | localStorage 기반 Add to Cart, count, 수량, 삭제와 Undo | Product Detail | reload, 손상 data, mobile, accessibility |
| 5 | `api-bootstrap` | NestJS application 경계 생성 | bootstrap 안정화 | lint, typecheck, health API |
| 6 | `product-read-api` | Product read model과 정적 API 연결 | API bootstrap | API unit·application test와 실제 HTTP 요청 |
| 7 | `server-cart` | Customer 또는 session 기반 Cart와 browser Cart 이관 | Cart ownership·가격·재고 규칙 | API, DB, validation, migration |
| 8 | `checkout-order` | Checkout와 `PENDING` Order 생성 | Customer·금액 규칙 결정 | form validation, API, DB test |
| 9 | `toss-payment` | 테스트 결제와 success/fail feedback | Toss 공식 문서 재검증 | 성공, 취소, 실패, timeout, 중복 승인 |
| 10 | `order-status` | Order와 Payment 상태 확인 | 상태 모델 확정 | 상태별 UI와 API test |
| 11 | `wishlist` | 필요성이 남아 있을 때 관심 Product 저장 | Customer 또는 저장 방식 결정 | reload, keyboard, mobile |
| 12 | `ui-a11y-polish` | 전체 접근성, motion과 성능 점검 | 핵심 흐름 완료 | keyboard, reduced motion, browser audit |

1번부터 6번까지 Current이며 7번 이후는 Proposed다. 5번에서 추가한 `/health`와 6번에서 추가한 Product API는 사용자 화면이나 Shop navigation에 포함되지 않으며 현재 IA와 browser Cart 흐름을 변경하지 않는다. PostgreSQL과 ORM을 이용한 Product source 전환은 별도 database task로 남아 있다.

Responsive와 접근성은 12번까지 미루지 않고 각 기능 task의 완료 조건에 포함한다. 12번은 누락된 전체 흐름을 다시 점검하는 단계다.

## UI를 먼저 만들 범위

기능 개발 전에 다음까지만 중간 완성도로 구축한다.

1. 최소 design foundation
2. SiteHeader와 navigation
3. Home과 Product List 역할 분리
4. responsive ProductCard와 grid
5. Product Detail
6. `QUOTE_REQUIRED`의 공식 문의 CTA와 `DIRECT_PURCHASE`의 Add to Cart 분기
7. focus, loading, disabled, empty state의 기본 pattern
8. 권한 확인 전 image placeholder 정책

이후에는 UI 전체를 정적 mock으로 먼저 완성하지 않는다. 현재 browser Cart는 가격·재고·Customer를 만들지 않고 Product 선택과 수량 관리를 학습하기 위한 한정된 단계다. 다음 server Cart에서는 NestJS와 PostgreSQL의 저장·검증 규칙을 결정하고 UI, API와 DB를 하나의 vertical slice로 구현한다.

```text
UI foundation
→ Home / Products / Product Detail
→ Browser Cart로 상태·hydration·접근성 학습
→ UI 선행 구축 중단
→ 최소 NestJS application 경계
→ Product read API와 정적 fixture
→ PostgreSQL persistence task
→ Server Cart부터 UI와 API·DB를 vertical slice로 함께 구현
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
