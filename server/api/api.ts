import express from 'express'
const api= express.Router()
import {Authrouter} from '../services/auth/auth.router.ts'
import { Profilerouter } from '../services/profile/profileRouter.ts'
import swaggerDocs from '../swagger.ts';
api.use('/api/auth',Authrouter)
api.use('/api/profile',Profilerouter)
api.use('/api/docs',swaggerDocs)
export {api}