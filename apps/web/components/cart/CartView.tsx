"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import type { CatalogProduct } from "@/lib/product-types";

import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import styles from "./CartView.module.css";

type CartViewProps = {
  products: readonly CatalogProduct[];
};

export function CartView({ products }: CartViewProps) {
  const {
    items,
    lastRemovedItem,
    totalQuantity,
    hasHydrated,
    apiStatus,
    isPending,
    undoRemove,
  } = useCart();
  const directPurchaseProducts = useMemo(
    () =>
      products.filter((product) => product.purchaseMode === "DIRECT_PURCHASE"),
    [products],
  );
  const cartLines = items.flatMap((item) => {
    const product = directPurchaseProducts.find(
      (candidate) => candidate.id === item.productId,
    );

    return product ? [{ item, product }] : [];
  });
  const removedProduct = lastRemovedItem
    ? directPurchaseProducts.find(
        (product) => product.id === lastRemovedItem.productId,
      )
    : undefined;

  if (!hasHydrated) {
    return (
      <p className={styles.loading} role="status">
        장바구니를 불러오고 있습니다.
      </p>
    );
  }

  return (
    <div className={styles.view}>
      {apiStatus === "unavailable" ? (
        <p className={styles.storageNotice}>
          Cart API를 사용할 수 없습니다. 잠시 후 다시 시도하세요.
        </p>
      ) : null}

      {lastRemovedItem && removedProduct ? (
        <div className={styles.undoNotice}>
          <p>{removedProduct.name}을 장바구니에서 제거했습니다.</p>
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={() => void undoRemove()}
          >
            삭제 취소
          </Button>
        </div>
      ) : null}

      {cartLines.length === 0 ? (
        <section className={styles.emptyState} aria-labelledby="empty-heading">
          <h2 id="empty-heading">장바구니가 비어 있습니다</h2>
          <p>Product Catalog에서 온라인 구매 대상 제품을 담아 보세요.</p>
          <LinkButton className={styles.catalogLink} href="/products">
            제품 둘러보기
          </LinkButton>
        </section>
      ) : (
        <section className={styles.contents} aria-labelledby="cart-heading">
          <div className={styles.contentsHeader}>
            <div>
              <h2 id="cart-heading">장바구니 항목</h2>
              <p className={styles.overview}>
                상품 {cartLines.length}종, 총 {totalQuantity}개
              </p>
            </div>
            <LinkButton variant="secondary" href="/products">
              제품 더 둘러보기
            </LinkButton>
          </div>

          <ul className={styles.list}>
            {cartLines.map(({ item, product }) => (
              <li key={item.productId}>
                <CartLineItem product={product} quantity={item.quantity} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
