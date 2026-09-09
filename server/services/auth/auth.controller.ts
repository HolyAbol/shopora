import { findUser, passHasher, compare, clearCookie } from './auth.helpers.ts';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/db.ts';
import { DatabaseError } from 'pg';
import { loginSchema, signupSchema } from './auth.schemas.ts';
import { cartCreator } from '../../logics/shared.helpers.ts';
import z from 'zod';
async function signup(req: Request, res: Response) {
  const creds = signupSchema.safeParse(req.body);
  if (!creds.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(creds.error),
    });
  }
  const { userName, userEmail, userPhoneNumber, userPassword } = creds.data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hashedPass = await passHasher(userPassword ?? '');
    const result = await client.query(
      'INSERT INTO users(username,password,phone_number,email,created_at) VALUES($1,$2,$3,$4,now()) RETURNING user_id',
      [userName, hashedPass, userPhoneNumber, userEmail]
    );
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: 'unexpected error' });
    }
    const cartCheck = await cartCreator(result.rows[0].user_id, client);
    if (cartCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: 'unexpected error' });
    }
    await client.query('COMMIT');
    return res.status(201).json({ message: 'success' });
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
    if (err instanceof DatabaseError && err.code == '23505') {
      const fieldMap: Record<string, string> = {
        users_username_key: 'userName',
        users_email_key: 'userEmail',
        users_phone_number_key: 'userPhoneNumber',
      };
      const field = fieldMap[err.constraint ?? ''] ?? 'unknown';
      return res.status(409).json({ message: `${field} already exists`, field });
    }
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function login(req: Request, res: Response) {
  const creds = loginSchema.safeParse(req.body);
  if (!creds.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(creds.error),
    });
  }
  const client = await pool.connect();
  const { userName, userPassword } = creds.data;
  try {
    await client.query('BEGIN');
    const results = await findUser(userName, client);
    const User = results.rows[0];
    if (!User) {
      await client.query('ROLLBACK');
      return res.status(401).json({ message: 'invalid creds' });
    }
    const checkPass = await compare(userPassword, User.password);
    console.log(checkPass);
    if (checkPass) {
      const token = jwt.sign(
        {
          user_id: User.user_id,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: '7d',
        }
      );
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      const update = await client.query(
        'UPDATE users SET last_activity = now() WHERE user_id =$1',
        [User.user_id]
      );
      if (update.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'unexpected error' });
      }
      await client.query('COMMIT');
      return res.status(200).json({ message: 'enjoy' });
    } else {
      await client.query('ROLLBACK');
      return res.status(401).json({ message: 'invalid creds' });
    }
  } catch {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
  }
}

function logout(req: Request, res: Response) {
  clearCookie(res);
  return res.status(200).json({
    message: 'logged out',
  });
}
export { signup, login, logout };
