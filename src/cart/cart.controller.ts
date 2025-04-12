import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { Order as OrderModel } from '../order/models';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { CartItem } from './models';
import { CreateOrderDto, PutCartPayload } from 'src/order/type';
import {
  mapCartItemEntityToModel,
  mapOrderEntityToModel,
} from 'src/adapters/entity-to-model.adapter';
import { DataSource } from 'typeorm';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    @Inject(forwardRef(() => OrderService))
    private orderService: OrderService,
    private dataSource: DataSource,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    // Map the entity items to the model items
    return cart.items.map(mapCartItemEntityToModel);
  }

  @UseGuards(BasicAuthGuard)
  @Get('debug')
  async debugCart(@Req() req: AppRequest): Promise<any> {
    const userId = getUserIdFromRequest(req);
    return this.cartService.debugCartContents(userId);
  }

  @UseGuards(BasicAuthGuard)
  @Get('debug-db')
  async debugDatabaseContents(@Req() req: AppRequest): Promise<any> {
    const userId = getUserIdFromRequest(req);

    try {
      // Log the user ID we're searching for
      console.log(`Searching for cart with user ID: ${userId}`);

      // Show all carts regardless of user ID to see what's in the database
      const allCartsQuery = `
        SELECT c.id, c.user_id, c.status, c.created_at, c.updated_at
        FROM carts c 
        ORDER BY c.updated_at DESC 
        LIMIT 10
      `;
      const allCarts = await this.dataSource.query(allCartsQuery);

      // Original query for this specific user
      const cartQuery = `
        SELECT c.id, c.user_id, c.status, c.created_at, c.updated_at
        FROM carts c 
        WHERE c.user_id = $1 AND c.status = 'OPEN'
        ORDER BY c.updated_at DESC 
        LIMIT 1
      `;
      const userCarts = await this.dataSource.query(cartQuery, [userId]);

      // If no cart found for this specific user
      if (userCarts.length === 0) {
        return {
          message: 'No cart found in database for this user',
          userId: userId,
          authUser: req.user, // Show the full auth user object
          allCarts: allCarts, // Show all carts in the database
        };
      }

      // Rest of your existing code...
      const cartId = userCarts[0].id;
      const itemsQuery = `
        SELECT ci.product_id, ci.count
        FROM cart_items ci
        WHERE ci.cart_id = $1
      `;
      const items = await this.dataSource.query(itemsQuery, [cartId]);

      const apiResponse = await this.findUserCart(req);

      return {
        message: 'Database contents vs. API response',
        databaseData: {
          cart: userCarts[0],
          items: items,
        },
        apiResponseData: apiResponse,
        authUser: req.user,
      };
    } catch (error) {
      console.error('Error debugging database:', error);
      return { error: error.message };
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    console.log('PUT request received with body:', JSON.stringify(body));

    // Extract the product ID from the body
    const productId = body.product.id;
    console.log(`Extracted product ID: ${productId}, count: ${body.count}`);

    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      {
        productId,
        count: body.count,
        product: body.product, // Add this to pass the full product
      },
    );
    console.log('Updated cart:', JSON.stringify(cart));

    return cart.items.map(mapCartItemEntityToModel);
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId, items } = cart;

    // Convert entity items to model items for calculation
    const modelItems = items.map(mapCartItemEntityToModel);
    const total = calculateCartTotal(modelItems);

    const order = await this.orderService.create({
      userId,
      cartId,
      items: items.map((item) => ({
        productId: item.productId,
        count: item.count,
      })),
      address: body.address,
      total,
    });
    await this.cartService.removeByUserId(userId);

    return {
      order,
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  async getOrder(): Promise<OrderModel[]> {
    const orders = await this.orderService.getAll();
    return orders.map(mapOrderEntityToModel);
  }
}
