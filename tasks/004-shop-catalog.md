# Task: Shop Catalog 구조 선택과 구현

**Status:** 구현 완료

## Goal

PhytoWorks Shop의 공통 진입 구조와 정적 Product 탐색 화면을 만들기 전에 component 책임, route 역할, data 위치, responsive와 접근성 기준을 확정한다. 사용자 승인 후에는 SiteHeader, navigation, Button, LinkButton, Home 역할 정리, `/products`, ProductCard와 ProductGrid만 구현한다.

이번 task의 완료 조건은 다음과 같다.

- 모든 현재 route가 공통 SiteHeader와 주요 navigation을 사용한다.
- Mobile에서는 keyboard로 열고 닫을 수 있는 navigation을 제공하고, Tablet과 Desktop에서는 단순한 horizontal navigation을 제공한다.
- `Button`은 현재 문서 안에서 실행하는 동작에만 사용하고 `LinkButton`은 내부 route 이동에만 사용한다.
- Home `/`는 Shop의 성격을 간결하게 소개하고 `/products`로 안내하는 진입 화면을 담당한다.
- `/products`는 현재 정적 Product 전체를 비교할 수 있는 catalog를 담당한다.
- 정적 Product data를 route와 component에서 분리하되, 아직 API·DB domain model인 것처럼 확장하지 않는다.
- ProductGrid는 목록과 responsive 배치를 담당하고 ProductCard는 Product 한 건의 정보 위계를 담당한다.
- 375px, 768px와 1280px viewport에서 navigation과 Product grid가 각각 의도한 구조로 동작하며 horizontal overflow가 없다.
- semantic HTML, 논리적인 heading·focus 순서, keyboard 조작, visible focus와 충분한 조작 영역을 유지한다.
- 학습용 Shop이라는 맥락은 SiteHeader의 `Shop Demo` label에서 한 번만 표시하며 route마다 설명 notice를 반복하지 않는다.
- lint, typecheck와 production build가 통과하고 `/`와 `/products`의 이동을 browser에서 확인한다.

## Context

현재 `/`는 페이지 안에 선언한 정적 Product 배열을 한 화면에서 직접 렌더링한다. 공통 header와 내부 navigation이 없고, Home의 브랜드·Demo 소개 역할과 Product 비교 역할이 한 route에 섞여 있다. CSS foundation은 구현되었지만 component별 CSS Module과 responsive component layout은 아직 없다.

