# Task: Cart 상태와 화면 구조 선택 및 구현

**Status:** 구현 완료

## Goal

PhytoWorks Shop에서 `DIRECT_PURCHASE` Product를 실제로 담고 관리할 수 있는 Cart를 구현하기 전에 page와 component의 책임, browser 상태 경계, 저장 정책, 수량 규칙, 오류 복구, responsive layout과 접근성 기준을 확정한다. 사용자 승인 후에는 Product Detail의 Add to Cart 동작부터 `/cart`의 수량 변경과 제거까지 Browser와 Next.js web 내부에서 완결되는 범위만 구현한다.

이번 task의 완료 조건은 다음과 같다.

- `DIRECT_PURCHASE` Product Detail에 실제로 동작하는 `장바구니 담기` button이 있다.
- 같은 Product를 다시 담으면 CartItem을 새 줄로 추가하지 않고 기존 한 줄의 수량을 1만큼 늘린다.
- `/cart`에서 각 Product의 수량을 1 이상의 정수로 변경하고 명시적으로 제거할 수 있다.
- 단일 항목 제거 직후에는 같은 수량으로 되돌릴 수 있는 Undo 동작을 제공한다.
- Cart가 비어 있으면 유효한 `/products` link를 제공한다.
- Cart state는 App Router의 내부 route 이동과 같은 browser의 새로고침 후에도 유지된다.
- `QUOTE_REQUIRED` Product는 Add to Cart CTA를 받지 않으며 CartItem으로 저장되거나 렌더링되지 않는다.
- 저장된 Product ID가 존재하지 않거나 현재 `DIRECT_PURCHASE`가 아니면 안전하게 제외한다.
- 손상된 저장 data, 지원하지 않는 schema와 `localStorage` 접근 실패가 application 오류로 이어지지 않는다.
- 가격 data가 없으므로 합계, 소계, 무료, 할인, 배송비, 세금, 통화와 Checkout CTA를 표시하지 않는다.
- 375px, 768px와 1280px에서 Cart 정보와 조작 영역이 의도한 구조로 배치되고 horizontal overflow가 없다.
- keyboard, visible focus, heading, landmark, 상태 변경 알림, button label과 수량 입력의 접근성 기준을 지킨다.
- lint, typecheck와 production build가 통과하고 저장·복원 및 Cart 조작 시나리오를 browser에서 확인한다.

## Context

현재 Product Catalog와 Product Detail은 `apps/web/data/products.ts`의 정적 Product 세 건을 Server Component에서 렌더링한다. NITRO는 `QUOTE_REQUIRED`이며 공식 PhytoWorks 문의 link를 제공한다. Thermal Imaging Module과 Chlorophyll Fluorescence Module은 학습용 Shop에서만 `DIRECT_PURCHASE`로 분류한 Demo Product이지만, Cart가 없으므로 Product Detail에는 구매 방법 정보만 있고 구매 CTA는 없다.

이번 단계에서는 API, Customer, Order, Checkout, Payment, 가격과 재고의 신뢰 가능한 source를 만들지 않는다. 따라서 Cart는 주문 가능 여부나 금액을 보장하는 domain object가 아니라, browser에서 Product ID와 요청 수량을 임시로 보관하는 학습용 선택 목록이다. Cart에 저장된 값은 향후 주문 금액, 재고나 직접 구매 가능 여부를 확정하는 자료로 신뢰해서는 안 된다.

이번 구현 뒤의 요청 및 상태 경로는 다음과 같다.

```text
최초 화면 요청
Browser → Next.js Server Component → 정적 Product data → HTML → Browser

Cart 조작과 복원
Browser event → CartProvider reducer → browser memory → localStorage
Browser reload → server HTML → CartProvider hydration → localStorage 검증 → Cart UI
```

NestJS와 PostgreSQL은 이번 경로에 포함되지 않는다. 향후 API 기반 Cart를 구현할 때에는 browser 저장소를 신뢰 경계 밖의 입력으로 취급하고 서버가 Product와 수량을 다시 검증해야 한다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/company-reference.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/design/shop-ux-strategy.md`
- `docs/domain/product.md`
- `docs/domain/cart.md`
- `docs/adr/README.md`
- `docs/adr/001-use-pnpm-workspace.md`
- `tasks/README.md`
- `tasks/003-ui-foundation.md`
- `tasks/004-shop-catalog.md`
- `tasks/005-product-detail.md`
- Next.js Server and Client Components 공식 문서: <https://nextjs.org/docs/app/getting-started/server-and-client-components>
- React `useReducer` 공식 문서: <https://react.dev/reference/react/useReducer>

이번 선택은 `apps/web`의 학습 단계에서 쉽게 교체할 수 있는 browser 저장 구현이며 장기적인 Cart data 소유권을 확정하지 않는다. 서버 Cart, Customer 식별과 API 계약을 결정할 때에는 별도 task에서 ADR 필요성을 다시 평가한다.

## Implementation Baseline

- 현재 branch는 `uiuuymin/cart`이며 HEAD는 기준 commit `6aa5e60 Product Detail 상세 화면 구현`과 일치한다.
- 계획 작성 전 `git status --short --branch`에서 repository 변경 사항이 없는 깨끗한 worktree를 확인했다.
- 직접 작성한 route는 `/`, `/products`와 `/products/[productId]`이며 `/cart`는 아직 없다.
- Root layout은 공통 SiteHeader와 각 route의 Server Component `children`을 렌더링한다.
- SiteHeader만 현재 route와 mobile disclosure state가 필요해 Client Component다. Navigation에는 Home과 Products만 있다.
- Product data에는 `id`, 이름, category, 설명, `purchaseMode`와 상세 정보가 있지만 가격, 재고와 활성 상태는 없다.
- Product ID는 `nitro`, `thermal-imaging`과 `chlorophyll-fluorescence`이며 최종 DB 식별자 형식이 아닌 정적 UI 계약이다.
- `ProductPurchasePanel`은 Server Component다. `QUOTE_REQUIRED`에는 공식 문의 link가 있고 `DIRECT_PURCHASE`에는 구매 CTA가 없다.
- 공통 `Button`은 native button 동작을, `LinkButton`은 내부 route 이동을 담당하며 `primary | secondary` variant만 제공한다.
- CSS는 전역 token·reset·focus·container를 `globals.css`에 두고 route 및 component별 표현은 CSS Modules로 나눈다.
- 기존 breakpoint는 40rem과 64rem이며 375px, 768px와 1280px이 Mobile, Tablet과 Desktop 검증 기준이다.
- 외부 상태 관리 dependency와 test runner는 없다. 자동 검증은 현재 lint, typecheck와 build를 중심으로 구성되어 있다.
- Cart domain의 한 줄 병합과 최소 수량 1은 Proposed이며, 수량 0 처리와 저장 방식은 아직 `TBD`다.

## Information and Trust Boundary

이번 Cart가 저장하는 값은 Product ID와 수량뿐이다.

```ts
type StoredCartV1 = {
  version: 1;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};
