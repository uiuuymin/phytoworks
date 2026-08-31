export type ConfirmPaymentResponse = {
  id: string;
  orderId: string;
  paymentKey: string;
  status: "PENDING" | "DONE" | "FAILED";
  amount: number;
  currency: "KRW";
  failureCode: string | null;
  approvedAt: string | null;
};

export class PaymentApiError extends Error {
  readonly status: number;

  constructor(status = 503) {
    super("Payment approval is unavailable.");
    this.name = "PaymentApiError";
    this.status = status;
  }
}

export async function confirmPayment(
  sessionId: string,
  input: { paymentKey: string; orderId: string; amount: number },
): Promise<ConfirmPaymentResponse> {
  let response: Response;

  try {
    response = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Cart-Session-Id": sessionId,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    throw new PaymentApiError();
  }

  if (!response.ok) {
    throw new PaymentApiError(response.status);
  }

  try {
    const value: unknown = await response.json();
    if (!isConfirmPaymentResponse(value)) {
      throw new PaymentApiError();
    }
    return value;
  } catch (error) {
    if (error instanceof PaymentApiError) {
      throw error;
    }
    throw new PaymentApiError();
  }
}

function isConfirmPaymentResponse(
  value: unknown,
): value is ConfirmPaymentResponse {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.orderId === "string" &&
    typeof value.paymentKey === "string" &&
    (value.status === "PENDING" ||
      value.status === "DONE" ||
      value.status === "FAILED") &&
    typeof value.amount === "number" &&
    Number.isSafeInteger(value.amount) &&
    value.currency === "KRW" &&
    (value.failureCode === null || typeof value.failureCode === "string") &&
    (value.approvedAt === null || typeof value.approvedAt === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
