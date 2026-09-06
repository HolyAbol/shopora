import express from "express";
import { loginCheck } from "../../services/auth/auth.middleware";
import {getCarts,createCart,addItemsToCart,changeItemQuantity,removeItem} from "./carts.controller";

const cartsRouter= express.Router();

/**
 * @openapi
 * /v1/api/cars/create-cars:
 *   post:
 *     tags:
 *       - Carts
 *     summary: Create or fetch the user's cart
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Cart created
 *       200:
 *         description: Cart already existed, returned as-is
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Unexpected error
 */
cartsRouter.post("/create-cars", loginCheck, createCart);

/**
 * @openapi
 * /v1/api/cars/get-cars:
 *   get:
 *     tags:
 *       - Carts
 *     summary: Get the user's cart with items
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart items with totals
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart doesn't exist
 *       500:
 *         description: Unexpected error
 */
cartsRouter.get("/get-cars", loginCheck, getCarts);

/**
 * @openapi
 * /v1/api/cars/add-items-to-cars:
 *   post:
 *     tags:
 *       - Carts
 *     summary: Add an item to the cart (creates cart if missing)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item added or quantity increased
 *       400:
 *         description: Validation failed or requested amount exceeds stock
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Unexpected error
 */
cartsRouter.post("/add-items-to-cars", loginCheck, addItemsToCart);

/**
 * @openapi
 * /v1/api/cars/change-item-quantities:
 *   patch:
 *     tags:
 *       - Carts
 *     summary: Change the quantity of an item already in the cart
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantity updated
 *       400:
 *         description: Validation failed or requested amount exceeds stock
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Unexpected error
 */
cartsRouter.patch("/change-item-quantities", loginCheck, changeItemQuantity);

/**
 * @openapi
 * /v1/api/cars/delete-items/{product_id}:
 *   delete:
 *     tags:
 *       - Carts
 *     summary: Remove an item from the cart
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Item removed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Unexpected error
 */
cartsRouter.delete("/delete-items/:product_id", loginCheck, removeItem);

export {cartsRouter}