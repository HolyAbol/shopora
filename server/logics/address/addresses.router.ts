import express from 'express';
import { addAddress, changeAddress, deleteAddress } from './addresses.controller.ts';
import { loginCheck } from '../../services/auth/auth.middleware.ts';
const addressesRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User address management
 *
 * components:
 *   schemas:
 *     AddressInput:
 *       type: object
 *       required:
 *         - address_title
 *         - country_code
 *         - province
 *         - city
 *         - address_detail
 *         - postal_code
 *       properties:
 *         address_title:
 *           type: string
 *           minLength: 3
 *           maxLength: 15
 *         country_code:
 *           type: string
 *           minLength: 2
 *           maxLength: 2
 *           example: "US"
 *         province:
 *           type: string
 *           minLength: 2
 *           maxLength: 20
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 20
 *         address_detail:
 *           type: string
 *           maxLength: 400
 *         postal_code:
 *           type: string
 *           minLength: 10
 *           maxLength: 10
 *           example: "1234567890"
 */

/**
 * @swagger
 * /v1/api/adds/add-adds:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       409:
 *         description: Address already exists
 *       500:
 *         description: Unexpected server error
 */
addressesRouter.post('/add-adds', loginCheck, addAddress);

/**
 * @swagger
 * /v1/api/adds/change-adds:
 *   patch:
 *     summary: Update user address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: No address found for this user
 *       500:
 *         description: Unexpected server error
 */
addressesRouter.patch('/change-adds', loginCheck, changeAddress);

/**
 * @swagger
 * /v1/api/adds/delete-adds:
 *   delete:
 *     summary: Delete user address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: No address found for this user
 *       500:
 *         description: Unexpected server error
 */
addressesRouter.delete('/delete-adds', loginCheck, deleteAddress);
export { addressesRouter };
