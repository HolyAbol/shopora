import { Response, Request } from 'express';
import { pool } from '../../services/db/db';
import z from 'zod';
import { addressDetails } from './addresses.schema';
import { logger, getUserAddress, projectstatus } from '../shared.helpers';
import { AppDataSource } from '../../configs/data-sources';
import { Address } from './addresses.entity';
import { IsNull } from 'typeorm';
async function addAddress(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = addressDetails.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const user_id = req.user.userId;
  const { address_detail, address_title, city, country_code, postal_code, province } = Details.data;
  try {
    const check = await getUserAddress(user_id);
    if (check === null) {
      return res.status(409).json({ message: 'address already exists' });
    }
    const result = await AppDataSource.getRepository(Address).insert({
      addressDetail: address_detail,
      addressTitle: address_title,
      city: city,
      countryCode: country_code,
      postalCode: postal_code,
      province: province,
    });
    return res.status(201).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function changeAddress(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const Details = addressDetails.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }
  const user_id = req.user.userId;
  const { address_detail, address_title, city, country_code, postal_code, province } = Details.data;
  try {
    const repo = AppDataSource.getRepository(Address);
    const result = await repo.update(
      { userId: user_id, deletedAt: IsNull() },
      {
        addressDetail: address_detail,
        addressTitle: address_title,
        city: city,
        countryCode: country_code,
        postalCode: postal_code,
        province: province,
      }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'create an address first' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function deleteAddress(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user_id = req.user.userId;
  try {
    const result = await AppDataSource.getRepository(Address).softDelete({ userId: user_id });
    if (result.affected === 0) {
      return res.status(404).json({ message: 'create an address first' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

export { addAddress, changeAddress, deleteAddress };
