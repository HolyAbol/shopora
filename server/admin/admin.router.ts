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
import { adminReadLimiter, adminWriteLimiter } from '../config/rateLimit.middleware';

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: success }
 *                 id: { type: integer, example: 12 }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       409:
 *         description: manufacturer_name already exists
 *       500:
 *         description: Unexpected server error
 */
adminRouter.post('/add-manus', adminWriteLimiter, loginCheck, admin, addManus);

/**
 * @openapi
 * /v1/api/admin/change-manus-name:
 *   put:
 *     summary: Change a manufacturer's name
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
 *               - manufacturer_id
 *               - manufacturer_new_name
 *             properties:
 *               manufacturer_id:
 *                 type: integer
 *                 example: 12
 *               manufacturer_new_name:
 *                 type: string
 *                 example: Nike Global
 *     responses:
 *       200:
 *         description: Manufacturer name updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     manufactureName: { type: string, example: Nike Global }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: Manufacturer not found
 *       409:
 *         description: manufacturer_name already exists
 *       500:
 *         description: Unexpected server error
 */
adminRouter.put('/change-manus-name', adminWriteLimiter, loginCheck, admin, changeManusName);

/**
 * @openapi
 * /v1/api/admin/delete-manus/{manufacturer_id}:
 *   delete:
 *     summary: Soft-delete a manufacturer together with all of its products
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
 *         description: Manufacturer and its products deleted
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: Manufacturer not found
 *       500:
 *         description: Unexpected server error
 */
adminRouter.delete(
  '/delete-manus/:manufacturer_id',
  adminWriteLimiter,
  loginCheck,
  admin,
  deleteManus
);

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
 *         description: Matches email, first name or username (case-insensitive)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id: { type: integer }
 *                       username: { type: string }
 *                       phone_number: { type: string }
 *                       email: { type: string }
 *                       first_name: { type: string }
 *                       last_name: { type: string }
 *                       role: { type: string, enum: [admin, owner, user] }
 *                       created_at: { type: string, format: date-time }
 *                       updated_at: { type: string, format: date-time }
 *                       deleted_at: { type: string, format: date-time, nullable: true }
 *                       last_activity: { type: string, format: date-time, nullable: true }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get('/get-users', adminReadLimiter, loginCheck, admin, getAllUsersAdmin);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: success }
 *                 user:
 *                   type: object
 *                   description: Full user record
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: User not found
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get('/get-user-by-id/:user_id', adminReadLimiter, loginCheck, admin, getUserByIdAdmin);

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
 *           enum:
 *             - product_id
 *             - product_name
 *             - price
 *             - quantity
 *             - created_at
 *             - updated_at
 *             - deleted_at
 *             - is_active
 *             - low_stock_threshold
 *             - manufacturer_name
 *             - manufacturer_id
 *             - shop_name
 *             - shop_id
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         description: Matches product name or manufacturer name (case-insensitive)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id: { type: integer }
 *                       product_name: { type: string }
 *                       quantity: { type: integer }
 *                       is_active: { type: boolean }
 *                       low_stock_threshold: { type: integer }
 *                       price: { type: number }
 *                       shop_id: { type: integer }
 *                       shop_name: { type: string }
 *                       manufacturer_id: { type: integer }
 *                       manufacturer_name: { type: string }
 *                       created_at: { type: string, format: date-time }
 *                       updated_at: { type: string, format: date-time }
 *                       deleted_at: { type: string, format: date-time, nullable: true }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get('/get-products', adminReadLimiter, loginCheck, admin, getAllProductsAdmin);

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
 *         description: Matches manufacturer name (case-insensitive)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of manufacturers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       manufacturer_id: { type: integer }
 *                       manufacturer_name: { type: string }
 *                       country_code: { type: string, example: US }
 *                       created_at: { type: string, format: date-time }
 *                       updated_at: { type: string, format: date-time }
 *                       deleted_at: { type: string, format: date-time, nullable: true }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get(
  '/get-manufacturers',
  adminReadLimiter,
  loginCheck,
  admin,
  getAllManufacturersAdmin
);

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
 *         description: Matches category name (case-insensitive)
 *         schema:
 *           type: string
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id: { type: integer }
 *                       category_name: { type: string }
 *                       category_parent_id: { type: integer, nullable: true }
 *                       created_at: { type: string, format: date-time }
 *                       updated_at: { type: string, format: date-time }
 *                       deleted_at: { type: string, format: date-time, nullable: true }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get('/get-categories', adminReadLimiter, loginCheck, admin, getAllCategoriesAdmin);

