const cartSessionStorageKey = "phytoworks-shop.cart-session.v1";
const maxSessionIdLength = 128;
let memorySessionId: string | undefined;

export function getOrCreateCartSessionId(): string {
  if (memorySessionId) {
    return memorySessionId;
  }

  try {
    const storedSessionId = window.localStorage.getItem(cartSessionStorageKey);

    if (isValidSessionId(storedSessionId)) {
      memorySessionId = storedSessionId;
      return storedSessionId;
    }

    const sessionId = createSessionId();
    window.localStorage.setItem(cartSessionStorageKey, sessionId);
    memorySessionId = sessionId;
    return sessionId;
  } catch {
    memorySessionId = createSessionId();
    return memorySessionId;
  }
}

function createSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `web-${crypto.randomUUID()}`;
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidSessionId(value: string | null): value is string {
  return (
    value !== null &&
    value.trim().length > 0 &&
    value.length <= maxSessionIdLength
  );
}
