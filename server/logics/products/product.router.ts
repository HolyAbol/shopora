import express from "express";
import { addPro } from "./product.controller";
import { loginCheck } from "../../services/auth/auth.middleware";
const productsRouter = express.Router()
productsRouter.post("/add-pro",loginCheck,addPro)
export {productsRouter}