# Task Records

## 목적

`tasks/`는 개별 개발 작업의 문제 정의부터 선택지, 계획, 실제 변경, 시행착오와 검증까지 한곳에서 추적한다. 기능 하나 또는 독립적으로 검토할 수 있는 의미 있는 작업 하나당 task 문서 하나를 만든다.

Task 문서는 작업 전 계획서이면서 작업 후 실행 기록이다. 처음부터 결과를 아는 것처럼 완성본만 쓰지 않고, 진행하면서 `Current State`, `Changes`, `Problems Encountered`, `Verification`과 `Diff Review`를 갱신한다.

## 파일명 규칙

세 자리 증가 번호와 kebab-case 작업명을 사용한다.

```text
001-bootstrap-monorepo.md
002-product-catalog.md
003-cart.md
004-order.md
005-toss-payment.md
```

[`000-template.md`](./000-template.md)를 복사해 다음 사용 가능한 번호로 만든다. 하나의 task가 무관한 여러 기능을 포함하지 않도록 범위를 나눈다.

## 작성 시점

1. 구현 전에 Goal, Context, Relevant Knowledge와 Current State를 작성한다.
2. 대안을 비교하고 선택 이유가 드러나도록 Options Considered와 Plan을 작성한다.
3. 구현 중 실제 Changes와 Problems Encountered를 계속 기록한다.
4. 구현 후 Resolution, Verification과 Diff Review를 실제 결과로 채운다.
5. 남은 작업과 배운 점을 Follow-up과 Lessons Learned에 기록한다.

아주 작은 오탈자 수정처럼 별도 판단이나 검증 맥락이 필요 없는 변경은 새 task가 필요하지 않을 수 있다. 판단이 애매하면 변경 범위와 재사용할 지식이 있는지 기준으로 결정한다.

## 다른 문서와의 관계

- `docs/domain/` — 여러 task에서 계속 참조할 서비스 개념과 규칙
- `docs/adr/` — 장기간 적용할 중요한 기술·설계 결정
- `tasks/` — 한 작업에서 실제로 무엇을 검토하고 수행했는지
- `docs/retrospectives/` — 여러 task를 거치며 발견한 개발 방식 자체의 개선점

Task에서 domain 규칙이나 중요한 결정을 새로 발견했다면 task 안에만 묻어 두지 말고 해당 원본 문서도 갱신한다.
