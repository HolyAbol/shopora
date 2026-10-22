import 'express';

declare global {
  namespace Express {
    interface User {
      userId: number;
      username: string;
      role: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
