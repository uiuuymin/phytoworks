export type CatalogPurchaseMode = "QUOTE_REQUIRED" | "DIRECT_PURCHASE";

export type ProductPricing =
  | {
      mode: "QUOTE_REFERENCE";
      currency: "KRW";
      amountFrom: number;
      displayLabel: string;
      source: "BROCHURE_REFERENCE";
      authoritative: false;
    }
  | {
      mode: "DEMO";
      currency: "KRW";
      amount: number;
      displayLabel: string;
      source: "DEMO";
      authoritative: false;
    };

export type ProductOptionGroup = {
  id: string;
  label: string;
  selection: "single" | "multiple";
  source: "BROCHURE";
  options: readonly {
    id: string;
    label: string;
  }[];
};

export type ProductSpecGroup = {
  id: string;
  label: string;
  items: readonly {
    label: string;
    value: string;
  }[];
};

export type ProductDetails = {
  summary: string;
  features: readonly string[];
  media: {
    src: string;
    alt: string;
  };
  thumbnail?: {
    src: string;
    alt: string;
  };
  mediaLabel: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  purchaseMode: CatalogPurchaseMode;
  pricing: ProductPricing;
  optionGroups: readonly ProductOptionGroup[];
  specGroups: readonly ProductSpecGroup[];
  details: ProductDetails;
};

export const purchaseModeLabels = {
  QUOTE_REQUIRED: "견적 문의",
  DIRECT_PURCHASE: "온라인 구매",
} satisfies Record<CatalogPurchaseMode, string>;

