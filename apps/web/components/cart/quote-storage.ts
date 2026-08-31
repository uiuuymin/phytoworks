import { getQuoteProductById } from "@/data/products";

import type { QuoteItem, QuoteSelection } from "./quote-state";

const quoteStorageKey = "phytoworks-shop.quote.v1";

type StoredQuoteV1 = {
  version: 1;
  items: readonly QuoteItem[];
};

type ParsedQuote = {
  items: readonly QuoteItem[];
  shouldClear: boolean;
};

export type QuoteStorageReadResult = {
  items: readonly QuoteItem[];
  isAvailable: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSelections(
  productId: string,
  selections: unknown,
): QuoteSelection[] | null {
  const product = getQuoteProductById(productId);

  if (!product || !Array.isArray(selections)) {
    return null;
  }

  const selectionsByGroupId = new Map<string, string[]>();

  for (const candidate of selections) {
    if (!isRecord(candidate)) {
      return null;
    }

    const { groupId, optionIds } = candidate;

    if (
      typeof groupId !== "string" ||
      !Array.isArray(optionIds) ||
      optionIds.some((optionId) => typeof optionId !== "string")
    ) {
      return null;
    }

    const group = product.optionGroups.find((item) => item.id === groupId);

    if (!group || selectionsByGroupId.has(groupId)) {
      return null;
    }

    const allowedOptionIds = new Set(group.options.map((option) => option.id));
    const normalizedOptionIds = [
      ...new Set(
        optionIds.filter((optionId) => allowedOptionIds.has(optionId)),
      ),
    ];

    if (normalizedOptionIds.length !== optionIds.length) {
      return null;
    }

    if (group.selection === "single" && normalizedOptionIds.length !== 1) {
      return null;
    }

    selectionsByGroupId.set(groupId, normalizedOptionIds);
  }

  if (
    product.optionGroups.some((group) => !selectionsByGroupId.has(group.id))
  ) {
    return null;
  }

  return product.optionGroups.map((group) => ({
    groupId: group.id,
    optionIds: selectionsByGroupId.get(group.id) ?? [],
  }));
}

export function parseStoredQuote(rawValue: string | null): ParsedQuote {
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

  const items: QuoteItem[] = [];

  for (const candidate of parsedValue.items) {
    if (!isRecord(candidate) || typeof candidate.productId !== "string") {
      continue;
    }

    const selections = normalizeSelections(
      candidate.productId,
      candidate.selections,
    );

    if (
      !selections ||
      items.some((item) => item.productId === candidate.productId)
    ) {
      continue;
    }

    items.push({ productId: candidate.productId, selections });
  }

  return { items, shouldClear: false };
}

export function readQuoteFromStorage(): QuoteStorageReadResult {
  try {
    const storage = window.localStorage;
    const parsedQuote = parseStoredQuote(storage.getItem(quoteStorageKey));

    if (parsedQuote.shouldClear) {
      storage.removeItem(quoteStorageKey);
    }

    return { items: parsedQuote.items, isAvailable: true };
  } catch {
    return { items: [], isAvailable: false };
  }
}

export function writeQuoteToStorage(items: readonly QuoteItem[]) {
  const storedQuote: StoredQuoteV1 = { version: 1, items };

  try {
    window.localStorage.setItem(quoteStorageKey, JSON.stringify(storedQuote));
    return true;
  } catch {
    return false;
  }
}
