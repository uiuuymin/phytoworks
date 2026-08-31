"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { createPendingOrder, type OrderApiResponse } from "@/lib/order-api";

import styles from "./CheckoutView.module.css";

type CheckoutStatus =
  | "idle"
  | "preparing"
  | "loading"
  | "ready"
  | "requesting"
  | "error";

const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() ?? "";

export function CheckoutView() {
  const [order, setOrder] = useState<OrderApiResponse | null>(null);
  const [widgets, setWidgets] = useState<TossPaymentWidgets | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [message, setMessage] = useState("");

  const orderName = useMemo(() => {
    if (!order || order.items.length === 0) {
      return "PhytoWorks Shop 주문";
    }

    const [firstItem, ...remainingItems] = order.items;
    const suffix =
      remainingItems.length > 0 ? ` 외 ${remainingItems.length}건` : "";
    return `${firstItem.productName}${suffix}`.slice(0, 100);
  }, [order]);

  useEffect(() => {
    if (!order || !sdkLoaded || !tossClientKey) {
      return;
    }

    let cancelled = false;
    let paymentMethodsWidget: { destroy(): void } | undefined;
    let agreementWidget: { destroy(): void } | undefined;
    const currentOrder = order;

    async function renderPaymentUi() {
      setStatus("loading");
      setMessage("");

      const tossPayments = window.TossPayments?.(tossClientKey);
      if (!tossPayments) {
        throw new Error("Toss Payments SDK를 불러오지 못했습니다.");
      }

      const nextWidgets = tossPayments.widgets({ customerKey: "ANONYMOUS" });
      await nextWidgets.setAmount({
        currency: currentOrder.currency,
        value: currentOrder.totalAmount,
      });
      paymentMethodsWidget = await nextWidgets.renderPaymentMethods({
        selector: "#payment-method",
      });
      agreementWidget = await nextWidgets.renderAgreement({
        selector: "#payment-agreement",
      });

      if (!cancelled) {
        setWidgets(nextWidgets);
        setStatus("ready");
      }
    }

    renderPaymentUi().catch(() => {
      if (!cancelled) {
        setStatus("error");
        setMessage("결제 UI를 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
      }
    });

    return () => {
      cancelled = true;
      paymentMethodsWidget?.destroy();
      agreementWidget?.destroy();
      setWidgets(null);
    };
  }, [order, sdkLoaded]);

  async function prepareOrder() {
    if (!tossClientKey) {
      setStatus("error");
      setMessage(
        "NEXT_PUBLIC_TOSS_CLIENT_KEY를 설정해야 결제를 시작할 수 있습니다.",
      );
      return;
    }

    setStatus("preparing");
    setMessage("");

    try {
      const nextOrder = await createPendingOrder(getOrCreateCartSessionId());
      setOrder(nextOrder);
    } catch {
      setStatus("error");
      setMessage(
        "주문을 준비하지 못했습니다. 장바구니를 확인한 뒤 다시 시도하세요.",
      );
    }
  }

  async function requestPayment() {
    if (!order || !widgets) {
      return;
    }

    setStatus("requesting");
    setMessage("");

    try {
      await widgets.requestPayment({
        orderId: order.id,
        orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch {
      setStatus("error");
      setMessage(
        "결제창을 열지 못했습니다. 결제수단을 확인한 뒤 다시 시도하세요.",
      );
    }
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
        onError={() => {
          setStatus("error");
          setMessage("Toss Payments SDK를 불러오지 못했습니다.");
        }}
      />

      <section className={styles.layout} aria-labelledby="checkout-heading">
        <div className={styles.card}>
          <p className={styles.eyebrow}>Checkout</p>
          <h2 id="checkout-heading">결제 준비</h2>
          <p className={styles.description}>
            서버가 장바구니를 다시 확인해 주문 금액을 계산한 뒤 결제창을 엽니다.
          </p>

          {!order ? (
            <Button
              disabled={status === "preparing"}
              onClick={() => void prepareOrder()}
            >
              {status === "preparing" ? "주문 준비 중" : "결제창 준비하기"}
            </Button>
          ) : (
            <>
              <div className={styles.summary}>
                <span>주문 금액</span>
                <strong>{order.totalAmount.toLocaleString("ko-KR")}원</strong>
              </div>
              <p className={styles.notice}>
                Demo 가격이며, 결제 승인 여부는 서버가 최종 확인합니다.
              </p>
              <Button
                disabled={status !== "ready"}
                onClick={() => void requestPayment()}
              >
                {status === "requesting" ? "결제창 여는 중" : "결제하기"}
              </Button>
            </>
          )}

          {message ? (
            <p className={styles.message} role="alert">
              {message}
            </p>
          ) : null}
        </div>

        <div className={styles.paymentCard}>
          <div id="payment-method" />
          <div id="payment-agreement" />
        </div>
      </section>
    </>
  );
}
