import { Response, Request } from 'express';
import {
  manufactureChangeName,
  manufactureDeletion,
  manufactureAdd,
  manufactureID,
} from './manufacture.schemas';
import { DatabaseError } from 'pg';
import { paginationQuery } from '../shared.schemas';
import z from 'zod';
import { AppDataSource } from '../../configs/data-sources';
import { Manufacturer } from './manufacture.entity';
import { IsNull, QueryFailedError } from 'typeorm';
import { logger, projectstatus } from '../shared.helpers';
import { softDeleteProducts } from '../products/products.helper';

async function addManus(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = manufactureAdd.safeParse(req.body);
  console.log(Details);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    return res.status(403).json({ message: 'insufficient permission' });
  }
  const { manufacturer_name, country_code } = Details.data;
  try {
    const manuRepo = AppDataSource.getRepository(Manufacturer);
    const result = await manuRepo.save({
      manufacturerName: manufacturer_name,
      countryCode: country_code,
    });
    return res.status(201).json({ message: 'success', id: result.manufacturerId });
  } catch (err) {
    if (
      err instanceof QueryFailedError &&
      err.driverError instanceof DatabaseError &&
      err.driverError.code === '23505'
    ) {
      return res.status(409).json({ message: 'manufacture_name already exists' });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function changeManusName(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = manufactureChangeName.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { manufacturer_id, manufacturer_new_name } = Details.data;
  try {
    const result = await AppDataSource.getRepository(Manufacturer)
      .createQueryBuilder()
      .update()
      .set({ manufacturerName: manufacturer_new_name })
      .where('manufacturer_id = :id AND deleted_at IS NULL', { id: manufacturer_id })
      .execute();
    if (result.affected === 0) {
      return res.status(404).json({ message: 'manufacturer not found' });
    }
    return res
      .status(200)
      .json({ message: 'success', data: { manufactureName: manufacturer_new_name } });
  } catch (err) {
    if (
      err instanceof QueryFailedError &&
      err.driverError instanceof DatabaseError &&
      err.driverError.code === '23505'
    ) {
      return res.status(409).json({ message: 'manufacture_name already exists' });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function deleteManus(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = manufactureDeletion.safeParse(req.params);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    return res.status(403).json({ message: 'insufficient permission' });
  }

  const { manufacturer_id } = Details.data;
  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const manufacturer = await manager.findOne(Manufacturer, {
        where: { manufacturerId: manufacturer_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!manufacturer) return 'not_found' as const;

      await softDeleteProducts(manager, { manufacturerId: manufacturer_id });
      await manager.softDelete(Manufacturer, {
        manufacturerId: manufacturer_id,
        deletedAt: IsNull(),
      });

      return 'ok' as const;
    });

    if (outcome === 'not_found') {
      return res.status(404).json({ message: 'manufacturer not found' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getManusById(req: Request, res: Response) {
  const Details = manufactureID.safeParse(req.params);
  console.log(Details.error?.issues);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const { manufacturer_id } = Details.data;
  try {
    const manufacturer = await AppDataSource.getRepository(Manufacturer).findOne({
      where: { manufacturerId: manufacturer_id },
    });
    if (!manufacturer) {
      return res.status(404).json({ message: 'manufacturer not found' });
    }
    return res.status(200).json({ message: 'success', data: manufacturer });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function getManus(req: Request, res: Response) {
  const paginate = paginationQuery.safeParse(req.query);
  if (!paginate.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(paginate.error),
    });
  }
  const { limit, page } = paginate.data;
  try {
    const [manufacturers, total] = await AppDataSource.getRepository(Manufacturer).findAndCount({
      order: { manufacturerId: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return res.status(200).json({
      message: 'success',
      data: manufacturers,
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
export { addManus, getManus, getManusById, changeManusName, deleteManus };
