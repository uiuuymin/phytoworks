# Task: NestJS API bootstrap 설계와 구현

**Status:** 구현 완료

## Goal

pnpm workspace의 `apps/api`에 실행 가능한 최소 NestJS 애플리케이션 경계를 만들고, `GET /health`로 애플리케이션의 기동과 HTTP 응답 가능 여부를 검증한다. 이번 task는 Product와 Cart 같은 사업 기능을 구현하지 않고, 이후 domain module을 추가할 수 있는 실행·검증·문서 경계만 마련한다.

구현 완료 조건은 다음과 같다.

- `apps/api`가 기존 `apps/*` workspace 범위에 포함된다.
- API를 개발 mode와 production build 결과로 실행할 수 있다.
- `GET /health`가 HTTP 200과 최소 JSON 계약으로 응답한다.
- 존재하지 않는 route가 NestJS의 정상적인 HTTP 404로 응답한다.
- API 단독 `lint`, `typecheck`, `test`와 `build`가 통과한다.
- 저장소 루트의 `lint`, `typecheck`, `test`와 `build`가 web과 API를 일관되게 검증한다.
- 루트 `dev`가 web과 API 개발 서버를 함께 실행하며 두 서버의 기본 port가 충돌하지 않는다.
- API의 로컬 실행 방법, 환경변수와 요청 경로를 내부 문서에서 확인할 수 있다.
- Product read API를 추가할 module 위치와 이번 health 경계에서 교체하지 않을 부분이 문서화된다.
- context, architecture, UX roadmap와 testing 문서가 구현된 실제 단계와 일치한다.
- dependency와 단일 root lockfile의 변경이 승인된 package로 제한된다.

## Context

현재 요청 경로는 Product 조회의 경우 `Browser → Next.js Server Component → 정적 Product data → Browser`, Cart 조작의 경우 `Browser event → CartProvider reducer → browser memory → localStorage`다. `apps/api`가 없으므로 Proposed architecture의 `Next.js → NestJS` 구간을 아직 실행하거나 검증할 수 없다.

이번 bootstrap 이후에도 web은 API를 호출하지 않는다. `GET /health`는 다음 경로만 검증한다.

```text
HTTP client → NestJS HTTP adapter → HealthController → JSON response
```

이 endpoint는 애플리케이션 process가 기동했고 HTTP 요청을 처리할 수 있다는 사실만 나타낸다. PostgreSQL, 외부 서비스, Product, Cart, Order, Payment와 실제 사업 상태를 확인하거나 추정하지 않는다.

## Relevant Knowledge

### 저장소 문서와 설정

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/company-reference.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/design/shop-ux-strategy.md`
- `docs/development/workflow.md`
- `docs/development/testing-strategy.md`
- `docs/domain/glossary.md`
- `docs/domain/product.md`
- `docs/adr/README.md`
- `docs/adr/001-use-pnpm-workspace.md`
- `tasks/README.md`
- `tasks/001-bootstrap-monorepo.md`
- `tasks/006-cart.md`
- root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`과 `.gitignore`
- `apps/web/package.json`, `tsconfig.json`, `biome.json`, `next.config.ts`와 `README.md`

### 2026-08-31에 확인한 공식 자료

- NestJS First steps: <https://docs.nestjs.com/first-steps>
- NestJS 12 Migration guide: <https://docs.nestjs.com/migration-guide>
- NestJS Controllers: <https://docs.nestjs.com/controllers>
- NestJS Testing: <https://docs.nestjs.com/fundamentals/testing>
- NestJS Lifecycle events: <https://docs.nestjs.com/fundamentals/lifecycle-events>
- NestJS CORS: <https://docs.nestjs.com/security/cors>
- NestJS Versioning: <https://docs.nestjs.com/techniques/versioning>
- NestJS Validation: <https://docs.nestjs.com/techniques/validation>
- NestJS Health checks: <https://docs.nestjs.com/recipes/terminus>
- NestJS CLI workspace: <https://docs.nestjs.com/cli/monorepo>
- NestJS 12 application schematic의 ESM template: <https://github.com/nestjs/schematics/tree/master/src/lib/application/files/ts-esm>
- Nest CLI의 TypeScript 7 지원 현황: <https://github.com/nestjs/nest-cli/issues/3479>
- Node.js TypeScript 실행: <https://nodejs.org/api/typescript.html>
- Node.js watch mode: <https://nodejs.org/api/cli.html#--watch>
- Node.js test runner: <https://nodejs.org/api/test.html>
- TypeScript decorators: <https://www.typescriptlang.org/docs/handbook/decorators>
- TypeScript `emitDecoratorMetadata`: <https://www.typescriptlang.org/tsconfig/emitDecoratorMetadata.html>
- pnpm Filtering: <https://pnpm.io/filtering>
- pnpm run: <https://pnpm.io/cli/run>
- pnpm Workspace: <https://pnpm.io/workspaces>
- Biome configuration: <https://biomejs.dev/guides/configure-biome/>

package version, Node engine과 peer dependency는 npm registry의 package metadata를 `pnpm view <package> version engines peerDependencies --json`으로 별도 확인했다.

## Current State

- 현재 branch는 `uiuuymin/api-bootstrap`이다.
- `HEAD`는 기준 commit `925fc1ce1517b235de0db9a6d07148f0eb26f820` (`Cart 상태와 화면 구현`)과 일치한다.
- 계획 작성 전 `git status --short --branch`에서 tracked 변경과 untracked 파일이 없는 깨끗한 worktree를 확인했다.
- 로컬 도구는 Node.js `v24.14.0`, Corepack `0.34.6`, pnpm `11.24.0`이다.
- `pnpm-workspace.yaml`은 이미 `apps/*`와 `packages/*`를 포함하므로 `apps/api`를 위해 workspace pattern을 바꿀 필요가 없다.
- root에는 `apps/web` importer만 포함한 단일 `pnpm-lock.yaml`이 있다. 별도 application lockfile은 없다.
- root script인 `dev`, `build`, `lint`와 `typecheck`는 `@phytoworks/web`만 직접 지정한다. root `test` script는 없다.
- `apps/web`은 Next.js `16.3.3`, React `19.2.8`, TypeScript `7.0.2`와 Biome `2.5.10`을 사용한다.
- web과 NestJS test runner는 아직 결정되지 않았다.
- `.gitignore`는 이미 `dist/`, `build/`, `*.tsbuildinfo`, `coverage/`, `.env`, `.env.*`를 제외하고 안전한 `.env.example`과 `.env.*.example`은 허용한다.
- `apps/api`, NestJS dependency, API source와 API 문서는 아직 없다.
- 현재 프로젝트 단계는 Stage 5: Browser Cart이며 UX roadmap의 다음 단계가 `api-bootstrap`이다.

