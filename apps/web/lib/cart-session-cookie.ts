import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const CART_SESSION_COOKIE_NAME = "phytoworks-cart-session";
export const CART_SESSION_TOKEN_HEADER = "X-Cart-Session-Token";

const SESSION_TOKEN_VERSION = "v1";
const SESSION_ID_PATTERN = /^[0-9a-f-]{36}$/i;
const SESSION_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;

export function getOrCreateCartSession(request: Request): {
  token: string;
  setCookie: string | null;
} {
  const secret = process.env.CART_SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error("CART_SESSION_SECRET is required.");
  }

  const existingToken = readCookie(request.headers.get("cookie"));

  if (existingToken && verifyCartSessionToken(existingToken, secret)) {
    return { token: existingToken, setCookie: null };
  }

  const token = createCartSessionToken(randomUUID(), secret);

  return {
    token,
    setCookie: serializeCartSessionCookie(token),
  };
}

function createCartSessionToken(sessionId: string, secret: string): string {
  const signature = createHmac("sha256", secret)
    .update(`${SESSION_TOKEN_VERSION}.${sessionId}`)
    .digest("base64url");

  return `${SESSION_TOKEN_VERSION}.${sessionId}.${signature}`;
}

function verifyCartSessionToken(token: string, secret: string): boolean {
  const [version, sessionId, signature] = token.split(".");

  if (
    version !== SESSION_TOKEN_VERSION ||
    !sessionId ||
    !SESSION_ID_PATTERN.test(sessionId) ||
    !signature
  ) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${version}.${sessionId}`)
    .digest("base64url");
  const received = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

function readCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const name = part.slice(0, separatorIndex).trim();
    if (name === CART_SESSION_COOKIE_NAME) {
      try {
        return decodeURIComponent(part.slice(separatorIndex + 1).trim());
      } catch {
        return null;
      }
    }
  }

  return null;
}

function serializeCartSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${CART_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_TOKEN_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}
