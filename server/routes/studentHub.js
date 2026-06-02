import express from "express";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply protect middleware to secure student helper utilities
router.use(protect);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Gemini model priority cascade — cheapest/least-limited first on quota error
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.0-pro",
];

// Check if an error is a rate-limit / quota exhaustion error
function isQuotaError(errMsg = "") {
  const msg = errMsg.toLowerCase();
  return (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("free_tier")
  );
}

/**
 * callGemini — tries each model in GEMINI_MODELS cascade.
 * Returns null (triggering mock fallback in route) when all models fail.
 */
async function callGemini(systemPrompt, userPrompt, responseJson = false) {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY not configured. Running AI helper in mock fallback mode.");
    return null;
  }

  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 1500,
    responseMimeType: responseJson ? "application/json" : "text/plain",
  };

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error?.message || `HTTP ${response.status}`;
        if (isQuotaError(errMsg) || response.status === 429) {
          console.warn(`⚡ Quota exhausted on ${model}. Trying next model...`);
          lastError = errMsg;
          continue; // try next model
        }
        throw new Error(errMsg); // non-quota error — bubble up
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) {
        if (model !== GEMINI_MODELS[0]) {
          console.info(`✅ Served by fallback model: ${model}`);
        }
        return text;
      }

      lastError = "Empty response";
    } catch (err) {
      if (isQuotaError(err.message)) {
        console.warn(`⚡ Quota error on ${model}: ${err.message}. Trying next...`);
        lastError = err.message;
        continue;
      }
      throw err; // re-throw non-quota errors
    }
  }

  // All models exhausted — return null to trigger mock fallback
  console.warn(`🚫 All Gemini models quota-exhausted. Using mock fallback. Last error: ${lastError}`);
  return null;
}

// Helper to clean JSON response from Gemini code fences
function cleanGeminiJson(rawText) {
  let cleanText = rawText.trim();
  
  // Find first [ or { and last ] or }
  const firstBracket = Math.min(
    cleanText.indexOf("[") === -1 ? Infinity : cleanText.indexOf("["),
    cleanText.indexOf("{") === -1 ? Infinity : cleanText.indexOf("{")
  );
  
  const lastBracket = Math.max(
    cleanText.lastIndexOf("]"),
    cleanText.lastIndexOf("}")
  );
  
  if (firstBracket !== Infinity && lastBracket !== -1 && lastBracket > firstBracket) {
    cleanText = cleanText.substring(firstBracket, lastBracket + 1);
  }
  
  return JSON.parse(cleanText.trim());
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. PLACEMENT INTERVIEW QUESTIONS GENERATOR
// ──────────────────────────────────────────────────────────────────────────────
router.post("/interview-generator", async (req, res, next) => {
  try {
    const { role, level, company } = req.body;

    if (!role || !level) {
      return res.status(400).json({ success: false, message: "Role and level are required." });
    }

    const companyStr = company ? company.trim() : "general software tech companies";
    const systemPrompt = `You are an expert technical interviewer and placement coordinator. 
Generate a list of exactly 8 interview questions tailored for a candidates target profile.
Output MUST be raw JSON format with NO markdown formatting (no backticks, no markdown code block formatting).
JSON format:
[
  {
    "question": "The interview question",
    "answer": "A detailed, concise model answer explaining key concepts, syntax, or algorithms",
    "topic": "The category (e.g. OOP, DBMS, OS, React Hooks, DSA)"
  }
]`;

    const userPrompt = `Generate placement questions for:
- Role: ${role}
- Experience level: ${level}
- Target Company Type: ${companyStr}
Provide high-yield, conceptual, and coding questions commonly asked in actual rounds.`;

    // Wrapped: callGemini returns null on quota exhaustion
    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini interview-generator error:", aiErr.message);
    }

    if (!aiOutput) {
      // Mock Fallback
      const mockQuestions = [
        {
          question: `What are the primary differences between SQL and NoSQL databases for a ${role} role?`,
          answer: "SQL databases are relational, table-based, structured, and use SQL for queries. They are vertically scalable and support ACID properties (e.g., PostgreSQL, MySQL). NoSQL databases are non-relational, document/key-value/graph-based, dynamic schema-driven, horizontally scalable, and prioritize availability over immediate consistency (e.g., MongoDB, Redis).",
          topic: "Databases",
        },
        {
          question: "Explain the concept of closures in JavaScript and how they are used.",
          answer: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In JS, closures are created every time a function is created, allowing inner functions to access variables from outer function scopes even after the outer function has returned. They are commonly used for data privacy/encapsulation and currying.",
          topic: "Programming Languages",
        },
        {
          question: "What is time complexity, and how do you calculate the Big O for a binary search algorithm?",
          answer: "Time complexity describes the amount of time an algorithm takes to run relative to the input size. Binary search repeatedly divides the search space in half. The recursion relation is T(n) = T(n/2) + O(1), which solves to O(log n) using the Master Theorem. In the worst case, it takes logarithmic time.",
          topic: "DSA",
        },
      ];
      return res.status(200).json({ success: true, questions: mockQuestions });
    }

    try {
      const questions = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, questions });
    } catch (parseErr) {
      console.error("AI JSON Parse Error:", parseErr.message, "\nRaw:", aiOutput);
      res.status(500).json({ success: false, message: "AI response parse failed. Try again." });
    }
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. RESUME ANALYZER & JOB COMPARATOR
// ──────────────────────────────────────────────────────────────────────────────
router.post("/resume-analyzer", async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: "Resume content and Job Description are required." });
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) parser and technical recruiter.
Analyze the user's resume text against the target job description.
Output MUST be raw JSON format with NO markdown formatting (no backticks, no code block delimiters).
JSON schema to return:
{
  "matchScore": 75, // integer percentage
  "missingKeywords": ["Docker", "Redis", "System Design"], // keywords in JD but missing in Resume
  "bulletImprovements": [
    {
      "original": "Worked on the frontend team building React code",
      "improved": "Refactored React components using custom hooks, improving site responsiveness by 15%"
    }
  ],
  "overallFeedback": "A concise text summary of strengths, major improvements, and ATS formatting layout tips."
}`;

    const userPrompt = `Resume text:
