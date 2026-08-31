import { getDirectPurchaseProductById } from "@/data/products";

import { type CartItem, isValidCartQuantity } from "./cart-state";

const cartStorageKey = "phytoworks-shop.cart.v1";

type StoredCartV1 = {
  version: 1;
  items: readonly CartItem[];
};

type ParsedCart = {
  items: readonly CartItem[];
  shouldClear: boolean;
};

export type CartStorageReadResult = {
  items: readonly CartItem[];
  isAvailable: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseStoredCart(rawValue: string | null): ParsedCart {
  if (rawValue === null) {
    return { items: [], shouldClear: false };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    return { items: [], shouldClear: true };
  }

  if (
    !isRecord(parsedValue) ||
    parsedValue.version !== 1 ||
    !Array.isArray(parsedValue.items)
  ) {
    return { items: [], shouldClear: true };
  }

  const quantitiesByProductId = new Map<string, number>();
  const invalidProductIds = new Set<string>();

  for (const candidate of parsedValue.items) {
    if (!isRecord(candidate)) {
      continue;
    }

    const { productId, quantity } = candidate;

    if (
      typeof productId !== "string" ||
      typeof quantity !== "number" ||
      !isValidCartQuantity(quantity) ||
      !getDirectPurchaseProductById(productId) ||
      invalidProductIds.has(productId)
    ) {
      continue;
    }

    const combinedQuantity =
      (quantitiesByProductId.get(productId) ?? 0) + quantity;

    if (!isValidCartQuantity(combinedQuantity)) {
      quantitiesByProductId.delete(productId);
      invalidProductIds.add(productId);
      continue;
    }

    quantitiesByProductId.set(productId, combinedQuantity);
  }

  return {
    items: Array.from(quantitiesByProductId, ([productId, quantity]) => ({
      productId,
      quantity,
    })),
    shouldClear: false,
  };
}

export function readCartFromStorage(): CartStorageReadResult {
  try {
    const storage = window.localStorage;
    const parsedCart = parseStoredCart(storage.getItem(cartStorageKey));

    if (parsedCart.shouldClear) {
      storage.removeItem(cartStorageKey);
    }

    return { items: parsedCart.items, isAvailable: true };
  } catch {
    return { items: [], isAvailable: false };
  }
}

export function writeCartToStorage(items: readonly CartItem[]) {
  const storedCart: StoredCartV1 = {
    version: 1,
    items,
  };

  try {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(storedCart));
    return true;
  } catch {
    return false;
  }
}
