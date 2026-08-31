"use client";

import { Button } from "@/components/ui/Button";

import { useCart } from "./CartProvider";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
};

export function AddToCartButton({
  productId,
  className,
}: AddToCartButtonProps) {
  const { addItem, hasHydrated } = useCart();

  return (
    <Button
      className={className}
      disabled={!hasHydrated}
      onClick={() => addItem(productId)}
    >
      장바구니 담기
    </Button>
  );
}
