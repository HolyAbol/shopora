import { Response, Request } from 'express';
import { pool } from '../../services/db/db';
import { shopChangeNameSchema, shopCreateSchema, shopDeletionSchema } from './shops.schema';
import { DatabaseError } from 'pg';
import z from 'zod';
async function createShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }

  const isOwner = req.user.role === 'owner';
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'insufficient permission' });
  }

  const Details = shopCreateSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }

  try {
    const { shop_name } = Details.data;
    const owner_id = req.user.user_id;

    const result = await pool.query(
      'INSERT INTO shops(shop_name, owner_id, created_at, updated_at) VALUES ($1,$2,now(),now()) RETURNING *',
      [shop_name, owner_id]
    );

    return res.status(201).json({ message: 'success', data: result.rows[0] });
  } catch (err) {
    if (err instanceof DatabaseError && err.code == '23505') {
      return res.status(409).json({ message: 'you already have a shop, or shop name taken' });
    }
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user_id = req.user.user_id;
  try {
    const existing = await pool.query(
      'SELECT * FROM shops WHERE owner_id=$1 AND deleted_at IS NULL',
      [user_id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ message: 'shop not found' });
    }

    return res.status(200).json({ message: 'success', data: existing.rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function updateShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }

  const Details = shopChangeNameSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }

  const { shop_id, shop_new_name } = Details.data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkOwnership = await client.query(
      'SELECT owner_id FROM shops WHERE shop_id=$1 AND deleted_at IS NULL',
      [shop_id]
    );

    if (checkOwnership.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'shop not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = checkOwnership.rows[0].owner_id === req.user.user_id;

    if (!isAdmin && !isOwner) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'insufficient permission' });
    }

    const existing = await client.query(
      'UPDATE shops SET shop_name=$1, updated_at=now() WHERE shop_id=$2 AND deleted_at IS NULL RETURNING shop_name',
      [shop_new_name, shop_id]
    );

    if (existing.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'shop not found' });
    }

    await client.query('COMMIT');
    return res.status(200).json({ message: 'success', data: existing.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof DatabaseError && err.code == '23505') {
      return res.status(409).json({ message: 'shop name already exists' });
    }
    return res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
  }
}

async function deleteShop(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }

  const Details = shopDeletionSchema.safeParse(req.params);
  if (!Details.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(Details.error),
    });
  }

  const { shop_id } = Details.data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkOwnership = await client.query(
      'SELECT owner_id FROM shops WHERE shop_id=$1 AND deleted_at IS NULL',
      [shop_id]
    );

    if (checkOwnership.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'shop not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = checkOwnership.rows[0].owner_id === req.user.user_id;

    if (!isAdmin && !isOwner) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'insufficient permission' });
    }

    const existing = await client.query(
      'UPDATE shops SET updated_at=now(), deleted_at=now() WHERE shop_id=$1 AND deleted_at IS NULL RETURNING shop_name',
      [shop_id]
    );

    if (existing.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'shop not found' });
    }
    await client.query(
      'UPDATE products SET updated_at=now(), deleted_at=now() WHERE shop_id=$1 AND deleted_at IS NULL',
      [shop_id]
    );

    await client.query('COMMIT');
    return res.status(200).json({ message: 'success' });
  } catch {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
  }
}
export { getShop, createShop, updateShop, deleteShop };
