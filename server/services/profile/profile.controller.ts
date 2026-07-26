import {Response,Request} from 'express';
import { pool } from '../db/db.ts';
import { passHasher,compare, clearCookie} from '../auth/auth.controller.ts';
async function getProfile(req:Request,res:Response){
    if(!req.user){
       return res.status(404).json({message:"user not found"})
    }
    return res.status(200).json(req.user)
}
async function changeFullname(req:Request,res:Response){
    interface Fullname{
        firstname:string,
        lastname:string
      }
      const Fullname =req.body as Fullname                    
if(!req.user){
       return res.status(401).json({message:"not authorized"})
    }
    try{
        const result = await pool.query("UPDATE users SET first_name=$1,last_name=$2,updated_at=now() WHERE user_id=$3 RETURNING user_id,first_name,last_name",
        [Fullname.firstname,Fullname.lastname,req.user.user_id]
    )
    if(result.rowCount===0){
            return res.status(404).json({message:"user not found"})
        }
        return res.status(200).json({message:'success'})
       }
       catch(err){
     return res.status(500).json({message:"unexpected error"})
   }
    }
    
async function changeUsername(req:Request,res:Response){
     if(!req.user){
       return res.status(401).json({message:"not authorized"})
    }
    try{
        const result = await pool.query("UPDATE users SET username =$1, updated_at =now() WHERE user_id=$2 RETURNING user_id,username,created_at",
    
    [req.body.newUsername,req.user.user_id])
        if(result.rowCount===0){
            return res.status(404).json({message:"user not found"})
        }
   return res.status(200).json({message:'success'})
   
   }catch(err:any){
    if(err.code=="23505"){
        return res.status(409).json({message:"username already exists"})
    }
     return res.status(500).json({message:"unexpected error"})
   }
}
    
async function changePassword(req:Request,res:Response){
    interface creds{
        oldPassword:string,
        newPassword:string
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
        if(creds.oldPassword && creds.newPassword){
         const checkStatus = await compare(creds.oldPassword,result.rows[0].password)

        if(checkStatus){
            if(creds.oldPassword === creds.newPassword){
               return res.status(400).json({message:"new password cant be your current password"})
            }else{
                const hashedPassword = await passHasher(creds.newPassword)
                await pool.query("UPDATE users SET password =$1,updated_at =now() WHERE user_id=$2 RETURNING user_id,username,created_at",
                 [hashedPassword,req.user.user_id])
                 clearCookie(res)
                 return res.status(200).json({message:"password has been changed successfully"})
                }
            }else{
                return res.status(400).json({message:"passwords dont match"})
            }
        }else{
                return res.status(400).json({message:"fileds must not be empty"})
             }
      
      }catch(err:any){
        if(err.code=="23505"){
        return res.status(409).json({message:"new password cant be your current password"})
    }
        return res.status(500).json({message:"unexpected error"})
      }
      
}
async function deleteProfile(req:Request,res:Response){
if(!req.user){
       return res.status(401).json({message:"not authorized"})
    }
    try{
const result = await pool.query("UPDATE users SET deleted_at=now() WHERE user_id=$1 AND deleted_at IS NULL RETURNING user_id,deleted_at",
        [req.user.user_id]
    )
    
    if(result.rowCount===0){
        return res.status(404).json({message:"user not found"})
    }
    clearCookie(res)
    return res.status(200).json({message:"goodbye"})
    
    }catch{
        return res.status(500).json({message:"unexpected error"})
    }
    
}
export{getProfile,changeFullname,changeUsername,changePassword,deleteProfile}