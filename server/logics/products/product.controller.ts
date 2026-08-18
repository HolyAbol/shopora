import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import { DatabaseError } from 'pg';
import { paginationQuery } from '../shared.schemas';
import { addProductSchema } from './product.schema';
import z from 'zod';
async function addProduct (req:Request,res:Response){
if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    try{
      const Details =addProductSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
    })
    }
    const {product_name,manufacturer_id,quantity,price,description,is_active,low_stock_threshold}=Details.data
    await pool.query("INSERT INTO products(product_name,manufacturer_id,quantity,price,description,is_active,low_stock_threshold,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now(),now())",
      [product_name,manufacturer_id,quantity,price,description,is_active,low_stock_threshold]
    )
    return res.status(200).json({message:'success'})
  }
    catch(err: unknown){
    if (err instanceof Error && "code" in err && err.code == "23503") {
      return res.status(409).json({ message: "manufacturer dosent exists" })
    }
      console.log(err)
      return res.status(500).json({message:"unexpected error"})
    }
}
export {addProduct}