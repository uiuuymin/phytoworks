import Image from "next/image";

import { LinkButton } from "@/components/ui/LinkButton";

import styles from "./page.module.css";

export default function Home() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <section className={styles.hero} aria-labelledby="home-heading">
        <h1 id="home-heading">
          <span>식물 연구와 육종을 위한</span>
          <span>기술을 탐색합니다</span>
        </h1>
        <p className={styles.lead}>
          연구 목적에 맞는 생육 시스템과 이미징 모듈을 비교하고
          <br />
          필요한 기술을 찾아보세요.
        </p>
        <LinkButton className={styles.catalogLink} href="/products">
          제품 둘러보기
        </LinkButton>
        <figure className={styles.heroMedia}>
          <Image
            src="/images/products/nitro-hero-cutout.png"
            alt="NITRO Plant Growth System chamber"
            width={1152}
            height={1536}
            priority
            sizes="(min-width: 64rem) 46vw, 92vw"
          />
        </figure>
      </section>
    </main>
  );
}
