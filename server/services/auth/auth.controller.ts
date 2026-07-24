import { findUser,passHasher,compare,clearCookie } from './auth.helpers.ts';
import {Response,Request} from 'express';
import jwt from 'jsonwebtoken'
import {pool} from '../db/db.ts'

async function signup(req:Request,res:Response){
    const creds=req.body
    try{
        if(!creds.userName || !creds.userPass || !creds.userEmail || !creds.userPhoneNumber){
          return res.status(400).json('missing credentials')
        }
        const hashedPass = await passHasher(creds.userPass)
        await pool.query(
            "INSERT INTO users(username,password,phone_number,email) VALUES($1,$2,$3,$4)",
            [creds.userName,hashedPass,creds.userPhoneNumber,creds.userEmail]
        )
          return res.status(200).json('success')
    }catch(err){
        return res.status(400).json('unexpected error')

    }

}
async function login(req:Request,res:Response){
     const creds=req.body
     try{
        if(!creds.userName || !creds.userPass){
           return res.status(400).json('missing credentials')
        }
        else{
            const results = await findUser(creds)
            const User=results.rows[0]
         if(!User){
            return res.status(403).json('invalid creds')
        }
        const checkPass = await compare(creds.userPass,User.password);
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
            await pool.query("UPDATE users SET last_activity = now() where username =$1",
                [User.username]
            )
           return res.status(200).json(`enjoy`)
        }else{
            return res.status(401).json("invalid creds")
        }
    }
        }catch(err){
       return res.status(500).json(`unexpected error`)
     }
}

function logout(req:Request,res:Response){
    clearCookie(res)
    return res.status(200).json({
        message:"logged out"
    })
}
export {signup,login,logout,passHasher,compare,clearCookie}