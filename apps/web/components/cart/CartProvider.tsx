"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

import {
  addCartItem,
  type CartApiResponse,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/lib/cart-api";
import type { ProductOptionGroup } from "@/lib/product-types";

import styles from "./CartProvider.module.css";
import {
  type CartItem,
  cartReducer,
  getCartItem,
  getCartTotalQuantity,
  initialCartState,
  isValidCartQuantity,
} from "./cart-state";
import {
  initialQuoteState,
  type QuoteItem,
  type QuoteSelection,
  quoteReducer,
} from "./quote-state";
import { readQuoteFromStorage, writeQuoteToStorage } from "./quote-storage";

type ApiStatus = "loading" | "available" | "unavailable";

type CartContextValue = {
  items: readonly CartItem[];
  lastRemovedItem: CartItem | null;
  totalQuantity: number;
  hasHydrated: boolean;
  apiStatus: ApiStatus;
  isPending: boolean;
  addItem: (productId: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<boolean>;
  incrementItem: (productId: string) => Promise<void>;
  decrementItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  undoRemove: () => Promise<void>;
  announceInvalidQuantity: () => void;
  quoteItems: readonly QuoteItem[];
  quoteCount: number;
  addQuoteItem: (
    productId: string,
    selections: readonly QuoteSelection[],
    optionGroups: readonly ProductOptionGroup[],
  ) => boolean;
  removeQuoteItem: (productId: string) => void;
  clearQuoteItems: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [quoteState, quoteDispatch] = useReducer(
    quoteReducer,
    initialQuoteState,
  );
  const [apiStatus, setApiStatus] = useState<ApiStatus>("loading");
  const [isPending, setIsPending] = useState(false);
  const [quoteStorageAvailable, setQuoteStorageAvailable] = useState(true);
  const [announcement, setAnnouncement] = useState({ id: 0, message: "" });

  const announce = useCallback((message: string) => {
    setAnnouncement(({ id }) => ({ id: id + 1, message }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializeCart() {
      try {
        const storedQuote = readQuoteFromStorage();
        quoteDispatch({ type: "hydrate", items: storedQuote.items });
        setQuoteStorageAvailable(storedQuote.isAvailable);

        const cart = await getCart();

        if (cancelled) {
          return;
        }

        dispatch({ type: "hydrate", items: cart.items });
        setApiStatus("available");
      } catch {
        if (cancelled) {
          return;
        }

        dispatch({ type: "hydrate", items: [] });
        setApiStatus("unavailable");
        announce("Cart API를 사용할 수 없습니다.");
      }
    }

    void initializeCart();

    return () => {
      cancelled = true;
    };
  }, [announce]);

  useEffect(() => {
    if (!quoteState.hasHydrated || !quoteStorageAvailable) {
      return;
    }

    if (!writeQuoteToStorage(quoteState.items)) {
      setQuoteStorageAvailable(false);
      announce(
        "견적함을 이 브라우저에 저장할 수 없습니다. 현재 화면을 사용하는 동안만 유지됩니다.",
      );
    }
  }, [
    announce,
    quoteState.hasHydrated,
    quoteState.items,
    quoteStorageAvailable,
  ]);

  const runMutation = useCallback(
    async (
      operation: () => Promise<CartApiResponse>,
      successMessage: string,
      lastRemovedItem?: CartItem,
    ): Promise<boolean> => {
      if (!state.hasHydrated || isPending) {
        return false;
      }

      setIsPending(true);

      try {
        const cart = await operation();
        dispatch({ type: "sync", items: cart.items, lastRemovedItem });
        setApiStatus("available");
        announce(successMessage);
        return true;
      } catch {
        setApiStatus("unavailable");
        announce("Cart API를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [announce, isPending, state.hasHydrated],
  );

  async function addItem(productId: string) {
    const currentQuantity = getCartItem(state.items, productId)?.quantity ?? 0;
    const nextQuantity = currentQuantity + 1;

    if (!isValidCartQuantity(nextQuantity)) {
      announce("수량을 더 늘릴 수 없습니다.");
      return;
    }

    await runMutation(
      () => addCartItem(productId),
      `상품을 장바구니에 담았습니다. 수량은 ${nextQuantity}개입니다.`,
    );
  }

  async function setQuantity(productId: string, quantity: number) {
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem || !isValidCartQuantity(quantity)) {
      announce("수량은 1 이상의 정수여야 합니다.");
      return false;
    }

    return runMutation(
      () => setCartItemQuantity(productId, quantity),
      `상품 수량을 ${quantity}개로 변경했습니다.`,
    );
  }

  async function incrementItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);
    if (currentItem) {
      await setQuantity(productId, currentItem.quantity + 1);
    }
  }

  async function decrementItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);
    if (currentItem && currentItem.quantity > 1) {
      await setQuantity(productId, currentItem.quantity - 1);
    }
  }

  async function removeItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);
    if (!currentItem) {
      return;
    }

    await runMutation(
      () => removeCartItem(productId),
      "상품을 장바구니에서 제거했습니다.",
      currentItem,
    );
  }

  async function undoRemove() {
    const removedItem = state.lastRemovedItem;
    if (!removedItem) {
      return;
    }

    await runMutation(
      () => addCartItem(removedItem.productId, removedItem.quantity),
      `상품을 수량 ${removedItem.quantity}개로 복원했습니다.`,
    );
  }

  const announceInvalidQuantity = useCallback(() => {
    announce("수량은 1 이상의 정수여야 합니다.");
  }, [announce]);

  function addQuoteItem(
    productId: string,
    selections: readonly QuoteSelection[],
    optionGroups: readonly ProductOptionGroup[],
  ) {
    const normalizedSelections = optionGroups.map((group) => {
      const selection = selections.find(
        (candidate) => candidate.groupId === group.id,
      );
      const optionIds = [
        ...new Set(
          selection?.optionIds.filter((optionId) =>
            group.options.some((option) => option.id === optionId),
          ) ?? [],
        ),
      ];

      return { groupId: group.id, optionIds };
    });
    const missingRequiredGroups = optionGroups.filter((group) => {
      if (group.selection !== "single") {
        return false;
      }

      return (
        normalizedSelections.find((selection) => selection.groupId === group.id)
          ?.optionIds.length !== 1
      );
    });

    if (missingRequiredGroups.length > 0) {
      announce(
        `${missingRequiredGroups.map((group) => group.label).join(", ")} 옵션을 하나씩 선택해 주세요.`,
      );
      return false;
    }

    quoteDispatch({
      type: "add",
      item: { productId, selections: normalizedSelections },
    });
    announce("구성을 견적함에 담았습니다.");
    return true;
  }

  function removeQuoteItem(productId: string) {
    quoteDispatch({ type: "remove", productId });
    announce("구성을 견적함에서 제거했습니다.");
  }

  function clearQuoteItems() {
    if (quoteState.items.length === 0) {
      return;
    }

    quoteDispatch({ type: "clear" });
    announce("견적함을 비웠습니다.");
  }

  const contextValue: CartContextValue = {
    items: state.items,
    lastRemovedItem: state.lastRemovedItem,
    totalQuantity: getCartTotalQuantity(state.items),
    hasHydrated: state.hasHydrated && quoteState.hasHydrated,
    apiStatus,
    isPending,
    addItem,
    setQuantity,
    incrementItem,
    decrementItem,
    removeItem,
    undoRemove,
    announceInvalidQuantity,
    quoteItems: quoteState.items,
    quoteCount: quoteState.items.length,
    addQuoteItem,
    removeQuoteItem,
    clearQuoteItems,
  };

  return (
    <CartContext value={contextValue}>
      {children}
      <p
        key={announcement.id}
        className={styles.status}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement.message}
      </p>
    </CartContext>
  );
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart는 CartProvider 안에서 사용해야 합니다.");
  }

  return cart;
}
