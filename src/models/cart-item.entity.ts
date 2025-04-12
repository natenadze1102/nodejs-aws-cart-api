import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryColumn({ name: 'cart_id' })
  cartId: string;

  @PrimaryColumn({ name: 'product_id' })
  productId: string;

  @Column()
  count: number;

  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  // Product data (for display purposes, not stored in DB)
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
}
