
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';

const ScoreRing = ({ score = 0 }) => {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
    const offset = circumference - (safeScore / 100) * circumference;

    const color =
        safeScore >= 75 ? '#16a34a' :
        safeScore >= 50 ? '#d97706' : '#dc2626';

    return (
        <div className="flex items-center justify-center">
            <svg width="125" height="125" viewBox="0 0 125 125">
                <circle
                    cx="62.5"
                    cy="62.5"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                />
                <circle
                    cx="62.5"
                    cy="62.5"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 62.5 62.5)"
                />
                <text
                    x="62.5"
                    y="59"
                    textAnchor="middle"
                    fontSize="25"
                    fontWeight="600"
                    fill={color}
                >
                    {safeScore}%
                </text>
                <text
                    x="62.5"
                    y="77"
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                >
                    Match
                </text>
            </svg>
        </div>
    );
};

const SectionTitle = ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {children}
    </h2>
);

const InfoSection = ({ title, children }) => (
    <section className="mb-10">
        <SectionTitle>{title}</SectionTitle>
        {children}
    </section>
);

const getImportanceStyle = (importance) => {
    const styles = {
        High: 'bg-green-100 text-green-700',
        Critical: 'bg-red-100 text-red-700',
        Important: 'bg-orange-100 text-orange-700',
        Medium: 'bg-blue-100 text-blue-700',
        Low: 'bg-gray-100 text-gray-600',
        Preferred: 'bg-purple-100 text-purple-700',
    };

    return styles[importance] || 'bg-gray-100 text-gray-600';
};

