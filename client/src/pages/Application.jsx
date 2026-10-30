import React,{useState, useContext,useEffect}  from 'react'
import Navbar from '../components/Navbar'
import {assets, jobsApplied} from '../assets/assets'
import moment from 'moment'
import {AppContext, AppContextProvider} from '../context/AppContext'
import{useUser,useAuth} from "@clerk/react"
import axios from 'axios'
import { toast } from 'react-toastify'


const Application = () => {
  const {user}=useUser()
  const {getToken}=useAuth()
  const[isEdit, setIsEdit]=useState(false)
  const[resume,setResume]=useState(null)
  const{backendURL,userData,userApplication,fetchUserData,fetchUserApplicationData}=useContext(AppContext)


  const updateResume=async()=>{
     try {
      const formData=new FormData()
      formData.append('resume',resume)

      const token=await getToken()
      console.log("CLERK TOKEN:",token)

      const {data}=await axios.post(backendURL+'/api/users/update-resume',formData,{headers:{Authorization:`Bearer ${token}`}})

      if(data.success){
        await fetchUserData()
        toast.success(data.message)
        
      }else{
        toast.error(data.message)
      }
     } catch (error) {
      toast.error(error.message)
     }
     setIsEdit(false)
     setResume(null)
  } 


  useEffect(()=>{
    if(user){
     fetchUserApplicationData()
    }
     
  },[user])
  return (
    <>
    <Navbar />
    <div className='container px-4 min-h-[65v] 2xl:pxl-20 mx-auto my-1  '>
      <h2 className='text-xl font-semibold'>Your Resume</h2>
      <div className='flex gap-2 mb-6 mt-3' >
         {
          isEdit || userData && userData.resume===''?
          <>
          <label className='flex items-center 'htmlFor="resumeUpload">
            <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>{resume?resume.name:"Select Resume"}</p>
            <input id='resumeUpload' onChange={e=>setResume(e.target.files[0])} accept='application/pdf' type="file" />
            <img className='flex ' src={assets.profile_upload_icon} alt="" />
          </label>
          <button onClick={updateResume} className='bg-green-100 border border-green-400 rounded:lg px-4 py-2'>Save</button>
          </>:<div className='flex gap-2'>
            <a className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg  ' href={userData.resume} target='_blank'>Resume</a>
            <button className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2' onClick={()=>setIsEdit(true)}>Edit</button>
          </div>
         }
      </div>
       <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>
        <table className='min-w-full bg-white border rounded-lg'>
          <thead>
            <tr>
              <th className='py-3 px-4 border-b text-left'>Company</th>
              <th className='py-3 px-4 border-b text-left'>Job Title</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-3 px-5 border-b text-center max-sm:hidden'>Status</th>
            </tr>
          </thead>
           <tbody>
            {userApplication.map((job,index)=>(
              <tr key={index}>
                <td className='py-3 px-4 flex items-center gap-2 border-b'><img className='w-8 h-8' src={job.companyId.image} alt="" />
                {job.companyId.name}</td>
                <td className='py-2 px-4 border-b'>{job.jobId.title}</td>
                <td className='py-2 px-4 border-b'>{job.jobId.location}</td>
                <td className='py-2 px-4 border-b'>{moment(job.date).format('DD/MM/YYYY')}</td>
                <td className='py-2 px-4 w-8 border-b'>
                  <span className={`${job.status==='Accepted'? 'bg-green-100 text-green-700 ': job.status==='Rejected'? ' text-red-700 bg-red-100': 'bg-blue-100 text-blue-700'} py-1.5 flex justify-center  w-30 items-center rounded`}>{job.status}</span>
                  </td>
              </tr>
            ))}
            
            

           </tbody>
        </table>
       

          

    </div>
    </>
  )
}

export default Application