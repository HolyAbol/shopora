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
  adminFindUserSchema,
  adminFindOrderSchema,
} from './admin.schema';
import z from 'zod';
import { AppDataSource } from '../configs/data-sources';
import { User } from '../logics/auth/user.entity';
import { Shop } from '../logics/shop/shop.entity';
import { Manufacturer } from '../logics/manufacture/manufacture.entity';
import { Category } from '../logics/category/category.entity';
import { Order } from '../logics/order/orders.entity';
import { Product } from '../logics/products/product.entity';
import { logger, projectstatus } from '../logics/shared.helpers';
import { In, IsNull } from 'typeorm';
import { Address } from '../logics/address/addresses.entity';
import { Cart } from '../logics/cart/carts.entity';
import { CartItem } from '../logics/cart/cartItems.entity';
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
  const sortable: Record<string, string> = {
    created_at: 'u.createdAt',
    first_name: 'u.firstName',
    username: 'u.username',
    last_name: 'u.lastName',
    email: 'u.email',
    role: 'u.role',
  };
  const sortColumn =
    sortBy !== undefined && Object.keys(sortable).includes(sortBy)
      ? sortable[sortBy]
      : sortable.created_at;

  const qb = AppDataSource.getRepository(User).createQueryBuilder('u');

  if (search) {
    qb.andWhere(
      '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.username ILIKE :search)',
      { search: `%${search}%` }
    );
  }
  try {
    const [data, total] = await Promise.all([
      qb
        .clone()
        .select('u.userId', 'user_id')
        .addSelect('u.username', 'username')
        .addSelect('u.phoneNumber', 'phone_number')
        .addSelect('u.email', 'email')
        .addSelect('u.firstName', 'first_name')
        .addSelect('u.lastName', 'last_name')
        .addSelect('u.role', 'role')
        .addSelect('u.createdAt', 'created_at')
        .addSelect('u.updatedAt', 'updated_at')
        .addSelect('u.deletedAt', 'deleted_at')
        .addSelect('u.lastActivity', 'last_activity')
        .orderBy(sortColumn, order === 'asc' ? 'ASC' : 'DESC')
        .addOrderBy('u.userId', 'ASC')
        .limit(limit)
        .offset(offset)
        .getRawMany(),
      qb.getCount(),
    ]);

    return res.status(200).json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger(err, projectstatus);
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
  const sortable: Record<string, string> = {
    created_at: 's.createdAt',
    status: 's.status',
    shop_name: 's.shopName',
    approved_at: 's.approvedAt',
    rejected_at: 's.rejectedAt',
    first_name: 'u.firstName',
    last_name: 'u.lastName',
    email: 'u.email',
  };
  const sortColumn =
    sortBy !== undefined && Object.keys(sortable).includes(sortBy)
      ? sortable[sortBy]
      : sortable.created_at;

  const qb = AppDataSource.getRepository(Shop).createQueryBuilder('s').leftJoin('s.owner', 'u');
  if (search) {
    qb.andWhere(
      '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
      { search: `%${search}%` }
    );
  }
  if (status) qb.andWhere('s.status = :status', { status });
  try {
    const [data, total] = await Promise.all([
      qb
        .clone()
        .select('s.shopId', 'shop_id')
        .addSelect('s.ownerId', 'owner_id')
        .addSelect('s.shopName', 'shop_name')
        .addSelect('s.status', 'status')
        .addSelect('s.createdAt', 'created_at')
        .addSelect('s.approvedAt', 'approved_at')
        .addSelect('s.rejectedAt', 'rejected_at')
        .addSelect('s.updatedAt', 'updated_at')
        .addSelect('s.deletedAt', 'deleted_at')
        .addSelect('u.email', 'email')
        .addSelect('u.firstName', 'first_name')
        .addSelect('u.lastName', 'last_name')
        .orderBy(sortColumn, order === 'asc' ? 'ASC' : 'DESC')
        .addOrderBy('s.shopId', 'ASC')
        .limit(limit)
        .offset(offset)
        .getRawMany(),
      qb.getCount(),
    ]);
    return res.status(200).json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger(err, projectstatus);
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
  const sortable: Record<string, string> = {
    created_at: 'm.createdAt',
    country_code: 'm.countryCode',
    manufacturer_name: 'm.manufacturerName',
  };

  const sortColumn =
    sortBy !== undefined && Object.keys(sortable).includes(sortBy)
      ? sortable[sortBy]
      : sortable.created_at;

  const qb = AppDataSource.getRepository(Manufacturer).createQueryBuilder('m');
  if (search) {
    qb.andWhere('(m.manufacturerName ILIKE :search )', {
      search: `%${search}%`,
    });
  }

  try {
    const [data, total] = await Promise.all([
      qb
        .clone()
        .select('m.manufacturerId', 'manufacturer_id')
        .addSelect('m.manufacturerName', 'manufacturer_name')
        .addSelect('m.countryCode', 'country_code')
        .addSelect('m.createdAt', 'created_at')
        .addSelect('m.updatedAt', 'updated_at')
        .addSelect('m.deletedAt', 'deleted_at')
        .orderBy(sortColumn, order === 'asc' ? 'ASC' : 'DESC')
        .addOrderBy('m.manufacturerId', 'ASC')
        .limit(limit)
        .offset(offset)
        .getRawMany(),
      qb.getCount(),
    ]);
    return res
      .status(200)
      .json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger(err, projectstatus);
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
  const sortable: Record<string, string> = {
    created_at: 'c.createdAt',
    category_name: 'c.categoryName',
  };
  const sortColumn =
    sortBy !== undefined && Object.keys(sortable).includes(sortBy)
      ? sortable[sortBy]
      : sortable.created_at;
  const qb = AppDataSource.getRepository(Category).createQueryBuilder('c');
  if (search) {
    qb.andWhere('(c.categoryName ILIKE :search )', {
      search: `%${search}%`,
    });
  }
  if (parentId !== undefined) {
    qb.andWhere('c.categoryParentId = :parentId ', {
      parentId,
    });
  }
  try {
    const [data, total] = await Promise.all([
      qb
        .clone()
        .select('c.categoryId', 'category_id')
        .addSelect('c.categoryName', 'category_name')
        .addSelect('c.categoryParentId', 'category_parent_id')
        .addSelect('c.createdAt', 'created_at')
        .addSelect('c.updatedAt', 'updated_at')
        .addSelect('c.deletedAt', 'deleted_at')
        .orderBy(sortColumn, order === 'asc' ? 'ASC' : 'DESC')
        .addOrderBy('c.categoryId', 'ASC')
        .limit(limit)
        .offset(offset)
        .getRawMany(),
      qb.getCount(),
    ]);
    return res.status(200).json({
      data: data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger(err, projectstatus);
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
  const sortable: Record<string, string> = {
    total_amount: 'o.totalAmount',
    status: 'o.status',
    payment_method: 'o.paymentMethod',
    first_name: 'u.firstName',
    last_name: 'u.lastName',
    email: 'u.email',
    created_at: 'o.createdAt',
    updated_at: 'o.updatedAt',
  };
  const qb = AppDataSource.getRepository(Order).createQueryBuilder('o').leftJoin('o.user', 'u');
  if (status) {
    qb.andWhere('o.status = :status', { status });
  }

  if (userId !== undefined) {
    qb.andWhere('o.userId = :userId', { userId });
  }
  const sortColumn =
    sortBy !== undefined && Object.keys(sortable).includes(sortBy)
      ? sortable[sortBy]
      : sortable.created_at;

  try {
    const [data, total] = await Promise.all([
      qb
        .clone()
        .withDeleted()
        .select('o.orderId', 'order_id')
        .addSelect('o.status', 'status')
        .addSelect('o.addressId', 'address_id')
        .addSelect('o.paymentMethod', 'payment_method')
        .addSelect('o.totalAmount', 'total_amount')
        .addSelect('o.createdAt', 'created_at')
        .addSelect('o.updatedAt', 'updated_at')
        .addSelect('u.email', 'email')
        .addSelect('u.firstName', 'first_name')
        .addSelect('u.lastName', 'last_name')
        .orderBy(sortColumn, order === 'asc' ? 'ASC' : 'DESC')
        .addOrderBy('o.orderId', 'ASC')
        .limit(limit)
        .offset(offset)
        .getRawMany(),
      qb.getCount(),
    ]);

    return res.status(200).json({
      data: data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger(err, projectstatus);
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
  const sortable: Record<string, string> = {
    product_id: 'p.productId',
    product_name: 'p.productName',
    price: 'p.price',
    quantity: 'p.quantity',
    created_at: 'p.createdAt',
    updated_at: 'p.updatedAt',
    deleted_at: 'p.deletedAt',
    is_active: 'p.isActive',
    low_stock_threshold: 'p.lowStockThreshold',
    manufacturer_name: 'm.manufacturerName',
    manufacturer_id: 'm.manufacturerId',
    shop_name: 's.shopName',
    shop_id: 's.shopId',
  };
  const sortColumn =
    sortBy !== undefined && Object.keys(sortable).includes(sortBy)
      ? sortable[sortBy]
      : sortable.created_at;

  const qb = AppDataSource.getRepository(Product)
    .createQueryBuilder('p')
    .leftJoin('p.manufacturer', 'm')
    .leftJoin('p.shop', 's');
  if (search) {
    qb.andWhere('(p.productName ILIKE :search OR m.manufacturerName ILIKE :search)', {
      search: `%${search}%`,
    });
  }

  if (shopId) {
    qb.andWhere('p.shopId=:shopId', { shopId });
  }

  if (manufacturerId) {
    qb.andWhere('p.manufacturerId=:manufacturerId', { manufacturerId });
  }
  if (isActive !== undefined) {
    qb.andWhere('p.isActive=:isActive', { isActive });
  }

  try {
    const [data, total] = await Promise.all([
      qb
        .clone()
        .select('p.productId', 'product_id')
        .addSelect('p.productName', 'product_name')
        .addSelect('p.quantity', 'quantity')
        .addSelect('p.isActive', 'is_active')
        .addSelect('p.lowStockThreshold', 'low_stock_threshold')
        .addSelect('p.price', 'price')
        .addSelect('s.shopId', 'shop_id')
        .addSelect('s.shopName', 'shop_name')
        .addSelect('m.manufacturerName', 'manufacturer_name')
        .addSelect('m.manufacturerId', 'manufacturer_id')
        .addSelect('p.createdAt', 'created_at')
        .addSelect('p.updatedAt', 'updated_at')
        .addSelect('p.deletedAt', 'deleted_at')
        .orderBy(sortColumn, order === 'asc' ? 'ASC' : 'DESC')
        .addOrderBy('p.productId', 'ASC')
        .limit(limit)
        .offset(offset)
        .getRawMany(),
      qb.getCount(),
    ]);

    return res.status(200).json({
      data: data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getUserByIdAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  console.log(req.params.user_id);
  const Details = adminFindUserSchema.safeParse(req.params);
  if (!Details.success) {
    return res
      .status(400)
      .json({ message: 'Validation failed', error: z.treeifyError(Details.error) });
  }
  const { user_id } = Details.data;
  try {
    const result = await AppDataSource.getRepository(User).findOne({ where: { userId: user_id } });
    if (!result) {
      return res.status(404).json({ message: "user's not found" });
    }
    return res.status(200).json({ message: 'success', user: result });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function getOrderByIdAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const Details = adminFindOrderSchema.safeParse(req.params);
  if (!Details.success) {
    return res
      .status(400)
      .json({ message: 'Validation failed', error: z.treeifyError(Details.error) });
  }
  const { order_id } = Details.data;
  try {
    const result = await AppDataSource.getRepository(Order)
      .createQueryBuilder('o')
      .withDeleted()
      .leftJoin('o.items', 'oi', 'oi.deletedAt IS NULL')
      .leftJoin('o.user', 'u')
      .leftJoin('o.address', 'a')
      .select('o.orderId', 'order_id')
      .addSelect('o.status', 'status')
      .addSelect('o.addressId', 'address_id')
      .addSelect('o.paymentMethod', 'payment_method')
      .addSelect('o.totalAmount', 'total_amount')
      .addSelect('oi.productId', 'product_id')
      .addSelect('oi.productName', 'product_name')
      .addSelect('oi.quantity', 'quantity')
      .addSelect('oi.unitPrice', 'unit_price')
      .addSelect('o.createdAt', 'created_at')
      .addSelect('o.updatedAt', 'updated_at')
      .addSelect('u.email', 'email')
      .addSelect('u.firstName', 'first_name')
      .addSelect('u.lastName', 'last_name')
      .addSelect('u.phoneNumber', 'phone_number')
      .addSelect('a.addressTitle', 'address_title')
      .addSelect('a.countryCode', 'country_code')
      .addSelect('a.province', 'province')
      .addSelect('a.city', 'city')
      .addSelect('a.addressDetail', 'address_detail')
      .addSelect('a.postalCode', 'postal_code')
      .where('o.orderId = :order_id AND o.deletedAt IS NULL', { order_id })
      .getRawMany();
    if (result.length === 0) {
      return res.status(404).json({ message: "order's not found" });
    }
    const { product_id, product_name, quantity, unit_price, ...order } = result[0];
    const items = result
      .filter((r) => r.product_id !== null)
      .map((r) => ({
        product_id: r.product_id,
        product_name: r.product_name,
        quantity: r.quantity,
        unit_price: r.unit_price,
      }));
    return res.status(200).json({ message: 'success', order: order, items: items });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function updateOrderStatusAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const Details = adminFindOrderSchema.safeParse(req.params);
  const parsed = changeOrderStatusSchema.safeParse(req.body);
  if (!Details.success || !parsed.success) {
    return res.status(400).json({
      message: 'Validation failed',
      ...(Details.success ? {} : z.treeifyError(Details.error)),
      ...(parsed.success ? {} : z.treeifyError(parsed.error)),
    });
  }
  const { status } = parsed.data;
  const { order_id } = Details.data;
  try {
    const result = await AppDataSource.getRepository(Order).update(
      {
        orderId: order_id,
        deletedAt: IsNull(),
      },
      { status: status }
    );
    //  pool.query(
    //   `UPDATE orders
    //    SET status = $1, updated_at = now()
    //    WHERE order_id = $2 AND deleted_at IS NULL
    //    RETURNING order_id, status`,
    //   [status, order_id]
    // );

    if (result.affected === 0) {
      return res.status(404).json({ message: 'order not found' });
    }

    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
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
  try {
    if (role === 'owner') {
      const outcome = await AppDataSource.transaction(async (manager) => {
        const userPromote = await manager.update(
          User,
          {
            userId: user_id,
            deletedAt: IsNull(),
          },
          { role: role }
        );
        if (userPromote.affected === 0) {
          throw new Error('user_not_found');
        }
        const approveRequest = await changeStatus(user_id, 'approved', manager);
        if (approveRequest.affected === 0) {
          throw new Error('shop_not_found');
        }
        return 'ok' as const;
      });
      return res.status(200).json({ message: 'done' });
    }
    const result = await AppDataSource.getRepository(User).update(
      {
        userId: user_id,
        deletedAt: IsNull(),
      },
      { role: role }
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'user is not found' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function reviewShopRequest(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const Details = adminFindUserSchema.safeParse(req.params);
  const valid = shopStatusSchema.safeParse(req.body);
  if (!Details.success || !valid.success) {
    return res.status(400).json({
      message: 'Validation failed',
      ...(Details.success ? {} : z.treeifyError(Details.error)),
      ...(valid.success ? {} : z.treeifyError(valid.error)),
    });
  }
  const { user_id } = Details.data;
  const { status } = valid.data;

  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { userId: user_id },
        select: { userId: true, role: true },
      });
      if (!user) return 'user_not_found' as const;

      const result = await changeStatus(user_id, status, manager);
      if (result.affected === 0) return 'shop_not_found' as const;

      if (status === 'approved' && user.role === 'user') {
        await manager.update(User, { userId: user_id }, { role: 'owner' });
      }
      return 'ok' as const;
    });

    if (outcome === 'user_not_found') return res.status(404).json({ message: 'user is not found' });
    if (outcome === 'shop_not_found')
      return res.status(404).json({ message: 'shop is already reviewed or not found' });
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function deleteUserAdmin(req: Request, res: Response) {
  if (!checkAdmin(req, res)) return;
  const Details = adminFindUserSchema.safeParse(req.params);
  if (!Details.success) {
    return res
      .status(400)
      .json({ message: 'Validation failed', error: z.treeifyError(Details.error) });
  }
  const { user_id } = Details.data;
  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { userId: user_id },
        select: { userId: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) return 'not_found' as const;

      const shops = await manager.find(Shop, {
        where: { ownerId: user_id },
        select: { shopId: true },
      });
      if (shops.length > 0) {
        const shopIds = shops.map((s) => s.shopId);
        await manager.softDelete(Product, { shopId: In(shopIds), deletedAt: IsNull() });
        await manager.softDelete(Shop, { ownerId: user_id, deletedAt: IsNull() });
      }

      await manager.softDelete(Address, { userId: user_id, deletedAt: IsNull() });

      const cart = await manager.findOne(Cart, {
        where: { userId: user_id },
        select: { cartId: true },
        withDeleted: true,
      });
      if (cart) {
        await manager.delete(CartItem, { cartId: cart.cartId });
        await manager.delete(Cart, { cartId: cart.cartId });
      }

      await manager.softDelete(User, { userId: user_id, deletedAt: IsNull() });

      return 'ok' as const;
    });

    if (outcome === 'not_found') {
      return res.status(404).json({ message: 'user not found' });
    }
    return res.status(200).json({ message: 'user and related data deleted' });
  } catch (err) {
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
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
