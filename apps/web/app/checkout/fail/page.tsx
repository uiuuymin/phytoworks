import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentFailView } from "@/components/checkout/PaymentFailView";

import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Payment failed | PhytoWorks Shop",
};

export default function PaymentFailPage() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <Suspense fallback={<p>결제 결과를 불러오고 있습니다.</p>}>
        <PaymentFailView />
      </Suspense>
    </main>
  );
}
