import type { ProductReadModel } from "./product.types.js";

export const productFixtures = [
  {
    id: "nitro",
    name: "NITRO Plant Growth System",
    category: "생육·표현형 분석 시스템",
    description:
      "환경 제어, 멀티모달 이미징과 AI 기반 형질 분석을 연결하는 연구 플랫폼입니다.",
    summary:
      "독립적인 생육 환경 제어와 반복 촬영으로 식물의 반응을 관찰하고, 수집한 데이터를 정량적인 형질 분석으로 연결합니다.",
    features: [
      "온도, 습도, 광, 관수와 CO₂를 연구 조건에 맞춰 제어합니다.",
      "RGB, 열화상과 엽록소 형광으로 식물을 비파괴 방식으로 반복 관찰합니다.",
      "촬영한 이미지와 환경 데이터를 AI 기반 형질 분석과 연결합니다.",
    ],
    mediaLabel: "NITRO",
    purchaseMode: "QUOTE_REQUIRED",
  },
  {
    id: "thermal-imaging",
    name: "Thermal Imaging Module",
    category: "이미징 모듈",
    description:
      "적외선 열화상으로 식물의 온도 변화와 스트레스 패턴을 관찰합니다.",
    summary:
      "식물에서 나타나는 온도 차이를 열화상 데이터로 확인하여 생육 반응과 스트레스 변화를 비교할 수 있습니다.",
    features: [
      "식물 표면의 온도 변화를 열화상 데이터로 시각화합니다.",
      "눈에 보이는 변화 전후의 스트레스 패턴을 비교해 관찰합니다.",
      "반복 촬영한 결과를 시간의 흐름에 따라 살펴볼 수 있습니다.",
    ],
    mediaLabel: "THERMAL",
    purchaseMode: "DIRECT_PURCHASE",
  },
  {
    id: "chlorophyll-fluorescence",
    name: "Chlorophyll Fluorescence Module",
    category: "이미징 모듈",
    description:
      "엽록소 형광 정보를 촬영해 눈으로 보기 어려운 식물의 생리 상태를 분석합니다.",
    summary:
      "엽록소 형광 정보를 촬영하여 가시광 이미지만으로 확인하기 어려운 식물의 생리 반응을 관찰합니다.",
    features: [
      "식물의 엽록소 형광 정보를 비파괴 방식으로 촬영합니다.",
      "눈으로 보기 어려운 생리 상태와 변화를 분석합니다.",
      "반복 관찰한 형광 정보를 생육 상태 비교에 활용합니다.",
    ],
    mediaLabel: "CHLOROPHYLL FLUORESCENCE",
    purchaseMode: "DIRECT_PURCHASE",
  },
] satisfies readonly ProductReadModel[];
