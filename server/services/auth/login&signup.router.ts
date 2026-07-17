import express from "express";
import { signup,login,logout,profile } from "./Login&signUp.ts";
import { loginCheck } from "./auth.ts";
const Authrouter=express.Router()
Authrouter.post('/signup',signup)
Authrouter.post('/login',login)
Authrouter.get('/profile',loginCheck,profile)
Authrouter.post('/logout',logout)
export {Authrouter}