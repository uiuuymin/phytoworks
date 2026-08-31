import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { QuoteView } from "@/components/cart/QuoteView";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cart | PhytoWorks Shop",
  description: "온라인 구매 대상 제품과 수량을 관리하는 장바구니",
};

export default function CartPage() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Cart</p>
        <h1>장바구니와 견적함</h1>
        <p className={styles.lead}>
          온라인 구매 제품과 맞춤 견적 구성을 각각 관리할 수 있습니다.
        </p>
      </header>

      <div className={styles.sections}>
        <CartView />
        <QuoteView />
      </div>
    </main>
  );
}
