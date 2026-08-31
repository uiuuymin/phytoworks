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

function normalizeSelections(selections: unknown): QuoteSelection[] | null {
  if (!Array.isArray(selections)) {
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

    if (selectionsByGroupId.has(groupId)) {
      return null;
    }

    selectionsByGroupId.set(groupId, [...new Set(optionIds)]);
  }

  return [...selectionsByGroupId.entries()].map(([groupId, optionIds]) => ({
    groupId,
    optionIds,
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

    const selections = normalizeSelections(candidate.selections);

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
