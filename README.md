# PhytoWorks Shop

식물·농업 관련 상품을 판매하는 데모 쇼핑몰을 만들면서 웹서비스 기술 스택과 AI-assisted development workflow를 학습하는 프로젝트입니다. 결과물을 빠르게 완성하는 것보다 기술을 연결하고, 선택 이유와 시행착오를 기록하며, 사람이 직접 검토하는 과정을 중요하게 봅니다.

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

현재는 **문서와 LLM Wiki 기반을 구축한 초기 단계**입니다. Next.js/NestJS 애플리케이션, workspace, 데이터베이스, Docker, 결제와 배포 설정은 아직 생성하지 않았습니다. 따라서 현재 실행 명령도 없습니다.

## 저장소 구조

```text
docs/context/          프로젝트 맥락과 Wiki 진입점
docs/domain/           서비스 용어와 비즈니스 규칙
docs/adr/              중요한 기술·설계 결정
docs/development/      개발, worktree와 테스트 workflow
docs/retrospectives/   여러 작업에서 얻은 과정 개선점
tasks/                 개별 작업의 계획과 실행 기록
```

## 개발 workflow 요약

각 기능은 Orca에서 별도의 Git worktree를 만든 뒤, 관련 문서 확인 → 현재 상태 조사 → task와 계획 작성 → 구현 → 테스트 → VS Code 및 diff 검토 → 지식 문서 업데이트 → commit → 검토 후 `main` 병합 순서로 진행합니다.

- LLM Wiki 시작 위치: [`docs/context/index.md`](docs/context/index.md)
- AI agent 최상위 규칙: [`AGENTS.md`](AGENTS.md)
