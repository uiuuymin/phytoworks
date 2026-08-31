# Task 020: Vercel API 배포

## 상태

In Progress

## 문제

Web 프로젝트는 Vercel에서 빌드되지만, `API_BASE_URL`이 없어 API 프록시가 기본값인 `http://localhost:3001`을 사용합니다. API를 별도 Vercel 프로젝트로 배포해야 합니다.

첫 API 배포에서는 `tsconfig.json`의 테스트용 타입(`vitest/globals`)과 Node 타입을 배포 빌드가 함께 요구했지만, Vercel 빌드 환경에서 타입 정의를 찾지 못해 실패했습니다.

## 선택

`tsconfig.build.json`에서 배포 대상에 필요한 `node` 타입만 명시하고, 기본 `tsconfig.json`에서는 테스트 전용 `vitest/globals` 타입 지정을 제거합니다. TypeScript와 `@types/node`는 API의 build dependency로 이동합니다.

## 범위

- 변경: `apps/api/tsconfig.json`, `apps/api/tsconfig.build.json`, `apps/api/package.json`, `pnpm-lock.yaml`
- 기록: 이 task 문서
- 변경하지 않음: Web API 프록시 동작, Prisma schema, 결제 로직

## 남은 작업

- Vercel API 프로젝트에서 수정된 main 커밋을 재배포합니다.
- API 프로젝트에 `DATABASE_URL`과 `TOSS_SECRET_KEY`를 등록합니다.
- Web 프로젝트의 `API_BASE_URL`을 API 배포 주소로 등록하고 재배포합니다.
- Production에서 `/api/health`, `/api/products`, `/api/cart`를 확인합니다.

## 검증 기록

- 2026-09-01: Vercel API 프로젝트 첫 배포에서 `pnpm install`은 성공했습니다.
- 2026-09-01: 첫 API 배포는 `TS2688`로 실패했습니다. 오류는 Node와 Vitest 타입 정의를 찾지 못한 내용입니다.
