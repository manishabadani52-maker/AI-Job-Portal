import User from '../models/User.js'
import JobApplication from '../models/jobApplication.js'
import {v2 as cloudinary} from 'cloudinary'
import Job from '../models/job.js'
import { getAuth } from '@clerk/express'


export const getUserData=async(req,res)=>{
   //console.log("AUTH:", getAuth(req))
   // console.log("AUTHORIZATION:", req.headers.authorization)
    const {userId}=getAuth(req)
    console.log(userId)
    try{
        const userData=await User.findById(userId)
       
        if(!userData){
           return  res.json({success:false, message:'User not found'})
        }
        return res.json({success:true, userData})

    }catch(error){
      return  res.json({success:false, message:error.message})
    }
}

export const applyForJob=async(req,res)=>{
  const {jobId}=req.body
  const {userId}=req.auth()
  try{
    console.log("USER ID:", userId);
    console.log("JOB ID:", jobId);

   const isAlreadyApplied=await JobApplication.find({jobId, userId})
   if(isAlreadyApplied.length>0){
    return res.json({success:false,message:"Already applied"})
   }
   const jobData=await Job.findById(jobId)
   if(!jobData){
    return res.json({success:false, message:'Job not found'})
   }
   console.log({
    companyId: jobData.companyId,
    userId,
    jobId: jobId
})
   await JobApplication.create({
    companyId:jobData.companyId,
    userId:userId,
    jobId,
    date:Date.now()
   })
   res.json({success:true, message:'Applied successfully'})

  }catch(error){
    res.json({success:false, message:error.message})
  } 
}

export const getUserJobApplicants=async(req,res)=>{ 
  try{

    const {userId}=req.auth()
    //console.log("APPLICATION USER ID:", userId)
    const jobApplicationData= await JobApplication.find({userId}).populate('companyId','name email image').populate('jobId','title description location catagory level salary').exec()
    if(jobApplicationData.length===0){
        return res.json({success:false, message:'No applied Jobs'})
    }
    return res.json({success:true, jobApplicationData})
    }catch(error){
    return res.json({success:false, message:error.message})
  }   
}

export const updateResume=async(req,res)=>{
   try {
    //console.log('AUTH:',req.auth)
    //console.log('Authoriztion:',req.headers.authorization)
    const {userId}=getAuth(req) 
    //console.log("USER ID:", userId) 
    const resumeFile=req.file
    //console.log("FILE:", resumeFile)
    const userData=await User.findById(userId)
    //console.log("USER DATA:", userData)
    if(!userData){
      return res.json({success:false, message:'User not found'})
    }
    if(resumeFile){
        const resumeUpload=await cloudinary.uploader.upload(resumeFile.path)
        userData.resume=resumeUpload.secure_url

        await userData.save()

        res.json({success:true, message:'Resume updated'})

    }

  } catch (error) {
    res.json({success:false, message:error.message})
   } 
}