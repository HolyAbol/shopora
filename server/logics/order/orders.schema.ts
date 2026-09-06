import z from "zod";
export const orderDetailsSchema =z.object({
        payment_method:z.enum(['cash_on_delivery', 'online_payment'])
})