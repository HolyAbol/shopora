import express from 'express'
import { createOrder } from './orders.controller.ts'
import { loginCheck } from '../../services/auth/auth.middleware'
const ordersRouter = express.Router()
ordersRouter.post('/create-order',loginCheck,createOrder)
export {ordersRouter}