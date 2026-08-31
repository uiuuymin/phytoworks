import type { CatalogProduct } from "@/lib/product-types";

import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

type ProductGridProps = {
  products: readonly CatalogProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li className={styles.item} key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
