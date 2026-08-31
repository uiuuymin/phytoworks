export type QuoteSelection = {
  groupId: string;
  optionIds: readonly string[];
};

export type QuoteItem = {
  productId: string;
  selections: readonly QuoteSelection[];
};

export type QuoteState = {
  items: readonly QuoteItem[];
  hasHydrated: boolean;
};

export type QuoteAction =
  | { type: "hydrate"; items: readonly QuoteItem[] }
  | { type: "add"; item: QuoteItem }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export const initialQuoteState: QuoteState = {
  items: [],
  hasHydrated: false,
};

export function getQuoteItem(items: readonly QuoteItem[], productId: string) {
  return items.find((item) => item.productId === productId);
}

export function quoteReducer(
  state: QuoteState,
  action: QuoteAction,
): QuoteState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hasHydrated: true };

    case "add":
      return {
        ...state,
        items: [
          ...state.items.filter(
            (item) => item.productId !== action.item.productId,
          ),
          action.item,
        ],
      };

    case "remove":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.productId !== action.productId,
        ),
      };

    case "clear":
      return { ...state, items: [] };
  }
}
