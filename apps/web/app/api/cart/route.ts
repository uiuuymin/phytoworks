import { proxyCartRequest } from "@/lib/cart-api-proxy";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return proxyCartRequest(request, "/api/cart");
}
