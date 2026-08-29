# ADR-001: pnpm workspace와 애플리케이션 디렉터리 사용

## Status

Accepted

## Context

PhytoWorks Shop은 장기적으로 Next.js web, NestJS API와 필요한 공유 package를 한 저장소에서 개발할 계획이다. 첫 실행 코드를 만들면서 Next.js를 루트에 직접 둘지, 처음부터 여러 프로젝트의 경계를 표현할지 결정해야 한다.

## Options Considered

### 저장소 루트에 단일 Next.js 애플리케이션 배치

- 초기 파일 수와 명령이 가장 단순하다.
- API를 추가할 때 기존 web 파일을 이동하거나 monorepo 구조로 다시 전환해야 한다.

### pnpm workspace에서 `apps/web`부터 시작

- web과 이후 API의 책임 경계를 디렉터리로 표현한다.
- 하나의 lockfile과 package manager 버전으로 여러 프로젝트를 관리할 수 있다.
- 앱이 하나인 초기에도 루트 workspace 설정이 추가된다.

### 별도 repository로 web과 API 분리

- 각 애플리케이션의 배포와 이력이 완전히 독립적이다.
- 학습 단계에서 계약, 변경과 로컬 실행을 여러 repository에 걸쳐 관리해야 해 운영 부담이 커진다.

## Decision

루트에 `pnpm-workspace.yaml`을 두고 애플리케이션은 `apps/*`, 향후 실제로 필요한 공유 package는 `packages/*`에 둔다. 첫 bootstrap에서는 `apps/web`만 생성하며 빈 `apps/api` 또는 `packages` 디렉터리는 만들지 않는다.

package manager는 pnpm 11.24.0으로 고정한다. pnpm 12는 stable이지만 2026-08-26 공개된 새 major이므로 이번 초기 학습 범위에서는 채택하지 않는다.

## Rationale

이 구조는 현재 필요한 Next.js 실행만 구현하면서도 목표인 web/API 분리와 monorepo 학습을 가능하게 한다. 아직 책임이 정해지지 않은 package를 미리 생성하지 않아 현재 task의 변경 범위도 작게 유지한다.

## Consequences

- 루트와 각 workspace package에 서로 다른 `package.json` 책임이 생긴다.
- 공통 설치 결과는 루트 `pnpm-lock.yaml`에 기록한다.
- 루트 script는 pnpm filter를 통해 실제 애플리케이션 script를 호출한다.
- 공유 package를 추가할 때 내부 의존성은 `workspace:` protocol 사용을 우선 검토한다.
- pnpm 12 전환은 호환성과 이점을 별도 task에서 검증해야 한다.
- API 계약 방식, ORM, database와 배포 topology는 이 ADR에서 결정하지 않는다.

## References

- `docs/context/architecture-overview.md`
- `tasks/001-bootstrap-monorepo.md`
- pnpm Workspace: <https://pnpm.io/workspaces>
- pnpm Installation: <https://pnpm.io/installation>
