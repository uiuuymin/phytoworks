export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartState = {
  items: readonly CartItem[];
  lastRemovedItem: CartItem | null;
  hasHydrated: boolean;
};

export type CartAction =
  | { type: "hydrate"; items: readonly CartItem[] }
  | { type: "add"; productId: string }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "undoRemove" };

export const initialCartState: CartState = {
  items: [],
  lastRemovedItem: null,
  hasHydrated: false,
};

export function isValidCartQuantity(quantity: number) {
  return Number.isSafeInteger(quantity) && quantity >= 1;
}

export function getCartItem(items: readonly CartItem[], productId: string) {
  return items.find((item) => item.productId === productId);
}

export function getCartTotalQuantity(items: readonly CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return {
        items: action.items,
        lastRemovedItem: null,
        hasHydrated: true,
      };

    case "add": {
      const currentItem = getCartItem(state.items, action.productId);

      if (!currentItem) {
        return {
          ...state,
          items: [...state.items, { productId: action.productId, quantity: 1 }],
          lastRemovedItem: null,
        };
      }

      const nextQuantity = currentItem.quantity + 1;

      if (!isValidCartQuantity(nextQuantity)) {
        return state;
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
        lastRemovedItem: null,
      };
    }

    case "setQuantity":
      if (!isValidCartQuantity(action.quantity)) {
        return state;
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: action.quantity }
            : item,
        ),
        lastRemovedItem: null,
      };

    case "remove": {
      const itemToRemove = getCartItem(state.items, action.productId);

      if (!itemToRemove) {
        return state;
      }

      return {
        ...state,
        items: state.items.filter(
          (item) => item.productId !== action.productId,
        ),
        lastRemovedItem: itemToRemove,
      };
    }

    case "undoRemove":
      if (!state.lastRemovedItem) {
        return state;
      }

      return {
        ...state,
        items: [...state.items, state.lastRemovedItem],
        lastRemovedItem: null,
      };
  }
}
