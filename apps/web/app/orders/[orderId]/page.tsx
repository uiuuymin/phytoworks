import type { Metadata } from "next";

import { OrderStatusView } from "@/components/order/OrderStatusView";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order status | PhytoWorks Shop",
  description: "PhytoWorks Shop 주문 상태를 확인합니다.",
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Order</p>
        <h1>주문 상태 확인</h1>
        <p className={styles.lead}>
          주문에 연결된 Cart session으로 현재 상태를 조회합니다.
        </p>
      </header>
      <OrderStatusView orderId={orderId} />
    </main>
  );
}
