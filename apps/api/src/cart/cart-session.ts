import { createHmac, timingSafeEqual } from "node:crypto";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";

const SESSION_TOKEN_VERSION = "v1";
const SESSION_ID_PATTERN = /^[0-9a-f-]{36}$/i;
const MAX_SESSION_TOKEN_LENGTH = 256;

export function requireCartSessionId(sessionToken: string | undefined): string {
  const secret = process.env.CART_SESSION_SECRET?.trim();

  if (!secret) {
    throw new InternalServerErrorException("Cart session is unavailable");
  }

  if (!sessionToken) {
    throw new BadRequestException("Cart session is required");
  }

  const sessionId = verifyCartSessionToken(sessionToken.trim(), secret);

  if (!sessionId) {
    throw new BadRequestException("Cart session is invalid");
  }

  return sessionId;
}

export function createCartSessionToken(
  sessionId: string,
  secret: string,
): string {
  const signature = createHmac("sha256", secret)
    .update(`${SESSION_TOKEN_VERSION}.${sessionId}`)
    .digest("base64url");

  return `${SESSION_TOKEN_VERSION}.${sessionId}.${signature}`;
}

export function verifyCartSessionToken(
  token: string,
  secret: string,
): string | null {
  if (token.length > MAX_SESSION_TOKEN_LENGTH) {
    return null;
  }

  const [version, sessionId, signature] = token.split(".");

  if (
    version !== SESSION_TOKEN_VERSION ||
    !sessionId ||
    !SESSION_ID_PATTERN.test(sessionId) ||
    !signature
  ) {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${version}.${sessionId}`)
    .digest("base64url");
  const received = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");

  if (received.length !== expected.length) {
    return null;
  }

  return timingSafeEqual(received, expected) ? sessionId : null;
}
