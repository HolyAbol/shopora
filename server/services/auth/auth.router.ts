import express from "express";
import { signup,login,logout} from "./auth.controller.ts";
import { loginCheck } from "./auth.middleware.ts";

const Authrouter=express.Router()
/**
 * @swagger
 * /v1/api/auth/signup:
 *   post:
 *     summary: user sign's up
 *     tags: [Signup]
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
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               phonenumber:
 *                 type: string
 *                 example: "09123456789"
 *               username:
 *                 type: string
 *                 example: example
 *     responses:
 *       200:
 *         description: signed up successfully
 *       400:
 *         description: fields shouldn't be empty
 *       404:
 *         description: unexpected error
 */
Authrouter.post('/signup',signup)
/**
 * @swagger
 * /v1/api/auth/login:
 *   post:
 *     summary: user logins
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - phonenumber
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: logged in 
 *       400:
 *         description: fields shouldn't be empty
 *       403:
 *         description: wrong credentials
 *       404:
 *         description: unexpected error
 */
Authrouter.post('/login',login)
/**
 * @swagger
 * /v1/api/auth/logout:
 *   post:
 *     summary: "user's logs out"
 *     tags: [Logout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "bye bye"
 *       401:
 *         description: "invalid or non existent Token"
 */
Authrouter.post('/logout',loginCheck,logout)
export {Authrouter}