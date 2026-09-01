import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { CartService } from "./cart.service.js";
import type { CartReadModel } from "./cart.types.js";
import { requireCartSessionId } from "./cart-session.js";

const SESSION_TOKEN_HEADER = "x-cart-session-token";

@Controller("api/cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @Headers(SESSION_TOKEN_HEADER) sessionToken: string | undefined,
  ): Promise<CartReadModel> {
    return this.cartService.findBySessionId(requireCartSessionId(sessionToken));
  }

  @Post("items")
  addItem(
    @Headers(SESSION_TOKEN_HEADER) sessionToken: string | undefined,
    @Body() body: unknown,
  ): Promise<CartReadModel> {
    const request = parseAddItemBody(body);
    return this.cartService.addItem(
      requireCartSessionId(sessionToken),
      request.productId,
      request.quantity,
    );
  }

  @Patch("items/:productId")
  setItemQuantity(
    @Headers(SESSION_TOKEN_HEADER) sessionToken: string | undefined,
    @Param("productId") productId: string,
    @Body() body: unknown,
  ): Promise<CartReadModel> {
    return this.cartService.setItemQuantity(
      requireCartSessionId(sessionToken),
      requireProductId(productId),
      parseQuantityBody(body),
    );
  }

  @Delete("items/:productId")
  removeItem(
    @Headers(SESSION_TOKEN_HEADER) sessionToken: string | undefined,
    @Param("productId") productId: string,
  ): Promise<CartReadModel> {
    return this.cartService.removeItem(
      requireCartSessionId(sessionToken),
      requireProductId(productId),
    );
  }
}

function requireProductId(productId: string): string {
  const normalized = productId.trim();

  if (normalized.length < 1 || normalized.length > 128) {
    throw new BadRequestException("Product ID is invalid");
  }

  return normalized;
}

function parseAddItemBody(body: unknown): {
  productId: string;
  quantity: number;
} {
  if (!isRecord(body)) {
    throw new BadRequestException("Cart item request is invalid");
  }

  return {
    productId: requireProductId(readString(body.productId)),
    quantity: readOptionalPositiveQuantity(body.quantity),
  };
}

function parseQuantityBody(body: unknown): number {
  if (!isRecord(body) || !("quantity" in body)) {
    throw new BadRequestException("Cart quantity request is invalid");
  }

  return readPositiveQuantity(body.quantity);
}

function readString(value: unknown): string {
  if (typeof value !== "string") {
    throw new BadRequestException("Product ID is invalid");
  }

  return value;
}

function readOptionalPositiveQuantity(value: unknown): number {
  return value === undefined ? 1 : readPositiveQuantity(value);
}

function readPositiveQuantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new BadRequestException("Quantity must be a positive integer");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
