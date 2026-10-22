import { Response, Request } from 'express';
import { DatabaseError } from 'pg';
import { addCategorySchema, categoryChange, categoryID } from './category.schema';
import { paginationQuery } from '../shared.schemas';
import z from 'zod';
import { AppDataSource } from '../../configs/data-sources';
import { ProductCategory } from './productCategory.entity';
import { Product } from '../products/product.entity';
import { CartItem } from '../cart/cartItems.entity';
import { Category } from './category.entity';
import { In, IsNull, QueryFailedError } from 'typeorm';
import { logger, projectstatus } from '../shared.helpers';
async function addCategory(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = addCategorySchema.safeParse(req.body);
  console.log(Details.error?.issues);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { category_name, category_parent_id } = Details.data;
  try {
    const repo = AppDataSource.getRepository(Category);
    const result = await repo.save({
      categoryName: category_name,
      categoryParentId: category_parent_id,
    });
    return res.status(201).json({ message: 'success', data: result.categoryId });
  } catch (err) {
    if (err instanceof QueryFailedError && err.driverError instanceof DatabaseError) {
      if (err.driverError.code === '23505') {
        return res.status(409).json({ message: 'category_name already exists' });
      }
      if (err.driverError.code === '23503') {
        return res.status(400).json({ message: 'parent category does not exist' });
      }
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeCategory(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = categoryChange.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { category_id, category_name, category_new_parent_id } = Details.data;

  if (Details.data.category_new_parent_id === Details.data.category_id) {
    return res.status(400).json({ message: 'new parent id cant be the same as category id' });
  }
  try {
    const result = await AppDataSource.getRepository(Category).update(
      { categoryId: category_id, deletedAt: IsNull() },
      { categoryName: category_name, categoryParentId: category_new_parent_id }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'category not found' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    if (err instanceof QueryFailedError && err.driverError instanceof DatabaseError) {
      if (err.driverError.code === '23505') {
        return res.status(409).json({ message: 'category_name already exists' });
      }
      if (err.driverError.code === '23503') {
        return res.status(400).json({ message: 'parent category does not exist' });
      }
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function deleteCategory(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = categoryID.safeParse(req.params);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { category_id } = Details.data;

  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const category = await manager.findOne(Category, {
        where: { categoryId: category_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!category) return 'not_found' as const;
      const hasChildren = await manager.exists(Category, {
        where: { categoryParentId: category_id },
      });
      if (hasChildren) return 'has_children' as const;
      const links = await manager.find(ProductCategory, {
        where: { categoryId: category_id },
        select: { productId: true },
      });
      const productIds = links.map((l) => l.productId);
      console.log(productIds);
      if (productIds.length > 0) {
        const otherLinks = await manager.find(ProductCategory, {
          where: { productId: In(productIds) },
          select: { productId: true, categoryId: true },
        });
        console.log(otherLinks);
        const keep = new Set(
          otherLinks.filter((l) => l.categoryId !== category_id).map((l) => l.productId)
        );
        const toDelete = productIds.filter((id) => !keep.has(id));

        if (toDelete.length > 0) {
          await manager.softDelete(Product, {
            productId: In(toDelete),
            deletedAt: IsNull(),
          });
          await manager.softDelete(CartItem, {
            productId: In(toDelete),
            deletedAt: IsNull(),
          });
        }
        await manager.softDelete(ProductCategory, {
          categoryId: category_id,
          deletedAt: IsNull(),
        });
      }
      await manager.softDelete(Category, {
        categoryId: category_id,
        deletedAt: IsNull(),
      });

      return 'ok' as const;
    });
    if (outcome === 'not_found') {
      return res.status(404).json({ message: 'category not found' });
    }
    if (outcome === 'has_children') {
      return res.status(409).json({ message: 'category has active children' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function getCategories(req: Request, res: Response) {
  const paginate = paginationQuery.safeParse(req.query);

  if (!paginate.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(paginate.error),
    });
  }
  const { limit, page } = paginate.data;
  try {
    const [categories, total] = await AppDataSource.getRepository(Category).findAndCount({
      order: { categoryId: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return res.status(200).json({
      message: 'success',
      data: categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function getCategoryById(req: Request, res: Response) {
  const Details = categoryID.safeParse(req.params);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { category_id } = Details.data;
  try {
    const repo = AppDataSource.getRepository(Category);
    const result = await repo.findOne({ where: { categoryId: category_id } });
    if (!result) {
      return res.status(404).json({ message: 'category dosent exist' });
    }
    return res.status(200).json({ message: 'success', data: result });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

export { addCategory, getCategoryById, getCategories, changeCategory, deleteCategory };