## Compatibility and Version Baseline

NestJS 공식 문서와 2026-08-31 npm registry metadata를 함께 확인한 결과는 다음과 같다.

| package 또는 runtime | 확인한 version | 선택 또는 판단 근거 |
| --- | --- | --- |
| Node.js | 로컬 `24.14.0` | NestJS 12 application 실행 요건은 충족한다. 다만 NestJS 12 generator는 Node.js `24.15+`를 요구하므로 현재 환경에서 generator 사용을 기준으로 삼지 않는다. |
| `@nestjs/common` | `12.0.1` | 현재 NestJS major이며 `core`, HTTP platform과 같은 `12.0.1`로 맞춘다. |
| `@nestjs/core` | `12.0.1` | npm engine은 Node.js `>=20`이며 공식 migration 문서의 실제 runtime 하한을 함께 적용한다. |
| `@nestjs/platform-express` | `12.0.1` | NestJS의 기본 HTTP adapter다. 이번 bootstrap에는 별도 성능 요구가 없으므로 Fastify를 추가하지 않는다. |
| `reflect-metadata` | `0.2.2` | NestJS 12 peer 범위에 들어가며 decorator metadata runtime에 필요하다. |
| `rxjs` | `7.8.2` | NestJS 12의 `^7.1.0` peer 범위에 들어가는 현재 version이다. |
| `@nestjs/cli` | `12.0.0`, 미선택 | 현재 TypeScript 7은 programmatic compiler API를 제공하지 않아 CLI의 `nest build`와 `nest start`가 동작하지 않는다. generator와 compile dependency 모두 추가하지 않는다. |
| TypeScript | `7.0.2` | web과 같은 compiler version을 사용한다. API의 decorator와 Node module 설정은 별도 `tsconfig.json`에 둔다. |
| `@types/node` | `24.13.3` | API가 실제로 실행되는 Node.js 24 line과 맞춘다. web의 `@types/node@20` 범위는 변경하지 않는다. |
| `@nestjs/testing` | `12.0.1` | Nest application test context를 만들며 framework package major를 맞춘다. |
| Vitest | `4.1.11` | NestJS 12 ESM starter의 기본 test runner 계열이며 Node.js 24를 지원한다. |
| Supertest | `7.2.2` | NestJS 공식 e2e 예시처럼 실제 HTTP adapter의 요청·응답을 검증한다. |
| `@types/supertest` | `7.2.1` | Supertest test code의 타입 검사에 사용한다. |
| Biome | `2.5.10` | 기존 web과 같은 formatter 및 lint 도구를 사용한다. Nest 전용 lint toolchain을 중복 도입하지 않는다. |

NestJS 12는 core package를 ESM으로 제공하며 새 project는 CommonJS와 ESM 중 하나를 선택할 수 있다. 새 API는 공식 ESM starter 방향인 `type: module`, TypeScript `module: nodenext`와 `.js` relative import를 사용한다. 이 선택은 이후 모든 API module의 import와 test 설정에 영향을 주므로 ADR-002에 Accepted로 기록했다.

## Options Considered

### Nest CLI 기본 구조와 필요한 파일의 직접 구성

#### 1. `nest new`로 전체 기본 구조를 생성한다

- 장점: 공식 generator의 당시 기본 구조와 script를 빠르게 얻을 수 있다.
- 단점: 현재 Node.js `24.14.0`은 NestJS 12 generator가 요구하는 `24.15+`보다 낮다.
- 단점: 기본 Hello World service, controller, 별도 lint·format 도구, package manager 산출물과 예제 test를 생성한 뒤 이 repository 정책에 맞게 다시 정리해야 한다.
- 위험: 기존 bootstrap task에서 경험한 것처럼 application 내부 lockfile이나 workspace 설정이 생기면 단일 root lockfile 정책을 다시 정리해야 한다.

#### 2. 공식 ESM starter와 문서를 기준으로 필요한 파일만 직접 구성한다

- 장점: health endpoint와 실행 경계에 필요한 파일만 만들며 기존 pnpm, Biome와 TypeScript 정책을 의도적으로 연결할 수 있다.
- 장점: generator runtime 제약을 우회하기 위해 Node.js나 전역 도구를 임의로 변경하지 않는다.
- 단점: TypeScript decorator 설정, ESM import, build/watch script와 test 설정을 직접 확인해야 한다.

**선택:** Option 2를 선택한다. 공식 starter는 파일과 compiler option을 확인하는 기준으로만 사용하며 `@nestjs/cli`와 `@nestjs/schematics`를 dependency로 추가하지 않는다.

### Nest CLI와 TypeScript 7 build 및 watch

#### 1. `nest build`와 `nest start --watch`

- 장점: Nest CLI가 compile, output 정리, process restart를 하나의 명령으로 제공한다.
- 단점: Nest CLI는 TypeScript programmatic compiler API를 사용하지만 TypeScript 7.0.2는 현재 해당 API를 제공하지 않는다.
- 위험: Nest CLI의 공식 issue에서 `nest build`, `nest start`와 `nest start --watch`가 모두 실패한다고 확인되었으므로 이번 baseline으로 사용할 수 없다.

#### 2. TypeScript 7 `tsc` CLI와 Node.js watch mode를 pnpm script로 조합한다

- 장점: repository가 선택한 실제 TypeScript 7 compiler로 typecheck와 emit을 수행한다.
- 장점: Node.js 24의 stable watch mode와 pnpm의 다중 script 실행을 사용하므로 별도 process manager가 필요하지 않다.
- 단점: compile watcher와 Node process watcher의 역할을 두 script로 확인해야 한다.
- 단점: Nest CLI plugin, asset copy와 generator 기능을 사용할 수 없다. 이번 bootstrap에는 해당 기능이 필요하지 않다.

**선택:** Option 2를 선택한다. 최초 development 실행 전에 한 번 build하고, 그 뒤 `tsc --watch`와 `node --watch dist/main.js`를 동시에 실행한다. Nest CLI가 TypeScript 7 programmatic API를 지원하게 되면 실제 이점이 있는지 별도 task에서 재검토한다.

### CommonJS와 ESM

#### 1. CommonJS API

- 장점: 오랫동안 사용된 NestJS 구성이고 Jest 기반 예제가 많다.
- 단점: NestJS 12 core 자체는 ESM package이며 CommonJS application은 modern Node.js의 `require(esm)` 동작에 의존한다.
- 단점: 새 application을 만들면서 이전 module format을 선택할 별도 요구가 없다.

#### 2. ESM API

