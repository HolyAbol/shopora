import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import { DatabaseError } from 'pg';
import { categoryChange, categoryID, categorySchema } from './category.schema';
import { paginationQuery } from '../shared.schemas';
async function addcategory (req:Request,res:Response){
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

async function deleteManu(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details = categoryID.safeParse(req.body)
    if(!Details.success){
          return res.status(400).json('missing credentials')
        }
        const {category_id}=Details.data
     const existing = await pool.query("UPDATE categories SET updated_at=now(),deleted_at=now() WHERE category_id=$1 AND deleted_at IS NULL RETURNING manufacturer_name",
      [category_id]
    )
      if(existing.rowCount===0){
        return res.status(404).json({message:"category not found"})
      }
      return res.status(200).json({message:"success"})
  }
  catch{
     return res.status(500).json({message:"unexpected error"})
    }
  }

  async function getcategory(req:Request,res:Response){
    if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
        const paginate = paginationQuery.safeParse(req.body)
        
      if(!paginate.success){
            return res.status(400).json('missing credentials')
          }
          const {limit,page}= paginate.data
          const offset = (page-1) * limit ;
       const existing = await pool.query("SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY category_id LIMIT $1 OFFSET $2",
        [limit,offset]
      )
        if(existing.rowCount===0){
          return res.status(404).json({message:"categories not found"})
        }
        return res.status(200).json({message:"success",data:existing.rows[0]})
    }
    catch{
       return res.status(500).json({message:"unexpected error"})
      }
    }
      
    async function getCategoryById(req:Request,res:Response){
      if(!req.user){
        return res.status(401).json({message:"not authorized"})
      }
      try{
          const Details = categoryID.safeParse(req.body)
        if(!Details.success){
              return res.status(400).json('missing credentials')
            }
            const {category_id}=Details.data
         const existing = await pool.query("SELECT * FROM categories WHERE category_id=$1 AND deleted_at IS NULL",
          [category_id]
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
        