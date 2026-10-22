import { Response, Request } from 'express';
import z from 'zod';
import { addItemToCart, cartItemQuantity, removeItemFromcart } from './carts.schema';
import { checkStock, currentInCart } from './carts.helpers';
import { logger, projectstatus } from '../shared.helpers';
import { cartExistence, checkCartItems } from './carts.helpers';
import { AppDataSource } from '../../configs/data-sources';
import { CartItem } from './cartItems.entity';
import { IsNull } from 'typeorm';
async function getCarts(req: Request, res: Response) {
  interface CartItemRows {
    cart_id: number;
    product_id: number;
    quantity: number;
    product_name: string;
    price: number;
  }
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user_id = req.user.userId;
  try {
    if (!(await cartExistence(user_id))) {
      return res.status(404).json({ message: 'cart dosent exists' });
    }
    const items: CartItemRows[] = await checkCartItems(user_id);

    const totalItems = items.reduce((sum: number, i: CartItemRows) => sum + i.quantity, 0);
    const totalPrice = items.reduce(
      (sum: number, i: CartItemRows) => sum + i.price * i.quantity,
      0
    );
    return res.status(200).json({
      items: items,
      totalItems,
      totalPrice,
    });
  } catch (err) {
    logger(err, projectstatus);
    res.status(500).json({ message: 'unexpected error' });
  }
}

async function addItemsToCart(req: Request, res: Response) {
  const errors = {
    product_not_found: [404, 'product not found'],
    exceeds_stock: [400, 'requested amount cannot exceed stock'],
    no_cart: [404, 'cart not found'],
  } as const;
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
  const user_id = req.user.userId;
  const { quantity, product_id } = Details.data;
  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const productQuantity = await checkStock(product_id, manager);
      if (productQuantity === null) return { error: 'product_not_found' } as const;
      if (productQuantity < quantity) {
        return { error: 'exceeds_stock' } as const;
      }
      const cart_id = await cartExistence(user_id, manager);
      if (cart_id === null) {
        return { error: 'no_cart' } as const;
      }
      const currentAmount = await currentInCart(product_id, cart_id, manager);
      const currentQty = currentAmount ?? 0;
      if (currentQty + quantity > productQuantity) {
        return { error: 'exceeds_stock' } as const;
      }
      const result = await manager.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (cart_id, product_id) DO UPDATE SET
            quantity = CASE WHEN cart_items.deleted_at IS NULL
                            THEN cart_items.quantity + EXCLUDED.quantity
                            ELSE EXCLUDED.quantity END,
            deleted_at = NULL,
            updated_at = NOW()
          RETURNING cart_id, product_id, quantity`,
        [cart_id, product_id, quantity]
      );
      return { item: result[0] } as const;
    });
    if ('error' in outcome && outcome.error) {
      const [status, message] = errors[outcome.error];
      return res.status(status).json({ message });
    }
    return res.status(201).json({ item: outcome.item });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
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
  const user_id = req.user.userId;
  const { quantity, product_id } = Details.data;
  try {
    const check = await checkStock(product_id);
    if (check === null) {
      return res.status(400).json({ message: 'product not found' });
    }
    if (check < quantity) {
      return res.status(400).json({ message: 'requested amount cannot exceed stock' });
    }

    const exist = await cartExistence(user_id);
    if (exist === null) {
      return res.status(404).json({ message: "cart dosen't exists" });
    }
    const cart_id = exist;
    const repo = AppDataSource.getRepository(CartItem);
    const result = await repo.update(
      { cartId: cart_id, productId: product_id, deletedAt: IsNull() },
      { quantity: quantity }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: "item's not in cart" });
    }
    return res.status(200).json({ message: 'changed successfully' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function removeItem(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const details = removeItemFromcart.safeParse(req.params.product_id);
  if (!details.success) {
    return res
      .status(400)
      .json({ message: 'Validation failed', errors: z.treeifyError(details.error) });
  }
  const { product_id } = details.data;
  const user_id = req.user.userId;
  try {
    const cart = await cartExistence(user_id);
    if (cart === null) {
      return res.status(404).json({ message: "cart doesn't exist" });
    }
    const cart_id = cart;
    const result = await AppDataSource.getRepository(CartItem).delete({
      cartId: cart_id,
      productId: product_id,
    });
    if (result.affected === 0) {
      return res.status(404).json({ message: "item's not in cart" });
    }

    return res.status(204).send();
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
export { getCarts, addItemsToCart, changeItemQuantity, removeItem };
