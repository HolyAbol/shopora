import swaggerUiExpress from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { glob } from 'glob';
const options: swaggerJsDoc.Options = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:'Shopora',
            version:'1.0.0',
        },
        servers:[{url:'https://localhost:8080'}], 
    },
    apis:['server/services/**/*.ts']
}
const swaggerspec = swaggerJSDoc(options)
const swaggerDocs=express.Router()
swaggerDocs.use('/',swaggerUi.serve,swaggerUi.setup(swaggerspec))
console.log(glob.sync('server/services/auth/auth.router.ts'))
export default swaggerDocs;