```

- Product 이름, category, 설명과 `purchaseMode`는 저장하지 않고 현재 정적 Product data에서 다시 조회한다.
- 가격, 통화, 재고, 할인, 세금, 배송비와 Product snapshot을 저장하거나 새로 만들지 않는다.
- `localStorage`는 같은 browser에서 Cart를 복원하기 위한 임시 편의 저장소일 뿐이다.
- browser 사용자가 저장 내용을 바꿀 수 있으므로 저장된 Product ID와 수량은 신뢰할 수 없는 입력으로 검증한다.
- 현재 Cart의 수량은 구매 가능 수량이나 재고 예약을 의미하지 않는다.
- 향후 주문을 생성할 때에는 서버가 Product의 존재, 활성 상태, 직접 구매 가능 여부, 최신 가격과 재고를 다시 검증해야 한다.

화면에는 이 내부 신뢰 경계를 설명하는 장문의 Demo 안내를 추가하지 않는다. 기존 SiteHeader의 `Shop Demo` label을 유지하며, 저장 실패처럼 현재 동작에 직접 영향을 주는 짧은 상태만 사용자에게 알린다.

## Options Considered

### `/cart` page와 Cart 전용 component의 책임

#### 1. `/cart/page.tsx` 하나를 Client Component로 만들고 모든 상태 및 markup을 작성한다

- 장점: 처음 만드는 파일 수가 적고 route에서 전체 동작을 한 번에 볼 수 있다.
- 단점: metadata, page shell, 저장소 접근, reducer, list rendering, 수량 입력과 responsive style이 한 파일에 섞인다. Product Detail과 SiteHeader가 같은 Cart state를 사용할 수도 없다.

#### 2. Page는 Server Component로 유지하고 상호작용 영역만 Cart 전용 Client Component로 나눈다

- 장점: `/cart/page.tsx`는 metadata, `main`, `h1`과 page 소개를 담당하고, `CartView`는 hydration·empty·item list 상태를 담당한다. `CartLineItem`은 Product 한 건의 수량 및 제거 UI만 담당하므로 변경 이유가 분명하다.
- 단점: route와 feature component 사이에 파일이 추가된다.

#### 3. Cart table, summary, empty state와 quantity를 모두 범용 component로 먼저 만든다

- 장점: Checkout 등에서 일부 표현을 재사용할 가능성이 있다.
- 단점: 가격과 Checkout이 없는 현재 단계에서 사용처가 없는 추상화가 생긴다. Mobile card와 Desktop table에 서로 다른 markup을 만들 가능성도 커진다.

**선택:** Option 2를 선택한다.

- `/cart/page.tsx`는 Server Component로서 metadata와 page landmark를 소유한다.
- `CartView`는 hydration, empty, non-empty, Undo와 저장 실패 상태를 분기한다.
- `CartLineItem`은 Product link, category, 수량 입력, 증가·감소와 제거 button을 소유한다.
- `AddToCartButton`은 Product Detail에 들어가는 작은 Client Component이며 Context action만 호출한다.
- 가격이 없으므로 `CartSummary`, price component와 sticky summary를 만들지 않는다.

### Cart state를 두는 Client Component 경계

#### 1. Product Detail과 `/cart`가 각각 별도 state를 가진다

- 장점: 각 Client Component가 독립적이며 Provider가 필요 없다.
- 단점: route 이동 시 서로 다른 Cart가 생기고 SiteHeader count, Product Detail과 `/cart`의 상태를 일치시킬 수 없다.

#### 2. `/cart` route 안에만 CartProvider를 둔다

- 장점: Cart 화면 밖에서는 Provider가 hydration되지 않는다.
- 단점: Product Detail의 Add to Cart가 같은 state에 접근할 수 없으며 route 이동 전에 별도 저장소 API를 직접 호출해야 한다. 상태 변경과 persistence 책임이 분산된다.

#### 3. Root layout 안에 CartProvider를 한 번 두고 SiteHeader와 route content를 감싼다

- 장점: Product Detail, SiteHeader와 `/cart`가 같은 state 및 action 계약을 사용한다. Root layout이 유지되는 App Router 내부 이동에서는 memory state가 보존되고, 새로고침은 같은 Provider가 `localStorage`에서 복원한다.
- 단점: 모든 route에 작은 Provider가 hydration된다. 초기 server render와 browser 저장 data의 차이를 명시적으로 처리해야 한다.

**선택:** Option 3을 선택한다.

`app/layout.tsx`는 다음과 같은 경계를 사용한다.

```tsx
<body>
  <CartProvider>
    <SiteHeader />
    {children}
  </CartProvider>
