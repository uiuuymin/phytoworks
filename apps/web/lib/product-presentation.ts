import type { ProductSpecGroup } from "./product-types";

export type ProductMediaAsset = {
  src: string;
  alt: string;
};

const productMedia: Record<
  string,
  {
    media: ProductMediaAsset;
    thumbnail?: ProductMediaAsset;
  }
> = {
  nitro: {
    media: {
      src: "/images/products/nitro-chamber.jpeg",
      alt: "NITRO 생육 챔버 내부에서 자라는 식물",
    },
    thumbnail: {
      src: "/images/products/nitro-hero-cutout.png",
      alt: "NITRO Plant Growth System chamber",
    },
  },
  "thermal-imaging": {
    media: {
      src: "/images/products/thermal-imaging-module.png",
      alt: "열화상 이미지로 촬영한 식물의 시간별 변화",
    },
  },
  "chlorophyll-fluorescence": {
    media: {
      src: "/images/products/chlorophyll-fluorescence-module.png",
      alt: "엽록소 형광 이미지로 촬영한 식물의 시간별 변화",
    },
  },
};

export function getProductMedia(productId: string) {
  return (
    productMedia[productId] ?? {
      media: {
        src: "/images/products/nitro-chamber.jpeg",
        alt: "PhytoWorks research product",
      },
    }
  );
}

const nitroSpecGroups: readonly ProductSpecGroup[] = [
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
];

export function getProductSpecGroups(productId: string) {
  return productId === "nitro" ? nitroSpecGroups : [];
}
