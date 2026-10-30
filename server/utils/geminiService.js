// AI-GENERATED: This file is the dedicated service that communicates with Google Gemini.
// Keeping this logic separate from the controller follows the "separation of concerns" principle.
// If you want to swap out Gemini for another AI provider later, you only change this one file.

import { GoogleGenAI } from '@google/genai';

// AI-GENERATED: We read the API key from environment variables (server/.env).
// This is the security boundary — the key never appears in source code or is sent to the frontend.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * AI-GENERATED: Build the prompt string that we send to Gemini.
 *
 * A good prompt is the most important part of AI integration.
 * We tell Gemini:
 *   1. What role to play (experienced technical recruiter).
 *   2. What input it receives (resume text + job details).
 *   3. Exactly what output format we want (strict JSON with no extra text).
 *   4. Important rules it must follow.
 *
 * @param {string} resumeText  - Plain text extracted from the candidate's PDF
 * @param {object} jobData     - The Job document from MongoDB
 * @returns {string}           - The complete prompt string to send to Gemini
 */
const buildAnalysisPrompt = (resumeText, jobData) => {
    // AI-GENERATED: Strip HTML tags from the job description.
    // Jobs are saved as rich HTML by the Quill editor, but Gemini works better with plain text.
    const cleanDescription = jobData.description
        .replace(/<[^>]*>/g, ' ')  // Replace every HTML tag with a space
        .replace(/\s+/g, ' ')       // Collapse multiple spaces into one
        .trim();

    return `You are an experienced technical recruiter and resume evaluator with 15+ years of experience.
Carefully analyze the candidate resume against the job posting and provide a detailed, honest evaluation.

===JOB POSTING DETAILS===
Job Title: ${jobData.title}
Job Level: ${jobData.level}
Location: ${jobData.location}
Category: ${jobData.category}
Annual Salary (CTC): ${jobData.salary}

Job Description:
${cleanDescription}

===CANDIDATE RESUME TEXT===
${resumeText}

===RULES YOU MUST FOLLOW===
1. Compare the resume carefully against the job requirements. Consider the CONTEXT in which a skill is used.
2. Do NOT award points simply because a keyword appears once. Understand whether the candidate genuinely has the skill.
3. Be honest but encouraging. If a candidate is under-qualified, say so kindly. If they are strong, say so confidently.
4. Do NOT invent skills the candidate does not mention.
5. Do NOT suggest the candidate falsely add skills or experiences they do not have.
6. Consider this may be an entry-level/fresher candidate. Adjust expectations based on the job level.
7. The final application decision always belongs to the candidate.

===CRITICAL OUTPUT INSTRUCTION===
Return ONLY a valid JSON object. No markdown code fences. No explanation before or after. Just the raw JSON.

Use EXACTLY this JSON structure (do not add or remove any fields):
{
  "compatibilityScore": <integer between 0 and 100>,
  "matchLevel": "<exactly one of: Excellent Match | Good Match | Moderate Match | Low Match>",
  "summary": "<2-3 sentence plain-language overall fit summary>",
  "matchingSkills": [
    {
      "skill": "<skill name>",
      "importance": "<exactly one of: High | Medium | Low>",
      "reason": "<one sentence explaining why this skill matches the JD>"
    }
  ],
  "missingSkills": [
    {
      "skill": "<skill or keyword from JD that is absent from the resume>",
      "importance": "<exactly one of: Critical | Important | Preferred>",
      "reason": "<one sentence explaining why this is important for the role>"
    }
  ],
  "projectAnalysis": [
    {
      "projectName": "<project name exactly as written in resume>",
      "relevance": "<exactly one of: High | Medium | Low>",
      "reason": "<one sentence explaining project relevance to the JD>"
    }
  ],
  "experienceAnalysis": {
    "match": "<exactly one of: Strong | Moderate | Weak>",
    "details": "<2-3 sentences comparing education, internships, work experience against this job's requirements>"
  },
  "resumeImprovements": [
    "<actionable tip — only suggest adding things the candidate genuinely has or can legitimately add>"
  ],
  "recommendation": "<exactly one of: APPLY | IMPROVE RESUME FIRST | LOW MATCH>",
  "recommendationReason": "<2-3 sentences explaining why this recommendation was made>"
}`;
};


/**
 * AI-GENERATED: Main exported function — calls Gemini with the resume and job data.
 *
 * Flow of data:
 *   Controller → analyzeResumeWithGemini() → Gemini API → parsed JSON → back to controller
 *
 * @param {string} resumeText  - Extracted plain text from the candidate's resume PDF
 * @param {object} jobData     - Full Job document from MongoDB
 * @returns {object}           - Parsed structured analysis object
 * @throws {Error}             - If API key is missing, Gemini fails, or JSON is malformed
 */
export const analyzeResumeWithGemini = async (resumeText, jobData) => {
    // AI-GENERATED: Guard — if the API key is missing, stop here with a helpful error.
    // This prevents a confusing crash deeper in the code.
    if (!GEMINI_API_KEY) {
        throw new Error(
            'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to server/.env'
        );
    }

    // AI-GENERATED: Create the Gemini SDK client instance.
    // We create it fresh per call so no stale state carries over between requests.
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // AI-GENERATED: Build the prompt — this is the instruction we send to Gemini.
    const prompt = buildAnalysisPrompt(resumeText, jobData);

    try {
        // AI-GENERATED: Send the prompt to Gemini.
        // "gemini-2.0-flash" is Google's latest fast model — good for structured outputs.
        const response = await genAI.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
        });

        // AI-GENERATED: Extract the plain text from Gemini's response.
        const rawText = response.text;

        if (!rawText || rawText.trim() === '') {
            throw new Error('Gemini returned an empty response. Please try again.');
        }

        // AI-GENERATED: Gemini sometimes wraps its JSON output in markdown code fences like:
        //   ```json
        //   { ... }
        //   ```
        // We need to strip those before parsing. This regex handles that case.
        const cleanedText = rawText
            .replace(/^```json\s*/i, '')  // Remove leading ```json marker
            .replace(/^```\s*/i, '')       // Remove leading ``` (without language tag)
            .replace(/```\s*$/i, '')        // Remove trailing ``` marker
            .trim();

        // AI-GENERATED: Parse the JSON string into a JavaScript object.
        // If the JSON is malformed, this throws a SyntaxError (caught below).
        const analysisResult = JSON.parse(cleanedText);

        // AI-GENERATED: Basic validation — make sure critical fields are present.
        // Gemini is very good, but we verify before sending data to the frontend.
        if (
            typeof analysisResult.compatibilityScore !== 'number' ||
            !analysisResult.matchLevel ||
            !analysisResult.summary ||
            !analysisResult.recommendation
        ) {
            throw new Error(
                'Gemini response is missing required fields. Please try again.'
            );
        }

        return analysisResult;

    } catch (error) {
        // AI-GENERATED: If JSON parsing failed, throw a friendly error.
        if (error instanceof SyntaxError) {
            throw new Error(
                'Could not parse Gemini\'s response as JSON. This is a temporary issue — please try again.'
            );
        }
        // AI-GENERATED: For any other error (network, rate limit, etc.), re-throw it
        // so the controller can return an appropriate HTTP error to the frontend.
        throw error;
    }
};
