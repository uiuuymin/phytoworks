# Task: 카탈로그와 공통 UI polish

**Status:** Implemented, browser visual review pending

## Goal

사용자 피드백을 반영해 Product 목록의 정보 구조와 카피를 정리하고, 제품 썸네일과 상세 분석 이미지를 분리하며, 더 간결한 공통 헤더와 Cart 화면을 구현한다. 이번 task는 Web UI만 다루며 API, DB, dependency와 신규 route는 변경하지 않는다.

## Design read

기술 구매자를 위한 B2B 연구장비 카탈로그로 읽고, Steelcase의 사진 중심 제품 탐색과 상단 navigation 구조만 참고한다. PhytoWorks의 카탈로그 이미지와 기존 dark green palette를 유지하며 가격보다 제품 구분과 다음 행동을 먼저 보여준다.

## Current

- `/products`는 생육·표현형 분석 시스템과 이미징 모듈을 두 section으로 나누어 세 Product를 표시한다.
- ProductCard, Product Detail, Cart line item과 Quote line item에는 가격을 표시하지 않는다.
- Product Detail은 `ProductMedia`로 제품 또는 분석 이미지를 표시하고, ProductCard는 별도 `thumbnail`이 있을 때만 제품 썸네일을 표시한다.
- SiteHeader는 `PhytoWorks` 홈 link와 그 아래의 Products navigation을 왼쪽에, Cart utility를 오른쪽에 표시한다.
- `/cart`는 `장바구니와 견적함` 통합 제목을 표시하지 않고 구매 장바구니와 견적함 section을 각각 표시한다.
- 사용자가 제공한 `Brochure_PWSNITRO_v3.pdf`에는 NITRO 챔버 이미지와 Thermal, Chlorophyll Fluorescence 분석 이미지가 있다.
- 제공된 카탈로그와 확인한 공식 자료에는 두 이미징 모듈의 실물 제품 사진이 없다. 카드용 module thumbnail은 TBD다.
- 인증 기능과 Login route는 아직 없다.

## Decisions

- Product 목록을 `생육·표현형 분석 시스템`과 `이미징 모듈` 두 section으로 분리한다.
- NITRO는 첫 section에 단독 배치하고, 두 imaging module은 두 번째 section에 배치한다.
- ProductCard와 구매·견적 화면에서는 가격을 표시하지 않는다. `data/products.ts`의 가격 object는 후속 API 설계를 위한 Demo data로 남긴다.
- `PhytoWorks` wordmark가 `/` 홈 링크가 되며, Home navigation item은 제거한다.
- Products는 `PhytoWorks` 바로 아래의 주요 navigation으로 두고 Cart는 우측 utility link로 분리한다.
- 상세 페이지의 분석 결과 이미지를 ProductCard 썸네일로 재사용하지 않는다. 제품 실물 사진이 없는 모듈은 `제품 사진 준비 중` placeholder를 표시한다.
- Quote configurator의 선택 안내, 저장 안내와 action label은 옵션명과 같은 영어 UI로 통일한다.
- 인증 기능이 없으므로 동작하지 않는 Login link는 추가하지 않는다.
- 실제 카탈로그 이미지 사용 범위는 사용자 제공 PDF로 한정한다. Steelcase의 이미지와 문구는 복제하지 않는다.
- 로고 mark 추가는 별도 후순위 task로 남긴다.

## Changes

- Product data에 제품별 상세 media source와 선택적 thumbnail source 및 alt text를 추가한다.
- `public/images/products/`에 PDF에서 추출한 NITRO, Thermal, Chlorophyll 이미지를 추가한다.
- `/products`의 제목, 설명, section heading과 ProductGrid 배치를 수정한다.
- ProductCard에서 가격 관련 UI를 삭제하고 제품 thumbnail, 제품명, 설명, 구매 방식과 자세히 보기만 표시한다.
- Product Detail, Cart line item과 Quote line item에서 가격 UI를 삭제한다.
- Product Detail placeholder를 상세 media 이미지 렌더링으로 교체한다. 모듈의 분석 결과 crop은 상세 페이지 전용으로 사용한다.
- SiteHeader에서 Home item을 제거하고 `PhytoWorks` 아래 Products와 우측 Cart의 역할을 분리한다.
- `/cart`의 큰 page heading과 설명을 제거하고 두 section heading을 콘텐츠 시작점으로 사용한다.
- NITRO 옵션 group과 option label, Quote configurator의 안내 및 action label을 영어로 통일한다.
- UX 전략 문서에 현재 정보 구조와 카탈로그 이미지 상태를 반영한다.

## Asset record

| Asset | Source | Status | Use |
| --- | --- | --- | --- |
| `nitro-chamber.jpeg` | 사용자 제공 `Brochure_PWSNITRO_v3.pdf` 1쪽 | Current Demo, 사용 권한 최종 확인 TBD | NITRO card와 detail |
| `thermal-imaging-module.png` | 같은 PDF 2쪽의 Thermal 행 crop | Current Demo, 사용 권한 최종 확인 TBD | Thermal Imaging Module detail 전용 분석 결과 |
| `chlorophyll-fluorescence-module.png` | 같은 PDF 2쪽의 Chlorophyll Fluorescence 행 crop | Current Demo, 사용 권한 최종 확인 TBD | Chlorophyll Fluorescence Module detail 전용 분석 결과 |

## Not changed

- NestJS API와 PostgreSQL schema
- Product 가격, 재고, 주문과 결제 규칙
- 인증과 Login route
- API response contract와 `packages/contracts`
- PhytoWorks logo mark

## Verification

- [x] Web lint
- [x] Web typecheck
- [x] Web build
- [x] Products section 순서와 카드 thumbnail 또는 placeholder 확인
- [x] Product Detail 이미지와 alt text 확인
- [x] 가격 관련 visible string이 의도대로 제거되었는지 확인
- [x] Header에 PhytoWorks 홈 link, 그 아래 Products navigation과 우측 Cart utility가 있는지 확인
- [x] Cart의 큰 통합 heading 제거와 purchase cart, quote box heading 확인
- [ ] 375px, 768px, 1280px와 200% text에서 overflow 확인
- [x] `git diff --check`

HTML 응답과 접근성 tree로 route, heading, link, image alt text와 가격 문구 제거를 확인했다. 다른 업무용 브라우저 탭이 활성화되어 전체 화면 캡처와 viewport별 실제 조작은 별도 수동 검증으로 남긴다.

## Follow-up

- 브라우저에서 실제 화면을 확인한 뒤 카드 이미지 crop과 spacing을 조정한다.
- 승인된 PhytoWorks logo mark가 준비되면 Header brand 옆에 추가한다.
- 모듈 실물 사진과 image gallery는 별도 asset 권리 확인 task로 진행한다.
- DB와 API가 준비되면 가격을 다시 노출할지, 견적과 주문 화면을 어떤 contract로 연결할지 결정한다.
