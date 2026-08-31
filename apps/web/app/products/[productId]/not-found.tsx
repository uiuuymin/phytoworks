import { LinkButton } from "@/components/ui/LinkButton";

import styles from "./not-found.module.css";

export default function ProductNotFound() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <div className={styles.content}>
        <h1>제품을 찾을 수 없습니다</h1>
        <p className={styles.description}>
          요청한 제품이 없거나 현재 Products 목록에 포함되어 있지 않습니다.
        </p>
        <LinkButton className={styles.catalogLink} href="/products">
          제품 목록으로 돌아가기
        </LinkButton>
      </div>
    </main>
  );
}
