import {Response,Request,NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import { tokenPayloadSchema } from './auth.schemas.ts';
import { pool } from '../db/db.ts';
async function loginCheck(req:Request,res:Response,next:NextFunction){
    const token = req.cookies.token
    if(!token){
      return res.status(401).json({
         message:"no token provided"
      })
    }
    try{

   const decoded = jwt.verify(token,process.env.JWT_SECRET!) 
   const payload =tokenPayloadSchema.parse(decoded)
   console.log(payload)
   const Result= await pool.query(
      "SELECT user_id, username, created_at, email , phone_number FROM users WHERE user_id=$1 AND deleted_at IS NULL",
      [payload.user_id]
   )
   console.log(payload.user_id)

   req.user=Result.rows[0]
   next()
    } catch(err){
     console.log(err)
     return res.status(401).json({
        message:"invalid token"
     })
    }
    
    
}
export {loginCheck}