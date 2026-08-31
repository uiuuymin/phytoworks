"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";
import type { CatalogProduct } from "@/data/products";

import { useCart } from "./CartProvider";
import styles from "./CartView.module.css";

type CartLineItemProps = {
  product: CatalogProduct;
  quantity: number;
};

export function CartLineItem({ product, quantity }: CartLineItemProps) {
  const {
    setQuantity,
    incrementItem,
    decrementItem,
    removeItem,
    announceInvalidQuantity,
  } = useCart();
  const quantityInputId = useId();
  const quantityHintId = useId();
  const headingId = useId();
  const [draftQuantity, setDraftQuantity] = useState(String(quantity));

  useEffect(() => {
    setDraftQuantity(String(quantity));
  }, [quantity]);

  function handleQuantityChange(event: ChangeEvent<HTMLInputElement>) {
    setDraftQuantity(event.currentTarget.value);
  }

  function commitQuantity() {
    if (draftQuantity === "") {
      setDraftQuantity(String(quantity));
      announceInvalidQuantity();
      return;
    }

    const nextQuantity = Number(draftQuantity);

    if (!setQuantity(product.id, nextQuantity)) {
      setDraftQuantity(String(quantity));
      return;
    }

    setDraftQuantity(String(nextQuantity));
  }

  function handleQuantityKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    event.currentTarget.blur();
  }

  return (
    <article className={styles.lineItem} aria-labelledby={headingId}>
      <div className={styles.productInfo}>
        <p className={styles.category}>{product.category}</p>
        <h3 id={headingId} className={styles.productName}>
          <Link className={styles.productLink} href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
      </div>

      <div className={styles.itemActions}>
        <fieldset className={styles.quantityGroup}>
          <legend className={styles.quantityLegend}>
            {product.name} 수량 변경
          </legend>
          <label className={styles.quantityLabel} htmlFor={quantityInputId}>
            수량
          </label>
          <div className={styles.quantityControls}>
            <Button
              className={styles.quantityButton}
              variant="secondary"
              disabled={quantity <= 1}
              aria-label={`${product.name} 수량 줄이기`}
              onClick={() => decrementItem(product.id)}
            >
              감소
            </Button>
            <input
              id={quantityInputId}
              className={styles.quantityInput}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={draftQuantity}
              aria-describedby={quantityHintId}
              onBlur={commitQuantity}
              onChange={handleQuantityChange}
              onKeyDown={handleQuantityKeyDown}
            />
            <Button
              className={styles.quantityButton}
              variant="secondary"
              disabled={quantity >= Number.MAX_SAFE_INTEGER}
              aria-label={`${product.name} 수량 늘리기`}
              onClick={() => incrementItem(product.id)}
            >
              증가
            </Button>
          </div>
          <p id={quantityHintId} className={styles.quantityHint}>
            1 이상의 정수를 입력하세요.
          </p>
        </fieldset>

        <Button
          className={styles.removeButton}
          variant="secondary"
          aria-label={`${product.name} 제거`}
          onClick={() => removeItem(product.id)}
        >
          제거
        </Button>
      </div>
    </article>
  );
}
