import React,{useContext,useState,useEffect} from 'react'
import {assets, viewApplicationsPageData} from '../assets/assets'
import {AppContext, AppContextProvider} from '../context/AppContext'
import axios from 'axios'
import {toast} from 'react-toastify'
import Loading from '../components/Loading'


const ViewApplication = () => {
  const {backendURL,companyToken}=useContext(AppContext)
  const[applicants,setApplicants]=useState([])
  const [loading, setLoading] = useState(true)

  //function to fetch company job application data
  const fetchCompanyJobApplications=async()=>{
    try {
      if(!companyToken){
        console.log('token not found')
        return 
      }
      const{data}= await axios.get(backendURL+'/api/company/applicants',{headers:{token:companyToken}})
      console.log("APPLICANTS RESPONSE:", data)
      if(data.success){
        //toast.success(data.message)
        setApplicants(data.jobApplicants)
        
      }else{
        toast.error(data.message)
        setApplicants([])
      }
    } catch (error) {
      toast.error(error.message)
      setApplicants([])
    }finally{
      setLoading(false)
    }
  }

  //function to update job application status
  const changeJobApplicationStatus=async(id,status)=>{
    try {
      const {data}=await axios.post(backendURL+'/api/company/change',{id,status},{headers:{token:companyToken}})

      if(data.success){
        fetchCompanyJobApplications()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }



  
  useEffect(()=>{
    fetchCompanyJobApplications()
  },[companyToken])

   if (loading) {
    return <Loading />
  }
   if (applicants.length === 0) {
    return (
     <div className='flex items-center justify-center h-[70vh]'><p className='text-xl sm:text-2xl'>No Applications found.</p></div>
    )
  }
   


  return (
    <div className='container mx-auto p-4'>
      <table className='w-full max-w-4xl bg-white border-gray-200 max-sm:text-sm '>
        <thead >
          <tr className='border-b'>
          <th className='py-2 px-4 text-left'>#</th>
          <th className='py-2 px-4 text-left'>Username</th>
          <th className='py-2 px-4 text-left max-sm:hidden'>Job Title</th>
          <th className='py-2 px-4 text-left max-sm:hidden'>Location</th>
          <th className='py-2 px-4 text-left'>Resume</th>
          <th className='py-2 px-4 text-left'>Action</th></tr>
        </thead>
        <tbody>
          {applicants.filter(item=>item.jobId && item.userId).map((application, index)=>(
            <tr key={index} className='text-gray-700'>
              <td>{index+1}</td>
            <td className='py-2 px-4 border-b flex text-center'><img className='w-10 h-10 rounded-full mr-3 max-sm:hidden' src={application.userId.image} alt="" /><span>{application.userId.name}</span></td>
            <td className='py-2 px-4 border-b max-sm:hidden'>{application.jobId.title}</td>
            <td className='py-2 px-4 border-b max-sm:hidden'>{application.jobId.location}</td>
            <td className='py-2 px-4 border-b'>
              <a href={application.userId.resume} className='bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex gap-2 items-center' target='_blank'>Resume <img src={assets.resume_download_icon} alt="" /></a>
            </td>
            <td className='py-2 px-4 border-b relative'>
              {application.status==='Pending'? <div className='relative inline-block text-left group'>
                <button className='text-gray-500 action-button' >...</button>
                <div className='z-10 hidden absolute right-0 md:left-0 top-0 mt-2 w-32 big-white border border-gray-200 rounded shadow group-hover:block'>
                  <button onClick={()=>changeJobApplicationStatus(application._id,'Accepted')} className='block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100'>Accept</button>
                  <button onClick={()=>changeJobApplicationStatus(application._id,'Rejected')}  className='block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100'>Reject</button>
                </div>
              </div>
              :<div>{application.status}</div>
              }
             
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ViewApplication