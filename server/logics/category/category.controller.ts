import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import { DatabaseError } from 'pg';
import { categoryChange, categorySchema } from './category.schema';
async function addManu (req:Request,res:Response){
    if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = categorySchema.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {category_name,category_parent_id}=Details.data
     await pool.query("INSERT INTO categories(category_name,category_parent_id,created_at,updated_at) VALUES ($1,$2,now(),now()) ",
      [category_name,category_parent_id]
    )
      return res.status(200).json({message:'success'})
  }
  catch(err){
      if(err instanceof DatabaseError && err.code =="23505"){
        return res.status(409).json({message:"category already exists"})
    }
    return  res.status(500).json({message:"unexpected error"})
  }
    

}

async function changecategory(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = categoryChange.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {category_id,category_name,category_new_parent_id}=Details.data
    const existing = await pool.query("UPDATE categories SET category_parent_id=$1 , category_name=$2 , updated_at=now() WHERE category_id=$3 AND deleted_at IS NULL RETURNING category_id,category_name,category_parent_id ",
      [category_new_parent_id,category_name,category_id]
    )
    if(existing.rowCount===0){
        return res.status(404).json({message:"category not found"})
      }
      return res.status(200).json({message:"success",data:existing.rows[0]})
  }
  catch(err){
      if(err instanceof DatabaseError && err.code =="23505"){
        return res.status(409).json({message:"category name already exists"})
    }
    return res.status(500).json({message:"unexpected error"})
  }
    
}