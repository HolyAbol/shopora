import express from 'express';
import { loginCheck, requireRole } from '../services/auth/auth.middleware';
import {
  addManus,
  changeManusName,
  deleteManus,
} from '../logics/manufacture/manufacturers.controller';
import {
  getAllUsersAdmin,
  getAllProductsAdmin,
  getAllCategoriesAdmin,
  getAllManufacturersAdmin,
  getAllOrdersAdmin,
  getAllShopsAdmin,
  getOrderByIdAdmin,
  getUserByIdAdmin,
  changeUserRole,
  deleteUserAdmin,
  reviewShopRequest,
  updateOrderStatusAdmin,
} from './admin.controller';

const adminRouter = express.Router();
const admin = requireRole('admin');

/**
 * @openapi
 * /v1/api/admin/add-manus:
 *   post:
 *     summary: Create a new manufacturer
 *     tags: [Admin]
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
 *                 example: Nike Inc
 *               country_code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 pattern: '^[A-Z]{2}$'
 *                 example: US
 *     responses:
 *       201:
 *         description: Manufacturer created successfully
 *       400:
 *         description: Invalid or missing fields
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin role required
 *       409:
 *         description: manufacturer_name already exists
 *       500:
 *         description: Unexpected error
 */
adminRouter.post('/add-menus', loginCheck, admin, addManus);

/**
 * @openapi
 * /v1/api/admin/change-manus-name:
 *   put:
 *     summary: Change a manufacturer's name
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Manufacturer name updated
 */
adminRouter.put('/change-manus-name', loginCheck, admin, changeManusName);

/**
 * @openapi
 * /v1/api/admin/delete-manus/{manufacturer_id}:
 *   delete:
 *     summary: Soft-delete a manufacturer
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: manufacturer_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Manufacturer deleted
 *       404:
 *         description: Manufacturer not found
 */
adminRouter.delete('/delete-manus/:manufacturer_id', loginCheck, admin, deleteManus);

/**
 * @openapi
 * /v1/api/admin/get-users:
 *   get:
 *     summary: List all users (paginated, searchable)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, first_name, username, last_name, email, role]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       400:
 *         description: Validation failed
 */
adminRouter.get('/get-users', loginCheck, admin, getAllUsersAdmin);

/**
 * @openapi
 * /v1/api/admin/get-user-by-id/{user_id}:
 *   get:
 *     summary: Get a single user by id
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
adminRouter.get('/get-user-by-id/:user_id', loginCheck, admin, getUserByIdAdmin);

/**
 * @openapi
 * /v1/api/admin/get-products:
 *   get:
 *     summary: List all products, including inactive ones (paginated, searchable, filterable)
 *     tags: [Admin]
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [product_name, price, quantity, created_at, updated_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: shopId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: manufacturerId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated list of products
 */
adminRouter.get('/get-products', loginCheck, admin, getAllProductsAdmin);

/**
 * @openapi
 * /v1/api/admin/get-manufacturers:
 *   get:
 *     summary: List all manufacturers (paginated, searchable)
 *     tags: [Admin]
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [manufacturer_name, country_code, created_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of manufacturers
 */
adminRouter.get('/get-manufacturers', loginCheck, admin, getAllManufacturersAdmin);

/**
 * @openapi
 * /v1/api/admin/get-categories:
 *   get:
 *     summary: List all categories (paginated, searchable, filterable by parent)
 *     tags: [Admin]
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [category_name, created_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of categories
 */
adminRouter.get('/get-categories', loginCheck, admin, getAllCategoriesAdmin);

/**
 * @openapi
 * /v1/api/admin/get-shops:
 *   get:
 *     summary: List all shops (paginated, searchable, filterable by status)
 *     tags: [Admin]
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [shop_name, status, created_at, approved_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['waiting for approval', approved, rejected]
 *     responses:
 *       200:
 *         description: Paginated list of shops
 */
adminRouter.get('/get-shops', loginCheck, admin, getAllShopsAdmin);

/**
 * @openapi
 * /v1/api/admin/review-shop/{user_id}:
 *   put:
 *     summary: Approve or reject a pending shop request (approval also promotes the user to owner)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Shop reviewed
 *       404:
 *         description: Shop or user not found
 */
adminRouter.put('/review-shop/:user_id', loginCheck, admin, reviewShopRequest);

/**
 * @openapi
 * /v1/api/admin/get-orders:
 *   get:
 *     summary: List all orders (paginated, filterable by status and user)
 *     tags: [Admin]
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [total_amount, status, created_at, updated_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending_payment, processing, sourcing, warehouse, packaging, shipped, delivered, cancelled]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of orders
 */
adminRouter.get('/get-orders', loginCheck, admin, getAllOrdersAdmin);

/**
 * @openapi
 * /v1/api/admin/get-order-by-id/{order_id}:
 *   get:
 *     summary: Get a single order by id, including its items
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 */
adminRouter.get('/get-order-by-id/:order_id', loginCheck, admin, getOrderByIdAdmin);

/**
 * @openapi
 * /v1/api/admin/promote-user/{user_id}:
 *   put:
 *     summary: Change a user's role (owner promotion also approves their pending shop)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, owner, user]
 *     responses:
 *       200:
 *         description: Role updated
 *       404:
 *         description: User or shop not found
 */
adminRouter.put('/promote-user/:user_id', loginCheck, admin, changeUserRole);

/**
 * @openapi
 * /v1/api/admin/delete-user/{user_id}:
 *   delete:
 *     summary: Soft-delete a user and cascade to their shops, products, and addresses
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User and related data deleted
 *       404:
 *         description: User not found
 */
adminRouter.delete('/delete-user/:user_id', loginCheck, admin, deleteUserAdmin);
/**
 * @openapi
 * /v1/api/admin/update-order-status/{order_id}:
 *   put:
 *     summary: Manually override an order's status (support use)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending_payment, processing, sourcing, warehouse, packaging, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Validation failed or invalid order id
 *       404:
 *         description: Order not found
 */
adminRouter.put('/update-order-status/:order_id', loginCheck, admin, updateOrderStatusAdmin);
export { adminRouter };
