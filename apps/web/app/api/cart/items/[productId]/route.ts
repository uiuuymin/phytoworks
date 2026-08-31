import { proxyCartRequest } from "@/lib/cart-api-proxy";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ productId: string }> },
): Promise<Response> {
  const { productId } = await context.params;
  return proxyCartRequest(
    request,
    `/api/cart/items/${encodeURIComponent(productId)}`,
  );
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ productId: string }> },
): Promise<Response> {
  const { productId } = await context.params;
  return proxyCartRequest(
    request,
    `/api/cart/items/${encodeURIComponent(productId)}`,
  );
}
