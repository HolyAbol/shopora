import 'express';

declare global {
  namespace Express {
    interface User {
      user_id: number;
      username: string;
      role: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
