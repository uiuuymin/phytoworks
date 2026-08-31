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

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  purchaseMode: CatalogPurchaseMode;
  pricing: ProductPricing;
  optionGroups: readonly ProductOptionGroup[];
  details: {
    summary: string;
    features: readonly string[];
    mediaLabel: string;
  };
};

export const purchaseModeLabels = {
  QUOTE_REQUIRED: "견적 문의",
  DIRECT_PURCHASE: "온라인 구매",
} satisfies Record<CatalogPurchaseMode, string>;
