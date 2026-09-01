# Task 020: 주문 상태 화면과 Cart session ownership

**Status:** 구현 완료

## Goal

서버에 저장된 주문 상태를 Web에서 조회할 수 있도록 `/orders/[orderId]` 화면을 추가하고,
브라우저가 임의의 Cart session ID를 직접 관리하지 않도록 서명된 HttpOnly cookie 기반의 익명
session ownership을 구현한다. 배포 환경에서는 Web과 API가 `CART_SESSION_SECRET`을 공유하며,
실제 비밀값은 저장소에 기록하지 않는다.

## Scope

- Web `/orders/[orderId]` 주문 상태 화면
- 주문 ID와 Cart session을 이용한 same-origin 주문 조회
- `HttpOnly`, `SameSite=Lax`, production `Secure` Cart session cookie
- Web proxy의 session token 생성·전달
- NestJS API의 session token 서명 검증
- 기존 Cart, Order와 Payment Web 호출에서 localStorage session ID 제거
- 배포에 필요한 `API_BASE_URL`, `CART_SESSION_SECRET`, Toss 환경변수 문서화

## Non-goals

- 회원가입·로그인과 Customer 계정 ownership
- 주문 취소, 환불, webhook과 결제 reconciliation
- authoritative 가격과 재고 정책
- 특정 클라우드 provider 설정이나 실제 secret 등록

## Design Decision

브라우저는 Cart session ID를 읽을 수 없는 HttpOnly cookie에만 보관한다. Next.js same-origin
route handler는 cookie의 서명 token을 NestJS API의 `X-Cart-Session-Token` header로 전달한다.
API는 공유 secret으로 token을 검증한 뒤 내부 DB 조회에는 서명 전의 random session ID만 사용한다.

새 cookie가 없거나 검증에 실패하면 Web proxy가 새 random token을 발급한다. cookie에는
`HttpOnly`, `SameSite=Lax`, `Path=/`, 60일 만료를 적용하며 production에서만 `Secure`를 적용한다.

## Verification

다음 검증을 완료했다.

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`: API 14개 파일, 44개 테스트 통과
- `pnpm --filter @phytoworks/api test:integration`: PostgreSQL 통합 테스트 4개 파일, 8개 테스트 통과
- `pnpm build`: API build와 Web production build 통과, `/orders/[orderId]` route 생성 확인
- 로컬 HTTP smoke test: HttpOnly·SameSite=Lax cookie 발급, Cart item 추가, PENDING Order 생성·조회,
  `/orders/[orderId]` 응답 확인, 평문 `X-Cart-Session-Id` 요청 400 거부 확인

실제 Toss Payments credential과 운영 HTTPS 환경은 사용하지 않았으므로 provider 결제 승인과
production cookie의 실제 브라우저 동작은 배포 환경에서 별도 smoke test가 필요하다.

## Follow-up

- Customer 인증으로 익명 session을 계정 Cart에 병합하는 정책을 별도 결정한다.
- 주문 상태 조회에 Payment 상태를 함께 노출할지 결정한다.
- 실제 배포 provider에서 환경변수와 production HTTPS cookie를 설정하고 end-to-end smoke test를 실행한다.
