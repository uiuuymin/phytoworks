# Task: Login UI

**Status:** Implemented, authentication pending

## Goal

Header에 Login 진입점을 추가하고, 인증 API가 준비되기 전에도 죽은 링크가 생기지 않도록 최소 로그인 화면을 제공한다. 이번 task는 Web UI만 다루며 인증 API, DB schema와 dependency는 변경하지 않는다.

## Current

- SiteHeader에 Login link가 없었다.
- 인증 API와 사용자 session 저장 규칙은 아직 없다.

## Changes

- 우측 utility 영역에 `Login` link를 추가했다.
- `/login` route와 Email, Password form을 추가했다.
- `/login` panel 아래에 가운데 정렬된 `/signup` 진입 링크를 추가했고, `/signup` route와 Name, Email, Password form을 추가했다.
- Login과 Sign up panel은 같은 폭과 가운데 정렬 규칙을 사용한다.
- 제출 시 인증 API를 호출하지 않고 연결되지 않았다는 상태만 표시한다.

## Not changed

- NestJS 인증 endpoint
- PostgreSQL user, session schema
- credential와 실제 로그인 처리

## Verification

- [ ] Login header link와 `/login` route browser 확인
- [ ] keyboard focus와 form label 확인
- [ ] Web lint, typecheck, build
- [ ] `git diff --check`
