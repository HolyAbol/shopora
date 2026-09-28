import { pool } from '../services/db/db';
import { Response, Request } from 'express';
import { paginationQuery } from '../logics/shared.schemas';
import { changeStatus } from './admin.helpers';
import {
  changeRoleOptipnsSchema,
  changeOrderStatusSchema,
  adminQuerySchema,
  shopStatusSchema,
  adminProductQuerySchema,
  adminCategoryQuerySchema,
  adminManufacturerQuerySchema,
  adminOrderQuerySchema,
  adminShopQuerySchema,
} from './admin.schema';
import z from 'zod';
function checkAdmin(req: Request, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'insufficient permission' });
    return false;
  }
  return true;
}
async function getAllUsersAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const paginate = paginationQuery.safeParse(req.query);
  const searchOptions = adminQuerySchema.safeParse(req.query);

  if (!paginate.success || !searchOptions.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        ...(paginate.success ? {} : z.treeifyError(paginate.error)),
        ...(searchOptions.success ? {} : z.treeifyError(searchOptions.error)),
      },
    });
  }

  const { sortBy, order, search } = searchOptions.data;
  const { page, limit } = paginate.data;
  const offset = (page - 1) * limit;

  const allowed_sort_columns = [
    'created_at',
    'first_name',
    'username',
    'last_name',
    'email',
    'role',
  ];
  const sortColumn = allowed_sort_columns.includes(sortBy ?? '') ? sortBy : 'created_at';

  let whereClause = 'WHERE deleted_at IS NULL';
  const whereParams: any[] = [];

  if (search) {
    whereParams.push(`%${search}%`);
    whereClause += ` AND (email ILIKE $${whereParams.length} OR first_name ILIKE $${whereParams.length} OR username ILIKE $${whereParams.length})`;
  }

  const dataQuery = `SELECT user_id,username,phone_number, email, first_name, last_name, role, created_at, updated_at, last_activity
    FROM users
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`;
  const dataParams = [...whereParams, limit, offset];

  const countQuery = `SELECT COUNT(*)::int AS total FROM users ${whereClause}`;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, whereParams),
    ]);

    const total = countResult.rows[0].total as number;

    return res.status(200).json({
      data: dataResult.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getAllShopsAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;

  const paginate = paginationQuery.safeParse(req.query);
  const searchOptions = adminShopQuerySchema.safeParse(req.query);

  if (!paginate.success || !searchOptions.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        ...(paginate.success ? {} : z.treeifyError(paginate.error)),
        ...(searchOptions.success ? {} : z.treeifyError(searchOptions.error)),
      },
    });
  }

  const { sortBy, order, search, status } = searchOptions.data;
  const { page, limit } = paginate.data;
  const offset = (page - 1) * limit;

  const allowed_sort_columns = ['shop_name', 'status', 'created_at', 'approved_at'];
  const sortColumn = allowed_sort_columns.includes(sortBy ?? '') ? sortBy : 'created_at';

  let whereClause = 'WHERE s.deleted_at IS NULL';
  const whereParams: any[] = [];

  if (search) {
    whereParams.push(`%${search}%`);
    whereClause += `AND s.shop_name ILIKE $${whereParams.length}`;
  }

  if (status) {
    whereParams.push(status);
    whereClause += `AND s.status = $${whereParams.length}`;
  }

  const dataQuery = `SELECT s.shop_id, s.owner_id, s.shop_name, s.status,
           s.created_at, s.approved_at, s.rejected_at, s.updated_at,
           u.email, u.first_name, u.last_name
    FROM shops s
    JOIN users u ON s.owner_id = u.user_id
    ${whereClause}
    ORDER BY s.${sortColumn} ${order}
    LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`;
  const dataParams = [...whereParams, limit, offset];

  const countQuery = `SELECT COUNT(*)::int AS total
    FROM shops s
    ${whereClause}`;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, whereParams),
    ]);

    const total = countResult.rows[0].total as number;

    return res.status(200).json({
      data: dataResult.rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getAllManufacturersAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;

  const paginate = paginationQuery.safeParse(req.query);
  const searchOptions = adminManufacturerQuerySchema.safeParse(req.query);

  if (!paginate.success || !searchOptions.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        ...(paginate.success ? {} : z.treeifyError(paginate.error)),
        ...(searchOptions.success ? {} : z.treeifyError(searchOptions.error)),
      },
    });
  }

  const { sortBy, order, search } = searchOptions.data;
  const { page, limit } = paginate.data;
  const offset = (page - 1) * limit;

  const allowed_sort_columns = ['manufacturer_name', 'country_code', 'created_at'];
  const sortColumn = allowed_sort_columns.includes(sortBy ?? '') ? sortBy : 'created_at';

  let whereClause = 'WHERE deleted_at IS NULL';
  const whereParams: any[] = [];

  if (search) {
    whereParams.push(`%${search}%`);
    whereClause += `AND manufacturer_name ILIKE $${whereParams.length}`;
  }

  const dataQuery = `SELECT manufacturer_id, manufacturer_name, country_code, created_at, updated_at
    FROM manufacturers
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`;
  const dataParams = [...whereParams, limit, offset];

  const countQuery = `SELECT COUNT(*)::int AS total FROM manufacturers ${whereClause}`;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, whereParams),
    ]);

    const total = countResult.rows[0].total as number;

    return res.status(200).json({
      data: dataResult.rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getAllCategoriesAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;

  const paginate = paginationQuery.safeParse(req.query);
  const searchOptions = adminCategoryQuerySchema.safeParse(req.query);

  if (!paginate.success || !searchOptions.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        ...(paginate.success ? {} : z.treeifyError(paginate.error)),
        ...(searchOptions.success ? {} : z.treeifyError(searchOptions.error)),
      },
    });
  }

  const { sortBy, order, search, parentId } = searchOptions.data;
  const { page, limit } = paginate.data;
  const offset = (page - 1) * limit;

  const allowed_sort_columns = ['category_name', 'created_at'];
  const sortColumn = allowed_sort_columns.includes(sortBy ?? '') ? sortBy : 'created_at';

  let whereClause = 'WHERE deleted_at IS NULL';
  const whereParams: any[] = [];

  if (search) {
    whereParams.push(`%${search}%`);
    whereClause += `AND category_name ILIKE $${whereParams.length}`;
  }

  if (parentId !== undefined) {
    whereParams.push(parentId);
    whereClause += ` AND category_parent_id = $${whereParams.length}`;
  }

  const dataQuery = ` SELECT category_id, category_name, category_parent_id, created_at, updated_at
    FROM categories
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`;
  const dataParams = [...whereParams, limit, offset];

  const countQuery = ` SELECT COUNT(*)::int AS total FROM categories ${whereClause}`;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, whereParams),
    ]);

    const total = countResult.rows[0].total as number;

    return res.status(200).json({
      data: dataResult.rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getAllOrdersAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;

  const paginate = paginationQuery.safeParse(req.query);
  const searchOptions = adminOrderQuerySchema.safeParse(req.query);

  if (!paginate.success || !searchOptions.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        ...(paginate.success ? {} : z.treeifyError(paginate.error)),
        ...(searchOptions.success ? {} : z.treeifyError(searchOptions.error)),
      },
    });
  }

  const { sortBy, order, status, userId } = searchOptions.data;
  const { page, limit } = paginate.data;
  const offset = (page - 1) * limit;

  const allowed_sort_columns = ['total_amount', 'status', 'created_at', 'updated_at'];
  const sortColumn = allowed_sort_columns.includes(sortBy ?? '') ? sortBy : 'created_at';

  let whereClause = 'WHERE o.deleted_at IS NULL';
  const whereParams: any[] = [];

  if (status) {
    whereParams.push(status);
    whereClause += `AND o.status = $${whereParams.length}`;
  }

  if (userId !== undefined) {
    whereParams.push(userId);
    whereClause += ` AND o.user_id = $${whereParams.length}`;
  }

  const dataQuery = `SELECT o.order_id, o.user_id, o.address_id, o.total_amount, o.status,
           o.payment_method, o.created_at, o.updated_at,
           u.email, u.first_name, u.last_name
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    ${whereClause}
    ORDER BY o.${sortColumn} ${order}
    LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`;
  const dataParams = [...whereParams, limit, offset];

  const countQuery = ` SELECT COUNT(*)::int AS total
    FROM orders o
    ${whereClause}`;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, whereParams),
    ]);

    const total = countResult.rows[0].total as number;

    return res.status(200).json({
      data: dataResult.rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getAllProductsAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;

  const paginate = paginationQuery.safeParse(req.query);
  const searchOptions = adminProductQuerySchema.safeParse(req.query);

  if (!paginate.success || !searchOptions.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        ...(paginate.success ? {} : z.treeifyError(paginate.error)),
        ...(searchOptions.success ? {} : z.treeifyError(searchOptions.error)),
      },
    });
  }

  const { sortBy, order, search, shopId, manufacturerId, isActive } = searchOptions.data;
  const { page, limit } = paginate.data;
  const offset = (page - 1) * limit;

  const allowed_sort_columns = ['product_name', 'price', 'quantity', 'created_at', 'updated_at'];
  const sortColumn = allowed_sort_columns.includes(sortBy ?? '') ? sortBy : 'created_at';

  let whereClause = 'WHERE p.deleted_at IS NULL';
  const whereParams: any[] = [];

  if (search) {
    whereParams.push(`%${search}%`);
    whereClause += `AND (p.product_name ILIKE $${whereParams.length} OR m.manufacturer_name ILIKE $${whereParams.length})`;
  }

  if (shopId) {
    whereParams.push(shopId);
    whereClause += `AND p.shop_id = $${whereParams.length}`;
  }

  if (manufacturerId) {
    whereParams.push(manufacturerId);
    whereClause += `AND p.manufacturer_id = $${whereParams.length}`;
  }

  if (isActive !== undefined) {
    whereParams.push(isActive);
    whereClause += `AND p.is_active = $${whereParams.length}`;
  }

  const dataQuery = `SELECT p.product_id, p.product_name, p.shop_id, p.manufacturer_id, p.quantity,
           p.price, p.description, p.is_active, p.low_stock_threshold,
           p.created_at, p.updated_at,
           s.shop_name, m.manufacturer_name
    FROM products p
    JOIN shops s ON p.shop_id = s.shop_id
    JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
    ${whereClause}
    ORDER BY p.${sortColumn} ${order}
    LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`;
  const dataParams = [...whereParams, limit, offset];

  const countQuery = ` SELECT COUNT(*)::int AS total
    FROM products p
    JOIN shops s ON p.shop_id = s.shop_id
    JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
    ${whereClause}`;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, whereParams),
    ]);

    const total = countResult.rows[0].total as number;

    return res.status(200).json({
      data: dataResult.rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getUserByIdAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const user_id = Number(req.params.user_id);
  try {
    const result = await pool.query(
      'SELECT user_id,username,phone_number,email,first_name,last_name,role,created_at,updated_at,last_activity FROM users WHERE user_id =$1 AND deleted_at IS NULL',
      [user_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "user's not found" });
    }
    return res.status(200).json({ message: 'success', user: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getOrderByIdAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const order_id = Number(req.params.order_id);
  console.log(order_id);
  try {
    const result = await pool.query(
      'SELECT o.order_id,o.user_id,o.address_id,o.total_amount,o.status,o.payment_method,o.created_at,o.updated_at,u.email,u.first_name,u.last_name FROM orders o JOIN users u on o.user_id = u.user_id WHERE o.order_id =$1 AND o.deleted_at IS NULL',
      [order_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "user's not found" });
    }
    const itemResult = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [order_id]);
    return res.status(200).json({
      ...result.rows[0],
      items: itemResult.rows,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function updateOrderStatusAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;

  const order_id = Number(req.params.order_id);

  if (!Number.isInteger(order_id) || order_id <= 0) {
    return res.status(400).json({ message: 'invalid order id' });
  }

  const parsed = changeOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(parsed.error),
    });
  }

  const { status } = parsed.data;

  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = now()
       WHERE order_id = $2 AND deleted_at IS NULL
       RETURNING order_id, status`,
      [status, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'order not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function changeUserRole(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const roleParse = changeRoleOptipnsSchema.safeParse(req.body);
  const user_id = Number(req.params.user_id);
  if (!roleParse.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(roleParse.error),
    });
  }
  const { role } = roleParse.data;
  const client = await pool.connect();
  try {
    if (role === 'owner') {
      await client.query('BEGIN');
      const userPromote = await client.query(
        'UPDATE users SET role =$1,updated_at=now() WHERE user_id =$2 AND deleted_at IS NULL RETURNING role',
        [role, user_id]
      );
      if (userPromote.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'user is not found' });
      }
      const approveRequest = await changeStatus(user_id, 'approved', client);
      if (approveRequest.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'shop is not found' });
      }
      await client.query('COMMIT');
      return res.status(200).json({ message: 'done' });
    }
    await client.query('BEGIN');
    const result = await client.query(
      'UPDATE users SET role =$1,updated_at=now() WHERE user_id =$2 AND deleted_at IS NULL RETURNING role',
      [role, user_id]
    );
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'user is not found' });
    }
    await client.query('COMMIT');
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
  }
}
async function reviewShopRequest(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const user_id = Number(req.params.user_id);
  const valid = shopStatusSchema.safeParse(req.body);
  if (!valid.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(valid.error),
    });
  }
  const { status } = valid.data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await changeStatus(user_id, status, client);
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'shop is not found' });
    }
    const userPromote = await client.query(
      'UPDATE users SET role =$1,updated_at=now() WHERE user_id =$2 AND deleted_at IS NULL RETURNING role',
      ['owner', user_id]
    );
    if (userPromote.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'user is not found' });
    }
    await client.query('COMMIT');
    return res.status(200).json({ message: 'success' });
  } catch {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'unexpected error ' });
  } finally {
    client.release();
  }
}
async function deleteUserAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;

  const user_id = req.params.user_id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `SELECT user_id FROM users WHERE user_id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'user not found' });
    }

    const shopsResult = await client.query(
      `SELECT shop_id FROM shops WHERE owner_id = $1 AND deleted_at IS NULL`,
      [user_id]
    );

    if (shopsResult.rows.length > 0) {
      const shopIds = shopsResult.rows.map((r) => r.shop_id);

      await client.query(
        `UPDATE products SET deleted_at = now() WHERE shop_id = ANY($1) AND deleted_at IS NULL`,
        [shopIds]
      );

      await client.query(
        `UPDATE shops SET deleted_at = now() WHERE owner_id = $1 AND deleted_at IS NULL`,
        [user_id]
      );
    }

    await client.query(
      `UPDATE addresses SET deleted_at = now() WHERE user_id = $1 AND deleted_at IS NULL`,
      [user_id]
    );

    await client.query(
      `DELETE FROM cart_items WHERE cart_id IN (SELECT cart_id FROM cart WHERE user_id = $1)`,
      [user_id]
    );
    await client.query(`DELETE FROM cart WHERE user_id = $1`, [user_id]);

    await client.query(`UPDATE users SET deleted_at = now() WHERE user_id = $1`, [user_id]);

    await client.query('COMMIT');
    return res.status(200).json({ message: 'user and related data deleted' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ message: 'unexpected error' });
  } finally {
    client.release();
  }
}
export {
  getAllUsersAdmin,
  getAllCategoriesAdmin,
  getAllManufacturersAdmin,
  getAllOrdersAdmin,
  getAllShopsAdmin,
  getAllProductsAdmin,
  getOrderByIdAdmin,
  getUserByIdAdmin,
  updateOrderStatusAdmin,
  changeUserRole,
  deleteUserAdmin,
  reviewShopRequest,
};
