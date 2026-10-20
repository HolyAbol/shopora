import { Response, Request } from 'express';
import z from 'zod';
import { isPgError, logger, projectstatus } from '../shared.helpers';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../../services/db/data-sources';
import { Shop } from './shop.entity';
import { Product } from '../products/product.entity';
import { softDeleteProducts } from '../shared.helpers';
import { shopChangeNameSchema, shopCreateSchema, shopDeletionSchema } from './shops.schema';
async function createShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const details = shopCreateSchema.safeParse(req.body);
  if (!details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(details.error),
    });
  }

  const { shop_name } = details.data;

  try {
    const repo = AppDataSource.getRepository(Shop);
    const shop = await repo.save(
      repo.create({
        shopName: shop_name,
        ownerId: req.user.userId,
        status: 'waiting for approval',
      })
    );
    return res.status(201).json({ message: 'success', data: shop });
  } catch (err) {
    if (isPgError(err, '23505')) {
      return res.status(409).json({ message: 'you already have a shop, or shop name taken' });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function getShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  try {
    const shop = await AppDataSource.getRepository(Shop).findOne({
      where: { ownerId: req.user.userId },
      order: { shopId: 'ASC' },
    });
    if (!shop) {
      return res.status(404).json({ message: 'shop not found' });
    }
    return res.status(200).json({ message: 'success', data: shop });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function updateShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const details = shopChangeNameSchema.safeParse(req.body);
  if (!details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(details.error),
    });
  }

  const { shop_id, shop_new_name } = details.data;

  try {
    const repo = AppDataSource.getRepository(Shop);

    const shop = await repo.findOne({ where: { shopId: shop_id } });
    if (!shop) {
      return res.status(404).json({ message: 'shop not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = shop.ownerId === req.user.userId;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'insufficient permission' });
    }

    const result = await repo.update(
      { shopId: shop_id, deletedAt: IsNull() },
      { shopName: shop_new_name }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'shop not found' });
    }

    return res.status(200).json({ message: 'success', data: { shop_name: shop_new_name } });
  } catch (err) {
    if (isPgError(err, '23505')) {
      return res.status(409).json({ message: 'shop name already exists' });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function deleteShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const details = shopDeletionSchema.safeParse(req.params);
  if (!details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(details.error),
    });
  }

  const { shop_id } = details.data;
  const user = req.user;

  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const shop = await manager.findOne(Shop, {
        where: { shopId: shop_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!shop) return 'not_found' as const;

      if (user.role !== 'admin' && shop.ownerId !== user.userId) {
        return 'forbidden' as const;
      }

      await manager.softDelete(Shop, { shopId: shop_id, deletedAt: IsNull() });
      await manager.softDelete(Product, { shopId: shop_id, deletedAt: IsNull() });
      await softDeleteProducts(manager, { shopId: shop_id });
      return 'ok' as const;
    });

    if (outcome === 'not_found') {
      return res.status(404).json({ message: 'shop not found' });
    }
    if (outcome === 'forbidden') {
      return res.status(403).json({ message: 'insufficient permission' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

export { getShop, createShop, updateShop, deleteShop };
