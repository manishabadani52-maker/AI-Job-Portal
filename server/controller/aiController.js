
import { getAuth } from '@clerk/express';
import axios from 'axios';
import { createRequire } from 'module';

import User from '../models/User.js';
import Job from '../models/job.js';
import { analyzeResumeWithGemini } from '../utils/geminiService.js';

// pdf-parse v2 uses PDFParse class
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// Rate limiting
const lastRequestTime = new Map();
const RATE_LIMIT_MS = 30 * 1000; // 30 seconds


// Download resume from Cloudinary as a Buffer
const downloadFileAsBuffer = async (url) => {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
        });

        const pdfBuffer = Buffer.from(response.data);

        console.log('[AI Analysis] Downloaded file size:', pdfBuffer.length);
        console.log('[AI Analysis] PDF header:', pdfBuffer.subarray(0, 5).toString());

        return pdfBuffer;

    } catch (error) {
        console.error('[AI Analysis] Download Error:', error.message);

        throw new Error(
            'Could not download your resume from storage. Please try uploading it again.'
        );
    }
};


// Extract text using pdf-parse v2
const extractTextFromPDF = async (pdfBuffer) => {
    let parser;

    try {
        parser = new PDFParse({ data: pdfBuffer });

        const result = await parser.getText();

        const extractedText = result.text || '';

        console.log(
            '[AI Analysis] Extracted text characters:',
            extractedText.length
        );

        return extractedText;

    } catch (error) {
        console.error('[AI Analysis] PDF Extraction Error:', error.message);

        throw new Error(
            'Could not extract text from your resume PDF. Please try another PDF.'
        );

    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
};


// Main controller
export const analyzeResume = async (req, res) => {

    // Step 1: Authenticate user through Clerk
    const { userId } = getAuth(req);

    if (!userId) {
        return res.json({
            success: false,
            message: 'You must be logged in to use this feature.'
        });
    }

    // Step 2: Rate limit check
    const lastRequest = lastRequestTime.get(userId);

    if (lastRequest && (Date.now() - lastRequest) < RATE_LIMIT_MS) {
        const waitSeconds = Math.ceil(
            (RATE_LIMIT_MS - (Date.now() - lastRequest)) / 1000
        );

        return res.json({
            success: false,
            message: `Please wait ${waitSeconds} seconds before requesting another analysis.`
        });
    }

    try {

        // Step 3: Get job ID
        const { jobId } = req.params;

        if (!jobId) {
            return res.json({
                success: false,
                message: 'Job ID is required.'
            });
        }

        // Step 4: Fetch job details
        const jobData = await Job.findById(jobId)
            .populate('companyId', 'name');

        if (!jobData) {
            return res.json({
                success: false,
                message: 'Job not found. It may have been removed.'
            });
        }

        if (!jobData.description || jobData.description.trim().length < 50) {
            return res.json({
                success: false,
                message: 'This job does not have enough description to perform an analysis.'
            });
        }

        // Step 5: Fetch authenticated user's data
        const userData = await User.findById(userId);

        if (!userData) {
            return res.json({
                success: false,
                message: 'User account not found. Please log in again.'
            });
        }

        // Step 6: Check resume URL
        if (!userData.resume || userData.resume.trim() === '') {
            return res.json({
                success: false,
                message: 'You have not uploaded a resume yet. Please upload your resume before using AI analysis.'
            });
        }

        // Step 7: Download PDF from Cloudinary
        console.log(`[AI Analysis] Downloading resume for user: ${userId}`);

        const resumeUrl = userData.resume;

        const pdfBuffer = await downloadFileAsBuffer(resumeUrl);

        // Check whether downloaded content is actually a PDF
        if (pdfBuffer.subarray(0, 5).toString() !== '%PDF-') {
            throw new Error(
                'The uploaded file could not be read as a PDF. Please upload your resume again.'
            );
        }

        // Step 8: Extract PDF text
        const resumeText = await extractTextFromPDF(pdfBuffer);

        // Step 9: Validate extracted text
        if (!resumeText || resumeText.trim().length < 100) {
            return res.json({
                success: false,
                message: 'Very little text could be extracted from your resume. Please upload a readable, text-based PDF.'
            });
        }

        console.log(
            `[AI Analysis] Extracted ${resumeText.length} characters. Calling Gemini...`
        );

        // Step 10: Call Gemini
        const analysisResult = await analyzeResumeWithGemini(
            resumeText,
            jobData
        );

        // Update rate limit only after successful analysis
        lastRequestTime.set(userId, Date.now());

        console.log(
            `[AI Analysis] Analysis complete for user: ${userId}, job: ${jobId}, score: ${analysisResult.compatibilityScore}`
        );

        // Step 11: Send result to frontend
        return res.json({
            success: true,
            analysis: analysisResult,
            jobTitle: jobData.title,
            companyName: jobData.companyId?.name || 'Company'
        });

    } catch (error) {

        console.error('[AI Analysis Error]:', error);

        return res.json({
            success: false,
            message: error.message ||
                'AI analysis failed due to an unexpected error. Please try again.'
        });
    }
};
