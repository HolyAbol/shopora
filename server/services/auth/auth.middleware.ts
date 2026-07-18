import {Response,Request,NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import { pool } from '../db/db.ts';
async function loginCheck(req:Request,res:Response,next:NextFunction){
    const token = req.cookies.token
    if(!token){
      res.status(401).json({
         message:"no token provided"
      })
    }
    try{
       console.log("token:", token);
//console.log("secret:", process.env.JWT_SECRET);
console.log("cookies:", req.cookies);
   const Payload = jwt.verify(token,process.env.JWT_SECRET!) as {
      userId:number;
   }
   const Result= await pool.query(
      "SELECT id, username, created_at FROM users WHERE id=$1",
      [Payload.userId]
   )
   //@ts-ignore
   req.user=Result.rows[0]
   console.log(Payload,Result)
   next()
    } catch(err){
     console.log(err)
     return res.status(401).json({
        message:"invalid token"
     })
    }
    
    
}
export {loginCheck}