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
  retainProductIds: (productIds: readonly string[]) => void;
  announceInvalidQuantity: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("unknown");
  const [announcement, setAnnouncement] = useState({ id: 0, message: "" });

  const announce = useCallback((message: string) => {
    setAnnouncement(({ id }) => ({ id: id + 1, message }));
  }, []);

  useEffect(() => {
    const storedCart = readCartFromStorage();

    setStorageStatus(storedCart.isAvailable ? "available" : "unavailable");
    dispatch({ type: "hydrate", items: storedCart.items });

    if (!storedCart.isAvailable) {
      announce(
        "장바구니를 이 브라우저에 저장할 수 없습니다. 현재 화면을 사용하는 동안만 유지됩니다.",
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
        "장바구니를 이 브라우저에 저장할 수 없습니다. 현재 화면을 사용하는 동안만 유지됩니다.",
      );
    }
  }, [announce, state.hasHydrated, state.items, storageStatus]);

  function addItem(productId: string) {
    if (!state.hasHydrated) {
      return;
    }

    const currentQuantity = getCartItem(state.items, productId)?.quantity ?? 0;
    const nextQuantity = currentQuantity + 1;

    if (!isValidCartQuantity(nextQuantity)) {
      announce("수량을 더 늘릴 수 없습니다.");
      return;
    }

    dispatch({ type: "add", productId });
    announce(`상품을 장바구니에 담았습니다. 수량은 ${nextQuantity}개입니다.`);
  }

  function setQuantity(productId: string, quantity: number) {
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem || !isValidCartQuantity(quantity)) {
      announce("수량은 1 이상의 정수여야 합니다.");
      return false;
    }

    dispatch({ type: "setQuantity", productId, quantity });
    announce(`상품 수량을 ${quantity}개로 변경했습니다.`);
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
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem) {
      return;
    }

    dispatch({ type: "remove", productId });
    announce("상품을 장바구니에서 제거했습니다.");
  }

  function undoRemove() {
    const removedItem = state.lastRemovedItem;

    if (!removedItem) {
      return;
    }

    dispatch({ type: "undoRemove" });
    announce(`상품을 수량 ${removedItem.quantity}개로 복원했습니다.`);
  }

  const retainProductIds = useCallback((productIds: readonly string[]) => {
    dispatch({ type: "retainProducts", productIds });
  }, []);

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
    retainProductIds,
    announceInvalidQuantity: () => announce("수량은 1 이상의 정수여야 합니다."),
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
