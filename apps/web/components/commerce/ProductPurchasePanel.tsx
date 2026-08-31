import { AddToCartButton } from "@/components/cart/AddToCartButton";
import {
  type CatalogPurchaseMode,
  type ProductPricing,
  purchaseModeLabels,
} from "@/lib/product-types";

import styles from "./ProductPurchasePanel.module.css";

const officialInquiryUrl = "https://phyto-works.com/ko?source=nitro";

type ProductPurchasePanelProps = {
  productId: string;
  purchaseMode: CatalogPurchaseMode;
  pricing: ProductPricing;
};

export function ProductPurchasePanel({
  productId,
  purchaseMode,
  pricing,
}: ProductPurchasePanelProps) {
  const isQuoteRequired = purchaseMode === "QUOTE_REQUIRED";

  return (
    <section className={styles.panel} aria-labelledby="purchase-heading">
      <div className={styles.headingGroup}>
        <h2 id="purchase-heading" className={styles.heading}>
          구매 방법
        </h2>
        <p className={styles.mode}>{purchaseModeLabels[purchaseMode]}</p>
      </div>

      <p className={styles.pricing}>
        <span className={styles.heading}>가격 참고</span>
        <span>{pricing.displayLabel}</span>
        <span className={styles.description}>
          카탈로그 또는 Demo 참고값이며 실제 확정 판매 가격이 아닙니다.
        </span>
      </p>

      {isQuoteRequired ? (
        <>
          <p className={styles.description}>
            제품 구성과 도입 상담은 PhytoWorks 공식 문의 페이지에서 진행합니다.
          </p>
          <a className={styles.inquiryLink} href={officialInquiryUrl}>
            PhytoWorks에 견적 문의
          </a>
        </>
      ) : (
        <AddToCartButton className={styles.cartButton} productId={productId} />
      )}
    </section>
  );
}
