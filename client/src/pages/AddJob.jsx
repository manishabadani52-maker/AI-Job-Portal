import React,{useState, useEffect, useRef,useContext} from 'react'
import{JobCategories, JobLocations} from '../assets/assets'
import quill from 'quill'
import {AppContext} from '../context/AppContext'
import {toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'



const AddJob = () => {
  const[title, setTitle]=useState('')
  const[location, setLocation]=useState('Banglore')
  const[salary, setSalary]=useState(0)
  const[category, setCategory]=useState('Programming')
  const[level, setLevel]=useState('Beginner Level')
  const editorRef=useRef(null)
  const quillRef=useRef(null)
  const {backendURL, companyToken}=useContext(AppContext)
  const navigate=useNavigate()
  
  const onSubmitHandler=async(e)=>{
      e.preventDefault()
      try {
        const description=quillRef.current.root.innerHTML
      const {data}=await axios.post(backendURL+'/api/company/post-job',{title, description,location,level,salary,category},{headers:{token:companyToken}})
      if(data.success){
        toast.success('Job added successfully!')
        setTitle('')
        setSalary(0)
        quillRef.current.root.innerHTML=''
        //navigate('/dashboard')
      }else{
        toast.error(data.message)
      }
        
      } catch (error) {
        toast.error(error.message)
      }

  }
  useEffect(()=>{
    //Initiate quill only once
    if(!quillRef.current && editorRef.current){
      quillRef.current=new quill(editorRef.current, {
        theme:'snow'
      })
    }
  },[])



  return(
    <form onSubmit={onSubmitHandler} action="" className='container p-4  flex flex-col w-full items-start gap-3'>
      <div className='w-full'>
        <p className='mb-2'>Job Title</p>
        <input type="text" placeholder='Type here' value={title}onChange={e=>setTitle(e.target.value)} required className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded'/>
      </div>
      <div className='w-full max-w-lg'>
        <p className='my-2'>Job Description</p>
        <div ref={editorRef}>

        </div>
        
      </div>
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8 '>
        <span>
          <p className='mb-2'>Job Category</p>
          <select className='w-full px-3 py-2 border-2  border-gray-300 rounded'  onChange={e=>setCategory(e.target.value)} value={category}>
            {JobCategories.map((category,index)=>(
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </span>
        <span>
          <p className='mb-2'>Job Location</p>
          <select className='w-full px-3 py-2 border-2  border-gray-300 rounded' onChange={e=>setLocation(e.target.value)} value={location} name="" id="">{JobLocations.map((location, index)=>(
            <option value={location} key={index}>{location}</option>
          ))}
          </select>
        </span>
        <span>
          <p className='mb-2'>Job Level</p>
          <select className='w-full px-3 py-2 border-2  border-gray-300 rounded'  onChange={e=>setLevel(e.target.value)} name="" id="">
            <option value="senior">Senior Level</option>
            <option value="intermediate">Intermediate Level</option>
            <option value="beginner">Beginner Level</option>
          </select>
        </span>
      </div>
      <div>
        <p className='mb-2'>Job Salary</p>
        <input min={0} className='w-full px-3 py-2 border-2 b-rder-gray-300 rounded sm:w-[120px]' type="Number" placeholder='2500' onChange={e=>setSalary(e.target.value)} value={salary} />
      </div>
      <button className='w-28 py-3 mt-4 bg-black text-white rounded'>ADD</button>

    </form>
  )
}

export default AddJob