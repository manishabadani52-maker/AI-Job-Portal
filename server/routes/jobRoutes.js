import express from 'express'
import {getJobs,getJobById} from '../controller/JobController.js'


const router=express.Router()

//Route to get all jobs data
router.get('/',getJobs)


//route to get single job by id
router.get('/:id',getJobById)

export default router