# Task 016: Toss Payments 결제 승인 API

**Status:** 완료

## Goal

결제 인증이 성공한 뒤 Web이 전달한 `paymentKey`, `orderId`, `amount`를 서버에서 검증하고
Toss Payments 승인 API를 호출한다. 승인 성공 시 Payment를 `DONE`, 관련 Order를 `PAID`로
변경한다. 결제 실패는 Payment에 기록하고 Order는 `PENDING`으로 유지한다.

완료 조건은 다음과 같다.

- `POST /api/payments/confirm`이 session, Order와 결제 금액을 검증한다.
- 서버의 `TOSS_SECRET_KEY`만 사용해 Toss confirm API를 호출한다.
- 성공 시 Payment와 Order 상태가 함께 갱신된다.
- 실패 시 안전한 오류 응답과 `FAILED` Payment 기록을 남긴다.
- 이미 승인된 동일 요청은 외부 API를 다시 호출하지 않는다.
- Payment의 `paymentKey`, `orderId`, `amount`를 PostgreSQL에 저장한다.
- 실제 Toss API 호출 없이 gateway fake로 unit·HTTP 테스트가 가능하다.

## Context

Order API는 현재 Demo 가격을 서버에서 계산해 `PENDING` Order를 생성한다. Toss 공식 문서에
따르면 결제 승인 endpoint는 `POST /v1/payments/confirm`이며, `paymentKey`, `orderId`,
`amount`를 body로 받는다. 성공 redirect의 amount는 저장된 주문 금액과 비교한 뒤 승인 요청에
사용해야 하며, 승인 성공은 HTTP 200과 Payment 객체로 확인한다.

공식 참고 문서:

- <https://docs.tosspayments.com/reference>
- <https://docs.tosspayments.com/guides/v2/payment-widget/integration-window>
- <https://docs.tosspayments.com/guides/v2/get-started/payment-flow>

