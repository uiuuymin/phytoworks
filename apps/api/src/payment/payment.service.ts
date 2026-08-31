import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PAYMENT_GATEWAY, type PaymentGateway } from "./payment.gateway.js";
import {
  PAYMENT_REPOSITORY,
  PaymentInProgressError,
  type PaymentRepository,
} from "./payment.repository.js";
import type {
  ConfirmPaymentInput,
  PaymentOrderContext,
  PaymentReadModel,
} from "./payment.types.js";

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async confirm(input: ConfirmPaymentInput): Promise<PaymentReadModel> {
    const order = await this.findOrder(input.orderId, input.sessionId);
    const existing = await this.findExistingPayment(
      input.orderId,
      input.sessionId,
    );

    if (existing?.status === "DONE") {
      if (
        existing.paymentKey === input.paymentKey &&
        existing.amount === input.amount
      ) {
        return existing;
      }

      throw new ConflictException("Order has already been paid");
    }

    if (existing?.status === "PENDING") {
      throw new ConflictException("Payment approval is already in progress");
    }

    if (order.status !== "PENDING") {
      throw new ConflictException("Order is not pending");
    }

    if (input.amount !== order.totalAmount) {
      throw new BadRequestException("Payment amount does not match Order");
    }

    let prepared: PaymentReadModel;
    try {
      prepared = await this.paymentRepository.prepare({
        ...input,
        currency: order.currency,
      });
    } catch (error) {
      if (error instanceof PaymentInProgressError) {
        throw new ConflictException("Payment approval is already in progress");
      }

      throw new InternalServerErrorException("Payment data unavailable");
    }

    let result: Awaited<ReturnType<PaymentGateway["confirm"]>>;
    try {
      result = await this.paymentGateway.confirm({
        paymentKey: prepared.paymentKey,
        orderId: prepared.orderId,
        amount: prepared.amount,
      });
    } catch (error) {
      await this.recordFailure(input, getFailureCode(error));
      throw new BadGatewayException("Payment approval failed");
    }

    if (
      result.paymentKey !== prepared.paymentKey ||
      result.orderId !== prepared.orderId ||
      result.totalAmount !== prepared.amount ||
      result.status !== "DONE"
    ) {
      await this.recordFailure(input, "INVALID_UPSTREAM_RESPONSE");
      throw new BadGatewayException("Payment approval failed");
    }

    try {
      return await this.paymentRepository.markDone(
        input.orderId,
        input.sessionId,
        input.paymentKey,
      );
    } catch {
      throw new InternalServerErrorException("Payment data unavailable");
    }
  }

  private async findOrder(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentOrderContext> {
    try {
      const order = await this.paymentRepository.findOrderContext(
        orderId,
        sessionId,
      );
      if (!order) {
        throw new NotFoundException("Order not found");
      }
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Payment data unavailable");
    }
  }

  private async findExistingPayment(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentReadModel | null> {
    try {
      return await this.paymentRepository.findByOrderIdAndSessionId(
        orderId,
        sessionId,
      );
    } catch {
      throw new InternalServerErrorException("Payment data unavailable");
    }
  }

  private async recordFailure(
    input: ConfirmPaymentInput,
    failureCode: string,
  ): Promise<void> {
    try {
      await this.paymentRepository.markFailed(
        input.orderId,
        input.sessionId,
        input.paymentKey,
        failureCode,
      );
    } catch {
      throw new InternalServerErrorException("Payment data unavailable");
    }
  }
}

function getFailureCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    /^[A-Z0-9_]{1,64}$/.test(error.code)
  ) {
    return error.code;
  }

  return "UPSTREAM_REJECTED";
}