이번 작업은 주문·결제 기능을 만들기 전에 사용자가 Shop의 범위를 이해하고 Product를 탐색할 수 있는 최소 구조를 세우는 단계다. Product Detail, Cart와 API 계약이 아직 없으므로 존재하지 않는 상세 화면이나 구매 동작을 암시하지 않아야 한다. 공식 사이트에서 확인되지 않은 가격·재고·직접 구매 가능 여부도 실제 PhytoWorks 정책처럼 표현하지 않는다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/context/company-reference.md`
- `docs/design/shop-ux-strategy.md`
- `docs/domain/product.md`
- `docs/adr/001-use-pnpm-workspace.md`
- `docs/development/testing-strategy.md`
- `tasks/002-plan-shop-ia-ui.md`
- `tasks/003-ui-foundation.md`
- Next.js `Link` 공식 문서: <https://nextjs.org/docs/app/api-reference/components/link>
- Next.js CSS 공식 문서: <https://nextjs.org/docs/app/getting-started/css>
- WAI Disclosure pattern: <https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/>
- WAI Disclosure navigation 예시: <https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/>
- WAI 접근성 원칙: <https://www.w3.org/WAI/fundamentals/accessibility-principles/>
- WCAG 2.2 Target Size Minimum 설명: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

## Current State

- 작업 branch는 `uiuuymin/shop-catalog`이며 기준 commit은 `c6bf7db`이다.
- 작업 계획을 작성하기 전 `git status --short`는 변경 사항 없이 깨끗하다. 사용자 전역 Git ignore 파일의 접근 권한 경고만 표시되었으며 repository 변경은 아니다.
- `apps/web`은 Next.js 16.3.3 App Router와 React 19.2.8을 사용한다.
- 직접 작성한 route는 `/` 하나이며 `app/layout.tsx`, `app/page.tsx`와 `app/globals.css`가 있다.
- `app/page.tsx`는 `PurchaseMode`, `Product`와 Product 세 건을 파일 안에 선언하고 Server Component에서 직접 `map`으로 렌더링한다.
- `layout.tsx`는 metadata, `lang="ko"`와 전역 CSS import만 담당하며 공통 SiteHeader가 없다.
- `globals.css`에는 Demo dark palette, typography, spacing, radius, motion, 1280px container, 640px·1024px breakpoint, visible focus와 reduced motion 기준이 있다.
- 375px, 768px와 1280px에서 container gutter는 각각 16px, 24px와 32px로 검증되었다.
- Tailwind, Sass, CSS-in-JS, UI library와 icon library는 설치되어 있지 않다.
- `components/`와 `data/` 디렉터리는 없으며 Client Component도 없다.
- `apps/web/package.json`의 lint 대상은 현재 `app`과 `next.config.ts`뿐이므로 `components`와 `data`를 추가하면 lint 범위를 함께 넓혀야 한다.
- Product model, `purchaseMode`와 직접 구매 가능 여부는 여전히 Proposed 또는 Demo다. 가격, 이미지 저장 방식과 Product Detail URL 식별 방식도 확정되지 않았다.
- 이번 화면의 요청 경로는 계속 `Browser → Next.js Server Component → Browser`다. 모바일 navigation toggle만 browser state가 필요한 작은 Client Component 경계가 된다.

## Options Considered

### SiteHeader와 mobile navigation 구조

#### 1. 모든 viewport에서 navigation link를 항상 노출

- 장점: JavaScript와 toggle state가 필요 없으며 semantic 구조가 가장 단순하다.
- 단점: 375px에서 brand와 link가 좁은 한 줄에 몰리거나 여러 줄로 불안정하게 바뀐다. 이후 Cart 같은 항목이 추가될 때 작은 화면의 확장성도 낮다.

#### 2. Native `<details>`와 `<summary>`로 mobile navigation 구현

- 장점: JavaScript 없이 기본 펼침·접힘과 keyboard 조작을 얻을 수 있다.
- 단점: `summary`의 기본 marker와 상태 표현을 header 디자인에 맞추는 비용이 있으며, route 이동 후 닫기와 viewport별 동일 navigation 재사용을 세밀하게 제어하기 어렵다. Site navigation toggle의 이름과 `aria-expanded` 계약도 직접 만든 button보다 덜 명시적이다.

#### 3. SiteHeader 하나를 작은 Client Component로 만들고 disclosure navigation 구현

- 장점: `usePathname`으로 현재 route에 `aria-current="page"`를 표시하고, mobile toggle의 열린 상태, route 이동 후 닫기와 Escape 동작을 한 경계에서 관리할 수 있다. navigation 자체는 native link 목록을 유지하므로 복잡한 menu widget keyboard 규칙이 필요하지 않다.
- 단점: 공통 header 전체가 hydration 대상이 되며 state와 event 처리가 추가된다.

**제안:** Option 3을 선택한다. 현재 navigation은 Home과 Products 두 항목뿐이므로 별도 `MobileNavigation` component를 만들지 않고 SiteHeader 안에서 mobile disclosure와 desktop 표현을 함께 관리한다. `<nav>`와 `<ul>` 구조를 유지하고 ARIA `menu`·`menubar` 역할과 custom arrow-key navigation은 사용하지 않는다. Mobile menu는 overlay나 drawer가 아니라 header 아래의 문서 흐름 안에서 펼쳐지게 하므로 focus trap, body scroll lock과 modal 처리가 필요 없다.

### Button과 LinkButton의 책임 및 variant 범위

#### 1. `as` 또는 `href`에 따라 element가 바뀌는 polymorphic Button 하나 사용

- 장점: 호출 이름과 style 정의를 한곳에 모을 수 있다.
- 단점: 호출부만 보고 동작인지 이동인지 알기 어렵고 `disabled`, `type`, `href`처럼 element마다 다른 prop 계약이 복잡해진다. 잘못하면 link를 button으로 모방하거나 그 반대가 될 수 있다.

#### 2. semantic element에 맞춰 Button과 LinkButton을 분리하고 style만 공유

- 장점: `Button`은 native `<button>` 동작, `LinkButton`은 Next.js `<Link>` 기반 내부 이동이라는 책임이 명확하다. 두 component가 같은 CSS Module의 시각 variant를 공유해 표현은 일관되게 유지할 수 있다.
- 단점: component 파일이 하나 더 생기며 공통 class 조합을 작게 공유해야 한다.

#### 3. component 없이 필요한 `<button>`과 `<Link>`마다 class를 직접 지정

- 장점: 초기 파일 수가 가장 적다.
- 단점: 최소 높이, padding, hover·active·disabled와 variant 표현이 사용처마다 달라질 수 있다. Catalog 이후 같은 CTA를 다시 구현할 가능성이 높다.

**제안:** Option 2를 선택한다.

- `Button`은 메뉴 열기처럼 현재 화면의 상태나 동작을 바꾸는 경우에만 사용한다. 기본 `type`은 `button`으로 두되 native button prop과 `disabled`를 전달한다.
- `LinkButton`은 `/products`처럼 내부 route로 이동하는 CTA에만 사용하고 Next.js `Link`를 렌더링한다. 외부 공식 사이트 링크는 목적지가 Demo 밖임을 드러내는 일반 `<a>`를 사용한다.
- 시각 variant는 실제 사용처가 있는 `primary`와 `secondary` 두 개만 만든다. Home의 catalog CTA는 `primary`, mobile menu toggle은 `secondary`를 사용한다.
- `ghost`, `danger`, icon-only, 크기 variant, loading API와 polymorphic `as` prop은 현재 사용처가 없으므로 만들지 않는다.
- 최소 높이는 44px로 두고 hover, active, native disabled와 visible focus 상태를 제공한다. Mobile full-width 여부는 Button variant가 아니라 Home route layout이 결정한다.

### Home과 `/products`의 역할 분리

#### 1. Home과 `/products`에서 같은 전체 ProductGrid 렌더링

- 장점: 어느 route에서든 Product를 바로 볼 수 있다.
- 단점: 두 route의 존재 이유가 약해지고 같은 Product data와 긴 화면을 중복해서 노출한다.

#### 2. Home은 Shop 진입, `/products`는 전체 Product 비교를 전담

- 장점: Home의 narrative와 Catalog의 탐색 목적이 명확하다. Product 목록을 한 route에서만 렌더링하므로 현재 작은 data에서도 중복이 없다.
- 단점: Home에서 Product 이름을 즉시 비교할 수 없으며 한 번 이동해야 한다.

#### 3. Home에는 대표 ProductCard 일부, `/products`에는 전체 ProductGrid 렌더링

- 장점: Home에서도 대표 Product를 보여 주면서 전체 Catalog와 구분할 수 있다.
- 단점: 현재 Product가 세 건뿐이고 Product Detail도 없어서 대표 선정 기준과 card 중복이 실제 가치보다 앞선다.

**제안:** Option 2를 선택한다. Home은 Shop 설명과 `/products` 진입 CTA를 제공하고 `/products`는 page heading, 탐색 설명과 전체 ProductGrid를 제공한다. 사용자 검토 결과, 학습용 Shop이라는 표시는 SiteHeader의 `Shop Demo` label로 충분하다고 판단해 Home과 Catalog의 별도 Demo·공식 정보 notice는 제거했다. Product Detail이 생기기 전에는 card 전체나 제목을 존재하지 않는 `/products/[productId]`로 연결하지 않는다.

### 정적 Product data의 위치

#### 1. 각 route 파일 안에 배열 유지

- 장점: 한 파일만 읽으면 화면과 data를 함께 이해할 수 있다.
- 단점: `/products` 추가 후 Home이나 후속 Product Detail에서 data가 필요해지면 복사하거나 route 파일을 data source처럼 import하게 된다.

#### 2. `apps/web/data/products.ts`에 Catalog 전용 type과 정적 배열 배치

- 장점: UI와 정적 data의 책임이 분리되고 Server Component가 별도 dependency 없이 직접 import할 수 있다. API·DB가 생길 때 임시 data source를 교체할 위치도 명확하다.
- 단점: 실제 domain model이나 repository처럼 보일 수 있으므로 임시 정적 Catalog data라는 경계를 문서와 이름으로 밝혀야 한다.

#### 3. `public/products.json` 또는 공유 package에 배치

- 장점: JSON은 framework 밖에서도 읽을 수 있고 공유 package는 미래 API와 type을 나눌 수 있다.
- 단점: JSON은 compile-time type 계약이 약하고 runtime fetch가 불필요하게 생길 수 있다. 공유 package는 API 계약이 없는 현재 단계에서 과도한 구조다.

**제안:** Option 2를 선택한다. `CatalogProduct`와 `CatalogPurchaseMode`라는 이름을 사용해 최종 DB entity가 아님을 드러낸다. `purchaseMode`는 현재 domain 후보인 `QUOTE_REQUIRED | DIRECT_PURCHASE`를 사용한다. 화면에서는 SiteHeader가 Demo 맥락을 이미 제공하므로 card label을 `견적 문의 | 온라인 구매`로 간결하게 표시한다. 가격, 재고, image, API 함수와 repository abstraction은 추가하지 않는다.

### ProductCard와 ProductGrid의 component 경계

#### 1. `/products/page.tsx`에서 list와 card markup을 모두 직접 작성

- 장점: 처음 작성할 파일이 적다.
- 단점: responsive grid, list semantics와 Product 한 건의 표현이 한 route에 섞이며 후속 Product Detail이나 Home에서 일부 표현을 재사용하기 어렵다.

#### 2. ProductGrid가 data 목록과 list semantics를, ProductCard가 Product 한 건을 담당

- 장점: ProductGrid는 `<ul>`·`<li>`, column 수와 gap을 소유하고 ProductCard는 `<article>`, category, title, description과 판매 방식 표현만 소유한다. 각 component의 변경 이유와 CSS 책임이 분명하다.
- 단점: Product 수가 세 건인 현재 상태에서는 component가 두 개로 늘어난다.

#### 3. ProductGrid를 범용 children container로 만들고 page에서 mapping

- 장점: Product 이외의 card에도 같은 grid를 사용할 수 있다.
- 단점: 아직 존재하지 않는 사용처를 위한 범용화이며 list item과 key 책임이 route로 다시 새어 나온다.

**제안:** Option 2를 선택한다. ProductGrid는 `products` prop을 받아 `<ul>` 안에서 mapping하고 각 `<li>`에 ProductCard를 렌더링한다. ProductCard는 `product` 한 개를 받아 `<article>`을 렌더링하며 route navigation, Product Detail CTA와 구매 동작은 소유하지 않는다. 두 component는 browser state가 없으므로 Server Component로 유지한다.

### CSS Modules 파일 구성

#### 1. Catalog 관련 style을 하나의 큰 module에 작성

- 장점: import 수가 적고 전체 화면 style을 한 번에 볼 수 있다.
- 단점: SiteHeader, Button, card, grid와 route layout의 책임이 섞이며 component 이동이나 삭제 시 사용하지 않는 selector를 찾기 어렵다.

#### 2. component와 route에 CSS Module을 나란히 배치

- 장점: selector 소유권이 명확하고 Next.js가 생성하는 local class name으로 충돌을 막는다. Button과 LinkButton처럼 의도적으로 같은 표현을 공유하는 경우에만 하나의 module을 함께 사용할 수 있다.
- 단점: 작은 `.tsx`와 `.module.css` 파일이 여러 개 생긴다.

#### 3. 모든 style을 `globals.css`에 추가

- 장점: 기존 stylesheet 하나만 수정한다.
- 단점: foundation과 화면별 규칙이 다시 섞이고 route가 늘수록 전역 selector 충돌 가능성이 커진다. `tasks/003-ui-foundation.md`에서 정한 책임과도 맞지 않는다.

**제안:** Option 2를 선택한다.

- `SiteHeader.tsx`와 `SiteHeader.module.css`는 sticky header, brand, mobile disclosure와 desktop nav를 함께 소유한다.
- `Button.tsx`, `LinkButton.tsx`는 `Button.module.css`를 공유한다.
- `ProductCard.tsx`와 `ProductCard.module.css`, `ProductGrid.tsx`와 `ProductGrid.module.css`를 각각 나란히 둔다.
- Home과 Products의 section 폭, spacing과 CTA 배치는 각 route의 `page.module.css`가 소유한다.
- token, reset, global focus와 `.container`는 기존 `globals.css`를 그대로 사용한다. 이번 계획에서는 `globals.css`를 수정하지 않는다.

### 375px, 768px와 1280px responsive 동작

#### 1. Component마다 필요한 breakpoint를 임의로 추가

- 장점: 각 component가 원하는 지점에서 세밀하게 바뀔 수 있다.
- 단점: foundation의 640px·1024px 기준과 어긋나고 실제 검증 viewport에서 예측하기 어려운 중간 상태가 늘어난다.

#### 2. 기존 640px·1024px breakpoint를 재사용하고 mobile-first로 구현

- 장점: container gutter와 component 전환 시점이 일치하고 375px·768px·1280px이 각각 Mobile·Tablet·Desktop 상태를 명확히 대표한다.
- 단점: 특정 문구 길이에 최적인 개별 전환 지점을 선택하지 않는다.

**제안:** Option 2를 선택한다.

| 검증 viewport | SiteHeader와 navigation | Home과 Button | ProductGrid |
| --- | --- | --- | --- |
| 375px | brand와 menu button을 표시하고 navigation은 button 아래 한 열로 펼친다. 각 link와 button은 최소 44px 높이를 유지한다. | 한 열로 읽으며 primary CTA는 사용 가능한 content 폭을 채운다. | 1열이며 card 안의 긴 영문 이름도 horizontal overflow 없이 줄바꿈한다. |
| 768px | menu button을 숨기고 Home·Products link를 horizontal nav로 항상 표시한다. | CTA는 content에 맞는 inline 폭으로 바뀐다. | 2열을 사용하고 card 높이와 내부 spacing을 일관되게 유지한다. |
| 1280px | 32px gutter 안에서 brand와 nav를 양쪽에 배치하고 sticky header가 content를 가리지 않게 한다. | 본문 읽기 폭을 무제한으로 늘리지 않고 넓은 여백을 유지한다. | 3열을 사용하며 container 밖으로 넘치지 않는다. |

Mobile과 Desktop에 별도 markup을 두 벌 만들지 않는다. 같은 navigation list를 CSS로 배치만 바꾸며 숨겨진 mobile navigation의 link가 keyboard focus 순서에 남지 않게 한다. Product 순서는 모든 viewport에서 data 배열 순서를 유지한다.

### Keyboard, focus와 semantic HTML 기준

#### 1. 시각적 element와 click handler 위주로 구현하고 ARIA로 보완

- 장점: layout 자유도가 높다.
- 단점: native keyboard 동작과 의미를 다시 구현해야 하며 잘못된 role이나 focus 관리가 생기기 쉽다.

#### 2. Native semantic element를 먼저 사용하고 필요한 상태만 ARIA로 전달

- 장점: `<header>`, `<nav>`, `<main>`, `<section>`, `<ul>`, `<li>`, `<article>`, `<a>`와 `<button>`의 기본 의미와 keyboard 동작을 유지한다. ARIA는 mobile disclosure와 현재 위치처럼 HTML만으로 부족한 상태에만 제한된다.
- 단점: 시각 배치와 DOM 순서를 함께 설계해야 하며 임의의 interactive card pattern을 만들 수 없다.

**제안:** Option 2를 선택한다.

- SiteHeader의 첫 focusable element로 `본문으로 건너뛰기` link를 제공하고 각 page의 `<main id="main-content">`로 이동시킨다.
- 주요 navigation은 `<nav aria-label="주요 메뉴">`와 list로 구성한다.
- 현재 route의 link에는 `aria-current="page"`를 사용한다.
- Mobile toggle은 `<button type="button">`에 `aria-expanded`와 `aria-controls`를 제공한다. Enter와 Space는 native button 동작을 사용하고 Escape로 닫을 때 toggle button으로 focus를 돌린다.
- Tab과 Shift+Tab의 DOM 순서가 화면의 읽기 순서와 같아야 하며 positive `tabIndex`, focus 강제 이동과 arrow-key menu 동작은 추가하지 않는다.
- 전역 `:focus-visible` outline을 제거하거나 box-shadow만으로 덮지 않는다. sticky header와 card의 overflow가 outline을 잘라 내지 않는지 확인한다.
- ProductGrid는 list, ProductCard는 article을 사용한다. card 전체를 가짜 button이나 중첩 link로 만들지 않는다.
- 각 route에는 하나의 명확한 `h1`이 있고 section heading 순서를 건너뛰지 않는다.
- link와 button의 조작 영역은 최소 44px 높이를 목표로 하며, 색상만으로 현재 route·판매 방식·disabled 상태를 구분하지 않는다.

## Decision

다음 구조를 구현안으로 제안한다.

```text
apps/web/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ page.module.css
│  └─ products/
│     ├─ page.tsx
│     └─ page.module.css
├─ components/
│  ├─ commerce/
│  │  ├─ ProductCard.tsx
│  │  ├─ ProductCard.module.css
│  │  ├─ ProductGrid.tsx
│  │  └─ ProductGrid.module.css
│  ├─ layout/
│  │  ├─ SiteHeader.tsx
│  │  └─ SiteHeader.module.css
│  └─ ui/
│     ├─ Button.tsx
│     ├─ LinkButton.tsx
│     └─ Button.module.css
└─ data/
   └─ products.ts
