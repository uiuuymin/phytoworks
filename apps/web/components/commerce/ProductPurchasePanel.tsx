import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { QuoteConfigurator } from "@/components/commerce/QuoteConfigurator";
import {
  type CatalogPurchaseMode,
  type ProductOptionGroup,
  purchaseModeLabels,
} from "@/lib/product-types";

import styles from "./ProductPurchasePanel.module.css";

const officialInquiryUrl = "https://phyto-works.com/ko?source=nitro";

type ProductPurchasePanelProps = {
  productId: string;
  purchaseMode: CatalogPurchaseMode;
  optionGroups: readonly ProductOptionGroup[];
};

export function ProductPurchasePanel({
  productId,
  purchaseMode,
  optionGroups,
}: ProductPurchasePanelProps) {
  const isQuoteRequired = purchaseMode === "QUOTE_REQUIRED";

  return (
    <section className={styles.panel} aria-labelledby="purchase-heading">
      <div className={styles.headingGroup}>
        <h2 id="purchase-heading" className={styles.heading}>
          {isQuoteRequired ? "Configure NITRO" : "Purchase"}
        </h2>
        <p className={styles.mode}>
          {isQuoteRequired
            ? "Request a quote"
            : purchaseModeLabels[purchaseMode]}
        </p>
      </div>

      {isQuoteRequired ? (
        <>
          <p className={styles.description}>
            Select a configuration, save it to the quote box, and discuss your
            research setup with PhytoWorks.
          </p>
          <QuoteConfigurator
            productId={productId}
            optionGroups={optionGroups}
          />
          <a className={styles.inquiryLink} href={officialInquiryUrl}>
            Request a quote from PhytoWorks
          </a>
        </>
      ) : (
        <AddToCartButton className={styles.cartButton} productId={productId} />
      )}
    </section>
  );
}
