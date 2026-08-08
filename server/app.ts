import express from 'express';
import cors from 'cors';
import helmet from'helmet';
import { api } from './api/api.ts';
import cookieParser from 'cookie-parser';
const app=express()
app.use(cookieParser())
app.use(helmet({contentSecurityPolicy:false}))
app.use(express.json())
app.use(cors({
    origin:'http://localhost:3000',
     credentials:true,
     methods:["GET","POST","PUT","DELETE"]
}))
app.use('/v1',api)
export default app