```

- SiteHeader만 Client Component로 만들고 나머지 새 component와 route는 Server Component로 유지한다.
- SiteHeader는 root layout에서 한 번 렌더링하고 Home·Products navigation과 mobile disclosure를 소유한다.
- Button과 LinkButton은 semantic 책임을 분리하고 `primary | secondary`만 공유한다.
- Home은 Shop 소개와 catalog 진입을, `/products`는 전체 Product 탐색을 담당한다.
- 정적 data는 `data/products.ts`에 두지만 final domain entity, API response 또는 신뢰 가능한 가격 source로 취급하지 않는다.
- ProductGrid는 목록 구조와 responsive column을, ProductCard는 한 Product의 표시만 담당한다.
- CSS는 component·route와 함께 배치하고 기존 global foundation을 확장하지 않는다.
- 이 구조는 `apps/web` 내부에서 쉽게 변경할 수 있고 API·DB 계약을 확정하지 않으므로 새 ADR을 만들지 않는다.

## Scope

### 포함하는 범위

- 공통 SiteHeader와 Home·Products navigation
- 문서 흐름 안에서 펼쳐지는 mobile navigation disclosure
- 현재 route 표시와 skip link
- `Button`, `LinkButton`과 `primary`·`secondary` variant
- Home의 간결한 소개와 CTA 구조 정리
- `/products` route와 route metadata
- 세 건의 정적 Catalog Product data 분리
- ProductCard와 ProductGrid Server Component
- component별·route별 CSS Modules
- 1열·2열·3열 Product grid와 header responsive 전환
- keyboard, focus, semantic HTML과 44px 조작 영역 검증
- lint 대상에 `components`와 `data` 추가
- 구현 결과에 맞는 context·design 문서와 이 task의 실행 기록 갱신

### 포함하지 않는 범위

- `/products/[productId]`와 Product Detail
- Product card에서 존재하지 않는 상세 route로 이동하는 link
- Cart, Cart badge, Add to Cart와 구매 state
- Product 가격, 재고, 할인, 세금, 배송과 결제 CTA
- NestJS API, PostgreSQL, fetch, cache와 repository abstraction
- Product domain 규칙 확정 또는 DB entity 설계
- 실제 PhytoWorks logo, Product image, icon, webfont와 다른 brand asset
- 별도 `MobileNavigation`, SiteFooter, PurchaseModeBadge와 ProductPurchaseAction component
- `ghost`, `danger`, icon-only, size, loading과 polymorphic Button variant
- 자체 견적 문의 form과 개인정보 처리
- 사용처가 없는 범용 Container, Card, Badge, Modal, Input와 form abstraction
- Tailwind, Sass, CSS-in-JS, UI·icon·motion library와 새 dependency
- drawer, focus trap, body scroll lock과 overlay
- hover image 교체, carousel, section reveal과 장식 animation
- light theme, theme toggle와 전체 WCAG 적합성 audit

## Files Planned to Change

### 새로 추가할 runtime 파일

- `apps/web/app/page.module.css`
- `apps/web/app/products/page.tsx`
- `apps/web/app/products/page.module.css`
- `apps/web/components/layout/SiteHeader.tsx`
- `apps/web/components/layout/SiteHeader.module.css`
- `apps/web/components/ui/Button.tsx`
- `apps/web/components/ui/LinkButton.tsx`
- `apps/web/components/ui/Button.module.css`
- `apps/web/components/commerce/ProductCard.tsx`
- `apps/web/components/commerce/ProductCard.module.css`
- `apps/web/components/commerce/ProductGrid.tsx`
- `apps/web/components/commerce/ProductGrid.module.css`
- `apps/web/data/products.ts`

### 수정할 runtime·config 파일

- `apps/web/app/layout.tsx` — SiteHeader를 공통 shell에 배치한다.
- `apps/web/app/page.tsx` — Product 목록을 제거하고 Home의 진입 역할로 정리한다.
- `apps/web/package.json` — Biome가 `components`와 `data`도 검사하도록 lint 대상을 확장한다.

### 구현 후 갱신할 기록 파일

- `tasks/004-shop-catalog.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/design/shop-ux-strategy.md`

### 변경하지 않을 파일과 영역

- `apps/web/app/globals.css`의 foundation token·reset·breakpoint
- root `package.json`, `pnpm-lock.yaml`과 dependency
- `docs/domain/`의 Product·Cart·Order·Payment 규칙
- `docs/adr/`와 monorepo 구조
- API, DB, Docker, Toss Payments와 배포 설정

구현 과정에서 이 목록 밖의 변경이 필요해지면 임의로 범위를 넓히지 않고 원인과 선택지를 task에 기록한 뒤 사용자에게 다시 확인한다.

## Plan

1. 정적 배열을 `apps/web/data/products.ts`로 옮기고 Catalog 전용 type과 `QUOTE_REQUIRED | DIRECT_PURCHASE` 표시 계약을 정의한다.
2. Button과 LinkButton을 semantic element별로 구현하고 shared CSS Module에 `primary`·`secondary`, hover·active·disabled와 44px minimum target을 작성한다.
3. SiteHeader를 구현해 brand link, skip link, Home·Products list, 현재 route와 mobile disclosure state를 제공한다.
4. Root layout에 SiteHeader를 배치하되 page의 `<main>`은 각 route가 소유하게 유지한다.
5. Home에서 전체 Product 목록을 제거하고 Shop 소개와 `/products` LinkButton만 남긴다.
6. ProductCard를 category, title, description과 구매 방법 순서의 article로 구현한다. `DIRECT_PURCHASE`는 `온라인 구매`, `QUOTE_REQUIRED`는 `견적 문의`로 표시한다.
7. ProductGrid를 semantic list로 구현하고 기존 640px·1024px breakpoint에서 1열·2열·3열로 바꾼다.
8. `/products`에 page heading, 설명과 ProductGrid를 배치하고 route metadata를 추가한다.
9. `apps/web/package.json`의 lint 범위를 새 source 디렉터리까지 확장한다.
10. lint, typecheck와 production build를 순차적으로 실행한다.
11. Browser에서 route 이동, mobile disclosure, keyboard, semantic state, 375px·768px·1280px layout, 200% text 확대와 overflow를 검증한다.
12. `git diff`, `git diff --check`와 최종 status를 검토하고 실제 변경·문제·검증 결과를 task와 관련 context·design 원본에 갱신한다.

## Verification Plan

### 자동 검증

- `pnpm.cmd lint` — `app`, `components`, `data`와 `next.config.ts`의 format·lint 검사
- `pnpm.cmd typecheck` — Catalog data, component prop와 Next.js route 타입 검사
- `pnpm.cmd build` — `/`와 `/products` static page 생성 및 CSS Module production bundling 확인
- `git diff --check` — whitespace 오류 확인
- `git status --short` — 계획한 파일 이외의 변경 확인

현재 unit test runner가 없고 이번 범위에는 계산이나 상태 전이 domain logic이 없으므로 새 test dependency는 추가하지 않는다. Mobile disclosure는 browser 상호작용 검증으로 확인한다.

### Browser와 수동 검증

- Home의 primary CTA, brand와 주요 navigation으로 `/`와 `/products`를 왕복한다.
- `/products`에 Product 세 건이 data 순서대로 한 번씩 표시되는지 확인한다.
- NITRO는 `견적 문의`, 나머지 직접 구매 후보는 `온라인 구매`로 표시되는지 확인한다.
- Home과 Catalog에서 반복적인 Demo·공식 정보 notice가 제거되고 SiteHeader의 `Shop Demo` label만 남았는지 확인한다.
- 375px에서 menu button만 보이는 초기 상태, 열림·닫힘, link 한 열 배치, ProductGrid 1열과 horizontal overflow 부재를 확인한다.
- 768px에서 menu button이 숨겨지고 horizontal nav, inline Home CTA와 ProductGrid 2열이 적용되는지 확인한다.
- 1280px에서 header 정렬, 32px gutter, 제한된 읽기 폭과 ProductGrid 3열이 적용되는지 확인한다.
- 375px에서 text를 200%로 확대해 header, CTA, card의 잘림과 horizontal overflow가 없는지 확인한다.
- Tab과 Shift+Tab으로 skip link, brand, menu button 또는 desktop nav, CTA와 외부 link를 논리적인 순서대로 이동한다.
- Mobile menu button을 Enter와 Space로 조작하고 `aria-expanded` 값과 controlled navigation의 표시 상태가 일치하는지 확인한다.
- 열린 Mobile menu에서 Escape를 누르면 menu가 닫히고 toggle button으로 focus가 돌아오는지 확인한다.
- 닫힌 Mobile menu의 link가 focus 순서에 남지 않는지 확인한다.
- 각 route의 현재 navigation link에 `aria-current="page"`가 있고 route마다 `h1` 하나와 `main#main-content` 하나가 있는지 확인한다.
- 모든 interactive element의 visible focus가 header나 card 경계에 잘리지 않고 link·button target 높이가 44px 이상인지 확인한다.
- Header와 Product card의 새 색상 조합이 기존 검증 token을 사용하며 text·focus 식별을 색상 하나에만 의존하지 않는지 확인한다.

