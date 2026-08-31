# ADR-003: Prisma 7 stable을 PostgreSQL 접근 계층 baseline으로 사용

## Status

Accepted

Prisma 7 stable fallback compatibility spike가 현재 프로젝트의 Node.js 24, TypeScript 7, NestJS 12, ESM, pnpm workspace와 PostgreSQL 15 환경에서 통과했다. 현재 production baseline은 다음 stable 조합이다.

- `prisma@7.10.0`: CLI와 migration
- `@prisma/client@7.10.0`: generated type-safe client runtime
- `@prisma/adapter-pg@7.10.0`: PostgreSQL driver adapter
- `dotenv@17.4.2`: Prisma config에서 `.env`를 명시적으로 로드

Prisma 8은 공식 changelog에서 `prisma@latest`로 안내되지만, 조사 시점의 registry에서는 `prisma@latest`가 `8.0.0-rc.12`, `@prisma/orm-postgres@latest`가 `8.0.0-rc.8`이었다. 따라서 Prisma 8 RC는 production baseline으로 사용하지 않고, stable release가 실제 registry에서 확인된 뒤 별도 upgrade task로 재검토한다.

## Context

NestJS API가 PostgreSQL을 Product data의 source of truth로 사용하려면 schema, migration, query와 transaction을 관리할 접근 계층이 필요하다. 현재 프로젝트는 NestJS 12, Node.js 24.14.0, TypeScript 7.0.2, ESM과 pnpm monorepo를 사용한다.

현재 Product API는 정적 fixture를 조회한다. 다음 단계에서는 `ProductService`가 특정 database client를 직접 참조하지 않고 repository boundary를 통해 Product data를 조회해야 한다. 가격, 재고, Customer, Order, Payment와 판매 정책은 현재 결정 대상에 포함하지 않는다.

Prisma 8 RC 조합은 contract emit, TypeScript typecheck, NestJS build, PostgreSQL connection, migration, seed와 Product create/read/delete를 통과했지만 prerelease dependency였다. Prisma 7 stable 조합은 동일한 Product schema와 현재 fixture를 사용해 generate, typecheck, build, PostgreSQL connection, migration, 재실행, schema verify, seed와 Product create/read/delete를 통과했다.

## Options Considered

### Prisma

- 장점: NestJS에서 service 또는 module로 감싸기 쉽고, PostgreSQL schema·migration·typed query 흐름을 한 도구군으로 관리할 수 있다.
- 장점: model-first object/API query가 현재 개발자의 학습 목표와 맞으며, CRUD와 relation query의 반복 코드를 줄일 수 있다.
- 단점: generated 또는 emitted contract artifact, CLI와 runtime package의 version alignment에 의존한다.
- 단점: ORM abstraction이 복잡한 PostgreSQL query를 숨길 수 있으므로 raw SQL 또는 lower-level query가 필요한 경우 별도 학습과 검토가 필요하다.
- 위험: Prisma abstraction과 generated client에 의존하며, Prisma 8 upgrade 시 별도 migration을 수행해야 한다.

### Drizzle + node-postgres

- 장점: TypeScript schema와 SQL에 가까운 typed query를 사용하며 PostgreSQL 동작을 비교적 직접 확인할 수 있다.
- 장점: 생성된 client에 대한 의존이 적고 SQL migration diff를 직접 검토하기 쉽다.
- 단점: SQL 개념, `pg Pool`, transaction과 Nest provider wiring을 개발자가 더 직접 관리해야 한다.
- 단점: 현재 프로젝트의 우선순위인 object/API 형태의 CRUD 가독성에는 Prisma보다 학습 부담이 크다.

### TypeORM

- 장점: NestJS 공식 통합과 dependency injection 방식이 잘 알려져 있다.
- 장점: entity와 repository abstraction으로 relation을 표현할 수 있다.
- 단점: decorator metadata, ESM과 TypeScript 7 조합을 별도로 관리해야 한다.
- 단점: entity abstraction과 migration 설정이 추가되어 현재 프로젝트의 최소 persistence 범위보다 복잡해질 수 있다.

## Decision

Prisma 7 stable을 현재 프로젝트의 PostgreSQL 접근 계층 production baseline으로 사용한다.

