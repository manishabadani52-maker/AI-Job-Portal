
import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import { assets } from '../assets/assets'
import Navbar from '../components/Navbar'
import kconvert from 'k-convert'
import moment from 'moment'
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useUser, useAuth } from '@clerk/react'
import ResumeAnalysisModal from '../components/ResumeAnalysisModal'

const ApplyJob = () => {

    const { id } = useParams()
    const [JobData, setJobData] = useState(null)

    const { jobs, backendURL, userData, userApplication } = useContext(AppContext)

    const navigate = useNavigate()
    const { isSignedIn, isLoaded } = useUser()
    const { getToken } = useAuth()

    const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)

    // Application assistant states
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
    const [hasResumeForApplication, setHasResumeForApplication] = useState(false)

    // Fetch selected job details
    const fetchJob = async () => {
        try {
            const { data } = await axios.get(backendURL + `/api/jobs/${id}`)

            if (data.success) {
                setJobData(data.job)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Existing application functionality
    const applyHandler = async () => {
        if (!isLoaded) return

        if (!isSignedIn) {
            return toast.error('Login to apply for job')
        }

        try {
            if (!userData) {
                return toast.error('Login to apply for job')
            }

            if (!userData.resume && !hasResumeForApplication) {
                navigate('/application')
                return toast.error('Upload resume to apply')
            }

            if (!JobData) return

            const token = await getToken()

            const { data } = await axios.post(
                backendURL + '/api/users/apply',
                { jobId: JobData._id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (data.success) {
                toast.success(data.message)
                setIsAlreadyApplied(true)
                setIsApplicationModalOpen(false)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Open application assistant when Apply Now is clicked
    const openApplicationAssistant = () => {
        if (!isLoaded) return

        if (!isSignedIn) {
            return toast.error('Login to apply for job')
        }

        if (isAlreadyApplied) {
            return toast.info('You have already applied for this job.')
        }

        setIsApplicationModalOpen(true)
    }

    // Navigate to the separate AI analysis page
    const analyzeResumeHandler = () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
        return toast.error('Please log in to use AI resume analysis.');
    }

    if (!userData) {
        return toast.error('Please log in to continue.');
    }

    if (!userData.resume || userData.resume.trim() === '') {
        toast.error('Please upload your resume first.');
        navigate('/application');
        return;
    }

    if (!JobData) {
        return toast.error('Job data is still loading.');
    }

    navigate(`/ai-analysis/${JobData._id}`);
};
    

    useEffect(() => {
        fetchJob()
    }, [id])

    // Check whether the candidate has already applied
    useEffect(() => {
        if (JobData && userApplication) {
            const alreadyApplied = userApplication.some(
                app => app.jobId?._id === JobData._id
            )

            setIsAlreadyApplied(alreadyApplied)
        }
    }, [JobData, userApplication])

    return JobData ? (
        <>
            <Navbar />

            <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>

                <div className='bg-white text-black rounded w-full'>

                    <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded'>

                        <div className='flex flex-col md:flex-row items-center'>

                            <img
                                className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border'
                                src={JobData.companyId.image}
                                alt=""
                            />

                            <div className='text-center md:text-left text-neutral-700'>
                                <h1 className='text-2xl sm:text-4xl medium'>
                                    {JobData.title}
                                </h1>

                                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gra-700 mt-2'>

                                    <span className='flex item-center gap-1'>
                                        <img src={assets.suitcase_icon} alt="" />
                                        {JobData.companyId.name}
                                    </span>

                                    <span className='flex item-center gap-1'>
                                        <img src={assets.location_icon} alt="" />
                                        {JobData.location}
                                    </span>

                                    <span className='flex item-center gap-1'>
                                        <img src={assets.person_icon} alt="" />
                                        {JobData.level}
                                    </span>

                                    <span className='flex item-center gap-1'>
                                        <img src={assets.money_icon} alt="" />
                                        CTC: {kconvert.convertTo(JobData.salary)}
                                    </span>

                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center'>
                            <button
                                className='bg-blue-600 p-2.5 px-10 text-white rounded'
                                onClick={openApplicationAssistant}
                            >
                                {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
                            </button>

                            <p className='mt-1 text-gray-600'>
                                Posted {moment(JobData.date).fromNow()}
                            </p>
                        </div>

                    </div>

                    <div className='flex flex-col lg:flex-row justify-between items-start'>

                        <div className='w-full lg:w-2/3'>

                            <h2 className='font-bold text-2x; mb-4'>
                                Job Description
                            </h2>

                            <div
                                className='job-description'
                                dangerouslySetInnerHTML={{
                                    __html: JobData.description
                                }}
                            ></div>

                            {/* Apply and AI Analysis buttons */}
                            <div className='flex flex-wrap gap-3 mt-10'>

                                <button
                                    className='bg-blue-600 p-2.5 px-10 text-white rounded'
                                    onClick={openApplicationAssistant}
                                >
                                    {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
                                </button>

                                {isSignedIn && (
                                    <button
                                        onClick={analyzeResumeHandler}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 px-6 rounded transition">
                                        <span>✨</span>
                                        Analyze Resume with AI
                                    </button>
                                )}

                            </div>
                        </div>

                        {/* More jobs from the same company */}
                        <div className='w-full lg:w-1/3 mt-8 lg:mt-8 space-y-5'>

                            <h2>
                                More jobs from {JobData.companyId.name}
                            </h2>

                            {jobs
                                .filter(job =>
                                    job._id !== JobData._id &&
                                    job.companyId._id === JobData.companyId._id
                                )
                                .filter(job => {
                                    const appliedJobsIds = new Set(
                                        userApplication.map(app =>
                                            app.jobId && app.jobId._id
                                        )
                                    )

                                    return !appliedJobsIds.has(job._id)
                                })
                                .slice(0, 4)
                                .map((job, index) => (
                                    <JobCard key={index} job={job} />
                                ))
                            }

                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Existing application assistant */}
            <ResumeAnalysisModal
                isOpen={isApplicationModalOpen}
                analysis={null}
                jobTitle={JobData.title}
                companyName={JobData.companyId?.name || ''}
                jobId={JobData._id}
                backendURL={backendURL}
                userData={userData}
                onResumeUploaded={() => setHasResumeForApplication(true)}
                getToken={getToken}
                onAnalysisComplete={() => {}}
                onClose={() => setIsApplicationModalOpen(false)}
                onApply={applyHandler}
                isAlreadyApplied={isAlreadyApplied}
            />

        </>
    ) : (
        <Loading />
    )
}

export default ApplyJob