- 장점: NestJS 12의 새 ESM starter, `module: nodenext`와 Vitest 기본 방향을 따른다.
- 장점: ESM-only dependency를 이후 자연스럽게 사용할 수 있다.
- 단점: relative import에 `.js` 확장자를 사용해야 하며 package의 `type: module`과 TypeScript 설정을 함께 이해해야 한다.

**선택:** Option 2를 선택하고 Accepted ADR-002에 기록했다.

### Root module과 health 책임

#### 1. `AppController`와 `AppService`에 health 동작을 둔다

- 장점: Nest CLI의 전통적인 Hello World 파일 구조와 비슷하다.
- 단점: 실제 service가 필요하지 않은 응답에 provider를 추가하며 이후 application root와 운영 endpoint 책임이 섞인다.

#### 2. `HealthModule`과 `HealthController`를 별도 feature 경계로 둔다

- 장점: `AppModule`은 module 조립만 담당하고 health route는 독립적으로 유지된다.
- 장점: 이후 `ProductModule`, `CartModule`과 `OrderModule`을 같은 수준에서 추가할 위치가 명확하다.
- 단점: 최소 endpoint 하나를 위해 module 파일이 하나 더 필요하다.

**선택:** Option 2를 선택한다. `@nestjs/terminus`는 DB나 외부 service indicator가 없는 현재 요구에 비해 과도하므로 설치하지 않는다.

### `/health`와 `/api/health`

#### 1. `/api/health`

- 장점: 모든 HTTP route가 한 namespace 아래에 있는 것처럼 보인다.
- 단점: health는 Product 같은 business API가 아니며, 향후 global prefix나 API version을 바꿀 때 운영 probe 경로까지 함께 바뀔 수 있다.

#### 2. `/health`

- 장점: application process의 운영 endpoint를 business API namespace와 분리한다.
- 장점: 아직 결정되지 않은 `/api`, `/api/v1` 같은 Product API 계약을 이번 bootstrap이 미리 확정하지 않는다.
- 단점: 향후 global prefix를 도입할 때 health를 prefix 대상에서 제외한다는 규칙을 명시해야 한다.

**선택:** Option 2를 선택한다. 향후 business global prefix를 추가하더라도 `/health`는 별도 운영 경계로 유지한다.

### API port와 환경변수

#### 1. web과 같은 3000을 사용한다

- 장점: framework 기본 예시와 같다.
- 단점: root `dev`에서 Next.js와 즉시 충돌한다.

#### 2. API 기본 port를 3001로 두고 `PORT`로 재정의한다

- 장점: web `3000`, API `3001`이 로컬에서 함께 실행된다.
- 장점: 별도 configuration dependency 없이 일반적인 process environment 경계를 학습할 수 있다.
- 단점: 여러 service가 추가되면 port 배정 정책을 다시 문서화해야 한다.

**선택:** Option 2를 선택한다. `PORT`가 없으면 `3001`을 사용하고, 값이 1부터 65535까지의 정수가 아니면 잘못된 endpoint에 조용히 bind하지 않고 기동을 실패시킨다. `.env` loader와 `@nestjs/config`는 지금 추가하지 않으며 환경변수는 실행 process가 제공한다.

### CORS, global prefix, versioning, ValidationPipe와 graceful shutdown

| 항목 | 지금의 결정 | 이유와 추가 조건 |
| --- | --- | --- |
| CORS | 추가하지 않음 | web이 API를 호출하지 않는다. 첫 web/API 연결 task에서 허용 origin과 credential 필요 여부를 실제 요청 기준으로 정한다. |
| global prefix | 추가하지 않음 | 현재 route는 운영용 `/health` 하나뿐이다. business API namespace를 미리 확정하지 않는다. |
| API versioning | 추가하지 않음 | 호환성을 유지해야 하는 business contract가 아직 없다. Product read contract를 설계할 때 URI, header와 version-neutral 경계를 비교한다. |
| `ValidationPipe` | 추가하지 않음 | `/health`에는 body, query와 path parameter가 없다. 실제 외부 입력 DTO 또는 schema가 생길 때 validation 방식과 함께 추가한다. |
| graceful shutdown | `enableShutdownHooks()` 추가 | bootstrap lifecycle의 책임이며 추가 dependency가 없다. 향후 DB connection 같은 resource가 생기면 같은 종료 경계를 사용한다. Windows signal 제약은 공식 문서대로 남은 위험으로 기록한다. |

### Lint와 format 구성

#### 1. Nest starter의 별도 oxlint와 Prettier를 도입한다

- 장점: NestJS 12 generator의 현재 기본값과 같다.
- 단점: web의 Biome와 별도로 lint 및 format dependency, 설정과 수정 명령을 관리해야 한다.
- 단점: 이번 source는 Nest 전용 lint rule이 필요한 복잡한 코드가 아니다.

#### 2. 기존 Biome `2.5.10`을 API까지 확장한다

- 장점: web과 API가 같은 기본 format 및 lint 동작을 사용하고 root 검증 결과를 이해하기 쉽다.
- 장점: TypeScript 7 compiler API 호환성 때문에 ESLint 계열을 우회했던 기존 선택과 일치한다.
- 단점: Nest starter의 oxlint 또는 framework별 추가 규칙을 그대로 얻지는 못한다.

**선택:** Option 2를 선택한다. 현재 `apps/web/biome.json`의 최소 설정을 root `biome.json`으로 옮기고 web과 API가 parent configuration discovery로 공유한다. 별도 `packages/config`는 만들지 않는다. 각 application은 자신이 직접 실행하는 Biome version을 devDependency로 선언한다.

### TypeScript configuration

#### 1. web과 API가 하나의 root base config를 즉시 공유한다

- 장점: `strict`, `skipLibCheck`처럼 일부 공통 option을 한곳에서 관리할 수 있다.
- 단점: web은 DOM, JSX, bundler resolution과 Next plugin을 사용하지만 API는 Node ESM, decorator metadata와 emit 설정을 사용한다.
- 단점: 현재 실제 공통 option이 적어 stable web config까지 바꾸는 비용에 비해 이점이 작다.

#### 2. API `tsconfig.json`을 web과 독립적으로 둔다

- 장점: Node ESM과 Nest decorator 및 build output 책임이 한 파일에 명확하다.
- 장점: web의 검증된 설정을 건드리지 않는다.
- 단점: `strict` 같은 일부 option이 중복된다.

**선택:** Option 2를 선택한다. API는 공식 NestJS 12 ESM starter를 기준으로 `module`과 `moduleResolution`을 `nodenext`, `target`을 `ES2023`, `experimentalDecorators`와 `emitDecoratorMetadata`를 `true`로 둔다. `tsconfig.build.json`은 test를 제외하고 `src`만 `dist`로 emit한다. 실제 shared contract package가 생길 때 root base config의 이점을 다시 평가한다.

