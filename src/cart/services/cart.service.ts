import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cart } from 'src/models/cart.entity';
import { CartItem } from 'src/models/cart-item.entity';
import { CartStatus } from 'src/models/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private dataSource: DataSource,
  ) {}

  // A simple mock for product data enrichment.
  private mockProducts: {
    [key: string]: {
      id: string;
      title: string;
      description: string;
      price: number;
    };
  } = {
    '7567ec4b-b10c-48c5-9345-fc73c48a80aa': {
      id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
      title: 'Test Product',
      description: 'Test Description',
      price: 10.99,
    },
    // Add other mock products as needed.
  };

  // Enrich the cart items with mock product details.
  private enrichCartWithProductData(cart: Cart): Cart {
    if (cart && cart.items) {
      cart.items.forEach((item) => {
        item.product = this.mockProducts[item.productId] || {
          id: item.productId,
          title: `Product ${item.productId.substring(0, 8)}`,
          description: 'No description available',
          price: 9.99,
        };
      });
    }
    return cart;
  }

  // Find a cart by user ID; if none exists, create a new one.
  async findByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
        status: CartStatus.OPEN,
      },
      relations: ['items'],
    });
    if (!cart) {
      return this.createCart(userId);
    }
    return this.enrichCartWithProductData(cart);
  }

  // Create a new cart for a user.
  async createCart(userId: string): Promise<Cart> {
    const newCart = this.cartRepository.create({
      userId,
      status: CartStatus.OPEN,
      items: [],
    });
    const savedCart = await this.cartRepository.save(newCart);
    return this.enrichCartWithProductData(savedCart);
  }

  // Update cart record.
  async updateCart(cart: Cart): Promise<Cart> {
    const savedCart = await this.cartRepository.save(cart);
    return this.enrichCartWithProductData(savedCart);
  }

  // Helper method to find or create a cart.
  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = await this.createCart(userId);
    }
    return this.enrichCartWithProductData(cart);
  }

  // Update the cart by setting the count of a product.
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
      // Find or create the open cart for the user.
      let cart = await this.findByUserId(userId);
      if (!cart) {
        console.log('No cart found, creating new cart');
        cart = await this.createCart(userId);
      }
      console.log(`Found/created cart ID: ${cart.id}`);

      if (payload.count <= 0) {
        // Remove the item if count is zero or negative.
        console.log(`Removing item ${payload.productId} from cart`);
        await queryRunner.manager.delete(CartItem, {
          cartId: cart.id,
          productId: payload.productId,
        });
      } else {
        // Check if the item already exists.
        const existingItem = await queryRunner.manager.findOne(CartItem, {
          where: { cartId: cart.id, productId: payload.productId },
        });
        if (existingItem) {
          console.log(`Updating existing item count to ${payload.count}`);
          await queryRunner.manager.update(
            CartItem,
            { cartId: cart.id, productId: payload.productId },
            { count: payload.count },
          );
        } else {
          // Create a new CartItem.
          console.log(`Creating new item with count ${payload.count}`);
          const newItem = new CartItem();
          newItem.cartId = cart.id;
          newItem.productId = payload.productId;
          newItem.count = payload.count;
          await queryRunner.manager.save(newItem);
        }
      }
      // Update the cart's updatedAt timestamp.
      await queryRunner.manager.update(
        Cart,
        { id: cart.id },
        { updatedAt: new Date() },
      );
      // Update the mock products for enrichment.
      if (payload.count > 0) {
        this.addProductToMock(payload.productId, payload.product);
      }
      await queryRunner.commitTransaction();

      // Fetch the updated cart.
      const updatedCart = await this.cartRepository.findOne({
        where: { userId, status: CartStatus.OPEN },
        relations: ['items'],
        cache: false,
      });
      return this.enrichCartWithProductData(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Remove all items from the cart (i.e. clear cart).
  async removeByUserId(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      cart.items = [];
      await this.updateCart(cart);
    }
    return cart;
  }

  // Add an item to the cart.
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

    const existingItemIndex = cart.items?.findIndex(
      (item) => item.productId === productId,
    );
    if (
      existingItemIndex !== undefined &&
      existingItemIndex >= 0 &&
      cart.items
    ) {
      console.log('Updating existing item count');
      cart.items[existingItemIndex].count = count;
    } else {
      console.log('Adding new item to cart');
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

  // Remove a specific item from the cart.
  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException(`Cart not found for user: ${userId}`);
    }
    cart.items = cart.items.filter((item) => item.productId !== productId);
    return this.updateCart(cart);
  }

  // Clear the entire cart.
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException(`Cart not found for user: ${userId}`);
    }
    cart.items = [];
    return this.updateCart(cart);
  }

  // Change status of a cart (for checkout, etc.).
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

  // Debug method returning raw cart contents from the database.
  async debugCartContents(userId: string): Promise<any> {
    try {
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

  // Helper method: add/update mock product data.
  private addProductToMock(productId: string, productData?: any): void {
    if (!productData) {
      this.mockProducts[productId] = {
        id: productId,
        title: `Product ${productId.substring(0, 8)}`,
        description: 'No description available',
        price: 9.99,
      };
      return;
    }
    this.mockProducts[productId] = {
      id: productId,
      title: productData.title || `Product ${productId.substring(0, 8)}`,
      description: productData.description || 'No description available',
      price: productData.price || 9.99,
    };
  }
}
