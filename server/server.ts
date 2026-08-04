import { pool } from './services/db/db.ts';
import app from "./app";
import https from 'https';
import path from 'path';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
import fs from 'fs';
await pool.connect()
.then(()=>console.log('connected to postgresssql'))
.catch((err)=> console.log(err))
const PORT=process.env.PORT|| 8080;
const server =https.createServer({
    key:fs.readFileSync(path.join(__dirname,'./certs', 'key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'./certs', 'cert.pem'))
},app)
server.listen(PORT,()=>{
    console.log(PORT)
})