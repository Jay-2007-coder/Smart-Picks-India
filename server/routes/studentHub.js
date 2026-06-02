import express from "express";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply protect middleware to secure student helper utilities
router.use(protect);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Helper to make Gemini API requests
async function callGemini(systemPrompt, userPrompt) {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not configured. Running AI helper in mock fallback mode.");
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP status ${response.status}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Helper to clean JSON response from Gemini code fences
function cleanGeminiJson(rawText) {
  let cleanText = rawText.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7, cleanText.length - 3);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3, cleanText.length - 3);
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

    const aiOutput = await callGemini(systemPrompt, userPrompt);

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

    const aiOutput = await callGemini(systemPrompt, userPrompt);

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

    const markdownOutput = await callGemini(systemPrompt, userPrompt);

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

    const aiOutput = await callGemini(systemPrompt, userPrompt);

    if (!aiOutput) {
      // Mock Fallback
      const mockResult = {
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        bugs: ["Uses nested loops, which is inefficient for large datasets", "Missing null parameter checks"],
        refactoredSolution: `
// Optimized using a Hash Map
function twoSum(nums, target) {
  if (!nums || nums.length < 2) return [];
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
        `.trim(),
        explanation: "The original nested loops search has O(n^2) time complexity. By introducing a Hash Map to record complement coordinates, we optimize lookups to O(1), bringing the overall time complexity down to O(n) linear search, trading a minor O(n) memory space.",
      };
      return res.status(200).json({ success: true, result: mockResult });
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP status ${response.status}`);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't formulate a response. Please try again.";
    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
});

export default router;
