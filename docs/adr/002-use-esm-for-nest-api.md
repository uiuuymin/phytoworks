# ADR-002: NestJS API에 ESM을 사용한다

## Status

Accepted

## Context

PhytoWorks Shop은 Node.js 24와 TypeScript 7을 사용하는 pnpm workspace에 NestJS API를 추가한다. NestJS 12의 application schematic은 ESM 구성을 기본으로 생성하며, NestJS 12 package도 ESM으로 배포된다. 새 API가 CommonJS와 ESM 사이의 별도 변환 계층을 만들지 않고 현재 생태계의 기본 방향을 따르도록 module 형식을 결정해야 한다.

TypeScript 7에서는 현재 Nest CLI compiler가 사용할 수 없는 compiler API가 있어서 `nest build`와 `nest start --watch`를 사용할 수 없다. 이 문제는 module 형식과 구분되는 도구 호환성 문제이므로, API는 ESM을 유지하면서 TypeScript CLI와 Node.js watch mode로 build와 개발 실행을 구성한다.

## Options Considered

### ESM과 NodeNext를 사용한다

- NestJS 12의 새 application template과 방향이 일치한다.
- Node.js가 build 결과를 별도 변환 없이 ESM으로 실행한다.
- source의 상대 import에 `.js` 확장자를 명시해야 한다.
- 일부 CommonJS 전용 package를 추가할 때 interop을 확인해야 한다.

### CommonJS를 사용한다

- 과거 NestJS 예제와 기존 도구에서 익숙한 구성을 사용할 수 있다.
- NestJS 12의 새 template과 package 배포 방향에서 벗어난다.
- 향후 ESM으로 이전한다면 module 설정과 import를 다시 검토해야 한다.

## Decision

`apps/api/package.json`에 `"type": "module"`을 선언하고 TypeScript의 `module`과 `moduleResolution`을 `NodeNext`로 설정한다. source의 상대 import에는 build 결과를 기준으로 `.js` 확장자를 사용한다.

Nest CLI는 TypeScript 7 지원이 확인될 때까지 dependency와 script에 포함하지 않는다. 현재 build는 `tsc`, 개발 중 재컴파일은 `tsc --watch`, process 재시작은 `node --watch`가 담당한다.

## Rationale

ESM은 NestJS 12에서 새 application의 공식 기본값이며 Node.js 24가 직접 지원한다. 이 선택은 새 API의 module 체계를 현재 공식 구성과 맞추면서 CommonJS에서 ESM으로 전환하는 후속 작업을 피한다. Nest CLI를 제외하는 결정은 ESM을 포기하기 위한 것이 아니라 TypeScript 7과의 현재 호환성 제약을 우회하기 위한 최소 조치이다.

## Consequences

- API source의 상대 import에는 `.js` 확장자를 사용해야 한다.
- ESM 또는 CommonJS interop에 민감한 dependency를 추가할 때 실제 build와 runtime을 검증해야 한다.
- Nest CLI가 TypeScript 7을 지원하면 현재의 TypeScript CLI와 Node.js watch script를 계속 유지할지 다시 검토할 수 있다.
- 이 ADR은 API의 module 형식만 확정한다. global prefix, versioning, CORS, validation, domain module의 route 설계는 확정하지 않는다.

## References

- [NestJS 12 migration guide](https://docs.nestjs.com/migration-guide)
- [NestJS application ESM template](https://github.com/nestjs/schematics/tree/master/src/lib/application/files/ts-esm)
- [Nest CLI TypeScript 7 compatibility issue](https://github.com/nestjs/nest-cli/issues/3479)
- [Node.js ECMAScript modules](https://nodejs.org/api/esm.html)
- [Task 007](../../tasks/007-api-bootstrap.md)
