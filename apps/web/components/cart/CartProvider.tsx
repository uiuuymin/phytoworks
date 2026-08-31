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
  getDirectPurchaseProductById,
  getQuoteProductById,
} from "@/data/products";
import styles from "./CartProvider.module.css";
import {
  type CartItem,
  cartReducer,
  getCartItem,
  getCartTotalQuantity,
  initialCartState,
  isValidCartQuantity,
} from "./cart-state";
import { readCartFromStorage, writeCartToStorage } from "./cart-storage";
import {
  initialQuoteState,
  type QuoteItem,
  type QuoteSelection,
  quoteReducer,
} from "./quote-state";
import { readQuoteFromStorage, writeQuoteToStorage } from "./quote-storage";

type StorageStatus = "unknown" | "available" | "unavailable";

type CartContextValue = {
  items: readonly CartItem[];
  lastRemovedItem: CartItem | null;
  totalQuantity: number;
  hasHydrated: boolean;
  storageStatus: StorageStatus;
  addItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => boolean;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  undoRemove: () => void;
  announceInvalidQuantity: () => void;
  quoteItems: readonly QuoteItem[];
  quoteCount: number;
  addQuoteItem: (
    productId: string,
    selections: readonly QuoteSelection[],
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
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("unknown");
  const [announcement, setAnnouncement] = useState({ id: 0, message: "" });

  const announce = useCallback((message: string) => {
    setAnnouncement(({ id }) => ({ id: id + 1, message }));
  }, []);

  useEffect(() => {
    const storedCart = readCartFromStorage();
    const storedQuote = readQuoteFromStorage();

    setStorageStatus(
      storedCart.isAvailable && storedQuote.isAvailable
        ? "available"
        : "unavailable",
    );
    dispatch({ type: "hydrate", items: storedCart.items });
    quoteDispatch({ type: "hydrate", items: storedQuote.items });

    if (!storedCart.isAvailable || !storedQuote.isAvailable) {
      announce(
        "장바구니와 견적함을 이 브라우저에 저장할 수 없습니다. 현재 화면을 사용하는 동안만 유지됩니다.",
      );
    }
  }, [announce]);

  useEffect(() => {
    if (!state.hasHydrated || storageStatus === "unavailable") {
      return;
    }

    if (!writeCartToStorage(state.items)) {
      setStorageStatus("unavailable");
      announce(
        "장바구니와 견적함을 이 브라우저에 저장할 수 없습니다. 현재 화면을 사용하는 동안만 유지됩니다.",
      );
    }
  }, [announce, state.hasHydrated, state.items, storageStatus]);

  useEffect(() => {
    if (!quoteState.hasHydrated || storageStatus === "unavailable") {
      return;
    }

    if (!writeQuoteToStorage(quoteState.items)) {
      setStorageStatus("unavailable");
      announce(
        "장바구니와 견적함을 이 브라우저에 저장할 수 없습니다. 현재 화면을 사용하는 동안만 유지됩니다.",
      );
    }
  }, [announce, quoteState.hasHydrated, quoteState.items, storageStatus]);

  function addItem(productId: string) {
    const product = getDirectPurchaseProductById(productId);

    if (!product || !state.hasHydrated) {
      return;
    }

    const currentQuantity = getCartItem(state.items, productId)?.quantity ?? 0;
    const nextQuantity = currentQuantity + 1;

    if (!isValidCartQuantity(nextQuantity)) {
      announce("수량을 더 늘릴 수 없습니다.");
      return;
    }

    dispatch({ type: "add", productId });
    announce(
      `${product.name}을 장바구니에 담았습니다. 수량은 ${nextQuantity}개입니다.`,
    );
  }

  function setQuantity(productId: string, quantity: number) {
    const product = getDirectPurchaseProductById(productId);
    const currentItem = getCartItem(state.items, productId);

    if (!product || !currentItem || !isValidCartQuantity(quantity)) {
      announce("수량은 1 이상의 정수여야 합니다.");
      return false;
    }

    dispatch({ type: "setQuantity", productId, quantity });
    announce(`${product.name} 수량을 ${quantity}개로 변경했습니다.`);
    return true;
  }

  function incrementItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem) {
      return;
    }

    setQuantity(productId, currentItem.quantity + 1);
  }

  function decrementItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem || currentItem.quantity <= 1) {
      return;
    }

    setQuantity(productId, currentItem.quantity - 1);
  }

  function removeItem(productId: string) {
    const product = getDirectPurchaseProductById(productId);
    const currentItem = getCartItem(state.items, productId);

    if (!product || !currentItem) {
      return;
    }

    dispatch({ type: "remove", productId });
    announce(`${product.name}을 장바구니에서 제거했습니다.`);
  }

  function undoRemove() {
    const removedItem = state.lastRemovedItem;

    if (!removedItem) {
      return;
    }

    const product = getDirectPurchaseProductById(removedItem.productId);

    if (!product) {
      return;
    }

    dispatch({ type: "undoRemove" });
    announce(
      `${product.name}을 수량 ${removedItem.quantity}개로 복원했습니다.`,
    );
  }

  function addQuoteItem(
    productId: string,
    selections: readonly QuoteSelection[],
  ) {
    const product = getQuoteProductById(productId);

    if (!product || !quoteState.hasHydrated) {
      return false;
    }

    const normalizedSelections = product.optionGroups.map((group) => {
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
    const missingRequiredGroups = product.optionGroups.filter((group) => {
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
        `${missingRequiredGroups.map((group) => group.label).join(", ")} 옵션을 하나씩 선택해주세요.`,
      );
      return false;
    }

    quoteDispatch({
      type: "add",
      item: { productId, selections: normalizedSelections },
    });
    announce(`${product.name} 구성을 견적함에 담았습니다.`);
    return true;
  }

  function removeQuoteItem(productId: string) {
    const product = getQuoteProductById(productId);

    if (!product) {
      return;
    }

    quoteDispatch({ type: "remove", productId });
    announce(`${product.name} 구성을 견적함에서 제거했습니다.`);
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
    hasHydrated: state.hasHydrated,
    storageStatus,
    addItem,
    setQuantity,
    incrementItem,
    decrementItem,
    removeItem,
    undoRemove,
    announceInvalidQuantity: () => announce("수량은 1 이상의 정수여야 합니다."),
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
