import Link from "next/link";

import { type CatalogProduct, purchaseModeLabels } from "@/data/products";

import styles from "./ProductCard.module.css";

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

      <div className={styles.footer}>
        <p className={styles.purchaseMode}>
          <span className={styles.purchaseModeLabel}>구매 방법</span>
          <span>{purchaseModeLabels[product.purchaseMode]}</span>
        </p>
        <Link className={styles.detailLink} href={`/products/${product.id}`}>
          상세 보기
        </Link>
      </div>
    </article>
  );
}
