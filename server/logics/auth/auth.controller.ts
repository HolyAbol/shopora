import { findUser, passHasher, compare, clearCookie } from './auth.helpers.ts';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { loginSchema, signupSchema } from './auth.schemas.ts';
import { cartCreator, logger, projectstatus } from '../shared.helpers.ts';
import z from 'zod';
import { AppDataSource } from '../../configs/data-sources.ts';
import { User } from './user.entity.ts';
async function signup(req: Request, res: Response) {
  const creds = signupSchema.safeParse(req.body);
  if (!creds.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(creds.error),
    });
  }
  const { userName, userEmail, userPhoneNumber, userPassword } = creds.data;
  const hashedPass = await passHasher(userPassword ?? '');
  try {
    const outcome = await AppDataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        username: userName,
        password: hashedPass,
        email: userEmail,
        phoneNumber: userPhoneNumber,
      });
      const result = await manager.save(user);
      await cartCreator(result.userId, manager);
    });
    return res.status(201).json({ message: 'success' });
  } catch (err: any) {
    const pgErr = err.driverError ?? err;
    if (pgErr.code == '23505') {
      const fieldMap: Record<string, string> = {
        users_username_key: 'userName',
        users_email_key: 'userEmail',
        users_phone_number_key: 'userPhoneNumber',
      };
      const field = fieldMap[pgErr.constraint ?? ''] ?? 'unknown';
      return res.status(409).json({ message: `${field} already exists`, field });
    }
    logger(err, projectstatus);
    return res.status(500).json({ message: 'unexpected error' });
  }
}
async function login(req: Request, res: Response) {
  const creds = loginSchema.safeParse(req.body);
  if (!creds.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: z.treeifyError(creds.error),
    });
  }
  const { userName, userPassword } = creds.data;
  try {
    const userId = await AppDataSource.transaction(async (manager) => {
      const result = await findUser(userName, manager);
      if (!result) {
        throw new Error('user not found');
      }
      const checkPass = await compare(userPassword, result.password);
      if (!checkPass) {
        res.status(401).json({ message: 'invalid creds' });
      }

      await manager.update(User, { userId: result.userId }, { lastActivity: () => 'NOW()' });
      return result.userId;
    });
    const token = jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '7d',
      }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: 'enjoy' });
  } catch (err) {
    logger(err, projectstatus);
    res.status(500).json({ message: 'unexpected error' });
  }
}

function logout(res: Response) {
  clearCookie(res);
  return res.status(200).json({
    message: 'logged out',
  });
}
export { signup, login, logout };
