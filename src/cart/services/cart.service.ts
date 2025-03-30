import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CartItem } from 'src/models/cart-item.entity';
import { Cart, CartStatus } from 'src/models/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private dataSource: DataSource,
  ) {}

  private mockProducts = {
    '7567ec4b-b10c-48c5-9345-fc73c48a80aa': {
      id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
      title: 'Test Product',
      description: 'Test Description',
      price: 10.99,
    },
    // Add more mock products as needed
  };

  private enrichCartWithProductData(cart: Cart): Cart {
    if (cart && cart.items) {
      cart.items.forEach((item) => {
        // Add product data to cart item from mockProducts
        item.product = this.mockProducts[item.productId] || {
          id: item.productId,
          title: `Product ${item.productId.substring(0, 8)}`,
          description: 'No description available',
          price: 9.99,
        };
      });
    }
    return cart; // Make sure to return the enriched cart
  }

  async debugCartContents(userId: string): Promise<any> {
    try {
      // Direct raw SQL query to bypass TypeORM cache
      const result = await this.dataSource.query(
        `
          SELECT c.id, c.user_id, c.status, ci.product_id, ci.count
          FROM carts c
          LEFT JOIN cart_items ci ON c.id = ci.cart_id
          WHERE c.user_id = $1
        `,
        [userId],
      );

      console.log('Database cart contents:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Error querying database:', error);
      throw error;
    }
  }

  private addProductToMock(productId: string, productData?: any): void {
    if (!productData) {
      // If no product data provided, use default values
      this.mockProducts[productId] = {
        id: productId,
        title: `Product ${productId.substring(0, 8)}`,
        description: 'No description available',
        price: 9.99,
      };
      return;
    }

    // Store the product data in the mock
    this.mockProducts[productId] = {
      id: productId,
      title: productData.title || `Product ${productId.substring(0, 8)}`,
      description: productData.description || 'No description available',
      price: productData.price || 9.99,
    };

    console.log(`Added/updated product in mock: ${productId}`);
  }

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

    return this.enrichCartWithProductData(cart);
  }

  async createCart(userId: string): Promise<Cart> {
    const newCart = this.cartRepository.create({
      userId,
      status: CartStatus.OPEN,
      items: [],
    });

    const savedCart = await this.cartRepository.save(newCart);
    return this.enrichCartWithProductData(savedCart); // Add this enrichment
  }

  async updateCart(cart: Cart): Promise<Cart> {
    console.log('Updating cart in database:', JSON.stringify(cart));
    const savedCart = await this.cartRepository.save(cart);
    console.log('Cart saved successfully:', savedCart.id);
    return this.enrichCartWithProductData(savedCart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      cart = await this.createCart(userId);
    }

    return this.enrichCartWithProductData(cart);
  }

  async updateByUserId(
    userId: string,
    payload: { productId: string; count: number; product?: any },
  ): Promise<Cart> {
    console.log(
      `Updating cart for user ${userId} with product ${payload.productId}, count ${payload.count}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find or create the cart
      let cart = await this.findByUserId(userId);

      if (!cart) {
        console.log('No cart found, creating new cart');
        cart = await this.createCart(userId);
      }

      console.log(`Found/created cart ID: ${cart.id}`);

      if (payload.count <= 0) {
        // Remove the item if count is zero or negative
        console.log(`Removing item ${payload.productId} from cart`);
        await queryRunner.manager.delete(CartItem, {
          cartId: cart.id,
          productId: payload.productId,
        });
      } else {
        // Check if the item exists in the database
        const existingItem = await queryRunner.manager.findOne(CartItem, {
          where: {
            cartId: cart.id,
            productId: payload.productId,
          },
        });

        if (existingItem) {
          // Update existing item
          console.log(`Updating existing item count to ${payload.count}`);
          await queryRunner.manager.update(
            CartItem,
            { cartId: cart.id, productId: payload.productId },
            { count: payload.count },
          );
        } else {
          // Create new item
          console.log(`Creating new item with count ${payload.count}`);
          const newItem = new CartItem();
          newItem.cartId = cart.id;
          newItem.productId = payload.productId;
          newItem.count = payload.count;

          await queryRunner.manager.save(newItem);
        }
      }

      // Update the cart's updatedAt timestamp
      await queryRunner.manager.update(
        Cart,
        { id: cart.id },
        { updatedAt: new Date() },
      );

      // Add product to mockProducts for better display
      if (payload.count > 0) {
        this.addProductToMock(payload.productId);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

      // Fetch the updated cart
      const updatedCart = await this.cartRepository.findOne({
        where: {
          userId: userId,
          status: CartStatus.OPEN,
        },
        relations: ['items'],
        cache: false, // Add this to prevent caching
      });

      return this.enrichCartWithProductData(updatedCart);
    } catch (error) {
      // Rollback on error
      console.error('Error updating cart:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release resources
      await queryRunner.release();
    }
  }
  async removeByUserId(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);

    if (cart) {
      cart.items = [];
      await this.updateCart(cart);
    }

    return cart;
  }

  async addItem(
    userId: string,
    productId: string,
    count: number,
  ): Promise<Cart> {
    console.log(
      `Adding item: userId=${userId}, productId=${productId}, count=${count}`,
    );
    const cart = await this.findByUserId(userId);

    if (count <= 0) {
      console.log('Count is <= 0, removing item');
      return this.removeItem(userId, productId);
    }

    // Check if the item already exists in the cart
    const existingItemIndex = cart.items?.findIndex(
      (item) => item.productId === productId,
    );

    console.log(`Existing item index: ${existingItemIndex}`);

    if (existingItemIndex >= 0 && cart.items) {
      // Update existing item count
      console.log('Updating existing item count');
      cart.items[existingItemIndex].count = count;
    } else {
      // Add new item
      console.log('Adding new item to cart');
      if (!cart.items) {
        cart.items = [];
      }

      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        count,
      });

      console.log('Created new cart item:', newItem);
      cart.items.push(newItem);
    }

    console.log('Saving updated cart');
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
