import z from "zod";
export const addItemToCart =z.object({
    product_id:z
    .coerce
    .number(),
    quantity:z
    .coerce
    .number()
})
export const cartItemQuantity = addItemToCart.pick({
    product_id:true,
    quantity:true
})