</body>
```

Client Component인 Provider가 Server Component `children`을 prop으로 받는다고 해서 모든 page source가 Client Component로 바뀌는 것은 아니다. Product 조회와 정적 page markup은 계속 server rendering 경계에 남고, Cart Context를 실제로 읽는 leaf만 client bundle과 event 처리를 가진다.

### Context, reducer와 개별 component state

#### 1. Context 없이 개별 component의 `useState`만 사용한다

- 장점: 한 component 안의 단순 입력에는 가장 적은 코드가 필요하다.
- 단점: 여러 route와 SiteHeader가 동일한 CartItem 목록을 공유할 수 없으며 persistence 처리도 반복된다.

#### 2. Context와 여러 `useState` setter를 사용한다

- 장점: dependency 없이 공통 state를 공유할 수 있고 현재 항목 수가 적을 때 이해하기 쉽다.
- 단점: 담기, 수량 변경, 제거, 복원과 Undo가 각 setter callback으로 흩어져 invariants를 한곳에서 검토하기 어렵다.

#### 3. Context는 state와 명령을 전달하고 reducer는 Cart 전이를 담당한다

- 장점: `hydrate`, `add`, `setQuantity`, `remove`, `undoRemove` 전이를 순수한 함수로 모을 수 있다. 같은 Product 병합과 최소 수량 규칙을 UI event와 분리해 확인할 수 있다.
- 단점: action type과 Provider API가 추가되어 단순 `useState`보다 코드가 길어진다.

#### 4. Module singleton과 `useSyncExternalStore`를 사용한다

- 장점: Provider 없이 여러 Client Component가 같은 browser store를 구독할 수 있다.
- 단점: module lifetime과 server rendering snapshot을 별도로 이해해야 하며, 현재 학습 범위에서는 state 소유 위치가 Context보다 덜 명시적이다. 향후 API 교체 시에도 singleton과 network cache의 관계를 다시 설계해야 한다.

**선택:** Option 3을 선택한다. Context는 component가 호출할 수 있는 `addItem`, `setQuantity`, `incrementItem`, `decrementItem`, `removeItem`과 `undoRemove` 명령을 제공한다. Reducer는 유효한 Cart state만 만들고, `localStorage` 읽기와 쓰기는 Provider의 effect 및 별도 storage helper가 담당한다.

수량 `<input>`이 편집 중인 빈 문자열을 잠시 표시해야 할 때에만 `CartLineItem`의 개별 `useState`를 사용한다. 이 draft는 domain state가 아니며 blur 또는 Enter에서 유효한 수량으로 확정하고, 취소되거나 유효하지 않으면 reducer의 마지막 수량으로 되돌린다.

### Memory state와 `localStorage`

#### 1. Root Provider의 memory state만 사용한다

- 장점: hydration mismatch, schema version, 손상된 JSON과 storage 접근 실패를 처리할 필요가 없다. App Router 내부 이동에서는 Root layout이 유지되는 동안 상태가 유지된다.
- 단점: 새로고침, browser 종료와 다시 열기에서 Cart가 사라진다. 실제 쇼핑몰 관점에서 사용자가 선택한 항목을 너무 쉽게 잃는다.

#### 2. `localStorage`에 Product ID와 수량을 저장한다

- 장점: 로그인과 서버 없이도 같은 origin 및 browser profile에서 route 이동과 새로고침 뒤 Cart를 복원할 수 있다. 이번 단계의 browser 편의 기능에 필요한 범위를 충족한다.
- 단점: server render에서 접근할 수 없으며 값이 손상되거나 사용자가 수정할 수 있다. 기기 간 공유, Customer 식별, transaction과 신뢰 가능한 가격·재고 검증을 제공하지 않는다.

**선택:** Option 2를 선택한다. 저장 key는 version을 포함한 `phytoworks-shop.cart.v1`로 두고 payload에도 `version: 1`을 기록한다. 저장소 사용이 불가능하면 현재 tab의 memory state로 계속 동작하되, 새로고침 유지가 보장되지 않는다는 짧은 상태를 알린다.

다음 항목은 이번 localStorage 정책에 포함하지 않는다.

- 여러 tab 사이의 실시간 동기화
- 기기나 browser 사이의 Cart 공유
- 로그인 Customer와의 병합
- 만료 시점과 장기 보관 정책
- 가격, 재고와 판매 조건 cache

### Hydration, 손상된 data와 schema 변경

#### 1. `useState` lazy initializer에서 곧바로 `localStorage`를 읽는다

- 장점: browser에서 첫 state를 바로 만들 수 있다.
- 단점: server에는 `window`가 없고 server HTML의 빈 Cart와 browser 첫 render의 저장 Cart가 달라 hydration mismatch가 생길 수 있다.

#### 2. Server와 첫 client render는 미복원 상태로 맞추고 mount effect에서 복원한다

- 장점: server HTML과 hydration의 첫 결과가 일치한다. 저장 data를 검증한 뒤 한 번에 reducer로 전달할 수 있고, 복원 전에 빈 Cart를 저장해 기존 data를 덮어쓰는 실수도 막을 수 있다.
- 단점: 새로고침 직후 짧은 복원 상태가 필요하며 Cart count와 내용이 hydration 뒤 나타난다.

#### 3. Cart UI 전체의 server rendering을 끈다

- 장점: browser storage 접근만 고려하면 된다.
- 단점: heading과 empty/loading 구조까지 client JavaScript에 의존하고, Product Detail의 작은 Add to Cart leaf만 hydration한다는 기존 원칙과 맞지 않는다.

**선택:** Option 2를 선택한다.

- Provider의 초기 state에는 `hasHydrated: false`를 둔다.
- Server와 hydration의 첫 render에서 SiteHeader는 유효한 `/cart` link를 표시하되 count는 아직 표시하지 않는다.
- `/cart`는 확정되지 않은 empty state 대신 짧은 `장바구니를 불러오고 있습니다.` 상태를 표시한다.
- Add to Cart button은 복원이 끝날 때까지 같은 label을 유지한 채 잠시 disabled되며, 복원 완료 뒤 실제 동작한다.
- 저장 effect는 `hasHydrated`가 true가 된 뒤에만 실행하여 복원 전의 빈 state가 기존 저장 data를 덮어쓰지 않게 한다.

Storage helper는 다음 순서로 data를 정규화한다.

1. `localStorage.getItem`과 `JSON.parse`를 `try/catch` 안에서 실행한다.
2. 최상위 값이 object인지, `version === 1`인지, `items`가 배열인지 확인한다.
3. 각 항목의 `productId`가 문자열이며 `quantity`가 1 이상의 안전한 정수인지 확인한다. 이 안전한 정수 조건은 JavaScript 수치 손상을 막는 기술 경계이며 판매 수량 정책이 아니다.
4. 현재 정적 Product data에서 ID를 찾고 `purchaseMode === "DIRECT_PURCHASE"`인 항목만 남긴다.
5. 중복 Product ID는 한 줄로 합치되 합산 결과가 안전한 정수인 경우에만 보존한다.
6. 일부 항목만 잘못되었으면 잘못된 항목만 제외하고 유효한 항목을 유지한다.
7. JSON 전체가 손상되었거나 지원하지 않는 version이면 해당 저장 값을 제거하고 빈 Cart로 복구한다.
8. 정규화한 결과를 hydration 이후 다시 저장하여 존재하지 않는 ID와 잘못된 항목이 반복해서 복원되지 않게 한다.

향후 schema가 바뀌면 새 key 또는 `version` 분기와 명시적인 migration을 추가한다. 의미가 확인되지 않은 구버전 값을 추측해 변환하지 않으며, migration을 정의하지 않은 version은 빈 Cart로 안전하게 복구한다.

### 같은 Product를 다시 담는 규칙

#### 1. Add to Cart를 누를 때마다 새 CartItem 줄을 만든다

- 장점: 각 담기 event를 그대로 보존한다.
- 단점: 같은 Product가 여러 줄에 흩어져 수량과 제거 동작을 이해하기 어렵고 현재는 option이나 seller처럼 줄을 구분할 속성이 없다.

#### 2. Product ID별로 한 줄만 두고 다시 담으면 수량을 1 늘린다

- 장점: 현재 Product에 option 조합이 없으므로 Cart의 구조가 명확하다. 기존 Cart domain의 Proposed 규칙과도 일치한다.
- 단점: 향후 Product option이 생기면 `productId`만으로 동일한 CartItem을 판단할 수 없어 line key를 확장해야 한다.

**선택:** Option 2를 선택한다. 현재 CartItem identity는 `productId`이며 Product Detail의 `장바구니 담기`를 한 번 누를 때 수량 1을 추가한다. 같은 Product가 이미 있으면 기존 수량에 1을 더한다. 향후 option을 도입할 때에는 option 조합을 포함한 CartItem identity를 별도 task에서 다시 결정한다.

### 수량 최솟값, 증가, 감소, 0과 제거

#### 1. 감소 button을 수량 1에서 누르거나 input에 0을 입력하면 항목을 삭제한다

- 장점: 조작 횟수가 줄고 일부 쇼핑몰에서 익숙한 동작이다.
- 단점: 수량 수정이 삭제라는 별도 결과를 암시하므로 keyboard 및 screen reader 사용자에게 예상하기 어려울 수 있다. 잘못 입력한 0 때문에 항목이 사라질 수도 있다.

#### 2. 수량은 항상 1 이상이며 삭제는 명시적인 제거 button만 수행한다

- 장점: 수량 변경과 삭제의 의미가 분리되고 실수로 항목을 잃을 가능성이 낮다. `min=1`과 domain invariant가 일치한다.
- 단점: 수량 1에서 항목을 없애려면 별도의 제거 button을 사용해야 한다.

**선택:** Option 2를 선택한다.

- 수량의 최솟값은 1이며 정수만 허용한다.
- 증가 button은 수량을 1 늘린다.
- 감소 button은 수량이 2 이상일 때 1 줄이고, 수량 1에서는 disabled한다.
- 수량 input에 0, 음수, 소수, 빈 값의 확정이나 숫자가 아닌 값을 제출해도 삭제하지 않는다. 마지막 유효 수량으로 되돌리고 `수량은 1 이상의 정수여야 합니다.`라고 알린다.
- 별도의 `Product 이름 제거` button만 항목을 삭제한다.
- 최대 구매 수량과 재고 제한은 정하지 않는다. JavaScript의 안전한 정수 범위만 data 손상을 막기 위한 기술 검증으로 사용한다.

기존 UX strategy의 Proposed 규칙에 따라 단일 항목 제거는 즉시 반영하고 Undo를 제공한다. Provider는 마지막으로 제거한 `{ productId, quantity }` 한 건을 memory에만 보관한다. `삭제 취소`를 누르면 같은 수량으로 한 줄을 복구한다. 다른 Cart mutation을 수행하면 이전 Undo 기회는 종료하며, Undo data는 localStorage에 저장하지 않는다. Confirm dialog, timer, animation과 여러 단계의 삭제 이력은 만들지 않는다.

### 판매 방식 경계와 Product Detail CTA

#### 1. 모든 Product에 Add to Cart button을 렌더링하고 handler에서 거부한다

- 장점: component 구조는 동일하다.
- 단점: `QUOTE_REQUIRED` 사용자에게 수행할 수 없는 구매 행동을 노출하고 공식 문의 흐름을 약화한다.

#### 2. `DIRECT_PURCHASE`에만 AddToCartButton을 렌더링하고 reducer도 Product data를 다시 확인한다

- 장점: 화면과 state 경계가 같은 규칙을 적용한다. UI를 우회하거나 저장 data를 수정해도 `QUOTE_REQUIRED` 항목은 Cart에 남지 않는다.
- 단점: Server Component의 판매 방식 분기와 browser action의 validation이 모두 필요하다.

**선택:** Option 2를 선택한다.

- `ProductPurchasePanel`은 계속 Server Component로 유지하고 `productId`를 추가로 받는다.
- `QUOTE_REQUIRED` 분기는 현재 공식 문의 설명과 link를 그대로 유지하며 Add to Cart 관련 markup을 렌더링하지 않는다.
- `DIRECT_PURCHASE` 분기만 `AddToCartButton` Client Component를 렌더링한다.
- Button은 기존 공통 `Button`을 사용하며 label은 `장바구니 담기`로 한다.
- 한 번 누르면 해당 Product의 수량을 1 늘리고 SiteHeader의 Cart count와 상태 알림을 갱신한다.
- Provider action과 storage hydration도 현재 Product data를 조회해 `DIRECT_PURCHASE` 여부를 검증한다.

### Empty state, 가격 없는 Cart와 다음 행동

#### 1. 가격을 임시로 만들고 합계 및 Checkout UI를 완성한다

- 장점: 일반적인 쇼핑몰 Cart처럼 보인다.
- 단점: 공식 정보가 아닌 금액, 통화와 판매 정책을 사용자 승인 없이 만들며 Checkout과 주문 경계도 존재하지 않는다.

#### 2. 합계와 Checkout을 생략하고 Product 및 수량 관리에 집중한다

- 장점: 현재 제공할 수 있는 기능만 정확하게 보여 준다. 가격이 없다는 사실을 무료로 오인하게 하는 표현도 피할 수 있다.
- 단점: 이 Cart만으로 주문이나 결제를 시작할 수 없으며 일반적인 Cart의 금액 검토 기능을 제공하지 못한다.

**선택:** Option 2를 선택한다.

- Empty state에는 `장바구니가 비어 있습니다` heading, 짧은 설명과 실제 `/products`로 이동하는 `제품 둘러보기` LinkButton을 제공한다.
- 항목이 있을 때에는 Product 종류 수와 총 수량처럼 가격과 무관한 사실만 표시할 수 있다. `합계`, `소계`, `주문 금액`, `무료`와 통화 표시는 사용하지 않는다.
- Product 이름은 유효한 `/products/[productId]` 상세 link로 제공한다.
- 비어 있지 않은 Cart에도 필요한 경우 `제품 더 둘러보기` link를 제공할 수 있지만, Checkout, 주문, 결제와 존재하지 않는 route로 연결하지 않는다.
- Checkout이 없는 현재 단계에는 Checkout button, disabled button, `준비 중` button과 대체 link를 렌더링하지 않는다.
- 가격 없는 Cart의 기능은 Product 선택 보존, 같은 Product 병합, 수량 관리와 제거까지다. 금액 확인, 판매 가능성 확정과 주문 전환은 이번 task의 명시적인 한계다.

### SiteHeader와 Cart count

SiteHeader에는 `/cart`가 같은 변경 안에서 실제로 생성될 때만 Cart navigation link를 추가한다. Hydration이 끝난 뒤 총 수량이 1 이상이면 text로 읽을 수 있는 count를 함께 표시한다. Badge의 숫자만으로 목적을 전달하지 않고 accessible name에 `장바구니, 총 3개`처럼 의미를 포함한다. Empty Cart에서는 불필요한 `0` badge를 표시하지 않는다.

Cart count는 서로 다른 Product 줄 수가 아니라 모든 CartItem 수량의 합이다. 합산 결과도 안전한 정수인지 확인한다. `/cart`와 하위 route가 생기면 Cart navigation의 현재 위치 판정은 Products와 같은 방식으로 확장할 수 있다.

### 375px, 768px와 1280px layout

같은 list markup과 DOM 순서를 유지하고 기존 40rem 및 64rem breakpoint를 재사용한다.

| 검증 viewport | Cart layout | CartLineItem | 다음 행동 |
| --- | --- | --- | --- |
| 375px | Page heading 다음에 hydration, empty 또는 item list를 한 열로 배치한다. | Product 정보, 수량 조작과 제거를 세로로 배치한다. Input과 button이 content 폭을 넘지 않으며 각 button은 최소 44px 조작 영역을 가진다. | Empty state와 Catalog link는 사용 가능한 폭을 채운다. Checkout 영역은 만들지 않는다. |
| 768px | Cart list는 container 안에서 한 열을 유지하되 item 내부를 Product 정보와 조작 영역의 두 열로 바꾼다. | Product 정보는 `minmax(0, 1fr)`, 수량과 제거는 내용 폭을 사용한다. DOM 순서는 Product 정보 다음에 조작 영역을 유지한다. | Catalog link는 content에 맞는 inline 폭을 사용한다. |
| 1280px | 가격 summary가 없으므로 빈 sidebar나 sticky panel을 만들지 않는다. 읽기와 조작 거리를 줄이도록 Cart content 폭을 제한한 list layout을 사용한다. | Product 정보, 수량 input 및 증가·감소와 제거를 명확한 열로 정렬한다. Table 전용 markup을 별도로 만들지 않는다. | 실제 목적지인 Product Catalog link만 제공한다. |

`docs/design/shop-ux-strategy.md`의 Desktop sticky summary 후보는 가격과 Checkout이 생겼을 때 다시 검토한다. 현재 빈 summary를 만들면 Cart가 금액이나 주문 전환을 제공하는 것처럼 오인될 수 있으므로 사용하지 않는다.

### Accessibility Criteria

#### Heading과 landmark

- `/cart`에는 `main#main-content` 하나와 `h1` 하나를 둔다.
- 기존 skip link가 focus를 전달할 수 있도록 `main`에 `tabIndex={-1}`를 유지한다.
- Cart item 목록은 `<ul>`과 `<li>`로 구성하고 각 item은 Product 이름을 식별 가능한 heading으로 제공한다.
- Empty state의 heading은 page `h1` 아래의 `h2`를 사용한다.
- Cart 상태 알림에는 `role="status"`와 `aria-live="polite"`를 사용하고 사용자의 입력 중인 focus를 강제로 이동하지 않는다.

