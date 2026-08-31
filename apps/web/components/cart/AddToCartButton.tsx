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
  const { addItem, hasHydrated, apiStatus, isPending } = useCart();

  return (
    <Button
      className={className}
      disabled={!hasHydrated || apiStatus === "loading" || isPending}
      onClick={() => void addItem(productId)}
    >
      장바구니 담기
    </Button>
  );
}
