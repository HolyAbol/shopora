import z from "zod";
export const productSchema =z.object({
           product_name:z
           .string()
           .min(3)
           .max(50)
           .regex(/^[a-zA-Z0-9 ]+$/),
           manufacturer_id:z.
           coerce
           .number()
           .int(),
           price:z.
           coerce.
           number().
           positive(),
           quantity:z.
           coerce
           .number()
           .int()
           .nonnegative()
           .default(0),
           description:z
           .string()
           .max(1000)
           .optional(),
           is_active:z
           .boolean()
           .default(false),
           low_stock_threshold:z
           .coerce
           .number()
           .int()
           .nonnegative()
           .default(5)
})
export const addProductSchema =productSchema