## Changes

- `tasks/004-shop-catalog.md`를 추가해 구현 전 선택지, 권장안, 범위, 변경 파일, 완료 조건과 검증 계획을 기록했다.
- `apps/web/data/products.ts`로 정적 Catalog data와 `CatalogProduct`·`CatalogPurchaseMode` UI type을 분리했다. 가격, 재고, image와 API abstraction은 추가하지 않았다.
- `Button`과 `LinkButton`을 분리하고 같은 CSS Module에서 `primary`·`secondary`, hover·active·disabled와 44px minimum target을 구현했다.
- Root layout에 공통 SiteHeader를 배치하고 Home·Products navigation, `aria-current`, mobile disclosure와 skip link를 구현했다.
- Mobile disclosure는 SiteHeader 내부에서만 state를 사용하는 Client Component로 만들고 나머지 새 route·component는 Server Component로 유지했다.
- Home에서 전체 Product 목록을 제거하고 Shop 소개와 `/products` CTA만 제공하게 했다.
- 사용자 검토를 반영해 hero 아래의 `Shop의 역할` section과 `Demo boundary` notice를 제거했다. Hero에서도 `Learning Demo` 같은 프로젝트 해설 문구를 빼고 제품 탐색에 필요한 짧은 소개만 남겼다. 제거한 영역에서만 사용하던 CSS도 함께 정리했다.
- `/products` route와 metadata를 추가하고 정적 Product 세 건을 ProductGrid와 ProductCard로 렌더링했다.
- Catalog의 `공식 정보와 Demo 판매 조건` notice를 제거하고 section heading을 `제품`으로 단순화했다. ProductCard의 `학습용 Demo 구매`는 `온라인 구매`로, `판매 방식`은 `구매 방법`으로 바꿨다.
- ProductGrid는 기존 640px·1024px breakpoint에서 1열·2열·3열로 전환하며 ProductCard는 category, title, description과 판매 방식만 표시한다.
- 각 route와 component에 CSS Module을 나란히 배치하고 기존 `globals.css` foundation은 수정하지 않았다.
- Skip link가 위치만 이동하지 않고 본문 landmark로 focus를 옮기도록 각 `main#main-content`에 `tabIndex={-1}`를 추가했다.
- Next.js 16이 내부 route 이동 중 기존 smooth scrolling을 일시 해제할 수 있도록 root `<html>`에 `data-scroll-behavior="smooth"`를 추가했다.
- `apps/web/package.json`의 lint 대상을 `components`와 `data`까지 넓혔다. Dependency 선언과 lockfile은 변경하지 않았다.
- `docs/context/project-overview.md`, `docs/context/architecture-overview.md`와 `docs/design/shop-ux-strategy.md`를 실제 Catalog 구현 상태에 맞춰 갱신했다.

