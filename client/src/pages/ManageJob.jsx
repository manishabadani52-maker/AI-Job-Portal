import React,{useState,useContext,useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {assets, manageJobsData}  from '../assets/assets'
import moment from 'moment'
import {AppContext} from '../context/AppContext'
import {toast} from 'react-toastify'
import axios from 'axios'
import Loading from '../components/Loading'



const ManageJob = () => {
  //console.log("ManageJob rendered")
   const navigate=useNavigate()
   const [jobs,setJobs]=useState(false)
   const {backendURL,companyToken}=useContext(AppContext)
    //function to fetch company jobs application data
    const fetchCompanyJob=async()=>{
     // console.log("fetchCompanyJob called")
     // console.log("token:", companyToken)

      try {
        const {data}=await axios.get(backendURL+'/api/company/list-jobs',{headers:{token:companyToken}})
        if(data.success){
          setJobs(data.jobsData.reverse())
          console.log(data.jobsData)
        }else{
          toast.error(data.message)
        }
        
      } catch (error) {
        toast.error(error.message)
      }
        
    }

    //function to change job visibility
    const changeVisibility=async(id)=>{
      try{
        const{data}=await axios.post(backendURL+'/api/company/change-visibility',{id},{headers:{token:companyToken}})
      if(data.success){
        toast.success(data.message)
        fetchCompanyJob()
      }else{
        toast.error(data.message)
      }

      }catch(error){
        toast.error(error.message)
      }
      
    }
    useEffect(()=>{
   if(companyToken){
    fetchCompanyJob()
   }
    },[companyToken])
  


 return jobs?jobs.length===0?(<div className='flex items-center justify-center h-[70vh]'><p className='text-xl sm:text-2xl'>No jobs available or posted</p></div>):(
    <div className='container p-4 max-w-5xl'>
      <div className='overflow-x-auto'>
      <table className='min-w-full bg-white border border-gray-200 max-sm:text-sm'>
        <thead>
          <tr>
            <th className='py-2 px-4 border-b text-left max-sm:hidden'>#</th>
            <th className='py-2 px-4 border-b text-left'>Job Title</th>
            <th className='py-2 px-4 border-b text-left'>Date</th>
            <th className='py-2 px-4 border-b text-left max-sm:hidden'>Location</th>
            <th className='py-2 px-4 border-b text-center'>Applicants</th>
            <th className='py-2 px-4 border-b text-left'>Visible</th>
          </tr>
        </thead>
        <tbody>
          
            {jobs.map((job,index)=>(
              <tr className='text-gray-700' key={index}>
                <td className='py-2 px-4 border-b max-sm:hidden'>{index+1}</td>
                <td className='py-2 px-4 border-b'>{job.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('DD/MM/YYYY')}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{job.location}</td>
                <td className='py-2 px-4 border-b text-center'>{job.applicants}</td>
                <td className='py-2 px-4 border-b'><input className='scale-125 ml-4 ' type="checkbox" checked={job.visible} onChange={()=>changeVisibility(job._id)}/></td>
              </tr>
            ))}
        
        </tbody>
      </table>
      </div>
      <div className='mt-4 flex jusrtify-end'></div>
      <button className='bg-black text-white py-2 px-4 rounded ' onClick={e=>navigate('/dashboard/add-job')}>Add New Job</button>
    </div>
):<Loading />
}


export default ManageJob