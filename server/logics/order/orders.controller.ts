import { Response, Request } from 'express';
import z from 'zod';
import { paymentMethodSchema, orderIdSchema } from './orders.schema';
import {
  cartExistence,
  checkCartItems,
  getUserAddress,
  checkOrderItems,
  isOrderCancelled,
  logger,
  projectstatus,
} from '../shared.helpers';
import { paginationQuery } from '../shared.schemas';
import { AppDataSource } from '../../services/db/data-sources';
import { Product } from '../products/product.entity';
import { Order } from './orders.entity';
import { OrderItem } from './orderItems.entity';
import { CartItem } from '../cart/cartItems.entity';
const errors = {
  address_not_found: [404, 'address not found'],
  exceeds_stock: [400, 'requested amount cannot exceed stock'],
  no_cart: [404, 'cart not found'],
  empty_cart: [404, 'cart is empty'],
  insufficient_stock: [400, 'insufficient stock'],
  is_cancelled: [404, 'order is already cancelled'],
  cant_cancel: [400, ''],
} as const;
class CheckoutError extends Error {
  constructor(public code: keyof typeof errors) {
    super(code);
  }
}
async function createOrder(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = paymentMethodSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  interface CartItemRows {
    product_id: number;
    quantity: number;
    price: number;
    product_name: string;
  }
  const user_id = req.user.userId;
  const { payment_method } = Details.data;
  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const checkAddress = await getUserAddress(user_id, manager);
      if (checkAddress === null) {
        return { error: 'address_not_found' } as const;
      }
      const address = checkAddress.addressId;
      const checkCart = await cartExistence(user_id, manager);
      if (checkCart === null) {
        return { error: 'no_cart' } as const;
      }
      const cart = checkCart;
      const items = await checkCartItems(user_id, manager);
      const totalItems = items.reduce((sum: number, i: CartItemRows) => sum + i.quantity, 0);
      if (totalItems === 0) {
        return { error: 'empty_cart' } as const;
      }
      for (const item of items) {
        const result = await manager
          .createQueryBuilder()
          .update(Product)
          .set({ quantity: () => `quantity - ${Number(item.quantity)}` })
          .where('productId = :id AND quantity >= :qty', {
            id: item.product_id,
            qty: item.quantity,
          })
          .setParameter('qty', item.quantity)
          .execute();

        if (result.affected === 0) {
          throw new CheckoutError('insufficient_stock');
        }
      }
      const totalPrice = items.reduce(
        (sum: number, i: CartItemRows) => sum + i.price * i.quantity,
        0
      );
      const orderResult = await manager.save(Order, {
        userId: user_id,
        addressId: address,
        totalAmount: totalPrice,
        paymentMethod: payment_method,
      });

      const order_id = orderResult.orderId;
      for (const item of items) {
        console.log(item.product_name);
        await manager.insert(OrderItem, {
          orderId: order_id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.price,
        });
      }
      await manager.delete(CartItem, { cartId: cart });
      return { order_id } as const;
    });
    if ('error' in outcome && outcome.error) {
      const [status, message] = errors[outcome.error];
      return res.status(status).json({ message });
    }
    return res.status(201).json({ message: 'success', orderId: outcome.order_id });
  } catch (err) {
    if (err instanceof CheckoutError) {
      const [status, message] = errors[err.code];
      return res.status(status).json({ message });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getOrders(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const paginate = paginationQuery.safeParse(req.query);
  if (!paginate.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(paginate.error),
    });
  }
  const { limit, page } = paginate.data;
  const offset = (page - 1) * limit;
  const user_id = req.user.userId;
  try {
    const [orders, total] = await AppDataSource.getRepository(Order).findAndCount({
      where: { userId: user_id },
      order: { orderId: 'ASC' },
      take: limit,
      skip: offset,
    });

    if (total === 0) {
      return res.status(404).json({ message: 'orders not found' });
    }
    return res.status(200).json({
      message: 'success',
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return res.status(500).json({ messgae: 'unexpected error' });
  }
}
async function getOrdersById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const order_id = Number(req.params.order_id);
  const user_id = req.user.userId;
  try {
    const result = await checkOrderItems(user_id, order_id);
    console.log(result);
    if (!result === null) {
      return res.status(404).json({ message: 'orders not found' });
    }
    return res.status(200).json({ message: 'success', data: result });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function cancelOrder(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = orderIdSchema.safeParse(req.params.order_id);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { order_id } = Details.data;
  const user_id = req.user.userId;
  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const result = await isOrderCancelled(user_id, order_id, manager);
      if (result === null) {
        return { error: 'is_cancelled' } as const;
      }
      const cancel = await manager.update(
        Order,
        { userId: user_id, order_id },
        { status: 'cancelled' }
      );
      if (cancel.affected === 0) {
        return { error: 'cant_cancel' } as const;
      }
      return { item: cancel } as const;
    });
    if ('error' in outcome && outcome.error) {
      const [status, message] = errors[outcome.error];
      return res.status(status).json({ message });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
export { createOrder, getOrders, getOrdersById, cancelOrder };
