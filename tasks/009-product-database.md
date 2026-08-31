# Task: Product PostgreSQL source of truth 설계

**Status:** Prisma 7 stable fallback 검증 완료. ADR-003에서 Prisma 7 stable을 현재 production dependency baseline으로 Accepted 처리했으며, ProductRepository 구현은 별도 승인 대기 중이다.

**조사 기준일:** 2026-08-31

## Goal

현재 정적 Product read API를 PostgreSQL source of truth로 이전하기 위한 범위, 접근 방법, schema·migration 책임, API와 module 경계를 설계한다. 다음 구현 task가 현재 API response contract를 유지하면서 Product data source만 PostgreSQL로 교체할 수 있도록 선택지와 검증 조건을 기록한다.

이번 task의 실행 전략은 **database 구현을 별도 task로 분리하고, Prisma 8 RC spike 후 Prisma 7 stable fallback을 검증하는 것**이었다. Prisma 7 stable 조합이 현재 환경에서 검증되어 database 접근 기술 baseline으로 채택되었지만, Product API의 실제 source 교체는 별도 구현 task로 분리한다.

## Current State

### Git과 worktree

- worktree branch: `uiuuymin/product-database`
- 기준 commit: `e3d6f08` (`Product read API 정적 조회 기능 구현`)
- 부모 workspace: `main`
- `HEAD`는 `e3d6f08d2dee7384dc3ab103f5f95e84b83e2f35`다.
- 현재 `HEAD`, `main`과 `uiuuymin/product-read-api`는 같은 commit을 가리킨다.
- 이번 재검토 시작 시 `git status --short --branch`에는 이전 설계 단계에서 생성된 `?? tasks/009-product-database.md`가 표시되었다. 이 기존 문서 변경은 보존했다.
- 설계 문서 작성 직후에는 `tasks/009-product-database.md`만 새 파일이었다. 이후 사용자가 승인한 Prisma 8 compatibility spike에서 검증에 필요한 최소 파일과 dependency가 추가되었다.
- Prisma 8 spike에서 임시로 사용한 contract·config·migration·seed·Nest module과 RC dependency는 stable alignment 실패 확인 후 제거했다.
- Prisma 7 stable spike에는 `apps/api` 내부 schema·config·generated client·migration·seed·Nest provider를 추가했다. Product API data source와 web fetch는 변경하지 않았다.

### 현재 Product data와 API

- `apps/api/src/product/product.data.ts`에 API 전용 정적 fixture가 있다.
- `apps/web/data/products.ts`에도 별도의 정적 `CatalogProduct[]`가 있다.
- 두 fixture는 같은 세 Product를 표현하지만 서로 import하지 않으므로 변경 drift가 발생할 수 있다.
- 현재 API endpoint는 다음과 같다.

```text
GET /api/products
GET /api/products/:productId
```

- 목록 응답은 `{ items: ProductReadModel[] }`다.
- 상세 응답은 `ProductReadModel` 하나다.
- 존재하지 않는 Product ID는 NestJS `NotFoundException`으로 JSON `404`를 반환한다.
- 알려지지 않은 path도 NestJS 기본 `404`를 반환한다.
- `HealthModule`과 `ProductModule`은 `AppModule`의 sibling module이다.
- 현재 요청 경로는 `HTTP client → ProductController → ProductService → API static fixture → JSON response`다.
- 현재 web 요청 경로는 `Browser → Next.js Server Component → apps/web/data/products.ts → Browser`다. web은 아직 API를 호출하지 않는다.

### 현재 runtime과 개발 도구

