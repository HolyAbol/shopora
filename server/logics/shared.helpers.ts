import { DatabaseError, Pool, PoolClient } from 'pg';
import { pool } from '../services/db/db';
import { QueryFailedError } from 'typeorm';
import { Cart } from './cart/carts.entity';
type Queryable = Pool | PoolClient;
async function getUserAddress(user_id: number, db: Queryable) {
  const check = await db.query('SELECT * FROM addresses WHERE user_id=$1 AND deleted_at IS NULL', [
    user_id,
  ]);
  return check;
}
async function cartExistence(
  user_id: number,
  db: EntityManager = AppDataSource.manager
): Promise<boolean> {
  return db.exists(Cart, { where: { userId: user_id } });
}

async function cartCreator(user_id: number, db: Queryable) {
  const creation = await db.query(
    'INSERT INTO carts (user_id,created_at) VALUES ($1,now()) RETURNING cart_id,user_id',
    [user_id]
  );
  return creation;
}
async function checkCartItems(user_id: number, db: EntityManager = AppDataSource.manager) {
  const rows = await db
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

  return rows;
}
async function checkOrderItems(user_id: number, order_id: number, db: Queryable) {
  const result = await db.query(
    'SELECT * FROM orders o JOIN order_items oi ON oi.order_id =o.order_id WHERE o.order_id=$1 AND o.user_id=$2 AND o.deleted_at IS NULL AND oi.deleted_at IS NULL',
    [order_id, user_id]
  );
  return result;
}
async function isOrderCancelled(user_id: number, order_id: number, db: Queryable) {
  const result = await db.query(
    `SELECT * FROM orders WHERE order_id=$1 AND user_id=$2 AND status != 'cancelled' AND deleted_at IS NULL`,
    [order_id, user_id]
  );
  return result;
}
async function findProsByOwnerId(owner_id: number, db: Queryable) {
  const result = await pool.query(
    'SELECT p.* FROM products p JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id WHERE m.owner_id = $1 AND p.deleted_at IS NULL AND m.deleted_at IS NULL',
    [owner_id]
  );
  return result.rows;
}
async function findManusByOwnerId(owner_id: number, db: Queryable) {
  const result = await pool.query(
    'SELECT * FROM manufacturers WHERE owner_id = $1 AND deleted_at IS NULL',
    [owner_id]
  );
  return result.rows;
}
async function getShopIdByOwner(owner_id: number, db: Queryable): Promise<number | null> {
  const result = await db.query(
    'SELECT shop_id FROM shops WHERE owner_id=$1 AND deleted_at IS NULL',
    [owner_id]
  );
  return result.rows[0]?.shop_id ?? null;
}
type projectStatus = 'online' | 'offline';
const projectstatus = process.env.CURRENT_STATUS as projectStatus;
function deployment(err: any, status: projectStatus) {
  if (status === 'offline') {
    console.log(err);
  }
}
const isPgError = (err: unknown, code: string) =>
  err instanceof QueryFailedError &&
  err.driverError instanceof DatabaseError &&
  err.driverError.code === code;

import { EntityManager, FindOptionsWhere, In, IsNull } from 'typeorm';
import { Product } from './products/product.entity';
import { CartItem } from './cart/cartItems.entity';
import { ProductCategory } from './category/productCategory.entity';
import { AppDataSource } from '../services/db/data-sources';

async function softDeleteProducts(
  manager: EntityManager,
  where: FindOptionsWhere<Product>
): Promise<number> {
  const products = await manager.find(Product, { where, select: { productId: true } });
  const ids = products.map((p) => p.productId);
  if (ids.length === 0) return 0;

  await manager.softDelete(CartItem, { productId: In(ids), deletedAt: IsNull() });
  await manager.softDelete(ProductCategory, { productId: In(ids), deletedAt: IsNull() });
  await manager.softDelete(Product, { productId: In(ids), deletedAt: IsNull() });

  return ids.length;
}
export {
  getUserAddress,
  cartExistence,
  checkCartItems,
  checkOrderItems,
  isOrderCancelled,
  cartCreator,
  findManusByOwnerId,
  findProsByOwnerId,
  getShopIdByOwner,
  deployment,
  projectstatus,
  isPgError,
  softDeleteProducts,
};
