export type CatalogPurchaseMode = "QUOTE_REQUIRED" | "DIRECT_PURCHASE";

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  purchaseMode: CatalogPurchaseMode;
};

export const products = [
  {
    id: "nitro",
    name: "NITRO Plant Growth System",
    category: "생육·표현형 분석 시스템",
    description:
      "환경 제어, 멀티모달 이미징과 AI 기반 형질 분석을 연결하는 연구 플랫폼입니다.",
    purchaseMode: "QUOTE_REQUIRED",
  },
  {
    id: "thermal-imaging",
    name: "Thermal Imaging Module",
    category: "이미징 모듈",
    description:
      "적외선 열화상으로 식물의 온도 변화와 스트레스 패턴을 관찰합니다.",
    purchaseMode: "DIRECT_PURCHASE",
  },
  {
    id: "chlorophyll-fluorescence",
    name: "Chlorophyll Fluorescence Module",
    category: "이미징 모듈",
    description:
      "엽록소 형광 정보를 촬영해 눈으로 보기 어려운 식물의 생리 상태를 분석합니다.",
    purchaseMode: "DIRECT_PURCHASE",
  },
] satisfies readonly CatalogProduct[];
