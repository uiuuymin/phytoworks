# Domain Glossary

이 문서는 코드 이름보다 먼저 서비스 용어의 의미를 맞추기 위한 사전이다. 상태와 식별자 모델은 아직 구현 전이므로 확정되지 않은 항목에 `Proposed` 또는 `TBD`를 표시한다.

| 용어 | 의미 | 상태 및 주의사항 |
| --- | --- | --- |
| **Product** | 연구·육종용 생육 시스템, 이미징 모듈, 환경·관수 옵션 또는 분석 서비스 | `Proposed` — 공식 제품 맥락과 Demo 판매 조건을 구분 |
| **PurchaseMode** | Product가 직접 구매 대상인지 견적 문의 대상인지 나타내는 구분 | `Proposed` — `DIRECT_PURCHASE`, `QUOTE_REQUIRED` 후보 |
| **Demo Price** | 결제 흐름 학습을 위해 프로젝트가 만든 가상 가격 | 실제 PhytoWorks 판매 가격이나 정책으로 표현하지 않음 |
| **Cart** | 고객이 주문 전에 구매 후보를 모아 두는 장바구니 | `Proposed` — 저장 위치와 소유 방식은 TBD |
| **CartItem** | Cart 안의 특정 Product와 요청 수량을 나타내는 항목 | `Proposed` — 담을 때의 가격 보존 여부는 TBD |
| **Order** | 고객이 구매 의사를 확정해 서버가 관리하는 거래 단위 | `Proposed` — 정확한 생성 시점과 상태 모델은 TBD |
| **OrderItem** | 주문 시점의 상품, 단가와 수량을 보존하는 주문 항목 | `Proposed` — Product의 현재 값이 바뀌어도 과거 주문을 설명할 수 있는 snapshot을 고려 |
| **Payment** | 특정 Order의 금액을 외부 결제 서비스로 지불하려는 시도와 결과 | `Proposed` — 한 Order에 여러 시도를 허용할지는 TBD |
| **Customer** | 장바구니·주문·결제의 주체가 되는 연구자, 기관 담당자 또는 식별 가능한 방문자 | `TBD` — 소속 기관 정보, 로그인·비회원·세션 범위는 아직 결정하지 않음 |
| **orderId** | 상점 시스템이 주문 또는 결제 대상을 구별하기 위해 사용하는 고유 식별자 | `Proposed` — 생성 형식과 외부 노출 정책은 TBD. Toss 연동 시 공식 요구사항 재확인 필요 |
| **paymentKey** | Toss Payments의 결제 인증 결과를 서버 승인 요청과 연결하는 결제 식별 값 | 외부 서비스 용어. 저장·노출·재사용 규칙은 공식 문서와 구현 task에서 재검증 |
| **customerKey** | 결제 서비스에서 같은 고객을 구별하기 위해 사용하는 고객 식별 값 | 외부 서비스 용어. 생성 방식, 개인정보 영향과 비회원 처리 방식은 TBD |
| **PENDING** | 아직 다음 결과가 확정되지 않은 상태 | `Proposed` Order 상태 후보. 정확한 진입·종료 조건은 TBD |
| **PAID** | 서버 승인이 성공해 주문이 결제 완료로 간주되는 상태 | `Proposed` Order 상태 후보. Payment 상태와 같은 개념으로 사용하지 않음 |
| **FAILED** | 처리 시도가 실패해 성공 결과를 만들지 못한 상태 | `Proposed` Payment 상태 후보. Order에도 사용할지는 TBD |
| **CANCELLED** | 더 이상 진행하지 않도록 취소된 상태 | `Proposed` Order 상태 후보. 결제 후 취소·환불과 같은지 여부는 TBD |
| **READY** | 결제 시도가 준비되었지만 승인 완료되지 않은 상태 | `Proposed` Payment 상태 후보 |
| **DONE** | 결제 서버 승인이 완료된 상태 | `Proposed` Payment 상태 후보. 실제 Toss 상태값과 mapping은 연동 시 재검증 |

같은 상태 이름도 Order와 Payment에서 의미가 다를 수 있다. 구현할 때는 어느 aggregate의 상태인지 명확히 표현하고, 이 문서와 해당 domain 문서를 함께 갱신한다.
