import { describe, expect, it } from "vitest";
import {
  createCartSessionToken,
  verifyCartSessionToken,
} from "./cart-session.js";

describe("Cart session token", () => {
  const secret = "test-cart-session-secret-32-characters";
  const sessionId = "00000000-0000-4000-8000-000000000006";

  it("verifies a token created with the same secret", () => {
    const token = createCartSessionToken(sessionId, secret);

    expect(verifyCartSessionToken(token, secret)).toBe(sessionId);
  });

  it("rejects a token with a changed signature or secret", () => {
    const token = createCartSessionToken(sessionId, secret);

    expect(verifyCartSessionToken(`${token}x`, secret)).toBeNull();
    expect(verifyCartSessionToken(token, `${secret}x`)).toBeNull();
    expect(verifyCartSessionToken("plain-session-id", secret)).toBeNull();
  });
});
