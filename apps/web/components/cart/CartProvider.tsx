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
import { getOrCreateCartSessionId } from "@/lib/cart-session";

import styles from "./CartProvider.module.css";
import {
  type CartItem,
  cartReducer,
  getCartItem,
  getCartTotalQuantity,
  initialCartState,
  isValidCartQuantity,
} from "./cart-state";

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
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("loading");
  const [isPending, setIsPending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState({ id: 0, message: "" });

  const announce = useCallback((message: string) => {
    setAnnouncement(({ id }) => ({ id: id + 1, message }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const nextSessionId = getOrCreateCartSessionId();
    setSessionId(nextSessionId);

    getCart(nextSessionId)
      .then((cart) => {
        if (cancelled) {
          return;
        }

        dispatch({ type: "hydrate", items: cart.items });
        setApiStatus("available");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        dispatch({ type: "hydrate", items: [] });
        setApiStatus("unavailable");
        announce("Cart API를 사용할 수 없습니다.");
      });

    return () => {
      cancelled = true;
    };
  }, [announce]);

  const runMutation = useCallback(
    async (
      operation: (currentSessionId: string) => Promise<CartApiResponse>,
      successMessage: string,
      lastRemovedItem?: CartItem,
    ): Promise<boolean> => {
      if (
        !sessionId ||
        !state.hasHydrated ||
        apiStatus !== "available" ||
        isPending
      ) {
        return false;
      }

      setIsPending(true);

      try {
        const cart = await operation(sessionId);
        dispatch({
          type: "sync",
          items: cart.items,
          lastRemovedItem,
        });
        setApiStatus("available");
        announce(successMessage);
        return true;
      } catch {
        setApiStatus("unavailable");
        announce("Cart API를 사용할 수 없습니다. 잠시 후 다시 시도하세요.");
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [announce, apiStatus, isPending, sessionId, state.hasHydrated],
  );

  async function addItem(productId: string) {
    const currentQuantity = getCartItem(state.items, productId)?.quantity ?? 0;
    const nextQuantity = currentQuantity + 1;

    if (!isValidCartQuantity(nextQuantity)) {
      announce("수량을 더 늘릴 수 없습니다.");
      return;
    }

    await runMutation(
      (currentSessionId) => addCartItem(currentSessionId, productId),
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
      (currentSessionId) =>
        setCartItemQuantity(currentSessionId, productId, quantity),
      `상품 수량을 ${quantity}개로 변경했습니다.`,
    );
  }

  async function incrementItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem) {
      return;
    }

    await setQuantity(productId, currentItem.quantity + 1);
  }

  async function decrementItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem || currentItem.quantity <= 1) {
      return;
    }

    await setQuantity(productId, currentItem.quantity - 1);
  }

  async function removeItem(productId: string) {
    const currentItem = getCartItem(state.items, productId);

    if (!currentItem) {
      return;
    }

    await runMutation(
      (currentSessionId) => removeCartItem(currentSessionId, productId),
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
      (currentSessionId) =>
        addCartItem(
          currentSessionId,
          removedItem.productId,
          removedItem.quantity,
        ),
      `상품을 수량 ${removedItem.quantity}개로 복원했습니다.`,
    );
  }

  const announceInvalidQuantity = useCallback(() => {
    announce("수량은 1 이상의 정수여야 합니다.");
  }, [announce]);

  const contextValue: CartContextValue = {
    items: state.items,
    lastRemovedItem: state.lastRemovedItem,
    totalQuantity: getCartTotalQuantity(state.items),
    hasHydrated: state.hasHydrated,
    apiStatus,
    isPending,
    addItem,
    setQuantity,
    incrementItem,
    decrementItem,
    removeItem,
    undoRemove,
    announceInvalidQuantity,
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
