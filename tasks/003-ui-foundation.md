# Task: CSS foundation 선택과 구현

**Status:** 구현 완료

## Goal

PhytoWorks Shop의 후속 화면이 같은 시각 언어와 responsive 기준을 사용하도록 최소 CSS foundation을 정하고 `apps/web`에 구현한다.

이번 task의 완료 조건은 다음과 같다.

- Next.js App Router에서 전역 CSS를 한 번만 불러오는 위치를 확정하고 적용한다.
- color, typography, spacing, radius, layout과 motion 값을 CSS custom property로 정의한다.
- browser 기본값 차이를 줄이는 작은 reset과 전역 body·text·link 기준을 만든다.
- Mobile, Tablet과 Desktop에서 재사용할 responsive container를 만든다.
- keyboard 사용자가 확인할 수 있는 공통 `:focus-visible` 표현을 적용한다.
- `prefers-reduced-motion: reduce`에서 불필요한 transition과 animation을 제거할 수 있는 기준을 만든다.
- 현재 `/` 화면에 foundation을 연결해 token과 container가 실제 markup에서 작동하는지 확인한다.
- lint, typecheck, production build, contrast와 375px·768px·1280px 수동 검증을 완료한다.

## Context

현재 `apps/web`은 `layout.tsx`와 `page.tsx`만 있으며 project CSS, CSS framework, component stylesheet와 breakpoint가 없다. `/` 화면은 semantic HTML을 사용하지만 browser 기본 typography와 spacing으로 렌더링된다.

후속 Catalog와 Product Detail을 바로 꾸미면 화면마다 색상, 간격, focus와 container 기준이 달라질 수 있다. 반대로 지금부터 완성형 component library나 모든 상태 token을 만들면 실제 사용처 없이 추상화를 먼저 설계하게 된다. 따라서 여러 화면에서 즉시 공유할 전역 규칙만 이번 task에서 만들고, component별 CSS는 해당 component를 처음 사용하는 task에서 추가한다.

## Relevant Knowledge

- `AGENTS.md`
- `docs/context/index.md`
- `docs/context/project-overview.md`
- `docs/context/architecture-overview.md`
- `docs/context/company-reference.md`
- `docs/design/shop-ux-strategy.md`
- `docs/domain/product.md`
- `docs/domain/cart.md`
- `docs/adr/001-use-pnpm-workspace.md`
- `tasks/001-bootstrap-monorepo.md`
- `tasks/002-plan-shop-ia-ui.md`
- Next.js 공식 CSS 문서: <https://nextjs.org/docs/app/getting-started/css>
- Next.js 공식 Font 문서: <https://nextjs.org/docs/app/api-reference/components/font>
- WCAG 2.2 Contrast Minimum 설명: <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>
- MDN `prefers-reduced-motion`: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion>

## Current State

- 작업 branch는 `uiuuymin/ui-foundation`이며 기준 commit은 `95d9357`이다.
- `apps/web`은 Next.js 16.3.3 App Router와 React 19.2.8을 사용한다.
- `apps/web/app/layout.tsx`는 metadata와 `lang="ko"`만 설정하며 stylesheet를 import하지 않는다.
- `apps/web/app/page.tsx`는 정적 Product 배열을 semantic HTML로 렌더링하고 `className`을 사용하지 않는다.
- Tailwind, Sass, CSS-in-JS, PostCSS plugin, UI library, icon library와 font package가 설치되어 있지 않다.
- Next.js 공식 문서는 root layout에서 전역 CSS를 import하고 component별 custom style에는 CSS Modules를 사용할 수 있다고 안내한다.
- PhytoWorks 공식 사이트의 dark background, 밝은 본문과 넓은 여백은 참고할 수 있지만 정확한 brand token과 font 사용 권한은 확인되지 않았다.
- 지원 browser 범위와 정식 WCAG 적합 수준은 아직 `TBD`다. 이번 task에서는 후속 화면이 접근성을 해치지 않도록 기본선을 세운다.

## Options Considered

### CSS 작성 방식

#### 1. Native CSS와 전역 stylesheet만 사용

- 장점: dependency와 설정이 늘지 않으며 CSS의 cascade, custom property와 media query를 직접 학습할 수 있다.
- 단점: 화면별 규칙까지 모두 전역에 두면 selector 충돌과 사용하지 않는 style이 늘어날 수 있다.

#### 2. 전역 native CSS와 component별 CSS Modules를 함께 사용

