import bcrypt from 'bcrypt'
import {Response,Request,NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import {pool} from '../db/db.ts'
import { Pool } from 'pg';
interface userdb{
    userName:string,
    password:string
}
async function findUser(user:userdb){
const User= await pool.query('select * from users where userName =$1',
        [user.userName])
        return User
}
async function passHasher(password:string):Promise<string>{
    return await bcrypt.hash(password,15)
}
async function compare(
    hashedPassword: string,
    plainPassword: string
): Promise<boolean> {
    return bcrypt.compare(
        plainPassword,
        hashedPassword
    );
}
async function signup(req:Request,res:Response){
    const creds=req.body
    try{
        if(!creds.userName || !creds.userPass){
          return res.status(400).json('missing credentials')
        }
        const hashedPass = await passHasher(creds.userPass)
        console.log(creds.userName,hashedPass,creds.userPhoneNumber,creds.userEmail)
        const any = await pool.query(
            "INSERT INTO users(username,password,phone_number,email) VALUES($1,$2,$3,$4)",
            [creds.userName,hashedPass,creds.userPhoneNumber,creds.userEmail]
        )
            res.status(200).json('success')
    }catch(err){
        console.log(err)
        res.status(400).json('unexpected error')

    }

}
async function login(req:Request,res:Response){
     const creds=req.body
     try{
        if(!creds.userName || !creds.userPass){
            res.status(400).json('missing credentials')
        }
        const results = await findUser(creds)
            const User=results.rows[0]
            console.log(User)
        if(!User){
            return res.status(403).json('invalid creds')
        }
        const checkPass = await compare(User.password,creds.userPass);
        console.log(process.env.JWT_SECRET)
        if(checkPass){
            const token = jwt.sign({
                userId:User.id
            },process.env.JWT_SECRET!,
            {
                expiresIn:'7d'
            })
            console.log(User.user_id,token)
            res.cookie("token",token,{
                httpOnly:true,
                secure:false,
                sameSite:"lax",
                maxAge:7*24*60*60*1000
            })
            await pool.query("UPDATE users SET last_activity = now() where username =$1",
                [User.username]
            )
            res.status(200).json(`enjoy ${token}`)
        }
        else{
            res.status(403).json('invalid credentials')
        }
     }catch(err){
        console.log(err)
       res.status(400).json(`unexpected error${err}`)
     }
}
function logout(req:Request,res:Response){
    res.clearCookie("token",{
        sameSite:"lax",
        secure:false,
        httpOnly:true
    })
    return res.status(200).json({
        message:"logged out"
    })
}
export {signup,login,logout,passHasher,compare}