import bcrypt from 'bcrypt'
import {Response} from 'express';
import {pool} from '../db/db.ts'
interface userdb{
    userName:string,
    password:string
}

async function findUser(userName:string){
const User= await pool.query('select * from users where username =$1 AND deleted_at IS NULL',
        [userName]
    )
        return User
}
async function passHasher(password:string):Promise<string>{
    return await bcrypt.hash(password,15)
}
async function compare(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(
        plainPassword,
        hashedPassword
        
    );
}
function clearCookie(res:Response){
res.clearCookie("token",{
        sameSite:"lax",
        secure:true,
        httpOnly:true
    })
}
export{findUser,clearCookie,compare,passHasher,userdb}