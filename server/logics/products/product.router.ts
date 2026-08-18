import express from "express";
import { addProduct } from "./product.controller";
import { loginCheck } from "../../services/auth/auth.middleware";
const productsRouter = express.Router()
productsRouter.post("/add-pro",loginCheck,addProduct)
export {productsRouter}