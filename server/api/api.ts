import express from 'express'
const api= express.Router()
import {Authrouter} from '../services/auth/login&signup.router.ts'
import { Profilerouter } from '../services/profile/profileRouter.ts'
api.use('/api/auth',Authrouter)
api.use('/api/profile',Profilerouter)
export {api}