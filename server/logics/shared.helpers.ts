import { DatabaseError, Pool, PoolClient } from 'pg';
import { QueryFailedError } from 'typeorm';
import { Cart } from './cart/carts.entity';
import { EntityManager, FindOptionsWhere, In, IsNull } from 'typeorm';
import { Product } from './products/product.entity';
import { CartItem } from './cart/cartItems.entity';
import { ProductCategory } from './category/productCategory.entity';
import { AppDataSource } from '../services/db/data-sources';
import { Address } from './address/addresses.entity';
import { Order } from './order/orders.entity';

async function getUserAddress(user_id: number, db?: EntityManager): Promise<Address | null> {
  const manager = db ?? AppDataSource.manager;
  const check = manager.findOne(Address, { where: { userId: user_id } });
  return check ?? null;
}
async function cartExistence(user_id: number, db?: EntityManager): Promise<number | null> {
  const manager = db ?? AppDataSource.manager;
  const result = await manager.findOne(Cart, {
    where: { userId: user_id },
    select: { cartId: true },
  });
  return result?.cartId ?? null;
}

async function cartCreator(user_id: number, db?: EntityManager) {
  const manager = db ?? AppDataSource.manager;
  const repo = manager.getRepository(Cart);
  const result = repo.create({ userId: user_id });
  return await manager.save(result);
}
async function checkCartItems(user_id: number, db?: EntityManager) {
  const manager = db ?? AppDataSource.manager;
  const rows = await manager
    .createQueryBuilder(CartItem, 'ci')
    .innerJoin('ci.cart', 'c')
    .innerJoin('ci.product', 'p')
    .select('c.cartId', 'cart_id')
    .addSelect('ci.productId', 'product_id')
    .addSelect('ci.quantity', 'quantity')
    .addSelect('p.productName', 'product_name')
    .addSelect('p.price', 'price')
    .where('c.userId = :user_id', { user_id })
    .getRawMany<{
      cart_id: number;
      product_id: number;
      quantity: number;
      product_name: string;
      price: number;
    }>();

  return rows ?? 0;
}
async function checkOrderItems(user_id: number, order_id: number, db?: EntityManager) {
  const manager = db ?? AppDataSource.manager;
  const result = await manager
    .getRepository(Order)
    .createQueryBuilder('o')
    .withDeleted()
    .innerJoinAndSelect('o.items', 'oi', 'oi.deleted_at IS NULL')
    .innerJoinAndSelect('o.address', 'a')
    .innerJoinAndSelect('o.user', 'u')
    .addSelect(['u.email', 'u.phoneNumber', 'u.firstName', 'u.lastName'])
    .where('o.order_id = :order_id', { order_id })
    .andWhere('o.user_id = :user_id', { user_id })
    .andWhere('o.deleted_at IS NULL')
    .getOne();
  return result;
}
async function isOrderCancelled(user_id: number, order_id: number, db?: EntityManager) {
  const manager = db ?? AppDataSource.manager;
  const result = await manager.findOne(Order, {
    where: {
      orderId: order_id,
      userId: user_id,
      status: 'pending_payment',
      deletedAt: IsNull(),
    },
  });
  return result;
}
type projectStatus = 'online' | 'offline';
const projectstatus = process.env.CURRENT_STATUS as projectStatus;
function logger(err: unknown, status: projectStatus) {
  if (status === 'offline') {
    console.error(err);
    return;
  }
  console.error(err instanceof Error ? `${err.name}: ${err.message}` : err);
}
const isPgError = (err: unknown, code: string) =>
  err instanceof QueryFailedError &&
  err.driverError instanceof DatabaseError &&
  err.driverError.code === code;

async function softDeleteProducts(
  manager: EntityManager,
  where: FindOptionsWhere<Product>
): Promise<number> {
  const products = await manager.find(Product, {
    where,
    select: { productId: true },
  });
  const ids = products.map((p) => p.productId);
  if (ids.length === 0) return 0;

  await manager.softDelete(CartItem, {
    productId: In(ids),
    deletedAt: IsNull(),
  });
  await manager.softDelete(ProductCategory, {
    productId: In(ids),
    deletedAt: IsNull(),
  });
  await manager.softDelete(Product, {
    productId: In(ids),
    deletedAt: IsNull(),
  });

  return ids.length;
}
export {
  getUserAddress,
  cartExistence,
  checkCartItems,
  checkOrderItems,
  isOrderCancelled,
  cartCreator,
  logger,
  projectstatus,
  isPgError,
  softDeleteProducts,
};
