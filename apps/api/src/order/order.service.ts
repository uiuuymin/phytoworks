import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { CartService } from "../cart/cart.service.js";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { ProductService } from "../product/product.service.js";
import { ORDER_REPOSITORY, type OrderRepository } from "./order.repository.js";
import type { CreatePendingOrderInput, OrderReadModel } from "./order.types.js";

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  async createPending(sessionId: string): Promise<OrderReadModel> {
    const cart = await this.cartService.findBySessionId(sessionId);

    if (cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    const items = await Promise.all(
      cart.items.map(async (cartItem) => {
        const product = await this.productService.findById(cartItem.productId);

        if (product.purchaseMode !== "DIRECT_PURCHASE") {
          throw new UnprocessableEntityException(
            "Cart contains a Product that cannot be ordered",
          );
        }

        if (product.pricing.mode !== "DEMO") {
          throw new UnprocessableEntityException(
            "Product does not have an orderable price",
          );
        }

        return {
          productId: product.id,
          productName: product.name,
          unitAmount: product.pricing.amount,
          quantity: cartItem.quantity,
        };
      }),
    );

    const totalAmount = items.reduce(
      (total, item) => total + item.unitAmount * item.quantity,
      0,
    );

    if (!Number.isSafeInteger(totalAmount) || totalAmount < 1) {
      throw new UnprocessableEntityException("Order amount is invalid");
    }

    const input: CreatePendingOrderInput = {
      sessionId,
      currency: "KRW",
      pricingSource: "DEMO",
      totalAmount,
      items,
    };

    try {
      return await this.orderRepository.createPending(input);
    } catch {
      throw new InternalServerErrorException("Order data unavailable");
    }
  }

  async findByIdAndSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<OrderReadModel> {
    try {
      const order = await this.orderRepository.findByIdAndSessionId(
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

      throw new InternalServerErrorException("Order data unavailable");
    }
  }
}
