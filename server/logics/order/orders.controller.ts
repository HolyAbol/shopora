import { Response, Request } from 'express';
import { pool } from '../../services/db/db';
import z from 'zod';
import { orderDetailsSchema } from './orders.schema';
import { cartExistence, checkCartItems, getUserAddress } from '../shared.helpers';
import { paginationQuery } from '../shared.schemas';

async function createOrder(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = orderDetailsSchema.safeParse(req.body);
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
  const client = await pool.connect();
  try {
    const user_id = req.user.user_id;
    const { payment_method } = Details.data;
    const checkAddress = await getUserAddress(user_id, client);

    const checkCart = await cartExistence(user_id, client);

    if (checkAddress.rowCount === 0) {
      return res.status(404).json({ message: 'address not found' });
    }
    const address = checkAddress.rows[0].address_id;
    if (checkCart.rowCount === 0) {
      return res.status(404).json({ message: 'cart not found' });
    }
    await client.query('BEGIN');
    const items = await checkCartItems(user_id, client);
    const totalItems = items.reduce((sum: number, i: CartItemRows) => sum + i.quantity, 0);
    if (totalItems === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "cart's empty" });
    }

    for (const item of items) {
      const result = await client.query(
        'UPDATE products SET quantity = quantity - $1 WHERE product_id=$2 AND quantity >= $1 RETURNING quantity',
        [item.quantity, item.product_id]
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `insufficient stock for product ${item.name}` });
      }
    }
    const totalPrice = items.reduce(
      (sum: number, i: CartItemRows) => sum + i.price * i.quantity,
      0
    );
    const orderResult = await client.query(
      'INSERT INTO orders (user_id,address_id,total_amount,status,payment_method,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,now(),now()) RETURNING order_id',
      [user_id, address, totalPrice, 'pending_payment', payment_method]
    );

    const order_id = orderResult.rows[0].order_id;
    for (const item of items) {
      console.log(item.product_name);
      await client.query(
        'INSERT INTO order_items(order_id,product_id,product_name,quantity,unit_price) VALUES ($1,$2,$3,$4,$5)',
        [order_id, item.product_id, item.product_name, item.quantity, item.price]
      );
      console.log(item.name);
    }
    await client.query('DELETE FROM cart_items WHERE cart_id=$1', [checkCart.rows[0].cart_id]);
    await client.query('COMMIT');
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.log(err);
    return res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
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
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id=$1 AND deleted_at IS NULL ORDER BY order_id LIMIT $2 OFFSET $3 ',
      [user_id, limit, offset]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'orders not found' });
    }
    res.status(200).json({ message: 'success', data: result.rows });
  } catch {
    res.status(500).json({ messgae: 'unexpected error' });
  }
}
async function getOrdersById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const order_id = req.params.order_id;
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(
      'SELECT * FROM orders o JOIN order_items oi ON oi.order_id =o.order_id WHERE o.order_id=$1 AND o.user_id=$2 AND o.deleted_at IS NULL AND oi.deleted_at IS NULL',
      [order_id, user_id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'orders not found' });
    }
    res.status(200).json({ message: 'success', data: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'unexpected error' });
  }
}
export { createOrder, getOrders, getOrdersById };
