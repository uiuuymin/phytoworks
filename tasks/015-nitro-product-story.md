# Task: NITRO Product Detail product story

**Status:** Implemented, browser visual review pending

## Goal

Steelcase 제품 페이지에서 확인한 제품 이미지 중심 Hero, 짧은 문장과 역할이 분명한 section 흐름을 PhytoWorks NITRO 상세 페이지에 맞게 재해석한다. 이번 task는 기존 정적 Product data와 Web UI만 사용하며 API, DB, dependency와 route는 변경하지 않는다.

## Design read

Steelcase는 제품명과 짧은 설명, 큰 제품 이미지와 핵심 CTA를 먼저 보여준 뒤 소재와 기능을 긴 시각적 이야기로 전개한다. PhytoWorks에서는 이를 소비재 구매 유도가 아니라 `환경 제어 → 반복 이미징 → 분석 결과`라는 연구 흐름으로 바꾼다. Steelcase의 이미지, 문구와 layout을 복제하지 않는다.

## Current

- Product Detail Hero는 이미지와 제품 정보를 2열로 보여주지만 제품 이미지와 CTA의 시각적 우선순위가 약하다.
- NITRO의 개요, 주요 기능과 기술 사양은 한쪽에 이어지는 단순 section 구조다.
- Thermal과 Chlorophyll Fluorescence 이미지는 상세 media로 사용할 수 있지만, 기능 설명과 연결된 시각적 block이 없다.
- `ProductPurchasePanel`은 NITRO 옵션 선택과 공식 문의를 제공한다.
- NITRO는 `QUOTE_REQUIRED`이므로 온라인 결제 CTA는 제공하지 않는다.
- 실제 NITRO의 운영 장면과 RGB 결과 이미지는 아직 없다. 새 장비 이미지나 수치를 임의로 만들지 않는다.

## Proposed

- Hero는 큰 NITRO 이미지, 제품명, 짧은 설명과 `Customize`, `Request a quote` CTA를 중심으로 구성한다.
- Hero 이후에 NITRO의 핵심 가치를 한 문장으로 제시한다.
- 환경 제어와 반복 이미징을 연구 흐름 block으로 설명한다.
- Thermal과 Chlorophyll Fluorescence 분석 결과를 핵심 기능 이미지로 배치한다. 결과 crop은 카드 썸네일이 아니라 상세 페이지 전용이다.
- `Chamber H/W`, `Imaging`, `LED Lighting`, `Plant & Area`를 독립적인 사양 block으로 유지한다.
- 옵션 선택은 `Customize` anchor 아래에서 제공하고, 마지막 CTA는 견적 문의 하나로 정리한다.
- 모듈 상세 페이지는 이번 task에서 NITRO 전용 story를 무리하게 공유하지 않는다.

## Not changed

- NestJS API와 PostgreSQL schema
- Product API contract와 `packages/contracts`
- 가격, 재고, 주문과 결제 규칙
- 실제 이미지와 credential
- 신규 route와 dependency

## Verification

- [x] NITRO detail route 200과 정적 build
- [x] Hero 이미지, 제목, 설명과 CTA 순서
- [x] Customize anchor와 견적 configurator 연결
- [x] Thermal, Chlorophyll 이미지의 상세 전용 표시
- [x] 네 개 기술 사양 group 표시
- [ ] 375px, 768px, 1280px와 200% text에서 overflow 없음
- [ ] keyboard focus와 reduced motion 유지
- [x] Web lint, typecheck, build
- [x] `git diff --check`

로컬 HTML 응답에서 NITRO의 Hero CTA, 연구 흐름 heading, 분석 결과 이미지와 설정 anchor를 확인했다. 실제 viewport별 spacing과 overflow는 브라우저 수동 검증으로 남긴다.
