import { Injectable } from "@nestjs/common";
import type {
  PaymentGatewayInput,
  PaymentGatewayResult,
} from "./payment.types.js";

export const PAYMENT_GATEWAY = Symbol("PAYMENT_GATEWAY");

export interface PaymentGateway {
  confirm(input: PaymentGatewayInput): Promise<PaymentGatewayResult>;
}

export class TossPaymentsError extends Error {
  constructor(readonly code: string) {
    super("Toss Payments approval failed.");
  }
}

@Injectable()
export class TossPaymentsGateway implements PaymentGateway {
  async confirm(input: PaymentGatewayInput): Promise<PaymentGatewayResult> {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      throw new TossPaymentsError("MISSING_SECRET_KEY");
    }

    let response: Response;
    try {
      response = await fetch(
        "https://api.tosspayments.com/v1/payments/confirm",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey: input.paymentKey,
            orderId: input.orderId,
            amount: input.amount,
          }),
          signal: AbortSignal.timeout(10_000),
        },
      );
    } catch {
      throw new TossPaymentsError("UPSTREAM_UNAVAILABLE");
    }

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new TossPaymentsError(readErrorCode(body));
    }

    if (!isRecord(body)) {
      throw new TossPaymentsError("INVALID_UPSTREAM_RESPONSE");
    }

    const paymentKey = readString(body.paymentKey);
    const orderId = readString(body.orderId);
    const totalAmount = readSafeInteger(body.totalAmount);
    const status = readString(body.status);

    if (!paymentKey || !orderId || totalAmount === null || !status) {
      throw new TossPaymentsError("INVALID_UPSTREAM_RESPONSE");
    }

    return { paymentKey, orderId, totalAmount, status };
  }
}

function readErrorCode(value: unknown): string {
  if (!isRecord(value) || typeof value.code !== "string") {
    return "UPSTREAM_REJECTED";
  }

  return /^[A-Z0-9_]{1,64}$/.test(value.code)
    ? value.code
    : "UPSTREAM_REJECTED";
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readSafeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value)
    ? value
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
