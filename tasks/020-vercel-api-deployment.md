# Task 020: Vercel API 배포

## 상태

부분 완료, DATABASE_URL 설정 대기

## 문제

Web 프로젝트는 Vercel에서 빌드되지만, `API_BASE_URL`이 없어 API 프록시가 기본값인 `http://localhost:3001`을 사용합니다. API를 별도 Vercel 프로젝트로 배포해야 합니다.

첫 API 배포에서는 `tsconfig.json`의 테스트용 타입(`vitest/globals`)과 Node 타입을 배포 빌드가 함께 요구했지만, Vercel 빌드 환경에서 타입 정의를 찾지 못해 실패했습니다.

## 선택

`tsconfig.build.json`에서 배포 대상에 필요한 `node` 타입만 명시하고, 기본 `tsconfig.json`에서는 테스트 전용 `vitest/globals` 타입 지정을 제거합니다. TypeScript와 `@types/node`는 API의 build dependency로 이동합니다.

## 범위

- 변경: `apps/api/tsconfig.json`, `apps/api/tsconfig.build.json`, `apps/api/package.json`, `apps/api/src/main.ts`, `pnpm-lock.yaml`
- 기록: 이 task 문서
- 변경하지 않음: Web API 프록시 동작, Prisma schema, 결제 로직

## 현재 상태와 남은 작업

- API 프로젝트를 별도로 만들고 `apps/api`를 Root Directory로 설정했습니다.
- API Production 배포의 `/health`는 `200 {"status":"ok"}`를 반환합니다.
- Web Production에 `API_BASE_URL=https://phytoworks-api.vercel.app`을 Config 변수로 등록하고 재배포했습니다.
- Web의 `/api/cart`는 더 이상 로컬 기본 주소로 연결하지 않으며, API까지 도달한 뒤 `500 Cart data unavailable`을 반환합니다.
- Vercel 빌드 로그에서 `DATABASE_URL`을 해석하지 못해 자동 migration을 빌드 명령에 넣지 않았습니다. 현재 `/api/products`와 `/api/cart`는 PostgreSQL 연결 또는 migration이 준비되지 않아 `500`입니다.
- 남은 작업: API 프로젝트의 Production·Preview에 실제로 접근 가능한 PostgreSQL `DATABASE_URL`을 확인하고, 해당 데이터베이스에 Prisma migration과 seed를 실행한 뒤 API와 Web을 다시 배포합니다.

## 검증 기록

- 2026-09-01: Vercel API 프로젝트 첫 배포에서 `pnpm install`은 성공했습니다.
- 2026-09-01: 첫 API 배포는 `TS2688`로 실패했습니다. 오류는 Node와 Vitest 타입 정의를 찾지 못한 내용입니다.
- 2026-09-01: API의 `tsconfig`, build dependency와 Nest bootstrap을 정리한 뒤 `pnpm install --frozen-lockfile`, API build·typecheck·test를 통과했습니다.
- 2026-09-01: API Production `/health`는 200이 되었고, Web `API_BASE_URL` 연결 뒤 Web Cart proxy의 응답이 503에서 API의 500으로 바뀌는 것을 확인했습니다.
- 2026-09-01: `DATABASE_URL`을 요구하는 migration을 Vercel build 단계에서 실행하면 빌드 환경에서 변수를 해석하지 못해 실패하므로 자동 실행 설정을 제거했습니다.
