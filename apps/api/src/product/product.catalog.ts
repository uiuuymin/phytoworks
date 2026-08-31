import type {
  ProductBaseReadModel,
  ProductOptionGroup,
  ProductPricing,
  ProductReadModel,
} from "./product.types.js";

type ProductCatalogMetadata = {
  pricing: ProductPricing;
  optionGroups: readonly ProductOptionGroup[];
};

const productCatalogMetadata: Readonly<Record<string, ProductCatalogMetadata>> =
  {
    nitro: {
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
          label: "Depth 이미징",
          selection: "single",
          source: "BROCHURE",
          options: [
            { id: "lidar", label: "Lidar" },
            { id: "stereo", label: "Stereo" },
          ],
        },
        {
          id: "irrigation",
          label: "관수",
          selection: "single",
          source: "BROCHURE",
          options: [
            { id: "drip", label: "점적 관수" },
            { id: "mist", label: "분무경" },
            { id: "sub-irrigation", label: "저면 관수" },
          ],
        },
        {
          id: "add-ons",
          label: "추가 옵션",
          selection: "multiple",
          source: "BROCHURE",
          options: [
            { id: "ec-ph-sensor", label: "EC/pH 센서" },
            { id: "load-cell-sensor", label: "로드셀 센서" },
            { id: "power-meter", label: "전력량계" },
            { id: "humidifier", label: "가습 장치" },
          ],
        },
      ],
    },
    "thermal-imaging": {
      pricing: {
        mode: "DEMO",
        currency: "KRW",
        amount: 5_000_000,
        displayLabel: "500만 원",
        source: "DEMO",
        authoritative: false,
      },
      optionGroups: [],
    },
    "chlorophyll-fluorescence": {
      pricing: {
        mode: "DEMO",
        currency: "KRW",
        amount: 7_000_000,
        displayLabel: "700만 원",
        source: "DEMO",
        authoritative: false,
      },
      optionGroups: [],
    },
  };

export function toProductReadModel(
  product: ProductBaseReadModel,
): ProductReadModel {
  const metadata = productCatalogMetadata[product.id];

  if (!metadata) {
    throw new Error(`Missing catalog metadata for Product: ${product.id}`);
  }

  return {
    ...product,
    pricing: metadata.pricing,
    optionGroups: metadata.optionGroups,
  };
}
