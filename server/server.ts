import dotenv from 'dotenv'
dotenv.config()
import { pool } from './services/db.ts';
import app from "./app";
import https from 'https';
import path from 'path';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
import fs from 'fs';
pool.connect()
.then(()=>console.log('connected to postgresssql'))
.catch((err:any)=> console.log(err))
const PORT=process.env.PORT|| 8080;
const server =https.createServer({
    key:fs.readFileSync(path.join(__dirname,'./certs', 'key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'./certs', 'cert.pem'))
},app)
server.listen(PORT,()=>{
    console.log(PORT)
})