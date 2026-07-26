import app from "../../app.ts";
import request from "supertest"
import { pool } from "../db/db.ts";
describe("signup functionality",()=>{
    beforeAll(()=>{
        pool.connect()
    })
    const creds ={
        userName:"abolfazl",
        userPass:"1234",
        userEmail:"niggerballs@gmail.com",
        userPhoneNumber:"09334244564"
    }
    const response ={
        message:"success"
    }
test("a 200 respond is expected",async()=>{
    const res = await request(app).post("/v1/api/auth/signup")
    .send(creds)
    .expect(200)
    .expect('Content-Type',/json/)
    expect(res.body).toMatchObject(response)
})
})