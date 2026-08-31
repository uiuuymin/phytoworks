# Task 018: Products·Cart·Search·Header 수정

## 목표

Products와 Search의 상품 표시 순서를 기존 카탈로그 기준으로 복원하고, Cart 초기화가 무한 로딩에 빠지지 않도록 수정한다. Product 카드 가격과 Header의 hover·active·언어 선택 상태도 일관되게 정리한다.

## 현재 상태와 원인

- API 상품 조회 순서는 데이터베이스의 `id ASC`였기 때문에 Search에서 `chlorophyll-fluorescence`, `nitro`, `thermal-imaging` 순서로 표시됐다.
- Product 카드가 API의 `thumbnail`과 가격 정보를 그대로 표시하면서 이미징 모듈 사진과 `가격 참고` 문구가 노출됐다.
- Cart API 또는 세션 초기화가 끝나지 않으면 `CartProvider`의 `loading` 상태가 계속 유지될 수 있었다.
- Header의 Search·Cart·Login 링크와 `KR | EN` 표시가 다른 내비게이션 항목과 동일한 상호작용 요소가 아니었다.

## 결정 사항

- Product 카드에서는 NITRO만 제품 thumbnail을 표시하고, 이미징 모듈은 `제품 사진 준비 중` placeholder를 표시한다. 모듈 분석 이미지는 Product Detail에서만 유지한다.
- 가격은 `가격 참고` 문구 없이 `500만 원`, `700만 원`처럼 표시한다. 가격 데이터는 `authoritative: false`인 Demo 값으로 유지하며 실제 판매 가격으로 간주하지 않는다.
- Cart API 요청에는 5초 timeout을 적용한다. timeout 또는 HTTP 오류가 발생하면 Cart를 빈 상태로 hydrate하고 `unavailable` 상태를 표시한다.
- 상품 정렬 기준을 공통 함수로 두고 `nitro`, `thermal-imaging`, `chlorophyll-fluorescence` 순서를 Products와 Search에 적용한다.
- Products·About·Search·Cart·Login은 hover에서 surface 배경과 hover 색상을 표시하고, active 상태에서는 배경 없이 action 색상만 표시한다.
- `KR`과 `EN`은 버튼으로 표시하고 선택된 언어만 굵게 표시한다. 실제 locale 전환은 별도 task에서 결정한다.

## 변경 파일

- [x] `apps/web/components/commerce/ProductCard.tsx`와 CSS
- [x] `apps/web/lib/cart-api.ts`, `apps/web/components/cart/CartProvider.tsx`
- [x] `apps/web/lib/product-types.ts`, `apps/web/app/products/page.tsx`, `apps/web/app/search/page.tsx`
- [x] `apps/web/components/layout/SiteHeader.tsx`와 CSS
- [x] `docs/domain/product.md`, `docs/design/shop-ux-strategy.md`

## 검증

- [x] Web Biome lint
- [x] Web TypeScript typecheck
- [x] Web Next.js production build
- [x] API Biome lint와 TypeScript typecheck
- [x] API Vitest: 13개 파일, 42개 테스트 통과
- [x] Cart API smoke test: 추가·조회·삭제 정상 동작
- [x] Products·Search·Cart·Product Detail Chrome smoke test
- [x] `git diff --check`

## 후속 작업

- 실제 운영 가격을 표시하려면 authoritative 가격 출처와 판매 계약을 먼저 확정한다.
- 실제 모듈 홍보 사진과 사용 권한이 확정되면 placeholder asset 정책을 별도 검토한다.
- `KR | EN` locale 전환과 번역 콘텐츠 전략은 별도 task에서 결정한다.
