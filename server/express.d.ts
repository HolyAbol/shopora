import "express";

declare global {
    namespace Express {
        interface User {
            id: number;
            username: string;
            created_at: Date;
        }

        interface Request {
            user?: User;
        }
    }
}

export {};