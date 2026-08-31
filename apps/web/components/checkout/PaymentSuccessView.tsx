"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LinkButton } from "@/components/ui/LinkButton";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { type ConfirmPaymentResponse, confirmPayment } from "@/lib/payment-api";

import styles from "./PaymentResultView.module.css";

type ResultState =
  | { status: "loading" }
  | { status: "success"; payment: ConfirmPaymentResponse }
  | { status: "error"; message: string };

export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResultState>({ status: "loading" });
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = parseAmount(searchParams.get("amount"));

  useEffect(() => {
    if (!paymentKey || !orderId || amount === null) {
      setState({
        status: "error",
        message: "결제 결과 정보가 올바르지 않습니다.",
      });
      return;
    }

    let cancelled = false;
    confirmPayment(getOrCreateCartSessionId(), { paymentKey, orderId, amount })
      .then((payment) => {
        if (!cancelled) {
          setState({ status: "success", payment });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              "결제 승인을 완료하지 못했습니다. 주문 상태를 확인해 주세요.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [amount, orderId, paymentKey]);

  if (state.status === "loading") {
    return <p className={styles.status}>결제 승인을 확인하고 있습니다.</p>;
  }

  if (state.status === "error") {
    return (
      <section className={styles.card} aria-labelledby="payment-success-error">
        <p className={styles.eyebrow}>Payment</p>
        <h2 id="payment-success-error">결제 승인을 확인하지 못했습니다</h2>
        <p>{state.message}</p>
        <LinkButton href="/checkout">checkout으로 돌아가기</LinkButton>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby="payment-success-heading">
      <p className={styles.eyebrow}>Payment complete</p>
      <h2 id="payment-success-heading">결제가 완료되었습니다</h2>
      <p>서버가 결제 승인을 확인했습니다.</p>
      <dl className={styles.details}>
        <div>
          <dt>주문번호</dt>
          <dd>{state.payment.orderId}</dd>
        </div>
        <div>
          <dt>결제 금액</dt>
          <dd>{state.payment.amount.toLocaleString("ko-KR")}원</dd>
        </div>
      </dl>
      <LinkButton href="/">Shop으로 돌아가기</LinkButton>
    </section>
  );
}

function parseAmount(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
