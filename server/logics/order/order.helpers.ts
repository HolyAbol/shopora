import { AppDataSource } from '../../configs/data-sources';
import { EntityManager } from 'typeorm';
import { Order } from './orders.entity';
import { IsNull } from 'typeorm';
async function checkOrderItems(user_id: number, order_id: number, db?: EntityManager) {
  const manager = db ?? AppDataSource.manager;
  const result = await manager
    .getRepository(Order)
    .createQueryBuilder('o')
    .withDeleted()
    .innerJoinAndSelect('o.items', 'oi', 'oi.deleted_at IS NULL')
    .innerJoinAndSelect('o.address', 'a')
    .innerJoinAndSelect('o.user', 'u')
    .addSelect(['u.email', 'u.phoneNumber', 'u.firstName', 'u.lastName'])
    .where('o.order_id = :order_id', { order_id })
    .andWhere('o.user_id = :user_id', { user_id })
    .andWhere('o.deleted_at IS NULL')
    .getOne();
  return result;
}
async function isOrderCancelled(user_id: number, order_id: number, db?: EntityManager) {
  const manager = db ?? AppDataSource.manager;
  const result = await manager.findOne(Order, {
    where: {
      orderId: order_id,
      userId: user_id,
      status: 'pending_payment',
      deletedAt: IsNull(),
    },
  });
  return result;
}
export { checkOrderItems, isOrderCancelled };
