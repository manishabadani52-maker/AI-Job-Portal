import Company from '../models/Company.js'
import bcrypt from 'bcrypt'
import cloudinary from '../config/cloudinary.js'
import generateToken from '../utils/generateToken.js'
import fs from 'fs'
import Job from '../models/job.js'
import JobApplication from '../models/jobApplication.js'




export const registerCompany=async(req,res)=>{
  const {name, email, password}=req.body
  const imageFile=req.file
  if(!name||!email||!password||!imageFile){
    return res.json({success:false, message:"Missing details"})
  }
  try{
    const companyExists=await Company.findOne({email})
    if(companyExists){
        return res.json({success:false, message:"Company already registered!"})
    }
    const salt=await bcrypt.genSalt(10)
    const hashPassword=await bcrypt.hash(password,salt) 
  
    const imageUpload=await cloudinary.uploader.upload(imageFile.path)
    fs.unlinkSync(imageFile.path)
    const company=await Company.create({
        name,
        email,
        password:hashPassword,
        image:imageUpload.secure_url
    })
    res.json({
        success:true,
        company:{
            _id:company._id,
            name:company.name,
            email:company.email,
            image:company.image,
            password:company.password
        },
        token: generateToken(company._id)
    })

  }catch(error){
      res.json({success:false, message:error.message})     
  }

}

export const loginCompany=async(req,res)=>{
  const{email, password}=req.body

  try{
    const company=await Company.findOne({email})
    if(!company){
      res.json({success:false, message:'Company not found'})
    }


    const isMatch=await bcrypt.compare(password, company.password)
    if(isMatch){
      res.json({success:true, company:{
            _id:company._id,
            name:company.name,
            email:company.email,
            image:company.image,
           // password:company.password
        },
        token: generateToken(company._id)
      })
    }
    else{
      res.json({success:false, message:'Invalid email or password'})
    }

  }catch(error){
     res.json({success:false,message:error.message})
  }  
}


export const getCompanyData=async(req,res)=>{
 try{
  const company=req.company
  res.json({success:true, company})
 }
catch(error){
  res.json({success:false,message:error.message})
}}


export const postJob=async(req,res)=>{
  const{title, description,location, salary,level, category}=req.body

  const companyId=req.company._id
  //console.log(companyId,{title, description,location, category, level, salary} )
 // if(!title||!description||!location||!category||!level||!salary){
   // res.json({success:false, message:'Incomplete details'})
  //}
  try{
     const newJob=new Job({
      title,
      description,
      location,
      salary,
      companyId,
      date:Date.now(),
      level,
      category
     })
     await newJob.save()
     res.json({success:true, newJob})
  }catch(error){
       res.json({success:false,message:error.message})
  } 
}


export const getCompanyPostedJobs=async(req,res)=>{
    const id=req.company._id
    try{
      const joblist=await Job.find({companyId:id}).populate('companyId','name email image')
      if(joblist.length===0){
        return res.json({success:false, message:'No job posted by this company'})
      }
      //(ToDo: adding no of applicants)
      const jobsData=await Promise.all(joblist.map(async(job)=>{
         const applicants=await JobApplication.find({jobId:job._id})
         return {...job.toObject(),applicants:applicants.length}
      }))

      res.json({success:true,jobsData})
    }catch(error){
      res.json({success:false,message:error.message})
    }
}


export const getCompanyJobApplicants=async(req,res)=>{
  try {
    const companyId=req.company._id
  const jobApplicants=await JobApplication.find({
    companyId
  }).populate('jobId','title location category level salary').populate('userId','name image resume').exec()
  if(!jobApplicants){
    return res.json({success:false, message:'No one registered'})
  }else{
    return res.json({success:true, jobApplicants})
  }
  } catch (error) {
    return res.json({success:false, message:error.message})
  }
  


  
}
export const changeJobApplicantsStatus=async(req,res)=>{
   
   try {
    const {id,status}=req.body
   //find job application data and update status
   await JobApplication.findOneAndUpdate({_id:id},{status})
   res.json({success:true, message:'Status changed'})
    
   } catch (error) {
    res.json({success:false,message:error.message})
   }


  
}
export const changeVisibility=async(req,res)=>{
   try {
    const {id}=req.body
    const companyId=req.company._id
    const job=await Job.findById(id)
    if(!job){
      return res.json({success:false, message:'Job not found'})
    }
    if (companyId.toString()!==job.companyId.toString()) {
      return res.json({
        success:false,
        message:'Not authorized'
      })
      
    }
    job.visible=!job.visible
    await job.save()
    res.json({success:true, job})
    
   } catch (error) {
    res.json({success:false,message:error.message})
   }

  
}






