# Project Overview

## 프로젝트 정체성

- **프로젝트명:** PhytoWorks Shop
- **목적:** 웹서비스 개발 기술 스택과 AI-assisted development workflow 학습
- **결과물:** 식물·농업 관련 상품을 판매하는 데모 쇼핑몰
- **우선순위:** 결과물의 완성도나 출시 속도보다 기술을 이해하고, 선택 이유·검증 결과·시행착오를 기록하는 과정을 우선한다.

## 목표 기술 스택

아래 항목은 프로젝트가 학습 대상으로 정한 **목표 기술**이다. 아직 애플리케이션이 생성되지 않았으므로 실제 설치 버전과 세부 구성은 구현 task에서 확인하고 기록해야 한다.

| 영역 | 목표 기술 | 현재 상태 |
| --- | --- | --- |
| 언어 | TypeScript 7 | Proposed — 미설치 |
| 웹 | Next.js 16 | Proposed — 미생성 |
| API | NestJS | Proposed — 미생성 |
| monorepo | pnpm workspace | Proposed — 미생성 |
| 데이터베이스 | PostgreSQL | Proposed — 미설치·미설계 |
| 개발 환경 | Docker | Proposed — 미구성 |
| 결제 | Toss Payments 테스트 연동 | Proposed — 미연동 |
| 배포 | Vercel | Proposed — 미설정 |
| 작업 방식 | Git, Git worktree, Orca, Codex, LLM Wiki | 문서 기반 초기 규칙 수립 중 |

## 구현 예정 기능

- 상품 목록
- 상품 상세
- 장바구니
- 주문 생성
- 주문 상태 확인
- Toss Payments 테스트 결제
- 결제 성공 처리
- 결제 실패 처리
- 주문·결제 상태 확인 화면
- Vercel Preview 및 배포

기능 구현 순서와 세부 완료 조건은 각 task에서 정한다.

## 프로젝트 범위

이 프로젝트는 학습용 demo다. 실제 고객을 대상으로 한 운영용 결제, 실물 상품 배송·정산, 운영 수준의 모든 쇼핑몰 기능과 기존 쇼핑몰의 그대로 된 복제는 현재 범위에 포함하지 않는다. 참고 이미지나 자료를 사용할 경우 출처와 사용 가능 여부를 기록한다.

장기적으로는 Next.js와 NestJS의 연결, PostgreSQL의 주문·결제 상태 보존, Toss Payments 테스트 흐름, Vercel에서 확인 가능한 결과와 주요 결정·시행착오 기록을 함께 갖춘 상태를 목표로 한다.

## 비기능 목표

- **학습 가능성:** 초보 개발자가 요청과 데이터가 시스템을 통과하는 경로를 설명할 수 있어야 한다.
- **추적 가능성:** 중요한 선택, 변경, 검증과 실패 원인을 Git 및 Wiki에서 다시 찾을 수 있어야 한다.
- **타입 안정성:** TypeScript의 타입 검사를 우회하기보다 경계를 명확히 표현한다.
- **보안 기본기:** 실제 credential을 저장소나 브라우저 코드에 넣지 않는다.
- **검증 가능성:** 기능마다 자동 검증과 필요한 수동 확인 방법을 기록한다.
- **작은 변경:** 하나의 task와 worktree가 하나의 명확한 목표를 다루도록 한다.

구체적인 성능, 가용성, 접근성, 브라우저 지원과 운영 수준의 보안 목표는 `TBD`다.

## 현재 프로젝트 단계

현재는 **Stage 0: 지식 관리 기반 구축** 단계다. 다음 항목만 준비한다.

- 에이전트 작업 규칙
- LLM Wiki 문서 구조
- domain, ADR, task와 retrospective 기록 체계
- 개발 및 테스트 workflow의 초기 기준

Next.js/NestJS 애플리케이션, pnpm workspace, PostgreSQL, Docker, Toss Payments와 Vercel 설정은 아직 존재하지 않는다.

## 아직 결정되지 않은 사항

- `TBD` — 정확한 패키지 버전과 업데이트 정책
- `TBD` — ORM 또는 데이터 접근 방법과 migration 전략
- `TBD` — API 방식과 web/API 간 계약 관리 방법
- `TBD` — 고객 식별 및 인증 범위
- `TBD` — 장바구니의 브라우저·세션·DB 저장 방식
- `TBD` — 주문과 결제의 최종 상태 모델 및 취소·환불 범위
- `TBD` — 재고 차감·예약 시점과 동시성 처리
- `TBD` — 테스트 프레임워크와 테스트 데이터 전략
- `TBD` — Docker가 담당할 로컬 서비스 범위
- `TBD` — NestJS API와 PostgreSQL의 실제 배포 위치 및 Vercel 연결 구조
