import z from 'zod';
export const userInfoSchema = z.object({
    firstName:z
    .string()
    .min(3,"name should not be less than 3 characters")
    .max(20,"name should not exceed 20 characters")
    .regex(/[a-zA-Zا-ی\u200C\s]+$/),
    lastName:z
    .string()
    .min(3,"name should not be less than 3 characters")
    .max(20,"name should not exceed 20 characters")
    .regex(/[a-zA-Zا-ی\u200C\s]+$/)
})

export const changeUsernameSchema = z.object({
  newUsername: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "only english chars,numbers,_ are allowed")
})
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8).regex(/[a-zA-Z0-9_]/)
})