#### 수량 입력과 button label

- 수량은 `type="number"`, `min="1"`, `step="1"`인 label이 연결된 input으로 제공한다.
- `inputMode="numeric"`은 mobile keyboard 편의로 사용할 수 있지만 native label과 validation을 대체하지 않는다.
- 각 줄의 button label에는 Product 이름을 포함한다. 예: `Thermal Imaging Module 수량 줄이기`, `Thermal Imaging Module 수량 늘리기`, `Thermal Imaging Module 제거`.
- 감소 button은 수량 1에서 native `disabled`를 사용하고 색상만으로 비활성 상태를 표현하지 않는다.
- icon-only button을 만들지 않으며 `+`, `−` 기호만 accessible name으로 사용하지 않는다.
- Tab 순서는 Product link, 수량 감소, 수량 input, 수량 증가, 제거 순서처럼 DOM 및 시각적 읽기 순서와 일치해야 한다.

#### 상태 변경 알림과 focus

- 같은 Product를 다시 담으면 `Product 이름을 장바구니에 담았습니다. 수량은 2개입니다.`처럼 병합 결과를 알린다.
- 수량 변경, 유효하지 않은 수량 복구, 제거와 Undo 결과를 같은 polite live region에서 알린다.
- SiteHeader count는 시각적 결과를 제공하고 live region은 screen reader 사용자가 변경을 확인하게 한다.
- 항목을 제거해도 자동으로 다른 control에 focus를 옮기지 않는다. 제거 뒤 표시되는 Undo button은 정상적인 DOM 순서에서 접근할 수 있어야 한다.
- keyboard 사용자는 Enter와 Space의 native button 동작, input 편집, Tab과 Shift+Tab만으로 모든 Cart 동작을 수행할 수 있어야 한다.
- 기존 전역 `:focus-visible` outline을 제거하지 않고 card, list와 sticky SiteHeader 경계에서 outline이 잘리지 않게 한다.

