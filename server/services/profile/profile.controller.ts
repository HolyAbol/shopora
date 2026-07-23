import {Response,Request} from 'express';
import { pool } from '../db/db.ts';
import { passHasher,compare, clearCookie} from '../auth/auth.controller.ts';
import { count } from 'node:console';
//get user profile
async function getProfile(req:Request,res:Response){
    if(!req.user){
       return res.status(404).json({message:"user not found"})
    }
    return res.status(200).json(req.user)
}
async function changeUsername(req:Request,res:Response){
     if(!req.user){
       return res.status(401).json({message:"not authorized"})
    }
    const result = await pool.query("UPDATE users SET username =$1, updated_at =now() WHERE user_id=$2 RETURNING user_id,username,created_at",
    
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
      try{
        if(!req.user){
        return res.status(401).json({message:"unauthorized"})
      }
      const result = await pool.query("SELECT user_id, password FROM users WHERE user_id=$1",
        [req.user.user_id]
      )
      
      if(result.rowCount===0){
        return res.status(404).json({message:"user not found"})
      }
        if(creds.oldpassword && creds.newpassword){
         const checkstatus = await compare(creds.oldpassword,result.rows[0].password)

        if(checkstatus){
            if(creds.oldpassword === creds.newpassword){
               return res.status(400).json({message:"new password cant be your current password"})
            }else{
                const hashedpassword = await passHasher(creds.newpassword)
                await pool.query("UPDATE users SET password =$1,updated_at =now() WHERE user_id=$2 RETURNING user_id,username,created_at",
                 [hashedpassword,req.user.user_id])
                 return res.status(200).json({message:"password has been changed successfully"})
                }
            }else{
                return res.status(400).json({message:"passwords dont match"})
            }
        }else{
                return res.status(400).json({message:"fileds must not be empty"})
             }
      
      }catch{
        return res.status(500).json({message:"unexpected error"})
      }
      
}
async function deleteProfile(req:Request,res:Response){
if(!req.user){
       return res.status(401).json({message:"not authorized"})
    }
    try{
const search = await pool.query("SELECT user_id FROM users where user_id=$1 AND deleted_at IS NULL",
        [req.user.user_id]
    )
    if(search.rowCount===0){
        return res.status(404).json({message:"user not found"})
    }
    const result = await pool.query("UPDATE users SET deleted_at=now() WHERE user_id=$1",
        [req.user.user_id]
    )
    clearCookie(res)
    return res.status(200).json({message:"goodbye"})
    
    }catch{
        return res.status(500).json({message:"unexpected error"})
    }
    
}

export{getProfile,changeUsername,changePassword,deleteProfile}