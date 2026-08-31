"use client";

import { useSearchParams } from "next/navigation";

import { LinkButton } from "@/components/ui/LinkButton";

import styles from "./PaymentResultView.module.css";

export function PaymentFailView() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <section className={styles.card} aria-labelledby="payment-fail-heading">
      <p className={styles.eyebrow}>Payment</p>
      <h2 id="payment-fail-heading">결제가 완료되지 않았습니다</h2>
      <p>{message || "결제 과정이 취소되었거나 승인되지 않았습니다."}</p>
      {code ? <p className={styles.code}>오류 코드: {code}</p> : null}
      <LinkButton href="/checkout">결제 다시 시도하기</LinkButton>
    </section>
  );
}
