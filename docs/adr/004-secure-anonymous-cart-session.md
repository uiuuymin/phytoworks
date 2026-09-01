# ADR-004: 서명된 HttpOnly cookie로 익명 Cart session을 보호한다

## Status

Accepted

## Context

현재 Web은 localStorage의 session ID를 읽어 Cart, Order와 Payment API에 header로 전달한다.
이 값은 브라우저 JavaScript와 사용자가 직접 읽고 바꿀 수 있으므로, 주문 조회와 결제 승인에
사용하는 익명 Cart ownership을 보장하지 못한다.

## Options Considered

### 기존 평문 session ID를 계속 사용한다

- 구현 변경이 가장 작다.
- 브라우저에서 ID를 읽고 다른 session을 시도할 수 있어 ownership 경계가 없다.

### HttpOnly cookie에 random session ID만 저장한다

- 브라우저 JavaScript가 ID를 직접 읽기 어렵다.
- 공개 API가 평문 session ID를 그대로 받으면 header를 위조할 수 있다.

### HttpOnly cookie에 서명된 session token을 저장한다

- 브라우저 JavaScript가 token을 읽지 못하고, API가 token 위조를 검증할 수 있다.
- Web과 API가 동일한 secret을 안전하게 관리해야 한다.
- 회원 계정 기반 ownership과 session 병합은 여전히 별도 작업이다.

## Decision

세 번째 방법을 선택한다. Web proxy는 random session ID와 `CART_SESSION_SECRET`으로 HMAC
서명한 token을 `HttpOnly` cookie에 저장하고, API는 `X-Cart-Session-Token` header의 서명을
검증한 뒤 내부 session ID를 사용한다. 기존 `X-Cart-Session-Id` 평문 header는 API가 받지 않는다.

Cookie는 `SameSite=Lax`, `Path=/`, 60일 만료를 사용하고 production에서는 `Secure`를 적용한다.
Web과 API 모두 `CART_SESSION_SECRET`을 환경변수로 주입한다. secret은 저장소, 브라우저 bundle과
로그에 기록하지 않는다.

## Consequences

- 익명 사용자의 Cart와 Order 조회 경계가 random token 위조 방지 수준으로 강화된다.
- Web과 API의 환경변수 설정이 맞지 않으면 Cart·Order·Payment API가 동작하지 않는다.
- XSS 자체를 해결하는 결정은 아니며, 운영 서비스에는 Customer 인증과 CSRF 방어를 별도로 검토해야 한다.
- 기존 localStorage session ID와의 자동 병합은 하지 않는다. 회원 로그인과 Cart migration 정책은
  별도 task에서 결정한다.

## References

- `tasks/020-order-status-cart-ownership.md`
- `docs/domain/cart.md`
- `docs/domain/order.md`
- `docs/domain/payment.md`
