import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import { manufactureChangeName,manufactureDeletion,manufacturersSchema } from './manufacture.schemas';
import { DatabaseError } from 'pg';

async function addManu (req:Request,res:Response){
    if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = manufacturersSchema.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {manufacture_name,country_code}=Details.data
     await pool.query("INSERT INTO manufacturers(manufacturer_name,country_code,created_at,updated_at) VALUES ($1,$2,now(),now()) ",
      [manufacture_name,country_code]
    )
      return res.status(200).json({message:'success'})
  }
  catch(err){
      if(err instanceof DatabaseError && err.code =="23505"){
        return res.status(409).json({message:"manufacture_name already exists"})
    }
  }
    

}
async function changeManuName(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = manufactureChangeName.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {manufacture_name,new_manufacture_name}=Details.data
     await pool.query("UPDATE manufacturers SET manufacturer_name=$1 , updated_at=now() WHERE manufacturer_name=$2 ",
      [new_manufacture_name,manufacture_name]
    )
      return res.status(200).json({message:'success'})
  }
  catch(err){
      if(err instanceof DatabaseError && err.code =="23505"){
        return res.status(409).json({message:"manufacture_name already exists"})
    }
  }
    
}
async function deleteManu(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = manufactureDeletion.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {manufacture_name,}=Details.data
     const existing = await pool.query("SELECT manufacturers WHERE manufacturer_name=$1 && deleted_at IS NULL RETURNING manufacturer_name",
      [manufacture_name]
    )
      if(existing.rowCount===0){
        return res.status(404).json({message:"manufacture not found"})
      }
      return res.status(200).json({message:"success"})
  }
  catch{
      res.status(500).json({message:"unexpected error"})
    }
  }
    
export{addManu,changeManuName,deleteManu}