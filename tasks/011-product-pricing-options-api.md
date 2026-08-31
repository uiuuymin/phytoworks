# Task: DB 기반 Product 가격·옵션 Read API

**Status:** Planned. Product database 작업 완료 후 시작

## Goal

PostgreSQL Product source of truth가 준비된 뒤 NestJS Product Read API가 가격과 카탈로그 옵션을 반환하도록 확장한다. 기존 Product 목록·상세 endpoint와 응답 필드를 유지하고, Web이 API를 소비할 수 있는 additive response contract를 제공한다.

이번 task는 백엔드 API 범위다. Web 화면 변경은 [`010-product-pricing-options-ui.md`](./010-product-pricing-options-ui.md)의 현재 변경과 별도 Web API integration task에서 다룬다.

## Preconditions

다음 조건이 모두 충족된 뒤 시작한다.

- Product database task의 schema, migration과 seed가 검토되었다.
- PostgreSQL local 실행 방법과 안전한 환경변수 예시가 문서화되었다.
- Product repository가 DB에서 Product를 읽을 수 있다.
- `ProductService`가 repository와 API response 사이의 domain 경계로 동작한다.
- 실제 가격이 확정되었는지, 아직 Demo인지 `sourceStatus` 정책이 결정되었다.
- 옵션별 추가 금액과 조합 가능 여부가 결정되었거나, 미확정 상태로 API에서 제외하기로 합의되었다.
- `product-database` worktree의 기존 미커밋 변경을 먼저 정리하고 검토했다.

## Current state

`Current` 상태는 다음과 같다.

- API endpoint는 `GET /api/products`, `GET /api/products/:productId`다.
- API는 PostgreSQL이 아니라 API 내부 정적 fixture를 사용한다.
- 현재 Product 응답 필드는 `id`, `name`, `category`, `description`, `summary`, `features`, `mediaLabel`, `purchaseMode`다.
- 현재 API에는 가격, 통화, 옵션, 재고, 이미지 URL, 배송, 설치, 견적 상태, Customer, Order와 Payment 정보가 없다.
- Web은 아직 API를 호출하지 않고 `apps/web/data/products.ts`를 직접 사용한다.

## User decisions and information status

| 항목 | 결정 | 상태 |
| --- | --- | --- |
| 재고 | API에 추가하지 않음 | 승인됨 |
| NITRO 가격 | 도입·1년 운영비 2,000만 원부터 | 카탈로그 참고값, 권위 가격 아님 |
| Thermal Imaging Module | 500만 원 | Demo |
| Chlorophyll Fluorescence Module | 700만 원 | Demo |
| 관수 옵션 | 점적 관수, 분무경, 저면 관수 | 카탈로그 확인 |
| Depth 옵션 | Lidar, Stereo | 카탈로그 확인 |
| 추가 옵션 | EC/pH 센서, 로드셀 센서, 전력량계, 가습 장치 | 카탈로그 확인 |
| 옵션별 추가 가격 | 아직 결정하지 않음 | TBD |

가격은 DB에 저장되더라도 `Demo`, `Brochure reference`, `Confirmed`를 구분해야 한다. `Demo`와 카탈로그 참고값을 실제 결제 금액처럼 반환하지 않는다.

## Scope

### In scope

- DB repository 결과를 Product domain/service에서 검증하고 API read model로 변환
- 기존 목록·상세 GET endpoint의 응답에 `pricing`과 `optionGroups`를 additive하게 추가
- Product가 존재하지 않을 때 기존 404 응답 유지
- DB 가격과 옵션의 출처 상태를 API 응답에 보존
- API unit, application 또는 e2e test 추가
- API README와 관련 task 문서 갱신

### Out of scope

- `stock`, `stockQuantity`, 품절 상태와 재고 예약
- POST, PATCH, DELETE Product endpoint
- Cart, Quote, Order, Payment API
- 인증과 Customer API
- 실제 옵션 선택 저장
- 옵션별 추가 금액 계산
- 이미지 파일, 로고와 credential 추가
- Web이 API를 호출하도록 변경
- `packages/contracts` 생성

## API contract

### Existing endpoints

```text
GET /api/products
GET /api/products/:productId
```

GET request에는 body가 없으며, `productId`는 기존 path parameter를 사용한다.

### Proposed response shape

기존 필드는 유지하고 다음 두 필드를 추가한다.