- Node.js: 로컬 `v24.14.0`
- NestJS: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` `12.0.1`
- TypeScript: `7.0.2`
- pnpm: `11.24.0`, root `packageManager`에 고정
- module format: ESM, TypeScript `NodeNext`, Accepted ADR-002 적용
- test: Vitest `4.1.11`과 Supertest `7.2.2`
- lint: root Biome `2.5.10`
- PostgreSQL, ORM, migration, seed, Docker와 database package는 아직 없다.

## Problem

현재 API는 Product를 조회할 수 있지만 database가 source of truth가 아니며, web에는 같은 의미의 data가 한 번 더 존재한다. 이 상태에서 바로 ORM을 설치하거나 schema를 만들면 다음 결정이 한 task에 섞인다.

- Product read model과 PostgreSQL의 저장 model을 어디까지 일치시킬지
- ORM, driver와 migration 도구의 Node.js 24·TypeScript 7·ESM 호환성
- schema, migration, seed와 fixture 변환의 소유 위치
- DB 연결 실패 시 API와 `GET /health`의 책임
- API contract를 유지하면서 `ProductService` 뒤의 data source를 교체하는 경계
- 개발용 DB, 테스트용 DB와 migration test의 격리 방법

가격, 재고, Customer, 주문, 결제 상태와 판매 정책은 현재 공식 자료나 domain 문서에서 확정되지 않았다. PostgreSQL을 도입한다는 이유만으로 이 값을 schema, seed 또는 API 응답에 추가하지 않는다. `QUOTE_REQUIRED`와 `DIRECT_PURCHASE`는 현재 Demo domain의 판매 방식 구분이며, 회사의 실제 온라인 판매 정책을 의미하지 않는다.

## Scope

이번 설계 task는 다음을 다룬다.

- 현재 Product read API와 web 정적 data의 ownership 문제
- Prisma, Drizzle, TypeORM, node-postgres·직접 SQL과 database task 분리안 비교
- 다음 구현을 위한 Product table의 초기 field mapping 후보
- PostgreSQL source of truth로 전환하는 단계와 repository adapter 경계
- `ProductModule`, `ProductController`, `ProductService`, repository와 database module 경계
- `DATABASE_URL`, local DB, migration, seed와 credential의 운영 후보
- unit, HTTP endpoint, PostgreSQL integration, migration과 seed 검증 계획
- 다음 구현에서 변경할 파일·dependency·script의 후보
- 장기 영향이 있는 Proposed ADR 후보

## Non-goals

이번 task의 설계 산출물과 사용자가 승인한 compatibility spike에서는 다음 production 전환을 구현하지 않는다. Prisma 7 stable spike에 필요한 최소 dependency, schema, migration, seed와 Nest provider, 그리고 검증용 임시 PostgreSQL 실행은 예외적으로 수행했다.

- 지속적으로 관리하는 PostgreSQL 설치·실행과 infrastructure 설정
- Product API를 PostgreSQL source로 교체하는 구현
- web fetch 연결 또는 `apps/web/data/products.ts` 제거
- Cart, Customer, Order, Payment와 Checkout
- 가격, 재고, 할인, 세금, 배송과 판매 정책
- Docker와 배포 설정
- credential, 운영 환경값과 실제 database URL
- Swagger/OpenAPI
- 사용처가 없는 `packages/contracts`, `packages/database` 또는 공통 package
- NestJS CLI, `@nestjs/config`, validation dependency와 CORS
- 커밋

## Options Considered

### Option A: 정적 fixture를 유지한다

API 내부 fixture를 계속 읽고 PostgreSQL 도입을 뒤로 미룬다.

- 장점: dependency, DB 실행 환경과 migration이 필요 없고 현재 API test를 그대로 유지할 수 있다.
- 장점: read contract를 먼저 검토하는 학습 단계로는 가장 단순하다.
- 단점: API fixture와 web fixture의 drift가 계속되고 PostgreSQL persistence 학습을 할 수 없다.
- 단점: 이후 Cart·Order가 Product를 서버에서 재조회할 신뢰 가능한 기반이 없다.
- 판단: 현재 구현의 사실로 유지할 수 있지만, 이번 작업의 목표인 Product source of truth 이전을 해결하지 못한다.

### Option B: 이번 task에서 PostgreSQL과 ORM을 바로 구현한다

schema, migration, seed, DB module, repository와 API 교체를 한 번에 구현한다.

- 장점: 처음부터 API가 지속적인 database source를 읽는다.
- 장점: 실제 schema, query, migration과 DB integration을 한 vertical slice에서 학습할 수 있다.
- 단점: ORM, schema ownership, local DB와 test DB를 승인 전에 확정해야 한다.
- 단점: 현재 web은 여전히 별도 정적 data를 읽으므로 전체 Product 화면의 source가 하나가 되지 않는다.
- 단점: DB가 실행되지 않는 환경에서 기존 endpoint test와 `GET /health`를 어떻게 유지할지 추가 설계가 필요하다.
- 판단: 장기적으로 필요하지만 현재 `Proposed/TBD`인 결정을 너무 많이 포함하므로 이번 task의 실행안으로 선택하지 않는다.

### Option C: API contract와 database 구현을 분리한다

이번 task에서는 contract, ownership과 persistence 경계를 문서로 정하고, 다음 database 구현 task에서 선택한 접근 방법을 clean install·build·test·실제 PostgreSQL로 검증한다.

- 장점: 현재 API contract와 PostgreSQL schema 결정을 구분할 수 있다.
- 장점: 사용자 승인 전에 dependency, lockfile, DB와 Docker를 변경하지 않는다.
- 장점: repository interface 뒤에서 정적 adapter와 PostgreSQL adapter를 교체할 수 있다.
- 단점: 다음 구현 전까지 두 개의 정적 Product source가 남는다.
- 단점: 실제 DB 연결과 migration 검증은 다음 task까지 완료되지 않는다.
- 판단: **이번 task의 선택안**이다. 다음 구현에서는 PostgreSQL을 API Product read의 source of truth로 삼고 web 전환은 별도 task에서 수행한다.

### PostgreSQL 접근 후보 비교

NestJS 공식 문서는 Nest가 database agnostic이며 PostgreSQL driver, 일반 database library 또는 ORM을 사용할 수 있다고 설명한다. TypeORM과 Sequelize에는 Nest 통합이 있지만, NestJS 12를 사용한다는 사실만으로 TypeORM을 선택할 근거는 없다.

| 후보 | NestJS 12 사용 방식 | Node.js 24·engine | TypeScript 7·peer dependency | migration·schema | query·repository 책임 | build·test 복잡도 | 장기 확장성 판단 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Prisma | 공식 Nest recipe처럼 `PrismaService`가 generated Prisma Client를 감싸고, ProductService가 직접 Client를 사용하지 않도록 repository 또는 persistence service 뒤에 둔다. | Prisma latest 공식 system requirements는 Node `^20.19.0`, `^22.12.0`, `^24.0.0`을 요구한다. 조사 당시 registry의 `@prisma/client 7.10.0`도 같은 Node 범위와 `prisma: *` peer를 보였다. | 공식 requirements는 TypeScript `5.4+`; registry의 `@prisma/client 7.10.0`은 `typescript >=5.4.0` peer를 보였다. TS 7 전체 조합의 실제 build·runtime 성공은 별도 검증이 필요하다. | Prisma schema가 model을 정의하고 Prisma Migrate가 SQL migration history를 만든다. Prisma 7은 custom generated output, ESM과 driver adapter를 함께 검토해야 한다. | generated Client query를 repository adapter에서 사용하고 row를 `ProductReadModel`로 명시적으로 매핑한다. | generate 산출물, Prisma config, driver adapter, ESM module format과 CLI·runtime dependency 구분을 검증해야 하므로 현재 API보다 복잡하다. | Product·Cart·Customer·Order·Payment 관계와 transaction을 표현하기 쉽다. 다만 generated output과 Prisma major 변화가 학습 대상과 build 경계를 늘린다. |
| Drizzle | Nest 전용 통합 없이 `DatabaseModule`에서 `pg Pool`과 Drizzle client를 provider로 만들고 Product repository에 주입한다. 이 Nest wiring은 공식 Drizzle recipe가 아니라 **Proposed**다. | 조사 당시 registry의 `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10`에는 명시적 Node engine이 없었다. 공식 Drizzle 문서에서 Node 24 명시 보증도 확인하지 못해 `TBD`다. | `drizzle-orm` metadata에는 TypeScript peer가 없었다. TypeScript 기반 schema와 query라는 사실은 확인했지만 TS 7 호환성 보증은 `TBD`다. | TypeScript schema를 codebase-first source로 두고 `drizzle-kit generate`와 `drizzle-kit migrate`로 review 가능한 SQL migration을 관리한다. database-first도 지원한다. | SQL에 가까운 typed query와 `sql` escape hatch를 repository 안에서 사용하고, API read model은 adapter가 만든다. | generated client가 없어 Prisma보다 산출물은 적다. 다만 `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`, ESM과 migration CLI의 실제 조합을 검증해야 한다. | Product부터 Cart·Order transaction까지 SQL과 PostgreSQL 동작을 직접 학습하기 좋다. schema와 query를 한 package에 둘지 feature별로 나눌지는 확장 시 결정한다. |
| TypeORM | Nest 공식 `@nestjs/typeorm` 통합과 `TypeOrmModule`을 사용하고 entity repository를 주입한다. ProductModule이 `TypeOrmModule.forFeature()`를 소유하는 방식이 가능하다. | TypeORM official repository와 조사 당시 registry의 `typeorm 1.1.0` engine은 `^20.19.0 || ^22.13.0 || >=24.11.0`이다. 현재 Node `24.14.0`은 이 범위에 들어간다. `@nestjs/typeorm 12.0.1` engine은 `>=20.19.0`이다. | 공식 TypeORM 문서는 TypeScript `4.5+`, decorators와 metadata 설정을 설명하지만 TS 7 통합 보증은 확인하지 못했다. `@nestjs/typeorm 12.0.1`은 Nest `^10 || ^11 || ^12`, TypeORM `^0.3.0 || ^1.0.0-dev`, RxJS `^7.2.0` 등을 peer로 선언한다. TypeORM의 `pg ^8.5.1` peer는 optional이다. | Entity와 DataSource를 관리하고 migration은 별도 migration file로 실행한다. production에서 `synchronize: true`를 사용하지 않는다는 공식 주의를 따라야 한다. | entity repository 또는 query builder를 Product repository 안에서 사용하고 persistence row를 read model로 변환한다. | Nest 통합은 익숙하지만 decorators, `emitDecoratorMetadata`, ESM, TypeORM 1.x와 Nest adapter의 실제 build·runtime을 모두 확인해야 한다. | Nest DI와 관계 mapping은 장점이다. 다만 entity abstraction과 decorator metadata가 현재 TypeScript 7·ESM 학습 경계에 추가 복잡도를 만든다. |
| node-postgres와 직접 SQL | `DatabaseModule`이 `pg.Pool`을 제공하고 Product repository가 parameterized SQL과 row mapping을 소유한다. Nest integration dependency는 없다. | official `pg 8.23.0` package metadata의 engine은 Node `>=16.0.0`; 공식 repository는 current·LTS Node를 지원한다고 설명하므로 Node 24에 여유가 있다. | `pg`는 TypeScript peer를 선언하지 않고 `pg-native >=3.0.1`만 optional peer로 선언한다. `@types/pg`는 dev dependency 후보다. TS 7 호환성은 type definition과 실제 build로 검증해야 한다. | pg 자체는 migration 도구가 아니다. SQL migration 실행 주체와 directory convention을 별도로 정해야 하므로 `TBD`다. | SQL, parameter binding, transaction, row-to-read-model mapping, error mapping을 repository가 직접 책임진다. | runtime dependency는 작지만 migration runner, SQL typing, fake pool과 transaction test를 직접 설계해야 한다. | PostgreSQL과 SQL 학습에는 가장 직접적이다. 그러나 Cart·Order·Payment로 확장할수록 반복적인 mapping·transaction 코드와 자체 규칙이 늘어난다. |

### Prisma 8 RC와 Prisma 7 stable spike 결과

- Prisma 8은 Prisma 7의 generated client 대신 `contract.json`과 `contract.d.ts`를 emit한다.
- PostgreSQL 모델은 `db.orm.public.Product`로 접근하며, `where(...).first()`, `all()`, `create()`와 같은 model-first API를 사용한다.
- 공식 changelog는 Prisma 8을 `prisma@latest`로 안내하지만, 현재 registry의 `prisma@latest`는 `8.0.0-rc.12`다. `@prisma/orm-postgres@latest`도 `8.0.0-rc.8`이며 `prisma@8.0.0`, `@prisma/orm-postgres@8.0.0`은 registry에서 조회되지 않았다.
- Prisma 8은 TypeScript `>=5.9` peer를 선언하는 facade를 포함한다. 현재 workspace의 TypeScript `7.0.2` typecheck와 NestJS build는 통과했지만, TypeScript 7을 공식적으로 검증했다는 자료는 확인하지 못했다.
- 따라서 RC dependency를 production manifest와 lockfile에 유지하지 않는다. stable package가 registry와 공식 문서에서 일치하게 제공될 때 동일한 검증을 다시 수행한다.
- RC에서 stable로 넘어갈 때 공식 changelog가 안내한 변경은 `prisma-next`에서 `prisma`와 `prisma.config.ts`로의 전환, `.take()`·`.skip()`에서 `.limit()`·`.offset()`으로의 변경, `db.sql.raw`에서 `db.raw.sql`로의 변경, `db verify`·`db sign`·`migration check` exit code 변경이다. 현재 Product spike는 `.limit()`·`.offset()`과 `db.raw.sql`을 사용하지 않았으므로 해당 변경의 직접 영향은 확인되지 않았다.

Prisma 7 stable fallback은 다음 조합으로 수행했다.

- `prisma@7.10.0`
- `@prisma/client@7.10.0`
- `@prisma/adapter-pg@7.10.0`
- `dotenv@17.4.2`

모두 prerelease suffix가 없는 stable version이다. `prisma`는 CLI와 migration, `@prisma/client`는 generated client runtime과 type, `@prisma/adapter-pg`는 PostgreSQL driver adapter, `dotenv`는 `prisma.config.ts`의 명시적 환경변수 로딩에 사용한다. Prisma 7은 `prisma-client` generator와 custom output path, `prisma.config.ts`, `@prisma/adapter-pg`를 사용한다. TypeScript 7은 공식 문서가 명시적으로 검증한 버전은 아니지만, 현재 프로젝트의 typecheck와 build가 통과했다.

### Option D: ORM과 database task를 더 분리한다

`Product API contract` → `database 접근 후보를 검증하는 spike` → `schema·migration·seed 구현` → `Product repository 연결` → `web fetch 전환`으로 여러 task를 나눈다.

- 장점: ORM 호환성, migration 방식과 schema ownership을 각각 작은 diff로 검토할 수 있다.
- 장점: 실패한 ORM 실험을 Product API나 web에 섞지 않고 되돌릴 수 있다.
- 단점: task와 승인 checkpoint가 늘어나며 PostgreSQL source 전환 완료까지 시간이 더 걸린다.
- 판단: **Option C 안에서 사용할 실행 순서로 채택한다.** Prisma 7 stable fallback 검증이 완료되었으므로 현재 database 접근 baseline은 ADR-003에서 Accepted로 기록했다. 다만 Product API의 실제 repository 연결은 별도 승인 task로 남긴다.

## 공식 version과 호환성 근거

### repository baseline

| 항목 | 현재 값 | 상태 |
| --- | --- | --- |
| Node.js | `24.14.0` | Current local baseline |
| NestJS | `12.0.1` | Current local baseline |
| TypeScript | `7.0.2` | Current local baseline |
| pnpm | `11.24.0` | Current root baseline |
| PostgreSQL | version 미설치 | Proposed, version `TBD` |

### 조사한 공식 자료

- [NestJS 12 migration guide](https://docs.nestjs.com/migration-guide): Nest 12 application은 Node `v20.19+` 또는 22.x의 `v22.12+`가 필요하고, `@nestjs/schematics` generator는 `v22.22.3+`, `v24.15+` 또는 `v26+`가 필요하다. 현재 Node `24.14.0`은 application 실행에는 맞지만 CLI generator 기준에는 미달한다. v12 core package의 ESM 배포와 CommonJS·ESM 선택도 설명한다.
- [NestJS database technique](https://docs.nestjs.com/techniques/database): Nest는 database agnostic이며 driver, 일반 database library 또는 ORM을 사용할 수 있다. migration은 Nest application source와 분리할 수 있다.
- [NestJS Prisma recipe](https://docs.nestjs.com/recipes/prisma): Prisma schema, generated client, `PrismaService`, PostgreSQL datasource와 migration 흐름을 Nest service와 연결하는 방식을 설명한다.
- [Node.js TypeScript documentation](https://nodejs.org/api/typescript.html)과 [Node.js packages documentation](https://nodejs.org/api/packages.html): Node의 native TypeScript 처리와 ESM package 규칙을 설명한다. Node native type stripping만으로 decorator·tsconfig 기반 Nest build를 대체한다고 가정하지 않는다.
- [TypeScript official repository](https://github.com/microsoft/TypeScript): TypeScript compiler의 공식 repository다. 현재 workspace baseline `7.0.2`는 lockfile과 package manifest에서 확인했으며, 각 database package의 TS 7 통합은 별도 검증한다.
- [pnpm Workspaces](https://pnpm.io/workspaces), [Filtering](https://pnpm.io/filtering), [pnpm run](https://pnpm.io/cli/run): 하나의 root workspace와 filter 기반 script를 유지하는 근거다.
- [Prisma system requirements](https://docs.prisma.io/docs/orm/reference/system-requirements): 최신 Prisma ORM의 Node `^20.19.0`, `^22.12.0`, `^24.0.0`과 TypeScript `5.4+` requirement를 설명한다.
- [Prisma 7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7), [Prisma 7 overview](https://docs.prisma.io/docs/orm/v7): Prisma 7 ESM, `prisma-client` generator, custom generated output, driver adapter와 SQL migration의 현재 흐름을 설명한다.
- [Prisma 7 PostgreSQL connector](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/postgresql), [Prisma 7 database drivers](https://docs.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers): PostgreSQL 지원과 `@prisma/adapter-pg` 연결 방식을 설명한다.
- [Prisma config reference](https://docs.prisma.io/docs/orm/reference/prisma-config-reference): `prisma.config.ts`, `migrations.path`, `datasource.url`과 `dotenv` 사용 방식을 설명한다.
- [Prisma official repository](https://github.com/prisma/prisma): Prisma ORM과 CLI의 공식 repository다. 공식 changelog는 Prisma 8을 `prisma@latest`로 안내하지만, 현재 registry 조회에서는 CLI `8.0.0-rc.12`, PostgreSQL facade `@prisma/orm-postgres 8.0.0-rc.8`이 확인된다. Prisma 7 fallback은 stable `7.10.0` package 조합으로 수행했다.
- [Drizzle PostgreSQL guide](https://orm.drizzle.team/docs/get-started-postgresql), [Drizzle schema](https://orm.drizzle.team/docs/sql-schema-declaration), [Drizzle migrations](https://orm.drizzle.team/docs/migrations): `drizzle-orm/node-postgres`, TypeScript schema, codebase-first/database-first migration과 `drizzle-kit` 명령을 설명한다.
- [Drizzle official repository](https://github.com/drizzle-team/drizzle-orm): repository의 package metadata에는 조사 시점 이후의 main version이 보일 수 있다. 조사 당시 registry observed version은 `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10`이며 Node engine과 TypeScript peer는 명시되지 않았다.
- [TypeORM Getting Started](https://typeorm.io/docs/getting-started/), [Postgres driver](https://typeorm.io/docs/drivers/postgres/), [migration setup](https://typeorm.io/docs/migrations/setup/): DataSource, PostgreSQL `pg` driver, entity와 migration setup을 설명한다.
- [TypeORM official repository](https://github.com/typeorm/typeorm): 조사 당시 registry observed `typeorm 1.1.0`과 repository package metadata의 Node engine `^20.19.0 || ^22.13.0 || >=24.11.0`, PostgreSQL peer `pg ^8.5.1` 근거다.
- [node-postgres official repository](https://github.com/brianc/node-postgres), [connection guide](https://github.com/brianc/node-postgres/blob/master/docs/pages/features/connecting.mdx): `Pool`, parameterized query, connection URI와 environment variable 사용을 설명한다. 조사 당시 `pg 8.23.0` package metadata engine은 `>=16.0.0`, `pg-native >=3.0.1`은 optional peer였다.

공식 문서와 package metadata는 개별 도구의 지원 범위를 보여 주지만 `NestJS 12 + ESM + Node.js 24.14.0 + TypeScript 7.0.2 + Windows` 전체 조합의 성공을 보장하지 않는다. Prisma 7 stable `7.10.0` 조합은 clean install, client generate, typecheck, build, migration, 재실행, schema verify, seed, PostgreSQL runtime과 Product CRUD 검증을 통과했다. TypeScript 7은 공식 문서의 권장 버전 범위를 넘어서는 현재 workspace 버전이므로 실제 typecheck와 build 결과를 함께 기록한다.

## Selected approach and rationale

### 이번 task에서 선택한 안

1. **실행 순서:** Option C와 D를 결합해 database 구현을 별도 task와 별도 승인 checkpoint로 분리한다.
2. **검증 순서:** Prisma 8 RC compatibility spike를 먼저 수행했고, stable package publication이 확인되지 않아 Prisma 7 stable fallback을 동일한 범위로 검증했다.
3. **현재 ORM 결정:** Prisma 7 stable `7.10.0`을 현재 PostgreSQL 접근 계층의 production dependency baseline으로 사용한다. Prisma 8 stable 출시는 별도 upgrade task에서 재검토한다.
4. **repository 경계:** ProductService가 database client를 직접 알지 않도록 `ProductRepository` port와 PostgreSQL adapter를 둔다.
5. **database module:** DB client/pool provider는 `apps/api` 내부 `DatabaseModule`에 두고 ProductModule이 명시적으로 import한다. `HealthModule`은 DatabaseModule에 의존하지 않는다.
6. **schema ownership:** 현재 consumer가 API 하나뿐이므로 `packages/database`를 만들지 않고 `apps/api`가 소유한다. 실제 여러 app 또는 worker가 같은 schema를 사용하게 되면 별도 ADR에서 package 이동을 검토한다.
7. **API contract:** `/api/products`, `/api/products/:productId`, 목록 envelope, 상세 object와 HTTP 오류 계약은 유지한다.

### 선택 이유

- 현재 사용자의 우선순위는 SQL 학습보다 실무 적합성, 유지보수성, 타입 안정성, object/API 형태의 query 가독성이므로 Prisma의 model-first API가 더 적합하다.
- Prisma 7은 `prisma.product.findMany()`, `findUnique()`, `create()`와 같은 object/API query, generated type-safe client, PostgreSQL migration 흐름을 제공하므로 현재 학습 경계와 맞는다.
- TypeORM은 Nest 통합이 좋지만 decorator metadata와 TypeORM 1.x·Nest adapter·TypeScript 7 조합을 추가로 검증해야 한다.
- Prisma 7은 `prisma-client` generator로 custom output 경로에 generated client를 만들고, `@prisma/adapter-pg`를 통해 PostgreSQL driver를 연결한다.
- Drizzle은 SQL-like query와 codebase-first migration이 장점이지만, 현재 목표에는 Prisma보다 SQL 개념 노출이 많다.
- 직접 SQL은 가장 작은 runtime abstraction이지만 migration 도구와 query/mapping 반복을 별도로 결정해야 하므로 장기 Product·Cart·Order·Payment 학습에는 자체 규칙이 더 많이 필요하다.

이 선택은 Prisma 7 stable을 현재 baseline으로 채택한다는 의미이며, Prisma 8의 장기 가능성을 배제한다는 의미가 아니다. Prisma 8 stable package가 확인되면 별도 upgrade task에서 query API, generated output, migration CLI와 배포 환경을 다시 검증한다.

## Product data ownership과 이전 계획

### source of truth로 삼는 시점

PostgreSQL을 Product API의 source of truth로 삼는 시점은 단순히 table이 만들어진 때가 아니다. 다음 조건을 모두 통과한 뒤로 한다.

- 초기 schema migration을 빈 PostgreSQL database에 재현할 수 있다.
- seed가 현재 세 Product의 API read model을 결정적으로 채운다.
- PostgreSQL repository가 목록·상세 조회와 없는 ID를 처리한다.
- API unit, HTTP contract와 PostgreSQL integration test가 통과한다.
- DB 연결 실패 시 fixture fallback이 발생하지 않고 명확한 failure가 확인된다.
- `GET /health`는 Product DB 상태를 섞지 않고 기존 `{ "status": "ok" }` 계약을 유지한다.
- migration, seed, dependency와 environment 사용 방법이 문서화된다.

이 조건을 통과한 뒤 API Product read의 authoritative source를 PostgreSQL로 바꾼다. 이 시점에도 web은 별도 정적 data를 읽을 수 있으므로 **API ownership 전환**과 **전체 web/API data ownership 통합**을 구분한다. web의 최종 전환은 별도 web integration task에서 수행한다.

### 이전 단계

```text
Current: web static data + API static fixture
  → contract와 field mapping 고정
  → PostgreSQL schema migration 작성
  → fixture를 명시적인 seed input으로 변환
  → migration + seed + repository integration 검증
  → API Product source를 PostgreSQL로 전환
  → 별도 web task에서 API fetch 연결
  → web static data 제거 후 단일 runtime source 확인
