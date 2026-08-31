# Task: pnpm workspace와 Next.js web bootstrap

## Goal

pnpm workspace의 최소 루트 구성과 `apps/web` Next.js 애플리케이션을 만들고, 루트 명령으로 lint, typecheck, build와 개발 서버를 실행할 수 있게 한다. 브라우저의 `/` 경로에서 실제 PhytoWorks의 사업 맥락과 Demo 경계를 반영한 첫 화면을 확인하면 완료한다.

## Context

저장소는 Stage 0 문서 기반만 있고 실행 가능한 코드가 없다. 전체 쇼핑몰 기능을 시작하기 전에 `Browser → Next.js` 경로와 monorepo의 첫 애플리케이션 경계를 작게 검증해야 한다.

초기 문서는 회사명을 일반 식물·농업 소매점으로 해석했지만, 사용자 확인과 공식 사이트 조사 결과 PhytoWorks는 NITRO를 중심으로 환경 제어, 이미징과 AI 표현형 분석을 제공하는 B2B 연구 플랫폼 회사다. 첫 bootstrap을 commit하기 전에 이 전제를 바로잡는다.

## Relevant Knowledge

- `docs/context/project-overview.md`
- `docs/context/company-reference.md`
- `docs/context/architecture-overview.md`
- `docs/development/workflow.md`
- `docs/development/git-worktree.md`
- `docs/development/testing-strategy.md`
- `docs/adr/001-use-pnpm-workspace.md`
- Next.js 공식 Installation 문서: <https://nextjs.org/docs/app/getting-started/installation>
- pnpm 공식 Workspace 문서: <https://pnpm.io/workspaces>
- pnpm 공식 Installation 문서: <https://pnpm.io/installation>
- PhytoWorks 공식 홈페이지: <https://phyto-works.com/ko>
- NITRO 공식 제품 페이지: <https://phyto-works.com/ko/nitro>

## Current State

- 작업 branch: `uiuuymin/bootstrap`
- 기준 commit: `bb4d131` (`문서: LLM Wiki 기반 구축`)
- 실행 가능한 애플리케이션과 `package.json`, `pnpm-workspace.yaml`이 없다.
- 로컬 Node.js는 `v24.14.0`, Corepack은 `0.34.6`이며 pnpm 명령은 아직 설치되지 않았다.
- 2026-08-27 npm registry 기준 버전은 pnpm `11.24.0`, Next.js `16.3.3`, TypeScript `7.0.2`, React `19.2.8`이다.
- pnpm 12는 2026-08-26 공개된 새 major이고 npm의 `latest` tag는 아직 pnpm 11을 가리킨다.

## Options Considered

### 1. 저장소 루트에 Next.js만 생성

- 장점: 파일과 설정이 가장 적고 처음 실행하기 쉽다.
- 단점: 이후 NestJS와 공유 package를 추가할 때 구조를 다시 이동해야 하며, 목표 monorepo를 학습하지 못한다.

### 2. pnpm workspace와 `apps/web`만 먼저 생성

- 장점: 현재 필요한 web만 만들면서 이후 `apps/api`, `packages/*`를 수용할 경계를 미리 검증할 수 있다.
- 단점: 앱이 하나뿐인 현재도 루트 package와 workspace 설정을 이해해야 한다.

### 3. web, API와 모든 공유 package를 한 번에 scaffold

- 장점: 목표 디렉터리 모양을 한 번에 만들 수 있다.
- 단점: 이번 작업과 무관한 NestJS, database와 공유 설정 결정까지 섞여 학습과 diff 범위가 커진다.

### pnpm 11과 pnpm 12

- pnpm 11.24.0: npm의 현재 기본 최신이며 기존 Node 생태계 구현을 사용해 초기 bootstrap 위험이 낮다.
- pnpm 12: stable이지만 출시 직후의 Rust rewrite라 새 major 자체의 차이와 문제를 함께 조사해야 한다.

### 첫 화면과 Product 맥락

1. 일반 식물·농업 소매품을 임의로 구성
   - 장점: 흔한 쇼핑몰 예제를 빠르게 적용할 수 있다.
   - 단점: 실제 PhytoWorks의 고객과 제품에서 벗어나 LLM Wiki의 출발점이 잘못된다.
2. 공식 사이트를 그대로 복제하고 모든 항목을 실제 판매 상품으로 표현
   - 장점: 시각·문구 유사성이 높다.
   - 단점: 공식 사이트는 문의 중심이며 실제 가격·온라인 판매 조건과 이미지 사용 권한이 확인되지 않았다.
3. 공식 제품 맥락을 사용하되 학습용 판매 조건을 Demo로 분리
   - 장점: 회사 정체성을 유지하면서 장바구니·주문·테스트 결제 학습을 진행할 수 있다.
   - 단점: 화면과 domain에서 `Confirmed`, `Proposed`, `Demo`를 지속적으로 구분해야 한다.

## Plan

workspace는 Option 2와 pnpm 11.24.0을 선택한다. 첫 화면은 회사 맥락 Option 3을 선택한다.

