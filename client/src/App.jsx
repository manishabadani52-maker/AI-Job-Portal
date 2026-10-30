import React,{useContext} from 'react';
import {Route, Routes} from 'react-router-dom'
import Application from './pages/Application'
import ApplyJob from './pages/ApplyJob'
import Home from './pages/Home'
import {AppContext} from './context/AppContext'
import RecruiterLogin from './components/RecruiterLogin'
import ManageJob from './pages/ManageJob'
import AddJob from './pages/AddJob'
import Dashboard from './pages/Dashboard'
import ViewApplication from './pages/ViewApplication'
import 'quill/dist/quill.snow.css'
import 'react-toastify/dist/ReactToastify.css'
import{ToastContainer} from  'react-toastify'
import AIAnalysis from './pages/AIAnalysis'


const App=()=>{
  const{showRecruiterLogin,companyToken}=useContext(AppContext)
  return(
  <div>
    {showRecruiterLogin && <RecruiterLogin />}
    <ToastContainer />
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/apply-job/:id' element={<ApplyJob />}/>
      <Route path='/application' element={<Application />}/>
      <Route path='/ai-analysis/:id' element={<AIAnalysis />} />
      <Route path='/dashboard' element={<Dashboard />}>
      {companyToken ? <>
        <Route path='add-job' element={<AddJob />} />
        <Route path='manage-job' element={<ManageJob />}/>
        <Route path='/ai-analysis/:id' element={<AIAnalysis />}/>
        <Route path='view-application' element={<ViewApplication />}/>
        </>:null
        }
     </Route>

    </Routes>
  </div>
  )
}
export default App