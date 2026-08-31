import Image from "next/image";

import styles from "./ProductMedia.module.css";

type ProductMediaProps = {
  media: {
    src: string;
    alt: string;
  };
};

export function ProductMedia({ media }: ProductMediaProps) {
  return (
    <figure className={styles.media}>
      <Image
        className={styles.image}
        fill
        src={media.src}
        alt={media.alt}
        priority
        sizes="(min-width: 64rem) 58vw, 100vw"
      />
    </figure>
  );
}
