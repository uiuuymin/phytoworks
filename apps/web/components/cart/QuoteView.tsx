"use client";

import { LinkButton } from "@/components/ui/LinkButton";
import type { CatalogProduct } from "@/lib/product-types";

import { useCart } from "./CartProvider";
import { QuoteLineItem } from "./QuoteLineItem";
import styles from "./QuoteView.module.css";

type QuoteViewProps = {
  products: readonly CatalogProduct[];
};

export function QuoteView({ products }: QuoteViewProps) {
  const { quoteItems, hasHydrated, removeQuoteItem, clearQuoteItems } =
    useCart();

  if (!hasHydrated) {
    return null;
  }

  const quoteLines = quoteItems.flatMap((item) => {
    const product = products.find(
      (candidate) =>
        candidate.id === item.productId &&
        candidate.purchaseMode === "QUOTE_REQUIRED",
    );

    return product ? [{ item, product }] : [];
  });

  return (
    <section
      className={styles.section}
      id="quote-box"
      aria-labelledby="quote-heading"
    >
      <div className={styles.header}>
        <div>
          <h2 id="quote-heading">견적함</h2>
          <p className={styles.overview}>
            제품 구성 후보를 임시 저장하고 문의 전에 확인할 수 있습니다.
          </p>
        </div>
        {quoteLines.length > 0 ? (
          <button
            className={styles.clearButton}
            type="button"
            onClick={clearQuoteItems}
          >
            견적함 비우기
          </button>
        ) : null}
      </div>

      {quoteLines.length > 0 ? (
        <ul className={styles.list}>
          {quoteLines.map(({ item, product }) => (
            <li key={item.productId}>
              <QuoteLineItem
                item={item}
                product={product}
                onRemove={removeQuoteItem}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyState}>
          <h3>견적함이 비어 있습니다</h3>
          <p>NITRO 상세에서 구성을 선택해 견적함에 담아 보세요.</p>
          <LinkButton className={styles.catalogLink} href="/products/nitro">
            NITRO 구성 선택
          </LinkButton>
        </div>
      )}
    </section>
  );
}
