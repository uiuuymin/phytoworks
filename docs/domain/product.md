# Product Domain

## Product의 의미

Product는 PhytoWorks Shop에서 연구자나 기관 담당자가 조회하는 생육 시스템, 이미징 모듈, 환경·관수 옵션 또는 분석 서비스다. 공식 PhytoWorks 사이트의 제품 맥락을 사용하지만, 온라인 판매 방식과 가격은 별도의 학습용 모델로 구분한다.

현재 Product 모델 전체는 **Proposed**다.

`apps/web/data/products.ts`의 정적 목록과 판매 방식은 API 이전 단계의 **Current Demo 구현**이다. 실제 판매 정책이나 공식 가격·재고 정보로 취급하지 않는다.

## 근거와 정보 상태

- `Confirmed` — 공식 사이트에서 확인한 제품명, 기술과 사양
- `Proposed` — 쇼핑몰 구현을 위해 검토 중인 category, 판매 방식과 domain rule
- `Demo` — Toss Payments 학습을 위해 만든 가격, 재고와 직접 구매 가능 여부

공식 근거와 확인되지 않은 범위는 [`../context/company-reference.md`](../context/company-reference.md)에 기록한다.

## 예상 속성

| 속성 | 의미 | 상태 |
| --- | --- | --- |
| `id` | Product를 구별하는 식별자 | Proposed — 형식 TBD |
| `name` | 고객에게 보이는 상품명 | Proposed |
| `description` | 상품 설명 | Proposed — 필수 여부 TBD |
| `category` | 생육 시스템, 이미징 모듈, 환경·관수 옵션, 분석 서비스 구분 | Proposed |
| `purchaseMode` | 직접 구매 또는 견적 문의 구분 | Proposed — `DIRECT_PURCHASE`, `QUOTE_REQUIRED` 후보 |
| `pricing` | 가격 표시값, 통화, 출처와 권위 여부 | Current Demo — Web UI에 표시하지만 실제 판매 가격이나 주문 금액의 기준으로 사용하지 않음 |
| `optionGroups` | 카탈로그에 기재된 선택 가능 구성 후보 | Current Demo — NITRO의 Depth Imaging, Irrigation과 Additional Options |
| `specGroups` | 카탈로그의 기술 사양을 화면에서 그룹별로 표시하기 위한 값 | Current Demo — NITRO의 Chamber, Imaging, LED와 Plant 정보 |
| `stockQuantity` | 직접 구매 항목의 재고 수량 | 현재 범위에서 제외 — 재고 모델은 TBD |
| `isActive` | 현재 목록 노출 및 신규 구매가 가능한지 나타내는 값 | Proposed |
| `sourceStatus` | 공식 정보 기반인지 학습용 Demo인지 나타내는 값 | Proposed |
| `sourceUrl` | 공식 사실을 확인한 출처 | Proposed — 필요한 항목에만 사용 |
| `media` | Product Detail에 표시할 제품 또는 분석 결과 이미지와 alt text | Current Demo — 사용자 제공 카탈로그에서 추출한 이미지, 권리 상태는 TBD |
| `thumbnail` | ProductCard에 표시할 실물 제품 썸네일과 alt text | Current Demo — NITRO만 있고 이미징 모듈은 실물 사진 확보 전까지 TBD |

SKU, 장비 옵션 조합, 납기, 설치와 유지보수 정보는 실제 구현 범위를 정한 뒤 추가한다. 학습 목적과 관계없는 필드를 미리 늘리지 않는다.

## 초기 Product 범위

아래는 공식 사이트에서 확인한 정보로부터 가져온 초기 후보이며 온라인 판매 여부는 확정된 사실이 아니다.

- `NITRO Plant Growth System` — 생육·표현형 분석 시스템, Current Demo `QUOTE_REQUIRED`
- `Thermal Imaging Module` — 열화상 이미징 모듈, Current Demo `DIRECT_PURCHASE`
- `Chlorophyll Fluorescence Module` — 엽록소 형광 이미징 모듈, Current Demo `DIRECT_PURCHASE`
- 환경·관수 옵션 — Drip, Mist, Sub-irrigation 등, 구체적인 Product 분리 방식 TBD
- AI 분석 서비스 — Phenos 맥락을 참고하지만 상품·요금제 존재 여부는 Demo로만 검토

## 가격

