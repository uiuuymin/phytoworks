import type { Metadata } from "next";

import { ProductGrid } from "@/components/commerce/ProductGrid";
import { ProductApiUnavailable } from "@/components/feedback/ProductApiUnavailable";
import { getProducts } from "@/lib/product-api";
import type { CatalogProduct } from "@/lib/product-types";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Catalog | PhytoWorks Shop",
  description:
    "PhytoWorks의 연구·육종 장비와 이미징 모듈을 살펴보는 Product Catalog",
};

export default async function ProductsPage() {
  let products: readonly CatalogProduct[];

  try {
    products = await getProducts();
  } catch {
    return <ProductApiUnavailable />;
  }

  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Product Catalog</p>
        <h1>연구 제품과 이미징 모듈</h1>
        <p className={styles.lead}>
          식물 생육 환경을 제어하고 상태를 분석하는 제품을 연구 목적에 맞게
          비교해 보세요.
        </p>
      </header>

      <section className={styles.catalog} aria-labelledby="catalog-heading">
        <h2 id="catalog-heading">제품</h2>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
