import { AppDataSource } from '../configs/data-sources';
import { Shop } from '../logics/shop/shop.entity';
import { EntityManager, IsNull } from 'typeorm';
type status = 'approved' | 'rejected';
async function changeStatus(user_id: number, status: status, db?: EntityManager) {
  if (status === 'approved') {
    const manager = db ?? AppDataSource.manager;
    const result = await manager
      .getRepository(Shop)
      .update(
        { ownerId: user_id, deletedAt: IsNull(), status: 'waiting for approval' },
        { status: 'approved', approvedAt: () => 'NOW()' }
      );
    return result;
  } else {
    const manager = db ?? AppDataSource.manager;
    const result = await manager
      .getRepository(Shop)
      .update(
        { ownerId: user_id, deletedAt: IsNull(), status: 'waiting for approval' },
        { status: 'rejected', rejectedAt: () => 'NOW()' }
      );
    // db.query(
    //   `UPDATE shops SET status =$1,updated_at=now(),rejected_at=now() WHERE owner_id =$2 AND deleted_at IS NULL  AND status ='waiting for approval'`,
    //   [status, user_id]
    // );
    return result;
  }
}
export { changeStatus };
