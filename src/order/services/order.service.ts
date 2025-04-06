import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../models/order.entity';
import { StatusHistory } from '../../models/status-history.entity';
import { CartService } from '../../cart/services/cart.service';
import { OrderStatus, CreateOrderPayload } from '../type';
import { CartStatus } from 'src/models/cart.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(StatusHistory)
    private statusHistoryRepository: Repository<StatusHistory>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => CartService))
    private cartService: CartService,
  ) {}

  async getAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findById(id: string): Promise<Order> {
    return this.orderRepository.findOne({ where: { id } });
  }

  async deleteOrder(id: string): Promise<void> {
    // Delete all related status history records first.
    await this.statusHistoryRepository.delete({ orderId: id });

    // Now delete the order.
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
  }

  async create(payload: CreateOrderPayload): Promise<Order> {
    // Use a transaction to ensure both the order is created and cart status is updated
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Create the order
      const order = transactionalEntityManager.create(Order, {
        userId: payload.userId,
        cartId: payload.cartId,
        delivery: { address: payload.address },
        status: OrderStatus.Open,
        total: payload.total,
      });

      const savedOrder = await transactionalEntityManager.save(Order, order);

      // Add status history
      const statusHistory = transactionalEntityManager.create(StatusHistory, {
        orderId: savedOrder.id,
        status: OrderStatus.Open,
        comment: 'Order created',
        timestamp: new Date(),
      });

      await transactionalEntityManager.save(StatusHistory, statusHistory);

      // Update cart status to ORDERED
      await this.cartService.changeStatus(payload.cartId, CartStatus.ORDERED);

      return savedOrder;
    });
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    comment = '',
  ): Promise<Order> {
    // Use a transaction to ensure both status is updated and history is recorded
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const order = await transactionalEntityManager.findOne(Order, {
        where: { id: orderId },
      });

      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      order.status = status;
      await transactionalEntityManager.save(Order, order);

      // Add status history
      const statusHistory = transactionalEntityManager.create(StatusHistory, {
        orderId,
        status,
        comment,
        timestamp: new Date(),
      });

      await transactionalEntityManager.save(StatusHistory, statusHistory);

      return order;
    });
  }

  async getStatusHistory(orderId: string): Promise<StatusHistory[]> {
    return this.statusHistoryRepository.find({
      where: { orderId },
      order: { timestamp: 'DESC' },
    });
  }
}