```ts
type ProductPricingResponse =
  | {
      mode: "QUOTE_REFERENCE";
      currency: "KRW";
      amountFrom: number;
      displayLabel: string;
      source: "BROCHURE_REFERENCE" | "DEMO" | "CONFIRMED";
      authoritative: false;
    }
  | {
      mode: "FIXED";
      currency: "KRW";
      amount: number;
      displayLabel: string;
      source: "CONFIRMED";
      authoritative: true;
    }

type ProductOptionGroupResponse = {
  id: string;
  label: string;
  selection: "single" | "multiple";
  source: "BROCHURE" | "DB";
  options: readonly {
    id: string;
    label: string;
  }[];
};
```

Product 응답 예시는 다음과 같다.

```json
{
  "id": "nitro",
  "name": "NITRO Plant Growth System",
  "category": "생육·표현형 분석 시스템",
  "description": "...",
  "summary": "...",
  "features": ["..."],
  "mediaLabel": "NITRO",
  "purchaseMode": "QUOTE_REQUIRED",
  "pricing": {
    "mode": "QUOTE_REFERENCE",
    "currency": "KRW",
    "amountFrom": 20000000,
    "displayLabel": "도입·1년 운영비 2,000만 원부터",
    "source": "BROCHURE_REFERENCE",
    "authoritative": false
  },
  "optionGroups": [
    {
      "id": "irrigation",
      "label": "관수",
      "selection": "single",
      "source": "BROCHURE",
      "options": [
        { "id": "drip", "label": "점적 관수" },
        { "id": "mist", "label": "분무경" },
        { "id": "sub-irrigation", "label": "저면 관수" }
      ]
    }
  ]
}
```

`stock`, `stockQuantity`와 재고를 암시하는 필드는 응답에 포함하지 않는다. 옵션별 금액이 확정되기 전에는 `priceDelta`, `additionalAmount`와 같은 필드도 추가하지 않는다.

### Error response

기존 오류 계약을 유지한다.

```http
GET /api/products/unknown-product
```

```json
{
  "message": "Product not found",
  "error": "Not Found",
  "statusCode": 404
}
```

DB 연결 실패와 예기치 않은 repository 오류는 500으로 처리하되, 내부 SQL과 credential은 응답에 노출하지 않는다. 오류 처리 방식은 실제 database task의 Nest 설정과 함께 재검증한다.

## Source of truth boundary

```text
DB schema
→ Product repository
→ NestJS Product domain/service
→ Product API response contract
→ 향후 Next.js UI
```

DB table row를 API 응답으로 직접 반환하지 않는다. DB의 컬럼명, join 구조와 내부 상태값은 repository 또는 service에서 변환한다.

`ProductService`는 다음을 보장한다.

- Product 목록과 상세가 같은 read model shape를 사용한다.
- DB에 없는 Product는 404가 된다.
- `purchaseMode`와 가격 `mode`가 모순되지 않는다.
- `authoritative: false`인 가격은 주문·결제 금액으로 사용되지 않는다.
- 재고 필드가 없어도 API가 정상 응답한다.

## Tests

### Unit tests

- repository 결과가 Product read model로 정확히 매핑되는지 확인
- `QUOTE_REFERENCE`, `FIXED` 가격 union의 필드 조합 확인
- NITRO의 세 옵션 그룹과 옵션 label 확인
- `stock`와 `stockQuantity`가 응답 모델에 포함되지 않는지 확인
- DB row 누락 또는 잘못된 필수값 처리 확인

### Application or e2e tests

- `GET /api/products`가 200과 `items` 배열을 반환하는지 확인
- `GET /api/products/:productId`가 가격과 옵션을 포함하는지 확인
- 알 수 없는 Product가 404와 기존 오류 shape를 반환하는지 확인
- DB 연결 실패 시 내부 정보가 노출되지 않는지 확인
- 기존 health endpoint가 계속 200인지 확인

### Web impact

이번 API 변경은 기존 필드와 endpoint를 유지하는 additive change이므로 현재 Web의 정적 fixture 사용에는 직접 영향이 없다. Web API integration task에서 API 응답을 소비할 때 다음을 별도로 검증한다.

- 정적 Web fixture와 API 응답의 중복 제거
- `source`에 따른 가격 표시
- NITRO 견적 전환과 모듈 Demo 가격 표시
- API에 없는 재고 UI를 만들지 않는지 확인

## Shared contract decision

`packages/contracts`는 이번 task의 선행 조건이 아니다. API 응답 shape가 먼저 안정되어야 하며, Web이 실제 API를 소비하는 integration task에서 다음 조건을 만족할 때 도입한다.

- Web과 API가 같은 TypeScript contract를 실제로 import할 필요가 있다.
- API response와 Web view model을 별도로 두는 비용이 반복된다.
- package boundary와 build order를 문서화할 수 있다.

