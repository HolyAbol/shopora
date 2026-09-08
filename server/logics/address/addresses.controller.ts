import { Response, Request } from 'express';
import { pool } from '../../services/db/db';
import z from 'zod';
import { addressDetails } from './addresses.schema';
import { getUserAddress } from '../shared.helpers';
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
  const user_id = req.user.user_id;
  const { address_detail, address_title, city, country_code, postal_code, province } = Details.data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const check = await getUserAddress(user_id, client);
    if (check.rowCount !== 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'address already exists' });
    }
    const result = await client.query(
      'INSERT INTO addresses(user_id,address_detail,address_title,city,country_code,postal_code,province,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,now(),now()) RETURNING address_detail,address_title,city,country_code,postal_code,province',
      [user_id, address_detail, address_title, city, country_code, postal_code, province]
    );
    await client.query('COMMIT');
    return res.status(201).json({ message: 'success' });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
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
  const user_id = req.user.user_id;
  const { address_detail, address_title, city, country_code, postal_code, province } = Details.data;
  try {
    const result = await pool.query(
      'UPDATE addresses SET address_detail=$1,address_title=$2,city=$3,country_code=$4,postal_code=$5,province=$6,updated_at=now() WHERE user_id=$7 AND deleted_at IS NULL RETURNING address_detail,address_title,city,country_code,postal_code,province',
      [address_detail, address_title, city, country_code, postal_code, province, user_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'create an address first' });
    }
    return res.status(200).json({ message: 'success' });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function deleteAddress(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(
      'UPDATE addresses SET updated_at=now(),deleted_at=now() WHERE user_id=$1 AND deleted_at IS NULL RETURNING address_detail,address_title,city,country_code,postal_code,province,deleted_at',
      [user_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'create an address first' });
    }
    return res.status(200).json({ message: 'success' });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  }
}

export { addAddress, changeAddress, deleteAddress };