정확한 baseline version은 `prisma@7.10.0`, `@prisma/client@7.10.0`, `@prisma/adapter-pg@7.10.0`이다. Prisma 7은 PostgreSQL direct connection에 `@prisma/adapter-pg`를 사용하며, ESM package와 `prisma.config.ts`를 사용한다.

이 ADR은 database 접근 기술과 version baseline만 결정한다. Product API에 연결할 repository port와 adapter 구현은 별도 승인을 거친 다음 task에서 수행한다. 목표 구조는 다음과 같다.

```text
ProductController
        ↓
ProductService
        ↓
ProductRepository
       ↙        ↘
Static adapter   Prisma adapter
                    ↓
                 Prisma 7
                    ↓
                PostgreSQL
```

## Rationale

- Prisma는 NestJS에서 database client를 module 또는 service로 감싸는 구조와 잘 맞는다.
- Prisma는 PostgreSQL을 지원하고 schema와 migration을 하나의 도구 흐름으로 관리할 수 있다.
- typed model-first query는 현재 프로젝트의 CRUD 학습과 Product read model 구현에 적합하다.
- 현재 개발자는 SQL 자체를 깊게 학습하는 것보다 실제 웹서비스 구조, repository 경계와 data ownership을 이해하는 것을 우선한다.
- Prisma 7 stable 조합은 현재 Node.js 24, TypeScript 7, NestJS 12, ESM과 PostgreSQL 조합에서 실제 generate, typecheck, build, migration, seed와 CRUD 검증을 통과했다.
- TypeScript 7은 Prisma 공식 문서가 권장하는 버전보다 최신이며, 공식적으로 TypeScript 7을 명시 검증했다는 자료는 확인하지 못했다. 그러나 현재 프로젝트의 실제 typecheck와 build가 통과했으므로 현재 baseline에서는 non-blocking risk로 관리한다.
- Prisma 8 stable release가 registry에서 확인되면 별도 upgrade task에서 API, generated output, migration과 deployment bundle을 다시 검증한다.

## Consequences

### 긍정적 결과

- ProductService가 PostgreSQL 세부 구현과 분리된다.
- Product, Cart, Customer, Order와 Payment로 확장할 때 typed relation과 transaction API를 검토할 일관된 접근 계층이 생긴다.
- schema와 migration 변경을 repository diff에서 추적할 수 있다.
- static adapter를 유지하면서 database adapter와 API contract를 독립적으로 테스트할 수 있다.

### 부정적 결과와 위험

- Prisma API와 schema abstraction에 장기적으로 의존하게 된다.
- ORM이 생성하는 query의 실제 PostgreSQL 동작, index와 transaction 경계를 별도로 확인해야 한다.
- 복잡한 SQL, database-specific function과 성능 최적화가 필요한 경우 Prisma query만으로 충분하지 않을 수 있다.
- Prisma CLI, generated client, PostgreSQL adapter와 NodeNext build 사이의 version alignment를 계속 관리해야 한다.
- TypeScript 7은 Prisma 공식 문서에서 명시적으로 검증된 조합이 아니므로 dependency 업데이트마다 typecheck와 build를 재검증해야 한다.
- Prisma 8 stable upgrade 시 generated contract 구조, query API와 migration CLI 변경을 별도 검토해야 한다.

## References

- [Task 009: Product PostgreSQL source of truth 설계](../../tasks/009-product-database.md)
- [Prisma 공식 changelog: Prisma 8을 `prisma@latest`로 안내](https://www.prisma.io/changelog/2026-08-28)
- [Prisma 7 overview](https://docs.prisma.io/docs/orm/v7)
- [Prisma 7 PostgreSQL database connector](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/postgresql)
- [Prisma 7 database drivers](https://docs.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers)
- [Prisma 7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [Prisma system requirements](https://docs.prisma.io/docs/orm/reference/system-requirements)
- [Prisma config reference](https://docs.prisma.io/docs/orm/reference/prisma-config-reference)
- [prisma@7.10.0 registry metadata](https://registry.npmjs.org/prisma/7.10.0)
- [@prisma/client@7.10.0 registry metadata](https://registry.npmjs.org/@prisma/client/7.10.0)
- [@prisma/adapter-pg@7.10.0 registry metadata](https://registry.npmjs.org/@prisma/adapter-pg/7.10.0)
- [Drizzle PostgreSQL guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [TypeORM PostgreSQL driver](https://typeorm.io/docs/drivers/postgres/)
