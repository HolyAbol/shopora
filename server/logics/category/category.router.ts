import express from "express";
import{addCategory,getCategoryById,getCategories,changeCategory,deleteCategory} from './category.controller'
import { loginCheck } from "../../services/auth/auth.middleware";


const categoriesRouter = express.Router()


/**
 * @openapi
 * /v1/api/cats/add-cats:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z]+$'
 *                 example: Fruits
 *               category_parent_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *     responses:
 *       200:
 *         description: Category created successfully
 *       400:
 *         description: Invalid or missing fields
 *       401:
 *         description: Not authorized
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Unexpected error
 */
categoriesRouter.post('/add-cats',loginCheck,addCategory)


/**
 * @openapi
 * /v1/api/cats/get-cats/{category_id}:
 *   get:
 *     summary: Get a single category by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Category found
 *       400:
 *         description: Invalid category_id
 *       404:
 *         description: Category not found
 *       500:
 *         description: Unexpected error
 */
categoriesRouter.get('/get-cats/:category_id',getCategoryById)


/**
 * @openapi
 * /v1/api/cats/get-cats:
 *   get:
 *     summary: Get a paginated list of categories
 *     tags: [Categories]
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
 *         description: List of categories
 *       400:
 *         description: Invalid pagination params
 *       404:
 *         description: No categories found
 *       500:
 *         description: Unexpected error
 */
categoriesRouter.get('/get-cats',getCategories)


/**
 * @openapi
 * /v1/api/cats/change-cats:
 *   put:
 *     summary: Update a category's name and/or parent
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - category_name
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               category_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z]+$'
 *                 example: Vegetables
 *               category_new_parent_id:
 *                 type: integer
 *                 nullable: true
 *                 description: >
 *                   Leave omitted or null to keep the current parent.
 *                   Note: with the current implementation, omitting this
 *                   field will actually clear the parent (set to NULL)
 *                   unless COALESCE is added server-side.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid or missing fields
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 *       500:
 *         description: Unexpected error
 */
categoriesRouter.put('/change-cats',loginCheck,changeCategory)


/**
 * @openapi
 * /v1/api/cats/delete-cats/{category_id}:
 *   delete:
 *     summary: Soft-delete a category (fails if it has active children)
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category_id
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category has active children
 *       500:
 *         description: Unexpected error
 */
categoriesRouter.delete('/delete-cats/:category_id',loginCheck,deleteCategory)


export {categoriesRouter}