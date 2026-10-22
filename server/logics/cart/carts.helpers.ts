import { EntityManager } from 'typeorm';
import { AppDataSource } from '../../configs/data-sources';
import { pool } from '../../services/db/db';
import { Product } from '../products/product.entity';
import { CartItem } from './cartItems.entity';
import { $ZodNull } from 'zod/v4/core';

async function checkStock(product_id: number, db?: EntityManager): Promise<number | null> {
  const manager = db ?? AppDataSource.manager;
  const repo = manager.getRepository(Product);
  const result = await repo.findOne({
    where: { productId: product_id },
    select: { quantity: true },
  });
  return result ? result.quantity : null;
}
async function currentInCart(
  product_id: number,
  cart_id: number,
  db?: EntityManager
): Promise<number> {
  const manager = db ?? AppDataSource.manager;
  const amount = await manager.findOne(CartItem, {
    where: { cartId: cart_id, productId: product_id },
    select: { quantity: true },
  });
  return amount?.quantity ?? 0;
}
export { checkStock, currentInCart };
