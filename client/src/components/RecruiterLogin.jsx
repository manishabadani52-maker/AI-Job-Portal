import React,{useState, useContext, useEffect} from 'react'
import{assets} from '../assets/assets'
import {AppContext} from '../context/AppContext'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'

const RecruiterLogin = () => {
    const[state, setState]=useState('Login')
    const[name, setName]=useState('')
    const[password, setPassword]=useState('')
    const[email, setEmail]=useState('')

    const[image, setImage]=useState(false)
    const[isTextDataSubmitted, setIsTextDataSubmitted]=useState(false)
    const {setShowRecruiterLogin, backendURL,setCompanyToken, setCompanyData}=useContext(AppContext)
    const navigate=useNavigate()
    useEffect(()=>{
     document.body.style.overflow='hidden'
     return ()=>{
        document.body.style.overflow='unset'
     }
    },[])
    const onSubmitHandler= async(e)=>{
        e.preventDefault()
        if(state==='Signup' && !isTextDataSubmitted)
         return setIsTextDataSubmitted(true)
    
    try {
        if(state==='Login'){
            const {data}=await axios.post(backendURL+'/api/company/login',{email,password})
            if(data.success){
                //console.log(data)
                setCompanyData(data.company)
                setCompanyToken(data.token)
                localStorage.setItem('companyToken', data.token)
                setShowRecruiterLogin(false)
                navigate('/dashboard')
            }else{
                toast.error(data.message)  
            }
        }else{
            const formData=new FormData()
            formData.append('name', name)
            formData.append('password',password)
            formData.append('email',email)
            formData.append('image',image)
            const {data}=await axios.post(backendURL+'/api/company/register',formData)

            if(data.success){ 
                //console.log(data)
                setCompanyData(data.company)
                setCompanyToken(data.token)
                localStorage.setItem('companyToken', data.token)
                setShowRecruiterLogin(false)
                navigate('/dashboard')
            }else{
                toast.error(data.message)  
            }

            

        }
    }catch (error) {
        toast.error(error.message)
    }}
    
  return (
    <div className ='absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center '>
        <form className='relative bg-white p-10  rounded-xl text-slate-500' onSubmit={onSubmitHandler} action="">
            <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
            <p className='text-small'>Welcome back! Please sign in to continue</p>

            {state==='Signup'&& isTextDataSubmitted ?<>
            <div className='flex items-center gap-4 my-10'>
                <label htmlFor="image">
                    <img className='w-16 rounded-full'src={image? URL.createObjectURL(image): assets.upload_area} alt="" />
                    <input onChange={e=>setImage(e.target.files[0])} type="file" id='image' hidden />

                </label>
                <p>Upload Company<br />logo</p> 
            </div>
            </>:
            
        <>
            {state!=='Login' && (
                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.person_icon} alt="" />
                <input className='outline-none text-sm' onChange={e=>setName(e.target.value)} value={name} type="text" placeholder='Company Name' required/>
            </div>

            ) }
            
             <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.email_icon} alt="" />
                <input className='outline-none text-sm' onChange={e=>setEmail(e.target.value)} value={email} type="text" placeholder='Email Id' required/>
            </div>
              

            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.lock_icon} alt="" />
                <input className='outline-none text-sm' type="text" placeholder='password' onChange={e=>setPassword(e.target.value)} value={password} required />
            </div>
            
            </>
}         
           {state==='Login' && <p className='text-sm text-blue-600 mt-4 cursor-pointer'>Forgot Password?</p> }
            
            
            <button type='submit' className='bg-blue-600 w-full text-white py-2 mt-5 rounded-full'>
                {state==='Login'? 'Login': isTextDataSubmitted?'Create Account': 'Next'}
            </button>
            {
                state==='Login'? 

                <p className='mt-5 text-center'>
                Don't have an Account? <span className='text-blue-600 cursor-pointer' onClick={()=>setState("Signup")}>Sign Up</span>
                </p>:
            
            
            <p className='mt-5 text-center'>Already have an account?<span className='text-blue-600 cursor-pointer' onClick={()=>setState('Login')}>Login</span></p>
            }
           <img src={assets.cross_icon} className='absolute top-5 right-5 cursor-pointer' onClick={e=>setShowRecruiterLogin(false)} alt="" />
            
        </form>
    </div>
  )
}

export default RecruiterLogin