- 장점: token·reset·body·focus처럼 실제 전역인 규칙과 component 내부 규칙의 책임이 명확하다. Next.js가 기본 지원하므로 dependency가 필요 없고 Server Component에서도 사용할 수 있다.
- 단점: JSX의 class와 별도 CSS 파일을 함께 이동해야 하며 반복 utility를 무분별하게 만들면 추적이 어려워질 수 있다.

#### 3. Tailwind CSS 4를 설치

- 장점: spacing과 responsive utility를 빠르게 조합할 수 있고 JSX만 보고 요소별 style을 파악하기 쉽다.
- 단점: PostCSS와 새 dependency가 추가되며 현재 작은 화면에서 utility 체계가 해결하는 반복 문제가 아직 확인되지 않았다. CSS 자체를 이해하려는 학습 목표에서 token, cascade와 selector 설계가 감춰질 수 있다.

#### 4. Sass, CSS-in-JS 또는 UI component library를 도입

- 장점: Sass의 문법 기능, runtime theme 또는 완성된 component를 사용할 수 있다.
- 단점: 현재 CSS 요구에는 native CSS로 대체할 수 없는 기능이 없다. 특히 CSS-in-JS는 App Router의 Server Component와 streaming에서 library별 설정과 client boundary를 추가한다.

### Token 구조

#### 1. 필요한 곳에 literal 값을 직접 작성

- 장점: 첫 파일은 짧다.
- 단점: 색상과 간격을 바꿀 때 사용처를 모두 찾아야 하며 화면 간 일관성을 검토하기 어렵다.

#### 2. 작은 semantic token만 정의

- 장점: `background`, `surface`, `text`, `border`, `action`, `focus`처럼 사용 목적이 이름에 드러난다. 현재 규모에서 primitive palette와 alias를 이중으로 유지하지 않아도 된다.
- 단점: theme나 브랜드 변형이 늘면 primitive token 계층을 나중에 추가해야 할 수 있다.

#### 3. primitive palette와 semantic alias를 처음부터 분리

- 장점: 여러 theme와 브랜드 변형에 대응하기 쉽다.
- 단점: 현재는 theme 하나뿐이어서 같은 값을 가리키는 token이 늘고 실제 필요보다 구조가 앞선다.

### Font 적용 방식

#### 1. System font stack 사용

- 장점: download, license 확인, build-time network와 layout shift 위험이 없다. 한국어 glyph를 운영체제의 검증된 글꼴로 표시한다.
- 단점: 운영체제마다 글자 폭과 인상이 조금 다르며 공식 사이트와 완전히 같은 typography를 보장하지 않는다.

#### 2. `next/font`로 Google font 또는 승인된 local font 사용

- 장점: Next.js가 font를 self-host하고 layout shift를 줄이는 최적화를 제공한다.
- 단점: 한국어 font 선택, weight 범위, license와 bundle 크기를 먼저 결정해야 한다. 승인된 PhytoWorks font 파일도 현재 없다.

### Theme 범위

#### 1. Dark theme 하나를 기본으로 사용

- 장점: 조사한 PhytoWorks의 시각적 방향과 맞으며 한 palette의 contrast와 상태를 충분히 검증할 수 있다.
- 단점: 사용자 선택형 light theme를 제공하지 않는다.

#### 2. `prefers-color-scheme`에 따라 dark와 light theme 제공

- 장점: 운영체제 설정을 따른다.
- 단점: 두 palette와 모든 component 상태를 동시에 검증해야 하며 공식 Demo의 기본 시각 방향이 기기마다 달라진다.

#### 3. Theme toggle 제공

- 장점: 사용자가 직접 화면을 선택할 수 있다.
- 단점: toggle UI, client state, 초기 rendering과 저장 정책이 추가되어 CSS foundation의 범위를 벗어난다.

## Decision

CSS 작성 방식은 Option 2인 **전역 native CSS와 component별 CSS Modules의 조합**을 선택한다.

- `app/globals.css`에는 token, 작은 reset, 전역 typography, body·link·focus, motion preference와 responsive container처럼 모든 route가 공유하는 규칙만 둔다.
- component style은 component를 처음 구현하는 task에서 `<component>.module.css`로 함께 만든다.
- Tailwind, Sass, CSS-in-JS와 UI library는 현재 도입하지 않는다. 화면이 늘면서 native CSS의 반복이나 유지 비용이 실제 문제로 확인되면 별도 task에서 다시 비교한다.

Token은 Option 2인 **작은 semantic token**부터 시작한다.

