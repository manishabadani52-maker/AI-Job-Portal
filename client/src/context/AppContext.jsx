import { createContext, useState, useEffect } from 'react';
import {jobsData} from '../assets/assets'
import {toast} from 'react-toastify'
import axios from 'axios'
import{useUser,useAuth} from "@clerk/react"



export const AppContext= createContext();

export const AppContextProvider= (props)=>{
const[searchFilter, setSearchFilter]=useState({
    title:'',
    location:''
})
const[isSearched, setIsSearched]=useState(false)   
const[jobs, setJobs]=useState([])
const[showRecruiterLogin, setShowRecruiterLogin]=useState(false)

const[companyToken, setCompanyToken]=useState(null)
const[companyData,setCompanyData]=useState(null)
const[userData,setUserData]=useState(null)
const[userApplication,setUserApplication]=useState([])

const backendURL=import.meta.env.VITE_BACKEND_URL

const{user,isLoaded,isSignedIn}=useUser()
const{getToken}=useAuth()

//function to fetch job data
const fetchJobs=async()=>{
   //setJobs(jobsData)
   try {
    const {data}=await axios.get(backendURL+'/api/jobs')
    if(data.success){
        setJobs(data.jobs)
        console.log(data.jobs)
    }else{
        toast.error(data.message)
    }
   } catch (error) {
     toast.error(error.message)
   }
}


const fetchCompanyData=async ()=>{
    try{
        const {data}=await axios.get(backendURL+'/api/company/company',{headers:{token:companyToken}})
        if(data.success){
            setCompanyData(data.company)
            //console.log(data)
        }else{
            toast.error(data.message)
        }
    }catch(error){
        toast.error(error.message)
    }
}

//function to fetch user data
const fetchUserData=async()=>{
    try {
        const token =await getToken()
        //console.log("clerk token:",token)
        if(!token){
            console.log('Token not found')
            return 
        }
        const {data}=await axios.get(backendURL+'/api/users/user',{headers:{Authorization:`Bearer ${token}`}})
        if(data.success){
            setUserData(data.userData)
            console.log("USER DATA:", data)
        }else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
}


//function to fetch user's applied jobs
const fetchUserApplicationData=async()=>{
   try {
     const token =await getToken()
        console.log("clerk token:",token)
        if(!token){
            console.log('Token not found')
            return 
        }
        const {data}= await axios.get(backendURL+'/api/users/applications',{headers:{Authorization: `Bearer ${token}`}})
        console.log("APPLICATION RESPONSE:", data)
        if(data.success){
            setUserApplication(data.jobApplicationData||[])
        }else{
            setUserApplication([])
            toast.error(data.message)
        }
          
    
   } catch (error) {
    setUserApplication([])
    toast.error(error.message)
   }
}
useEffect(()=>{
    fetchJobs()

    const storedCompanyToken=localStorage.getItem('companyToken')
    if(storedCompanyToken){
        setCompanyToken(storedCompanyToken)
    }
},[])
useEffect(()=>{
    if(isLoaded && isSignedIn){
         fetchUserData()
         fetchUserApplicationData()
    }
   
},[isLoaded, isSignedIn])
useEffect(()=>{
    if(companyToken){
        fetchCompanyData()
    }
},[companyToken])

    const value={
          searchFilter, setSearchFilter, isSearched, setIsSearched, jobs, setJobs, showRecruiterLogin, setShowRecruiterLogin,companyToken, setCompanyToken,companyData,setCompanyData,backendURL,userData,setUserData,userApplication,setUserApplication,fetchUserData,fetchUserApplicationData
    }
    return(<AppContext.Provider value={value}>
           {props.children}
    </AppContext.Provider>)
}
