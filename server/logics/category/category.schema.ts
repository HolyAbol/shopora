import z from "zod";
export const categorySchema =z.object({
    category_id:z.number(),
    category_name:z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z]+$/,"only english chars are allowed"),
    category_new_parent_id:z.number(),
    category_parent_id:z.number()
})
export const categoryChange=categorySchema.pick({
    category_id:true,
    category_name:true,
    category_new_parent_id:true
})
export const categoryID=categorySchema.pick({
    category_id:true
})