- 색상: `canvas`, `surface`, `surface-raised`, `text`, `text-muted`, `border`, `action`, `action-hover`, `on-action`, `focus`
- typography: font family, 14·16·18·24·36·48px에 대응하는 `rem` scale, font weight와 line-height
- spacing: 4·8·12·16·24·32·48·64·80px에 대응하는 `rem` scale
- radius: small, medium과 large
- layout: 1280px max-width와 viewport별 gutter
- motion: 120ms, 180ms와 240ms duration 및 표준 easing

Success, warning, danger, shadow와 z-index token은 실제 상태 component나 겹침 구조가 생길 때 정의한다. 사용처가 없는 값을 미리 늘리지 않는다. Component CSS에서는 합의한 token이 있는 값을 literal로 반복하지 않는다.

Font는 Option 1인 **system font stack**을 선택한다. 기본 후보는 `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `"Noto Sans KR"`, `"Apple SD Gothic Neo"`, `"Malgun Gothic"`, `sans-serif` 순서다. 승인된 font와 실제 성능 요구가 생기면 `next/font/local` 또는 `next/font/google`을 별도 task에서 검토한다.

Theme은 Option 1인 **dark theme 하나**를 선택한다. 정확한 색상 값은 공식 brand color라고 표현하지 않고 Demo Shop palette로 기록하며, 구현할 때 실제 인접 색상 조합의 contrast를 계산한 뒤 확정한다. Theme 전환은 semantic token 구조를 유지해 미래 변경 가능성만 남기고 이번에는 구현하지 않는다.

## Scope

### 포함하는 범위

- `apps/web/app/globals.css` 생성과 root layout import
- 제한된 reset: `box-sizing`, 기본 margin, image 크기, form font 상속과 text wrapping
- dark canvas, 기본 text와 selection을 포함한 전역 body 기준
- heading, paragraph와 link의 전역 기본값
- semantic CSS custom property
- `.container`와 소수의 전역 layout helper
- Mobile 16px, Tablet 24px, Desktop 32px gutter와 1280px max-width
- 640px와 1024px breakpoint
- 모든 interactive element에 적용할 `:focus-visible` outline
- `prefers-reduced-motion: reduce` 대응
- 현재 `/`의 정보 구조를 바꾸지 않는 최소 class 연결
- text contrast 4.5:1 이상, 큰 text 3:1 이상을 목표로 한 palette 검증

### 포함하지 않는 범위

- SiteHeader, SiteFooter와 navigation
- ProductCard, ProductGrid, Button, Badge, Input, Toast, Modal과 form abstraction
- Home content 재구성, `/products`와 다른 route 추가
- 실제 logo, Product image, icon과 illustration
- Tailwind, Sass, PostCSS plugin, CSS-in-JS, UI library와 motion library
- Google font download, local font file와 font package
- light theme, theme toggle와 사용자 theme 저장
- status별 success·warning·danger palette
- API, database, client state와 domain model 변경
- `src/` 이동, package 분리와 범용 design system package 생성
- 장식 animation, section reveal과 image hover interaction
- 지원 browser 범위 확정과 전체 WCAG conformance audit

`Button`은 foundation token을 실제 CTA에 적용할 수 있는 Catalog task에서 처음 구현한다. 사용처가 없는 component와 variant를 먼저 만들지 않으며, 그 task에서 button과 link의 semantic 차이, loading·disabled 상태와 variant 수를 다시 결정한다.

## Plan

1. `app/globals.css`를 만들고 root layout에서 한 번 import한다.
2. semantic color 값을 contrast 계산과 함께 확정한다. 색상은 공식 PhytoWorks brand 값이 아니라 Demo palette임을 이 task에 기록한다.
3. reset, system font stack, type scale, spacing, radius, motion과 global element 기준을 작성한다.
4. mobile-first `.container`를 만들고 640px와 1024px media query에서 gutter만 확장한다.
5. `:focus-visible`과 `prefers-reduced-motion` 기준을 추가한다.
6. 현재 `/`의 semantic structure와 문구를 유지하면서 container와 최소 layout class만 연결한다.
7. lint, typecheck와 production build를 실행한다.
8. 375px, 768px와 1280px에서 overflow, 읽기 폭과 gutter를 확인한다.
9. keyboard focus, 200% text zoom, reduced motion과 주요 color pair의 contrast를 수동 검증한다.
10. 실제 변경, 시행착오, 검증 결과와 diff 검토를 이 task와 design 원본에 갱신한다.

주요 변경 파일은 `apps/web/app/globals.css`, `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, 관련 context·design 문서와 이 task다. Dependency, route, domain 문서와 ADR은 변경하지 않는다. 검증 과정에서 Windows checkout의 formatter 재현성 문제가 확인되면 `apps/web/biome.json`만 추가로 조정할 수 있다.

