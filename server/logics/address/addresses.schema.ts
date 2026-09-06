import z from 'zod';
export const addressDetails = z.object({
    address_title:z
    .string()
    .min(3)
    .max(15),
    country_code:z
    .string()
    .min(2)
    .max(2)
    .regex(/^[A-Z]+$/),
    province:z
    .string()
    .min(2)
    .max(20),
    city:z
    .string()
    .min(2)
    .max(20),
    address_detail:z.
    string().
    max(400),
    postal_code:z
    .string()
    .min(10)
    .max(10)
    .regex(/^\d{10}$/)
    
})