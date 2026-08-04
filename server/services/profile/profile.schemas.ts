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