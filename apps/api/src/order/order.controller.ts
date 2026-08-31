import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { OrderService } from "./order.service.js";
import type { OrderReadModel } from "./order.types.js";

const SESSION_HEADER = "x-cart-session-id";

@Controller("api/orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @Headers(SESSION_HEADER) sessionId: string | undefined,
  ): Promise<OrderReadModel> {
    return this.orderService.createPending(requireSessionId(sessionId));
  }

  @Get(":orderId")
  getOrder(
    @Headers(SESSION_HEADER) sessionId: string | undefined,
    @Param("orderId") orderId: string,
  ): Promise<OrderReadModel> {
    return this.orderService.findByIdAndSessionId(
      requireOrderId(orderId),
      requireSessionId(sessionId),
    );
  }
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

function requireOrderId(orderId: string): string {
  const normalized = orderId.trim();

  if (normalized.length < 1 || normalized.length > 128) {
    throw new BadRequestException("Order ID is invalid");
  }

  return normalized;
}
