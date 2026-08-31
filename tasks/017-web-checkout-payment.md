# Task 017: Web checkout과 결제 승인 연결

**Status:** 완료

## Goal

현재 Web Cart에서 서버 Order를 준비하고 Toss Payments 결제창을 연다. 성공 redirect에서는
`paymentKey`, `orderId`, `amount`를 same-origin API로 전달해 서버 승인을 호출하고, 실패
redirect에서는 안전한 안내와 재시도 경로를 제공한다.

## Context

Task 016에서 NestJS의 `POST /api/payments/confirm`과 Toss server gateway를 구현했다. Toss
공식 SDK는 `widgets()` 초기화, 금액 설정, 결제 UI 렌더링과 `requestPayment()` 호출 뒤
`successUrl` 또는 `failUrl`로 이동하는 Redirect 흐름을 제공한다.

참고 문서:

- <https://docs.tosspayments.com/sdk/v2/js/payment-widget>
- <https://docs.tosspayments.com/guides/v2/payment-widget/integration-window>
- <https://docs.tosspayments.com/guides/v2/get-started/payment-flow>

## Current State

- Web은 Product와 Cart API를 same-origin route handler로 사용한다.
- Cart에는 익명 session ID만 저장한다.
- API는 Cart에서 Demo `PENDING` Order를 생성하고 Toss 승인 API를 제공한다.
- Web에는 checkout, success, fail route와 Order·Payment proxy가 없다.

## Design Decision

- Cart의 결제 링크는 `/checkout`으로 이동한다.
- `/checkout`에서 사용자가 직접 Order를 준비하며, Order API 응답의 서버 금액을 Toss SDK에 전달한다.
- Toss SDK는 현재 공식 V2 standard script를 사용하고 client key는 `NEXT_PUBLIC_TOSS_CLIENT_KEY`로 주입한다.
- 성공·실패 redirect는 `/checkout/success`, `/checkout/fail` same-origin route를 사용한다.
- success page는 localStorage의 같은 session ID로 confirm API를 호출한다.
- 실제 secret key는 Web에 노출하지 않는다.

## Scope

- Web checkout 화면과 결제창 UI
- Order·Payment same-origin proxy
- success/fail redirect 화면
- 테스트 client key 환경변수 예시와 관련 문서

## Non-goals

- 실제 결제 credential과 실결제
- Customer 인증, 배송 정보와 운영 가격
- 취소·환불과 webhook 재조정

## Changes

- `/checkout`에 서버 Order 준비, Toss SDK 결제 UI와 결제 요청 버튼을 추가했다.
- `/checkout/success`에서 redirect query를 서버 Payment confirm API로 전달한다.
- `/checkout/fail`에서 안전한 실패 안내와 재시도 링크를 제공한다.
- 실패 redirect에 포함된 Order를 다시 조회해 Cart가 비워진 뒤에도 같은 Order로 재시도한다.
- `/api/orders`, `/api/payments/confirm` same-origin proxy와 Web API 타입 검증을 추가했다.
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` 환경변수 예시를 추가했다.

## Verification

- Web lint 통과
- Web typecheck 통과
- Web build는 checkout 최초 구현 시 통과했다. 재시도 보완 후 재실행에서는 로컬
  `@typescript/typescript-win32-x64`의 `tsc.exe` 누락으로 TypeScript 단계가 실행되지 않았다.
- 실제 결제창은 유효한 Toss 테스트 client key가 준비된 경우에만 수동 확인한다.

## Follow-up

- 실패 결제의 재시도와 취소된 Order 정리 정책을 확정한다.
- 주문 상세·결제 결과 조회와 운영 Customer ownership을 추가한다.
