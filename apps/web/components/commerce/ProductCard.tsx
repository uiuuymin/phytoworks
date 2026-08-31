import Image from "next/image";
import Link from "next/link";

import { getProductMedia } from "@/lib/product-presentation";
import { type CatalogProduct, purchaseModeLabels } from "@/lib/product-types";

import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const headingId = `product-${product.id}-heading`;
  const { media, thumbnail } = getProductMedia(product.id);
  const hoverMedia = thumbnail ? media : undefined;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.media}>
        <Image
          className={styles.thumbnail}
          fill
          src={(thumbnail ?? media).src}
          alt={(thumbnail ?? media).alt}
          loading="lazy"
          sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
        />
        {hoverMedia ? (
          <Image
            className={styles.hoverMedia}
            fill
            src={hoverMedia.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
          />
        ) : null}
      </div>

      <div className={styles.content}>
        <h3 id={headingId}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
      </div>

      <div className={styles.footer}>
        <p className={styles.purchaseMode}>
          {purchaseModeLabels[product.purchaseMode]}
        </p>
        <p className={styles.purchaseMode}>
          <span className={styles.purchaseModeLabel}>가격 참고</span>
          <span>{product.pricing.displayLabel}</span>
        </p>
        <Link className={styles.detailLink} href={`/products/${product.id}`}>
          자세히 보기
        </Link>
      </div>
    </article>
  );
}
