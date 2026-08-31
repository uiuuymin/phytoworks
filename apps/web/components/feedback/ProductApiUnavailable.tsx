import styles from "@/app/error.module.css";
import { LinkButton } from "@/components/ui/LinkButton";

export function ProductApiUnavailable() {
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
        <LinkButton href="/products">다시 시도</LinkButton>
        <LinkButton href="/" variant="secondary">
          홈으로
        </LinkButton>
      </div>
    </main>
  );
}
