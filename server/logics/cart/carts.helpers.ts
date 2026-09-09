import { pool } from '../../services/db/db';

async function checkStock(product_id: number) {
  const creation = await pool.query(
    'SELECT quantity FROM products WHERE product_id=$1 AND deleted_at IS NULL',
    [product_id]
  );
  return creation;
}
async function currentInCart(product_id: number, cart_id: number) {
  const amount = await pool.query(
    'SELECT quantity FROM cart_items WHERE cart_id=$1 AND product_id=$2 AND deleted_at IS NULL',
    [cart_id, product_id]
  );
  return amount;
}
export { checkStock, currentInCart };
