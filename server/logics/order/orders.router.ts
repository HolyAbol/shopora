import express from 'express';
import { cancelOrder, createOrder, getOrders, getOrdersById } from './orders.controller.ts';
import { loginCheck } from '../../services/auth/auth.middleware.ts';

const ordersRouter = express.Router();

/**
 * @swagger
 * v1/api/orders/create-order:
 *   post:
 *     summary: Create a new order from the user's cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_method
 *             properties:
 *               payment_method:
 *                 type: string
 *                 example: card
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Validation failed or cart is empty / insufficient stock
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Address or cart not found
 *       500:
 *         description: Unexpected error
 */
ordersRouter.post('/create-order', loginCheck, createOrder);

/**
 * @swagger
 * /v1/api/orders/get-orders:
 *   get:
 *     summary: Get paginated list of the user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of orders
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Orders not found
 *       500:
 *         description: Unexpected error
 */
ordersRouter.get('/get-orders', loginCheck, getOrders);

/**
 * @swagger
 * /v1/api/orders/get-order/{order_id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Unexpected error
 */
ordersRouter.get('/get-order/:order_id', loginCheck, getOrdersById);

/**
 * @swagger
 * /v1/api/orders/cancel-order/{order_id}:
 *   delete:
 *     summary: Cancel a pending order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order cannot be cancelled (not pending)
 *       500:
 *         description: Unexpected error
 */
ordersRouter.delete('/cancel-order/:order_id', loginCheck, cancelOrder);

export { ordersRouter };
