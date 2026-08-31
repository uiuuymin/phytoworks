import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { QuoteView } from "@/components/cart/QuoteView";
import { ProductApiUnavailable } from "@/components/feedback/ProductApiUnavailable";
import { getProducts } from "@/lib/product-api";
import type { CatalogProduct } from "@/lib/product-types";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cart | PhytoWorks Shop",
  description: "온라인 구매 대상 제품과 수량을 관리하는 장바구니",
};

export default async function CartPage() {
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
      <div className={styles.sections}>
        <CartView products={products} />
        <QuoteView products={products} />
      </div>
    </main>
  );
}
