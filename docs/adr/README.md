# Architecture Decision Records

## ADR이란?

ADR(Architecture Decision Record)은 프로젝트에 오래 영향을 주는 중요한 기술·설계 결정 하나와 그 판단 근거를 기록하는 문서다. 최종 선택만 남기지 않고 당시의 문제, 검토한 대안, 선택 이유와 감수한 단점을 함께 남기므로 나중에 맥락 없이 결정을 뒤집는 일을 줄여 준다.

ADR은 구현 과정을 모두 적는 작업 일지가 아니다. 개별 작업의 계획과 오류는 `tasks/`에 기록하고, 서비스 개념과 규칙은 `docs/domain/`에 기록한다.

## 언제 새 ADR을 만드는가?

다음 중 하나에 해당하면 ADR을 고려한다.

- 여러 애플리케이션이나 이후 task에 지속적으로 영향을 주는 선택
- 되돌리기 어렵거나 전환 비용이 큰 기술·데이터·배포 결정
- 여러 합리적인 대안 중 하나를 근거를 가지고 선택해야 하는 경우
- 보안 경계, 데이터 소유권, transaction 또는 외부 서비스 연동 방식의 결정
- 기존 Accepted ADR을 대체하거나 중요한 전제를 변경하는 경우

예: workspace 구조 확정, ORM 선택, API 계약 방식, 결제 상태 모델, 배포 topology.

오탈자 수정, 특정 함수 내부 구현, 쉽게 되돌릴 수 있는 임시 선택이나 아직 선택하지 않은 후보만으로는 ADR을 만들지 않는다. 필요한 조사와 후보 비교는 먼저 관련 task에 남긴다.

## 파일명 규칙

세 자리 증가 번호와 짧은 kebab-case 제목을 사용한다.

```text
001-use-pnpm-workspace.md
002-use-postgresql.md
003-payment-state-model.md
```

기존 번호를 재사용하지 않는다. [`000-template.md`](./000-template.md)를 복사해 다음 번호로 만든다.

## Status

- `Proposed` — 검토 중이며 아직 프로젝트 기준이 아님
- `Accepted` — 검토 후 현재 프로젝트 기준으로 채택됨
- `Superseded` — 더 새로운 ADR로 대체됨. 대체 ADR 링크를 남김
- `Rejected` — 검토했지만 채택하지 않음

## 운영 방법

1. 문제와 선택지가 구체화되면 ADR 초안을 `Proposed`로 작성한다.
2. 관련 domain, task와 공식 자료를 연결한다.
3. 선택지의 장단점과 장기 영향을 검토한다.
4. 합의된 경우에만 `Accepted`로 변경하고 구현 task에서 참조한다.
5. 결정이 바뀌면 과거 기록을 지우지 않고 새 ADR을 만든 뒤 기존 ADR을 `Superseded`로 표시한다.

현재 Accepted 상태인 기술 결정은 다음과 같다.

- [`001-use-pnpm-workspace.md`](./001-use-pnpm-workspace.md): pnpm workspace 구조와 단일 lockfile을 사용한다.
- [`002-use-esm-for-nest-api.md`](./002-use-esm-for-nest-api.md): NestJS API에 ESM과 TypeScript `NodeNext`를 사용한다.
