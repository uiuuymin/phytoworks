# PhytoWorks Web

PhytoWorks의 연구·육종 장비와 분석 서비스 맥락을 반영한 학습용 B2B 쇼핑몰의 Next.js 애플리케이션입니다. 화면의 가격과 판매 조건은 실제 회사 정책이 아닌 Demo로 구분합니다.

## 실행

저장소 루트에서 다음 명령을 실행합니다.

```bash
pnpm dev
```

브라우저에서 <http://localhost:3000>을 열고 `app/page.tsx`를 수정하면 변경된 화면을 확인할 수 있습니다.

## 현재 책임

- App Router 기반 `/` 화면 제공
- 브라우저 요청을 받아 React 컴포넌트를 렌더링
- NestJS Product Read API에서 Product 목록과 상세를 조회
- API의 가격 참고값과 brochure 옵션 그룹을 Product 화면에 표시
- Product API가 일시적으로 unavailable할 때 안전한 안내 화면 제공
- Cart 항목과 수량은 Cart API와 PostgreSQL에 저장하고, browser에는 익명 Cart session ID만 저장
- Cart에서 checkout으로 이동하면 서버 Order를 준비하고 Toss Payments 결제 UI를 렌더링
- success redirect에서 same-origin Payment API를 호출해 서버 결제를 승인

Product 원본 데이터는 NestJS API와 PostgreSQL이 소유합니다. Web은 Product 데이터를 정적으로 복제하지 않습니다. API base URL은 서버 전용 `API_BASE_URL` 환경변수를 사용하며, 로컬 기본값은 `http://localhost:3001`입니다.

현재 가격은 brochure 또는 Demo 참고값이며 실제 운영 가격이 아닙니다. 재고, 옵션별 추가 금액,
Quote와 Customer 인증은 아직 구현하지 않았습니다. Cart에서 checkout으로 이동하면 서버가 Demo
Order를 준비하고 Toss Payments 결제창을 렌더링합니다. 결제 success redirect는 same-origin
Payment API를 호출해 서버 승인을 완료합니다. Cart·Order·Payment 변경은 same-origin Next.js
route handler를 거쳐 NestJS API로 전달됩니다.

Cart session은 `phytoworks-cart-session` HttpOnly cookie에 저장하며 Web JavaScript에는 노출하지
않습니다. Next.js same-origin proxy가 서명 token을 NestJS API에 전달하고, Web과 API는 같은
`CART_SESSION_SECRET`을 사용해야 합니다. 기존 `phytoworks-shop.cart.v1` 정적 Cart data는
자동으로 API Cart에 병합하지 않습니다. NestJS API의 기본 주소는 서버 전용 `API_BASE_URL`로
지정하고, 기본값은 `http://localhost:3001`입니다.

## Product API 연결

Product 목록과 상세 route는 요청 시 NestJS API를 호출합니다.

```http
GET /api/products
GET /api/products/:productId
```

로컬에서 API가 기본 포트가 아닌 경우에는 Next.js 서버를 실행할 때 `API_BASE_URL`을 설정합니다.

```powershell
$env:API_BASE_URL = "http://localhost:3101"
pnpm --filter @phytoworks/web dev
```

운영 credential은 브라우저 코드나 저장소에 기록하지 않습니다.

Web checkout은 Toss Payments 테스트 client key가 필요합니다. 실제 secret key는 Web에 설정하지
않으며, 로컬 실행 시 `apps/web/.env.example`을 참고해 `NEXT_PUBLIC_TOSS_CLIENT_KEY`만 설정합니다.

배포 시 Web에는 `API_BASE_URL`, `CART_SESSION_SECRET`, `NEXT_PUBLIC_TOSS_CLIENT_KEY`를,
API에는 `DATABASE_URL`, `CART_SESSION_SECRET`, `TOSS_SECRET_KEY`를 등록합니다. `CART_SESSION_SECRET`은
두 앱에서 같은 무작위 값이어야 하며 실제 값은 저장소에 기록하지 않습니다.

## 검증

루트에서 `pnpm lint`, `pnpm typecheck`, `pnpm build`를 실행합니다.