/**
 * @openapi
 * /v1/api/admin/get-shops:
 *   get:
 *     summary: List all shops (paginated, searchable by owner, filterable by status)
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
 *           enum:
 *             - created_at
 *             - status
 *             - shop_name
 *             - approved_at
 *             - rejected_at
 *             - first_name
 *             - last_name
 *             - email
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         description: Matches the owner's email, first name or last name (case-insensitive)
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['waiting for approval', approved, rejected]
 *     responses:
 *       200:
 *         description: Paginated list of shops (email, first_name and last_name belong to the owner)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shop_id: { type: integer }
 *                       owner_id: { type: integer }
 *                       shop_name: { type: string }
 *                       status: { type: string, enum: ['waiting for approval', approved, rejected] }
 *                       created_at: { type: string, format: date-time }
 *                       approved_at: { type: string, format: date-time, nullable: true }
 *                       rejected_at: { type: string, format: date-time, nullable: true }
 *                       updated_at: { type: string, format: date-time }
 *                       deleted_at: { type: string, format: date-time, nullable: true }
 *                       email: { type: string }
 *                       first_name: { type: string }
 *                       last_name: { type: string }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get('/get-shops', adminReadLimiter, loginCheck, admin, getAllShopsAdmin);

/**
 * @openapi
 * /v1/api/admin/review-shop/{user_id}:
 *   put:
 *     summary: Approve or reject a pending shop request (approving also promotes a "user" to owner)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Shop reviewed
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: User not found, or shop not found / already reviewed
 *       500:
 *         description: Unexpected server error
 */
adminRouter.put('/review-shop/:user_id', adminWriteLimiter, loginCheck, admin, reviewShopRequest);

/**
 * @openapi
 * /v1/api/admin/get-orders:
 *   get:
 *     summary: List all orders, including soft-deleted ones (paginated, filterable by status and user)
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
 *           enum:
 *             - total_amount
 *             - status
 *             - payment_method
 *             - first_name
 *             - last_name
 *             - email
 *             - created_at
 *             - updated_at
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
 *         description: Paginated list of orders (email, first_name and last_name belong to the buyer)
 *         content:
 *           application/json:
 *             schema:
 *               type: object// middlewares/rateLimit.ts  (اضافه به فایل قبلی)
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       order_id: { type: integer }
 *                       status: { type: string }
 *                       address_id: { type: integer }
 *                       payment_method: { type: string }
 *                       total_amount: { type: number }
 *                       created_at: { type: string, format: date-time }
 *                       updated_at: { type: string, format: date-time }
 *                       email: { type: string }
 *                       first_name: { type: string }
 *                       last_name: { type: string }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get('/get-orders', adminReadLimiter, loginCheck, admin, getAllOrdersAdmin);

/**
 * @openapi
 * /v1/api/admin/get-order-by-id/{order_id}:
 *   get:
 *     summary: Get a single order by id, including its items, buyer and shipping address
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true// middlewares/rateLimit.ts  (اضافه به فایل قبلی)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: success }
 *                 order:
 *                   type: object
 *                   properties:
 *                     order_id: { type: integer }
 *                     status: { type: string }
 *                     address_id: { type: integer }
 *                     payment_method: { type: string }
 *                     total_amount: { type: number }
 *                     created_at: { type: string, format: date-time }
 *                     updated_at: { type: string, format: date-time }
 *                     email: { type: string }
 *                     first_name: { type: string }
 *                     last_name: { type: string }
 *                     phone_number: { type: string }
 *                     address_title: { type: string }
 *                     country_code: { type: string }
 *                     province: { type: string }
 *                     city: { type: string }
 *                     address_detail: { type: string }
 *                     postal_code: { type: string }
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id: { type: integer }
 *                       product_name: { type: string }
 *                       quantity: { type: integer }
 *                       unit_price: { type: number }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Unexpected server error
 */
adminRouter.get(
  '/get-order-by-id/:order_id',
  adminReadLimiter,
  loginCheck,
  admin,
  getOrderByIdAdmin
);

/**
 * @openapi
 * /v1/api/admin/promote-user/{user_id}:
 *   put:
 *     summary: Change a user's role (promoting to owner also approves their shop request)
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, owner, user]
 *     responses:
 *       200:
 *         description: Role updated (message is "done" when promoting to owner, "success" otherwise)
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: User not found (when the new role is admin or user)
 *       500:
 *         description: Unexpected server error
 */
adminRouter.put('/promote-user/:user_id', adminWriteLimiter, loginCheck, admin, changeUserRole);

/**
 * @openapi
 * /v1/api/admin/delete-user/{user_id}:
 *   delete:
 *     summary: Soft-delete a user and cascade to their shops, products and addresses (cart and cart items are hard-deleted)
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
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: User not found
 *       500:
 *         description: Unexpected server error
 */
adminRouter.delete('/delete-user/:user_id', adminWriteLimiter, loginCheck, admin, deleteUserAdmin);

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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending_payment, processing, sourcing, warehouse, packaging, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Validation failed or invalid order id
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permission (admin role required)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Unexpected server error
 */
adminRouter.put(
  '/update-order-status/:order_id',
  adminWriteLimiter,
  loginCheck,
  admin,
  updateOrderStatusAdmin
);
export { adminRouter };
