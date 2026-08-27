# LLM Wiki Index

이 문서는 프로젝트 지식의 진입점이다. 세부 내용을 이곳에 복사하지 않고, 작업 종류에 맞는 원본 문서로 안내한다.

## 프로젝트 전체를 이해할 때

- [`project-overview.md`](./project-overview.md) — 프로젝트 목적, 목표 기술, 예정 기능과 현재 단계를 처음 파악할 때 읽는다.
- [`architecture-overview.md`](./architecture-overview.md) — 현재 상태와 Proposed 시스템 경계·데이터 흐름을 파악할 때 읽는다.
- [`../domain/glossary.md`](../domain/glossary.md) — 프로젝트에서 사용하는 주요 domain 용어와 후보 상태값을 확인할 때 읽는다.

## 상품 작업 시

- [`../domain/product.md`](../domain/product.md) — Product의 의미, 가격·재고·활성 상태 규칙을 다룰 때 읽는다.
- [`../domain/glossary.md`](../domain/glossary.md) — 상품과 연관된 공통 용어의 의미를 맞출 때 읽는다.

## 장바구니 작업 시

- [`../domain/cart.md`](../domain/cart.md) — Cart, CartItem, 수량과 합계 규칙을 설계하거나 변경할 때 읽는다.
- [`../domain/product.md`](../domain/product.md) — 장바구니에 담을 수 있는 상품과 가격·재고 규칙을 함께 확인할 때 읽는다.

## 주문 작업 시

- [`../domain/order.md`](../domain/order.md) — 주문 생성 시점, 금액, 상품 snapshot과 상태 전이를 다룰 때 읽는다.
- [`../domain/cart.md`](../domain/cart.md) — 장바구니에서 주문으로 넘어가는 입력 규칙을 확인할 때 읽는다.
- [`../domain/payment.md`](../domain/payment.md) — 주문 상태와 결제 상태의 관계를 함께 변경할 때 읽는다.

## 결제 작업 시

- [`../domain/payment.md`](../domain/payment.md) — Toss Payments 인증·서버 승인·실패 처리와 비밀키 경계를 다룰 때 읽는다.
- [`../domain/order.md`](../domain/order.md) — 결제 결과가 주문에 미치는 영향을 확인할 때 읽는다.

## DB 작업 시

- [`architecture-overview.md`](./architecture-overview.md) — PostgreSQL의 시스템 경계와 Proposed monorepo 책임을 확인할 때 읽는다.
- [`../domain/product.md`](../domain/product.md), [`../domain/cart.md`](../domain/cart.md), [`../domain/order.md`](../domain/order.md), [`../domain/payment.md`](../domain/payment.md) — 저장 대상과 규칙을 정하기 전에 관련 domain 원본을 읽는다.
- [`../adr/README.md`](../adr/README.md) — ORM, schema ownership 또는 migration처럼 장기 영향이 있는 DB 결정을 기록할 때 읽는다.

## 배포 작업 시

- [`project-overview.md`](./project-overview.md) — Vercel 배포 목표와 비기능 목표를 확인할 때 읽는다.
- [`architecture-overview.md`](./architecture-overview.md) — web, API와 DB의 배포 경계 중 TBD인 사항을 확인할 때 읽는다.
- [`../adr/README.md`](../adr/README.md) — 배포 구조를 확정하기 전에 결정 기록이 필요한지 판단할 때 읽는다.

## 개발 workflow 관련

- [`../development/workflow.md`](../development/workflow.md) — 새 작업을 시작해서 병합하기까지의 전체 순서를 따를 때 읽는다.
- [`../development/git-worktree.md`](../development/git-worktree.md) — branch, worktree와 Orca의 관계를 확인할 때 읽는다.
- [`../development/testing-strategy.md`](../development/testing-strategy.md) — 변경에 필요한 검증 계층을 고를 때 읽는다.
- [`../adr/README.md`](../adr/README.md) — 중요한 기술·설계 결정을 남길지 판단할 때 읽는다.
- [`../../tasks/README.md`](../../tasks/README.md) — 개별 작업 문서를 생성하고 갱신할 때 읽는다.
- [`../retrospectives/README.md`](../retrospectives/README.md) — 여러 작업에서 얻은 workflow 개선점을 정리할 때 읽는다.
