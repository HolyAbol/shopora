import express from "express";
import{addCategory,getCategoryById,getCategories,changeCategory,deleteCategory} from './categories.controller'
import { loginCheck } from "../../services/auth/auth.middleware";

const categoriesRouter = express.Router()

categoriesRouter.post('/add-cats',loginCheck,addCategory)
categoriesRouter.get('get-cats-by-id/:category_id',getCategoryById)
categoriesRouter.get('get-cats',getCategories)
categoriesRouter.post('/change-cats',loginCheck,changeCategory)
categoriesRouter.delete('/delete-cats/:category_id',loginCheck,deleteCategory)