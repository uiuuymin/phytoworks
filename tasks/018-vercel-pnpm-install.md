# Task 018: Vercel pnpm 설치 실패 대응

**Status:** 완료

## Goal

Vercel의 깨끗한 빌드 환경에서 `pnpm install`이 성공하도록 package manager 버전과
workspace 설치 스크립트 승인 정책을 명시한다. 완료 조건은 frozen install이 성공하고,
기존 Web production build가 유지되는 것이다.

## Context

Vercel 배포 중 `Command "pnpm install" exited with 1` 오류가 발생했다. 로컬의 기존
`node_modules`가 있는 상태에서는 설치가 성공했지만, 강제 재설치 중 Prisma 설치 스크립트
승인 설정이 필요하다는 메시지가 확인되었다. Vercel은 매 배포마다 깨끗한 의존성 설치를
수행하므로 로컬의 증분 설치 성공만으로 배포 가능성을 판단할 수 없다.

## Relevant Knowledge

- `docs/context/index.md`의 배포 작업 경로
- `docs/context/project-overview.md`의 Vercel 배포 목표
- `docs/context/architecture-overview.md`의 Web, API와 DB 배포 경계
- `docs/adr/001-use-pnpm-workspace.md`의 단일 workspace lockfile 결정
- `tasks/009-product-database.md`와 `tasks/013-cart-api.md`의 Prisma 설치 스크립트 승인
  시행착오
- Vercel 공식 문서: package manager 지원 버전과 monorepo Root Directory 설정

## Current State

- 루트 `package.json`은 `pnpm@11.24.0`을 지정했다.
- `pnpm-lock.yaml`은 `lockfileVersion: '9.0'`이다.
- `pnpm-workspace.yaml`은 `sharp`와 `unrs-resolver`만 `allowBuilds: false`로 지정한다.
- 루트와 `apps/web`에서 기존 설치 상태의 `pnpm install --frozen-lockfile`은 성공했다.
- 강제 재설치에서는 `@prisma/engines`와 `prisma`의 build approval 설정이 필요하다는
  pnpm 메시지가 발생했다.
- 현재 작업은 `fix/vercel-pnpm-install-current` worktree에서 수행한다.

## Options Considered

1. Vercel 설정에서만 `pnpm install --ignore-scripts`를 사용한다.
   설치는 우회할 수 있지만 Prisma와 다른 의존성의 필요한 postinstall을 건너뛰며,
   프로젝트 설정과 로컬, CI의 동작이 달라진다.
2. Vercel Root Directory를 `apps/web`로만 지정하고 루트 workspace 설치를 피한다.
   Web만 배포할 때 의존성 범위는 줄어들 수 있지만 단일 lockfile workspace와 Root Directory
   밖의 파일 접근 조건을 함께 확인해야 한다.
3. Vercel이 지원하는 pnpm 10으로 고정하고, Prisma의 허용된 build script를 workspace
   설정에 명시한다.
   깨끗한 설치 정책이 코드에 남고 기존 workspace 구조를 유지한다. Prisma 설치 스크립트를
   신뢰하는 범위만 허용한다는 위험은 남는다.

## Plan

세 번째 방법을 선택한다. 루트 package manager를 Vercel 지원 범위의 pnpm 10.34.4로
고정하고, `@prisma/engines`와 `prisma`의 build script만 허용한다. `sharp`와
`unrs-resolver`는 기존의 비허용 정책을 유지한다. 이후 pnpm 10의 frozen install,
lint, typecheck와 build를 실행하고 diff를 확인한다.

## Changes

- 루트 `package.json`의 `packageManager`를 `pnpm@10.34.4`로 변경했다.
- `pnpm-workspace.yaml`에 `@prisma/engines: true`와 `prisma: true`를 추가했다.
- 이 task 문서에 원인, 선택지와 검증 결과를 기록한다.

## Problems Encountered

- 기존 로컬 `node_modules`가 있는 상태의 `pnpm install --frozen-lockfile`은 문제를
  드러내지 않고 `Already up to date`로 종료했다.
- 강제 재설치에서는 pnpm이 `@prisma/engines`와 `prisma`의 허용 여부를 명시하도록
  `pnpm-workspace.yaml`에 임시 placeholder를 추가했다. 해당 placeholder는 올바른
  boolean 설정으로 교체했다.
- 로컬 PowerShell profile이 존재하지 않는 `SSL_CERT_FILE`을 제거하려는 경고를 매번
  출력했다. 저장소 파일과 무관한 환경 경고이므로 수정하지 않았다.

## Resolution

Vercel의 지원 범위에 맞춰 pnpm 10.34.4를 사용하도록 고정하고, workspace 전체 설치에서
필요한 Prisma build script만 허용했다. `sharp`와 `unrs-resolver`는 기존처럼 허용하지
않는다. pnpm 10.34.4의 깨끗한 frozen install과 Prisma postinstall이 성공했으므로
설치 단계의 원인을 해결했다.

## Verification

- `pnpm install --frozen-lockfile` → 성공, pnpm 10.34.4, lockfile 변경 없음
- 깨끗한 workspace에서 `pnpm install --frozen-lockfile` → 성공, 374 packages 설치,
  `@prisma/engines` postinstall과 `prisma` preinstall 완료
- `pnpm lint` → 성공, API·Web lint 완료
- `pnpm typecheck` → 성공, API·Web typecheck 완료
- `pnpm test` → 성공, API 13개 파일·42개 테스트 통과
- `pnpm build` → 성공, API build와 Next.js Web production build 완료
- `git diff --check` → 성공

## Diff Review

- 변경 파일은 `package.json`, `pnpm-workspace.yaml`과 이 task 문서뿐이다.
- `pnpm-lock.yaml`은 변경하지 않았다. lockfile version 9.0은 pnpm 10에서 frozen install이
  성공했다.
- 실제 credential과 Vercel Project 설정은 저장소에 추가하지 않았다.
- Vercel Dashboard에서 Root Directory와 환경변수를 잘못 설정하면 설치 이후 단계에서
  별도 오류가 발생할 수 있다.

## Follow-up

- Vercel Project의 Root Directory, Build Command와 환경변수는 Dashboard에서 별도로 설정한다.
- NestJS API와 PostgreSQL의 배포 위치 및 연결 구조는 별도 결정이 필요하다.
- 실제 Vercel 빌드 로그의 전체 오류 문구를 확인해 pnpm 설치 오류가 재발하지 않는지 확인한다.

## Lessons Learned

깨끗한 설치 환경과 기존 `node_modules`가 있는 로컬 환경은 설치 스크립트 승인 정책에서
다르게 동작할 수 있다. 배포 전에는 frozen clean install을 별도로 검증해야 한다.
