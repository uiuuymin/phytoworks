# Task: Shop IA와 UI 구현 방향 기록

## Goal

현재 `apps/web`의 실제 route, 화면 구조와 style 상태를 조사하고, PhytoWorks Shop의 목표 IA, responsive 전략, interaction 우선순위, 최소 design system과 후속 worktree 로드맵을 LLM Wiki에 기록한다.

완료 조건은 다음과 같다.

- Current와 Proposed IA를 섞지 않고 시각화한다.
- 공식 PhytoWorks의 브랜드 표현과 Demo Shop의 변환 원칙을 구분한다.
- Micro interaction을 Must, Should, Could와 Do not implement로 평가한다.
- UI를 먼저 구축할 경계와 기능 개발로 돌아갈 시점을 기록한다.
- domain 문서와 architecture 문서가 새 전략과 충돌하지 않도록 링크와 관련 규칙을 갱신한다.
- 애플리케이션 코드는 수정하지 않는다.

## Context

bootstrap으로 `/` 화면은 실행되지만 실제 구현은 정적 Product 목록 한 화면이다. Product Detail, Cart, Checkout, Payment와 Order status가 구현된 것처럼 가정하면 이후 계획과 task 범위가 잘못된다.

사용자는 UI를 전면 구현하기 전에 현재 IA와 UX/UI 문제를 분석하고, 공식 PhytoWorks의 정체성을 유지한 responsive Shop 방향, interaction 후보와 구현 순서를 먼저 설계하도록 요청했다. 분석 결과가 대화에만 남으면 이후 agent가 같은 조사를 반복하거나 UI를 임의로 확장할 수 있으므로 LLM Wiki의 지속 가능한 원본이 필요하다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/context/company-reference.md`
- `docs/domain/product.md`
- `docs/domain/cart.md`
- `docs/domain/order.md`
- `docs/domain/payment.md`
- `docs/adr/001-use-pnpm-workspace.md`
- `tasks/001-bootstrap-monorepo.md`
- PhytoWorks 한국어 홈페이지: <https://phyto-works.com/ko>
- NITRO 제품 페이지: <https://phyto-works.com/ko/nitro>

## Current State

- 작업 branch는 `uiuuymin/bootstrap`이며 bootstrap 변경은 아직 commit되지 않았다.
- 직접 작성된 Next.js route는 `/` 하나다.
- `apps/web/app`에는 `layout.tsx`와 `page.tsx`만 있다.
- 공통 navigation, Product Detail, Cart, Checkout, Payment result와 Order status route는 없다.
- page 내부 정적 Product 배열을 Server Component가 렌더링하며 API, DB와 client state를 사용하지 않는다.
- project CSS, Tailwind, component directory, image와 responsive breakpoint가 없다.
- 현재 화면은 semantic HTML 구조를 일부 갖췄지만 browser 기본 typography와 spacing을 사용한다.
- 공식 사이트는 NITRO와 연구·분석 기술을 narrative와 문의 중심으로 소개하며 실제 가격과 온라인 직접 판매 조건은 확인되지 않았다.

## Options Considered

### 1. 분석 결과를 이 task에만 기록

- 장점: 새 문서가 적다.
- 단점: 후속 UI task가 task 번호를 모르면 전략을 찾기 어렵고 장기 지식과 실행 기록이 섞인다.

### 2. 모든 내용을 context, architecture와 domain 문서에 분산

- 장점: 새 지식 영역을 만들지 않는다.
- 단점: IA, responsive, interaction과 component 방향이 여러 문서에 중복되고 각 문서의 책임이 흐려진다.

### 3. Design 전략 원본을 만들고 기존 문서는 책임에 맞는 규칙과 링크만 갱신

- 장점: UI/UX 지식의 탐색 경로가 명확하며 context, architecture와 domain의 원래 책임을 유지한다.
- 단점: `docs/design/`이라는 새 지식 위치와 index 관리가 필요하다.

## Plan

Option 3을 선택한다.

이번 작업은 구현 기술을 되돌리기 어려운 방식으로 확정하지 않고 `Proposed` 계획과 문서 탐색 구조를 기록하므로 별도 ADR은 만들지 않는다. CSS 방식, font, icon library와 구체적인 token 값은 실제 UI foundation task에서 후보를 다시 비교한다.

1. `docs/design/shop-ux-strategy.md`를 IA·UI 전략 원본으로 만든다.
2. `docs/context/index.md`, root README와 `AGENTS.md`에 새 지식 위치를 연결한다.
3. `project-overview.md`에 목표 IA와 UI 선행 구축 경계를 요약한다.
4. `architecture-overview.md`에 Current route와 Proposed route 경계를 기록한다.
5. Product와 Cart domain에 판매 방식별 탐색·Cart 진입 규칙을 `Proposed`로 기록한다.
6. 회사 reference에는 브랜드 자산 정책의 design 문서 연결만 추가한다.
7. Markdown link, Current/Proposed 표현, diff와 whitespace를 검토한다.

변경 범위는 LLM Wiki, root README와 이 task로 제한한다. `apps/web`, package 설정, dependency, CSS, image와 runtime 기능은 변경하지 않는다.

## Changes

- `docs/design/shop-ux-strategy.md`를 추가해 Current IA, UX 문제, 목표 IA, 브랜드 변환, responsive, interaction, design system, component와 worktree 로드맵을 한 원본에 기록했다.
- LLM Wiki index와 repository 문서 구조에 `docs/design/` 탐색 경로를 추가했다.
- project와 architecture context에 현재 route 한계와 Proposed Shop route를 연결했다.
- Product와 Cart domain에 `purchaseMode`별 CTA와 Cart 진입 규칙을 `Proposed`로 명시했다.
- 회사 reference에서 design 전략과 brand asset 목록의 책임을 연결했다.
- 사용자가 2026-08-29 초기 기준선의 commit 메시지 `구축: Next.js 웹 기반과 쇼핑몰 설계 기준 정리`를 승인했다.

## Problems Encountered

- 현재 bootstrap이 아직 commit되지 않아 최신 코드와 Wiki를 기반으로 한 별도 child worktree를 깨끗하게 만들 수 없다.
- 첫 `apply_patch`는 존재하지 않는 `docs/design/` 상위 디렉터리를 자동 생성하지 못해 실패했다.
- 첫 Markdown local link 검사 script는 root 파일의 parent 경로를 빈 문자열로 처리하지 못해 오류가 났지만 마지막 성공 문구까지 출력했다. 이 실행은 검증 결과로 사용하지 않았다.

## Resolution

- 사용자가 첫 bootstrap commit 전에 LLM Wiki 정리를 요청한 맥락을 고려해, 코드는 건드리지 않고 현재 bootstrap review bundle의 문서 기준선을 완성하는 범위로 제한했다. 실제 UI 구현은 bootstrap commit 후 각각 별도 worktree에서 수행한다.
- `docs/design/` 디렉터리만 먼저 만든 뒤 동일한 문서 patch를 다시 적용했다.
- link 검사에서 root Markdown의 기준 경로를 repository root로 명시하고, missing link 수가 0이 아닐 때 non-zero exit가 나도록 수정해 다시 실행했다.

## Verification

- 전체 Markdown local link 검사 → 성공, 내부 link 47개 확인, missing 0개
- `git diff --check` → 성공. LF→CRLF 메시지는 Git의 line-ending 안내이며 whitespace 오류가 아님
- tracked와 untracked 변경 파일의 trailing whitespace 검사 → 0건
- 변경 파일과 `apps/web` 비변경 확인 — 이번 작업 시작 시점과 같은 7개 untracked web 파일만 표시됨
- 사용자 commit 승인 후 전체 기준선 검증으로 `pnpm.cmd lint` 재실행 → 성공, Biome가 3개 파일 검사
- 사용자 commit 승인 후 `pnpm.cmd typecheck` 재실행 → 성공, `tsc --noEmit`
- 사용자 commit 승인 후 `pnpm.cmd build` 재실행 → 성공, `/`와 `/_not-found` static page 생성

## Diff Review

- 이번 task는 `AGENTS.md`, root README, context 4개, domain 2개, task 2개와 새 design 전략 문서만 변경했다.
- `apps/web`의 status는 작업 시작 때와 동일한 7개 untracked bootstrap 파일이며 애플리케이션 코드는 수정하지 않았다.
- 전체 worktree status는 bootstrap 변경을 포함해 tracked 10개, untracked 15개다. 이번 task만의 파일 수로 오해하지 않는다.
- Current route와 Proposed route가 별도 section과 status로 구분되었음을 확인했다.
- Wishlist, Orders 목록, 자체 문의 form은 `Deferred`, Admin은 `Excluded`로 기록되어 구현된 기능처럼 표현되지 않는다.
- brand asset을 다운로드하거나 repository에 추가하지 않았으며 사용 권한 확인 전 placeholder 원칙을 유지했다.

## Follow-up

- `ui-foundation` worktree에서 token, typography, container와 focus 구현
- `shop-catalog` worktree에서 SiteHeader, Home 역할 정리와 `/products` 구현
- `product-detail` worktree에서 `/products/[productId]`와 판매 방식별 CTA 구현
- Cart 전에 저장 방식, Product 가격과 API/DB 경계 결정

## Lessons Learned

- IA와 design 전략은 domain 규칙과 다르므로 별도 원본을 두되 context index에서 찾을 수 있어야 한다.
- 화면을 모두 mock으로 만든 뒤 backend 규칙을 맞추는 것보다, Catalog와 Product Detail까지만 UI 기준을 세우고 Cart부터 vertical slice로 구현하는 편이 재작업이 적다.
- Current route와 Proposed route를 같은 tree에 섞지 않아야 구현된 기능을 과장하지 않는다.