### Test runner와 test 범위

#### 1. Jest와 `ts-jest`

- 장점: NestJS의 기존 예제와 생태계 자료가 많고 Supertest 연동이 익숙하다.
- 단점: 현재 `ts-jest 29.4.12`의 TypeScript peer 범위는 `>=4.3 <7`이므로 이 repository의 TypeScript `7.0.2`와 맞지 않는다.
- 단점: `@swc/jest`로 우회할 수 있지만 SWC dependency와 legacy decorator metadata 설정이 추가된다.

#### 2. Node.js built-in test runner

- 장점: Node.js 20부터 stable이며 별도 runner dependency가 없다.
- 단점: Node.js의 built-in TypeScript type stripping은 `tsconfig.json`을 읽지 않고 decorator를 지원하지 않으므로 Nest source test를 직접 실행할 수 없다.
- 단점: test source를 먼저 별도 build하거나 다른 transform 도구를 추가해야 하므로 현재 최소 구성이 오히려 복잡해진다.

#### 3. Vitest와 Supertest

- 장점: NestJS 12 ESM starter의 현재 기본 test runner이며 TypeScript 7을 `ts-jest` peer 제약 없이 실행할 수 있다.
- 장점: `@nestjs/testing`은 runner에 종속되지 않으므로 Nest testing module과 Supertest 예시를 그대로 적용할 수 있다.
- 단점: 기존 Jest 자료의 mock API를 사용할 때 Vitest 문법으로 읽어야 한다.

**선택:** Option 3을 선택한다.

- Unit test는 `HealthController`가 정확히 `{ status: "ok" }`를 반환하는지 검증한다.
- Application test는 `AppModule`로 실제 Nest application과 HTTP adapter를 초기화한다.
- Application test는 `GET /health`의 status, JSON body와 content type을 검증한다.
- Application test는 존재하지 않는 route가 HTTP 404인지 검증한다. 기본 404 response body는 이번 API 계약으로 고정하지 않는다.
- Coverage package와 coverage threshold는 bootstrap 완료 조건이 아니므로 추가하지 않는다. 기존 `coverage/` ignore는 유지한다.

## Decision

다음 application 경계를 구현안으로 선택한다.

```text
apps/api/
├─ package.json
├─ tsconfig.json
├─ tsconfig.build.json
├─ vitest.config.ts
├─ README.md
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  └─ health/
│     ├─ health.module.ts
│     ├─ health.controller.ts
│     └─ health.controller.spec.ts
└─ test/
   └─ health.e2e-spec.ts
```

### 파일별 책임

| 파일 | 책임 |
| --- | --- |
| `src/main.ts` | `AppModule`로 Nest application을 생성하고 shutdown hook, `PORT` 검증과 HTTP listen을 담당한다. CORS, prefix, versioning과 global pipe는 두지 않는다. |
| `src/app.module.ts` | application root composition만 담당하며 첫 단계에는 `HealthModule`만 import한다. |
| `src/health/health.module.ts` | health controller를 등록하며 외부 indicator나 provider를 만들지 않는다. |
| `src/health/health.controller.ts` | `GET /health` route와 최소 response type을 소유한다. |
| `src/health/health.controller.spec.ts` | controller의 고정 응답을 빠른 unit test로 검증한다. |
| `test/health.e2e-spec.ts` | root module과 HTTP adapter를 초기화해 health 계약과 404를 검증한다. |
| `tsconfig.json` | API source와 test의 Node ESM, decorator, strict typecheck 설정을 정의한다. |
| `tsconfig.build.json` | production build에서 test를 제외하고 `src`만 `dist`로 emit하며 incremental metadata도 `dist` 안에 둔다. |
| `vitest.config.ts` | unit 및 e2e test file pattern과 Node test environment를 정의한다. path alias plugin은 alias가 없으므로 추가하지 않는다. |
| `README.md` | API 단독 실행·검증, 기본 port, `PORT`, `/health` 계약과 현재 제외 범위를 설명한다. |

### Health endpoint 계약

