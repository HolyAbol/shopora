import { AppDataSource } from '../../services/db/data-sources';
import { pool } from '../../services/db/db';
import { Product } from '../products/product.entity';

async function checkStock(product_id: number): Promise<number> {
  const repo = AppDataSource.getRepository(Product);
  const result = await repo.findOne({
    where: { productId: product_id },
    select: { quantity: true },
  });
  if (!result) {
    throw new Error('product not found');
  }
  const quantity = Number(result?.quantity);
  return quantity;
}
async function currentInCart(product_id: number, cart_id: number) {
  const amount = await pool.query(
    'SELECT quantity FROM cart_items WHERE cart_id=$1 AND product_id=$2 AND deleted_at IS NULL',
    [cart_id, product_id]
  );
  return amount;
}
export { checkStock, currentInCart };
