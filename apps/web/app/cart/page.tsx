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
      <div className={styles.sections}>
        <CartView />
        <QuoteView />
      </div>
    </main>
  );
}
