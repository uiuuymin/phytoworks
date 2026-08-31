import Image from "next/image";
import Link from "next/link";

import { type CatalogProduct, purchaseModeLabels } from "@/data/products";

import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const headingId = `product-${product.id}-heading`;
  const thumbnail = product.details.thumbnail;
  const hoverMedia =
    thumbnail && product.details.media.src !== thumbnail.src
      ? product.details.media
      : undefined;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.media}>
        {thumbnail ? (
          <>
            <Image
              className={styles.thumbnail}
              fill
              src={thumbnail.src}
              alt={thumbnail.alt}
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
          </>
        ) : (
          <div className={styles.mediaPlaceholder}>
            <span>제품 사진 준비 중</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 id={headingId}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
      </div>

      <div className={styles.footer}>
        <p className={styles.purchaseMode}>
          {purchaseModeLabels[product.purchaseMode]}
        </p>
        <Link className={styles.detailLink} href={`/products/${product.id}`}>
          자세히 보기
        </Link>
      </div>
    </article>
  );
}
