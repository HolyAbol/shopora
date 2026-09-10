import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenPayloadSchema } from './auth.schemas.ts';
import { pool } from '../db/db.ts';
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
    const Result = await pool.query(
      'SELECT user_id, username,role FROM users WHERE user_id=$1 AND deleted_at IS NULL',
      [payload.user_id]
    );
    if (Result.rowCount === 0) {
      return res.status(401).json({ message: 'user not found' });
    }

    req.user = Result.rows[0];
    next();
  } catch {
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
      const result = await pool.query(
        'SELECT role FROM users WHERE user_id = $1 AND deleted_at IS NULL',
        [req.user.user_id]
      );

      const user = result.rows[0];
      console.log(user);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        console.log('balls');
        return res.status(403).json({ message: 'Insufficient permission' });
      }

      req.user.role = user.role;
      next();
    } catch {
      return res.status(500).json({ message: 'Unexpected error' });
    }
  };
}
export { loginCheck, requireRole };