1. 루트 `package.json`과 `pnpm-workspace.yaml`을 만든다.
2. pnpm 11.24.0을 설치하고 버전을 확인한다.
3. 공식 `create-next-app`을 사용해 TypeScript와 App Router 기반 `apps/web`을 생성한다. Tailwind와 React Compiler는 첫 화면 학습에 필요하지 않아 제외한다. lint는 TypeScript 7 호환성을 검증해 ESLint 또는 Biome 중 하나를 선택한다.
4. 루트에서 `dev`, `build`, `lint`, `typecheck`를 실행할 script를 연결한다.
5. 공식 PhytoWorks 맥락과 Demo 판매 조건을 구분한 최소 학습용 화면으로 `apps/web/app/page.tsx`를 바꾼다.
6. lint, typecheck, production build와 브라우저 수동 검증을 수행한다.
7. 실제 버전과 결과를 context, ADR과 이 task에 반영하고 전체 diff를 검토한다.

변경 범위는 workspace 루트 설정, `apps/web`, 관련 task·ADR·context 문서로 제한한다. NestJS, PostgreSQL, Docker, Toss Payments와 배포 설정은 변경하지 않는다.

## Changes

- 루트 `package.json`에 pnpm 11.24.0을 고정하고 `dev`, `lint`, `typecheck`, `build` script를 추가했다.
- `pnpm-workspace.yaml`에서 `apps/*`, `packages/*`를 workspace 범위로 정하고 create-next-app이 생성한 dependency build 허용 설정을 루트로 이동했다.
- Next.js 16.3.3, React 19.2.8과 TypeScript 7.0.2 기반 `apps/web`을 생성했다.
- TypeScript 7 API를 요구하지 않는 Biome 2.5.10으로 lint를 구성했다.
- `/` 페이지를 `<h1>Phyto Shop</h1>`로 단순화하고 한국어 문서 metadata와 `lang="ko"`를 설정했다.
- 사용자 피드백 후 공식 PhytoWorks 사이트를 재확인하고 일반 식물 소매점 가정을 제거했다.
- `docs/context/company-reference.md`에 공식 사실, 미확정 내용, Proposed 판매 모델과 Demo 경계를 기록했다.
- Product를 생육 시스템, 이미징 모듈, 환경·관수 옵션과 분석 서비스로 다시 정의하고 `purchaseMode` 후보를 추가했다.
- `/` 페이지를 NITRO와 이미징 모듈의 정적 TypeScript Product 목록으로 바꾸고 실제 판매 조건이 아니라는 안내를 추가했다.
- web README에 현재 책임, 실행과 검증 명령을 기록했다.
- ADR-001을 Accepted로 전환하고 context·testing 문서를 실제 구현 상태로 갱신했다.

## Problems Encountered

- 최초 Orca worktree 생성 시 Git 기준이 로컬 `main`이 아니라 이전 `origin/main`으로 선택되었다.
- `create-next-app` 첫 실행은 존재하지 않는 `apps/` 경로의 쓰기 가능 여부를 확인하지 못해 실패했다.
- create-next-app은 앱 내부에 독립 `pnpm-lock.yaml`과 `pnpm-workspace.yaml`을 생성해 의도한 단일 루트 workspace와 달랐다.
- create-next-app 기본 TypeScript 범위는 `^5`였고 목표인 TypeScript 7을 자동 선택하지 않았다.
- TypeScript 7은 아직 `typescript-eslint`에서 지원되지 않아 생성된 ESLint 구성이 실행 단계에서 실패했다.
- TypeScript 공식 TS6 alias 방식을 적용하면 lint는 통과하지만 Next.js 16.3의 package 검사가 alias를 TypeScript 설치로 인정하지 않아 build가 실패했다.
- 현재 PowerShell 실행 정책은 npm 전역 설치가 만든 `pnpm.ps1` 실행을 차단한다.
- PowerShell 종료 시 Conda의 `SSL_CERT_FILE` 정리 script가 존재하지 않는 환경변수를 제거하려는 경고를 반복 출력한다.
- 회사명을 근거 없이 일반 식물·농업 소매점으로 해석해 Product와 첫 화면의 맥락이 공식 사업과 달랐다.
- 실행 중 `next.config.ts` 첫 줄에 Python식 `'''...'''` 설명을 넣자 TypeScript parser가 이를 문장으로 해석해 개발 서버가 종료되었다.
- 최종 `typecheck`의 첫 재실행은 코드가 아니라 sandbox가 Orca worktree의 `tsconfig.tsbuildinfo` 쓰기를 막아 실패했다.

## Resolution