- 공식 사이트에서 실제 가격은 확인되지 않았다. 가격을 추가하면 반드시 `Demo`로 표시한다.
- **Current Demo:** NITRO의 `도입·1년 운영비 2,000만 원부터`는 카탈로그 비교값이며 제품의 확정 판매 단가가 아니다.
- **Current Demo:** Thermal Imaging Module `500만 원`, Chlorophyll Fluorescence Module `700만 원`은 UI 검증용 임시값이다.
- **Current Demo:** Web은 가격 object의 `authoritative: false`로 위 경계를 보존하고 `500만 원`, `700만 원`과 같은 Demo 가격을 표시한다. 이 값은 실제 결제 금액이나 주문 단가로 사용하지 않는다.
- **Proposed:** `DIRECT_PURCHASE` 항목의 표시 가격과 주문 금액은 서버가 관리하는 Product 가격을 기준으로 한다.
- **Proposed:** `QUOTE_REQUIRED` 항목은 가격 없이 문의 흐름으로 보내며 Cart에 담지 않는다.
- 브라우저나 Cart가 보낸 금액을 그대로 신뢰하지 않는다.
- 과거 OrderItem에는 주문 시점의 단가 snapshot을 남기는 방안을 고려한다.
- 통화 단위, 세금, 할인, 배송비와 반올림 규칙은 `TBD`다.

## 재고

- **Current:** 사용자 결정에 따라 현재 Product와 UI에 재고 필드를 추가하지 않는다.
- `stockQuantity`는 모든 Product의 공통 필드라고 확정하지 않는다. 주문 제작 장비, 옵션과 분석 서비스의 가용성 모델은 서로 다를 수 있다.
- 직접 구매형 재고 상품에는 재고가 음수가 되지 않아야 한다는 규칙을 초기 후보로 검토한다.
- 장바구니에 담는 시점, 주문 생성 시점, 결제 승인 시점 중 언제 재고를 예약하거나 차감할지는 `TBD`다.
- 동시에 여러 주문이 들어오는 상황과 결제 실패 시 재고 복구 방법도 구현 전 결정해야 한다.

## 활성·비활성

- **Proposed:** 활성 Product만 신규 목록에 표시한다.
- 활성 상태와 직접 구매 가능 상태는 같은 의미가 아니다. 활성 `QUOTE_REQUIRED` Product는 목록과 문의 대상으로 표시할 수 있다.
- 비활성화는 Product를 삭제하는 것과 다르며, 과거 주문의 OrderItem 기록은 유지해야 한다.
- 비활성 Product가 이미 Cart에 있을 때 제거할지 경고할지 여부는 `TBD`다.

## 탐색과 구매 전환

- **Proposed:** 활성 Product는 `/products` 목록에서 탐색하고 `/products/[productId]` 상세 화면에서 설명, 사양과 판매 방식을 확인한다.
- **Proposed domain rule / Current Demo:** `QUOTE_REQUIRED` Product의 주 CTA는 `견적 문의`이며 Cart에 담지 않는다. 자체 문의 form과 개인정보 처리를 설계하기 전에는 공식 PhytoWorks 문의 경로로 연결한다.
- **Proposed domain rule / Current Demo:** `DIRECT_PURCHASE` Product만 `장바구니 담기` CTA를 제공한다.
- Current Demo의 직접 구매 가능 여부는 실제 회사 정책이 아니다. 화면에서는 공통 SiteHeader의 `Shop Demo` label로 이 경계를 알리고 route마다 장문의 안내를 반복하지 않는다.
- 저장된 Cart를 복원할 때 Product가 존재하지 않거나 더 이상 `DIRECT_PURCHASE`가 아니면 해당 항목을 제외한다.
- Product card와 browser가 가진 가격은 표시값이며 주문 금액의 신뢰 가능한 기준이 아니다.
- **Current Demo:** NITRO 카탈로그 옵션은 Product Detail에서 선택할 수 있으며, 선택한 구성은 browser 견적함에 임시 저장한다. 옵션별 추가 금액과 견적 전송은 아직 구현하지 않는다.
- IA, Product card와 CTA 표현 원칙은 [`../design/shop-ux-strategy.md`](../design/shop-ux-strategy.md)를 함께 확인한다.

## 향후 결정해야 할 규칙

- Product 식별자와 URL 식별 방식
- Product category와 `purchaseMode` 최종 값
- 가격 통화와 저장 단위
- 할인·세금·배송비 포함 여부
- 직접 구매 항목의 재고 예약·차감·복구 시점
- 품절과 비활성의 차이
- 견적 문의와 온라인 주문의 데이터 경계
- 이미지 출처와 사용 권한 기록 방식
- Product 수정·삭제가 기존 Cart와 Order에 미치는 영향
