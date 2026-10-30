// AI-GENERATED: This file defines the Express router for AI-related API endpoints.
// It follows the same pattern as userRoutes.js and jobRoutes.js in this project.
//
// Route: POST /api/ai/analyze-resume/:jobId
//   - :jobId is the MongoDB _id of the job the candidate wants to compare against.
//   - The candidate's identity is determined from their Clerk JWT token (server-side).
//   - No request body is needed — all required data is fetched server-side.

import express from 'express';
import { analyzeResume } from '../controller/aiController.js';

const router = express.Router();

// AI-GENERATED: POST /api/ai/analyze-resume/:jobId
// This route calls the analyzeResume controller function.
// Clerk's clerkMiddleware() (set in server.js) automatically validates the JWT token
// before this route is reached, so we don't need an extra auth middleware here.
// The controller itself calls getAuth(req) to read the verified userId.
router.post('/analyze-resume/:jobId', analyzeResume);

export default router;
