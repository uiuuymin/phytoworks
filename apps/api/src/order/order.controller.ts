import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from "@nestjs/common";
import { requireCartSessionId } from "../cart/cart-session.js";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { OrderService } from "./order.service.js";
import type { OrderReadModel } from "./order.types.js";

const SESSION_TOKEN_HEADER = "x-cart-session-token";

@Controller("api/orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @Headers(SESSION_TOKEN_HEADER) sessionToken: string | undefined,
  ): Promise<OrderReadModel> {
    return this.orderService.createPending(requireCartSessionId(sessionToken));
  }

  @Get(":orderId")
  getOrder(
    @Headers(SESSION_TOKEN_HEADER) sessionToken: string | undefined,
    @Param("orderId") orderId: string,
  ): Promise<OrderReadModel> {
    return this.orderService.findByIdAndSessionId(
      requireOrderId(orderId),
      requireCartSessionId(sessionToken),
    );
  }
}

function requireOrderId(orderId: string): string {
  const normalized = orderId.trim();

  if (normalized.length < 1 || normalized.length > 128) {
    throw new BadRequestException("Order ID is invalid");
  }

  return normalized;
}
