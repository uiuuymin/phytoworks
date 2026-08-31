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
- Cart에는 여전히 Product ID와 수량만 browser에 저장

Product 원본 데이터는 NestJS API와 PostgreSQL이 소유합니다. Web은 Product 데이터를 정적으로 복제하지 않습니다. API base URL은 서버 전용 `API_BASE_URL` 환경변수를 사용하며, 로컬 기본값은 `http://localhost:3001`입니다.

현재 가격은 brochure 또는 Demo 참고값이며 실제 checkout 가격이 아닙니다. 재고, 옵션별 추가 금액, Cart API, Quote, Order와 Payment는 아직 구현하지 않았습니다.

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

## 검증

루트에서 `pnpm lint`, `pnpm typecheck`, `pnpm build`를 실행합니다.
