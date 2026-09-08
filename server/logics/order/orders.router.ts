import express from 'express';
import { createOrder, getOrders, getOrdersById } from './orders.controller.ts';
import { loginCheck } from '../../services/auth/auth.middleware';
const ordersRouter = express.Router();
ordersRouter.post('/create-order', loginCheck, createOrder);
ordersRouter.get('/get-orders', loginCheck, getOrders);
ordersRouter.get('/get-order/:order_id', loginCheck, getOrdersById);
export { ordersRouter };