## Problems Encountered

- 첫 문서 읽기에서 PowerShell의 기본 출력 인코딩 때문에 한글이 깨졌다. UTF-8을 명시해 필수 문서 전체를 다시 읽었으며 깨진 출력은 판단 근거로 사용하지 않았다.
- Git이 사용자 전역 ignore 파일에 접근하지 못했다는 경고를 표시했다. Repository의 branch와 status 확인에는 영향을 주지 않았으며 작업 트리는 깨끗했다.
- 첫 대형 patch는 같은 `page.tsx`를 한 patch 안에서 삭제하고 다시 추가하려 해 검증 단계에서 거부되었다. 해당 patch의 변경은 하나도 적용되지 않았다.
- 이 worktree에는 `node_modules`가 없었고 offline 설치에는 Next.js 16.3.3 tarball이 부족했다.
- 첫 lint는 apply patch가 만든 LF 줄바꿈과 Biome format 차이로 실패했다. 자동 수정 과정에서는 정적 `<header>`에 `onKeyDown`을 둔 구조가 `noStaticElementInteractions` 규칙에 걸렸다.
- `pnpm --filter ... exec biome` 경로에서는 Windows가 Biome 실행 파일을 찾지 못했다.
- Orca computer-use는 앱이 실행 중이었지만 runtime이 `runtime_unavailable` 상태여서 desktop browser를 조작할 수 없었다.
- DevTools Protocol의 첫 Enter key simulation은 `rawKeyDown`과 `keyUp`만 보내 native button activation을 발생시키지 못했다.
- Skip link를 처음 검증했을 때 hash와 scroll 위치는 바뀌었지만 active element는 `body`에 남았다.
- Next.js 개발 서버는 내부 route 이동 중 root의 smooth scrolling을 감지해 `data-scroll-behavior="smooth"`가 없다는 경고를 출력했다. 또한 `apps/web/AGENTS.md`와 `apps/web/CLAUDE.md`를 자동 생성했다.
- Home 조정 후 `--window-size=375`로 만든 첫 Edge screenshot은 browser chrome의 최소 창 너비 때문에 실제 375px CSS viewport를 재현하지 못했다.

