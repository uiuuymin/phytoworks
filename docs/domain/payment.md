# Payment Domain

## Payment와 Order가 다른 이유

Order는 고객이 구매하려는 상품, 수량과 금액을 나타낸다. Payment는 그 Order의 금액을 Toss Payments로 지불하려는 개별 시도와 결과를 나타낸다.

둘을 분리하면 결제 실패 후 재시도, 외부 서비스 응답 기록, 주문의 내용과 결제 처리 상태를 각각 명확히 다룰 수 있다. 한 Order에 여러 Payment 시도를 허용할지는 `TBD`다.

## Proposed 결제 흐름

### 1. 결제 준비

- 서버가 Product와 Cart를 다시 검증한다.
- 서버가 신뢰할 수 있는 `orderId`와 금액으로 Order를 `PENDING` 상태로 준비한다.
- Payment를 `READY`로 저장할지, 어느 시점에 저장할지는 `TBD`다.

### 2. Toss 결제창

Next.js 화면에서 Toss Payments 테스트 결제창을 연다. 브라우저 단계는 사용자의 결제수단 인증을 돕지만 최종 결제 성공을 확정하는 서버 단계가 아니다.

### 3. 성공 redirect

인증이 끝나면 브라우저가 성공 URL로 이동하며 승인에 필요한 값을 전달하는 흐름을 고려한다. **redirect에 도착했다는 사실만으로 Order를 `PAID`로 바꾸지 않는다.** 전달된 `orderId`, 금액과 `paymentKey`는 서버의 저장값과 함께 검증해야 한다.

### 4. 서버 승인

NestJS가 서버에만 보관한 Toss secret key를 사용해 승인 API를 호출한다. 요청 금액은 저장된 Order 금액과 일치해야 하며, 같은 승인 요청이 반복될 가능성을 고려한다.

### 5. 승인 후 DB 변경

**Proposed:** 승인 성공을 확인한 뒤 Payment를 `DONE`, Order를 `PAID`로 변경한다. 외부 승인과 DB 변경 사이의 실패, transaction, idempotency와 재조정 방식은 구현 전에 별도로 설계한다.

### 6. 실패 처리

- 사용자의 인증 취소나 실패 redirect
- 서버 승인 거절
- network timeout
- 승인 성공 후 로컬 DB 갱신 실패
- 같은 요청의 중복 실행

이 상황들을 하나의 오류로 취급하지 않는다. Payment에 `FAILED`를 저장할 조건, Order를 `PENDING`으로 유지할 조건, 재시도 가능 여부와 사용자 메시지는 `TBD`다.

## Proposed 초기 상태 흐름

```text
Order: PENDING
Payment: READY
        ↓
Toss 인증
        ↓
서버 승인 요청
        ↓
Order: PAID
Payment: DONE
```

이 흐름과 상태 이름은 학습을 위한 초기 후보다. 실제 Toss Payments 연동 시 **공식 문서를 확인하여 API 요구사항, 상태값, redirect parameter, 승인 방식과 오류 처리를 반드시 재검증**한다.

## secret key가 서버에만 있어야 하는 이유

브라우저에 포함된 코드는 사용자에게 전달되므로 누구나 내용을 확인할 수 있다. secret key가 브라우저 bundle, 공개 환경변수 또는 저장소에 들어가면 다른 사람이 상점 권한으로 결제 API를 호출할 수 있다. 따라서 secret key는 NestJS 서버 환경변수로만 주입하고 로그·문서·commit에 실제 값을 남기지 않는다.

## 향후 결정해야 할 규칙

- Payment 생성 시점과 한 Order당 허용하는 시도 수
- 외부 상태값과 내부 상태값의 mapping
- 승인 API idempotency와 중복 callback 처리
- timeout과 부분 실패의 재조정 방법
- 취소·환불 범위
- 결제 로그의 개인정보·민감정보 마스킹
