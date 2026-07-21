import { loginCheck } from '../auth/auth.middleware.ts';
import { changePassword, changeUsername, getProfile } from './profile.controller.ts';
import express from 'express';
const Profilerouter =express.Router()
/**
 * @swagger
 * /v1/api/profile/profile:
 *   get:
 *     summary: "user's profile"
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "heres your profile"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 username:
 *                   type: string
 *                   example: "example"
 *       401:
 *         description: "invalid or non existent Token"
 *       404:
 *         description: "user not found"
 */
Profilerouter.get('/profile',loginCheck,getProfile)
/**
 * @swagger
 * /v1/api/profile/change-password:
 *   put:
 *     summary: "change user's password"
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newpassword
 *             properties:
 *               newpassword:
 *                 type: string
 *                 example: "example"
 *     responses:
 *       200:
 *         description: "passwords's changed"
 *       401:
 *         description: "not authorized"
 *       404:
 *         description: "unexpected error"
 */
Profilerouter.put('/change-password',loginCheck,changePassword)
/**
 * @swagger
 * /v1/api/profile/change-username:
 *   put:
 *     summary: "change user's username"
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newusername
 *             properties:
 *               newusername:
 *                 type: string
 *                 example: "example"
 *     responses:
 *       200:
 *         description: "username's changed"
 *       401:
 *         description: "not authorized"
 *       404:
 *         description: "unexpected error"
 */
Profilerouter.put('/change-username',loginCheck,changeUsername)
export{Profilerouter}