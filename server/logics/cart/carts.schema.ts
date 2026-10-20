import z from 'zod';
export const addItemToCart = z.object({
  product_id: z.coerce.number().positive(),
  quantity: z.coerce.number().positive(),
});
export const cartItemQuantity = addItemToCart.pick({
  product_id: true,
  quantity: true,
});
export const removeItemFromcart = addItemToCart.pick({
  product_id: true,
});
