import express from "express";
import {addManu,getManus,getManuById,changeManuName,deleteManu} from "./manufacturers.controller.ts"
import { loginCheck } from "../../services/auth/auth.middleware.ts";
const manufacturerRouter = express.Router()

manufacturerRouter.post("/add-manus",loginCheck,addManu)
manufacturerRouter.get("/get-manus",getManus)
manufacturerRouter.get("/get-manus/:manufacturer_id",getManuById)
manufacturerRouter.put("/change-manu-names",loginCheck,changeManuName)
manufacturerRouter.delete("/delete-manus/:manufacturer_id",loginCheck,deleteManu)
export {manufacturerRouter}