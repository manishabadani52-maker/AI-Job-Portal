import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import './config/instrument.js'
import * as Sentry from '@sentry/node'
import { clerkWebhooks } from './controller/webhooks.js'
import companyRoutes from './routes/companyRoutesTemp.js'
import cloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
// AI-GENERATED: Import the new AI analysis routes
import aiRoutes from './routes/aiRoutes.js'
import {clerkMiddleware} from '@clerk/express'



//Initial Express
const app=express()


//connect  to DB
await connectDB()
await cloudinary

//Middlewares
app.use(cors({
     origin: [
        'http://localhost:5173',
        'https://ai-job-portal-frontend-odn5.onrender.com'
    ],
    credentials: true
}))
app.use(express.json())
app.use(clerkMiddleware())


//routes
app.get('/',(req,res)=>res.send("API working"))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.post('/webhooks',clerkWebhooks)
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRoutes)
// AI-GENERATED: Mount the AI analysis routes at /api/ai
// All requests to /api/ai/... will be handled by aiRoutes.js
app.use('/api/ai', aiRoutes)


//port 
const PORT =process.env.PORT || 5000
Sentry.setupExpressErrorHandler(app)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})