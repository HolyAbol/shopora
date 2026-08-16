import express from 'express'
const api= express.Router()
import { Authrouter } from '../services/auth/auth.router.ts'
import { Profilerouter } from '../services/profile/profileRouter.ts'
import { manufacturerRouter } from '../logics/manufacture/manufacturers.router.ts'
import { categoriesRouter } from '../logics/category/categories.router.ts'
import swaggerDocs from '../swagger.ts';
api.use('/api/auth',Authrouter)
api.use('/api/profiles',Profilerouter)
api.use('/api/manus',manufacturerRouter)
api.use('/api/cats',categoriesRouter)
api.use('/api/docs',swaggerDocs)
export {api}