이 선택은 dependency가 없는 가역적인 UI 구현 규칙이며 현재 `apps/web` 한 곳에만 적용된다. 따라서 별도 ADR은 만들지 않는다. 여러 application이나 package가 같은 token을 공유하게 되거나 CSS framework 전환 비용이 커질 때 ADR 필요성을 다시 평가한다.

## Changes

- `tasks/003-ui-foundation.md`를 추가해 CSS 방식, token 구조, font, theme, 포함 범위와 제외 범위를 확정했다.
- `apps/web/app/globals.css`에 Demo dark palette, system font, type·spacing·radius·motion token, 작은 reset과 전역 element 기준을 추가했다.
- `.container`는 1280px max-width를 사용하고 viewport가 375px·768px·1280px일 때 각각 16px·24px·32px gutter를 적용한다.
- `.flow`와 `.page-layout` helper로 현재 Home의 정보 구조를 바꾸지 않고 spacing과 container를 연결했다.
- 전역 link hover, 3px `:focus-visible` outline, selection과 `prefers-reduced-motion` 기준을 추가했다.
- `layout.tsx`에서 전역 CSS를 import하고 `children`을 `ReactNode`로 직접 선언해 `.next` 생성물 없이도 typecheck가 통과하게 했다.
- `apps/web/biome.json`의 `lineEnding`을 `auto`로 지정해 Windows의 CRLF checkout에서도 formatter 검증을 재현할 수 있게 했다.
- `docs/context/project-overview.md`, `docs/context/architecture-overview.md`와 `docs/design/shop-ux-strategy.md`를 실제 구현 상태에 맞춰 갱신했다.
- Package와 dependency, route, Product data, 문구와 semantic element 구조는 변경하지 않았다.

## Problems Encountered

- 이 worktree에 `node_modules`가 없어 lint와 typecheck의 첫 병렬 실행이 각각 dependency 복원을 시작했다. 같은 virtual store에 대한 download가 겹쳐 Next.js package가 재시도되었고 두 검증이 실패했다.
- Biome가 reduced-motion 규칙의 네 `!important`와 새 CSS의 format을 거부했다.
- 깨끗한 worktree에는 `.next/types`가 없어 기존 `LayoutProps<"/">` 전역 타입을 찾지 못했다.
- Git의 Windows checkout은 기존 source를 CRLF로 만들지만 Biome의 기본 formatter는 LF를 요구해, 논리적으로 변경하지 않은 `next.config.ts`까지 format 오류와 수정 상태로 표시되었다.
- 375px headless Edge screenshot은 browser 자체의 504px 최소 viewport를 375px image로 잘라 저장해 실제 mobile layout처럼 사용할 수 없었다.
- 200% text 확대에서 `html`의 `min-width: 20rem`도 640px로 확대되어 375px viewport에 horizontal overflow가 발생했다.
- Next.js 개발 서버가 `apps/web/AGENTS.md`와 `apps/web/CLAUDE.md`를 자동 생성했고, 실패한 진단용 shell 명령이 `{const` 임시 파일을 만들었다.
- Orca computer-use runtime은 browser 창을 읽은 뒤 focus action 과정에서 연결을 종료했다.

## Resolution

- Dependency 복원이 끝난 뒤 `pnpm.cmd install --offline`으로 link 상태를 정리하고 검증 명령을 순차적으로 다시 실행했다. Lockfile과 dependency 선언은 바뀌지 않았다.
- `!important` 대신 reduced-motion media query가 세 duration token을 `0.01ms`로 재정의하게 했다. Component가 motion token을 사용하면 cascade를 뒤집지 않고 같은 preference를 따른다.
- Root layout은 Next.js가 build 때 생성하는 helper 대신 React의 `ReactNode`를 직접 사용하게 했다.
- Biome formatter의 `lineEnding`을 `auto`로 지정하고 source를 platform line ending으로 정규화했다. `next.config.ts`의 content hash가 HEAD와 같고 최종 status에서 사라진 것을 확인했다.
- Chrome DevTools Protocol의 `Emulation.setDeviceMetricsOverride`로 실제 375px·768px·1280px viewport를 만들고 client width, scroll width와 container rect를 직접 읽었다.
- `html`의 불필요한 minimum width를 제거했다. 200% text 확대 후에도 375px viewport의 document와 body scroll width가 375px임을 다시 확인했다.
- 작업 시작 때 없었던 자동 생성 파일 세 개만 제거하고 개발 서버와 headless browser process를 종료했다.
- Desktop runtime을 반복 조작하지 않고 별도 profile의 headless Edge와 DevTools protocol로 responsive, focus와 reduced-motion을 검증했다.

