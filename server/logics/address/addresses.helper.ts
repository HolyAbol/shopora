import { EntityManager } from 'typeorm';
import { AppDataSource } from '../../configs/data-sources';
import { Address } from './addresses.entity';

async function getUserAddress(user_id: number, db?: EntityManager): Promise<Address | null> {
  const manager = db ?? AppDataSource.manager;
  const check = manager.findOne(Address, { where: { userId: user_id } });
  return check ?? null;
}
export { getUserAddress };
