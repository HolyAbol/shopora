import bcrypt from "bcrypt";
import { Response } from "express";
import { Pool, PoolClient } from "pg";
import { AppDataSource } from "../db/data-sources";
import { User } from "../user.entity";
import { EntityManager } from "typeorm";
type Queryable = Pool | PoolClient;
async function findUser(username: string, db: EntityManager) {
  const repo = db.getRepository(User);
  const result = repo.findOne({
    where: { username: username },
    select: { userId: true, password: true },
  });
  return result;
}
async function passHasher(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}
async function compare(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
function clearCookie(res: Response) {
  res.clearCookie("token", {
    sameSite: "lax",
    secure: true,
    httpOnly: true,
  });
}
export { findUser, clearCookie, compare, passHasher };
