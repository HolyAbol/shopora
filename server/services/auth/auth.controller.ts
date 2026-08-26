import { findUser,passHasher,compare,clearCookie } from './auth.helpers.ts';
import {Response,Request} from 'express';
import jwt from 'jsonwebtoken'
import {pool} from '../db/db.ts'
import { DatabaseError } from 'pg';
import { loginSchema, signupSchema } from './auth.schemas.ts';


async function signup(req:Request,res:Response){
    const creds=signupSchema.safeParse(req.body)
    try{
        if(!creds.success){
          return res.status(400).json({message:'missing credentials'})
        }
        const {userName,userEmail,userPhoneNumber,userPassword}= creds.data
        console.log(creds.data)
        const hashedPass = await passHasher(userPassword ?? '')
        await pool.query(
            "INSERT INTO users(username,password,phone_number,email) VALUES($1,$2,$3,$4)",
            [userName,hashedPass,userPhoneNumber,userEmail]
        )
          return res.status(201).json({message:'success'})
    }catch(err){
        console.log(err)
         if(err instanceof DatabaseError && err.code =="23505"){
    const fieldMap: Record<string,string> ={
        users_username_key:"userName",
        users_email_key:"userEmail",
        users_phone_number_key:"userPhoneNumber"
    }
      const field = fieldMap[err.constraint ?? ''] ?? 'unknown'
        return res.status(409).json({message:`${field} already exists`,field})
    }
        return res.status(500).json({message:'unexpected error'})
    }

}
async function login(req:Request,res:Response){
     const creds = loginSchema.safeParse(req.body)
     console.log(req.body,creds.success,creds.error?.issues)
     if(!creds.success){
        return res.status(400).json({message:'missing credentials'})
     }
     const {userName,userPassword}=creds.data
     console.log(userName,userPassword)
     try
        {
            const results = await findUser(userName)
            const User=results.rows[0]
         if(!User){
            
            return res.status(401).json({message:'invalid creds'})
        }
        const checkPass = await compare(userPassword,User.password);
        console.log(checkPass)
        if(checkPass){
            const token = jwt.sign({
                user_id:User.user_id
            },process.env.JWT_SECRET!,
            {
                expiresIn:'7d'
            })

            res.cookie("token",token,{
                httpOnly:true,
                secure:true,
                sameSite:"lax",
                maxAge:7*24*60*60*1000
            })
            console.log(token)
            await pool.query("UPDATE users SET last_activity = now() where username =$1",
                [User.username]
            )
           return res.status(200).json({message:"enjoy"})
        }else{
            console.log("AJHD")
            return res.status(401).json({message:"invalid creds"})
        }
    }
        catch{
       return res.status(500).json({message:"unexpected error"})
        }
     }


function logout(req:Request,res:Response){
    clearCookie(res)
    return res.status(200).json({
        message:"logged out"
    })
}
export {signup,login,logout}