## Decision

다음 구조를 구현안으로 선택한다.

```text
apps/web/
├─ app/
│  ├─ layout.tsx
│  ├─ cart/
│  │  ├─ page.tsx
│  │  └─ page.module.css
│  └─ products/[productId]/
│     └─ page.tsx
├─ components/
│  ├─ cart/
│  │  ├─ AddToCartButton.tsx
│  │  ├─ CartLineItem.tsx
│  │  ├─ CartProvider.tsx
│  │  ├─ CartProvider.module.css
│  │  ├─ CartView.tsx
│  │  ├─ CartView.module.css
│  │  ├─ cart-state.ts
│  │  └─ cart-storage.ts
│  ├─ commerce/
│  │  ├─ ProductPurchasePanel.tsx
│  │  └─ ProductPurchasePanel.module.css
│  └─ layout/
│     ├─ SiteHeader.tsx
│     └─ SiteHeader.module.css
└─ data/
   └─ products.ts
```

- `CartProvider`만 Cart state, persistence와 공통 상태 알림을 소유한다.
- `cart-state.ts`는 browser API를 호출하지 않는 type, reducer와 Cart invariant를 소유한다.
- `cart-storage.ts`는 versioned payload parsing, 현재 Product data 기준 정규화와 `localStorage` 오류 처리를 소유한다.
- `CartView`와 `CartLineItem`은 같은 feature CSS Module을 공유해 list 및 line layout을 한곳에서 확인할 수 있게 한다.
- `AddToCartButton`은 기존 `Button`을 사용하므로 별도 CSS Module을 만들지 않는다. Panel 안의 배치는 `ProductPurchasePanel.module.css`가 소유한다.
- `/cart/page.module.css`는 page header와 route-level content 폭만 소유한다.
- 전역 token, reset, container, focus와 breakpoint는 `globals.css`에서 변경하지 않는다.

이 구조는 상태 전이, browser persistence, route layout과 Product 표현의 교체 경계를 분명히 하면서도 사용처가 없는 범용 component를 만들지 않는다.

## Future API Migration Boundary

향후 API 기반 Cart로 전환할 때 변경할 경계는 다음과 같다.

| 현재 경계 | API 기반 Cart에서의 변화 | 유지 가능한 부분 |
| --- | --- | --- |
| `cart-storage.ts` | localStorage read/write를 제거하고 API 조회 및 mutation으로 교체한다. | Version 검증의 자리는 API response schema 검증으로 바꿀 수 있다. |
| `CartProvider` | 초기 effect와 reducer 직접 mutation 대신 server state loading, optimistic update 및 오류 복구를 조정한다. | Component에 제공하는 `addItem`, `setQuantity`, `removeItem` 계약은 가능한 한 유지한다. |
| `cart-state.ts` | Server가 확정한 Cart ID, line ID와 validation error를 수용하도록 확장한다. | Client에서 필요한 순수 표시 전이는 일부 유지할 수 있다. |
| 정적 `products.ts` 조회 | 저장 ID를 정적 배열에 맞추는 처리를 제거하고 서버가 유효한 Product read model을 반환하게 한다. | Product Detail과 Product link의 표시 구조는 유지할 수 있다. |
| `CartView`, `CartLineItem`, `AddToCartButton` | Loading, API error와 mutation pending 표현을 추가한다. | Semantic markup, label, responsive layout과 사용자 action의 의미는 유지한다. |

API로 전환한 뒤에도 browser가 보낸 Product ID, 수량, 가격과 판매 가능 여부를 신뢰하지 않는다. NestJS는 Product 존재 여부, 활성 상태, `DIRECT_PURCHASE`, 최신 가격과 재고를 다시 검증해야 한다. Customer 식별, server Cart ownership과 localStorage Cart 병합은 이번 task에서 미리 정하지 않는다.

## Scope

### 포함하는 범위

- `/cart` route와 metadata
- Root CartProvider와 Context/reducer
- Product ID와 수량만 저장하는 version 1 localStorage schema
- hydration 완료 상태, 손상된 data와 저장 실패 처리
- 존재하지 않거나 직접 구매할 수 없는 Product ID 정리
- 같은 Product 한 줄 병합과 Add 시 수량 1 증가
- 수량 input, 증가·감소, 명시적인 제거와 한 건 Undo
- Product Detail의 `DIRECT_PURCHASE` Add to Cart CTA
- `QUOTE_REQUIRED`의 기존 공식 문의 흐름 유지
- SiteHeader의 유효한 Cart link와 hydration 이후 총 수량 표시
- Empty state와 `/products` 복귀 link
- 가격 없는 Cart의 Product 종류 수 및 총 수량 표시
- Cart 전용 component와 route별 CSS Module
- 375px, 768px와 1280px responsive layout
- keyboard, visible focus, heading, landmark, label과 live status 검증
- 구현 결과에 맞는 context, architecture, design, Product 및 Cart domain 문서와 이 task의 실행 기록 갱신

### 포함하지 않는 범위

- NestJS API, PostgreSQL, fetch, Server Action과 network cache
- Customer 식별, 로그인과 비회원 server session
- Checkout, Order, Payment, Toss Payments와 존재하지 않는 route
- 가격, 통화, 재고, 할인, 세금, 배송비와 금액 계산
- 재고 예약, 차감과 최대 구매 수량 정책
- Checkout button, disabled 준비 중 button과 기능이 없는 CTA
- 자체 견적 문의 form과 개인정보 처리
- 실제 PhytoWorks logo와 Product image
- Product option, variant, bundle과 CartItem option identity
- 여러 tab·기기 사이의 Cart 동기화와 localStorage 만료
- 삭제 confirm dialog, 여러 단계 Undo history와 timer
- animation, drag-and-drop과 toast animation
- 외부 상태 관리, validation, test와 UI dependency
- 사용처가 없는 범용 Summary, Table, Input, Toast, Modal과 Form component
- 지원 browser 범위 확정과 전체 WCAG 적합성 audit

## Files Planned to Change

### 새로 추가할 runtime 파일

- `apps/web/app/cart/page.tsx`
- `apps/web/app/cart/page.module.css`
- `apps/web/components/cart/AddToCartButton.tsx`
- `apps/web/components/cart/CartLineItem.tsx`
- `apps/web/components/cart/CartProvider.tsx`
- `apps/web/components/cart/CartProvider.module.css`
- `apps/web/components/cart/CartView.tsx`
- `apps/web/components/cart/CartView.module.css`
- `apps/web/components/cart/cart-state.ts`
- `apps/web/components/cart/cart-storage.ts`

### 수정할 runtime 파일

- `apps/web/app/layout.tsx`: SiteHeader와 route content가 같은 CartProvider를 사용하게 한다.
- `apps/web/app/products/[productId]/page.tsx`: Product ID를 ProductPurchasePanel에 전달한다.
- `apps/web/components/commerce/ProductPurchasePanel.tsx`: `DIRECT_PURCHASE`에만 AddToCartButton을 렌더링한다.
- `apps/web/components/commerce/ProductPurchasePanel.module.css`: Add to Cart CTA의 panel 내부 배치만 추가한다.
- `apps/web/components/layout/SiteHeader.tsx`: 실제 `/cart` navigation과 총 수량을 표시한다.
- `apps/web/components/layout/SiteHeader.module.css`: Cart count와 작은 화면의 navigation 배치를 추가한다.
- `apps/web/data/products.ts`: Cart에서 현재 Product를 검증할 수 있는 작은 type guard 또는 조회 helper가 실제로 필요할 때만 추가한다.

