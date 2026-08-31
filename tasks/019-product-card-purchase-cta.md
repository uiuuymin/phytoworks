# Task 019: Product 카드와 구매 CTA 보정

## 목표

NITRO 카드의 운영비 문구를 제거하고, 견적 문의와 자세히 보기의 배치를 복원한다. NITRO 카드의 챔버 기본 이미지와 hover 이미지를 다시 사용하며, 이미징 모듈 상세의 장바구니 담기 버튼이 API 오류 상태에서 영구적으로 잠기지 않도록 수정한다.

## 원인

- `ProductCard`가 NITRO의 `thumbnail`을 기본 이미지로 사용하고 hover용 `media`를 렌더링하지 않았다.
- 카드 가격을 모든 상품에 표시해 `QUOTE_REQUIRED`인 NITRO에도 `도입·1년 운영비 2,000만 원부터`가 노출됐다.
- `AddToCartButton`이 `apiStatus !== "available"`이면 disabled 처리됐고, Cart API가 일시적으로 unavailable이 된 뒤에는 사용자가 다시 요청할 방법이 없었다.

## 결정 사항

- NITRO 카드 기본 이미지는 `nitro-chamber.jpeg`, hover 이미지는 `nitro-hero-cutout.png`로 표시한다.
- 카드 가격은 직접 구매 이미징 모듈에만 표시하고, NITRO 카드에서는 숨긴다.
- 카드 하단에서 구매 방식과 `자세히 보기`를 같은 action group으로 배치한다.
- 장바구니 버튼은 Cart 초기화 중과 mutation 중에만 disabled 처리한다. API가 unavailable이면 버튼을 다시 눌러 재시도할 수 있고, 실패 시 기존 오류 안내를 표시한다.

## 변경 파일

- [x] `apps/web/components/commerce/ProductCard.tsx`와 CSS
- [x] `apps/web/components/cart/AddToCartButton.tsx`
- [x] `apps/web/components/cart/CartProvider.tsx`
- [x] 관련 Product·Cart UX 문서

## 검증

- [x] Web lint
- [x] Web typecheck
- [x] Web production build
- [x] API build
- [x] Products 화면에서 NITRO 운영비 문구 미표시 확인
- [x] Products 화면에서 챔버 이미지와 hover 이미지 URL 모두 확인
- [x] Product Detail에서 모듈 `장바구니 담기` 버튼 렌더링 확인

