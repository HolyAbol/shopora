import express from "express";
import { signup,login,logout} from "./auth.controller.ts";
import { loginCheck } from "./auth.middleware.ts";

const Authrouter=express.Router()

/**
 * @openapi
 * /v1/api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - phonenumber
 *               - email
 *             properties:
 *               userName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: maninthed
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               userPhoneNumber:
 *                 type: string
 *                 pattern: '^09\d{9}$'
 *                 example: "09123456789"
 *               userPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "123456ab"
 *     responses:
 *       200:
 *         description: Signed up successfully
 *       400:
 *         description: Missing or invalid fields
 *       409:
 *         description: Username, email, or phone number already exists
 *       500:
 *         description: Unexpected error
 */
Authrouter.post('/signup',signup)

/**
 * @openapi
 * /v1/api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: maninthed
 *               userPassword:
 *                 type: string
 *                 example: "123456ab"
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Unexpected error
 */
Authrouter.post('/login',login)

/**
 * @openapi
 * /v1/api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Invalid or non-existent token
 *       500:
 *         description: Unexpected error
 */
Authrouter.post('/logout',loginCheck,logout)

export {Authrouter}