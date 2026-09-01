export type CartApiItem = {
  productId: string;
  quantity: number;
};

export type CartApiResponse = {
  items: readonly CartApiItem[];
  totalQuantity: number;
};

export class CartApiError extends Error {
  readonly status: number;

  constructor(status = 503) {
    super("Cart API is unavailable.");
    this.name = "CartApiError";
    this.status = status;
  }
}

const CART_API_TIMEOUT_MS = 5_000;

export async function getCart(): Promise<CartApiResponse> {
  return requestCartApi("/api/cart");
}

export async function addCartItem(
  productId: string,
  quantity = 1,
): Promise<CartApiResponse> {
  return requestCartApi("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function setCartItemQuantity(
  productId: string,
  quantity: number,
): Promise<CartApiResponse> {
  return requestCartApi(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(
  productId: string,
): Promise<CartApiResponse> {
  return requestCartApi(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

async function requestCartApi(
  path: string,
  init: RequestInit = {},
): Promise<CartApiResponse> {
  const headers = new Headers(init.headers);

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CART_API_TIMEOUT_MS);

  try {
    response = await fetch(path, {
      ...init,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    throw new CartApiError();
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new CartApiError(response.status);
  }

  try {
    const value: unknown = await response.json();

    if (!isCartApiResponse(value)) {
      throw new CartApiError();
    }

    return value;
  } catch (error) {
    if (error instanceof CartApiError) {
      throw error;
    }

    throw new CartApiError();
  }
}

function isCartApiResponse(value: unknown): value is CartApiResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isCartApiItem) &&
    isSafeNonNegativeInteger(value.totalQuantity)
  );
}

function isCartApiItem(value: unknown): value is CartApiItem {
  return (
    isRecord(value) &&
    typeof value.productId === "string" &&
    isSafePositiveInteger(value.quantity)
  );
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