## Resolution

- 문서와 source를 읽는 PowerShell 명령에 UTF-8 console encoding과 `Get-Content -Encoding utf8`을 명시했다.
- Git 경고와 repository status를 구분했으며 삭제나 Git 설정 변경은 수행하지 않았다.
- 파일 추가와 기존 `page.tsx` 교체 patch를 나눠 적용했다.
- 사용자 승인으로 `pnpm.cmd install --frozen-lockfile`을 실행해 고정된 lockfile 그대로 dependency link를 복원했다.
- Package lint script에 `--write`를 전달해 Windows checkout에 맞게 format하고, Escape handler는 header가 아니라 native menu button과 navigation link에 연결했다.
- Biome 직접 실행 경로 대신 정상 동작하는 `pnpm.cmd --filter @phytoworks/web lint --write`를 사용했다.
- computer-use의 다른 실행 파일로 우회하지 않고 별도 workspace profile의 headless Edge와 DevTools Protocol로 responsive·keyboard·focus를 검증했다.
- Enter simulation에 `char` event를 포함해 native button activation을 재현했다. Space는 keyDown·keyUp만으로 정상 동작했다.
- 두 page의 `main#main-content`에 `tabIndex={-1}`를 추가한 뒤 skip link가 `main`으로 focus를 옮기는 것을 다시 확인했다.
- Next.js 16 공식 경고 문서를 확인하고 root `<html>`에 `data-scroll-behavior="smooth"`를 선언했다.
- Home의 mobile 재검증에는 DevTools Protocol의 device metrics를 사용해 CSS viewport를 375px로 직접 지정했다.
- 검증이 끝난 뒤 이 worktree에 한정된 개발 server와 headless Edge process를 종료하고 임시 profile·screenshot·검증 script 및 자동 생성된 agent rule 파일을 제거했다.

