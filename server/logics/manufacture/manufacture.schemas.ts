import z from 'zod';
export const manufacturersSchema =z.object({
manufacturer_id:z.number(),
manufacturer_name:z
.string()
.min(2)
.max(100)
.regex(/^[a-zA-Z0-9_]+$/,"only english chars,numbers,_ are allowed"),
manufacturer_new_name:z
.string()
.min(2)
.max(100)
.regex(/^[a-zA-Z0-9_]+$/,"only english chars,numbers,_ are allowed"),
country_code:z
.string()
.min(2)
.max(2)
.regex(/^[A-Z]{2}$/,"only uppercase english chars are allowed")
})
export const manufactureChangeName = manufacturersSchema.pick({
    manufacturer_id:true,
    manufacturer_new_name:true
})
export const manufactureDeletion = manufacturersSchema.pick({
    manufacturer_id:true
})
export const manufactureID = manufacturersSchema.pick({
    manufacturer_id:true
})
export const manufactureAdd = manufacturersSchema.pick({
    manufacturer_name:true,
    country_code:true
})