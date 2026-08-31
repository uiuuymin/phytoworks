# Task: Product 가격과 카탈로그 옵션 표시

**Status:** Implemented, static Web Demo 범위 완료

## Goal

제공된 NITRO 카탈로그와 식물 생장 챔버 시장가 조사를 바탕으로 현재 Shop의 Product 목록, 상세와 Browser Cart에 가격 참고값과 옵션 구성을 표시한다. 실제 판매가, 재고, 주문과 결제를 새로 확정하지 않는다.

## Context

현재 Web Product는 `apps/web/data/products.ts`의 정적 Demo다. Product에는 가격과 옵션이 없고, `DIRECT_PURCHASE` 항목은 가격 없이 Browser Cart에 담긴다. API는 Web과 별도의 정적 read fixture를 사용하며, 이번 작업에서는 API와 DB를 변경하지 않는다.

제공된 `Brochure_PWSNITRO_v3.pdf`에서 다음 옵션을 확인했다.

- Depth 이미징: Lidar, Stereo
- 관수: 점적 관수, 분무경, 저면 관수
- 추가 옵션: EC/pH 센서, 로드셀 센서, 전력량계, 가습 장치

카탈로그의 `NITRO 2천만 원부터`는 제품 단가가 아니라 도입과 1년 운영비 비교값으로 표시되어 있다. 국내외 식물 생장·환경 제어 챔버 판매가는 사양별 차이가 크므로 Web에서는 모두 권위 가격으로 취급하지 않는다.

## Decisions

| 항목 | 결정 | 상태 |
| --- | --- | --- |
| NITRO 가격 | `도입·1년 운영비 2,000만 원부터` | 카탈로그 참고값 |
| Thermal Imaging Module | `500만 원` | Demo |
| Chlorophyll Fluorescence Module | `700만 원` | Demo |
| 통화 | KRW 표시 | Proposed |
| 재고 | Product와 UI에 추가하지 않음 | 승인된 범위 |
| 옵션 추가 금액 | 표시하지 않음 | TBD |
| 옵션 선택 저장 | 이번 작업에서 구현하지 않음 | Proposed 후속 범위 |
| 이미지 | 카탈로그 이미지와 로고를 저장소에 복사하지 않음 | 권리 확인 전 정책 |

두 모듈 가격은 인터넷에서 확인한 챔버 본체 가격을 직접 옮긴 값이 아니다. 화면 흐름 검증을 위한 둥근 Demo 값이며, 실제 결제 금액이 아니다.

## Options considered

### 가격을 Product에 단일 숫자로 추가

선택하지 않았다. 견적 참고값과 Demo 값을 같은 숫자 필드로 표현하면 권위 가격처럼 보이고, 이후 DB 가격·주문 단가와 경계가 흐려진다.

### 출처와 권위 여부를 포함한 pricing object 추가

선택했다. `mode`, `currency`, 표시 문자열, 출처와 `authoritative: false`를 함께 둔다. 이후 DB가 source of truth가 되면 API contract 뒤에서 실제 값으로 교체할 수 있다.

### 옵션을 즉시 선택형 Form으로 구현

선택하지 않았다. 현재 Cart 저장 구조는 Product ID와 수량만 보존하고, 선택 옵션을 견적 endpoint나 주문으로 전달할 API가 없다. 이번 단계는 카탈로그 구성 후보를 읽기 전용으로 표시한다.

## Changes

- `apps/web/data/products.ts`에 `ProductPricing`, `ProductOptionGroup`, Product별 pricing과 카탈로그 옵션을 추가했다.
- `ProductCard`에 가격 참고값과 출처 상태를 추가했다.
- Product Detail의 구매 패널에 가격 출처 설명을 추가했다.
- NITRO 상세에 Depth 이미징, 관수와 추가 옵션을 읽기 전용 구성 요약으로 추가했다.
- Browser Cart line item에 Product 가격 참고값을 추가했다.
- 재고 필드, 품절 UI, 합계 계산, checkout과 결제 로직은 추가하지 않았다.

## API and DB boundary

이번 task의 Product price와 optionGroups는 Web 정적 Demo model에만 존재한다.

```text
현재
apps/web/data/products.ts → Next.js UI

향후
DB schema → NestJS domain/service → API response contract → Next.js UI
```

향후 API 확장 시 가격은 `source`와 `authoritative`를 보존해야 하며, 옵션별 추가 금액은 실제 견적 규칙이 확정된 뒤에만 추가한다. `packages/contracts`는 Web이 API를 소비하고 응답 shape가 안정된 뒤 도입 여부를 검토한다.

## Verification

- [x] Web lint
- [x] Web typecheck
- [x] Web build
- [x] 375px, 768px, 1280px 대응 CSS 구조 확인
- [x] NITRO 옵션 요약과 Demo 출처 표기 확인
- [x] Cart에 재고 또는 실제 결제 금액이 표시되지 않는지 확인
- [x] `/products`, 세 Product 상세 route와 `/cart` 실제 HTTP 응답 200 확인
- [x] `git diff --check` 확인

## Diff review

`git diff`, `git diff --check`, `git status --short`로 범위 밖 변경과 whitespace 오류를 확인했다. 현재 worktree에서는 Web 정적 Product와 문서 관련 파일만 변경되었고, API·DB·dependency·route는 변경하지 않았다.

## Follow-up

- 정적 API의 Product read model에 pricing과 optionGroups를 반영할지 별도 task에서 결정한다.
- Product DB schema와 실제 가격·견적·옵션 추가 금액은 `product-database` 작업에서 별도로 결정한다.
- 옵션 선택을 견적함 또는 주문에 보존하려면 Cart/Quote 데이터 구조와 API가 먼저 필요하다.
