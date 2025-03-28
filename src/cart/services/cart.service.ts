import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from 'src/models/cart-item.entity';
import { Cart, CartStatus } from 'src/models/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: {
        userId: userId,
        status: CartStatus.OPEN,
      },
      relations: ['items'],
    });

    if (!cart) {
      return this.createCart(userId);
    }

    return cart;
  }

  async createCart(userId: string): Promise<Cart> {
    const newCart = this.cartRepository.create({
      userId,
      status: CartStatus.OPEN,
      items: [],
    });

    return this.cartRepository.save(newCart);
  }

  async updateCart(cart: Cart): Promise<Cart> {
    return this.cartRepository.save(cart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    return this.findByUserId(userId); // This already creates a cart if not found
  }

  async updateByUserId(
    userId: string,
    payload: { productId: string; count: number },
  ): Promise<Cart> {
    return this.addItem(userId, payload.productId, payload.count);
  }

  async removeByUserId(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);

    if (cart) {
      cart.items = [];
      await this.updateCart(cart);
    }
  }

  async addItem(
    userId: string,
    productId: string,
    count: number,
  ): Promise<Cart> {
    const cart = await this.findByUserId(userId);

    if (count <= 0) {
      return this.removeItem(userId, productId);
    }

    // Check if the item already exists in the cart
    const existingItemIndex = cart.items?.findIndex(
      (item) => item.productId === productId,
    );

    if (existingItemIndex >= 0 && cart.items) {
      // Update existing item count
      cart.items[existingItemIndex].count = count;
    } else {
      // Add new item
      if (!cart.items) {
        cart.items = [];
      }

      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        count,
      });

      cart.items.push(newItem);
    }

    return this.updateCart(cart);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException(`Cart not found for user: ${userId}`);
    }

    // Remove the item from the cart
    if (cart.items) {
      cart.items = cart.items.filter((item) => item.productId !== productId);
    }

    return this.updateCart(cart);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException(`Cart not found for user: ${userId}`);
    }

    // Clear all items from the cart
    cart.items = [];

    return this.updateCart(cart);
  }

  async changeStatus(cartId: string, status: CartStatus): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found: ${cartId}`);
    }

    cart.status = status;
    return this.updateCart(cart);
  }
}
