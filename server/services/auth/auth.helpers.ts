import bcrypt from 'bcrypt';
import { Response } from 'express';
import { pool } from '../db/db.ts';
import { Pool, PoolClient } from 'pg';
type Queryable = Pool | PoolClient;
async function findUser(userName: string, db: Queryable) {
  const User = await db.query('SELECT * FROM users WHERE username =$1 AND deleted_at IS NULL', [
    userName,
  ]);
  return User;
}
async function passHasher(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}
async function compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
function clearCookie(res: Response) {
  res.clearCookie('token', {
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  });
}
export { findUser, clearCookie, compare, passHasher };
