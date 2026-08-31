"use client";

import { useEffect } from "react";

import { LinkButton } from "@/components/ui/LinkButton";

import styles from "./error.module.css";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <p>Product API</p>
      <h1>제품 정보를 불러오지 못했습니다</h1>
      <p className={styles.description}>
        잠시 후 다시 시도하거나 Product Catalog로 돌아가 주세요.
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={reset}>
          다시 시도
        </button>
        <LinkButton href="/products" variant="secondary">
          제품 목록
        </LinkButton>
      </div>
    </main>
  );
}
