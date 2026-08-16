import express from "express";
import {addManus,getManus,getManusById,changeManusName,deleteManus} from "./manufacturers.controller.ts"
import { loginCheck } from "../../services/auth/auth.middleware.ts";
const manufacturerRouter = express.Router()

/**
 * @openapi
 * /v1/api/manus/add-manus:
 *   post:
 *     summary: Create a new manufacturer
 *     tags: [Manufacturers]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manufacturer_name
 *               - country_code
 *             properties:
 *               manufacturer_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: Nike_Inc
 *               country_code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 pattern: '^[A-Z]{2}$'
 *                 example: US
 *     responses:
 *       200:
 *         description: Manufacturer created successfully
 *       400:
 *         description: Invalid or missing fields
 *       401:
 *         description: Not authorized
 *       409:
 *         description: manufacturer_name already exists
 *       500:
 *         description: Unexpected error
 */
manufacturerRouter.post("/add-manus",loginCheck,addManus)

/**
 * @openapi
 * /v1/api/manus/get-manus:
 *   get:
 *     summary: Get a paginated list of manufacturers
 *     tags: [Manufacturers]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: List of manufacturers
 *       400:
 *         description: Invalid pagination params
 *       404:
 *         description: No manufacturers found
 *       500:
 *         description: Unexpected error
 */
manufacturerRouter.get("/get-manus",getManus)

/**
 * @openapi
 * /v1/api/manus/get-manus/{manufacturer_id}:
 *   get:
 *     summary: Get a single manufacturer by id
 *     tags: [Manufacturers]
 *     parameters:
 *       - in: path
 *         name: manufacturer_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Manufacturer found
 *       400:
 *         description: Invalid manufacturer_id
 *       404:
 *         description: Manufacturer not found
 *       500:
 *         description: Unexpected error
 */
manufacturerRouter.get("/get-manus/:manufacturer_id",getManusById)

/**
 * @openapi
 * /v1/api/manus/change-manus-name:
 *   put:
 *     summary: Update a manufacturer's name
 *     tags: [Manufacturers]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manufacturer_id
 *               - manufacturer_new_name
 *             properties:
 *               manufacturer_id:
 *                 type: integer
 *                 example: 1
 *               manufacturer_new_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: Adidas_AG
 *     responses:
 *       200:
 *         description: Manufacturer name updated successfully
 *       400:
 *         description: Invalid or missing fields
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Manufacturer not found
 *       409:
 *         description: manufacturer name already exists
 *       500:
 *         description: Unexpected error
 */
manufacturerRouter.put("/change-manus-name",loginCheck,changeManusName)

/**
 * @openapi
 * /v1/api/manus/delete-manus/{manufacturer_id}:
 *   delete:
 *     summary: Soft-delete a manufacturer
 *     tags: [Manufacturers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: manufacturer_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Manufacturer deleted successfully
 *       400:
 *         description: Invalid manufacturer_id
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Manufacturer not found
 *       500:
 *         description: Unexpected error
 */
manufacturerRouter.delete("/delete-manus/:manufacturer_id",loginCheck,deleteManus)

export {manufacturerRouter}