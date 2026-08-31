export type OrderApiItem = {
  productId: string;
  productName: string;
  unitAmount: number;
  quantity: number;
  lineAmount: number;
};

export type OrderApiResponse = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  currency: "KRW";
  pricingSource: "DEMO";
  totalAmount: number;
  items: readonly OrderApiItem[];
};

export class OrderApiError extends Error {
  readonly status: number;

  constructor(status = 503) {
    super("Order API is unavailable.");
    this.name = "OrderApiError";
    this.status = status;
  }
}

export async function createPendingOrder(
  sessionId: string,
): Promise<OrderApiResponse> {
  let response: Response;

  try {
    response = await fetch("/api/orders", {
      method: "POST",
      headers: { "X-Cart-Session-Id": sessionId },
      cache: "no-store",
    });
  } catch {
    throw new OrderApiError();
  }

  if (!response.ok) {
    throw new OrderApiError(response.status);
  }

  try {
    const value: unknown = await response.json();
    if (!isOrderApiResponse(value)) {
      throw new OrderApiError();
    }
    return value;
  } catch (error) {
    if (error instanceof OrderApiError) {
      throw error;
    }
    throw new OrderApiError();
  }
}

function isOrderApiResponse(value: unknown): value is OrderApiResponse {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isOrderStatus(value.status) &&
    value.currency === "KRW" &&
    value.pricingSource === "DEMO" &&
    isSafeNonNegativeInteger(value.totalAmount) &&
    Array.isArray(value.items) &&
    value.items.every(isOrderApiItem)
  );
}

function isOrderApiItem(value: unknown): value is OrderApiItem {
  return (
    isRecord(value) &&
    typeof value.productId === "string" &&
    typeof value.productName === "string" &&
    isSafeNonNegativeInteger(value.unitAmount) &&
    isSafePositiveInteger(value.quantity) &&
    isSafeNonNegativeInteger(value.lineAmount)
  );
}

function isOrderStatus(value: unknown): value is OrderApiResponse["status"] {
  return value === "PENDING" || value === "PAID" || value === "CANCELLED";
}

function isSafePositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}

function isSafeNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
