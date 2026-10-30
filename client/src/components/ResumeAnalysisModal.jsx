/**
 * AI-GENERATED: Application assistant. Opening this modal never submits an application.
 * Resume upload and optional AI analysis happen first; only the final submit button applies.
 */
import axios from 'axios';
import React, { useState } from 'react';

// AI-GENERATED: ScoreRing component — draws a circular SVG progress ring for the compatibility score.
// We use an SVG circle with a strokeDashoffset trick to create the arc fill.
// This is a pure CSS/SVG animation — no external charting library needed.
const ScoreRing = ({ score }) => {
    // SVG parameters for the ring
    const radius = 54;
    const circumference = 2 * Math.PI * radius; // Full circle perimeter

    // AI-GENERATED: Calculate how much of the circle to "fill" based on the score (0-100).
    // strokeDashoffset=0 means fully filled; circumference means empty.
    const offset = circumference - (score / 100) * circumference;

    // AI-GENERATED: Determine the ring color based on the score value.
    const ringColor =
        score >= 75 ? '#16a34a' :  // green-600 — excellent/good match
        score >= 50 ? '#d97706' :  // amber-600 — moderate match
        '#dc2626';                  // red-600 — low match

    return (
        <div className="flex flex-col items-center">
            {/* AI-GENERATED: The SVG container. viewBox is set so the circle is centered. */}
            <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Background track circle — light gray ring behind the progress ring */}
                <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                />
                {/* AI-GENERATED: Progress arc circle.
                    strokeDasharray sets the total dashes length = circumference (full circle).
                    strokeDashoffset controls how much of that circle is "invisible" (not drawn).
                    rotate(-90deg) starts the arc from the top of the circle (12 o'clock position). */}
                <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '70px 70px',
                        transition: 'stroke-dashoffset 1s ease-in-out',
                    }}
                />
                {/* Score text centered inside the ring */}
                <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="700" fill={ringColor}>
                    {score}%
                </text>
                <text x="70" y="83" textAnchor="middle" fontSize="11" fill="#6b7280">
                    Match Score
                </text>
            </svg>
        </div>
    );
};

