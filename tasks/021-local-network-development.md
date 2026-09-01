# Task 021: 로컬 네트워크 개발 주소 수정

## 상태

완료

## 문제

로컬 Web을 `10.227.209.50:3002`로 열면 Next.js 개발용 정적 리소스가 cross-origin 요청으로 차단되어 Client Component hydration이 실행되지 않았습니다. 그 결과 Cart 화면의 초기 로딩 문구가 계속 표시되었습니다.

또한 API 기본 port가 Web과 같은 `3000`이어서 root `dev` 실행 시 `EADDRINUSE`가 발생할 수 있었습니다.

## 변경

- `apps/web/next.config.ts`에 로컬 개발 주소 `localhost`, `127.0.0.1`, 확인된 네트워크 주소 `10.227.209.50`, `10.253.25.50`, `192.168.96.194`를 `allowedDevOrigins`로 등록했습니다.
- `apps/api/src/main.ts`의 로컬 기본 port를 `3001`로 복원했습니다. Vercel Production은 `PORT=3000` 환경변수를 사용하므로 배포 주소의 port는 변경되지 않습니다.

네트워크 주소와 Web port는 실행 환경에 따라 바뀔 수 있으므로, 같은 컴퓨터에서는 터미널에 표시된 `http://localhost:3000` 또는 `http://localhost:3002`를 우선 사용합니다.

로컬 Cart 프록시가 세션 쿠키를 만들고 API가 토큰을 검증하려면 Git에서 무시되는 `apps/web/.env.local`과 `apps/api/.env`에 같은 32자 이상의 `CART_SESSION_SECRET`을 설정해야 합니다. API의 로컬 데이터베이스 주소도 `apps/api/.env`에 설정해야 합니다.

## 검증

- 로컬 API `http://10.227.209.50:3001/health`와 `/api/cart`가 200을 반환하는 것을 확인했습니다.
- 로컬 Web `http://10.227.209.50:3002/api/cart`가 200을 반환하는 것을 확인했습니다.
- Next.js 로그에서 `10.227.209.50` 개발 리소스 차단 경고가 발생한 것을 확인했습니다.
- Web·API lint와 typecheck, API test와 build를 다시 실행합니다.
- Web `/cart`와 `/api/cart`가 더 이상 `CART_SESSION_SECRET` 누락으로 500을 반환하지 않는 것을 확인했습니다.