이번 task의 Demo 가격은 authoritative checkout 가격이 아니므로 실제 운영 결제를 의미하지
않는다. 테스트 키가 없으면 실제 Toss 승인 검증을 실행하지 않으며 secret key는 파일과 로그에
저장하지 않는다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/domain/payment.md`
- `docs/domain/order.md`
- `docs/adr/003-prisma-postgresql-access.md`
- `docs/development/testing-strategy.md`
- `tasks/015-order-api.md`
- `apps/api/src/order/`

## Current State

- Order는 `PENDING` 상태로 생성되고 Cart는 transaction 안에서 비워진다.
- OrderItem은 상품명, 단가와 수량 snapshot을 저장한다.
- `Payment` schema, Prisma migration, repository, gateway와 confirm endpoint를 구현했다.
- `OrderStatus`의 `PENDING` → `PAID` 전이를 승인 성공 transaction에서 처리한다.
- `TOSS_SECRET_KEY`는 서버 환경변수 예시에만 등록했으며 실제 값은 저장하지 않았다.

## Options Considered

### Controller에서 Toss API와 Prisma를 직접 호출한다

- 장점: 파일 수가 적고 초기 구현이 빠르다.
- 단점: HTTP 외부 경계, 상태 전이와 저장 책임이 한곳에 섞이며 테스트가 어렵다.

### PaymentService, PaymentGateway와 PaymentRepository를 분리한다

- 장점: 금액·session·상태 검증, 외부 API 호출과 DB transaction을 각각 테스트할 수 있다.
- 장점: 실제 Toss gateway를 fake로 대체하고 향후 webhook이나 취소 API를 추가하기 쉽다.
- 단점: 작은 기능에 필요한 경계와 파일 수가 늘어난다.

**선택:** 두 번째 방법을 선택한다. 외부 API는 `PaymentGateway` port 뒤에 두고, repository는
Payment 상태와 Order 상태를 transaction으로 함께 변경한다.

### 외부 승인 호출과 DB 변경을 하나의 DB transaction에서 처리한다

- 장점: 코드상 한 흐름으로 보인다.
- 단점: 외부 네트워크를 DB transaction 안에 두면 잠금과 timeout 범위가 불명확해진다.

### Payment를 먼저 `PENDING`으로 저장하고 외부 승인 뒤 결과를 반영한다

- 장점: 외부 승인 중 timeout이 발생해도 미확정 상태를 추적할 수 있다.
- 단점: 외부 승인 성공과 DB 반영 사이의 재조정이 필요하다.

**선택:** 두 번째 방법을 선택한다. Payment를 먼저 `PENDING`으로 저장하고, 승인 성공 시
Payment `DONE`과 Order `PAID`를 짧은 DB transaction으로 반영한다. 현재 task에서는 재조정
worker와 webhook을 만들지 않고 follow-up으로 남긴다.

## Changes

- Payment에 `PENDING`, `DONE`, `FAILED` 상태와 Order 1:1 관계를 추가했다.
- `PaymentRepository` port, Prisma adapter와 in-memory test double을 구현했다.
- `TossPaymentsGateway`가 서버의 `TOSS_SECRET_KEY`로 공식 confirm endpoint를 호출한다.
- `PaymentService`가 저장된 Order 금액, session ownership과 상태를 검증한 뒤 승인 결과를 반영한다.
- `POST /api/payments/confirm`은 성공 시 HTTP 200을 반환하며 동일한 성공 요청은 외부 호출 없이 반환한다.
- 결제 실패 시 안전한 오류 코드만 Payment에 기록하고 Order는 `PENDING`으로 유지한다.
- API 단위·HTTP·PostgreSQL 통합 테스트를 추가했다.

## Scope and Non-goals

### Scope

- Payment schema와 migration
- Toss confirm API server adapter
- Payment 생성·실패·완료 저장
- Order `PENDING` → `PAID` 전이
- 금액·orderId·session 검증
- 중복 성공 요청의 local idempotent 처리
- API unit·HTTP·PostgreSQL integration test

### Non-goals

- 실제 secret key 또는 실결제
- Toss 결제창 SDK와 Web checkout 화면
- 취소·환불 API
- webhook과 재조정 worker
- 운영 가격, 재고 차감과 배송
- Customer 인증과 production session ownership

## Verification

다음 검증을 완료했다.

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`: 13개 파일, 42개 테스트 통과
- `pnpm build`
- `pnpm prisma:migrate:payment`: 로컬 PostgreSQL 적용
- `pnpm test:integration`: 4개 파일, 8개 테스트 통과

Toss 실제 호출은 유효한 테스트 credential과 테스트 결제가 준비된 경우에만 별도로 실행한다.

## Diff Review

- secret key와 Toss 응답 원문을 저장소나 로그에 남기지 않는다.
- 브라우저가 보낸 amount를 신뢰하지 않고 Order의 서버 저장 금액과 비교한다.
- 승인 성공 시 Payment `DONE`과 Order `PAID`를 같은 짧은 DB transaction에서 반영한다.
- 외부 승인 호출은 DB transaction 밖에서 실행하므로 timeout 뒤 `PENDING` 상태가 남을 수 있다.
- 현재 익명 session header는 운영 수준의 인증이나 소유권 증명이 아니다.

## Follow-up

- Web checkout에서 성공 redirect와 confirm API를 연결한다.
- Toss fail redirect, 취소, timeout과 webhook 재조정 흐름을 구현한다.
- 외부 승인 성공 뒤 DB 반영 실패를 복구할 reconciliation 정책을 추가한다.
- authoritative 가격과 운영 수준의 session ownership을 확정한다.

## Lessons Learned

외부 승인과 내부 상태 변경 사이의 정합성을 위해 Payment를 먼저 `PENDING`으로 기록하고,
승인 성공과 주문 상태 변경을 하나의 transaction으로 묶었다. 다만 외부 승인 성공 뒤 DB
반영이 실패하는 경우는 재조정 정책이 필요하므로 후속 작업으로 남겼다. Gateway와 repository를
port 뒤에 두어 실제 Toss 호출 없이 서비스와 HTTP 경계를 검증할 수 있었다.
