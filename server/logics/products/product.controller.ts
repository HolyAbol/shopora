import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import { PoolClient } from 'pg';
import { paginationQuery } from '../shared.schemas';
import { addProductSchema,changeProductActiveSchema,changeProductCategorySchema,changeProductLowSchema,changeProductManuSchema,changeProductNameSchema, changeProductPriceSchema, changeProductQuantitySchema, ProductCategoryIdSchema, productDescriptionSchema, ProductIdSchema } from './product.schema';
import z from 'zod';
async function addPro (req:Request,res:Response){
if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    const Details =addProductSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
      const {product_name,category_id,manufacturer_id,quantity,price,description,is_active,low_stock_threshold}=Details.data
      const client = await pool.connect()
    try{
     await client.query("BEGIN")
   
    const result = await client.query("INSERT INTO products(product_name,manufacturer_id,quantity,price,description,is_active,low_stock_threshold,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now(),now()) RETURNING product_id ",
      [product_name,manufacturer_id,quantity,price,description,is_active,low_stock_threshold]
    )
    await assignCategories(result.rows[0].product_id,category_id,client)
    await client.query("COMMIT")
    return res.status(201).json({message:'success',product_id:result.rows[0].product_id})
  }
   catch(err: unknown){
      await client.query("ROLLBACK")
    if (err instanceof Error && "code" in err && err.code == "23503") {
      const constraint = "constraint" in err ? err.constraint : undefined;

      if (constraint === "fk_manufacturer_id") {
        return res.status(409).json({ message: "manufacturer doesn't exist" })
      }
      if (constraint === "fk_category_id") {
        return res.status(409).json({ message: "category doesn't exist" })
      }

      return res.status(409).json({ message: "referenced record doesn't exist" })
    }
      console.log(err)
      return res.status(500).json({message:"unexpected error"})
    }finally{
      client.release()
    }
}
async function assignCategories(product_id:number,category_id:number,client:PoolClient){
     await client.query("INSERT INTO product_categories(product_id,category_id) VALUES ($1,$2)",
     [product_id,category_id])
}

async function addDescription(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
    const Details =productDescriptionSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
const {description,product_id}=Details.data
 try{
  const result =  await pool.query("UPDATE products SET description=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING description ",
    [description,product_id]
  )
if(result.rowCount===0){
  return res.status(404).json({message:"product dosent exists"})
}
  return res.status(200).json({message:'success'})

}catch(err)
{
  return res.status(500).json({message:"unexpected error"})
}

}

async function changeProName(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
     const Details =changeProductNameSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
  const {product_name,product_id}=Details.data
try{
   const result = await pool.query("UPDATE products SET product_name=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING product_name",
    [product_name,product_id]
  )
  if(result.rowCount===0){
  return res.status(404).json({message:"product dosent exists"})
}

  return res.status(200).json({message:'success'})

}catch(err)
  {
    return res.status(500).json({message:"unexpected error"})
  }

}

async function changeProPrice(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
     const Details =changeProductPriceSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
  const {price,product_id}=Details.data
try{
   const result = await pool.query("UPDATE products SET price=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING price",
    [price,product_id]
  )
if(result.rowCount===0){
  return res.status(404).json({message:"product dosent exists"})
}
  return res.status(200).json({message:'success'})

}catch(err)
  {
    return res.status(500).json({message:"unexpected error"})
  }

}

async function changeProQuantity(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
     const Details =changeProductQuantitySchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
  const {quantity,product_id}=Details.data
try{
  const result = await pool.query("UPDATE products SET quantity=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING quantity",
    [quantity,product_id]
  )
if(result.rowCount===0){
  return res.status(404).json({message:"product dosent exists"})
}
  return res.status(200).json({message:'success'})

}catch(err)
  {
    return res.status(500).json({message:"unexpected error"})
  }

}

async function changeProLowStock(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
     const Details =changeProductLowSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
  const {low_stock_threshold,product_id}=Details.data
try{
 const getPro = await pool.query("Select quantity from products where product_id=$1 AND deleted_at IS NULL",
    [product_id]
  )
  if(getPro.rowCount===0){
    return res.status(404).json({message:"product not found"})
  }
  if(getPro.rows[0].quantity < low_stock_threshold){
    return res.status(400).json({message:"low stock threshold can't be greater than quantity"})
  }
   const result = await pool.query("UPDATE products SET low_stock_threshold=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING quantity,low_stock_treshold",
    [low_stock_threshold,product_id]
  )
  if(result.rowCount===0){
    return res.status(404).json({message:"product_id is invalid "})
  }

  return res.status(200).json({message:'success'})

}catch(err)
  {
    return res.status(500).json({message:"unexpected error"})
  }

}