- 새 branch에는 변경이 없었으므로 `git merge --ff-only main`으로 로컬 `main`의 `bb4d131`까지 안전하게 fast-forward했다.
- `apps/`를 먼저 만든 뒤 create-next-app을 다시 실행했다.
- 앱 내부 lockfile과 workspace 설정을 제거하고 루트에서 `pnpm install`을 실행해 하나의 `pnpm-lock.yaml`로 통합했다.
- TypeScript 7을 일반 `typescript` package로 유지하고 Next.js 공식 지원 lint 선택지인 Biome를 사용했다. 이 선택은 Next.js 전용 ESLint 규칙을 당분간 사용하지 않는 trade-off가 있다.
- 저장소나 사용자 보안 정책을 바꾸지 않고 현재 PowerShell에서는 `pnpm.cmd`로 검증했다. 일반 shell 또는 npm PowerShell script 실행이 허용된 환경에서는 문서의 `pnpm` 명령을 그대로 사용한다.
- Conda 경고는 실행한 Git 명령의 exit code와 결과에 영향을 주지 않는 환경 종료 경고로 확인했으며, 이번 repository bootstrap 범위에서는 Conda 설정을 수정하지 않는다.
- 공식 홈페이지와 NITRO 페이지에서 확인한 사실을 별도 context 문서에 기록하고, 확인되지 않은 가격·재고·온라인 판매 조건은 `Proposed` 또는 `Demo`로 분리했다.
- `next.config.ts`의 설명은 TypeScript 한 줄 주석인 `// ...`로 바꿨다. 설정 파일도 TypeScript 코드이므로 Python의 삼중 따옴표를 주석으로 사용할 수 없다.
- 동일 `typecheck`를 Orca worktree 쓰기 권한으로 다시 실행해 실제 TypeScript 오류가 없음을 확인했다.

## Verification

- `pnpm.cmd --version` → `11.24.0`
- `pnpm.cmd --filter @phytoworks/web exec tsc --version` → `Version 7.0.2`
- `pnpm.cmd --filter @phytoworks/web exec next --version` → `Next.js v16.3.3`
- `pnpm.cmd lint` → 성공, Biome가 3개 source/config 파일 검사
- `pnpm.cmd typecheck` → 성공, `tsc --noEmit`
- `pnpm.cmd build` → 성공, `/`와 `/_not-found` static page 생성
- Orca terminal에서 `pnpm.cmd dev` → Next.js 16.3.3, `http://localhost:3000`, Ready
- Orca browser tab → 최초 bootstrap에서 URL `http://localhost:3000/`, title `Phyto Shop`, load error 없음
- `Invoke-WebRequest http://localhost:3000` → 최초 bootstrap에서 HTTP 200, HTML에 `<h1>Phyto Shop</h1>` 포함
- 회사 맥락 수정 후 Orca browser tab → URL `http://localhost:3000/`, title `PhytoWorks Shop`, load error 없음
- 회사 맥락 수정 후 `Invoke-WebRequest http://localhost:3000` → HTTP 200, HTML에 `NITRO Plant Growth System`, `Thermal Imaging Module`, `학습용 Demo` 포함
- 별도 unit test는 domain logic이 없는 bootstrap 화면이므로 추가하지 않았다.

## Diff Review

- 변경 범위가 pnpm workspace bootstrap, `apps/web` 첫 화면과 관련 문서로 제한되어 있음을 확인했다.
- 일반 식물 소매점 문구가 남지 않았고, 회사가 공개하지 않은 가격·재고·온라인 판매 조건을 사실처럼 추가하지 않았음을 확인했다.
- 회사 로고나 제품 이미지는 복사하지 않았고 공식 홈페이지와 NITRO 페이지는 출처 링크로만 연결했다.
- bootstrap 검토 checkpoint의 상태는 tracked 수정 8개와 untracked 13개였으며 예상 밖의 범위 외 파일은 없었다. 이후 추가된 IA·UI Wiki 문서는 `tasks/002-plan-shop-ia-ui.md`에서 별도로 추적한다.
- `git diff --check`와 untracked 파일을 포함한 trailing whitespace 검사가 통과했다. Git의 LF→CRLF 안내와 전역 ignore 접근 경고는 diff 오류가 아니다.

## Follow-up

- NestJS `apps/api` 생성
- 공유 package가 실제로 필요해질 때 `packages/*` 책임 확정
- Node.js 버전 고정 방식과 CI 기준 결정
- typescript-eslint와 Next.js 16.3의 TypeScript 7 alias 호환성이 해결되면 Next.js 전용 ESLint 규칙 재검토
- pnpm 12 전환은 출시 초기 안정성과 차이를 별도 task에서 검증
- 회사가 승인한 로고·제품 이미지가 있는지 확인한 뒤 시각 디자인 task에서 사용
- `DIRECT_PURCHASE`로 둘 Demo Product와 가상 가격은 상품 목록 task에서 별도 결정

## Lessons Learned

- 생성 도구의 기본값은 프로젝트 목표 버전과 monorepo 경계를 자동으로 보장하지 않으므로 생성 후 파일·lockfile·실제 설치 버전을 확인해야 한다.
- TypeScript compiler 실행, compiler API를 사용하는 lint 도구와 framework의 package 검사는 서로 다른 호환성 경계다.
- worktree의 Orca 계보와 Git base commit은 별개이므로 생성 직후 branch와 head를 함께 확인해야 한다.
- 프로젝트명만으로 도메인을 추정하지 않고 실제 회사의 공식 자료와 확인되지 않은 판매 조건을 분리해야 한다.
