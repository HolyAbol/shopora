import express from "express";
import {addManus,getManus,getManusById,changeManusName,deleteManus} from "./manufacturers.controller.ts"
import { loginCheck } from "../../services/auth/auth.middleware.ts";
const manufacturerRouter = express.Router()

manufacturerRouter.post("/add-manus",loginCheck,addManus)
manufacturerRouter.get("/get-manus",getManus)
manufacturerRouter.get("/get-manus/:manufacturer_id",getManusById)
manufacturerRouter.put("/change-manus-name",loginCheck,changeManusName)
manufacturerRouter.delete("/delete-manus/:manufacturer_id",loginCheck,deleteManus)
export {manufacturerRouter}