import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
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
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Cart</p>
        <h1>장바구니</h1>
        <p className={styles.lead}>
          온라인 구매 대상 제품과 필요한 수량을 확인하고 변경할 수 있습니다.
        </p>
      </header>

      <CartView products={products} />
    </main>
  );
}
