import { loginCheck } from '../../services/auth/auth.middleware';
import { requireRole } from '../../services/auth/auth.middleware';
import { getShop, createShop, updateShop, deleteShop } from './shops.controller';
import express from 'express';

const shopsRouter = express.Router();

/**
 * @openapi
 * /v1/api/shops/get-shop:
 *   get:
 *     summary: Get the logged-in owner's shop
 *     tags: [Shops]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Shop retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Shop not found
 */
shopsRouter.get('/get-shop', loginCheck, requireRole('owner'), getShop);

/**
 * @openapi
 * /v1/api/shops/create-shop:
 *   post:
 *     summary: Create a new shop (one per owner)
 *     tags: [Shops]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop_name
 *             properties:
 *               shop_name:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: Shop created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission
 *       409:
 *         description: Owner already has a shop, or shop name taken
 */
shopsRouter.post('/create-shop', loginCheck, createShop);

/**
 * @openapi
 * /v1/api/shops/change-shop-name:
 *   post:
 *     summary: Change a shop's name
 *     tags: [Shops]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop_id
 *               - shop_new_name
 *             properties:
 *               shop_id:
 *                 type: integer
 *               shop_new_name:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Shop name updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Shop not found
 *       409:
 *         description: Shop name already exists
 */
shopsRouter.post('/change-shop-name', loginCheck, requireRole('admin', 'owner'), updateShop);

/**
 * @openapi
 * /v1/api/shops/delete-shop/{shop_id}:
 *   delete:
 *     summary: Delete a shop (cascades soft-delete to its products)
 *     tags: [Shops]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shop deleted successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Shop not found
 */
shopsRouter.delete('/delete-shop/:shop_id', loginCheck, requireRole('admin', 'owner'), deleteShop);

export { shopsRouter };
