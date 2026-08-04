import app from "../../app.ts";
import request from "supertest"
import { pool } from "../db/db.ts";
import '../../config/env.ts'
describe("signup functionality",()=>{
    beforeAll(async()=>{
        await pool.query("SELECT 1")
.then(()=>console.log('connected to postgresssql'))
.catch((err:unknown)=> console.log(err))
    })
    const creds ={
        userName:"test1",
        userPass:"1234",
        userEmail:"niggerballs@gmail.com",
        userPhoneNumber:"09334244564"
    }
    const response ={
        message:"success"
    }
    afterEach(async()=>{
        await pool.query("DELETE FROM users WHERE username =$1 OR email=$2 or phone_number=$3",
            [creds.userName,creds.userEmail,creds.userPhoneNumber]
        )
    })
    afterAll(async()=>{
        await pool.end()
    })
test("a 200 respond is expected",async()=>{
    const res = await request(app).post("/v1/api/auth/signup")
    .send(creds)
    .expect(200)
    .expect('Content-Type',/json/)
    expect(res.body).toMatchObject(response)
})
test("a 409 respond is expected bc field=userName is duplicate", async () => {
     await request(app).post("/v1/api/auth/signup").send(creds)
    const res = await request(app).post("/v1/api/auth/signup")
        .send({
            ...creds,
            userEmail: "different@gmail.com",
            userPhoneNumber: "09000000000"
        })
        .expect(409)
        .expect('Content-Type', /json/)

    expect(res.body.field).toBe('userName')
})
test("a 409 respond is expected bc field=userEmail is duplicate", async () => {
    await request(app).post("/v1/api/auth/signup").send(creds)
    const res = await request(app).post("/v1/api/auth/signup")
        .send({
            ...creds,
            userName: "diffrentdude",
            userPhoneNumber: "09000000000"
        })
        .expect(409)
        .expect('Content-Type', /json/)

    expect(res.body.field).toBe('userEmail')
})
test("a 409 respond is expected bc field=userPhoneNumber is duplicate", async () => {
    await request(app).post("/v1/api/auth/signup").send(creds)
    const res = await request(app).post("/v1/api/auth/signup")
        .send({
            ...creds,
            userName: "diffrentdude",
            userEmail:"diffrent@gmail.com"
        })
        .expect(409)
        .expect('Content-Type', /json/)

    expect(res.body.field).toBe('userPhoneNumber')
})
})