그 전까지는 API 내부 type과 Web 내부 type을 분리한다.

## Branch and worktree

- Product database 작업이 끝나기 전에는 이 task를 시작하지 않는다.
- API 구현은 백엔드 branch 또는 database 완료 branch에서 진행한다.
- 하나의 worktree에는 Product 가격·옵션 Read API라는 하나의 목표만 둔다.
- 현재 `frontend-develop`의 Web 변경과 `product-database` worktree의 기존 변경을 덮어쓰지 않는다.
- commit 전 `git status`, `git diff`, `git diff --check`를 확인한다.

## Completion criteria

- [ ] Product database task 완료 및 schema·migration 검토
- [ ] API type, repository mapping과 service 구현
- [ ] 목록·상세 endpoint 응답 확장
- [ ] 404, DB 오류와 health endpoint 검증
- [ ] API lint, typecheck, test, build 통과
- [ ] 실제 HTTP 요청으로 응답 필드 확인
- [ ] API README와 task 기록 업데이트
- [ ] Web, DB, dependency와 route의 범위 밖 변경 없음 확인

## Implementation prompt

다음 프롬프트를 Product database 작업이 끝난 뒤 백엔드 작업에 사용한다.

```text
너는 PhytoWorks 프로젝트의 시니어 백엔드 엔지니어다.

Product database 작업이 완료되었으므로, 이 저장소의 tasks/011-product-pricing-options-api.md 명세에 따라 Product Read API를 구현하라.

작업 전 반드시 다음을 수행하라.

1. AGENTS.md와 docs/context/index.md를 읽는다.
2. docs/domain/product.md, docs/domain/cart.md, docs/domain/order.md, docs/domain/payment.md를 읽는다.
3. docs/development/workflow.md, docs/development/git-worktree.md, docs/development/testing-strategy.md를 읽는다.
4. 관련 ADR과 tasks/009-product-database.md, tasks/010-product-pricing-options-ui.md, tasks/011-product-pricing-options-api.md를 읽는다.
5. 현재 branch, worktree 목록, git status, 최근 commit을 확인한다.
6. product-database 작업의 실제 schema, migration, seed, repository와 미커밋 변경을 먼저 확인한다.

반드시 지킬 범위:

- 현재 GET /api/products와 GET /api/products/:productId endpoint 및 기존 응답 필드를 유지한다.
- DB schema를 직접 API 응답으로 노출하지 말고, DB schema → repository → ProductService → API response contract 경계를 지킨다.
- pricing과 optionGroups를 additive response field로 추가한다.
- NITRO 가격은 카탈로그 참고값이며 authoritative가 false인 상태를 유지한다.
- Thermal 500만 원과 Chlorophyll 700만 원은 Demo 값으로만 취급한다.
- 재고, stockQuantity, 품절 상태와 재고 예약은 구현하지 않는다.
- 옵션별 추가 가격과 실제 옵션 선택 저장은 구현하지 않는다.
- Cart, Quote, Order, Payment, 인증과 Web API integration은 구현하지 않는다.
- packages/contracts는 필요성 판단 없이 생성하지 않는다.
- 이미지, 로고, credential과 실제 비밀값을 추가하지 않는다.
- frontend-develop worktree의 변경을 덮어쓰거나 삭제하지 않는다.
- 사용자의 별도 승인 없이 main에 구현하거나 commit하지 않는다.

응답 계약:

- 기존 Product 필드를 유지한다.
- pricing은 QUOTE_REFERENCE 또는 FIXED union을 사용한다.
- optionGroups는 id, label, selection, source, options를 반환한다.
- stock과 stockQuantity는 반환하지 않는다.
- 알 수 없는 Product는 기존 404 shape를 유지한다.
- DB 오류 응답에 SQL, credential과 내부 stack trace를 노출하지 않는다.

구현 절차:

1. DB repository와 현재 ProductService 경계를 분석한다.
2. API 내부 type과 mapping을 추가한다.
3. 목록·상세 endpoint를 확장한다.
4. unit 및 application/e2e test를 추가한다.
5. API README와 task 문서의 Current, Changes, Verification을 갱신한다.
6. API lint, typecheck, test, build와 실제 HTTP 요청을 실행한다.
7. git diff, git diff --check, git status를 검토한다.

완료 보고에는 다음을 포함하라.

- 변경 파일과 각 파일의 역할
- Browser 또는 Web에서 API까지의 요청 경로
- DB schema와 API response가 다른 이유
- 가격 source와 authoritative 처리
- 재고를 제외한 이유
- 실행한 검증 명령과 결과
- 미해결 TBD와 Web integration 후속 작업
```
