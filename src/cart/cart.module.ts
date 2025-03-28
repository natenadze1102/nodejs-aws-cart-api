import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './services/cart.service';
import { Cart } from '../models/cart.entity';
import { CartItem } from '../models/cart-item.entity';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), OrderModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
