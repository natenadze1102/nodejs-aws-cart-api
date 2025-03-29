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

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    @Inject(forwardRef(() => OrderService))
    private orderService: OrderService,
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

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    // Extract the product ID from the body
    const productId = body.product.id;

    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      { productId, count: body.count },
    );

    // Map the entity items to the model items
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
