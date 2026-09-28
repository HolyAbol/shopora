import z from 'zod';
export const adminQuerySchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
});
export const adminShopQuerySchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  status: z.enum(['waiting for approval', 'approved', 'rejected']).optional(),
});
export const adminManufacturerQuerySchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
});

export const adminCategoryQuerySchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  parentId: z.coerce.number().int().positive().optional(),
});

export const adminOrderQuerySchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z
    .enum([
      'pending_payment',
      'processing',
      'sourcing',
      'warehouse',
      'packaging',
      'shipped',
      'delivered',
      'cancelled',
    ])
    .optional(),
  userId: z.coerce.number().int().positive().optional(),
});

export const changeRoleOptipnsSchema = z.object({
  role: z.enum(['admin', 'owner', 'user']),
});
export const shopStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});
export const changeOrderStatusSchema = z.object({
  status: z.enum([
    'pending_payment',
    'processing',
    'sourcing',
    'warehouse',
    'packaging',
    'shipped',
    'delivered',
    'cancelled',
  ]),
});
export const adminProductQuerySchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  shopId: z.coerce.number().int().positive().optional(),
  manufacturerId: z.coerce.number().int().positive().optional(),
  isActive: z.coerce.boolean().optional(),
});
