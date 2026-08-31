# Cart Domain

## 장바구니 정의

Cart는 고객이 주문을 만들기 전에 구매할 Product와 수량을 임시로 모아 두는 영역이다. 주문이 아니므로 결제가 보장되지 않으며, Cart의 내용은 주문 생성 시 서버 규칙으로 다시 검증해야 한다.

서버 Cart domain 모델은 **Current Demo 구현**이며, Customer 인증과 ownership 보장은 **Proposed**다. `apps/web`의 Cart item과 수량은 현재 Cart API를 사용하는 **Current Demo 구현**이며, Customer 식별과 ownership은 아직 보장하지 않는다.

Cart에는 `DIRECT_PURCHASE`로 명시된 Demo Product만 담을 수 있다. `QUOTE_REQUIRED` Product는 견적 문의 대상으로 남기며 CartItem을 만들지 않는다. Product의 판매 방식과 CTA 경계는 [`product.md`](./product.md)와 [`../design/shop-ux-strategy.md`](../design/shop-ux-strategy.md)를 함께 확인한다.

## CartItem

CartItem은 하나의 Product와 고객이 원하는 수량을 연결한다.

- **Proposed:** 같은 Product는 Product ID별로 한 줄만 둔다. Product Detail에서 같은 Product를 다시 담으면 기존 수량을 1 늘린다.
- **Current Demo:** CartItem에는 Product ID와 수량만 저장한다. Product 이름, category와 판매 방식은 Web이 Product Read API에서 조회한 Catalog data로 표시한다.
- 가격 data가 없으므로 현재 browser Cart에는 단가와 가격 snapshot을 저장하지 않는다.
- CartItem이 존재하더라도 Product가 활성 상태이고 재고가 충분하거나 주문 가능한 상태라는 보장은 없다.
- 향후 Product option이 생기면 Product ID만으로 같은 CartItem을 판단하지 않고 option 조합을 포함한 identity를 다시 결정한다.

## 수량 변경과 제거

- **Proposed:** 수량은 1 이상의 정수여야 한다.
- 수량 0, 음수, 소수와 숫자가 아닌 값은 유효한 수량 변경이 아니며 항목 삭제로 처리하지 않는다.
- 증가는 현재 수량을 1 늘리고 감소는 현재 수량이 2 이상일 때 1 줄인다. 수량 1에서는 감소하지 않는다.
- 항목 삭제는 수량 변경과 구분되는 명시적인 제거 동작으로 수행한다.
- **Current Demo:** 단일 항목을 제거하면 마지막으로 제거한 항목 한 건을 memory에 보관하고 Undo로 같은 수량을 복원할 수 있다. 다른 Cart 변경이 발생하면 이전 Undo 기회는 종료한다.
- 최대 구매 수량과 재고 초과 시 응답 규칙은 `TBD`다. JavaScript의 안전한 정수 조건은 browser data 손상을 막기 위한 기술 경계이며 판매 정책이 아니다.
- 향후 주문을 생성하기 직전에 서버가 수량과 재고를 다시 검증해야 한다.

## 가격과 합계

현재 정적 Product data에는 가격과 통화가 없다. 따라서 **Current Demo Cart**는 소계, 합계, 무료, 할인, 세금, 배송비와 통화를 계산하거나 표시하지 않는다.

- Product 종류 수와 모든 CartItem의 총 수량처럼 가격과 무관한 값만 표시할 수 있다.
- Checkout과 Order가 없으므로 현재 Cart에는 Checkout CTA를 제공하지 않는다.
- 가격이 추가되는 향후 단계에서는 각 항목의 서버 기준 단가와 수량을 사용해 합계를 계산하는 방안을 검토한다.
- 브라우저가 계산하거나 저장한 합계는 화면 표시용일 뿐 주문·결제의 신뢰 가능한 금액으로 사용하지 않는다.
- 할인, 세금, 배송비, 통화와 반올림 규칙은 `TBD`다.

## Current Demo 저장 방식

현재 Web Cart는 Cart API와 PostgreSQL을 item과 수량의 source of truth로 사용한다. 같은 browser에서 route 이동과 새로고침 뒤 익명 Cart를 복원하기 위해 session ID만 `localStorage`에 저장한다.

```text
key: phytoworks-shop.cart-session.v1

value: web-generated-session-id
```

- `localStorage`는 익명 session 식별자를 browser에 유지하기 위한 임시 저장소이며 Cart item, 주문 금액, 재고와 판매 가능 여부의 신뢰 가능한 기준이 아니다.
- session ID는 사용자가 변경할 수 있는 외부 입력으로 취급한다.
- Server와 첫 client render는 session ID나 Cart item을 사용하지 않으며 Client hydration 뒤에 session ID로 API를 조회한다.
- session ID가 비어 있거나 길이 제한을 벗어나면 새 session ID를 만든다.
- API가 반환한 item과 수량은 Web에서 임의로 병합하지 않고 API 응답 전체로 교체한다.
- 존재하지 않거나 현재 `DIRECT_PURCHASE`가 아닌 Product ID는 API가 변경 요청을 거부한다.
- `localStorage`에 접근하거나 저장할 수 없으면 현재 tab의 memory session ID로 API를 사용하며 새로고침 뒤 같은 Cart가 유지되지 않을 수 있다.
- 여러 tab, 다른 browser 및 기기 사이의 동기화, 만료와 Customer Cart 병합은 현재 범위에 없다.

## 현재 서버 Cart API 경계

`apps/api`는 인증 도입 전의 익명 Cart API를 제공한다. 요청은 `X-Cart-Session-Id` header로
session을 식별하며, 이 값은 사용자가 조작할 수 있으므로 Cart ownership을 보장하지 않는다.

- `GET /api/cart`는 session의 Cart를 조회하고, 없으면 빈 Cart를 반환한다.
- `POST /api/cart/items`는 `DIRECT_PURCHASE` Product를 추가하며 같은 Product의 수량을 합친다.
- `PATCH /api/cart/items/:productId`는 양의 정수 수량으로 항목을 변경한다.
- `DELETE /api/cart/items/:productId`는 항목을 명시적으로 제거한다.
- API 응답은 Product ID와 수량만 반환하며 가격, 재고, 옵션 선택과 Product snapshot을 반환하지 않는다.
- `QUOTE_REQUIRED`와 존재하지 않는 Product는 Cart 변경 대상이 아니다.

기존 `phytoworks-shop.cart.v1` localStorage Cart와 API Cart는 자동으로 병합하지 않는다. 중복 수량과 익명 session의 소유권을 안전하게 판단할 수 없기 때문이다. 기존 key는 현재 코드가 읽거나 삭제하지 않으며, migration과 정리 정책은 후속 task에서 결정한다.

## 향후 서버 Cart를 확장할 때

현재 session header 기반 API Cart는 최종 production ownership 모델이 아니다. 서버 Cart를 확장할 때 다음 항목을 다시 결정한다.

- Customer 또는 비회원 session의 Cart 소유 방식
- Cart ID와 CartItem ID
- Product option을 포함한 line identity
- localStorage Cart와 서버 Cart의 병합, 만료와 정리 정책
- 최신 Product 정보 조회와 Cart snapshot 범위
- 서버 mutation의 validation, optimistic update와 오류 응답
- 여러 기기 및 tab 사이의 동기화

Cart는 주문 생성의 입력일 뿐이다. Order를 만들기 전에 서버는 Product의 존재, 활성 여부, `DIRECT_PURCHASE`, 최신 가격, 수량과 재고를 다시 확인해야 한다. 주문 생성 후 Cart를 비울 시점과 실패 시 유지 여부는 `TBD`다.
