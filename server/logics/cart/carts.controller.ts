import { Response, Request } from 'express';
import { pool } from '../../services/db/db';
import z from 'zod';
import { addItemToCart, cartItemQuantity } from './carts.schema';
import { cartCreator, checkStock, currentInCart } from './carts.helpers';
import { cartExistence, checkCartItems } from '../shared.helpers';

async function createCart(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user_id = req.user.user_id;
  try {
    const exist = await cartExistence(user_id, pool);
    if (exist.rowCount === 0) {
      const creation = await cartCreator(user_id);
      return res.status(201).json({ cart: creation.rows[0] });
    }
    return res.status(200).json({ cart: exist.rows[0] });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getCarts(req: Request, res: Response) {
  interface CartItemRows {
    product_id: number;
    quantity: number;
    price: number;
    name: string;
  }
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user_id = req.user.user_id;
  try {
    const check = await cartExistence(user_id, pool);
    if (check.rowCount === 0) {
      return res.status(404).json({ message: 'cart dosent exists' });
    }
    const result = await checkCartItems(user_id, pool);
    console.log(result);

    const totalItems = result.reduce((sum: number, i: CartItemRows) => sum + i.quantity, 0);
    const totalPrice = result.reduce(
      (sum: number, i: CartItemRows) => sum + i.price * i.quantity,
      0
    );
    return res.status(200).json({
      items: result,
      totalItems,
      totalPrice,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'unexpected error' });
  }
}
async function addItemsToCart(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = addItemToCart.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const user_id = req.user.user_id;
  const { quantity, product_id } = Details.data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const check = await checkStock(product_id);
    if (check.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'product not found' });
    }
    const stockAmount = check.rows[0].quantity;
    if (stockAmount < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'requested amount cannot exceed stock' });
    }
    let cart_id: number;
    const exist = await cartExistence(user_id, pool);
    if (exist.rowCount === 0) {
      const created = await cartCreator(user_id);
      cart_id = created.rows[0].cart_id;
    } else {
      cart_id = exist.rows[0].cart_id;
    }
    const currentAmount = await currentInCart(product_id, cart_id);
    const currentQty = currentAmount.rows[0]?.quantity ?? 0;
    if (currentQty + quantity > stockAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'requested amount cannot exceed stock' });
    }
    const result = await pool.query(
      'INSERT INTO cart_items (cart_id,product_id,quantity,updated_at) values ($1,$2,$3,now()) ON CONFLICT (cart_id,product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, deleted_at=NULL RETURNING cart_id , product_id , quantity',
      [cart_id, product_id, quantity]
    );
    await client.query('COMMIT');
    return res.status(201).json({ item: result.rows[0] });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
  }
}
async function changeItemQuantity(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = cartItemQuantity.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const user_id = req.user.user_id;
  const { quantity, product_id } = Details.data;
  try {
    const check = await checkStock(product_id);
    if (check.rowCount === 0) {
      return res.status(400).json({ message: 'product not found' });
    }
    if (check.rows[0].quantity < quantity) {
      return res.status(400).json({ message: 'requested amount cannot exceed stock' });
    }

    let cart_id: number;
    const exist = await cartExistence(user_id, pool);
    if (exist.rowCount === 0) {
      return res.status(404).json({ message: "cart dosen't exists" });
    }
    cart_id = exist.rows[0].cart_id;
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 ,updated_at=now() WHERE cart_id = $2 AND product_id = $3 AND deleted_at IS NULL RETURNING cart_id, product_id,quantity',
      [quantity, cart_id, product_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "item's not in cart" });
    }
    return res.status(200).json({ item: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function removeItem(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user_id = req.user.user_id;
  try {
    const product_id = Number(req.params.product_id);
    const cart = await cartExistence(user_id, pool);
    if (cart.rowCount === 0) {
      return res.status(404).json({ message: "cart doesn't exist" });
    }
    const cart_id = cart.rows[0].cart_id;

    const result = await pool.query(
      'UPDATE cart_items SET deleted_at = now(),quantity= 0 WHERE cart_id = $1 AND product_id = $2 AND deleted_at IS NULL RETURNING product_id',
      [cart_id, product_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "item's not in cart" });
    }

    return res.status(204).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
export { getCarts, createCart, addItemsToCart, changeItemQuantity, removeItem };
