import z from 'zod';
export const paymentMethodSchema = z.object({
  payment_method: z.enum(['cash_on_delivery', 'online_payment']),
});
export const orderIdSchema = z.object({
  order_id: z.number().positive(),
});
