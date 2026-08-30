import type { CatalogProduct, CatalogPurchaseMode } from "@/data/products";

import styles from "./ProductCard.module.css";

const purchaseModeLabels = {
  QUOTE_REQUIRED: "견적 문의",
  DIRECT_PURCHASE: "온라인 구매",
} satisfies Record<CatalogPurchaseMode, string>;

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const headingId = `product-${product.id}-heading`;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.content}>
        <p className={styles.category}>{product.category}</p>
        <h3 id={headingId}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
      </div>

      <p className={styles.purchaseMode}>
        <span className={styles.purchaseModeLabel}>구매 방법</span>
        <span>{purchaseModeLabels[product.purchaseMode]}</span>
      </p>
    </article>
  );
}