// AI-GENERATED: Helper to get Tailwind color classes based on importance/relevance strings
// returned by Gemini (e.g., "High", "Critical", "Low").
const getImportanceStyle = (importance) => {
    const map = {
        'High': 'bg-green-100 text-green-700 border-green-200',
        'Critical': 'bg-red-100 text-red-700 border-red-200',
        'Important': 'bg-orange-100 text-orange-700 border-orange-200',
        'Medium': 'bg-blue-100 text-blue-700 border-blue-200',
        'Low': 'bg-gray-100 text-gray-600 border-gray-200',
        'Preferred': 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return map[importance] || 'bg-gray-100 text-gray-600 border-gray-200';
};

// AI-GENERATED: Helper to choose the recommendation card color
const getRecommendationStyle = (recommendation) => {
    if (recommendation === 'APPLY') return { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', icon: '✅' };
    if (recommendation === 'IMPROVE RESUME FIRST') return { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', icon: '⚠️' };
    return { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', icon: '❌' };
};

// AI-GENERATED: Helper to choose match level badge color
const getMatchLevelStyle = (matchLevel) => {
    if (matchLevel === 'Excellent Match') return 'bg-green-100 text-green-800';
    if (matchLevel === 'Good Match') return 'bg-blue-100 text-blue-800';
    if (matchLevel === 'Moderate Match') return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
};



const ResumeAnalysisModal = ({ isOpen, analysis, jobTitle, companyName, jobId, backendURL, userData, getToken, onResumeUploaded, onAnalysisComplete, onClose, onApply, isAlreadyApplied }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(userData?.resume || '');
    const [selectedFile, setSelectedFile] = useState(null);

    if (!isOpen) return null;

    // AI-GENERATED: Upload/replace the resume using the existing backend route.
    const handleResumeUpload = async () => {
        if (!selectedFile) return;
        const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!allowed.includes(selectedFile.type)) {
            window.alert('Please select a PDF or Word document.');
            return;
        }
        setIsUploading(true);
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('resume', selectedFile);
            const { data } = await axios.post(backendURL + '/api/users/update-resume', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!data.success) throw new Error(data.message || 'Resume upload failed');
            // The server stores the Cloudinary URL; use it locally for this open modal.
            setResumeUrl(data.resumeUrl || 'uploaded');
            onResumeUploaded?.();
            setSelectedFile(null);
            onAnalysisComplete(null);
            window.alert('Resume uploaded successfully.');
        } catch (error) {
            window.alert(error.response?.data?.message || error.message || 'Could not upload resume.');
        } finally { setIsUploading(false); }
    };

    // AI-GENERATED: Request analysis only when the candidate chooses to.
    const handleAnalyze = async () => {
        if (!resumeUrl) { window.alert('Please upload your resume first.'); return; }
        setIsAnalyzing(true);
        try {
            const token = await getToken();
            const { data } = await axios.post(backendURL + `/api/ai/analyze-resume/${jobId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!data.success) throw new Error(data.message || 'AI analysis failed');
            onAnalysisComplete(data.analysis);
        } catch (error) {
            window.alert(error.response?.data?.message || error.message || 'Resume analysis failed. Please try again.');
        } finally { setIsAnalyzing(false); }
    };

    const recStyle = analysis ? getRecommendationStyle(analysis.recommendation) : null;

    return (
      <div className="w-full" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-4xl mx-auto animate-slideIn">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div><div className="flex items-center gap-2 mb-1"><span className="text-2xl">✨</span><h2 className="text-xl font-bold">Application Assistant</h2></div><p className="text-blue-100 text-sm">{jobTitle} · {companyName}</p></div>
              <button onClick={onClose} className="text-white/80 hover:text-white text-3xl leading-none font-light" aria-label="Close application assistant">×</button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <section className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">1. Your resume</h3>
              <p className="text-sm text-gray-600">{resumeUrl ? 'A resume is already uploaded to your profile. You can continue or replace it.' : 'Upload your resume to continue with this application.'}</p>
              {resumeUrl && <p className="text-xs text-green-700">✓ Resume available in your profile</p>}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-600" />
                <button onClick={handleResumeUpload} disabled={!selectedFile || isUploading} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:bg-gray-300">{isUploading ? 'Uploading...' : 'Upload / Replace Resume'}</button>
              </div>
            </section>
            <section className="border border-gray-200 rounded-xl p-5 space-y-3">
              <div><h3 className="font-bold text-gray-900 text-lg">2. Optional AI resume analysis</h3><p className="text-sm text-gray-600 mt-1">Compare your uploaded resume with this job description before applying. Analysis is optional.</p></div>
              <button onClick={handleAnalyze} disabled={!resumeUrl || isUploading || isAnalyzing} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold disabled:opacity-50">{isAnalyzing ? 'Analyzing...' : analysis ? 'Analyze Again' : '✨ Analyze Resume with AI'}</button>
            </section>
            {analysis && (
              <div className="space-y-8">
                    {/* ===== SECTION 1: SCORE + SUMMARY ===== */}
                    {/* AI-GENERATED: Top section shows the numeric score ring, match level badge, and the AI summary text.
                        On mobile: stacked vertically. On desktop: side by side (flex-row). */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <ScoreRing score={analysis.compatibilityScore} />
                        <div className="text-center md:text-left">
                            {/* AI-GENERATED: Match level badge — color depends on match level */}
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getMatchLevelStyle(analysis.matchLevel)}`}>
                                {analysis.matchLevel}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">AI Match Summary</h3>
                            <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
                        </div>
                    </div>

                    {/* ===== SECTION 2: MATCHING SKILLS ===== */}
                    {/* AI-GENERATED: Shows skills the candidate already HAS that match the JD.
                        Each skill card has an importance badge and a reason tooltip-style text. */}
                    {analysis.matchingSkills && analysis.matchingSkills.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <span className="text-green-600">✓</span> Matching Skills
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {analysis.matchingSkills.map((item, index) => (
                                    <div key={index} className="border border-green-200 bg-green-50 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-gray-800 text-sm">{item.skill}</span>
                                            {/* AI-GENERATED: Importance badge — uses helper function for color */}
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getImportanceStyle(item.importance)}`}>
                                                {item.importance}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{item.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== SECTION 3: MISSING SKILLS ===== */}
                    {/* AI-GENERATED: Shows skills the JD requires that are NOT in the resume.
                        Critical skills get red styling; Preferred get purple — visual priority at a glance. */}
                    {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <span className="text-red-500">✗</span> Missing Skills & Keywords
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {analysis.missingSkills.map((item, index) => (
                                    <div key={index} className="border rounded-xl p-3"
                                        style={{ 
                                            borderColor: item.importance === 'Critical' ? '#fca5a5' : item.importance === 'Important' ? '#fed7aa' : '#d8b4fe',
                                            backgroundColor: item.importance === 'Critical' ? '#fef2f2' : item.importance === 'Important' ? '#fff7ed' : '#faf5ff'
                                        }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-gray-800 text-sm">{item.skill}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getImportanceStyle(item.importance)}`}>
                                                {item.importance}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{item.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== SECTION 4: PROJECT ANALYSIS ===== */}
                    {/* AI-GENERATED: Lists the candidate's projects and explains their relevance to the JD.
                        This is especially important for freshers who rely on projects instead of work experience. */}
                    {analysis.projectAnalysis && analysis.projectAnalysis.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <span>🗂️</span> Project Relevance
                            </h3>
                            <div className="space-y-3">
                                {analysis.projectAnalysis.map((project, index) => (
                                    <div key={index} className="border border-blue-100 bg-blue-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-gray-800">{project.projectName}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getImportanceStyle(project.relevance)}`}>
                                                {project.relevance} Relevance
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{project.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== SECTION 5: EXPERIENCE ANALYSIS ===== */}
                    {/* AI-GENERATED: Compares the candidate's education, internships, and work history
                        against what the job expects. Shows an overall match strength badge. */}
                    {analysis.experienceAnalysis && (
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <span>🎓</span> Experience & Qualifications
                            </h3>
                            <div className="border border-indigo-100 bg-indigo-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Overall Qualification Match:</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                        analysis.experienceAnalysis.match === 'Strong' ? 'bg-green-100 text-green-700 border-green-200' :
                                        analysis.experienceAnalysis.match === 'Moderate' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                        {analysis.experienceAnalysis.match}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{analysis.experienceAnalysis.details}</p>
                            </div>
                        </div>
                    )}

                    {/* ===== SECTION 6: RESUME IMPROVEMENT SUGGESTIONS ===== */}
                    {/* AI-GENERATED: Actionable tips for improving the resume specifically for this role.
                        Rendered as a numbered list — easy to scan and act on. */}
                    {analysis.resumeImprovements && analysis.resumeImprovements.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <span>💡</span> Resume Improvement Tips
                            </h3>
                            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                                <ol className="space-y-2">
                                    {analysis.resumeImprovements.map((tip, index) => (
                                        <li key={index} className="flex gap-3 text-sm text-gray-700">
                                            <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            {tip}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}

                    {/* ===== SECTION 7: AI RECOMMENDATION ===== */}
                    {/* AI-GENERATED: The most important section — the final recommendation from the AI.
                        Shows APPLY / IMPROVE RESUME FIRST / LOW MATCH with color-coded styling.
                        Always includes a disclaimer that the final decision is the candidate's own. */}
                    <div className={`border-2 ${recStyle.border} ${recStyle.bg} rounded-xl p-5`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{recStyle.icon}</span>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">AI Recommendation</p>
                                <h3 className={`text-xl font-bold ${recStyle.text}`}>{analysis.recommendation}</h3>
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{analysis.recommendationReason}</p>
                        {/* AI-GENERATED: Disclaimer — reinforces that the AI cannot make decisions for the candidate. */}
                        <p className="text-xs text-gray-400 mt-3 italic">
                            Note: This is an AI-generated suggestion based on your resume and the job description. 
                            The final decision is entirely yours.
                        </p>
                    </div>


                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs text-gray-500 mb-3">3. Review the information above. AI analysis is only guidance and is not required to apply.</p>
                  <button onClick={onApply} disabled={isAlreadyApplied} className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all ${isAlreadyApplied ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'}`}>{isAlreadyApplied ? '✓ Already Applied' : 'Submit Application'}</button>
                </div>
              </div>
            )}
            {!analysis && <div className="border-t border-gray-100 pt-4"><p className="text-xs text-gray-500 mb-3">3. You can submit your application without AI analysis once your resume is uploaded.</p><button onClick={onApply} disabled={!resumeUrl || isUploading || isAlreadyApplied} className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:bg-gray-200 disabled:text-gray-500">{isAlreadyApplied ? '✓ Already Applied' : 'Submit Application'}</button></div>}
            <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold text-sm">Close</button>
          </div>
        </div>
      </div>
    );
};

export default ResumeAnalysisModal;
