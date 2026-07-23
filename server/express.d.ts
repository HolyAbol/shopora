import "express";

declare global {
    namespace Express {
        interface User {
            user_id: number;
            username: string;
            created_at: Date;
            phone_number:string;
            email:string;
        }

        interface Request {
            user?: User;
        }
    }
}

export {};