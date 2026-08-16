import z from "zod";
export const categorySchema =z.object({
    category_id:z.coerce.number(),
    category_name:z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z]+$/,"only english chars are allowed"),
    category_new_parent_id:z.preprocess(
        (val)=>(val=== ""|| val === null?undefined : val),
        z.coerce.number().nullable().optional()
    ),
    category_parent_id:z.coerce.number().nullable().default(null)
})
export const addCategorySchema = categorySchema.pick({
category_name:true,
category_parent_id:true
})
export const categoryChange=categorySchema.pick({
    category_id:true,
    category_name:true,
    category_new_parent_id:true
})
export const categoryID=categorySchema.pick({
    category_id:true
})