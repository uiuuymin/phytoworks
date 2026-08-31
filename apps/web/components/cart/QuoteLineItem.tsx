import Link from "next/link";

import { Button } from "@/components/ui/Button";
import type { CatalogProduct } from "@/data/products";
import styles from "./QuoteView.module.css";
import type { QuoteItem } from "./quote-state";

type QuoteLineItemProps = {
  item: QuoteItem;
  product: CatalogProduct;
  onRemove: (productId: string) => void;
};

export function QuoteLineItem({ item, product, onRemove }: QuoteLineItemProps) {
  const selectedOptions = product.optionGroups.flatMap((group) => {
    const selection = item.selections.find(
      (candidate) => candidate.groupId === group.id,
    );
    const selectedOptionIds = new Set(selection?.optionIds ?? []);

    return group.options
      .filter((option) => selectedOptionIds.has(option.id))
      .map((option) => ({ groupLabel: group.label, label: option.label }));
  });

  return (
    <article className={styles.quoteItem}>
      <div className={styles.quoteInfo}>
        <p className={styles.category}>{product.category}</p>
        <h3 className={styles.productName}>
          <Link className={styles.productLink} href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
      </div>

      <dl className={styles.selectedOptions}>
        {selectedOptions.map((option) => (
          <div key={`${option.groupLabel}-${option.label}`}>
            <dt>{option.groupLabel}</dt>
            <dd>{option.label}</dd>
          </div>
        ))}
      </dl>

      <Button
        className={styles.removeQuoteButton}
        variant="secondary"
        onClick={() => onRemove(product.id)}
      >
        견적함에서 제거
      </Button>
    </article>
  );
}