${resumeText}

---
Job Description:
${jobDescription}`;

    // Wrapped: callGemini returns null on quota exhaustion
    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini resume-analyzer error:", aiErr.message);
    }

    if (!aiOutput) {
      // Mock Fallback
      const mockResult = {
        matchScore: 68,
        missingKeywords: ["TypeScript", "CI/CD Pipelines", "Docker", "Unit Testing"],
        bulletImprovements: [
          {
            original: "Developed web application using NodeJS and React.",
            improved: "Built dynamic client portal in React/NodeJS, introducing state variables and reducing database query load by 22%.",
          },
          {
            original: "Responsible for fixing bugs in production code.",
            improved: "Collaborated in debugging sessions using Chrome DevTools, resolving memory leaks and boosting runtime performance.",
          },
        ],
        overallFeedback: "Your resume represents strong fundamental skills. To pass automated ATS filters, emphasize cloud technologies (Docker, AWS) and quantify your achievements with clear metric results (percentages, load times, revenue saved).",
      };
      return res.status(200).json({ success: true, result: mockResult });
    }

    try {
      const result = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, result });
    } catch (parseErr) {
      console.error("AI JSON Parse Error:", parseErr.message, "\nRaw:", aiOutput);
      res.status(500).json({ success: false, message: "Failed to parse analyzer response." });
    }
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. PROJECT REPORT DOCUMENTATION WRITER
// ──────────────────────────────────────────────────────────────────────────────
router.post("/project-report", async (req, res, next) => {
  try {
    const { title, description, techStack } = req.body;

    if (!title || !description || !techStack) {
      return res.status(400).json({ success: false, message: "Title, description, and tech stack are required." });
    }

    const systemPrompt = `You are a university computer science supervisor. 
Generate a professional, detailed Project Report Outline in Markdown format. 
Structure should contain:
1. Abstract (A detailed college-level synopsis)
2. Introduction & Motivation
3. Proposed System Architecture (Text descriptions of client, server, db)
4. Key Database Schema Entities (suggested tables/documents fields)
5. Crucial Test Cases checklist (at least 6 testing scripts)
Maintain high academic standard tone.`;

    const userPrompt = `Generate a project documentation outline for:
- Title: ${title}
- Tech Stack: ${techStack}
- Details: ${description}`;

    // Wrapped: callGemini returns null on quota exhaustion
    let markdownOutput = null;
    try {
      markdownOutput = await callGemini(systemPrompt, userPrompt);
    } catch (aiErr) {
      console.error("Gemini project-report error:", aiErr.message);
    }

    if (!markdownOutput) {
      // Mock Fallback
      const mockMarkdown = `
# Project Report: ${title}

## 1. Abstract
The proposed system leverages a robust tech stack incorporating **${techStack}** to address core challenges described as: *${description}*. This report outlines design criteria, functional requirements, and architecture specifications.

## 2. Introduction & Motivation
Software systems targeting this segment improve task efficiency and decrease operational delays. Building on modern frameworks ensures security, scalability, and device responsiveness.

## 3. System Architecture
* **Frontend Tier:** Single Page Client UI handling dynamic page layouts and server state synchronizations.
* **Backend API Gateway:** Express controller verifying tokens, caching key metrics, and validating payloads.
* **Database Layer:** Highly indexed document collection logging application records securely.

