import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import { manufactureChangeName,manufactureDeletion,manufactureAdd,manufactureName} from './manufacture.schemas';
import { DatabaseError } from 'pg';

async function addManu (req:Request,res:Response){
    if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = manufactureAdd.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {manufacturer_name,country_code}=Details.data
     await pool.query("INSERT INTO manufacturers(manufacturer_name,country_code,created_at,updated_at) VALUES ($1,$2,now(),now()) ",
      [manufacturer_name,country_code]
    )
      return res.status(200).json({message:'success'})
  }
  catch(err){
      if(err instanceof DatabaseError && err.code =="23505"){
        return res.status(409).json({message:"manufacture_name already exists"})
    }
    return  res.status(500).json({message:"unexpected error"})
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
        const {manufacturer_id,manufacturer_new_name}=Details.data
    const existing = await pool.query("UPDATE manufacturers SET manufacturer_name=$1 , updated_at=now() WHERE manufacturer_id=$2 AND deleted_at IS NULL RETURNING manufacturer_name ",
      [manufacturer_new_name,manufacturer_id]
    )
    if(existing.rowCount===0){
        return res.status(404).json({message:"manufacture not found"})
      }
      return res.status(200).json({message:"success",data:existing.rows[0]})
  }
  catch(err){
      if(err instanceof DatabaseError && err.code =="23505"){
        return res.status(409).json({message:"manufacture name already exists"})
    }
    return res.status(500).json({message:"unexpected error"})
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
        const {manufacturer_id}=Details.data
     const existing = await pool.query("UPDATE manufacturers SET updated_at=now(),deleted_at=now() WHERE manufacturer_id=$1 AND deleted_at IS NULL RETURNING manufacturer_name",
      [manufacturer_id]
    )
      if(existing.rowCount===0){
        return res.status(404).json({message:"manufacture not found"})
      }
      return res.status(200).json({message:"success"})
  }
  catch{
     return res.status(500).json({message:"unexpected error"})
    }
  }
    

async function getManu(req:Request,res:Response){
  if(!req.user){
    return res.status(401).json({message:"not authorized"})
  }
  try{
      const Details = manufactureName.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {manufacturer_id}=Details.data
     const existing = await pool.query("SELECT * FROM manufacturers WHERE manufacturer_id=$1 AND deleted_at IS NULL",
      [manufacturer_id]
    )
      if(existing.rowCount===0){
        return res.status(404).json({message:"manufacture not found"})
      }
      return res.status(200).json({message:"success",data:existing.rows[0]})
  }
  catch{
     return res.status(500).json({message:"unexpected error"})
    }
  }
    
export{addManu,getManu,changeManuName,deleteManu}