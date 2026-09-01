# Task 021: 로컬 네트워크 개발 주소 수정

## 상태

완료

## 문제

로컬 Web을 `10.227.209.50:3002`로 열면 Next.js 개발용 정적 리소스가 cross-origin 요청으로 차단되어 Client Component hydration이 실행되지 않았습니다. 그 결과 Cart 화면의 초기 로딩 문구가 계속 표시되었습니다.

또한 API 기본 port가 Web과 같은 `3000`이어서 root `dev` 실행 시 `EADDRINUSE`가 발생할 수 있었습니다.

## 변경

- `apps/web/next.config.ts`에 확인된 로컬 네트워크 개발 주소 `10.227.209.50`, `10.253.25.50`을 `allowedDevOrigins`로 등록했습니다.
- `apps/api/src/main.ts`의 로컬 기본 port를 `3001`로 복원했습니다. Vercel Production은 `PORT=3000` 환경변수를 사용하므로 배포 주소의 port는 변경되지 않습니다.

네트워크 주소는 실행 환경에 따라 바뀔 수 있으므로, 같은 컴퓨터에서는 `http://localhost:3002`를 우선 사용합니다.

## 검증

- 로컬 API `http://10.227.209.50:3001/health`와 `/api/cart`가 200을 반환하는 것을 확인했습니다.
- 로컬 Web `http://10.227.209.50:3002/api/cart`가 200을 반환하는 것을 확인했습니다.
- Next.js 로그에서 `10.227.209.50` 개발 리소스 차단 경고가 발생한 것을 확인했습니다.
- Web·API lint와 typecheck, API test와 build를 다시 실행합니다.
