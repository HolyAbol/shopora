import {Response,Request} from 'express';
import { pool } from '../db/db.ts';
import { passHasher,compare} from '../auth/auth.controller.ts';
//get user profile
async function getProfile(req:Request,res:Response){

    return res.status(200).json(req.user)
}
async function changeUsername(req:Request,res:Response){
    const result = await pool.query("UPDATE users SET username =$1, updated_at =now() WHERE user_id=$2 RETURNING user_id,username,created_at",
    //@ts-ignore
    [req.body.newUsername,req.user.user_id])
        if(result.rowCount===0){
            return res.status(404).json("user not found")
        }
   return res.status(200).json('success')
   
   }
async function changePassword(req:Request,res:Response){
    interface creds{
        oldpassword:string,
        newpassword:string
      }
      const creds = req.body as creds
      
      const result = await pool.query("SELECT user_id, password, created_at FROM users WHERE user_id=$1",
          //@ts-ignore
        [req.user.user_id]
      )

      //@ts-ignore
      if(result.rowCount===0){
        return res.status(404).json("user not found")
      }
        if(creds.oldpassword || creds.newpassword){
         const checkstatus = await compare(result.rows[0].password,creds.oldpassword)

        if(checkstatus){
            if(creds.oldpassword === creds.newpassword){
               return res.status(400).json('new password cant be your current password')
            }else{
                const hashedpassword = await passHasher(creds.newpassword)
                await pool.query("UPDATE users SET password =$1,updated_at =now() WHERE user_id=$2 RETURNING user_id,username,created_at",
              //@ts-ignore
                 [hashedpassword,req.user.id])
                 return res.status(200).json(`password has been changed successfully`)
                }
            }else{
                return res.status(400).json("passwords dont match")
            }
        }else{
            return res.status(400).json("all filed must not be empty")
             }
      
}

export{getProfile,changeUsername,changePassword}