`apps/web/package.json`의 lint 대상에는 이미 `app`, `components`와 `data`가 포함되어 있으므로 변경하지 않는다. 기존 `Button` 계약으로 필요한 동작을 표현할 수 있으므로 `Button.tsx`, `LinkButton.tsx`와 `Button.module.css`도 계획된 변경 대상에서 제외한다.

### 구현 후 갱신할 기록 파일

- `tasks/006-cart.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/design/shop-ux-strategy.md`
- `docs/domain/cart.md`

`docs/domain/cart.md`에는 다음 Proposed 결정을 반영할 계획이다.

- 현재 browser Cart는 localStorage에 Product ID와 수량만 임시 저장한다.
- localStorage는 주문 금액, 재고와 판매 가능 여부의 신뢰 가능한 기준이 아니다.
- 같은 Product는 한 줄로 합치고 다시 담으면 수량을 늘린다.
- 수량은 1 이상의 정수이며 0은 삭제로 처리하지 않는다.
- 항목 제거는 명시적인 제거 동작으로 수행한다.
- 존재하지 않거나 현재 `DIRECT_PURCHASE`가 아닌 저장 항목은 복원 과정에서 제외한다.
- Product 표시 정보는 현재 정적 data에서 다시 조회하며 Cart snapshot으로 저장하지 않는다.

`docs/domain/product.md`의 기존 Proposed 규칙은 이미 `DIRECT_PURCHASE`만 Add to Cart CTA를 제공하고 `QUOTE_REQUIRED`는 공식 문의 흐름을 유지하도록 정하고 있다. 이번 구현은 가격, 재고와 Product 활성 상태를 새로 결정하지 않으므로 Product domain은 계획된 수정 대상에서 제외한다. 구현 과정에서 Product 쪽 규칙이 새로 필요하다고 확인되면 임의로 확정하지 않고 이 task에 근거와 선택지를 기록한 뒤 사용자에게 다시 확인한다.

최종 문서 정합성 검토에서는 정적 Product data에 이미 적용된 Current Demo 판매 방식이 `docs/domain/product.md`의 초기 후보와 달라진 사실을 확인했다. 새로운 판매 정책을 만들지 않고 현재 코드의 Demo 상태, 공통 `Shop Demo` 표시 경계와 저장 Cart 복원 시 판매 방식 재검증 규칙만 Product domain 문서에 반영한다.

### 변경하지 않을 파일과 영역

- `apps/web/app/globals.css`의 foundation token, reset, focus와 breakpoint
- Product Catalog와 Product Detail의 정적 설명, media placeholder와 주요 기능
- NITRO 공식 문의 URL과 외부 link 동작
- `apps/web/package.json`, root `package.json`, `pnpm-lock.yaml`과 dependency
- `docs/adr/`와 monorepo 구조
- API, DB, Docker, Toss Payments와 배포 설정
- 가격, 재고와 실제 판매 정책 data

구현 중 위 목록 밖의 변경이 필요하면 범위를 자동으로 넓히지 않고 원인과 선택지를 task에 기록한 뒤 사용자에게 확인한다.

## Plan

1. `cart-state.ts`에 CartItem, reducer state, action과 한 줄 병합·최소 수량 invariant를 정의한다.
2. `cart-storage.ts`에 version 1 payload parsing, 부분 정리, Product 존재 및 `DIRECT_PURCHASE` 검증과 read/write 오류 처리를 구현한다.
3. Root `CartProvider`에 hydration gate, reducer, localStorage persistence, 마지막 제거 항목과 공통 polite live region을 구현한다.
4. `app/layout.tsx`에서 SiteHeader와 route content를 CartProvider로 감싸되 기존 Server Component route를 유지한다.
5. `AddToCartButton`을 만들고 ProductPurchasePanel의 `DIRECT_PURCHASE` 분기에만 연결한다. `QUOTE_REQUIRED` 분기와 공식 문의 link는 바꾸지 않는다.
6. SiteHeader에 실제 `/cart` link를 추가하고 hydration 완료 뒤 총 수량을 표시한다.
7. `/cart/page.tsx`에 metadata, `main#main-content`, page heading과 CartView를 배치한다.
8. CartView에 hydration, empty, non-empty, storage 실패와 Undo 상태를 구현한다.
9. CartLineItem에 Product 상세 link, label이 연결된 수량 input, 증가·감소 및 제거 button을 구현한다.
10. Route와 Cart component CSS Modules에 mobile-first layout을 작성하고 기존 40rem 및 64rem breakpoint를 재사용한다.
11. `docs/domain/cart.md`와 현재 상태를 설명하는 context 및 design 문서를 실제 구현 결과에 맞춰 갱신한다.
12. lint, typecheck와 production build를 순차적으로 실행한다.
13. Browser에서 Product 담기, 같은 Product 병합, route 이동, 새로고침 복원, 수량 변경, 제거·Undo, empty state와 잘못된 저장 data를 검증한다.
14. 375px, 768px와 1280px layout, 375px의 200% text 확대, keyboard 순서, visible focus, label, live region과 target size를 검증한다.
15. `git diff`, `git diff --check`와 최종 status를 검토하고 실제 변경, 문제, 해결, 검증 결과와 남은 위험을 이 task에 기록한다.

## Verification Plan

### 자동 검증

- `pnpm.cmd lint`: `app`, `components`, `data`와 `next.config.ts`의 format 및 lint를 검사한다.
- `pnpm.cmd typecheck`: Context API, reducer action, storage schema, Product narrowing과 component prop의 타입을 검사한다.
- `pnpm.cmd build`: `/cart`, 기존 정적 route, Client Component boundary와 CSS Module production bundling을 확인한다.
- `git diff --check`: whitespace 오류를 확인한다.
- `git status --short --branch`: 계획하지 않은 파일과 범위 밖 변경이 없는지 확인한다.

현재 test runner가 없으므로 외부 test dependency를 추가하지 않는다. Reducer와 storage parser는 browser API에서 분리된 순수 함수로 작성하여 추후 unit test를 붙일 수 있게 한다. 이번 task에서는 자동 lint·typecheck·build와 아래 browser 시나리오를 함께 완료 조건으로 사용한다. 구현 중 기존 도구만으로 지속 가능한 unit test를 추가할 수 있다고 확인되면 먼저 범위와 script 변경 이유를 이 task에 기록한다.

### Browser와 수동 검증

