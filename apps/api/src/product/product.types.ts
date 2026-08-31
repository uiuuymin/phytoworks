export type ProductPurchaseMode = "QUOTE_REQUIRED" | "DIRECT_PURCHASE";

export type ProductBaseReadModel = {
  id: string;
  name: string;
  category: string;
  description: string;
  summary: string;
  features: readonly string[];
  mediaLabel: string;
  purchaseMode: ProductPurchaseMode;
};

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

export type ProductReadModel = ProductBaseReadModel & {
  pricing: ProductPricing;
  optionGroups: readonly ProductOptionGroup[];
};

export type ProductListResponse = {
  items: readonly ProductReadModel[];
};
