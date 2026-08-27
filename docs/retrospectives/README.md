# Retrospectives

## 목적

Retrospective는 여러 작업을 수행한 뒤 개발 방식 자체를 돌아보고 다음 반복에서 무엇을 바꿀지 기록하는 문서다. 잘된 점뿐 아니라 실패가 생긴 구조적 이유와 구체적인 개선 행동을 남긴다.

## Task와의 차이

- **Task:** 하나의 기능이나 의미 있는 작업에서 무엇을 계획하고, 변경하고, 검증했는지 기록한다.
- **Retrospective:** 여러 task를 거치며 반복해서 나타난 문제와 협업·검토·테스트 방식에서 배운 점을 정리한다.

특정 오류 하나의 해결 과정은 우선 해당 task에 쓴다. 같은 종류의 오류가 반복되거나 planning, worktree, 리뷰, 테스트 방식 자체를 바꿀 필요가 생기면 retrospective를 작성한다.

## 권장 작성 시점

- milestone 또는 주요 기능 묶음이 끝났을 때
- 같은 실수나 병목이 여러 task에서 반복됐을 때
- AI와 사람의 역할, 문서 읽기 순서 또는 검증 workflow를 바꿔야 할 때
- 배포·결제처럼 위험도가 높은 흐름을 처음 끝까지 수행한 뒤

파일명은 날짜 또는 순번과 주제를 조합한 일관된 kebab-case를 사용한다. 실제 규칙은 첫 retrospective 작성 시 정한다.

## 권장 구조

```md
# Retrospective: 제목

## What went well

## What went wrong

## Why it happened

## What we learned

## What we will change next time
```

마지막 항목은 “더 주의한다”처럼 모호하게 끝내지 않고 다음 task에서 확인할 수 있는 구체적인 행동이나 규칙으로 작성한다.
