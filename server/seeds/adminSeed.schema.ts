import z from 'zod';
export const adminSeedSchema = z.object({
  ADMIN_USERNAME: z
    .string()
    .min(3, 'username should not be less than 3 characters')
    .max(30, 'username should not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'only english chars,numbers,_ are allowed'),
  ADMIN_EMAIL: z.email(),
  ADMIN_PHONE_NUMBER: z
    .string()
    .length(11, 'phone number must be 11 digits')
    .regex(/^09\d{9}$/, 'invalid Iranian phone number format'),
  ADMIN_PASSWORD: z
    .string()
    .min(8, 'password should be atleast 8 chars long')
    .regex(/[a-zA-Z0-9_]/),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive(),
});
