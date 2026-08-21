import z from "zod";
export const productSchema =z.object({
           product_id:z
           .coerce
           .number(),
           product_name:z
           .string()
           .min(3)
           .max(50)
           .regex(/^[a-zA-Z0-9 ]+$/),
           category_id:z.coerce.number(),
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
export const addProductSchema =productSchema.pick({
    product_name:true,
    category_id:true,
    manufacturer_id:true,
    price:true,
    quantity:true,
    description:true,
    is_active:true,
    low_stock_threshold:true
})
export const productDescriptionSchema= productSchema.pick({
    product_id:true,
    description:true
})
export const changeProductNameSchema=productSchema.pick({
    product_id:true,
    product_name:true
})

export const changeProductPriceSchema=productSchema.pick({
    product_id:true,
    price:true
})
export const changeProductQuantitySchema=productSchema.pick({
    product_id:true,
    quantity:true
})
export const changeProductLowSchema=productSchema.pick({
    product_id:true,
    low_stock_threshold:true
})
export const changeProductActiveSchema=productSchema.pick({
    product_id:true,
    is_active:true
})
export const changeProductManuSchema=productSchema.pick({
    product_id:true,
    manufacturer_id:true
})
export const changeProductCategorySchema=productSchema.pick({
    product_id:true,
    category_id:true
})
export const ProductIdSchema=productSchema.pick({
    product_id:true
})
export const ProductCategoryIdSchema=productSchema.pick({
    category_id:true
})


