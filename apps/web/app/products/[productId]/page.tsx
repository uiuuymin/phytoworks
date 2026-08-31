import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductMediaPlaceholder } from "@/components/commerce/ProductMediaPlaceholder";
import { ProductOptionSummary } from "@/components/commerce/ProductOptionSummary";
import { ProductPurchasePanel } from "@/components/commerce/ProductPurchasePanel";
import { ProductApiUnavailable } from "@/components/feedback/ProductApiUnavailable";
import { getProductById } from "@/lib/product-api";
import type { CatalogProduct } from "@/lib/product-types";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  let product: CatalogProduct | null;

  try {
    product = await getProductById(productId);
  } catch {
    return {
      title: "제품 정보를 불러올 수 없음 | PhytoWorks Shop",
    };
  }

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
  let product: CatalogProduct | null;

  try {
    product = await getProductById(productId);
  } catch {
    return <ProductApiUnavailable />;
  }

  if (!product) {
    notFound();
  }

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
        <div className={styles.productLayout}>
          <ProductMediaPlaceholder
            category={product.category}
            label={product.details.mediaLabel}
          />

          <div className={styles.summary}>
            <div className={styles.headingGroup}>
              <p className={styles.category}>{product.category}</p>
              <h1 id="product-heading">{product.name}</h1>
              <p className={styles.lead}>{product.description}</p>
            </div>

            <ProductPurchasePanel
              productId={product.id}
              purchaseMode={product.purchaseMode}
              pricing={product.pricing}
            />
          </div>
        </div>

        <div className={styles.detailSections}>
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

          <ProductOptionSummary optionGroups={product.optionGroups} />
        </div>
      </article>
    </main>
  );
}