const AIAnalysis = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { backendURL, userData, userApplication } = useContext(AppContext);
    const { isSignedIn, isLoaded } = useUser();
    const { getToken } = useAuth();

    const requestStarted = useRef(false);

    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

    useEffect(() => {
        const alreadyApplied = (userApplication || []).some(
            app => app.jobId?._id === id
        );

        setIsAlreadyApplied(alreadyApplied);
    }, [userApplication, id]);

    useEffect(() => {
        if (!isLoaded || requestStarted.current) return;

        if (!isSignedIn) {
            toast.error('Please log in to use AI resume analysis.');
            navigate('/');
            return;
        }

        if (!userData) return;

        if (!userData.resume || !userData.resume.trim()) {
            toast.error('Please upload your resume first.');
            navigate('/application');
            return;
        }

        if (!id) {
            toast.error('Job information is missing.');
            navigate(-1);
            return;
        }

        const fetchAnalysis = async () => {
            requestStarted.current = true;
            setIsAnalyzing(true);

            try {
                const token = await getToken();

                const { data } = await axios.post(
                    `${backendURL}/api/ai/analyze-resume/${id}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (data.success) {
                    setAnalysis(data.analysis);
                    setJobTitle(data.jobTitle || '');
                    setCompanyName(data.companyName || '');
                } else {
                    toast.error(data.message || 'Unable to analyze your resume.');
                    navigate(-1);
                }
            } catch (error) {
                console.error('Resume analysis error:', error);
                toast.error(
                    error.response?.data?.message ||
                    'Could not connect to the AI service. Please try again.'
                );
                navigate(-1);
            } finally {
                setIsAnalyzing(false);
            }
        };

        fetchAnalysis();
    }, [isLoaded, isSignedIn, userData, id, backendURL, getToken, navigate]);

    const applyHandler = async () => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            toast.error('Please log in to apply for this job.');
            return;
        }

        if (isAlreadyApplied) {
            toast.info('You have already applied for this job.');
            return;
        }

        if (!userData?.resume) {
            toast.error('Please upload your resume before applying.');
            navigate('/application');
            return;
        }

        try {
            const token = await getToken();

            const { data } = await axios.post(
                `${backendURL}/api/users/apply`,
                { jobId: id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                toast.success(data.message);
                setIsAlreadyApplied(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const recommendation = analysis?.recommendation;

    const recommendationStyle =
        recommendation === 'APPLY'
            ? 'border-green-500 bg-green-50'
            : recommendation === 'IMPROVE RESUME FIRST'
                ? 'border-amber-400 bg-amber-50'
                : 'border-red-400 bg-red-50';

    if (!isLoaded || isAnalyzing) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 2xl:px-20 py-16 min-h-[60vh]">
                    <Loading />
                    <p className="text-center text-gray-600 mt-4">
                        Analyzing your resume. This may take a few seconds...
                    </p>
                </div>
                <Footer />
            </>
        );
    }

    if (!analysis) return null;

    return (
        <>
            <Navbar />

            <main className="container mx-auto px-4 2xl:px-20 py-10">

                {/* Page heading */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                            Resume Analysis
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {jobTitle} {companyName && `at ${companyName}`}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="border border-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-50 transition w-fit"
                    >
                        Back to Job
                    </button>
                </div>

                {/* Match overview */}
                <div className="border border-gray-200 rounded-lg p-5 sm:p-7 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <ScoreRing score={analysis.compatibilityScore} />

                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm mb-3">
                                {analysis.matchLevel}
                            </span>

                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Overall Match Summary
                            </h2>

                            <p className="text-gray-600 leading-7">
                                {analysis.summary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <InfoSection title="Matching Skills">
                    {analysis.matchingSkills?.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                            {analysis.matchingSkills.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4"
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {item.skill}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.reason}
                                        </p>
                                    </div>

                                    <span className={`text-xs px-3 py-1 rounded w-fit ${getImportanceStyle(item.importance)}`}>
                                        {item.importance}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No matching skills were identified.</p>
                    )}
                </InfoSection>

                {/* Missing skills */}
                <InfoSection title="Missing Skills & Keywords">
                    {analysis.missingSkills?.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                            {analysis.missingSkills.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4"
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {item.skill}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.reason}
                                        </p>
                                    </div>

                                    <span className={`text-xs px-3 py-1 rounded w-fit ${getImportanceStyle(item.importance)}`}>
                                        {item.importance}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No major missing skills were identified.</p>
                    )}
                </InfoSection>

                {/* Project relevance */}
                {analysis.projectAnalysis?.length > 0 && (
                    <InfoSection title="Project Relevance">
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                            {analysis.projectAnalysis.map((project, index) => (
                                <div key={index} className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                        <h3 className="font-medium text-gray-900">
                                            {project.projectName}
                                        </h3>

                                        <span className={`text-xs px-3 py-1 rounded w-fit ${getImportanceStyle(project.relevance)}`}>
                                            {project.relevance} Relevance
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mt-2 leading-6">
                                        {project.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </InfoSection>
                )}

                {/* Experience */}
                {analysis.experienceAnalysis && (
                    <InfoSection title="Experience & Qualifications">
                        <div className="border border-gray-200 rounded-lg p-5">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="font-medium text-gray-800">
                                    Overall Qualification Match:
                                </span>

                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm">
                                    {analysis.experienceAnalysis.match}
                                </span>
                            </div>

                            <p className="text-gray-600 leading-7">
                                {analysis.experienceAnalysis.details}
                            </p>
                        </div>
                    </InfoSection>
                )}

                {/* Improvement suggestions */}
                {analysis.resumeImprovements?.length > 0 && (
                    <InfoSection title="Resume Improvement Tips">
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                            {analysis.resumeImprovements.map((tip, index) => (
                                <div key={index} className="flex gap-4 p-4">
                                    <span className="text-blue-600 font-semibold">
                                        {index + 1}.
                                    </span>
                                    <p className="text-gray-700 leading-6">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </InfoSection>
                )}

                {/* Recommendation */}
                <section className={`border-l-4 ${recommendationStyle} rounded-r-lg p-5 sm:p-6 mb-10`}>
                    <p className="text-sm text-gray-600 mb-2">
                        AI Recommendation
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {analysis.recommendation}
                    </h2>

                    <p className="text-gray-700 leading-7">
                        {analysis.recommendationReason}
                    </p>

                    <p className="text-xs text-gray-500 mt-4">
                        This is an AI-generated suggestion based on your resume and the job description. The final decision is yours.
                    </p>
                </section>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-3">
                    <button
                        onClick={applyHandler}
                        disabled={isAlreadyApplied}
                        className={`px-8 py-3 rounded text-white transition ${
                            isAlreadyApplied
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="border border-gray-300 text-gray-700 px-8 py-3 rounded hover:bg-gray-50"
                    >
                        Back to Job
                    </button>
                </div>

            </main>

            <Footer />
        </>
    );
};

export default AIAnalysis;
