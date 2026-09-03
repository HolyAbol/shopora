import {Response,Request} from 'express';
import { pool } from '../../services/db/db';
import z from 'zod';
import { addItemToCart, cartItemQuantity } from './carts.schema';
async function cartExistence(user_id:number){
    const result = await pool.query("SELECT cart_id FROM carts WHERE user_id=$1 AND deleted_at IS NULL",
    [user_id]
    )
    return result
}
async function cartCreator(user_id:number) {
    const creation = await pool.query("INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id,user_id",
        [user_id]
        
    )
    return creation
}
async function checkStock(product_id:number) {
    const creation = await pool.query("SELECT quantity FROM products WHERE product_id=$1 AND deleted_at IS NULL",
        [product_id]
    )
    return creation
}
async function currentInCart(product_id:number,cart_id:number) {
    const amount = await pool.query("SELECT quantity FROM cart_items WHERE cart_id=$1 AND product_id=$2 AND deleted_at IS NULL",
        [cart_id,product_id]
    )
    return amount
}

async function createCart(req:Request,res:Response){
    if (!req.user) {
    return res.status(401).json({ message: "not authorized" })
  }
  const user_id=req.user.user_id
  try{
    const exist = await cartExistence(user_id)
  if(exist.rowCount===0){
    const creation = await cartCreator(user_id)
    return res.status(201).json({cart:creation.rows[0]})
  }
  return res.status(200).json({cart:exist.rows[0]})
  
  }catch{
    return res.status(500).json({message:"unexpected error"})
  }
}
async function getCarts(req:Request,res:Response){
    interface CartItemRows{
        product_id:number;
        quantity:number;
        price:number;
        name:string
    }
    if (!req.user) {
    return res.status(401).json({ message: "not authorized" })
  }
    const user_id =req.user.user_id
    try{
        const check = await cartExistence(user_id)
        if(check.rowCount===0){
        return res.status(404).json({message:"cart dosent exists"})
    }
        const result = await pool.query("SELECT c.cart_id AS cart_id ,ci.product_id,ci.quantity,p.product_name,p.price FROM carts c JOIN cart_items ci ON ci.cart_id =c.cart_id JOIN products p ON p.product_id=ci.product_id WHERE c.user_id=$1 AND c.deleted_at is null AND p.deleted_at IS NULL AND ci.deleted_at IS NULL",
        [user_id]
    )
        
        const totalItems = result.rows.reduce((sum:number,i:CartItemRows)=>sum + i.quantity,0)
        const totalPrice = result.rows.reduce((sum:number,i:CartItemRows)=>sum + i.price*i.quantity,0)
        return res.status(200).json({
            items:result.rows,
            totalItems,
            totalPrice
        })
    
    }catch(err){
        console.log(err)
        res.status(500).json({message:"unexpected error"})
    }

}
async function addItemsToCart(req:Request,res:Response){
    if (!req.user) {
    return res.status(401).json({ message: "not authorized" })
  }
  const Details =addItemToCart.safeParse(req.body)
      if(!Details.success){
        return res.status(400).json({
          message:"Validation failed",
        errors:z.treeifyError(Details.error)
            })
          }
    const user_id=req.user.user_id      
    const {quantity,product_id}=Details.data
    
try{
      const check = await checkStock(product_id)
    if(check.rowCount===0){
        return res.status(400).json({message:"product not found"})
    }
    const stockAmount = check.rows[0].quantity
    if(stockAmount<quantity){
        return res.status(400).json({message:"requested amount cannot exceed stock"})
    }
    let cart_id:number;
    const exist = await cartExistence(user_id)
  if(exist.rowCount===0){
  const created = await cartCreator(user_id)
   cart_id=created.rows[0].cart_id
 }
 else{
    cart_id = exist.rows[0].cart_id
 }
 const currentAmount = await currentInCart(product_id,cart_id)
 const currentQty =currentAmount.rows[0]?.quantity ?? 0
 if(currentQty+quantity>stockAmount){
    return res.status(400).json({message:"requested amount cannot exceed stock"})
 }
 const result = await pool.query("INSERT INTO cart_items (cart_id,product_id,quantity) values ($1,$2,$3) ON CONFLICT (cart_id,product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, deleted_at=NULL RETURNING cart_id , product_id , quantity",
    [cart_id,product_id,quantity]
 );
 return res.status(201).json({item: result.rows[0] })
}catch{
    res.status(500).json({message:"unexpected error"})
  }

}
async function changeItemQuantity(req:Request,res:Response){
   
    if (!req.user) {
    return res.status(401).json({ message: "not authorized" })
  }
  const Details =cartItemQuantity.safeParse(req.body)
      if(!Details.success){
        return res.status(400).json({
          message:"Validation failed",
        errors:z.treeifyError(Details.error)
            })
          }
    const user_id=req.user.user_id      
    const {quantity,product_id}=Details.data
  try{
    const check = await checkStock(product_id)
    if(check.rowCount===0){
        return res.status(400).json({message:"product not found"})
    }
    if(check.rows[0].quantity<quantity){
        return res.status(400).json({message:"requested amount cannot exceed stock"})
    }

       let cart_id:number;
    const exist = await cartExistence(user_id)
    if(exist.rowCount===0){
    return res.status(404).json({message:"cart dosen't exists"})
    }
    cart_id = exist.rows[0].cart_id
   const result = await pool.query("UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 AND deleted_at IS NULL RETURNING cart_id, product_id,quantity",
  [quantity,cart_id,product_id]
    );
    if(result.rowCount===0){
        return res.status(404).json({message:"item's not in cart"})
    }
    return res.status(200).json({item: result.rows[0] })
  }catch{
return res.status(500).json({message:"unexpected error"})
  }
}


async function removeItem(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "not authorized" });
  }
  const user_id = req.user.user_id;
  console.log(req.params)
  const product_id = Number(req.params.product_id);

  try {
    const cart = await cartExistence(user_id);
    if (cart.rowCount === 0) {
      return res.status(404).json({ message: "cart doesn't exist" });
    }
    const cart_id = cart.rows[0].cart_id;

    const result = await pool.query(
      "UPDATE cart_items SET deleted_at = now(),quantity= 0 WHERE cart_id = $1 AND product_id = $2 AND deleted_at IS NULL RETURNING product_id",
      [cart_id, product_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "item's not in cart" });
    }

    return res.status(204).send();
  } catch(err) {
    console.log(err)
    return res.status(500).json({ message: "unexpected error" });
  }
}
export {getCarts,createCart,addItemsToCart,changeItemQuantity,removeItem}