async function changeProActive(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
     const Details =changeProductActiveSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
  const {is_active,product_id}=Details.data
try{
  const result = await pool.query("UPDATE products SET is_active=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING is_active",
    [is_active,product_id]
  )
if(result.rowCount===0){
  return res.status(404).json({message:"product dosent exists"})
}
  return res.status(200).json({message:'success'})

}catch(err)
  {
    return res.status(500).json({message:"unexpected error"})
  }

}
async function changeProManu(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
     const Details =changeProductManuSchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
  const {manufacturer_id,product_id}=Details.data
try{
  const result = await pool.query("UPDATE products SET manufacturer_id=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING Manufacturer_id",
    [manufacturer_id,product_id]
  )
if(result.rowCount===0){
  return res.status(404).json({message:"product dosent exists"})
}
  return res.status(200).json({message:'success'})

}catch(err:unknown)
  {
    if (err instanceof Error && "code" in err && err.code == "23503") {
      return res.status(409).json({ message: "manufacturer dosent exists" })
}
        return res.status(500).json({message:"unexpected error"})
  }
}async function changeProCategory(req:Request,res:Response){
  if(!req.user){
      return res.status(401).json({message:"not authorized"})
    }
     const Details =changeProductCategorySchema.safeParse(req.body)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
  const {category_id,product_id}=Details.data
try{
  const categoryCheck = await pool.query("SELECT category_parent_id FROm categories WHERE category_id=$1 AND deleted_at IS NULL ",
    [category_id]
  )
  if(categoryCheck.rowCount===0){
    return res.status(404).json({message:"category not found"})
  }
  if(categoryCheck.rows[0].category_parent_id===null){
    return res.status(400).json({message:"category must be a subcategory,not a parent category"})
  }
   const results = await pool.query("UPDATE product_categories SET category_id=$1 WHERE product_id=$2 AND deleted_at IS NULL RETURNING category_id",
    [category_id,product_id]
  )
  if(results.rowCount===0){
    return res.status(404).json({message:"product not found"})
  }
  return res.status(200).json({message:'success'})

}catch(err:unknown)
  {
    if (err instanceof Error && "code" in err && err.code == "23503") {
      return res.status(409).json({ message: "category dosent exists" })
}
        return res.status(500).json({message:"unexpected error"})
  }
}
async function getProsById(req:Request,res:Response){
  try{
      const Details = ProductIdSchema.safeParse(req.params)
      console.log(Details.error?.issues)
    if(!Details.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(Details.error)
          })
        }
        console.log(Details.data)
        const {product_id}=Details.data
     const existing = await pool.query("SELECT * FROM  products WHERE product_id=$1 AND deleted_at IS NULL",
      [product_id]
    )
      if(existing.rowCount===0){
        return res.status(404).json({message:"product not found"})
      }
      return res.status(200).json({message:"success",data:existing.rows[0]})
  }
  catch(err){
     return res.status(500).json({message:"unexpected error"})
    }
  }
  async function getPros(req:Request,res:Response){
    const paginate = paginationQuery.safeParse(req.query)
     console.log(paginate.error?.issues)
          console.log(paginate.data)
      try{
        if(!paginate.success){
      return res.status(400).json({
        message:"Validation failed",
      errors:z.treeifyError(paginate.error)
          })
        }
            const {limit,page}= paginate.data
            const offset = (page-1) * limit ;
            
         const existing = await pool.query("SELECT * FROM products WHERE deleted_at IS NULL ORDER BY product_id LIMIT $1 OFFSET $2",
          [limit,offset]
        )
          if(existing.rowCount===0){
            return res.status(404).json({message:"products not found"})
          }
          return res.status(200).json({message:"success",data:existing.rows})
      }
      catch(err){
         return res.status(500).json({message:"unexpected error"})
        }
      }


      async function getProsByCategory(req:Request,res:Response){
    const paginate = paginationQuery.safeParse(req.query)
    const category = ProductCategoryIdSchema.safeParse(req.query)
     console.log(paginate.error?.issues)
          console.log(paginate.data)
      try{
        if(!paginate.success || !category.success){
              return res.status(400).json({
                message:"Validation failed",
                errors:{
                  ...(paginate.success ? {} : z.treeifyError(paginate.error)),
                  ...(category.success ? {} : z.treeifyError(category.error))
                }
              })
            }
            const {limit,page}= paginate.data
            const offset = (page-1) * limit ;
            const {category_id}=category.data
         const existing = await pool.query("SELECT p.* FROM products p JOIN product_categories pc ON pc.product_id = p.product_id WHERE pc.category_id = $3 AND p.deleted_at IS NULL ORDER BY p.product_id LIMIT $1 OFFSET $2",
          [limit,offset,category_id]
        )
          if(existing.rowCount===0){
            return res.status(404).json({message:"products not found"})
          }
          return res.status(200).json({message:"success",data:existing.rows})
      }
      catch(err){
         return res.status(500).json({message:"unexpected error"})
        }
      }

export {addPro,addDescription,changeProName,changeProPrice,changeProQuantity,changeProLowStock,changeProActive,changeProManu,changeProCategory,getPros,getProsByCategory,getProsById}