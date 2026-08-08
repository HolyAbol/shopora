import z from 'zod';
export const manufacturersSchema =z.object({
manufacture_name:z
.string()
.min(2)
.max(100)
.regex(/^[a-zA-Z0-9_]+$/,"only english chars,numbers,_ are allowed"),
new_manufacture_name:z
.string()
.min(2)
.max(100)
.regex(/^[a-zA-Z0-9_]+$/,"only english chars,numbers,_ are allowed"),
country_code:z
.string()
.min(2)
.max(2)
.regex(/^[A-Z]/,"only english chars are allowed")
})
export const manufactureChangeName = manufacturersSchema.pick({
    manufacture_name:true,
    new_manufacture_name:true
})
export const manufactureDeletion = manufacturersSchema.pick({
    manufacture_name:true
})