```

fixture를 database seed로 바꾸는 과정에서 `apps/web/data/products.ts`를 runtime import하지 않는다. 현재 API fixture의 값과 read model mapping을 기준으로 명시적인 변환을 만들고, 변환 전후의 JSON snapshot을 비교한다. web fixture는 API 전환 task가 끝날 때까지 보존할 수 있지만, 둘 중 하나를 다른 하나의 runtime source라고 선언하지 않는다.

### 현재 read model mapping

현재 API read model은 다음과 같다.

```ts
type ProductReadModel = {
  id: string;
  name: string;
  category: string;
  description: string;
  summary: string;
  features: readonly string[];
  mediaLabel: string;
  purchaseMode: "QUOTE_REQUIRED" | "DIRECT_PURCHASE";
};
```

| API read field | 현재 source | PostgreSQL column 후보 | 정책 |
| --- | --- | --- | --- |
| `id` | `product.id` | `id text primary key` | 현재 slug 문자열 세 개를 그대로 seed한다. ID 형식과 공개 URL 정책은 `TBD`다. |
| `name` | `product.name` | `name text not null` | 고객에게 보이는 이름을 보존한다. |
| `category` | `product.category` | `category text not null` | 현재 분류 문자열을 보존한다. category vocabulary의 정규화는 별도 task다. |
| `description` | `product.description` | `description text not null` | 목록·상세 lead에 쓰이는 설명을 보존한다. |
| `summary` | `product.summary` | `summary text not null` | 현재 API top-level field를 그대로 저장한다. |
| `features` | `product.features` | `features text[] not null` 후보 | 순서가 있는 문자열 배열의 의미를 보존한다. 배열 대신 별도 ProductFeature table을 쓰는 시점은 `TBD`다. |
| `mediaLabel` | `product.mediaLabel` | `media_label text not null` | 실제 image URL이나 권리를 추가하지 않고 현재 placeholder label만 저장한다. |
| `purchaseMode` | `product.purchaseMode` | `purchase_mode`와 값 제약 | `QUOTE_REQUIRED`와 `DIRECT_PURCHASE`를 그대로 보존한다. PostgreSQL enum과 text + check 중 최종 표현은 `TBD`다. |

다음 field는 초기 Product schema와 API 응답에서 제외한다.

- `price`, `currency`, `stockQuantity`: 공식 자료로 확인되지 않았고 현재 API read model에도 없다.
- `isActive`: domain에서 Proposed이지만 현재 API 동작과 별도 활성화 정책이 확정되지 않았다. 목록 filtering을 만들지 않는다.
- Customer, Order, Payment 상태: Product persistence task의 책임이 아니다.
- discount, tax, shipping, SKU, option, lead time, installation, maintenance: 공식 판매 정책이나 현재 scope로 확인되지 않았다.
- image URL, asset license, source metadata: media task에서 별도로 결정한다.

`DIRECT_PURCHASE`는 현재 학습용 Demo에서 Cart CTA를 허용하는 mode이며 실제 판매 가능·재고 있음·가격 있음이라는 뜻이 아니다. `QUOTE_REQUIRED`는 공식 문의 흐름을 의미하며 가격과 주문 가능성을 추정하지 않는다. DB seed와 repository는 이 두 문자열을 바꾸거나 다른 mode로 추론하지 않는다.

현재 static service test는 fixture source order를 관찰한다. PostgreSQL의 row order는 보장되지 않으므로 integration 구현 전에 목록 정렬을 정해야 한다. 기존 순서를 public behavior로 유지할 필요가 있으면 내부 `display_order` column을 추가하는 안을 검토하고, 그렇지 않으면 API contract에서 순서를 보장하지 않는다고 명시한다. 이 선택은 `TBD`이며 가격·재고와 관계없는 별도 기술 결정이다.

## schema와 migration 책임

### 권장 파일 ownership

현재 consumer가 `apps/api` 하나이므로 다음 구조를 우선 검토한다. 아래 구조는 현재 채택한 Prisma 7 stable baseline과 다음 ProductRepository 구현에 사용할 후보 경계다. Prisma 8 spike에서 임시로 만들었던 파일은 stable alignment 확인 후 제거했다.

```text
apps/api/
├─ prisma.config.ts                # Prisma 7 config
├─ prisma/
│  ├─ schema.prisma                # Prisma 7 schema
│  └─ migrations/                  # Prisma 7 migration
├─ src/
│  ├─ database/                    # database module 후보
│  │  ├─ database.module.ts
│  │  ├─ database.client.ts
│  │  └─ schema.ts                 # Drizzle 선택 시에만 사용
│  ├─ prisma7/                     # 이번 compatibility spike 전용
│  │  ├─ db.ts
│  │  ├─ prisma7.module.ts
│  │  ├─ prisma7.service.ts
│  │  ├─ seed.ts
│  │  └─ spike.ts, verify.ts
│  └─ product/
│     ├─ product.repository.ts     # repository port 후보
│     ├─ prisma-product.repository.ts # Prisma adapter 후보
│     └─ ...
```

- Prisma 7의 `prisma/schema.prisma`가 Product schema의 source이며 generated client는 `src/generated/prisma` 아래에 만든다. generated file은 직접 수정하지 않는다.
- `prisma.config.ts`는 schema와 migration 경로를 선언하고 `DATABASE_URL`을 읽는다. 현재 spike에서는 기존 빈 Prisma 8 디렉터리와 충돌하지 않도록 `prisma/migrations-prisma7`을 사용했으며, 실제 구현 task에서 표준 `prisma/migrations` 경로를 정리한 뒤 확정한다.
- 이번 spike의 `src/prisma7/*`는 실제 연결 전에 Prisma client, Nest provider, seed와 CRUD 검증만 담당한다. 다음 구현에서 이름을 `DatabaseModule`과 Product persistence adapter 경계에 맞춰 정리한다.
- `ProductRepository` port는 ProductService가 의존하고, Prisma adapter는 generated client를 사용해 `ProductReadModel`로 명시적으로 매핑한다. static adapter는 테스트 double로 유지할 수 있다.
- migration 파일은 generated output이라도 repository에 commit하고 사람이 SQL diff를 검토한다.
- migration은 application startup에서 자동 실행하지 않는다. 개발·CI·production 성격에 맞는 명령을 별도로 실행한다.
- seed는 migration과 분리하고, 현재 API fixture를 Product row로 변환하는 책임을 가진다.
- seed는 실제 회사 가격·재고·판매 정책을 만들지 않는다.
- `packages/database`는 둘 이상의 workspace consumer가 같은 DB schema를 실제로 공유할 때까지 만들지 않는다. 이 위치 선택은 Proposed ADR 후보다.

### migration과 seed 후보

- Drizzle 선택 시 `drizzle-kit generate`로 SQL을 만들고 `drizzle-kit migrate`로 적용하는 흐름을 우선 검토한다.
- Prisma 7 선택 시 `prisma generate`, `prisma migrate dev`, `prisma migrate deploy`, `prisma migrate status`의 역할을 구분한다. seed는 compiled Node script로 별도 실행한다.
- 직접 SQL 선택 시 migration runner, 적용 이력 table과 명령을 별도 선택해야 한다.
- TypeORM 선택 시 DataSource의 migration glob과 TypeORM migration command를 사용하되 `synchronize: true`는 production에서 사용하지 않는다.
- 정확한 command 이름, compiled seed 실행 방식과 rollback 정책은 선택된 도구를 실제로 검증하는 구현 task에서 확정한다. 현재는 `Proposed/TBD`다.

## API contract 유지 계획

### 유지하는 계약

| 요청 | 성공 응답 | 오류 |
| --- | --- | --- |
| `GET /api/products` | `{ items: ProductReadModel[] }` | DB 오류는 fixture로 fallback하지 않고 명확한 server failure로 처리한다. 정확한 error body는 `TBD`다. |
| `GET /api/products/:productId` | `ProductReadModel` | 존재하지 않는 ID는 기존처럼 JSON `404`다. |
| `GET /api/products/unknown-product` | 없음 | `404 NotFoundException` 계약 유지 |
| 잘못된 path | 없음 | `404` 유지 |
| `GET /health` | `{ "status": "ok" }` | Product DB 상태를 health response에 추가하지 않는다. |

목록 응답의 envelope와 상세 응답의 top-level field를 바꾸지 않는다. repository는 database row를 API read model로 변환하며, Controller는 SQL이나 ORM 타입을 알지 않는다. ProductService는 repository port를 호출하고 없는 Product를 `NotFoundException`으로 변환한다.

### module 경계

```text
AppModule
├─ HealthModule
│  └─ HealthController → GET /health
└─ ProductModule
   ├─ ProductController → /api/products
   ├─ ProductService
   └─ ProductRepository port
      └─ PostgreSQL adapter → DatabaseModule client/pool
```

- `HealthModule`과 `ProductModule`은 계속 독립적인 sibling module이다.
- `HealthModule`은 DB connection을 검사하거나 Product 상태를 반환하지 않는다. 따라서 Product DB가 없더라도 health 의미가 바뀌지 않는다.
- `DatabaseModule`은 `ProductModule`이 명시적으로 import하는 non-global module을 우선 검토한다. 이 방식은 DB dependency를 사용하는 feature를 module graph에서 확인하기 쉽다.
- ProductService의 constructor에는 Drizzle client, `Pool`, Prisma Client 또는 TypeORM repository를 직접 노출하지 않는다.
- 현재 static fixture에는 repository abstraction이 없으므로, DB 구현 task에서 처음으로 port와 static test double 또는 PostgreSQL adapter를 도입한다.

## Environment와 migration 실행

### 환경변수

- PostgreSQL runtime에는 `DATABASE_URL`과 같은 connection string이 필요하다. 실제 값은 process environment 또는 secret manager가 제공한다.
- repository에는 실제 credential, password, token 또는 운영 URL을 기록하지 않는다.
- 예시가 필요할 때는 `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public` 같은 placeholder만 사용한다.
- 실제 credential 파일은 만들지 않는다. Prisma 7 spike에서는 placeholder `.env.example`과 CLI config를 사용했다.
- `DATABASE_URL`이 없는 상태에서 Product request가 정적 fixture로 조용히 전환되어서는 안 된다.
- 환경변수 validation dependency를 지금 추가할 근거는 없다. 첫 DB 구현에서는 최소한 명시적인 missing-variable failure를 확인하고, 여러 environment schema나 외부 입력 validation이 필요할 때 `@nestjs/config` 또는 Standard Schema를 별도 비교한다. 이는 `TBD`다.

### 로컬 DB와 Docker

다음 후보를 별도 infrastructure task에서 비교한다.

- 로컬 PostgreSQL 설치 또는 기존 PostgreSQL service 사용
- Docker Compose로 개발용 PostgreSQL만 제공
- 외부 managed PostgreSQL을 개발용으로 사용

이 task에서는 PostgreSQL 설치·실행, Dockerfile, Compose, port, volume과 배포 설정을 만들지 않는다. 학습 재현성과 개발·테스트 DB 분리 측면에서는 Docker Compose가 `Proposed` 후보지만, 사용자 승인이 필요한 별도 범위다.

### 실행 주체와 시점

- migration은 application startup hook이 아니라 명시적인 개발·CI·배포 단계에서 실행하는 안을 우선 검토한다.
- 개발에서는 schema 변경을 migration으로 만들고 local development DB에 적용한다.
- CI에서는 빈 test DB를 만든 뒤 모든 migration을 순서대로 적용하고 seed 또는 test fixture를 주입한다.
- production migration 실행 주체와 승인·rollback 정책은 배포 topology가 확정될 때까지 `TBD`다.
- seed는 개발·test setup에서 명시적으로 실행하며 application boot가 매번 seed를 실행하지 않도록 한다.

## Test와 검증 계획

### 검증 계층 비교

| 계층 | 확인 내용 | DB 필요 여부 |
| --- | --- | --- |
| ProductRepository unit | row mapping, `features` 배열, purchaseMode 보존, 없는 row mapping과 DB error propagation | no, fake client 또는 adapter double |
| ProductService unit | repository 호출, 목록 반환, 없는 Product의 `NotFoundException`, fallback 금지 | no, repository mock |
| Controller unit | 목록 envelope와 상세 object 위임, controller가 persistence를 알지 않는지 | no, service mock |
| Nest application HTTP contract | 실제 Nest app에서 200·JSON·404·잘못된 path와 `/health` 계약 | no 또는 repository override. DB provider를 eager connect하지 않아야 한다. |
| PostgreSQL integration | 실제 Pool/ORM/adapter query, 세 row와 두 purchase mode, 없는 ID | yes, dedicated test DB |
| migration test | 빈 DB에 최초 migration을 적용하고 table, column, constraint와 반복 적용 동작 확인 | yes |
| seed test | seed 후 현재 read model과 동일한 세 row, deterministic/idempotent 동작 확인 | yes |

### 최소 API 검증 대상

- 정상 Product 목록과 `{ items: [...] }` envelope
- 정상 Product 상세
- 존재하지 않는 Product ID의 `404`
- `/api/product`, `/api/products/:productId/extra` 등 잘못된 path의 `404`
- `QUOTE_REQUIRED`가 목록·상세에서 그대로 보존되고 가격·재고가 생기지 않는지 확인
- `DIRECT_PURCHASE`가 목록·상세에서 그대로 보존되고 가격·재고를 추론하지 않는지 확인
- `GET /health`가 `{ "status": "ok" }`와 `200`을 계속 반환하는지 확인
- Product DB 연결이 없을 때 fixture fallback이 발생하지 않는지 확인

### test database 전략

- 개발용 `DATABASE_URL`과 테스트용 `TEST_DATABASE_URL`을 별도 database 또는 별도 schema로 분리한다. 같은 database를 병렬 test와 개발 작업이 공유하지 않는다.
- test setup은 빈 database에 migration을 적용한 뒤 seed 또는 test fixture를 넣는다.
- test teardown은 test database를 폐기하거나 고유 schema를 정리한다. 정확한 격리 방식은 local infrastructure 선택에 따라 `TBD`다.
- DB 없는 환경에서는 unit·controller·repository mapping test와 repository override를 이용한 HTTP contract test는 실행할 수 있어야 한다.
- PostgreSQL integration·migration·seed test는 DB가 없으면 통과로 처리하지 않는다. 사전 조건 오류를 명확한 non-zero failure로 보고하고, unit/API contract 결과와 분리한다.
- 실제 runtime은 DB 오류를 fixture로 숨기지 않는다. Product request failure와 `GET /health`의 독립 동작을 각각 확인한다.

### 검증 명령 후보

다음 명령은 후보와 실제 Prisma 7 stable spike 결과를 구분하기 위해 기록한다. Product API 구현 task에서는 repository adapter 연결 시 실제 운영 명령과 실행 주체를 다시 확정한다.

```text
pnpm --filter @phytoworks/api lint
pnpm --filter @phytoworks/api typecheck
pnpm --filter @phytoworks/api test
pnpm --filter @phytoworks/api build
pnpm lint
pnpm typecheck
pnpm test
pnpm build

# Drizzle 선택 시 후보
pnpm --filter @phytoworks/api db:generate
pnpm --filter @phytoworks/api db:migrate
pnpm --filter @phytoworks/api db:seed

# Prisma 7 stable spike에서 실제 사용한 명령
pnpm --filter @phytoworks/api prisma:generate
pnpm --filter @phytoworks/api prisma:migrate:dev
pnpm --filter @phytoworks/api prisma:migrate:deploy
pnpm --filter @phytoworks/api prisma:verify
pnpm --filter @phytoworks/api prisma:seed
pnpm --filter @phytoworks/api prisma:smoke
```

실제 DB가 있는 환경에서는 migration 적용, seed, API 기동, HTTP 요청과 process 종료까지 확인한다. DB가 없는 환경에서는 실행하지 못한 범위와 이유를 `Verification`에 실제 결과대로 기록한다.

## Dependency와 script 변경 범위

### 설계 task 시작 시 변경하지 않았던 파일

- root `package.json`
- `apps/api/tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`

Prisma 7 stable spike에서 위 파일들은 변경하지 않았다. 대신 `apps/api`에 spike 전용 Prisma 설정과 검증 파일을 추가했다. 이 변경은 database client와 schema 검증을 위한 것이며 Product API source 교체는 포함하지 않는다. generated Prisma Client는 직접 수정하지 않으며, `biome.json`은 generated source를 lint 대상에서 제외한다. `pnpm-workspace.yaml`은 변경하지 않는다.

### 다음 구현 task의 변경 후보

| 파일 | 후보 변경 | 근거와 제한 |
| --- | --- | --- |
| `apps/api/package.json` | Drizzle 선택 시 runtime `drizzle-orm`, `pg`; dev `drizzle-kit`, `@types/pg` | 실제 repository와 migration script에서 사용될 때만 추가한다. 버전은 구현 시 공식 metadata를 다시 확인한다. |
| `apps/api/package.json` | Prisma 7 stable `@prisma/client`, `prisma`, `@prisma/adapter-pg`와 `dotenv` | stable spike에서 실제 사용했고, ProductRepository 구현 승인 후에도 이 baseline을 유지한다. |
| `apps/api/package.json` | TypeORM 선택 시 `@nestjs/typeorm`, `typeorm`, `pg`와 `@types/pg` 후보 | Nest integration과 entity/migration을 실제 구현할 때만 추가한다. |
| `apps/api/package.json` | 직접 SQL 선택 시 `pg`, `@types/pg`와 별도 migration tool 후보 | migration tool이 실제 선택된 경우에만 추가한다. |
| root `package.json` | root filter script를 이미 재사용할 수 있으면 변경하지 않는다. DB command를 root에서 노출할지는 `TBD` | 사용처가 없는 root alias를 미리 만들지 않는다. |
| `pnpm-workspace.yaml` | 변경하지 않음 | 현재 `apps/*`, `packages/*`가 이미 충분하다. |
| `pnpm-lock.yaml` | 승인된 manifest 변경 뒤에만 root에서 갱신 | 별도 lockfile을 만들지 않는다. |
| `apps/api/tsconfig*.json` | 새 database source와 config가 기존 include에 들어가는지 확인 | ESM·NodeNext와 TypeScript 7 build가 실제로 통과할 때만 최소 수정한다. |
| `biome.json` | 새 decorator 또는 generated source가 생길 때 필요한 최소 설정만 검토 | Nest CLI, 별도 lint stack과 공통 package는 추가하지 않는다. |

Nest CLI, `@nestjs/config`, class-validator, Swagger/OpenAPI, CORS와 공통 database package는 현재 사용 근거가 없으므로 dependency 후보에서 제외한다.

## 변경할 파일과 변경하지 않을 파일

### 이번 설계 task와 Prisma 7 stable spike에서 현재 남긴 파일

- `tasks/009-product-database.md`
- `docs/adr/003-prisma-postgresql-access.md`
- `apps/api/package.json`
- `apps/api/.env.example`
- `apps/api/prisma.config.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations-prisma7/*`
- `apps/api/src/generated/prisma/*`: generated Prisma Client
- `apps/api/src/prisma7/*`: spike client, Nest provider, seed, verify와 CRUD smoke
- `pnpm-lock.yaml`

ProductRepository port, static adapter와 Prisma adapter를 실제 Product API에 연결하는 작업은 아직 구현하지 않았다.

### 다음 구현 task에서 변경할 수 있는 파일

- `apps/api/package.json`
- 승인된 도구에 따른 root `pnpm-lock.yaml`
- `apps/api/src/database/*`
- `apps/api/src/product/product.repository.ts` 및 repository test
- `apps/api/database/migrations/*`
- `apps/api/database/seed.ts`
- 선택된 migration tool config 파일
- `apps/api/src/product/product.service.ts`, module와 test: repository port 연결에 필요한 최소 변경만
- API README와 관련 task 문서: 실제 명령과 결과 기록

### 이번 task에서 변경하지 않을 파일

- `apps/api/src/product/product.controller.ts`: API contract가 유지되는 한 변경하지 않는다.
- `apps/api/src/health/*`: HealthModule과 `GET /health` 계약을 유지한다.
- `apps/web/data/products.ts`, Product route와 component: web fetch task 전까지 유지한다.
- `apps/web`의 fetch, Server Action, cache와 UI
- `packages/*`: 실제 공유 책임이 생기기 전까지 생성하지 않는다.
- `docs/context/*`, `docs/domain/*`, `docs/design/*`: 이번 설계만으로 확정된 domain 규칙이 없으므로 변경하지 않는다.
- 실제 credential, Docker, deployment와 운영 설정
- Cart, Customer, Order, Payment, Checkout 코드와 문서
- Swagger/OpenAPI와 validation 설정
- 커밋

## Completion Criteria

이 설계 task는 다음 조건을 만족하면 완료로 본다.

- 현재 branch, 기준 commit, 부모 workspace와 Git 상태가 기록되어 있다.
- API fixture와 web fixture의 중복, 현재 endpoint와 response shape가 기록되어 있다.
- Product read model과 PostgreSQL 도입 범위가 분리되어 있다.
- Prisma, Drizzle, TypeORM, node-postgres·직접 SQL과 database task 분리안을 각각 비교했다.
- 각 후보의 NestJS 12 사용 방식, Node.js 24 engine 또는 확인 수준, TypeScript 7 호환성, peer dependency, migration, repository 책임, build·test 복잡도와 장기 확장성이 기록되어 있다.
- 공식 자료와 공식 repository 링크, 조사 기준일과 공식 자료로 확인하지 못한 `Proposed/TBD` 항목이 기록되어 있다.
- PostgreSQL 도입이 가격, 재고, Customer, 주문, 결제 상태를 추측해 추가하지 않는 경계가 기록되어 있다.
- Product 초기 field mapping, purchaseMode 의미와 제외 field가 기록되어 있다.
- migration, seed, fixture 변환과 schema ownership의 책임이 기록되어 있다.
- API endpoint, envelope, 상세 응답, 404와 `/health` 유지 계획이 기록되어 있다.
- ProductModule, ProductController, ProductService, repository, DatabaseModule과 HealthModule sibling 경계가 기록되어 있다.
- `DATABASE_URL`, local DB, Docker, migration 실행, seed, credential과 environment validation dependency의 Proposed/TBD 상태가 기록되어 있다.
- unit, HTTP, PostgreSQL integration, migration, seed와 DB unavailable failure test 전략이 기록되어 있다.
- dependency, script, tsconfig, Biome와 lockfile 변경 후보가 현재 변경과 분리되어 있다.
- 변경·비변경 파일, non-goals와 승인 전 금지 범위가 기록되어 있다.
- 장기 영향이 있는 ORM 선택을 ADR-003 `Accepted`로 기록했다.
- Prisma 8 RC compatibility spike와 Prisma 7 stable fallback을 비교 기록했으며, 현재 stable baseline은 Prisma 7이다. 실제 Product API data source 교체와 web fetch 연결은 수행하지 않았다.

## ADR 후보

다음은 장기 영향이 있으므로 ADR로 관리할 결정이다.

- [`ADR-003: Prisma 7 stable을 PostgreSQL 접근 계층 baseline으로 사용`](../docs/adr/003-prisma-postgresql-access.md): Prisma 7 stable baseline을 Accepted로 기록한다.

- ORM 또는 직접 SQL 선택
- PostgreSQL을 Product API source of truth로 삼는 시점과 web ownership 전환 순서
- schema·migration·seed의 소유 위치와 `apps/api` 대 `packages/database` 경계
- `DatabaseModule`, database client provider와 Product repository adapter 경계
- web/API response contract와 data ownership 전환 방식
- 개발용 PostgreSQL과 test database의 분리·reset 전략

다음 항목은 우선 task 문서에 남기고 별도 ADR 필요성을 다시 판단한다.

- Product schema 초기 field mapping
- repository 파일 배치의 구체적인 경로
- migration과 seed 실행 명령 후보
- 목록·상세·404·health test case
- dependency와 script 변경 후보
- web 정적 fixture를 제거하는 시점
- 현재 source order를 보존할지와 내부 `display_order`를 둘지

## Follow-up

사용자 승인 후 다음 순서로 구현한다.

1. Prisma 7 stable baseline을 기준으로 `ProductRepository` port, static adapter와 Prisma adapter 구현 계획을 검토한다.
2. 별도 승인을 받으면 `apps/api` 내부 schema·migration·seed ownership을 정리하고 Product repository adapter를 실제 API에 연결한다.
3. Product API의 response contract, 404와 DB 오류 전파를 유지하면서 PostgreSQL source of truth 전환을 검증한다.
4. Prisma 8 stable package가 실제 registry에서 확인되면 별도 upgrade task에서 Prisma 7과 side-by-side 호환성과 migration을 검토한다.
5. DB 연결이 없을 때 fallback하지 않는 failure와 DB와 독립적인 `/health`를 실제 repository 경계에서 검증한다.
6. 별도 web integration task에서 `apps/web/data/products.ts`를 API data로 대체하고 fixture 제거 시점을 결정한다.
7. 이후 Cart vertical slice에서 최신 Product, 가격·재고 검증을 별도로 설계한다. 이번 task의 Product schema에 이를 미리 추가하지 않는다.

## Problems Encountered

- PowerShell login profile이 존재하지 않는 `SSL_CERT_FILE` 환경변수를 제거하려는 Conda 경고를 출력했다. 파일·Git 조회와 이번 문서 작성에는 영향을 주지 않았다.
- PowerShell 기본 출력 encoding으로 처음 한글 문서가 깨져 보였으므로 `Get-Content -Encoding UTF8`로 다시 읽었다. 깨진 출력은 판단 근거로 사용하지 않았다.
- Drizzle official repository의 main package metadata와 조사일 registry version이 다를 수 있었다. 따라서 repository main은 구조·peer 근거로 사용하고, version pin은 구현 시점에 공식 metadata를 재확인하도록 `TBD`로 남겼다.
- Prisma 공식 문서에는 stable Prisma 7과 Prisma 8 Release Candidate 경로가 함께 보였다. Prisma stable/RC 조합을 섞지 않는 것을 구현 전 확인 조건으로 남겼다.
- 현재 Node.js `24.14.0`은 NestJS 12 application 실행 기준은 충족하지만 CLI schematics의 `24.15+` 기준에는 미달한다. 따라서 Nest CLI generator를 이번 범위에 포함하지 않는다.
- `prisma@8.0.0-rc.12` CLI를 사용했을 때 공식 문서가 안내하는 `prisma migrate` 명령은 현재 CLI에서 등록되지 않았고, 실제 명령은 `prisma db migrate`였다. package script는 실제 CLI 결과에 맞췄다.
- Prisma 8 facade는 현재 registry에서 `@prisma/orm-postgres@8.0.0-rc.8`로 설치되며 CLI `8.0.0-rc.12`와 patch가 다르다. contract emit, migration, runtime은 통과했지만 stable version alignment는 `TBD`다.
- RC spike 당시 `pnpm peers check`는 전이 dependency `capnp-es@0.0.14`가 TypeScript `^5.7.3`을 요구한다는 경고를 출력했다. RC dependency를 제거한 뒤 현재 workspace에서 `pnpm peers check`는 peer dependency 문제 없이 통과했다. 따라서 이 warning은 현재 프로젝트의 baseline 문제가 아니라 RC spike dependency tree의 non-blocking warning이었다.
- Prisma 8 generated `contract.d.ts`는 일반 Biome lint 규칙과 충돌하는 generated code를 포함한다. generated contract artifact를 Biome 대상에서 제외했다.
- 첫 seed script는 `.env` 파일을 강제해 실패했으므로, credential 파일을 만들지 않고 process environment의 `DATABASE_URL`을 사용하도록 수정했다.
- Docker CLI는 처음에 daemon이 꺼져 있었지만 Docker Desktop을 시작한 뒤 PostgreSQL 15 임시 container로 DB 검증을 완료했다. repository에는 Docker 설정을 추가하지 않았다.
- 이전 일반 `pnpm install`에서는 `esbuild`, `msgpackr-extract`, `workerd` lifecycle build approval 문제가 발생했다. 이는 Prisma 7 package의 기능 호환성 문제와 분리해 기록한다. 이번 stable package install은 `--ignore-scripts`로 통과했지만, 이 옵션을 영구적인 해결책으로 간주하지 않는다. 각 package의 install script approval과 pnpm 설정은 별도 infrastructure 또는 dependency 운영 task에서 확인해야 한다.
- Prisma 7 stable spike를 시작할 때 `prisma` CLI dependency가 manifest에 빠져 있어 `prisma generate`가 실패했다. `prisma@7.10.0`을 dev dependency로 추가한 뒤 generation을 다시 실행했다.
- Prisma config의 `env("DATABASE_URL")`는 generate처럼 DB 연결이 필요하지 않은 CLI 명령에서도 환경변수 부재를 즉시 실패시킨다. 실제 credential을 저장하지 않고 명령 실행 시 placeholder 또는 환경별 secret을 주입하는 방식으로 검증했다.
- Prisma engine download가 PowerShell·Conda CA 설정에서 `unable to verify first certificate`로 실패했다. Node system CA를 사용하도록 `NODE_USE_SYSTEM_CA=1`을 설정한 재실행은 통과했다. 이 문제를 Prisma 7 기능 호환성 문제로 분류하지 않는다.
- 기존 Prisma 8 spike가 만든 빈 `prisma/migrations` 디렉터리가 Prisma 7 migration 명령과 충돌했다. spike에서는 공식 config의 `migrations.path`로 `prisma/migrations-prisma7`을 지정했다. 실제 Product 구현 전에는 표준 migration 경로와 기존 빈 디렉터리를 정리할 별도 확인이 필요하다.
- 처음 작성한 Prisma 7 seed가 과거 중첩 fixture 구조를 가정해 실패했다. 현재 API fixture가 flat read model이라는 사실에 맞춰 `summary`, `features`, `mediaLabel` 매핑을 수정했다.
- generated Prisma Client가 Biome lint의 대상이 되면 생성 코드 내부 형식과 충돌할 수 있다. generated source를 lint 대상에서 제외하고 직접 수정하지 않는 원칙을 적용했다.
- PowerShell inline Node query는 따옴표 확장으로 두 번 실패했다. 최종 schema·seed 검증은 별도 TypeScript verify script로 수행해 shell quoting 문제와 DB 검증 결과를 분리했다.

## Verification 계획

이번 task에서는 먼저 Prisma 8 RC compatibility spike를 보존 가능한 기록으로 남긴 뒤, stable package가 실제 registry에 존재하지 않는다는 이유로 Prisma 7 stable fallback을 동일한 범위로 검증했다. 다음 결과는 Prisma 7 검증과 Prisma 8 비교 결과를 구분한다.

### Prisma 8 RC historical result

- Prisma 8 RC에서는 contract emit, TypeScript 7 typecheck, NestJS build, PostgreSQL connection, migration, migration 재실행, schema verify, seed와 Product create/read/delete가 통과했다.
- 그러나 조사 당시 registry의 `prisma@latest`는 `8.0.0-rc.12`, `@prisma/orm-postgres@latest`는 `8.0.0-rc.8`이었다.
- `pnpm view prisma@8.0.0 version`과 `pnpm view @prisma/orm-postgres@8.0.0 version`은 stable package를 찾지 못했다.
- 따라서 Prisma 8 RC는 production dependency에서 제거했고, Prisma 8 자체의 기능적 호환성 실패로 판단하지 않았다.
- RC spike의 `pnpm peers check`에서는 전이 dependency `capnp-es@0.0.14`의 TypeScript `^5.7.3` peer warning을 확인했다. RC 제거 후 현재 workspace의 peer check에는 문제가 없었다.

### Prisma 7 stable fallback result

- registry 조회: `prisma@7`, `@prisma/client@7`, `@prisma/adapter-pg@7`의 latest가 모두 `7.10.0`이며 prerelease suffix가 없음을 확인했다.
- package role: `prisma@7.10.0`은 CLI와 migration, `@prisma/client@7.10.0`은 generated client runtime과 type, `@prisma/adapter-pg@7.10.0`은 PostgreSQL adapter다.
- Node engine: 세 package의 registry metadata가 `^20.19 || ^22.12 || >=24.0`을 선언하며, 현재 Node `24.14.0`이 범위에 포함된다.
- TypeScript peer: `@prisma/client@7.10.0`은 `typescript >=5.4.0`을 선언한다. TypeScript `7.0.2`를 공식적으로 명시한 자료는 확인하지 못했지만, 현재 프로젝트 typecheck와 build는 통과했다.
- dependency install: `pnpm install --ignore-scripts` 통과. 이 명령은 package installation 검증이며, 일반 `pnpm install`의 lifecycle script approval 문제를 영구적으로 해결한 것으로 간주하지 않는다.
- client generation: `DATABASE_URL` placeholder와 `NODE_USE_SYSTEM_CA=1` 환경에서 `pnpm --filter @phytoworks/api prisma:generate` 통과. `prisma-client` generated output을 `apps/api/src/generated/prisma`에 생성했다.
- TypeScript typecheck: `pnpm --filter @phytoworks/api typecheck` 통과.
- NestJS build: `pnpm --filter @phytoworks/api build` 통과.
- PostgreSQL connection: PostgreSQL 15 임시 database에 `PrismaPg` adapter로 연결 통과.
- 최초 migration: `prisma migrate dev --name product-init` 통과. Product table과 enum을 생성하고 `prisma/migrations-prisma7/`에 migration을 만들었다.
- migration 재실행: `prisma migrate deploy`를 다시 실행해 pending migration 없음과 `prisma migrate status`의 schema up to date를 확인했다.
- schema verify: Product table이 `id`, `name`, `category`, `description`, `summary`, `features`, `mediaLabel`, `purchaseMode`의 8개 column을 갖는지 확인했다.
- seed: 현재 API fixture에서 3개 Product를 seed하고, `QUOTE_REQUIRED` 1개와 `DIRECT_PURCHASE` 2개를 확인했다.
- Product CRUD: temporary Product create/read/delete smoke 통과.
- API regression: 기존 Product API를 static fixture에 연결한 상태에서 목록·상세·없는 ID·잘못된 path의 기존 동작을 다시 확인했다. `GET /health`의 `200`과 `{ "status": "ok" }`도 유지되었다.
- API tests: Vitest 5개 file, 12개 test 통과.
- lint: API lint와 root lint 통과.
- typecheck: API typecheck와 root typecheck 통과.
- build: API build와 root build 통과. root build에서 Next.js 16 build도 통과했다.
- peer dependency: `pnpm peers check` 통과.
- frozen install: stable dependency lockfile 기준 `pnpm install --frozen-lockfile --ignore-scripts`를 최종 확인한다. 일반 lifecycle script approval 문제는 아래 Problems Encountered에 별도로 기록한다.

### Comparison and unverified items

| 검증 항목 | Prisma 8 RC | Prisma 7 stable |
| --- | --- | --- |
| package 상태 | `8.0.0-rc.12`, `8.0.0-rc.8`, production 미채택 | `7.10.0` stable 조합, production baseline 채택 |
| generation | `prisma contract emit` 통과 | `prisma generate` 통과 |
| PostgreSQL runtime | 통과 | `PrismaPg` adapter로 통과 |
| migration | RC CLI의 `prisma db migrate`로 통과 | `prisma migrate dev/deploy/status`로 통과 |
| schema verify | 통과 | 8개 Product column과 migration history 확인 통과 |
| seed와 CRUD | 통과 | 3개 seed와 create/read/delete 통과 |
| TypeScript 7, Nest build | 통과 | 통과. 공식 TS 7 명시 검증은 미확인 |
| API regression, lint, test, build | 통과 | 통과 |
| production 채택 | prerelease라 미채택 | stable package 조합이므로 채택 |

다음 항목은 이번 spike에서 실제 production 환경으로 검증하지 않았다.

- Vercel 배포와 실제 production credential
- 개발용 PostgreSQL 제공 방식과 Docker Compose 도입
- Product API를 Prisma repository로 실제 전환한 뒤의 HTTP integration
- 병렬 test database provisioning과 teardown
- Prisma 8 stable upgrade의 실제 package와 migration 호환성

최종 검증을 실행한 뒤 `git status --short --branch`, `git diff --check`와 예상하지 못한 파일을 다시 확인한다. 커밋은 만들지 않는다.