```http
GET /health HTTP/1.1
Host: localhost:3001
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

```json
{
  "status": "ok"
}
```

- 요청 body, query와 인증은 없다.
- response에는 timestamp, uptime, version, hostname, DB, 외부 service와 business 상태를 넣지 않는다.
- NestJS의 standard response handling을 사용하며 Express response object를 controller에 직접 주입하지 않는다.
- `GET`의 기본 200 동작을 사용하되 test에서 status를 계약으로 고정한다.

## Script Design

### `apps/api/package.json`

| script | 명령 | 역할 |
| --- | --- | --- |
| `clean` | Node.js `fs.rmSync`로 `dist` 제거 | stale output과 build metadata를 dependency 없이 정리한다. |
| `build` | `pnpm run clean && tsc -p tsconfig.build.json` | TypeScript 7 CLI로 production JavaScript를 `dist`에 생성한다. |
| `predev` | `pnpm run build` | 두 watcher가 시작되기 전에 실행 가능한 output을 한 번 만든다. |
| `dev` | `pnpm run "/^dev:.*/"` | 아래 compile watcher와 process watcher를 pnpm으로 함께 실행한다. |
| `dev:compile` | `tsc -p tsconfig.build.json --watch --preserveWatchOutput` | source 변경을 TypeScript 7로 다시 emit한다. |
| `dev:serve` | `node --watch dist/main.js` | emit된 application dependency가 바뀌면 API process를 다시 실행한다. |
| `start` | `node dist/main.js` | build가 끝난 ESM output을 실행한다. |
| `lint` | `biome check ...` | API source, test와 설정 파일의 format 및 lint를 검사한다. |
| `typecheck` | `tsc --noEmit` | source, test와 설정의 TypeScript 계약을 검사한다. |
| `test` | `vitest run` | unit test와 application HTTP test를 한 번 실행한다. |

### root `package.json`

root script는 package 이름을 하나씩 연결하지 않고 `./apps/*` filter와 각 application의 동일 script 이름을 사용한다.

```json
{
  "scripts": {
    "dev": "pnpm --parallel --filter \"./apps/*\" --if-present dev",
    "build": "pnpm --filter \"./apps/*\" --if-present build",
    "lint": "pnpm --filter \"./apps/*\" --if-present lint",
    "typecheck": "pnpm --filter \"./apps/*\" --if-present typecheck",
    "test": "pnpm --filter \"./apps/*\" --if-present test"
  }
}
```

- `dev`는 종료되지 않는 web과 API server를 pnpm의 `--parallel` mode로 함께 실행한다.
- 나머지 검증은 각 application script를 실행하고 어느 application이 실패했는지 package prefix로 보여 준다.
- web에는 아직 `test` script가 없으므로 root `test`는 `--if-present`로 web을 건너뛰고 API test를 실행한다. 이는 web test가 통과했다는 뜻이 아니며, web test runner는 후속 task의 TBD로 유지한다.
- API 단독 명령은 `pnpm --filter @phytoworks/api <script>`로 실행한다.

## Workspace Dependency and Lockfile Policy

- 모든 runtime 및 dev dependency는 `apps/api/package.json`에 직접 선언한다.
- NestJS framework package는 `12.0.1`로 같은 patch에 맞추며 package version은 이번 bootstrap에서 exact version으로 기록한다.
- TypeScript와 Biome는 web이 사용하는 exact version `7.0.2`, `2.5.10`을 API에도 선언한다. pnpm store가 physical package를 공유하더라도 각 application이 사용하는 tool은 자체 manifest에서 확인할 수 있어야 한다.
- root `pnpm-lock.yaml`만 갱신하며 `apps/api/pnpm-lock.yaml`과 `apps/api/pnpm-workspace.yaml`은 만들지 않는다.
- `pnpm-workspace.yaml`의 package pattern은 이미 충분하므로 변경하지 않는다.
- install 후 `apps/api` importer와 새 transitive dependency를 검토한다. 승인하지 않은 ORM, validation, config, Swagger, database와 production service package가 포함되지 않았는지 확인한다.
- Nest CLI, SWC, `concurrently`, `nodemon`과 `ts-node`는 추가하지 않는다. build 및 watch는 TypeScript, Node.js와 pnpm의 기존 기능만 사용한다.
- dependency build 허용 목록은 설치 결과를 먼저 확인한다. 실제 실행에 필요하다는 근거 없이 `allowBuilds` 범위를 넓히지 않는다.

## Build Output, Coverage and Environment Ignore Policy

- API build output은 `apps/api/dist`이며 기존 root `.gitignore`의 `dist/` 규칙을 사용한다.
- TypeScript incremental metadata는 기존 `*.tsbuildinfo` 규칙으로 제외한다.
- coverage를 생성하는 script와 dependency는 이번 범위에 없지만 향후 결과는 기존 `coverage/` 규칙으로 제외된다.
- `.env`와 `.env.*`는 이미 제외되며 example만 허용된다.
- 이번에는 env file loader를 사용하지 않으므로 `.env.example`도 만들지 않는다. README에는 shell에서 `PORT`를 전달하는 방법만 기록한다.
- 실제 credential과 운영 환경값은 추가하지 않는다.
- 현재 ignore 정책이 필요한 output을 모두 포함하므로 `.gitignore`는 계획된 수정 대상이 아니다.

## Future Product Read API Boundary

Product read API를 추가할 때에는 다음 구조로 확장한다.

```text
AppModule
├─ HealthModule       GET /health, process와 HTTP 응답 경계
└─ ProductModule      Product read controller와 application service
   └─ 후속 DB 경계    ORM 및 repository 결정 뒤 추가
```

- `HealthModule`은 Product나 DB module을 import하지 않는다. Product 조회 실패가 process health를 꾸며 내거나 `/health` contract를 임의로 바꾸지 않게 한다.
- `ProductModule`은 `AppModule`의 sibling import로 추가한다. 처음부터 `common`, `shared`, `base` module을 만들지 않는다.
- Product request가 생기면 `Browser → Next.js → NestJS ProductModule → PostgreSQL` 경로를 별도 task에서 설계한다.
- business route가 `/products`, `/api/products` 또는 versioned path 중 무엇을 사용할지는 이번 health bootstrap에서 확정하지 않는다.
- Product API를 web이 호출할 때 CORS, response schema, shared contract와 cache 경계를 함께 결정한다.
- PostgreSQL과 ORM이 도입되기 전에는 repository interface, database package와 가짜 Product 상태를 만들지 않는다.

## ADR Classification

### 이번 task에서 기록한 ADR

- **NestJS API의 ESM module format:** 모든 후속 API source의 import 방식, build output과 test runner에 지속적으로 영향을 주며 CommonJS 전환 비용이 생긴다. 승인된 계획에 따라 `docs/adr/002-use-esm-for-nest-api.md`를 Accepted로 작성했다.

### 후속 task에서 ADR이 필요한 결정

- business API의 global prefix와 versioning 정책
- web/API shared contract의 source와 생성 방식
- ORM, schema ownership과 migration 전략
- 서버 Cart ownership과 Customer 식별
- API와 PostgreSQL의 배포 topology

### 별도 ADR이 필요하지 않은 이번 task의 결정

- `GET /health`의 `{ "status": "ok" }` 최소 응답
- local default port 3001과 `PORT` 재정의
- CORS, global prefix, versioning과 ValidationPipe를 아직 추가하지 않는 선택
- Biome와 Vitest의 package-local tool 선택
- root pnpm filter script와 파일 배치

이 항목은 쉽게 교체할 수 있거나 현재 bootstrap 범위의 구현 세부사항이므로 이 task에 근거와 결과를 남긴다. `apps/api`를 pnpm workspace에 두는 결정은 이미 Accepted ADR-001이 담당한다.

## Scope

### 포함하는 범위

- pnpm workspace의 `apps/api`
- NestJS 12 ESM application bootstrap
- `AppModule`, `HealthModule`과 `HealthController`
- `GET /health`의 200 및 최소 JSON response
- `PORT`와 기본 3001 처리
- graceful shutdown hook
- API 전용 Biome lint, TypeScript typecheck 및 build와 Vitest unit/application test
- root에서 web과 API를 실행·검증하는 script
- root Biome 최소 configuration 공유
- API README와 실제 구현 상태에 맞는 context, architecture, UX roadmap 및 testing 문서
- ESM module format을 확정한 Accepted ADR-002
- 단일 root lockfile 갱신과 검토

### 포함하지 않는 범위

- Product, Cart, Customer, Order와 Payment API
- Next.js fetch, Server Action 또는 API 연결
- PostgreSQL, ORM, migration, seed와 repository abstraction
- Docker, 배포와 hosting 설정
- 로그인, 인증과 권한
- 가격, 재고, 할인과 판매 정책
- Checkout와 Toss Payments
- Swagger와 OpenAPI
- `@nestjs/terminus`, DB 및 외부 service health indicator
- CORS, global prefix, API versioning과 global validation
- 사용처가 없는 공통 package와 범용 abstraction
- logger, monitoring과 production 보안 정책의 확정
- 실제 credential과 운영 환경값

## Files Planned to Change

### 새로 추가할 runtime 및 설정 파일

- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/tsconfig.build.json`
- `apps/api/vitest.config.ts`
- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/health/health.module.ts`
- `apps/api/src/health/health.controller.ts`
- `apps/api/src/health/health.controller.spec.ts`
- `apps/api/test/health.e2e-spec.ts`
- root `biome.json`

### 새로 추가할 기록 파일

- `apps/api/README.md`
- `docs/adr/002-use-esm-for-nest-api.md`: 이 계획이 그대로 승인되면 ESM 결정을 Accepted로 기록한다.
- `tasks/007-api-bootstrap.md`

### 수정할 파일

- root `package.json`: web과 API 공통 실행 및 검증 script와 root `test`를 추가한다.
- `apps/web/biome.json`: 같은 내용을 root `biome.json`으로 옮긴 뒤 제거한다.
- root `pnpm-lock.yaml`: `apps/api` importer와 승인된 dependency를 반영한다.
- `docs/context/project-overview.md`: API version과 Stage 6 구현 상태를 반영한다.
- `docs/context/architecture-overview.md`: Current NestJS, `/health`와 요청 경계를 반영한다.
- `docs/design/shop-ux-strategy.md`: roadmap의 API bootstrap을 Current로 바꾼다. 사용자 화면 구조는 변경하지 않는다.
- `docs/development/testing-strategy.md`: API의 Vitest unit/application test와 root `test` 동작을 반영한다.
- `docs/adr/README.md`: Accepted ADR 목록에 ADR-001과 이번 ADR-002를 표시한다. 구현 중 기존의 "실제 기술 결정 ADR이 없다"는 설명이 현재 상태와 맞지 않게 되어 함께 수정한다.

### 변경하지 않을 파일과 영역

- `pnpm-workspace.yaml`과 `.gitignore`
- `apps/web` source, Next.js configuration, TypeScript configuration과 runtime dependency
- Product, Cart, Order와 Payment domain 문서 및 규칙
- 정적 Product data와 browser Cart state 및 localStorage schema
- 가격, 재고, Checkout와 Payment 화면
- database, Docker, deployment와 credential

구현 과정에서 위 계획 밖의 변경이 필요하면 범위를 자동으로 넓히지 않고 원인, 대안과 영향을 이 task에 기록한 뒤 다시 확인한다.

## Plan

1. 사용자에게 이 task의 선택안과 ESM ADR 후보를 검토받고 구현 승인을 기다린다.
2. 승인 후 root Biome 설정과 API package 및 compiler/test 설정을 추가한다.
3. TypeScript 7 build 및 pnpm·Node.js watch script를 구성하고 `AppModule`, `HealthModule`, `HealthController`와 bootstrap을 구현한다.
4. controller unit test와 실제 Nest application HTTP test를 추가한다.
5. API README에 실행, port, 환경변수, health 계약과 제외 범위를 기록한다.
6. root script를 `apps/*` filter 기반으로 바꾸고 root `test`를 추가한다.
7. root에서 한 번 install해 단일 lockfile을 갱신하고 dependency 및 build script 허용 결과를 검토한다.
8. API 단독 lint, typecheck, test와 build를 순차적으로 실행한다.
9. root lint, typecheck, test와 build를 실행해 기존 web build를 함께 검증한다.
10. API development 또는 production server를 실행해 실제 `GET /health` 200 및 JSON body와 존재하지 않는 route의 404를 확인한다.
11. 구현된 실제 단계에 맞춰 context, architecture, UX roadmap와 testing 문서를 갱신하고 승인된 ESM 결정을 ADR에 기록한다.
12. `git diff`, `git diff --check`, 최종 status와 lockfile importer를 검토한다.
13. 실제 변경, 시행착오, 검증 결과, 미검증 범위와 남은 위험을 이 task에 기록한다.

## Verification Plan

### 사전 및 dependency 검증

- `git branch --show-current`
- `git status --short --branch`
- `git rev-parse HEAD`
- `node --version`, `pnpm --version`
- `pnpm install --frozen-lockfile`로 갱신된 lockfile 재현 가능 여부 확인
- `pnpm list --recursive --depth 0`으로 web과 API의 direct dependency 확인
- `pnpm-lock.yaml`에 root와 두 application importer만 있는지 확인
- 승인하지 않은 dependency와 별도 lockfile이 없는지 확인

### API 단독 자동 검증

- `pnpm --filter @phytoworks/api lint`
- `pnpm --filter @phytoworks/api typecheck`
- `pnpm --filter @phytoworks/api test`
- `pnpm --filter @phytoworks/api build`

### 저장소 root 자동 검증

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

root `build` 결과에서 기존 Next.js route와 API `dist/main.js`가 모두 생성되는지 확인한다. root `test`는 현재 API test만 실행하고 web test가 없다는 사실을 결과에 명시한다.

### 실제 HTTP 요청 검증

1. 기본 port 3001에서 API development 또는 production server를 실행한다.
2. `GET http://localhost:3001/health`가 200인지 확인한다.
3. response `Content-Type`이 JSON이고 body가 정확히 `{"status":"ok"}`인지 확인한다.
4. `GET http://localhost:3001/not-found`가 404인지 확인한다.
5. 임시 `PORT` 값으로 실행해 재정의가 적용되는지 확인한다.
6. 잘못된 `PORT` 값에서 명확하게 기동이 실패하고 다른 경로나 named pipe에 bind하지 않는지 확인한다.
7. 실행한 process를 종료하고 남은 server process가 없는지 확인한다.

### Diff와 문서 검증

- `git diff --stat`
- `git diff`
- `git diff --check`
- `git status --short --branch`
- API가 Product, Cart, DB와 외부 service 상태를 health response에 포함하지 않는지 확인
- context의 Current/Proposed와 package version이 실제 code 및 lockfile과 일치하는지 확인
- build output, coverage, environment file과 credential이 diff에 없는지 확인

## Changes

- `apps/api`를 workspace application으로 추가하고 NestJS 12.0.1, TypeScript 7.0.2와 ESM `NodeNext` 구성을 적용했다.
- `main.ts`는 기본 port 3001 또는 검증된 `PORT` 환경변수로 Nest application을 기동하며 shutdown hook을 활성화한다. 유효하지 않은 `PORT`는 application 생성 전에 오류로 종료한다.
- `AppModule`은 feature module 조합만 담당하고, `HealthModule`과 `HealthController`가 `GET /health`와 `{ "status": "ok" }` 계약을 소유하도록 분리했다.
- HealthController unit test 한 건과 `AppModule` 및 Nest HTTP adapter를 실제 구성하는 endpoint test 두 건을 Vitest와 Supertest로 추가했다.
- API의 clean, development watch, production start, build, lint, typecheck와 test script를 추가했다. Nest CLI는 추가하지 않고 TypeScript CLI, Node.js watch mode와 pnpm script 실행을 사용했다.
- root script를 `./apps/*` filter 기반으로 바꾸고 `test`를 추가했다. web에 test script가 없으므로 현재 root test는 API test만 실행한다.
- `apps/web/biome.json`의 동일한 설정을 root `biome.json`으로 이동하여 web과 API가 공유하도록 했다. 두 application의 TypeScript 설정은 별도로 유지했다.
- `apps/api/README.md`에 개발·production 실행, port 변경, health 계약, 검증 명령과 향후 ProductModule 경계를 기록했다.
- `docs/adr/002-use-esm-for-nest-api.md`에 ESM 결정을 Accepted로 기록하고 ADR index를 실제 Accepted 결정 목록에 맞게 갱신했다.
- root `pnpm-lock.yaml`에 `apps/api` importer와 승인된 runtime·test dependency를 추가했다. 별도 workspace 파일이나 lockfile은 만들지 않았다.
- project overview, architecture overview, UX roadmap와 testing strategy를 Stage 6의 실제 상태에 맞게 갱신했다. 사용자 화면, Product data와 browser Cart 동작은 변경하지 않았다.

## Problems Encountered

- 첫 PowerShell login shell에서 Conda 종료 script가 존재하지 않는 `SSL_CERT_FILE` 환경변수를 제거하려는 경고를 출력했다. Git 및 파일 조회 명령의 결과와 exit에는 영향을 주지 않았다.
- PowerShell 기본 encoding으로 처음 읽은 한글 문서가 깨졌다. 이후 모든 한글 문서는 `Get-Content -Encoding utf8`로 다시 읽었으며 깨진 출력은 판단 근거로 사용하지 않았다.
- 첫 계획 초안에서는 `@nestjs/cli 12.0.0`을 build와 watch에 사용할 수 있다고 보았다. 추가 공식 source 조사에서 TypeScript 7.0.2가 programmatic compiler API를 제공하지 않아 현재 Nest CLI의 compiler 명령이 모두 실패한다는 사실을 확인했다.
- pnpm 11 및 12로 표시된 공식 `pnpm run` 문서에는 recursive run의 `--dry-run`이 있지만, 로컬 pnpm `11.24.0`은 해당 option을 `Unknown option`으로 거부했다. root script 설계는 실제로 지원되는 `--filter`, `--parallel`과 `--if-present`만 사용한다.
- 조사 중 `pnpm --filter "./apps/*" --if-present lint`가 dependency link가 없는 worktree에서 root lockfile을 기준으로 기존 package를 자동 복원했다. `node_modules`는 ignore 대상이며 manifest와 lockfile은 변경되지 않았다.
- 첫 API lint에서는 새 파일의 LF가 Windows에서 `lineEnding: auto`가 선택한 CRLF와 달랐고 e2e test가 사용하지 않는 `expect`를 import하여 실패했다. typecheck, test 3건과 build는 같은 시점에도 통과했다.
- production server를 한 PowerShell 명령에서 hidden background process로 기동하고 종료하려던 검증 명령은 실행 정책에서 거부되었다. 이 명령에서는 API process가 시작되지 않았다.
- 잘못된 `PORT`를 처음 검증했을 때 port 확인이 `NestFactory.create()`보다 뒤에 있어서 module 초기화 log가 출력된 다음 종료되었다. HTTP port에는 bind하지 않았지만 불필요한 application 초기화가 발생했다.
- root `pnpm dev` 검증 중 Next.js 16 development server가 `apps/web/AGENTS.md`와 `apps/web/CLAUDE.md`를 자동 생성했다. 검증 전에 존재하지 않았고 이번 task 범위에도 없는 untracked 파일이었다.

## Resolution

- Nest CLI compile 계획은 제거했다. TypeScript 7 `tsc` CLI로 build 및 compile watch를 수행하고 Node.js watch mode로 emitted application을 재시작하며, pnpm의 다중 script 실행으로 두 process를 함께 관리하는 안으로 수정했다.
- 위 조사 과정의 환경 경고와 tool option 차이는 repository 설정을 임의로 바꾸지 않고 실제 명령 지원 범위와 분리해 기록했다.
- e2e test의 미사용 import를 제거하고 API source, test와 설정에 기존 Biome formatter를 적용했다. 이후 API 및 root lint가 모두 통과했다.
- 실제 HTTP 검증은 production server를 별도의 장기 실행 terminal session에서 기동하고 다른 command로 요청한 뒤 해당 session에 `Ctrl+C`를 전달하는 방식으로 수행했다.
- `resolvePort()` 호출을 `NestFactory.create()`보다 앞으로 이동하여 유효하지 않은 환경변수에서는 module과 HTTP adapter를 만들기 전에 exit code 1로 종료하도록 수정했다.
- Next.js가 검증 중 생성한 두 agent 문서는 즉시 제거했다. 기존 `next.config.ts`를 바꾸어 자동 생성을 영구적으로 끄는 작업은 이번 API bootstrap 범위에 포함하지 않았다.

## Verification

계획 작성 단계에서는 다음 항목을 확인했다.

- branch `uiuuymin/api-bootstrap`, HEAD `925fc1c`, 초기 clean worktree 확인
- 요청된 문서, 관련 Product 지식, root workspace 설정, web 설정과 lockfile importer 확인
- Node.js `v24.14.0`, pnpm `11.24.0`, TypeScript `7.0.2`의 현재 local baseline 확인
- NestJS, Node.js, TypeScript, pnpm과 Biome의 공식 문서 및 NestJS official schematic 확인
- Nest CLI의 TypeScript 7 programmatic compiler API 비호환을 공식 repository issue와 source에서 확인
- npm registry에서 계획에 포함한 package의 current version, engine과 peer dependency 확인
- `pnpm --filter "./apps/*" --if-present lint` → 성공, 기존 web 35개 파일 검사
- `pnpm --filter "./apps/*" --if-present typecheck` → 성공, 기존 web `tsc --noEmit`
- untracked task 문서에 대한 `git diff --no-index --check` → whitespace 오류 없음. Exit code 1은 빈 파일과 내용이 다르다는 의미다.
- PowerShell trailing whitespace 검사 → 0건
- 최종 `git status --short --branch` → `tasks/007-api-bootstrap.md`만 untracked이며 다른 repository 변경 없음

구현 후에는 다음 항목을 확인했다.

- `pnpm install` → 성공, 3개 workspace project를 인식하고 API dependency 161개를 추가했다.
- `pnpm install --frozen-lockfile` → 성공, `Already up to date`를 확인했다.
- `pnpm list --recursive --depth 0` → 성공, API direct dependency가 계획한 5개 runtime package와 7개 dev package로만 구성된 것을 확인했다.
- lockfile importer → root, `apps/api`, `apps/web` 세 개만 존재하며 repository의 lockfile은 root `pnpm-lock.yaml` 하나뿐이다.
- `pnpm --filter @phytoworks/api lint` → 성공, 10개 파일을 검사했다.
- `pnpm --filter @phytoworks/api typecheck` → 성공했다.
- `pnpm --filter @phytoworks/api test` → 성공, test file 2개와 test 3건이 통과했다.
- `pnpm --filter @phytoworks/api build` → 성공, `dist/main.js`, module과 source map을 생성했다. build metadata와 output은 ignore 대상이다.
- `pnpm lint` → 성공, web 35개 파일과 API 10개 파일을 검사했다.
- `pnpm typecheck` → 성공, web과 API의 `tsc --noEmit`을 모두 실행했다.
- `pnpm test` → 성공, web은 test script가 없어서 건너뛰고 API test 3건을 실행했다.
- `pnpm build` → 성공, API TypeScript build와 Next.js 16.3.3 production build를 모두 실행했다. 기존 `/`, `/cart`, `/products`와 Product Detail 세 건을 포함한 정적 route 생성도 통과했다.
- `pnpm --filter @phytoworks/api dev` → predev build 후 TypeScript compile watcher와 Node.js process watcher가 함께 기동했고 `/health`가 HTTP 200을 반환했다.
- root `pnpm dev` → web development server가 port 3000, API development server가 port 3001에서 함께 기동했다. `GET /`와 `GET /health`가 각각 HTTP 200을 반환했다.
- 기본 port 3001의 production build 실행 → `GET /health`가 HTTP 200, `Content-Type: application/json; charset=utf-8`, body `{"status":"ok"}`를 반환했다.
- 같은 process의 `GET /unknown` → NestJS standard HTTP 404를 반환했다. 404 response body는 health 계약으로 고정하지 않았다.
- `PORT=3101`의 production build 실행 → `GET /health`가 HTTP 200과 동일한 body를 반환하여 override가 적용된 것을 확인했다.
- `PORT=invalid` 실행 → `PORT must be an integer between 1 and 65535.` 오류와 exit code 1로 application 생성 전에 종료했다.
- 검증 process 종료 후 `netstat` 확인 → port 3001과 3101에 남은 listener가 없다.
- Conda의 `SSL_CERT_FILE` 정리 경고는 각 login shell에서 계속 출력되었지만 repository 명령의 결과와 exit code에는 영향을 주지 않았다.

web browser 수동 검증은 UI와 runtime source를 변경하지 않았고 기존 Next.js production build가 통과했으므로 이번 API bootstrap에서 별도로 반복하지 않았다.

## Diff Review

구현 diff에서는 다음 사항을 중점적으로 검토했다.

- CLI generator 대신 필요한 파일만 직접 구성하는 이유
- NestJS 12 ESM, TypeScript 7 CLI와 Node.js watch mode의 compiler 및 test 경계
- `/health`를 business API prefix 밖에 두는 이유와 최소 response 계약
- CORS, prefix, versioning과 validation을 미루면서 shutdown hook은 추가하는 기준
- root script가 기존 web 검증을 계속 포함하는 방식
- API dependency와 root lockfile이 최소 범위인지 여부
- 향후 ProductModule을 추가해도 HealthModule을 교체하지 않는 경계

- runtime dependency에는 NestJS HTTP application에 필요한 package만 있고 ORM, database, validation, config, Swagger, CORS 또는 production service package가 없다.
- health response에는 application HTTP 응답 가능 여부 외의 DB, 외부 service, uptime, version과 사업 상태가 없다.
- `pnpm-workspace.yaml`, `.gitignore`, web source와 TypeScript·Next.js 설정, domain 문서, Product data 및 browser Cart source는 변경하지 않았다.
- root Biome 이동과 script 변경은 기존 web lint, typecheck와 build가 계속 통과하는 것으로 회귀 여부를 확인했다.
- ADR index 수정은 계획 목록에 처음 명시하지 않았지만 ADR-002 추가 후 기존의 "실제 기술 결정 ADR이 없다"는 문장이 거짓이 되므로 문서 정합성을 위해 포함했다.
- `git diff`와 `git diff --stat` → tracked 변경은 계획한 root script·lockfile·Biome 이동과 context·development 문서뿐이며, 새 파일은 `apps/api`, root Biome, ADR-002와 이 task 문서뿐인 것을 확인했다.
- `git diff --check` → exit code 0으로 whitespace 오류가 없다. Git의 LF→CRLF 안내는 기존 Windows checkout과 `lineEnding: auto` 정책에 따른 경고이며 diff 오류가 아니다.
- untracked 파일 trailing whitespace 검사 → 0건이다.
- 최종 status에는 계획한 변경만 있고 build output, coverage, environment 파일, credential과 Next.js가 검증 중 생성했던 agent 문서는 없다.

## Follow-up

- Product read API는 ORM, PostgreSQL, read model, route namespace와 web/API contract를 별도 task와 필요한 ADR에서 결정한다.
- web test runner는 web에 실제 unit 또는 browser test 필요가 생기는 task에서 결정한다.
- CORS는 Next.js가 처음 API를 호출하는 task에서 구체적인 origin과 credential 요구를 기준으로 추가한다.
- `ValidationPipe` 또는 Standard Schema validation은 외부 입력 계약이 생길 때 비교한다.
- Node.js version의 repository-wide 고정과 CI 기준은 별도 개발 환경 task에서 결정한다.

## Lessons Learned

- framework application 실행 요건과 CLI generator 요건은 다를 수 있다. 현재 Node.js는 NestJS 12 runtime에는 충분하지만 generator에는 부족하므로 두 경계를 따로 확인해야 한다.
- NestJS의 현재 기본 lint와 test 구성은 module format에 따라 달라진다. 오래된 Jest·ESLint starter 관례보다 NestJS 12 migration 문서와 current schematic을 기준으로 판단해야 한다.
- TypeScript 7의 `tsc` CLI는 사용할 수 있지만 programmatic compiler API는 아직 제공하지 않는다. 따라서 compiler API에 의존하는 Nest CLI와 direct CLI compile을 같은 호환성으로 간주하면 안 된다.
- Node.js built-in TypeScript 실행은 가볍지만 `tsconfig.json`과 decorator를 처리하지 않으므로 NestJS source 또는 test를 직접 실행하는 수단으로 사용할 수 없다.
- workspace root 명령은 각 application이 같은 script 계약을 제공하게 만들면 새 application을 추가할 때 package 이름을 반복하지 않고 확장할 수 있다.