- `/products/thermal-imaging`과 `/products/chlorophyll-fluorescence`에 실제 `장바구니 담기` button이 있고 NITRO에는 없는지 확인한다.
- `DIRECT_PURCHASE` Product를 한 번 담으면 SiteHeader count와 `/cart`에 수량 1로 표시되는지 확인한다.
- 같은 Product를 다시 담으면 새 줄이 생기지 않고 기존 줄의 수량과 총 수량이 1 증가하는지 확인한다.
- 서로 다른 두 Product를 담으면 Product ID별로 두 줄이 표시되는지 확인한다.
- Product Detail에서 담은 뒤 `/cart`, `/products`와 다시 `/cart`로 이동해 state가 유지되는지 확인한다.
- 새로고침 뒤 같은 Cart가 복원되고 hydration 중 잘못된 empty state가 먼저 표시되지 않는지 확인한다.
- 수량 증가, 수량 2 이상에서 감소와 유효한 정수 직접 입력이 reducer 및 저장 data에 반영되는지 확인한다.
- 수량 1에서 감소 button이 disabled이고 input에 0, 음수, 소수, 빈 값 또는 숫자가 아닌 값을 확정해도 항목이 삭제되지 않는지 확인한다.
- 제거 button으로 한 줄을 삭제하고 `삭제 취소`로 같은 Product와 수량을 복원하는지 확인한다.
- 모든 줄을 제거하면 empty state와 실제 `/products` link가 표시되고 link가 Catalog로 이동하는지 확인한다.
- Cart가 비어 있거나 항목이 있어도 합계, 소계, 무료, 통화, Checkout, 주문과 결제 CTA가 없는지 확인한다.
- localStorage에 잘못된 JSON, 다른 version, 잘못된 quantity, 중복 ID, 존재하지 않는 ID와 NITRO ID를 각각 넣고 application 오류 없이 정규화되는지 확인한다.
- localStorage read/write가 실패하는 환경을 재현할 수 있으면 memory fallback과 짧은 저장 실패 상태가 표시되는지 확인한다. 재현할 수 없다면 미검증 범위를 정확히 기록한다.
- 375px에서 Cart item을 한 열로 읽고 수량 control과 제거 button이 잘리거나 겹치지 않으며 horizontal overflow가 없는지 확인한다.
- 768px에서 Product 정보와 조작 영역이 두 열로 정렬되고 DOM 읽기 순서가 유지되는지 확인한다.
- 1280px에서 빈 sticky summary 없이 제한된 list 폭과 정렬된 조작 열이 사용되는지 확인한다.
- 375px에서 root font를 32px로 바꿔 200% text 확대를 재현하고 Product 이름, 수량 label, input, button, Undo와 empty state가 잘리지 않는지 확인한다.
- Tab과 Shift+Tab으로 skip link, SiteHeader, Product 상세 link, 수량 control, 제거, Undo와 Catalog link를 논리적인 순서대로 이동한다.
- 각 수량 및 제거 button의 accessible name에 Product 이름이 있고 input label이 올바르게 연결되는지 확인한다.
- 담기, 병합, 수량 변경, 잘못된 값, 제거와 Undo 메시지가 polite live region에서 갱신되며 focus가 강제로 이동하지 않는지 확인한다.
- 모든 link, button과 input의 visible focus가 보이고 interactive target 높이가 최소 44px인지 확인한다.

## Changes

- `tasks/006-cart.md`를 추가해 Cart 구현 전의 상태 경계, 저장 방식, 수량 및 제거 규칙, 파일 구조, 완료 조건과 검증 계획을 기록했다.
- `cart-state.ts`에 CartItem, hydration, 한 줄 병합, 수량 변경, 제거와 한 건 Undo를 처리하는 순수 reducer를 구현했다.
- `cart-storage.ts`에 `phytoworks-shop.cart.v1` schema, JSON 및 version 검증, 중복 병합, 잘못된 수량과 존재하지 않거나 직접 구매할 수 없는 Product 정리, localStorage read/write 오류 처리를 구현했다.
- Root layout에 CartProvider를 배치해 SiteHeader, Product Detail과 `/cart`가 같은 Context 및 reducer state를 사용하게 했다. Server Component route와 정적 Product 조회는 기존 server rendering 경계에 유지했다.
- Provider는 Server와 첫 client render에서 미복원 상태를 사용하고 mount effect에서 localStorage를 읽는다. 복원 완료 전에 빈 Cart가 저장 data를 덮어쓰지 않으며 storage 실패 뒤에도 현재 tab의 memory state는 유지한다.
- ProductPurchasePanel은 계속 Server Component로 유지하고 `DIRECT_PURCHASE` 분기에만 AddToCartButton Client leaf를 추가했다. NITRO의 `QUOTE_REQUIRED` 분기와 공식 문의 URL은 바꾸지 않았다.
- SiteHeader에 실제 `/cart` navigation을 추가하고 hydration 뒤 총 수량이 1 이상일 때 text count와 `장바구니, 총 n개` accessible name을 제공했다.
- `/cart` Server Component page와 CartView, CartLineItem을 추가했다. Hydration, empty, non-empty, storage 실패, Product 상세 link, 종류 및 총 수량, 수량 input, 증가·감소, 제거와 inline Undo를 제공한다.
- 수량 input은 연결된 label, `min=1`, `step=1`과 편집용 local draft를 사용한다. 0, 음수, 소수, 빈 값과 숫자가 아닌 값은 마지막 유효 수량으로 복구하며 삭제로 처리하지 않는다.
- 각 수량 및 제거 button에는 Product 이름을 포함한 accessible name을 제공하고, 전역 polite live region에서 담기, 병합, 수량 변경, 잘못된 값, 제거와 Undo 결과를 알린다.
- Cart는 375px에서 한 열, 768px에서 Product와 조작 영역의 두 열, 1280px에서 제한된 list 폭과 정렬된 조작 열을 사용한다. 가격이 없으므로 합계, 무료, 통화, Checkout CTA와 sticky summary는 만들지 않았다.
- `docs/domain/cart.md`에 Current Demo localStorage 경계와 Proposed Cart 규칙을 구분해 기록했다. `docs/domain/product.md`에는 Current Demo 판매 방식과 복원 시 판매 방식 재검증 규칙을 기록했으며, context 및 UX 문서도 실제 구현 상태에 맞춰 갱신했다.
- 가격, 재고, API, DB, Customer, Checkout, Order, Payment, dependency와 lockfile은 변경하지 않았다.

## Problems Encountered

- 첫 PowerShell 출력에서 shell 초기화 script가 존재하지 않는 `SSL_CERT_FILE` 환경변수를 제거하려는 경고를 반복해서 표시했다. 명령 자체의 exit와 Git 및 파일 읽기 결과에는 영향을 주지 않았다.
- PowerShell의 기본 출력 인코딩으로 처음 읽은 `AGENTS.md`의 한글이 깨졌다.
- 이 worktree에 dependency link가 없어 첫 lint와 typecheck 병렬 실행이 각각 pnpm 복원을 시작했다. 같은 Next.js 임시 디렉터리를 동시에 다루면서 Windows의 `EPERM` rename 오류가 발생했다.
- 첫 lint는 apply patch가 만든 LF line ending과 Biome의 Windows formatter 기준 차이를 보고했다. 수량 control의 `<div role="group">`도 native `fieldset`을 사용할 수 있다는 접근성 규칙에 걸렸다.
- 첫 responsive browser 검증은 Product 상세 link의 높이를 Tablet과 Desktop에서 32px로 측정했다. 44px minimum target 수정 뒤 production server가 이전 build를 계속 사용해 발생한 결과였다.
- PowerShell `Start-Process`로 headless Edge를 시작하는 명령은 실행 정책에서 거부되었다.

## Resolution

- 한글 문서와 source는 `Get-Content -Encoding utf8`을 명시해 다시 읽었으며, 깨진 첫 출력은 판단 근거로 사용하지 않았다.
- `SSL_CERT_FILE` 경고는 repository 변경이나 명령 실패가 아니므로 shell profile을 수정하지 않고 실제 command 결과와 구분했다.
- 충돌한 pnpm process가 종료된 것을 확인하고 `pnpm.cmd install --offline --frozen-lockfile`을 한 번 순차적으로 실행했다. 고정된 lockfile과 local package store만 사용했으며 dependency 선언과 lockfile은 바뀌지 않았다.
- 수량 control을 native `fieldset`과 숨겨진 `legend`로 바꾸고 기존 input label을 유지했다. `pnpm.cmd --filter @phytoworks/web lint --write`로 새 source와 CSS를 프로젝트의 Windows line-ending 및 format 기준에 맞췄다.
- Product 상세 link에 inline-flex, 44px minimum height와 center alignment를 추가했다. 최신 CSS로 production build와 server를 다시 만든 뒤 responsive 검증을 반복했다.
- Headless Edge는 foreground 명령으로 시작한 뒤 DevTools Protocol endpoint에 연결했다. 별도 workspace profile을 사용해 Cart 시나리오, viewport, keyboard, focus, live region과 screenshot을 검증했다.

