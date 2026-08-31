export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export type OrderPricingSource = "DEMO";

export type OrderItemReadModel = {
  productId: string;
  productName: string;
  unitAmount: number;
  quantity: number;
  lineAmount: number;
};

export type OrderReadModel = {
  id: string;
  status: OrderStatus;
  currency: "KRW";
  pricingSource: OrderPricingSource;
  totalAmount: number;
  items: readonly OrderItemReadModel[];
};

export type OrderItemSnapshot = {
  productId: string;
  productName: string;
  unitAmount: number;
  quantity: number;
};

export type CreatePendingOrderInput = {
  sessionId: string;
  currency: "KRW";
  pricingSource: "DEMO";
  totalAmount: number;
  items: readonly OrderItemSnapshot[];
};
