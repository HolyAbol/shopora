import { Pool } from 'pg';
import { PoolClient } from 'pg';
type Queryable = Pool | PoolClient;
async function checkProductOwnership(
  db: Queryable,
  product_id: number,
  user: { user_id: number; role?: string }
): Promise<{ found: boolean; allowed: boolean }> {
  const result = await db.query(
    'SELECT s.owner_id FROM products p JOIN shops s ON p.shop_id = s.shop_idWHERE p.product_id=$1 AND p.deleted_at IS NULL AND s.deleted_at IS NULL',
    [product_id]
  );
  if (result.rowCount === 0) {
    return { found: false, allowed: false };
  }
  const isAdmin = user.role === 'admin';
  const isOwner = result.rows[0].owner_id === user.user_id;
  return { found: true, allowed: isAdmin || isOwner };
}
async function assignCategories(product_id: number, category_id: number, db: Queryable) {
  const result = await db.query(
    'SELECT * FROM categories WHERE category_id=$1 AND deleted_at IS NULL',
    [category_id]
  );
  if (result.rowCount === 0) {
    throw new Error('invalid category');
  }
  await db.query('INSERT INTO product_categories(product_id,category_id) VALUES ($1,$2)', [
    product_id,
    category_id,
  ]);
}
export { checkProductOwnership, assignCategories };
