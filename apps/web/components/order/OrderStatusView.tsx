"use client";

import { useEffect, useState } from "react";

import { LinkButton } from "@/components/ui/LinkButton";
import { getOrder, type OrderApiResponse } from "@/lib/order-api";

import styles from "./OrderStatusView.module.css";

type OrderStatusViewProps = {
  orderId: string;
};

type ViewState =
  | { status: "loading" }
  | { status: "loaded"; order: OrderApiResponse }
  | { status: "error" };

export function OrderStatusView({ orderId }: OrderStatusViewProps) {
  const [state, setState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getOrder(orderId)
      .then((order) => {
        if (!cancelled) {
          setState({ status: "loaded", order });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (state.status === "loading") {
    return (
      <p className={styles.status} role="status">
        주문 상태를 확인하고 있습니다.
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <section className={styles.card} aria-labelledby="order-status-error">
        <p className={styles.eyebrow}>Order status</p>
        <h2 id="order-status-error">주문을 확인하지 못했습니다</h2>
        <p>
          주문이 없거나 현재 Cart session에서 조회할 수 없습니다. 주문번호와
          브라우저의 Cart session을 확인해 주세요.
        </p>
        <LinkButton href="/products">Products로 돌아가기</LinkButton>
      </section>
    );
  }

  const { order } = state;
  const status = getStatusPresentation(order.status);

  return (
    <section className={styles.card} aria-labelledby="order-status-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Order status</p>
          <h2 id="order-status-heading">주문 상태</h2>
        </div>
        <span className={`${styles.badge} ${styles[status.tone]}`}>
          {status.label}
        </span>
      </div>

      <p className={styles.message}>{status.message}</p>

      <dl className={styles.details}>
        <div>
          <dt>주문번호</dt>
          <dd>{order.id}</dd>
        </div>
        <div>
          <dt>주문 금액</dt>
          <dd>{formatAmount(order.totalAmount, order.currency)}</dd>
        </div>
      </dl>

      <ul className={styles.items} aria-label="주문 상품">
        {order.items.map((item) => (
          <li key={item.productId}>
            <span>
              {item.productName} × {item.quantity}
            </span>
            <strong>{formatAmount(item.lineAmount, order.currency)}</strong>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        {order.status === "PENDING" ? (
          <LinkButton
            href={`/checkout?orderId=${encodeURIComponent(order.id)}`}
          >
            결제 계속하기
          </LinkButton>
        ) : null}
        <LinkButton href="/products" variant="secondary">
          Products로 돌아가기
        </LinkButton>
      </div>
    </section>
  );
}

function getStatusPresentation(status: OrderApiResponse["status"]): {
  label: string;
  message: string;
  tone: "pending" | "paid" | "cancelled";
} {
  switch (status) {
    case "PAID":
      return {
        label: "결제 완료",
        message: "결제가 완료된 주문입니다.",
        tone: "paid",
      };
    case "CANCELLED":
      return {
        label: "취소됨",
        message: "취소된 주문입니다.",
        tone: "cancelled",
      };
    default:
      return {
        label: "결제 대기",
        message: "아직 결제가 완료되지 않은 주문입니다.",
        tone: "pending",
      };
  }
}

function formatAmount(amount: number, currency: OrderApiResponse["currency"]) {
  return `${amount.toLocaleString("ko-KR")} ${currency}`;
}
