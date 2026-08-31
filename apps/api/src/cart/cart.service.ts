import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { ProductService } from "../product/product.service.js";
import { CART_REPOSITORY, type CartRepository } from "./cart.repository.js";
import type { CartReadModel } from "./cart.types.js";

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductService,
  ) {}

  async findBySessionId(sessionId: string): Promise<CartReadModel> {
    try {
      return (
        (await this.cartRepository.findBySessionId(sessionId)) ?? emptyCart()
      );
    } catch {
      throw new InternalServerErrorException("Cart data unavailable");
    }
  }

  async addItem(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel> {
    await this.assertDirectPurchase(productId);

    try {
      return await this.cartRepository.addItem(sessionId, productId, quantity);
    } catch {
      throw new InternalServerErrorException("Cart data unavailable");
    }
  }

  async setItemQuantity(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel> {
    try {
      const cart = await this.cartRepository.setItemQuantity(
        sessionId,
        productId,
        quantity,
      );

      if (!cart) {
        throw new NotFoundException("Cart item not found");
      }

      return cart;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException("Cart data unavailable");
    }
  }

  async removeItem(
    sessionId: string,
    productId: string,
  ): Promise<CartReadModel> {
    try {
      const cart = await this.cartRepository.removeItem(sessionId, productId);

      if (!cart) {
        throw new NotFoundException("Cart item not found");
      }

      return cart;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException("Cart data unavailable");
    }
  }

  private async assertDirectPurchase(productId: string): Promise<void> {
    try {
      const product = await this.productService.findById(productId);

      if (product.purchaseMode !== "DIRECT_PURCHASE") {
        throw new UnprocessableEntityException(
          "Product cannot be added to cart",
        );
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }

      throw new InternalServerErrorException("Cart data unavailable");
    }
  }
}

function emptyCart(): CartReadModel {
  return { items: [], totalQuantity: 0 };
}
