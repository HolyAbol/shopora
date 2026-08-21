import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import { manufactureChangeName,manufactureDeletion,manufactureAdd,manufactureID} from './manufacture.schemas';
import { DatabaseError } from 'pg';
import { paginationQuery } from '../shared.schemas';

async function addManus (req:Request,res:Response){
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
      return res.status(201).json({message:'success'})
  }
  catch(err){
      if(err instanceof DatabaseError && err.code =="23505"){
        return res.status(409).json({message:"manufacture_name already exists"})
    }
    return  res.status(500).json({message:"unexpected error"})
  }
    

}
async function changeManusName(req:Request,res:Response){
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
async function deleteManus(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = manufactureDeletion.safeParse(req.params)
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
    

async function getManusById(req:Request,res:Response){
  try{
      const Details = manufactureID.safeParse(req.params)
      console.log(Details.error?.issues)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        console.log(Details.data)
        const {manufacturer_id}=Details.data
     const existing = await pool.query("SELECT * FROM manufacturers WHERE manufacturer_id=$1 AND deleted_at IS NULL",
      [manufacturer_id]
    )
      if(existing.rowCount===0){
        return res.status(404).json({message:"manufacture not found"})
      }
      return res.status(200).json({message:"success",data:existing.rows[0]})
  }
  catch(err){
     return res.status(500).json(err)
    }
  }
    
  async function getManus(req:Request,res:Response){
      try{
          const paginate = paginationQuery.safeParse(req.query)
          console.log(paginate.error?.issues)
          console.log(paginate.data)
        if(!paginate.success){
              return res.status(400).json('missing credentials')
            }
            const {limit,page}= paginate.data
            const offset = (page-1) * limit ;
            
         const existing = await pool.query("SELECT * FROM manufacturers WHERE deleted_at IS NULL ORDER BY manufacturer_id LIMIT $1 OFFSET $2",
          [limit,offset]
        )
          if(existing.rowCount===0){
            return res.status(404).json({message:"manufacturers not found"})
          }
          return res.status(200).json({message:"success",data:existing.rows})
      }
      catch(err){
        console.log(err)
         return res.status(500).json({message:"unexpected error"})
        }
      }
export{addManus,getManus,getManusById,changeManusName,deleteManus}