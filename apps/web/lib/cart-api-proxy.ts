import {
  CART_SESSION_TOKEN_HEADER,
  getOrCreateCartSession,
} from "./cart-session-cookie";

const defaultApiBaseUrl = "http://localhost:3001";

export async function proxyCartRequest(
  request: Request,
  apiPath: string,
): Promise<Response> {
  const headers = new Headers();
  const session = getOrCreateCartSession(request);
  const contentType = request.headers.get("content-type");

  headers.set(CART_SESSION_TOKEN_HEADER, session.token);

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  try {
    const upstream = await fetch(`${getApiBaseUrl()}${apiPath}`, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
    });
    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/json",
    );
    if (session.setCookie) {
      responseHeaders.set("Set-Cookie", session.setCookie);
    }

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        statusCode: 503,
        message: "Cart API unavailable",
        error: "Service Unavailable",
      },
      { status: 503 },
    );
  }
}

function getApiBaseUrl(): string {
  return process.env.API_BASE_URL?.trim() || defaultApiBaseUrl;
}
