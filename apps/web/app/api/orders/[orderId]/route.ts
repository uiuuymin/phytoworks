import { proxyCartRequest } from "@/lib/cart-api-proxy";

export const dynamic = "force-dynamic";

export function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
): Promise<Response> {
  return context.params.then(({ orderId }) =>
    proxyCartRequest(request, `/api/orders/${encodeURIComponent(orderId)}`),
  );
}
