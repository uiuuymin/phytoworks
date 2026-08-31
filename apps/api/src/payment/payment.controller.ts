import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { PaymentService } from "./payment.service.js";
import type { ConfirmPaymentInput, PaymentReadModel } from "./payment.types.js";

const SESSION_HEADER = "x-cart-session-id";

@Controller("api/payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("confirm")
  @HttpCode(HttpStatus.OK)
  confirm(
    @Headers(SESSION_HEADER) sessionId: string | undefined,
    @Body() body: unknown,
  ): Promise<PaymentReadModel> {
    const request = parseConfirmBody(body);
    return this.paymentService.confirm({
      ...request,
      sessionId: requireSessionId(sessionId),
    });
  }
}

function parseConfirmBody(
  body: unknown,
): Omit<ConfirmPaymentInput, "sessionId"> {
  if (!isRecord(body)) {
    throw new BadRequestException("Payment request is invalid");
  }

  const paymentKey = readString(body.paymentKey);
  const orderId = readString(body.orderId);
  const amount = readPositiveInteger(body.amount);

  if (!paymentKey || paymentKey.length > 200) {
    throw new BadRequestException("Payment key is invalid");
  }

  if (!orderId || !/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) {
    throw new BadRequestException("Order ID is invalid");
  }

  if (amount === null) {
    throw new BadRequestException("Payment amount is invalid");
  }

  return { paymentKey, orderId, amount };
}

function requireSessionId(sessionId: string | undefined): string {
  if (!sessionId) {
    throw new BadRequestException("Cart session is required");
  }

  const normalized = sessionId.trim();
  if (normalized.length < 1 || normalized.length > 128) {
    throw new BadRequestException("Cart session is invalid");
  }

  return normalized;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readPositiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
