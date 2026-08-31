# Task: NITRO Product Detail 기술 사양 UI

**Status:** Implemented, static Web Demo 범위 완료

## Goal

제공된 NITRO 카탈로그의 기술 사양을 현재 Product Detail에서 읽기 쉽게 확인할 수 있도록 표시한다. 실제 이미지, DB, API와 판매 조건은 변경하지 않는다.

## Current

- Product Detail은 Product 개요와 주요 기능만 표시했다.
- 카탈로그의 치수, 이미징 해상도, LED 광원과 식물 영역 정보는 Web Product 모델에 없었다.
- 현재 Web은 정적 Product Demo를 사용하며 API를 호출하지 않는다.

## Decisions

- 긴 표 대신 `Chamber H/W`, `Imaging`, `LED Lighting`, `Plant & Area`의 4개 그룹 카드로 표시한다.
- 모바일은 1열, 640px 이상은 2열 grid를 사용한다.
- 카탈로그에 표시된 단위와 표현을 유지한다.
- 사양은 기본 구성 기준이며 옵션·커스텀에 따라 달라질 수 있다는 안내를 표시한다.
- 실제 제품 이미지와 로고는 권리 확인 전까지 추가하지 않는다.
- `stock`, 주문·결제, API와 DB는 변경하지 않는다.

## Changes

- `apps/web/data/products.ts`에 `ProductSpecGroup`과 NITRO 사양 그룹을 추가했다.
- `ProductSpecSummary` Server Component와 CSS Module을 추가했다.
- NITRO Product Detail에 기술 사양 섹션을 연결했다.
- Product domain 문서에 `specGroups`의 Current Demo 상태를 기록했다.

## Catalog source

사양의 근거는 사용자가 제공한 `Brochure_PWSNITRO_v3.pdf`다. 카탈로그가 “기본 구성 기준이며 옵션 선택 및 커스텀 가능”이라고 안내하므로, 화면에서는 확정된 모든 모델의 공통 사양으로 표현하지 않는다.

## Verification

- [x] Web lint
- [x] Web typecheck
- [x] Web build
- [x] `/products/nitro`, `/products`, `/cart` HTTP 응답 200 확인
- [x] 375px, 768px, 1280px 대응 CSS 구조 확인
- [x] 200% text 확대를 고려한 1열·2열 responsive 구조 확인
- [x] `git diff --check` 확인

## Follow-up

- API가 DB 기반으로 전환되면 `specGroups`를 API response에 포함할지 별도 결정한다.
- 실제 이미지가 승인되면 ProductMediaPlaceholder를 Product image gallery로 교체한다.
