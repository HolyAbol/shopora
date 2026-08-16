import { loginCheck } from '../auth/auth.middleware.ts';
import { changeFullname, changePassword, changeUsername, deleteProfile, getProfile } from './profile.controller.ts';
import express from 'express';
const Profilerouter = express.Router()

/**
 * @openapi
 * /v1/api/profiles/profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   example: user@example.com
 *                 username:
 *                   type: string
 *                   example: example
 *       401:
 *         description: Invalid or non-existent token
 *       404:
 *         description: User not found
 */
Profilerouter.get('/profile', loginCheck, getProfile)

/**
 * @openapi
 * /v1/api/profiles/change-password:
 *   put:
 *     summary: Change the current user's password
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: oldSecurePass1
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: newSecurePass1
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Missing/invalid fields, passwords don't match, or new password same as old
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Unexpected error
 */
Profilerouter.put('/change-password', loginCheck, changePassword)

/**
 * @openapi
 * /v1/api/profiles/change-username:
 *   put:
 *     summary: Change the current user's username
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newUsername
 *             properties:
 *               newUsername:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: newUsername123
 *     responses:
 *       200:
 *         description: Username changed successfully
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Unexpected error
 */
Profilerouter.put('/change-username', loginCheck, changeUsername)

/**
 * @openapi
 * /v1/api/profiles/change-fullname:
 *   put:
 *     summary: Change the current user's full name
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 example: Ali
 *               lastName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 example: Rezaei
 *     responses:
 *       200:
 *         description: Full name changed successfully
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Unexpected error
 */
Profilerouter.put('/change-fullname', loginCheck, changeFullname)

/**
 * @openapi
 * /v1/api/profiles/delete-profile:
 *   delete:
 *     summary: Delete the current user's profile
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Unexpected error
 */
Profilerouter.delete('/delete-profile', loginCheck, deleteProfile)

export { Profilerouter }