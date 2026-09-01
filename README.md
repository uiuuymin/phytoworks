# PhytoWorks Shop

PhytoWorks의 식물 연구·육종용 생육 시스템, 이미징 모듈과 분석 서비스에서 맥락을 가져온 학습용 B2B 쇼핑몰입니다. 웹서비스 기술 스택과 AI-assisted development workflow를 익히는 것이 목적이며, 화면의 가격과 판매 조건은 실제 회사 정책이 아닌 Demo로 구분합니다.

## 학습 목표

- TypeScript 7, Next.js 16과 NestJS의 역할과 연결 방식 이해
- pnpm workspace 기반 monorepo, PostgreSQL과 Docker 경험
- Toss Payments 테스트 결제와 Vercel 배포 흐름 학습
- Git, Git worktree, Orca와 Codex를 이용한 격리된 작업 방식 실습
- LLM Wiki를 통한 프로젝트 맥락·결정·시행착오 관리

## 목표 기술 스택

| 영역 | 목표 기술 |
| --- | --- |
| 언어 | TypeScript 7 |
| 웹 | Next.js 16 |
| API | NestJS |
| 패키지 관리 | pnpm workspace monorepo |
| 데이터베이스 | PostgreSQL |
| 개발 환경 | Docker |
| 결제 실습 | Toss Payments 테스트 환경 |
| 배포 | Vercel |
| 작업 도구 | Git, Git worktree, Orca, VS Code, Codex |

## 현재 상태

현재는 Next.js Web, NestJS API, PostgreSQL 기반 Cart·Order·Payment Demo가 연결된 단계입니다. Web과 API의 배포 환경변수 및 PostgreSQL 운영 위치는 배포 대상에 맞게 설정해야 합니다.

```bash
pnpm install
pnpm dev
```

브라우저에서 <http://localhost:3000>을 엽니다. PowerShell 실행 정책이 npm의 `pnpm.ps1`을 차단하는 Windows 환경에서는 같은 명령을 `pnpm.cmd dev`로 실행할 수 있습니다.

## 저장소 구조

```text
apps/web/             Next.js 사용자 애플리케이션
docs/context/          프로젝트 맥락과 Wiki 진입점
docs/domain/           서비스 용어와 비즈니스 규칙
docs/design/           IA, UX/UI, responsive와 interaction 전략
docs/adr/              중요한 기술·설계 결정
docs/development/      개발, worktree와 테스트 workflow
docs/retrospectives/   여러 작업에서 얻은 과정 개선점
tasks/                 개별 작업의 계획과 실행 기록
package.json           workspace 공통 명령
pnpm-workspace.yaml    workspace package 범위와 pnpm 설정
```

## 검증 명령

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## 개발 workflow 요약

각 기능은 Orca에서 별도의 Git worktree를 만든 뒤, 관련 문서 확인 → 현재 상태 조사 → task와 계획 작성 → 구현 → 테스트 → VS Code 및 diff 검토 → 지식 문서 업데이트 → commit → 검토 후 `main` 병합 순서로 진행합니다.

- LLM Wiki 시작 위치: [`docs/context/index.md`](docs/context/index.md)
- 회사·제품 기준 자료: [`docs/context/company-reference.md`](docs/context/company-reference.md)
- Shop IA·UI 전략: [`docs/design/shop-ux-strategy.md`](docs/design/shop-ux-strategy.md)
- AI agent 최상위 규칙: [`AGENTS.md`](AGENTS.md)