## Verification

- 요청된 필수 문서, 관련 Cart 및 Product domain 문서, ADR 운영 규칙, task 작성 규칙과 이전 task 세 건을 읽었다.
- `apps/web`의 layout, SiteHeader, Product data, Product Catalog, Product Detail, ProductPurchasePanel, Button, LinkButton, global CSS와 관련 CSS Modules를 읽었다.
- 현재 branch가 `uiuuymin/cart`이고 HEAD가 기준 commit `6aa5e60`과 일치하며 계획 작성 전 worktree가 깨끗한 것을 확인했다.
- Next.js 16 공식 문서에서 Client Provider가 Server Component `children`을 받을 수 있고, state, event handler와 localStorage를 사용하는 leaf에 Client Component 경계를 둘 수 있음을 다시 확인했다.
- `pnpm.cmd install --offline --frozen-lockfile` → 성공, 고정된 lockfile대로 68개 package link 확인
- `pnpm.cmd lint` → 성공, Biome가 `app`, `components`, `data`와 `next.config.ts`의 35개 파일 검사
- `pnpm.cmd typecheck` → 성공, `tsc --noEmit`
- `pnpm.cmd build` → 성공, `/`, `/products`, Product Detail 세 건, `/_not-found`와 새 `/cart` 정적 route 생성
- 두 `DIRECT_PURCHASE` detail에는 활성화된 `장바구니 담기` button이 있고 NITRO에는 button이 없으며 기존 공식 문의 URL이 유지되는 것을 확인했다.
- Thermal Imaging Module을 두 번 담았을 때 localStorage version 1 payload에 한 줄과 수량 2가 저장되고 SiteHeader accessible name이 `장바구니, 총 2개`로 바뀌는 것을 확인했다.
- Product Detail에서 `/cart`로 Client navigation한 뒤 한 줄과 수량 2가 유지되고, 새로고침 뒤에도 같은 수량이 복원되는 것을 확인했다.
- 수량 2에서 감소, 수량 1의 감소 disabled, 증가와 직접 입력을 확인했다. 0을 입력하고 blur해도 수량 2로 복구되고 항목이 삭제되지 않았다.
- 항목 제거 뒤 empty state와 `삭제 취소`가 표시되고 Undo 뒤 같은 Product가 수량 2로 복원되는 것을 확인했다.
- 저장 payload에 중복 직접 구매 ID, 수량 0, NITRO, 존재하지 않는 ID와 잘못된 ID type을 함께 넣었을 때 Thermal Imaging Module 한 줄과 합산 수량 3만 남고 정규화된 payload가 다시 저장되는 것을 확인했다.
- 지원하지 않는 version 2 payload는 application 오류 없이 빈 version 1 Cart로 복구되고 empty state의 `/products` link가 유효한 것을 확인했다.
- Storage write를 `SecurityError`로 실패하게 한 뒤에도 memory 수량이 3으로 갱신되고 `현재 화면을 사용하는 동안만 유지됩니다.` 상태가 표시되는 것을 확인했다.
- Cart에는 `main#main-content`와 `h1`이 각각 하나이며 Cart section의 `h2` 아래 각 Product 제목을 `h3`로 구성했다. Input label은 `수량`, `min=1`, `step=1`이었다. 합계, 무료, 통화, Checkout과 결제 CTA는 없었다.
- Space key로 `Thermal Imaging Module 수량 늘리기` button을 실행해 수량이 3으로 바뀌었고 polite live region에 변경 문구가 전달되었다. Focus outline은 solid 3px, offset 3px였다.
- Browser viewport 검증:
  - 375px → 한 열 line item, minimum target 45.1875px, document scroll width와 client width가 360px로 같음
  - 768px → Product와 조작 영역의 `335px 288px` 두 열, minimum target 44px, scroll width와 client width가 753px로 같음
  - 1280px → Product와 조작 영역의 `648.812px 454.172px` 두 열, minimum target 44px, scroll width와 client width가 1265px로 같음
- 375px에서 root font를 32px로 바꾼 200% text 확대 후 document 및 body scroll width와 client width가 모두 360px로 같았다.
- 375px와 1280px screenshot에서 dark palette, Cart heading, count, Product 정보, 수량 control, 제거와 responsive 정렬을 직접 확인했다.

## Diff Review

Runtime 변경은 승인된 Cart 상태 계층, Product Detail CTA, SiteHeader navigation과 `/cart` route로 제한했다. 사용자가 VS Code와 diff에서 특히 확인할 부분은 다음과 같다.

- Root CartProvider와 작은 Client Component leaf를 선택한 이유
- localStorage hydration 및 손상된 data 정규화 절차
- 같은 Product 병합, 최소 수량 1, 0을 삭제로 처리하지 않는 규칙과 Undo 범위
- 가격과 Checkout이 없는 Cart의 기능 및 명시적인 한계
- 375px, 768px와 1280px layout 및 accessibility 완료 조건
- 향후 API 기반 Cart에서 교체할 persistence 및 validation 경계
- `CartProvider.tsx`의 hydration gate, storage 실패와 공통 action 계약
- `cart-storage.ts`의 version, schema와 Product 판매 방식 검증
- `CartLineItem.tsx`의 input draft, native fieldset, button label과 수량 0 처리
- `CartView.module.css`의 375px·768px·1280px layout과 44px 조작 영역

가격, 재고, API, DB, Customer, Checkout, Order, Payment, 실제 brand asset, dependency와 lockfile 변경은 diff에 없다. 검증용 browser profile, screenshot과 임시 script도 최종 diff에서 제거했다.

## Follow-up

- 가격, 재고와 직접 구매 판매 정책은 별도 승인 및 신뢰 가능한 source가 생긴 뒤 결정한다.
- NestJS와 PostgreSQL 기반 Cart, Customer 식별, Checkout와 Order는 각각 별도 task에서 설계한다.
- 서버 Cart를 설계할 때 localStorage Cart의 병합, 만료, ownership과 migration 정책 및 ADR 필요성을 다시 검토한다.
- Product option을 추가할 때에는 Product ID만 사용하는 현재 CartItem identity를 option 조합까지 확장한다.

## Lessons Learned

- Client Provider가 Server Component `children`을 감싸는 구조를 사용하면 정적 Product rendering을 유지하면서 Product Detail, SiteHeader와 Cart의 browser state만 공유할 수 있다.
- localStorage hydration에서는 읽기 전 write를 막는 상태가 필요하다. 그렇지 않으면 첫 client effect가 저장된 Cart를 빈 state로 덮어쓸 수 있다.
- 저장 payload의 JSON syntax만 확인해서는 충분하지 않다. Schema version, 수량, 중복 ID, 현재 Product 존재 여부와 판매 방식을 함께 검증해야 browser 저장 값을 신뢰 경계 밖에 둘 수 있다.
- 수량 0과 삭제를 분리하면 reducer invariant와 UI의 의미가 일치한다. 삭제 Undo도 confirm dialog 없이 실수를 복구할 수 있지만, 복원 범위와 다음 mutation에서 종료되는 규칙을 명시해야 한다.
- 가격이 없는 Cart에 빈 summary나 Checkout placeholder를 만들지 않으면 현재 기능의 한계를 정확하게 표현하고 허구의 판매 정책을 피할 수 있다.
- Responsive target 검증은 source 수정 뒤 현재 실행 중인 server가 최신 build를 사용하는지도 확인해야 한다. Stale production build는 수정이 반영되지 않은 것처럼 보일 수 있다.
