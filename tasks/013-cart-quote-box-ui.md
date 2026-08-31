# Task: `/cart` 구매 장바구니와 견적함 분리

**Status:** Implemented, static Web Demo 범위 완료

## Goal

현재 `/cart` 화면 안에서 직접 구매 상품의 구매 장바구니와 NITRO 구성의 견적함을 분리한다. 이번 단계는 학습용 Web Demo이며 API, DB, 주문과 결제는 변경하지 않는다.

## Current

- Browser Cart는 `localStorage`의 `phytoworks-shop.cart.v1`에 직접 구매 Product ID와 수량을 저장한다.
- NITRO는 공식 문의 링크만 제공하고 구성 후보를 저장하지 않는다.
- Product Detail의 NITRO 옵션은 카탈로그 기반 읽기 전용 목록이다.

## Decisions

- `/cart` 내부에 `구매 장바구니`와 `견적함`을 세로로 분리한다.
- 견적함은 별도 route를 만들지 않는다.
- 견적함은 `phytoworks-shop.quote.v1` localStorage를 사용한다.
- NITRO의 Depth와 관수는 단일 선택, 추가 옵션은 다중 선택으로 처리한다.
- 같은 Product의 견적 구성은 현재 한 건만 저장하며 새 구성은 기존 구성을 대체한다.
- 옵션별 추가 금액, 수량, 고객 정보, 견적 제출과 API 전송은 TBD 또는 후속 범위다.
- 재고와 실제 결제 금액은 표시하지 않는다.

## Changes

- Quote state와 localStorage parser를 추가했다.
- `CartProvider`에서 구매 장바구니와 견적함 상태를 함께 복원하고 저장한다.
- NITRO Product Detail에 옵션 선택형 `QuoteConfigurator`를 추가했다.
- `/cart`에 구매 장바구니와 견적함을 별도 section으로 표시했다.
- 견적 항목 삭제, 견적함 비우기, 빈 상태와 브라우저 저장 실패 안내를 추가했다.
- 선택한 옵션은 견적함 항목에서 다시 확인할 수 있다.

## Architecture

```text
NITRO Detail
→ QuoteConfigurator
→ CartProvider
→ quote-state
→ quote-storage
→ /cart QuoteView
```

현재 저장값은 브라우저에만 있으며 서버 source of truth가 아니다.

## Verification

- [x] Web lint
- [x] Web typecheck
- [x] Web build
- [x] NITRO에서 필수 옵션 미선택 시 안내 로직 확인
- [x] NITRO 구성 저장 후 `/cart#quote-box` 복원 경로 확인
- [x] 구매 장바구니와 견적함 상태를 별도 reducer와 storage key로 분리
- [x] 손상된 quote localStorage 값이 안전하게 제외되는 parser 확인
- [x] 375px, 768px, 1280px 대응 CSS 구조 확인
- [x] `/products/nitro`, `/cart`, `/cart#quote-box` HTTP 200 확인
- [x] `git diff --check` 확인

브라우저에서 실제 클릭, 새로고침과 viewport별 시각 검증은 아직 수동 확인이 필요하다. 기존 환경에 Lighthouse 실행 도구가 없어 별도 dependency를 추가하지 않고 이번 task에서는 실행하지 않았다.

## Follow-up

- DB와 API가 준비되면 견적함 저장 방식을 서버 저장으로 확장할지 결정한다.
- 견적 제출 endpoint와 고객 정보 수집은 개인정보·문의 정책 확정 후 별도 task로 진행한다.
- 실제 옵션별 가격이 확정되면 option selection과 가격 계산을 함께 재설계한다.
