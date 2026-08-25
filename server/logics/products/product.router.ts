import express from "express";
import { addPro,addDescription,changeProName,changeProPrice,changeProQuantity,changeProLowStock,changeProActive,changeProManu,changeProCategory,getPros,getProsByCategory,getProsById} from "./product.controller";
import { loginCheck } from "../../services/auth/auth.middleware";
const productsRouter = express.Router()

/**
 * @openapi
 * /v1/api/products/add-pros:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_name, category_id, manufacturer_id, quantity, price, is_active, low_stock_threshold]
 *             properties:
 *               product_name:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               manufacturer_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: integer
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               low_stock_threshold:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       409:
 *         description: Manufacturer or category doesn't exist
 */
productsRouter.post("/add-pros",loginCheck,addPro)

/**
 * @openapi
 * /v1/api/products/add-pro-descs:
 *   post:
 *     summary: Set a product's description
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, description]
 *             properties:
 *               product_id:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Description updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
productsRouter.post("/add-pro-descs",loginCheck,addDescription)

/**
 * @openapi
 * /v1/api/products/change-pro-names:
 *   put:
 *     summary: Change a product's name
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, product_name]
 *             properties:
 *               product_id:
 *                 type: integer
 *               product_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Name updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
productsRouter.put("/change-pro-names",loginCheck,changeProName)

/**
 * @openapi
 * /v1/api/products/change-pro-prices:
 *   put:
 *     summary: Change a product's price
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, price]
 *             properties:
 *               product_id:
 *                 type: integer
 *               price:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Price updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
productsRouter.put("/change-pro-prices",loginCheck,changeProPrice)

/**
 * @openapi
 * /v1/api/products/change-pro-quantities:
 *   put:
 *     summary: Change a product's quantity
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, quantity]
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantity updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
productsRouter.put("/change-pro-quantities",loginCheck,changeProQuantity)

/**
 * @openapi
 * /v1/api/products/change-pro-lows:
 *   put:
 *     summary: Change a product's low-stock threshold
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, low_stock_threshold]
 *             properties:
 *               product_id:
 *                 type: integer
 *               low_stock_threshold:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Threshold updated
 *       400:
 *         description: Validation failed, or threshold greater than current quantity
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
productsRouter.put("/change-pro-lows",loginCheck,changeProLowStock)

/**
 * @openapi
 * /v1/api/products/change-pro-actives:
 *   put:
 *     summary: Activate or deactivate a product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, is_active]
 *             properties:
 *               product_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Active status updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
productsRouter.put("/change-pro-actives",loginCheck,changeProActive)

/**
 * @openapi
 * /v1/api/products/change-pro-manus:
 *   put:
 *     summary: Change a product's manufacturer
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, manufacturer_id]
 *             properties:
 *               product_id:
 *                 type: integer
 *               manufacturer_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Manufacturer updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Manufacturer doesn't exist
 */
productsRouter.put("/change-pro-manus",loginCheck,changeProManu)

/**
 * @openapi
 * /v1/api/products/change-pro-cats:
 *   put:
 *     summary: Change a product's category
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, category_id]*             properties:
 *               product_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *                 description: Must be a subcategory (must have a category_parent_id)
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation failed, or category is not a subcategory
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product or category not found
 *       409:
 *         description: Category doesn't exist
 */
productsRouter.put("/change-pro-cats",loginCheck,changeProCategory)

/**
 * @openapi
 * /v1/api/products/get-pros:
 *   get:
 *     summary: Get a paginated list of products
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: No products found
 */
productsRouter.get("/get-pros",loginCheck,getPros)

/**
 * @openapi
 * /v1/api/products/get-pros/by-id/{product_id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
productsRouter.get("/get-pros/by-id/:product_id",loginCheck,getProsById)

/**
 * @openapi
 * /v1/api/products/get-pros/by-cat/{category_id}:
 *   get:
 *     summary: Get a paginated list of products in a category
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products in category
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: No products found
 */
productsRouter.get("/get-pros/by-cat/:category_id",loginCheck,getProsByCategory)

export {productsRouter}