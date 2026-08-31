import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/CheckoutView";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | PhytoWorks Shop",
  description: "주문을 준비하고 결제수단을 선택하는 checkout",
};

export default function CheckoutPage() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Checkout</p>
        <h1>주문서와 결제</h1>
        <p className={styles.lead}>
          결제수단을 선택하면 Toss Payments 결제창으로 이동합니다.
        </p>
      </header>
      <CheckoutView />
    </main>
  );
}