## 4. Key Database Schema
* **Users:** \`id\`, \`email\`, \`name\`, \`role\`, \`createdAt\`
* **Transactions:** \`id\`, \`userId\`, \`productId\`, \`paymentId\`, \`status\`, \`amount\`

## 5. Test Cases Checklist
- [ ] Verify user verification OTP triggers.
- [ ] Validate payment signature validation controls.
- [ ] Test cross-site request forgery protection.
- [ ] Confirm file download token expiration checks.
      `;
      return res.status(200).json({ success: true, report: mockMarkdown });
    }

    res.status(200).json({ success: true, report: markdownOutput });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. CODING SOLUTION EVALUATOR (DSA REVIEWER)
// ──────────────────────────────────────────────────────────────────────────────
router.post("/coding-helper", async (req, res, next) => {
  try {
    const { code, questionTitle, language } = req.body;

    if (!code || !questionTitle) {
      return res.status(400).json({ success: false, message: "Code content and Question Title are required." });
    }

    const langStr = language || "Javascript";
    const systemPrompt = `You are a lead algorithm engineer reviewing coding submissions.
Review the provided solution code and return the analysis in raw JSON format. Do not use markdown blocks.
JSON schema to return:
{
  "timeComplexity": "O(n log n)",
  "spaceComplexity": "O(1)",
  "bugs": ["Bypasses boundary limit checks for empty arrays", "Slow search loops"],
  "refactoredSolution": "A fully cleaned, comments-annotated, optimized refactored version of the code",
  "explanation": "Summary of your review and how the optimized code fixes complexity or stability issues."
}`;

    const userPrompt = `DSA Problem: ${questionTitle}
Language: ${langStr}
Code submitted:
${code}`;

    // callGemini returns null when all models are quota-exhausted → use mock
    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini call failed (non-quota error):", aiErr.message);
      // still fall through to mock
    }

    if (!aiOutput) {
      // Intelligent mock fallback — quota exhausted or key missing
      const mockResult = {
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        bugs: [
          "Uses nested loops — inefficient for large datasets",
          "Missing null / empty-array boundary checks",
        ],
        refactoredSolution: `// Optimized using a Hash Map — O(n) time, O(n) space
function twoSum(nums, target) {
  if (!nums || nums.length < 2) return [];
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}`,
        explanation:
          "⚠️ AI quota reached — showing a smart offline analysis. The brute-force O(n²) nested loop approach is replaced with a single-pass Hash Map that reduces time complexity to O(n) by storing each number's index and checking for its complement in O(1) lookup time.",
        _quotaFallback: true,
      };
      return res.status(200).json({ success: true, result: mockResult, quotaFallback: true });
    }

    try {
      const result = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, result });
    } catch (parseErr) {
      console.error("AI JSON Parse Error:", parseErr.message, "\nRaw:", aiOutput);
      res.status(500).json({ success: false, message: "Failed to parse code evaluator review." });
    }
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. AI STUDY BUDDY ASSISTANT
// ──────────────────────────────────────────────────────────────────────────────
router.post("/study-assistant", async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const systemPrompt = `You are a helpful, professional, and knowledgeable AI Study Buddy, academic tutor, and computer science mentor.
Help the student solve technical concepts, math equations, DSA logic, college subjects, and debugging code.
Explain concepts clearly, step-by-step, using Markdown for formatting.
If the student asks to write or debug code, explain the logic and present clean, readable code with comments.
Keep answers concise, structured, and student-focused. Avoid excessive verbosity but guarantee clarity.`;

    if (!GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY not configured. Running study assistant in mock mode.");
      const reply = "Hello! I am your AI Study Buddy. Currently, I am running in demo mode as the GEMINI_API_KEY is not set. Ask me anything about programming, algorithms, or college subjects!";
      return res.status(200).json({ success: true, reply });
    }

    // Convert history to Gemini API format
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Use model cascade with quota fallback
    const generationConfig = { temperature: 0.7, maxOutputTokens: 1200 };
    let reply = null;
    let lastStudyError = null;

    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          const errMsg = data?.error?.message || `HTTP ${response.status}`;
          if (isQuotaError(errMsg) || response.status === 429) {
            console.warn(`⚡ Study-assistant quota on ${model}. Trying next...`);
            lastStudyError = errMsg;
            continue;
          }
          throw new Error(errMsg);
        }

        reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        if (reply) {
          if (model !== GEMINI_MODELS[0]) console.info(`✅ Study-assistant served by: ${model}`);
          break;
        }
      } catch (fetchErr) {
        if (isQuotaError(fetchErr.message)) {
          lastStudyError = fetchErr.message;
          continue;
        }
        throw fetchErr;
      }
    }

    if (!reply) {
      // All models quota-exhausted — return friendly offline message
      reply = `⚠️ **AI Quota Reached** — All Gemini models are temporarily rate-limited on the free tier.\n\n` +
        `**What you can do:**\n` +
        `- Wait ~1 minute and try again (free tier resets per minute)\n` +
        `- Upgrade your Gemini API key plan at [ai.google.dev](https://ai.google.dev)\n` +
        `- In the meantime, I can still help with offline explanations!\n\n` +
        `*(Last error: ${lastStudyError || "quota exhausted"})*`;
    }

    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
});

export default router;
