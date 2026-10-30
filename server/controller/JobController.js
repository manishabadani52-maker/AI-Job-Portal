import Job from '../models/job.js'


//get all jobs 
export const getJobs=async(req,res)=>{
    try{
         const jobs=await Job.find({visible:true}).populate({path:'companyId', select:'-password'})
        return res.json({success:true,jobs})    
    }catch(error){
        return res.json({success:false,message:error.message})
    }  

}

//get a single job by id

export const getJobById=async(req,res)=>{
  try{
    const id=req.params.id
    const job=await Job.findById(id).populate({path:'companyId',select:'-password'})
    if(!job){
        res.json({success:false,message:'Job not found'})
    }else{
    res.json({success:true,job})}
  }catch(error){
    res.json({success:false, message:error.message})
  }
}