import { profile } from 'node:console';
import { loginCheck } from '../auth/auth.ts';
import { changePassword, changeUsername, getProfile } from './profile.ts';
import express from 'express';
const Profilerouter =express.Router()
Profilerouter.get("/me",loginCheck,getProfile)
Profilerouter.put("/changeUsername",loginCheck,changeUsername)
Profilerouter.put("/changepassword",loginCheck,changePassword)
export{Profilerouter}