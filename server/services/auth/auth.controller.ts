import bcrypt from 'bcrypt'
import {Response,Request,NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import {pool} from '../db/db.ts'
interface userdb{
    username:string,
    password:string
}
async function FindUser(user:userdb){
const User= await pool.query('select * from users where username =$1',
        [user.username])
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
        if(!creds.username || !creds.userpass){
          return res.status(400).json('missing credentials')
        }
        const hashedPass = await passHasher(creds.userpass)
       const any= await pool.query(
            "INSERT INTO users(username, password) VALUES($1,$2)",
            [creds.username,hashedPass]
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
        if(!creds.username || !creds.userpass){
            res.status(400).json('missing credentials')
        }
        const results = await FindUser(creds)
            const User=results.rows[0]
        if(!User){
            return res.status(403).json('invalid creds')
        }
        const checkPass = await compare(User.password,creds.userpass);
        console.log(User)
        console.log(process.env.JWT_SECRET)
        if(checkPass){
            const token = jwt.sign({
                userId:User.id
            },process.env.JWT_SECRET!,
            {
                expiresIn:'7d'
            })
            console.log(User.id,token)
            res.cookie("token",token,{
                httpOnly:true,
                secure:false,
                sameSite:"lax",
                maxAge:7*24*60*60*1000
            })
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