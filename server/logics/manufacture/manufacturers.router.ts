import express from "express";
import {addManu,getManu,getManuById,changeManuName,deleteManu} from "./manufacturers.controller.ts"
import { loginCheck } from "../../services/auth/auth.middleware.ts";
const manufacturerRouter = express.Router()

manufacturerRouter.post("/add-manu",loginCheck,addManu)
manufacturerRouter.get("/get-manu",loginCheck,getManu)
manufacturerRouter.get("/get-manu",loginCheck,getManuById)
manufacturerRouter.put("/change-manu-name",loginCheck,changeManuName)
manufacturerRouter.delete("/delete-manu",loginCheck,deleteManu)
export {manufacturerRouter}