import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NitroProductStory } from "@/components/commerce/NitroProductStory";
import { ProductMedia } from "@/components/commerce/ProductMedia";
import { ProductPurchasePanel } from "@/components/commerce/ProductPurchasePanel";
import { ProductSpecSummary } from "@/components/commerce/ProductSpecSummary";
import { getProductById, products } from "@/data/products";

import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ productId: product.id }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getProductById(productId);

  if (!product) {
    return {
      title: "제품을 찾을 수 없음 | PhytoWorks Shop",
    };
  }

  return {
    title: `${product.name} | PhytoWorks Shop`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = getProductById(productId);

  if (!product) {
    notFound();
  }

  const isNitro = product.id === "nitro";
  const isQuoteRequired = product.purchaseMode === "QUOTE_REQUIRED";

  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <nav className={styles.breadcrumb} aria-label="현재 위치">
        <ol className={styles.breadcrumbList}>
          <li>
            <Link className={styles.breadcrumbLink} href="/products">
              제품
            </Link>
          </li>
          <li className={styles.breadcrumbCurrent} aria-current="page">
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </li>
        </ol>
      </nav>

      <article className={styles.article} aria-labelledby="product-heading">
        <div className={styles.hero}>
          <ProductMedia media={product.details.media} />

          <div className={styles.heroContent}>
            <div className={styles.headingGroup}>
              <h1 id="product-heading">{product.name}</h1>
              <p className={styles.lead}>{product.description}</p>
            </div>

            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#configure">
                {isQuoteRequired ? "Customize" : "Buy online"}
              </a>
              {isQuoteRequired ? (
                <a
                  className={styles.secondaryAction}
                  href="https://phyto-works.com/ko?source=nitro"
                >
                  Request a quote
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {isNitro ? (
          <NitroProductStory
            summary={product.details.summary}
            features={product.details.features}
          />
        ) : null}

        <div className={styles.detailSections}>
          {!isNitro ? (
            <>
              <section className={styles.detailSection}>
                <h2>제품 개요</h2>
                <p>{product.details.summary}</p>
              </section>

              <section className={styles.detailSection}>
                <h2>주요 기능</h2>
                <ul className={styles.featureList}>
                  {product.details.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}

          <ProductSpecSummary specGroups={product.specGroups} />

          <section id="configure" className={styles.configureSection}>
            <ProductPurchasePanel
              productId={product.id}
              purchaseMode={product.purchaseMode}
              optionGroups={product.optionGroups}
            />
          </section>

          {isQuoteRequired ? (
            <section
              className={styles.finalCta}
              aria-labelledby="final-cta-heading"
            >
              <p className={styles.finalEyebrow}>Start your research setup</p>
              <h2 id="final-cta-heading">
                연구 목적에 맞는 NITRO 구성을 상담해 보세요.
              </h2>
              <a
                className={styles.primaryAction}
                href="https://phyto-works.com/ko?source=nitro"
              >
                Request a quote
              </a>
            </section>
          ) : null}
        </div>
      </article>
    </main>
  );
}
