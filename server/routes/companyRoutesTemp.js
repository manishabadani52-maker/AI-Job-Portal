import express from 'express'
import {registerCompany, loginCompany, postJob, getCompanyData,getCompanyJobApplicants,getCompanyPostedJobs, changeJobApplicantsStatus, changeVisibility} from '../controller/companyController.js'
import upload from '../config/multer.js'
import {protectCompany} from '../middleware/authMiddleware.js'



const router=express.Router()

router.post('/register',upload.single('image'),registerCompany)


router.post('/login', loginCompany)


router.post('/post-job',protectCompany,postJob)


router.get('/company',protectCompany,getCompanyData)

router.get('/applicants',protectCompany,getCompanyJobApplicants)

router.get('/list-jobs',protectCompany,getCompanyPostedJobs)

router.post('/change', protectCompany,changeJobApplicantsStatus)

router.post('/change-visibility',protectCompany,changeVisibility)

export default router