import express from 'express'
import {getUserData, getUserJobApplicants, updateResume,applyForJob} from '../controller/userController.js'
import upload from '../config/multer.js'
//import { ClerkExpressRequireAuth } from '@clerk/express'

const router=express.Router()


router.get('/user',getUserData)
router.post('/apply',applyForJob)
router.get('/applications',getUserJobApplicants)
router.post('/update-resume',upload.single('resume'),updateResume)

export default router