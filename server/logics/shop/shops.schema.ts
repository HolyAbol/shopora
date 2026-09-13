import z from 'zod';

const shopCreateSchema = z.object({
  shop_name: z.string().min(1, 'shop name is required').max(100),
});

const shopChangeNameSchema = z.object({
  shop_id: z.coerce.number().int().positive(),
  shop_new_name: z.string().min(1, 'shop name is required').max(100),
});

const shopDeletionSchema = z.object({
  shop_id: z.coerce.number().int().positive(),
});

export { shopCreateSchema, shopChangeNameSchema, shopDeletionSchema };
