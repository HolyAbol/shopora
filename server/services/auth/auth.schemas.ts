import z from 'zod';
export const tokenPayloadSchema = z.object({
    user_id : z.number()
})
export const UserCredsSchema =z.object({
    userName: z
    .string()
    .min(3,"username should not be less than 3 characters")
    .max(30,"username should not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/,"only english chars,numbers,_ are allowed"),
    userEmail: z.email(),
    userPhoneNumber:z.number(),
    userPassword:z
    .string()
    .min(8,"password should be atleast 8 chars long")
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
})

export const signupSchema = UserCredsSchema.partial()
export const loginSchema = UserCredsSchema.pick({
    userEmail:true,
    userPassword:true
})

export type TokenPayload = z.infer<typeof tokenPayloadSchema >;
export type User =z.infer<typeof UserCredsSchema>