export const products = [
  {
    id: "nitro",
    name: "NITRO Plant Growth System",
    category: "생육·표현형 분석 시스템",
    description:
      "환경 제어, 멀티모달 이미징과 AI 기반 형질 분석을 연결하는 연구 플랫폼입니다.",
    purchaseMode: "QUOTE_REQUIRED",
    pricing: {
      mode: "QUOTE_REFERENCE",
      currency: "KRW",
      amountFrom: 20_000_000,
      displayLabel: "도입·1년 운영비 2,000만 원부터",
      source: "BROCHURE_REFERENCE",
      authoritative: false,
    },
    optionGroups: [
      {
        id: "depth-imaging",
        label: "Depth Imaging",
        selection: "single",
        source: "BROCHURE",
        options: [
          { id: "lidar", label: "Lidar" },
          { id: "stereo", label: "Stereo" },
        ],
      },
      {
        id: "irrigation",
        label: "Irrigation",
        selection: "single",
        source: "BROCHURE",
        options: [
          { id: "drip", label: "Drip Irrigation" },
          { id: "mist", label: "Mist Irrigation" },
          { id: "sub-irrigation", label: "Sub-irrigation" },
        ],
      },
      {
        id: "add-ons",
        label: "Additional Options",
        selection: "multiple",
        source: "BROCHURE",
        options: [
          { id: "ec-ph-sensor", label: "EC/pH Sensor" },
          { id: "load-cell-sensor", label: "Load Cell Sensor" },
          { id: "power-meter", label: "Power Meter" },
          { id: "humidifier", label: "Humidifier" },
        ],
      },
    ],
    specGroups: [
      {
        id: "chamber",
        label: "Chamber H/W",
        items: [
          { label: "외부 치수", value: "800 x 500 x 1400 mm" },
          { label: "내부 치수", value: "600 x 400 x 1100 mm" },
          { label: "중량", value: "120 kg, 옵션 선택 시 +20 kg" },
          { label: "온도 제어", value: "Peltier, -6/-10 ~ +30 °C" },
          { label: "소비전력", value: ">1 kW @ 110V-220V" },
          { label: "연결", value: "Ethernet (RJ-45), 필수" },
        ],
      },
      {
        id: "imaging",
        label: "Imaging",
        items: [
          { label: "RGB", value: "4608 x 2592 / FOV 66(H)" },
          { label: "Thermal (LWIR)", value: "160 x 120 / FOV 57(H)" },
          { label: "Chlorophyll FL", value: "1280 x 1024 / FOV 62.1(H)" },
          { label: "분석 지표", value: "Fv/Fm, NvPQ, ETR 등" },
        ],
      },
      {
        id: "lighting",
        label: "LED Lighting",
        items: [
          { label: "Red", value: "620 nm, 약 500 µmol/m²/s" },
          { label: "Blue", value: "450 nm, 약 2000 µmol/m²/s" },
          { label: "Far-red", value: "730 nm, 약 500 µmol/m²/s" },
          { label: "Sun-like White", value: "약 300 µmol/m²/s" },
        ],
      },
      {
        id: "plant-area",
        label: "Plant & Area",
        items: [
          { label: "최대 식물 높이", value: "260 mm 이하" },
          { label: "이미징 영역", value: "580 x 380 mm" },
        ],
      },
    ],
    details: {
      summary:
        "독립적인 생육 환경 제어와 반복 촬영으로 식물의 반응을 관찰하고, 수집한 데이터를 정량적인 형질 분석으로 연결합니다.",
      features: [
        "온도, 습도, 광, 관수와 CO₂를 연구 조건에 맞춰 제어합니다.",
        "RGB, 열화상과 엽록소 형광으로 식물을 비파괴 방식으로 반복 관찰합니다.",
        "촬영한 이미지와 환경 데이터를 AI 기반 형질 분석과 연결합니다.",
      ],
      media: {
        src: "/images/products/nitro-chamber.jpeg",
        alt: "NITRO 생육 챔버 내부에서 자라는 식물",
      },
      thumbnail: {
        src: "/images/products/nitro-hero-cutout.png",
        alt: "NITRO Plant Growth System chamber",
      },
      mediaLabel: "NITRO",
    },
  },
  {
    id: "thermal-imaging",
    name: "Thermal Imaging Module",
    category: "이미징 모듈",
    description:
      "적외선 열화상으로 식물의 온도 변화와 스트레스 패턴을 관찰합니다.",
    purchaseMode: "DIRECT_PURCHASE",
    pricing: {
      mode: "DEMO",
      currency: "KRW",
      amount: 5_000_000,
      displayLabel: "500만 원",
      source: "DEMO",
      authoritative: false,
    },
    optionGroups: [],
    specGroups: [],
    details: {
      summary:
        "식물에서 나타나는 온도 차이를 열화상 데이터로 확인하여 생육 반응과 스트레스 변화를 비교할 수 있습니다.",
      features: [
        "식물 표면의 온도 변화를 열화상 데이터로 시각화합니다.",
        "눈에 보이는 변화 전후의 스트레스 패턴을 비교해 관찰합니다.",
        "반복 촬영한 결과를 시간의 흐름에 따라 살펴볼 수 있습니다.",
      ],
      media: {
        src: "/images/products/thermal-imaging-module.png",
        alt: "열화상 이미지로 촬영한 식물의 시간별 변화",
      },
      mediaLabel: "THERMAL",
    },
  },
  {
    id: "chlorophyll-fluorescence",
    name: "Chlorophyll Fluorescence Module",
    category: "이미징 모듈",
    description:
      "엽록소 형광 정보를 촬영해 눈으로 보기 어려운 식물의 생리 상태를 분석합니다.",
    purchaseMode: "DIRECT_PURCHASE",
    pricing: {
      mode: "DEMO",
      currency: "KRW",
      amount: 7_000_000,
      displayLabel: "700만 원",
      source: "DEMO",
      authoritative: false,
    },
    optionGroups: [],
    specGroups: [],
    details: {
      summary:
        "엽록소 형광 정보를 촬영하여 가시광 이미지만으로 확인하기 어려운 식물의 생리 반응을 관찰합니다.",
      features: [
        "식물의 엽록소 형광 정보를 비파괴 방식으로 촬영합니다.",
        "눈으로 보기 어려운 생리 상태와 변화를 분석합니다.",
        "반복 관찰한 형광 정보를 생육 상태 비교에 활용합니다.",
      ],
      media: {
        src: "/images/products/chlorophyll-fluorescence-module.png",
        alt: "엽록소 형광 이미지로 촬영한 식물의 시간별 변화",
      },
      mediaLabel: "CHLOROPHYLL FLUORESCENCE",
    },
  },
] satisfies readonly CatalogProduct[];

export function getProductById(productId: string) {
  return products.find((product) => product.id === productId);
}

export function getDirectPurchaseProductById(productId: string) {
  const product = getProductById(productId);

  return product?.purchaseMode === "DIRECT_PURCHASE" ? product : undefined;
}

export function getQuoteProductById(productId: string) {
  const product = getProductById(productId);

  return product?.purchaseMode === "QUOTE_REQUIRED" ? product : undefined;
}
