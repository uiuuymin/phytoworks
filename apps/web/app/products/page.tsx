import type { Metadata } from "next";

import { ProductGrid } from "@/components/commerce/ProductGrid";
import { products } from "@/data/products";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Products | PhytoWorks Shop",
  description: "PhytoWorks의 생육·표현형 분석 시스템과 이미징 모듈",
};

export default function ProductsPage() {
  const systemProducts = products.filter((product) => product.id === "nitro");
  const imagingModules = products.filter((product) => product.id !== "nitro");

  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Products</p>
        <h1>
          <span>식물 생육 환경을 제어하고</span>
          <span>상태를 분석하는 제품</span>
        </h1>
        <p className={styles.lead}>연구 목적에 맞게 비교해 보세요.</p>
      </header>

      <section className={styles.catalog} aria-labelledby="catalog-heading">
        <h2 id="catalog-heading">생육·표현형 분석 시스템</h2>
        <ProductGrid products={systemProducts} />
      </section>

      <section className={styles.catalog} aria-labelledby="imaging-heading">
        <h2 id="imaging-heading">이미징 모듈</h2>
        <ProductGrid products={imagingModules} />
      </section>
    </main>
  );
}
