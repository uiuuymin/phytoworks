# PhytoWorks Web

PhytoWorks의 연구·육종 장비와 분석 서비스 맥락을 반영한 학습용 B2B 쇼핑몰의 Next.js 애플리케이션입니다. 화면의 가격과 판매 조건은 실제 회사 정책이 아닌 Demo로 구분합니다.

## 실행

저장소 루트에서 다음 명령을 실행합니다.

```bash
pnpm dev
```

브라우저에서 <http://localhost:3000>을 열고 `app/page.tsx`를 수정하면 변경된 화면을 확인할 수 있습니다.

## 현재 책임

- App Router 기반 `/` 화면 제공
- 브라우저 요청을 받아 React 컴포넌트를 렌더링
- NITRO와 이미징 모듈을 바탕으로 한 정적 학습용 Product 목록 제공

NestJS API, PostgreSQL과 실제 쇼핑몰 기능은 아직 연결하지 않았습니다.

## 검증

루트에서 `pnpm lint`, `pnpm typecheck`, `pnpm build`를 실행합니다.