## Verification

- 필수 문서, 관련 context·ADR·task, 현재 source와 config를 읽었다.
- branch `uiuuymin/shop-catalog`, 기준 commit `c6bf7db`와 깨끗한 초기 status를 확인했다.
- Next.js 16의 `Link`와 CSS Modules 동작을 공식 문서로 확인했다.
- WAI의 disclosure navigation, keyboard, focus와 target size 기준을 확인했다.
- `pnpm.cmd lint` → 성공, Biome가 `app`, `components`, `data`와 `next.config.ts`의 17개 파일 검사
- `pnpm.cmd typecheck` → 성공, `tsc --noEmit`
- `pnpm.cmd build` → 성공, `/`, `/products`와 `/_not-found` static page 생성
- Headless Edge의 실제 CSS viewport를 375px·768px·1280px로 설정해 확인했다.
  - 375px → ProductGrid 1열, card width 328px, menu button 45px, navigation 초기 `display: none`
  - 768px → ProductGrid 2열, card width 341px, menu button 숨김, navigation link 높이 44px
  - 1280px → ProductGrid 3열, card width 384px, menu button 숨김, navigation link 높이 44px
  - 세 viewport 모두 document `scrollWidth`와 `clientWidth`가 같아 horizontal overflow가 없었다.
- 375px에서 Enter와 Space로 mobile menu가 열리고 `aria-expanded="true"`, navigation `display: block`과 link 높이 44px가 함께 적용되는 것을 확인했다.
- 열린 menu의 link에서 Escape를 누르면 menu가 닫히고 focus가 menu button으로 돌아오는 것을 확인했다.
- 첫 Tab focus는 `본문으로 건너뛰기` link이고 3px focus outline이 표시되었다. Enter로 활성화하면 hash가 `#main-content`로 바뀌고 active element가 `main#main-content`가 되었다.
- 375px에서 root font를 32px로 바꾸는 200% text 확대 후에도 document와 body의 scroll width가 client width와 같았다.
- Home의 Catalog LinkButton은 375px content width 328px를 채우고 높이는 45px였다. Home에는 ProductCard가 없으며 `h1`과 `main`이 각각 하나였다.
- 최종 조정한 Home과 `/products`를 실제 375px CSS viewport와 1280px 화면에서 다시 확인했다. `Shop의 역할`, `Demo boundary`와 `공식 정보와 Demo 판매 조건` 영역은 모두 제거되었고 두 route의 `aside` 수는 0개였다. 두 viewport에서 document `scrollWidth`와 `clientWidth`는 같았다.
- Home CTA로 `/products`, SiteHeader의 Home link로 `/`에 실제 이동했으며 각 route의 heading과 `aria-current`가 함께 바뀌었다.
- `/products`에는 Product 세 건이 data 순서대로 표시되고 NITRO는 `견적 문의`, 나머지 두 건은 `온라인 구매`로 표시되었다.
- 375px mobile menu open, 768px·1280px Product Catalog와 375px Home screenshot을 직접 확인했다. Dark palette, 정보 위계, line wrapping과 grid가 의도대로 보였고 검증 후 screenshot은 제거했다.
- SiteHeader의 `Shop Demo` label, route별 `h1` 하나, `main` 하나, Product list와 article semantics를 확인했다. Home과 Catalog에는 별도 Demo·공식 정보 notice가 없다.
- 전체 Markdown local link 검사 → 내부 link 49개 확인, missing 0개
- 변경 대상 20개 파일의 trailing whitespace 검사 → 0건
- `git diff --check` → 성공. LF→CRLF 메시지는 Git line-ending 안내이며 whitespace 오류가 아니다.
- 최종 status → 계획한 tracked 파일 6개 수정과 runtime·task 파일 14개 추가만 확인

