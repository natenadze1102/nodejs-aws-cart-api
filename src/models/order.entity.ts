import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { OrderStatus } from '../order/type';
import { Cart } from './cart.entity';
import { StatusHistory } from './status-history.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column({ type: 'jsonb', nullable: true })
  payment: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  delivery: Record<string, any>;

  @Column({ nullable: true })
  comments: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Open,
  })
  status: OrderStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cart_id' })
  @OneToMany(() => StatusHistory, (statusHistory) => statusHistory.order)
  statusHistory: StatusHistory[];
  cart: Cart;
}
