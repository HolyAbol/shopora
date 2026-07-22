import z from 'zod';
export const tokenPayloadSchema = z.object({
    user_id : z.number()
})
export type TokenPayload = z.infer<typeof tokenPayloadSchema >;