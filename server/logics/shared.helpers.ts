import { Pool, PoolClient } from 'pg';
import { pool } from '../services/db/db';
type Queryable = Pool | PoolClient;
async function getUserAddress(user_id: number, db: Queryable) {
  const check = await db.query('SELECT * FROM addresses WHERE user_id=$1 AND deleted_at IS NULL', [
    user_id,
  ]);
  return check;
}
async function cartExistence(user_id: number, db: Queryable) {
  const result = await db.query(
    'SELECT cart_id FROM carts WHERE user_id=$1 AND deleted_at IS NULL',
    [user_id]
  );
  return result;
}
async function cartCreator(user_id: number, db: Queryable) {
  const creation = await db.query(
    'INSERT INTO carts (user_id,created_at) VALUES ($1,now()) RETURNING cart_id,user_id',
    [user_id]
  );
  return creation;
}
async function checkCartItems(user_id: number, db: Queryable) {
  const result = await db.query(
    'SELECT c.cart_id AS cart_id ,ci.product_id,ci.quantity,p.product_name,p.price FROM carts c JOIN cart_items ci ON ci.cart_id =c.cart_id JOIN products p ON p.product_id=ci.product_id WHERE c.user_id=$1 AND c.deleted_at is null AND p.deleted_at IS NULL AND ci.deleted_at IS NULL',
    [user_id]
  );
  return result.rows;
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
export {
  getUserAddress,
  cartExistence,
  checkCartItems,
  checkOrderItems,
  isOrderCancelled,
  cartCreator,
};
