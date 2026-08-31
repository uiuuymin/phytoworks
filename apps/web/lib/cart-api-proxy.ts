const defaultApiBaseUrl = "http://localhost:3001";

export async function proxyCartRequest(
  request: Request,
  apiPath: string,
): Promise<Response> {
  const headers = new Headers();
  const sessionId = request.headers.get("x-cart-session-id");
  const contentType = request.headers.get("content-type");

  if (sessionId) {
    headers.set("X-Cart-Session-Id", sessionId);
  }

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
