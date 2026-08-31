# Order Domain

## 주문의 의미와 생성 시점

Order는 고객이 구매 의사를 확정한 뒤 서버가 금액과 처리 상태를 추적하는 거래 단위다. 현재
서버 구현은 결제 전 Cart를 주문으로 준비하는 학습용 Demo 단계다.

**Current Demo:** `POST /api/orders`가 session Cart를 다시 확인한 뒤 서버에서 `PENDING` Order를 생성한다. 생성과 Cart 항목 삭제는 PostgreSQL transaction으로 처리한다. 이 주문은 아직 결제 승인을 의미하지 않는다.

## 주문과 상품의 관계

- 하나의 Order는 하나 이상의 OrderItem을 가진다.
- **Current Demo:** OrderItem은 Product 참조와 함께 주문 시점의 상품명, 단가와 수량을 snapshot으로 보존한다.
- Product의 현재 가격이나 이름이 바뀌어도 이미 생성된 주문의 의미와 금액은 바뀌지 않아야 한다.
- Product 삭제 정책과 snapshot의 정확한 범위는 `TBD`다.

## 주문 금액

- **Current Demo:** NestJS가 Cart의 각 Product를 다시 읽고 현재 catalog의 Demo 단가로 주문 금액을 계산한다. 응답과 저장값의 `pricingSource`는 `DEMO`다.
- 이 Demo 단가는 authoritative checkout price가 아니며 Toss Payments 승인에 사용할 운영 금액으로 취급하지 않는다.
- 브라우저나 결제 redirect query에 포함된 금액만으로 Order 금액을 변경하지 않는다.
- 결제 승인 전에 요청 금액과 저장된 Order 금액이 일치하는지 서버에서 검증한다.
- 할인, 세금, 배송비와 통화 정책은 `TBD`다.

## Proposed 상태 전이

초기 검토 모델은 다음과 같다.

```text
PENDING
→ PAID
→ CANCELLED
```

현재 구현은 `PENDING`만 생성하며, 나머지 상태 변경은 아직 구현하지 않았다.

- `PENDING`: 주문은 생성됐지만 결제 완료가 확정되지 않음
- `PAID`: 서버 결제 승인이 성공함
- `CANCELLED`: 주문 진행이 취소됨

`CANCELLED`가 `PENDING`과 `PAID` 중 어느 상태에서 가능한지, 결제 실패를 Order의 `FAILED`로 표현할지 Payment 실패만 기록할지, 환불 상태를 별도로 둘지는 `TBD`다. 허용되지 않은 상태 전이와 중복 요청을 막는 규칙도 구현 전에 정의한다.

## 결제와의 관계

Order는 무엇을 얼마에 구매하는지를 나타내고, Payment는 그 금액을 지불하려는 시도와 결과를 나타낸다. **Proposed:** Payment 승인이 성공한 경우에만 관련 Order를 `PAID`로 변경한다. 한 Order에 여러 Payment 시도를 허용하는지와 DB transaction 경계는 `TBD`다.

## 향후 결정해야 할 규칙

- 주문 생성의 최종 시점과 Cart 정리 시점
- 주문 식별자 생성·노출 방식
- 고객 및 배송 정보 범위
- 상태 전이, 취소와 환불 모델
- 중복 주문·승인 요청에 대한 idempotency
- 결제 실패·timeout 후 재시도 정책
- 재고 예약과 주문 만료 정책
