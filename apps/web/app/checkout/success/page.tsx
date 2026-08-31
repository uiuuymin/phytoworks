import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentSuccessView } from "@/components/checkout/PaymentSuccessView";

import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Payment complete | PhytoWorks Shop",
};

export default function PaymentSuccessPage() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <Suspense fallback={<p>결제 결과를 불러오고 있습니다.</p>}>
        <PaymentSuccessView />
      </Suspense>
    </main>
  );
}
