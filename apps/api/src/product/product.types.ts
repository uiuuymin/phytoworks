export type ProductPurchaseMode = "QUOTE_REQUIRED" | "DIRECT_PURCHASE";

export type ProductReadModel = {
  id: string;
  name: string;
  category: string;
  description: string;
  summary: string;
  features: readonly string[];
  mediaLabel: string;
  purchaseMode: ProductPurchaseMode;
};

export type ProductListResponse = {
  items: readonly ProductReadModel[];
};
