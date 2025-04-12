import { CartItem as CartItemEntity } from 'src/models/cart-item.entity';
import { CartItem as CartItemModel } from 'src/cart/models';
import { Order as OrderEntity } from 'src/models/order.entity';
import { Order as OrderModel } from 'src/order/models';
import { OrderStatus } from 'src/order/type';

export function mapCartItemEntityToModel(
  entity: CartItemEntity,
): CartItemModel {
  // Ensure the product data is available
  if (!entity.product) {
    throw new Error('Product data is missing in cart item entity');
  }

  return {
    product: {
      id: entity.productId,
      title: entity.product.title,
      description: entity.product.description,
      price: entity.product.price,
    },
    count: entity.count,
  };
}

export function mapOrderEntityToModel(entity: OrderEntity): OrderModel {
  return {
    id: entity.id,
    userId: entity.userId,
    cartId: entity.cartId,
    items: [], // This would need to be populated separately
    address: entity.delivery as any,
    statusHistory: [
      {
        status: OrderStatus.Open,
        timestamp: entity.createdAt.getTime(),
        comment: entity.comments || '',
      },
    ],
  };
}
