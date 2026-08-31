export type CartItemReadModel = {
  productId: string;
  quantity: number;
};

export type CartReadModel = {
  items: readonly CartItemReadModel[];
  totalQuantity: number;
};
