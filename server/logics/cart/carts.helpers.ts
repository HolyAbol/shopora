import { EntityManager } from 'typeorm';
import { AppDataSource } from '../../configs/data-sources';
import { Product } from '../products/product.entity';
import { CartItem } from './cartItems.entity';
import { Cart } from './carts.entity';
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
  const result = await repo.save({ userId: user_id });

  return result;
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
export { checkStock, currentInCart, cartCreator, cartExistence, checkCartItems };
