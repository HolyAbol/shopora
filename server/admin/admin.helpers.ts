import { Pool, PoolClient } from 'pg';
import { pool } from '../services/db/db';
type Queryable = Pool | PoolClient;
type status = 'approved' | 'rejected';
async function changeStatus(user_id: number, status: status, db: Queryable) {
  if (status === 'approved') {
    const result = await db.query(
      `UPDATE shops SET status =$1,updated_at=now(),approved_at=now() WHERE owner_id =$2 AND deleted_at IS NULL AND status ='waiting for approval' `,
      [status, user_id]
    );
    return result;
  } else {
    const result = await db.query(
      `UPDATE shops SET status =$1,updated_at=now(),rejected_at=now() WHERE owner_id =$2 AND deleted_at IS NULL  AND status ='waiting for approval'`,
      [status, user_id]
    );
    return result;
  }
}
export { changeStatus };
