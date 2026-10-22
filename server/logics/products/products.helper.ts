import { EntityManager, IsNull } from 'typeorm';
import { Product } from './product.entity';
import { Shop } from '../shop/shop.entity';
import { Category } from '../category/category.entity';
import { ProductCategory } from '../category/productCategory.entity';
import { In, FindOptionsWhere } from 'typeorm';
import { CartItem } from '../cart/cartItems.entity';
async function checkProductOwnership(
  db: EntityManager,
  product_id: number,
  user: { userId: number; role?: string }
): Promise<{ found: boolean; allowed: boolean }> {
  const result = await db
    .createQueryBuilder(Product, 'p')
    .innerJoin(Shop, 's', 's.shopId = p.shopId')
    .select('s.ownerId', 'owner_id')
    .where('p.productId = :product_id', { product_id })
    .andWhere('p.deletedAt IS NULL')
    .andWhere('s.deletedAt IS NULL')
    .getRawOne();
  if (!result) {
    return { found: false, allowed: false };
  }
  const isAdmin = user.role === 'admin';
  const isOwner = result.owner_id === user.userId;
  return { found: true, allowed: isAdmin || isOwner };
}

async function assignCategories(product_id: number, category_id: number, db: EntityManager) {
  const category = await db.findOne(Category, {
    where: { categoryId: category_id, deletedAt: IsNull() },
  });
  if (!category) {
    throw new Error('invalid category');
  }
  await db.insert(ProductCategory, { productId: product_id, categoryId: category_id });
}
async function softDeleteProducts(
  manager: EntityManager,
  where: FindOptionsWhere<Product>
): Promise<number> {
  const products = await manager.find(Product, {
    where,
    select: { productId: true },
  });
  const ids = products.map((p) => p.productId);
  if (ids.length === 0) return 0;

  await manager.softDelete(CartItem, {
    productId: In(ids),
    deletedAt: IsNull(),
  });
  await manager.softDelete(ProductCategory, {
    productId: In(ids),
    deletedAt: IsNull(),
  });
  await manager.softDelete(Product, {
    productId: In(ids),
    deletedAt: IsNull(),
  });

  return ids.length;
}
export { checkProductOwnership, assignCategories, softDeleteProducts };
