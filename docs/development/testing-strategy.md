# Testing Strategy

## 현재 상태

`apps/web`에는 TypeScript 7 typecheck와 Biome lint가 구성되어 있으며 루트에서 `pnpm typecheck`, `pnpm lint`, `pnpm build`로 실행한다. Next.js와 NestJS의 unit/API test runner는 아직 `TBD`다.

Biome를 선택한 이유와 Next.js 16.3·TypeScript 7·typescript-eslint 사이의 현재 호환성 제약은 `tasks/001-bootstrap-monorepo.md`에 기록한다. 호환성 변화에 따라 Next.js 전용 lint 규칙을 다시 검토한다.

지금 확정하는 것은 특정 도구가 아니라 **변경의 위험에 맞는 여러 검증 계층을 함께 고려한다**는 원칙이다.

## 고려할 검증 계층

| 계층 | 무엇을 확인하는가? | 예시 |
| --- | --- | --- |
| typecheck | 데이터와 함수 경계가 TypeScript 타입 계약에 맞는가? | web/API 공유 타입, nullable 값, 잘못된 상태 |
| lint | 오류 가능성이 높은 코드와 합의한 작성 규칙을 지켰는가? | 미사용 코드, unsafe pattern, import 규칙 |
| unit test | 작은 함수 또는 domain rule이 입력에 따라 올바르게 동작하는가? | 합계 계산, 수량 검증, 상태 전이 |
| API test | NestJS endpoint의 요청·응답과 오류 처리가 계약에 맞는가? | 주문 생성 validation, 금액 불일치 응답 |
| integration test | DB나 외부 경계를 포함한 여러 요소가 함께 동작하는가? | Order와 Payment transaction, PostgreSQL 저장 |
| manual browser verification | 실제 사용자가 보는 화면과 전체 이동이 의도대로 동작하는가? | 상품 → Cart → 결제 성공·실패 화면 |

## 적용 원칙

- 모든 변경에 모든 계층을 기계적으로 실행하지 않고, 변경이 실패할 수 있는 경계를 기준으로 필요한 검증을 선택한다.
- domain 계산과 상태 규칙은 가능하면 빠른 unit test로 고정한다.
- web/API 계약은 typecheck만 믿지 않고 실제 API 요청·응답도 확인한다.
- PostgreSQL transaction과 migration은 실제 DB를 포함한 검증을 고려한다.
- Toss Payments는 test 환경과 공식 테스트 수단을 사용하며 실제 credential이나 실결제를 사용하지 않는다.
- 결제 성공 경로뿐 아니라 취소, 실패, timeout, 중복 요청과 금액 불일치도 검증 대상으로 삼는다.
- 자동 테스트가 통과해도 화면 문구, 이동, loading과 오류 표시처럼 브라우저에서만 보이는 부분은 수동 확인한다.

## Task에 남길 검증 기록

각 task의 `Verification`에는 다음을 실제 결과대로 기록한다.

- 실행한 명령과 대상
- 성공·실패 결과
- 실행하지 못한 검증과 그 이유
- 수동 확인 절차와 관찰 결과
- known limitation 또는 flaky test

실패한 검증을 삭제하거나 성공으로 표현하지 않는다. 문제가 현재 범위에서 해결되지 않았다면 blocker 또는 follow-up으로 명확히 남긴다.

## 향후 결정할 사항

- Next.js와 NestJS의 unit/API test runner
- PostgreSQL integration test 격리 방식
- test fixture, factory와 seed 데이터의 책임
- Toss Payments 테스트 double 또는 sandbox 활용 범위
- CI에서 실행할 검증과 병합 기준