## Verification

- `pnpm.cmd lint` → 성공, Biome가 `app`과 `next.config.ts`의 4개 파일 검사
- `pnpm.cmd typecheck` → 성공, `.next/types`가 없는 상태에서도 `tsc --noEmit` 통과
- `pnpm.cmd build` → 성공, `/`와 `/_not-found` static page 생성
- 주요 color contrast 계산:
  - text/canvas 17.89:1, muted/canvas 9.08:1
  - text/surface 16.69:1, muted/surface 8.47:1
  - action/canvas 14.66:1, on-action/action 14.42:1
  - focus/canvas 16.94:1, border/canvas 3.24:1, border/surface 3.02:1
- Browser viewport 계산:
  - 375px → document scroll width 375px, container `left 16 / width 343 / right 359`
  - 768px → document scroll width 768px, container `left 24 / width 720 / right 744`
  - 1280px → document scroll width 1280px, container `left 32 / width 1216 / right 1248`
- Link focus → active element `A`, outline `#d7ff72 solid 3px`, offset 3px
- `prefers-reduced-motion: reduce` → link transition duration `0.01ms`, document scroll behavior `auto`
- 375px에서 root font를 200%인 32px로 확대 → document와 body scroll width 375px, container `left 32 / width 311 / right 343`
- Headless Edge screenshot으로 dark palette, typography, line wrapping과 viewport별 gutter를 확인했다. DevTools protocol 값으로 screenshot crop과 실제 overflow를 구분했다.
- 전체 Markdown local link 검사 → 내부 link 49개 확인, missing 0개
- 변경한 source·config·문서의 trailing whitespace 검사 → 0건
- `git diff --check` → 성공. Markdown의 LF→CRLF 메시지는 Git line-ending 안내이며 whitespace 오류가 아니다.
- 최종 status → 의도한 runtime 4개와 context·design 문서 3개 수정, 새 `globals.css`와 이 task 추가만 확인

## Diff Review

- Runtime 변경은 `globals.css`, root layout, Home의 class 연결과 Windows formatter 재현성 설정으로 제한했다.
- `page.tsx`의 Product data, 문구, heading hierarchy와 element 구조는 바꾸지 않았다.
- Tailwind, font와 다른 dependency를 추가하지 않았고 package·lockfile도 변경하지 않았다.
- SiteHeader, ProductCard, Button, 새 route와 status token은 diff에 없다.
- 개발 서버가 만든 agent rule 파일과 진단 임시 파일은 최종 diff에 남지 않았다.
- 사용자가 VS Code에서 특히 확인할 부분은 `globals.css`의 token·reset·media query, `layout.tsx`의 import·타입 경계와 `page.tsx`의 최소 class 연결이다.

## Follow-up

- Catalog task에서 SiteHeader, navigation, Button과 LinkButton 계약, `/products`, ProductCard와 ProductGrid 구현
- Product Detail task에서 gallery, 판매 방식별 CTA와 responsive 2열 구조 구현
- 승인된 font 또는 brand asset이 생길 때 license, bundle과 `next/font` 적용 방식 검토
- status feedback이 처음 필요할 때 success, warning과 danger token 정의
- native CSS의 반복이나 selector 관리가 실제 문제가 될 때 Tailwind 또는 다른 styling 방식 재평가

## Lessons Learned

- 실제로 모든 route가 공유하는 규칙과 component가 소유해야 하는 규칙을 먼저 구분하면 전역 CSS가 화면별 style 저장소로 커지는 일을 막을 수 있다.
- CSS framework는 가능한 선택지라는 이유만으로 설치하지 않고, 현재 문제와 학습 목표를 기준으로 도입 비용을 비교해야 한다.
- 브랜드 참고 자료와 구현 palette는 구분해야 한다. 공개 사이트의 인상을 참고하더라도 정확한 brand color나 font라고 단정하지 않는다.
- Root font에 의존하는 `rem`은 typography와 spacing에는 유용하지만 viewport minimum처럼 text 확대와 함께 커지면 안 되는 제약에는 신중하게 사용해야 한다.
- Screenshot 크기가 곧 CSS viewport 크기라는 보장은 없다. Browser가 가진 minimum window나 device emulation을 확인하고 `innerWidth`, `clientWidth`와 `scrollWidth`를 함께 읽어야 한다.
- Generated type에 의존하는 source는 build 뒤에는 통과해도 깨끗한 checkout의 독립 typecheck에서 실패할 수 있다.