## Diff Review

- Runtime 변경은 계획한 root layout, Home, `/products`, 역할별 component, 정적 data와 CSS Module로 제한했다.
- `globals.css`, dependency 선언, lockfile, domain 문서와 ADR은 변경하지 않았다.
- Product Detail, Cart, API·DB, 실제 brand asset, animation과 사용처가 없는 범용 component는 diff에 없다.
- 검증용 script, profile, screenshot, 개발 server가 만든 agent rule 파일은 최종 diff에 남지 않았다.
- 최종 변경 파일 20개가 `Files Planned to Change`에 기록한 범위와 일치하며 `globals.css`, package lock과 범위 밖 파일은 status에 없다.
- 사용자가 VS Code에서 특히 확인할 부분은 SiteHeader의 client 경계·keyboard 처리, Button·LinkButton 의미 분리, Home과 `/products` 역할, ProductGrid·ProductCard 경계와 `data/products.ts`의 Demo 계약이다.

## Follow-up

- Product Detail task에서 Product URL 식별 방식, card 또는 title의 상세 link, gallery와 판매 방식별 CTA를 별도로 결정한다.
- Cart task 전에 직접 구매 Product의 가격·재고와 API·DB 신뢰 경계를 확정한다.
- 지원 browser 범위와 전체 WCAG 적합성 audit은 별도 task에서 검토한다.

## Lessons Learned

- navigation을 일반적인 site link 목록으로 유지하면 ARIA menu widget의 복잡한 keyboard 계약을 추가하지 않고도 mobile disclosure를 구현할 수 있다.
- Button과 LinkButton의 semantic 책임을 먼저 나누면 시각적으로 같은 CTA라도 동작과 이동의 차이가 호출부에 드러난다.
- Product Detail이 없는 단계에서는 card의 재사용 가능성보다 존재하지 않는 행동을 암시하지 않는 정보 구조가 우선이다.
- 정적 data를 분리하더라도 이름과 문서에서 API·DB의 최종 domain model이 아님을 밝혀야 임시 UI 계약이 서비스 규칙으로 오해되지 않는다.
- 새 source 디렉터리를 만들 때에는 typecheck뿐 아니라 기존 lint script가 실제로 그 디렉터리를 검사하는지도 함께 확인해야 한다.
- Skip link는 목적지 `id`와 scroll 이동만 확인하지 않고 실제 active element가 본문 landmark로 바뀌는지도 검증해야 한다.
- Browser automation에서는 synthetic key event가 native activation에 필요한 `char` event를 생략할 수 있으므로, 실패가 component 동작인지 입력 simulation 한계인지 focus와 event sequence를 함께 확인해야 한다.
- Next.js 16에서 global smooth scrolling과 내부 Link navigation을 함께 사용하면 root의 `data-scroll-behavior` 계약을 확인해야 한다.
