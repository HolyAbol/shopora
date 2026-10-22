import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenPayloadSchema } from './auth.schemas.ts';
import { AppDataSource } from '../../configs/data-sources.ts';
import { User } from './user.entity.ts';
import { logger, projectstatus } from '../shared.helpers.ts';
async function loginCheck(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: 'no token provided',
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const payload = tokenPayloadSchema.parse(decoded);
    const Result = await AppDataSource.getRepository(User).findOne({
      where: { userId: payload.user_id },
      select: { username: true, role: true, userId: true },
    });
    if (Result === null) {
      return res.status(401).json({ message: 'user not found' });
    }

    req.user = Result;
    next();
  } catch (err) {
    logger(err, projectstatus);
    return res.status(401).json({
      message: 'invalid token',
    });
  }
}
function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'not authorized' });
    }
    try {
      const result = await AppDataSource.getRepository(User).findOne({
        where: { userId: req.user.userId },
        select: { role: true },
      });

      const user = result;
      console.log(user);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permission' });
      }

      req.user.role = user.role;
      next();
    } catch (err) {
      logger(err, projectstatus);
      return res.status(500).json({ message: 'Unexpected error' });
    }
  };
}
export { loginCheck, requireRole };
