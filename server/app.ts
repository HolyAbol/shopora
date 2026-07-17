import express from 'express'
import cookieparser from "cookie-parser"
import cors from 'cors'
import passport from 'passport-jwt'
import helmet from'helmet';
import { api } from './api/api.ts'
import cookieParser from 'cookie-parser';
const app=express()
app.use(cookieParser())
app.use(helmet())
app.use(express.json())
app.use(cookieparser())
app.use(cors({
    origin:'http://localhost:3000'
}))
app.use('/v1',api)
export default app