import { Response, Request } from 'express';
import z from 'zod';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../../configs/data-sources';
import { isPgError, logger, projectstatus } from '../shared.helpers';
import { paginationQuery } from '../shared.schemas';
import { Product } from './product.entity';
import { Shop } from '../shop/shop.entity';
import { Category } from '../category/category.entity';
import { ProductCategory } from '../category/productCategory.entity';
import {
  addProductSchema,
  changeProductActiveSchema,
  changeProductCategorySchema,
  changeProductLowSchema,
  changeProductManuSchema,
  changeProductNameSchema,
  changeProductPriceSchema,
  changeProductQuantitySchema,
  ProductCategoryIdSchema,
  productDescriptionSchema,
  ProductIdSchema,
} from './product.schema';
import { checkProductOwnership, assignCategories } from './products.helper';

async function addPro(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'insufficient permission' });
  }
  const Details = addProductSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const {
    product_name,
    category_id,
    manufacturer_id,
    quantity,
    price,
    description,
    is_active,
    low_stock_threshold,
  } = Details.data;
  const user = req.user;

  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const shop = await manager.findOne(Shop, {
        where: { ownerId: user.userId, status: 'approved', deletedAt: IsNull() },
      });
      if (!shop) return 'no_shop' as const;

      const product = await manager.save(
        manager.create(Product, {
          productName: product_name,
          manufacturerId: manufacturer_id,
          shopId: shop.shopId,
          quantity,
          price,
          description,
          isActive: is_active,
          lowStockThreshold: low_stock_threshold,
        })
      );
      await assignCategories(product.productId, category_id, manager);
      console.log(product);
      return product.productId;
    });

    if (outcome === 'no_shop') {
      return res.status(404).json({ message: 'you need to create a shop first' });
    }
    return res.status(201).json({ message: 'success', product_id: outcome });
  } catch (err: unknown) {
    if (isPgError(err, '23503')) {
      const constraint = (err as any).driverError?.constraint;

      if (constraint === 'fk_manufacturer_id') {
        return res.status(409).json({ message: "manufacturer doesn't exist" });
      }
      if (constraint === 'fk_category_id') {
        return res.status(409).json({ message: "category doesn't exist" });
      }

      return res.status(409).json({ message: "referenced record doesn't exist" });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function addDescription(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = productDescriptionSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { description, product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const result = await AppDataSource.getRepository(Product).update(
      { productId: product_id, deletedAt: IsNull() },
      { description }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeProName(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = changeProductNameSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { product_name, product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const result = await AppDataSource.getRepository(Product).update(
      { productId: product_id, deletedAt: IsNull() },
      { productName: product_name }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product dosent exists' });
    }

    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeProPrice(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = changeProductPriceSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { price, product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const result = await AppDataSource.getRepository(Product).update(
      { productId: product_id, deletedAt: IsNull() },
      { price }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeProQuantity(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = changeProductQuantitySchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { quantity, product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const result = await AppDataSource.getRepository(Product).update(
      { productId: product_id, deletedAt: IsNull() },
      { quantity }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeProLowStock(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = changeProductLowSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { low_stock_threshold, product_id } = Details.data;
  try {
    const repo = AppDataSource.getRepository(Product);
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const product = await repo.findOne({
      where: { productId: product_id, deletedAt: IsNull() },
      select: { quantity: true },
    });
    if (product && product.quantity < low_stock_threshold) {
      return res
        .status(400)
        .json({ message: "low stock threshold can't be greater than quantity" });
    }
    const result = await repo.update(
      { productId: product_id, deletedAt: IsNull() },
      { lowStockThreshold: low_stock_threshold }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product_id is invalid ' });
    }

    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeProActive(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = changeProductActiveSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { is_active, product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const result = await AppDataSource.getRepository(Product).update(
      { productId: product_id, deletedAt: IsNull() },
      { isActive: is_active }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeProManu(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = changeProductManuSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { manufacturer_id, product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const result = await AppDataSource.getRepository(Product).update(
      { productId: product_id, deletedAt: IsNull() },
      { manufacturerId: manufacturer_id }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err: unknown) {
    if (isPgError(err, '23503')) {
      return res.status(409).json({ message: 'manufacturer dosent exists' });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeProCategory(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = changeProductCategorySchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { category_id, product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const category = await AppDataSource.getRepository(Category).findOne({
      where: { categoryId: category_id, deletedAt: IsNull() },
      select: { categoryParentId: true },
    });
    if (!category) {
      return res.status(404).json({ message: 'category not found' });
    }
    if (category.categoryParentId === null) {
      return res
        .status(400)
        .json({ message: 'category must be a subcategory,not a parent category' });
    }
    const results = await AppDataSource.getRepository(ProductCategory).update(
      { productId: product_id },
      { categoryId: category_id }
    );
    if (results.affected === 0) {
      return res.status(404).json({ message: 'product not found' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err: unknown) {
    if (isPgError(err, '23503')) {
      return res.status(409).json({ message: 'category dosent exists' });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function getProsById(req: Request, res: Response) {
  try {
    const Details = ProductIdSchema.safeParse(req.params);
    console.log(Details.error?.issues);
    if (!Details.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: z.treeifyError(Details.error),
      });
    }
    console.log(Details.data);
    const { product_id } = Details.data;
    const existing = await AppDataSource.getRepository(Product).findOne({
      where: { productId: product_id, deletedAt: IsNull() },
    });
    if (!existing) {
      return res.status(404).json({ message: 'product not found' });
    }
    return res.status(200).json({ message: 'success', data: existing });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function getPros(req: Request, res: Response) {
  const paginate = paginationQuery.safeParse(req.query);
  console.log(paginate.error?.issues);
  console.log(paginate.data);
  try {
    if (!paginate.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: z.treeifyError(paginate.error),
      });
    }
    const { limit, page } = paginate.data;
    const offset = (page - 1) * limit;

    const existing = await AppDataSource.getRepository(Product).find({
      where: { deletedAt: IsNull() },
      order: { productId: 'ASC' },
      take: limit,
      skip: offset,
    });
    if (existing.length === 0) {
      return res.status(404).json({ message: 'products not found' });
    }
    return res.status(200).json({ message: 'success', data: existing });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function getProsByCategory(req: Request, res: Response) {
  const paginate = paginationQuery.safeParse(req.query);
  const category = ProductCategoryIdSchema.safeParse(req.query);
  try {
    if (!paginate.success || !category.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          ...(paginate.success ? {} : z.treeifyError(paginate.error)),
          ...(category.success ? {} : z.treeifyError(category.error)),
        },
      });
    }
    const { limit, page } = paginate.data;
    const offset = (page - 1) * limit;
    const { category_id } = category.data;
    const existing = await AppDataSource.getRepository(Product)
      .createQueryBuilder('p')
      .innerJoin(ProductCategory, 'pc', 'pc.productId = p.productId')
      .where('pc.categoryId = :category_id', { category_id })
      .andWhere('p.deletedAt IS NULL')
      .orderBy('p.productId', 'ASC')
      .limit(limit)
      .offset(offset)
      .getMany();
    if (existing.length === 0) {
      return res.status(404).json({ message: 'products not found' });
    }
    return res.status(200).json({ message: 'success', data: existing });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function deleteProduct(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = ProductIdSchema.safeParse(req.params);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { product_id } = Details.data;
  try {
    const ownership = await checkProductOwnership(AppDataSource.manager, product_id, req.user);
    if (!ownership.found) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    const result = await AppDataSource.getRepository(Product).softDelete({
      productId: product_id,
      deletedAt: IsNull(),
    });
    if (result.affected === 0) {
      return res.status(404).json({ message: 'product dosent exists' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

export {
  addPro,
  addDescription,
  changeProName,
  changeProPrice,
  changeProQuantity,
  changeProLowStock,
  changeProActive,
  changeProManu,
  changeProCategory,
  getPros,
  getProsByCategory,
  getProsById,
  deleteProduct,
};
