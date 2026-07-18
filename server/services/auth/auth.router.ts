import express from "express";
import { signup,login,logout} from "./auth.controller.ts";
import { loginCheck } from "./auth.middleware.ts";
import { getProfile } from "../profile/profile.controller.ts";
const Authrouter=express.Router()
Authrouter.post('/signup',signup)
Authrouter.post('/login',login)
Authrouter.get('/profile',loginCheck,getProfile)
Authrouter.post('/logout',logout)
export {Authrouter}