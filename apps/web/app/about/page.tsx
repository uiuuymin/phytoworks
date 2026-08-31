import type { Metadata } from "next";

import { LinkButton } from "@/components/ui/LinkButton";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About | PhytoWorks Shop",
  description: "Learn about the PhytoWorks research product platform.",
};

export default function AboutPage() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <section className={styles.intro} aria-labelledby="about-heading">
        <p className={styles.eyebrow}>About</p>
        <h1 id="about-heading">Research tools for plant science.</h1>
        <p>
          PhytoWorks brings controlled growth environments and repeat imaging
          together for plant research and breeding.
        </p>
        <LinkButton href="https://phyto-works.com/ko">
          Explore PhytoWorks
        </LinkButton>
      </section>
    </main>
  );
}
