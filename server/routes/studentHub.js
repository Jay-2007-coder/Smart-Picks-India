import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";
import { awardXp } from "../middleware/xp.js";
import { checkHubLimits } from "../middleware/hubLimits.js";
import PlacementApplication from "../models/PlacementApplication.js";
import CustomSkillTree from "../models/CustomSkillTree.js";
import { callGemini, cleanGeminiJson, GEMINI_API_KEY } from "../utils/gemini.js";

const router = express.Router();

// GET student leaderboard rankings
router.get("/leaderboard", async (req, res, next) => {
  try {
    const leaderboard = await User.find({})
      .select("name profileImage xp")
      .sort({ xp: -1 })
      .limit(10);
    res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    next(err);
  }
});

// Apply protect middleware to secure student helper utilities
router.use(protect);

// ──────────────────────────────────────────────────────────────────────────────
// PLACEMENT TRACKER CRUD (BYPASSES AI RUN LIMITS)
// ──────────────────────────────────────────────────────────────────────────────

// GET all user applications
router.get("/applications", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const applications = await PlacementApplication.find({ userId }).sort({ date: -1 });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    next(err);
  }
});

// POST create or update single application
router.post("/applications", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, companyName, role, packageLPA, stage, date, notes } = req.body;

    if (id) {
      // Update
      const app = await PlacementApplication.findOne({ _id: id, userId });
      if (!app) {
        return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
      }

      if (companyName !== undefined) app.companyName = companyName;
      if (role !== undefined) app.role = role;
      if (packageLPA !== undefined) app.packageLPA = packageLPA;
      if (stage !== undefined) app.stage = stage;
      if (date !== undefined) app.date = date;
      if (notes !== undefined) app.notes = notes;

      await app.save();
      return res.status(200).json({ success: true, message: "Application updated successfully", application: app });
    } else {
      // Create
      if (!companyName || !role) {
        return res.status(400).json({ success: false, message: "Company name and role are required." });
      }

      const newApp = new PlacementApplication({
        userId,
        companyName,
        role,
        packageLPA: packageLPA || 0,
        stage: stage || "applied",
        date: date || new Date(),
        notes: notes || "",
      });

      await newApp.save();
      return res.status(201).json({ success: true, message: "Application created successfully", application: newApp });
    }
  } catch (err) {
    next(err);
  }
});

// POST bulk migrate applications from LocalStorage
router.post("/applications/bulk-migrate", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { applications } = req.body;

    if (!Array.isArray(applications) || applications.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or empty applications array." });
    }

    const records = applications.map((app) => ({
      userId,
      companyName: app.companyName,
      role: app.role,
      packageLPA: app.packageLPA || 0,
      stage: app.stage || "applied",
      date: app.date || new Date(),
      notes: app.notes || "",
    }));

    const inserted = await PlacementApplication.insertMany(records);
    res.status(201).json({
      success: true,
      message: `Successfully migrated ${inserted.length} applications`,
      applications: inserted,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE single application
router.delete("/applications/:id", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const result = await PlacementApplication.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
    }

    res.status(200).json({ success: true, message: "Application deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// CUSTOM SKILL TREE UTILITIES (BYPASSES AI RUN LIMITS)
// ──────────────────────────────────────────────────────────────────────────────

// GET all user skill trees
router.get("/ai-skill-tree", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const trees = await CustomSkillTree.find({ userId }).select("roleName createdAt updatedAt").sort({ updatedAt: -1 });
    res.status(200).json({ success: true, trees });
  } catch (err) {
    next(err);
  }
});

// GET single skill tree
router.get("/ai-skill-tree/:id", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const tree = await CustomSkillTree.findOne({ _id: req.params.id, userId });
    if (!tree) {
      return res.status(404).json({ success: false, message: "Skill tree not found." });
    }
    res.status(200).json({ success: true, tree });
  } catch (err) {
    next(err);
  }
});

// DELETE skill tree
router.delete("/ai-skill-tree/:id", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await CustomSkillTree.deleteOne({ _id: req.params.id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Skill tree not found." });
    }
    res.status(200).json({ success: true, message: "Skill tree deleted successfully." });
  } catch (err) {
    next(err);
  }
});

// POST complete node and unlock progress
router.post("/ai-skill-tree/:id/complete-node", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { nodeId } = req.body;

    const tree = await CustomSkillTree.findOne({ _id: req.params.id, userId });
    if (!tree) {
      return res.status(404).json({ success: false, message: "Skill tree not found." });
    }

    const node = tree.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return res.status(404).json({ success: false, message: "Node not found." });
    }

    if (node.status === "locked") {
      return res.status(400).json({ success: false, message: "Cannot complete a locked node." });
    }

    node.status = "completed";

    // Re-evaluate locked nodes status in the tree.
    for (const childNode of tree.nodes) {
      if (childNode.status === "locked") {
        const parents = tree.edges.filter((edge) => edge.target === childNode.id).map((edge) => edge.source);
        if (parents.length > 0) {
          const allCompleted = parents.every((pId) => {
            const parentNode = tree.nodes.find((n) => n.id === pId);
            return parentNode && parentNode.status === "completed";
          });
          if (allCompleted) {
            childNode.status = "unlocked";
          }
        }
      }
    }

    // Award +15 XP
    req.user.xp = (req.user.xp || 0) + 15;
    await req.user.save();
    await tree.save();

    res.status(200).json({
      success: true,
      message: "Node completed! +15 XP awarded.",
      nodes: tree.nodes,
      xp: req.user.xp,
    });
  } catch (err) {
    next(err);
  }
});

// Apply AI usage limits to AI tools
router.use(checkHubLimits);


// POST submit quiz score to earn XP
router.post("/quiz/submit", awardXp, async (req, res, next) => {
  try {
    const { score, totalQuestions } = req.body;
    const bonusXp = Math.max(0, parseInt(score || 0) * 2);

    if (req.user && bonusXp > 0) {
      req.user.xp = (req.user.xp || 0) + bonusXp;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: `Quiz score of ${score}/${totalQuestions} processed successfully!`,
      bonusXp,
    });
  } catch (err) {
    next(err);
  }
});

// POST generate custom skill tree (Uses AI daily limit)
router.post("/ai-skill-tree/generate", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roleName } = req.body;

    if (!roleName || !roleName.trim()) {
      return res.status(400).json({ success: false, message: "Target role or technology stack is required." });
    }

    // Rate limit check: max 5 trees per user
    const existingCount = await CustomSkillTree.countDocuments({ userId });
    if (existingCount >= 5) {
      return res.status(400).json({
        success: false,
        message: "You have reached your limit of 5 custom skill trees. Please delete an existing tree to generate a new one.",
      });
    }

    const systemPrompt = `You are a visionary career planner and curriculum architect.
Generate a structured, gamified learning skill tree for the target role: "${roleName}".
You MUST generate exactly 8 nodes and their directed connection edges.
Group the nodes into 4 tiers:
- 'Beginner' (2 nodes)
- 'Intermediate' (2 nodes)
- 'Advanced' (2 nodes)
- 'Expert' (2 nodes)

Each node needs layout coordinates (x, y) so they can be rendered as a flowchart:
- Tier 1 (Beginner) nodes: y=100. Node 1: x=150, Node 2: x=450.
- Tier 2 (Intermediate) nodes: y=250. Node 3: x=150, Node 4: x=450.
- Tier 3 (Advanced) nodes: y=400. Node 5: x=150, Node 6: x=450.
- Tier 4 (Expert) nodes: y=550. Node 7: x=150, Node 8: x=450.

Connect Beginner nodes to Intermediate nodes, Intermediate to Advanced, and Advanced to Expert using directed edges.

Output MUST be a raw JSON object with NO markdown formatting (no backticks, no markdown code block formatting).
JSON Format:
{
  "nodes": [
    {
      "id": "node-unique-id-lowercase",
      "label": "Short Skill Title (e.g. Git Basics)",
      "tier": "Beginner" | "Intermediate" | "Advanced" | "Expert",
      "description": "2-3 sentence overview of what they learn",
      "resources": ["Resource Link or Title 1", "Resource Link or Title 2"],
      "quiz": {
        "question": "A multiple-choice conceptual test question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answerIndex": 0, // 0-based index of the correct option
        "explanation": "Brief explanation of the answer"
      },
      "x": 150,
      "y": 100
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id"
    }
  ]
}`;

    const userPrompt = `Target Career Path: ${roleName}`;
    let aiOutput = null;

    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini skill tree generator failed:", aiErr.message);
    }

    if (!aiOutput) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate skill tree. Gemini API is currently unavailable.",
      });
    }

    try {
      const parsedTree = cleanGeminiJson(aiOutput);
      if (!parsedTree || !Array.isArray(parsedTree.nodes) || !Array.isArray(parsedTree.edges)) {
        throw new Error("Invalid skill tree structure from AI.");
      }

      // Automatically unlock beginner tier nodes, lock others
      const mappedNodes = parsedTree.nodes.map((node) => ({
        ...node,
        status: node.tier === "Beginner" ? "unlocked" : "locked",
      }));

      const newTree = new CustomSkillTree({
        userId,
        roleName: roleName.trim(),
        nodes: mappedNodes,
        edges: parsedTree.edges,
      });

      await newTree.save();

      res.status(201).json({
        success: true,
        message: "AI Skill Tree generated successfully!",
        tree: newTree,
      });
    } catch (parseErr) {
      console.error("Failed to parse and save CustomSkillTree:", parseErr.message);
      res.status(500).json({ success: false, message: "AI response parsing failed. Try again." });
    }
  } catch (err) {
    next(err);
  }
});



// ──────────────────────────────────────────────────────────────────────────────
// 1. PLACEMENT INTERVIEW QUESTIONS GENERATOR
// ──────────────────────────────────────────────────────────────────────────────
router.post("/interview-generator", awardXp, async (req, res, next) => {
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
// 2. RESUME ANALYZER & JOB COMPARATOR — Full ATS Suite
// ──────────────────────────────────────────────────────────────────────────────
router.post("/resume-analyzer", awardXp, async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: "Resume content and Job Description are required." });
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) parser, technical recruiter, and career coach.
Analyze the user's resume text against the target job description and return a comprehensive analysis.
Output MUST be raw JSON format with NO markdown formatting (no backticks, no code block delimiters).
JSON schema to return:
{
  "matchScore": 75,
  "missingKeywords": ["Docker", "Redis", "System Design"],
  "keywordDensity": [
    { "keyword": "React", "inResume": 4, "inJd": 6, "status": "good" },
    { "keyword": "TypeScript", "inResume": 1, "inJd": 5, "status": "low" },
    { "keyword": "Docker", "inResume": 0, "inJd": 3, "status": "missing" }
  ],
  "sectionScores": {
    "contactInfo":    { "score": 90, "feedback": "Name and email present. Consider adding LinkedIn URL." },
    "summary":        { "score": 60, "feedback": "No professional summary found. Adding one improves ATS ranking." },
    "experience":     { "score": 80, "feedback": "Strong work history. Add more quantified metrics." },
    "skills":         { "score": 70, "feedback": "Skills section present. Missing key JD technologies." },
    "education":      { "score": 95, "feedback": "Education clearly listed with degree and institution." },
    "projects":       { "score": 75, "feedback": "Good projects section. Add live links or GitHub URLs." },
    "certifications": { "score": 40, "feedback": "No certifications found. JD may prefer certified candidates." }
  },
  "actionVerbScore": 62,
  "weakVerbs": [
    { "found": "helped with", "suggested": "facilitated" },
    { "found": "worked on", "suggested": "engineered" },
    { "found": "was responsible for", "suggested": "led" }
  ],
  "quantificationScore": 45,
  "unquantifiedBullets": [
    "Developed a backend API for user authentication",
    "Improved website performance"
  ],
  "tailoredSummary": "A 2-3 sentence professional summary tailored specifically for this job description, written in first person, keyword-rich, and ATS-optimized.",
  "bulletImprovements": [
    {
      "original": "Worked on the frontend team building React code",
      "improved": "Engineered reusable React component library, reducing UI development time by 35% across 3 product teams"
    }
  ],
  "overallFeedback": "A concise 3-4 sentence summary of overall resume strengths, critical improvements needed, and top ATS formatting tips."
}
Rules:
- keywordDensity: include top 8-10 most important keywords from the JD. status is "good" (inResume >= inJd*0.5), "low" (inResume > 0 but below threshold), or "missing" (inResume === 0).
- sectionScores: score each section 0-100. If section is absent, score it 0-30.
- actionVerbScore: 0-100. Penalize passive or weak language across all bullet points.
- weakVerbs: identify up to 5 weak or passive phrases and suggest stronger action verbs.
- quantificationScore: 0-100. Percentage of bullet points that include numbers, percentages, or measurable outcomes.
- unquantifiedBullets: list up to 4 bullet points that lack metrics, exactly as they appear in the resume.
- tailoredSummary: write this as if the candidate wrote it — professional, confident, 2-3 sentences, keyword-rich.
- bulletImprovements: pick the 3-4 weakest bullets and rewrite them with strong action verbs, numbers, and JD keywords.`;

    const userPrompt = `Resume text:
${resumeText}

---
Job Description:
${jobDescription}`;

    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini resume-analyzer error:", aiErr.message);
    }

    if (!aiOutput) {
      const mockResult = {
        matchScore: 68,
        missingKeywords: ["TypeScript", "CI/CD Pipelines", "Docker", "Unit Testing"],
        keywordDensity: [
          { keyword: "React",      inResume: 4, inJd: 5, status: "good"    },
          { keyword: "Node.js",    inResume: 3, inJd: 4, status: "good"    },
          { keyword: "TypeScript", inResume: 0, inJd: 6, status: "missing" },
          { keyword: "Docker",     inResume: 0, inJd: 4, status: "missing" },
          { keyword: "MongoDB",    inResume: 2, inJd: 3, status: "good"    },
          { keyword: "REST APIs",  inResume: 1, inJd: 4, status: "low"     },
          { keyword: "Git",        inResume: 2, inJd: 3, status: "good"    },
          { keyword: "CI/CD",      inResume: 0, inJd: 3, status: "missing" },
        ],
        sectionScores: {
          contactInfo:    { score: 85, feedback: "Name and email present. Consider adding a LinkedIn profile URL." },
          summary:        { score: 30, feedback: "No professional summary detected. A tailored summary significantly boosts ATS ranking." },
          experience:     { score: 78, feedback: "Good work history. Add quantified outcomes (%, $ savings, speed improvements) to each bullet." },
          skills:         { score: 65, feedback: "Skills section present but missing key JD technologies: TypeScript, Docker, CI/CD." },
          education:      { score: 92, feedback: "Education clearly listed with degree, institution, and graduation year." },
          projects:       { score: 70, feedback: "Projects section found. Add GitHub links and describe the impact of each project." },
          certifications: { score: 20, feedback: "No certifications found. The JD may prefer AWS/Docker/TypeScript certified candidates." },
        },
        actionVerbScore: 55,
        weakVerbs: [
          { found: "was responsible for", suggested: "owned / led"                         },
          { found: "helped with",         suggested: "collaborated on / facilitated"       },
          { found: "worked on",           suggested: "engineered / developed / built"      },
          { found: "did testing",         suggested: "validated / executed test suites"    },
        ],
        quantificationScore: 38,
        unquantifiedBullets: [
          "Developed a backend API for user authentication",
          "Improved website performance and fixed bugs",
          "Assisted the team in building mobile-responsive layouts",
        ],
        tailoredSummary: "Full-stack developer with 2+ years of experience building scalable web applications using React and Node.js. Proficient in RESTful API design, MongoDB, and agile workflows. Eager to contribute to innovative engineering teams and expand expertise in TypeScript and cloud-native technologies.",
        bulletImprovements: [
          {
            original: "Developed web application using NodeJS and React.",
            improved: "Engineered a full-stack client portal in React/Node.js, processing 500+ daily user requests with sub-200ms API response times.",
          },
          {
            original: "Responsible for fixing bugs in production code.",
            improved: "Resolved 30+ critical production bugs using Chrome DevTools and structured logging, reducing crash rate by 22%.",
          },
          {
            original: "Helped the team with code reviews.",
            improved: "Conducted weekly code reviews for a 4-member team, enforcing ESLint standards and cutting regression rate by 15%.",
          },
        ],
        overallFeedback: "Your resume demonstrates solid full-stack fundamentals but needs stronger ATS signals. Add a tailored professional summary, quantify at least 60% of your bullet points with metrics, and incorporate the missing keywords (TypeScript, Docker, CI/CD) into your skills and experience sections. Avoid tables or multi-column layouts as they break most ATS parsers.",
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
router.post("/project-report", awardXp, async (req, res, next) => {
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
router.post("/coding-helper", awardXp, async (req, res, next) => {
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
router.post("/study-assistant", awardXp, async (req, res, next) => {
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

    let reply = null;
    try {
      reply = await callGemini(systemPrompt, contents);
    } catch (aiErr) {
      console.error("Gemini study-buddy error:", aiErr.message);
    }

    if (!reply) {
      // All models quota-exhausted — return friendly offline message
      reply = `⚠️ **AI Quota Reached** — All Gemini models are temporarily rate-limited on the free tier.\n\n` +
        `**What you can do:**\n` +
        `- Wait ~1 minute and try again (free tier resets per minute)\n` +
        `- Upgrade your Gemini API key plan at [ai.google.dev](https://ai.google.dev)\n` +
        `- In the meantime, I can still help with offline explanations!\n\n` +
        `*(Last error: quota exhausted)*`;
    }

    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. AI PROJECT IDEA GENERATOR (ANTI-CLICHE)
// ──────────────────────────────────────────────────────────────────────────────
router.post("/project-idea-generator", awardXp, async (req, res, next) => {
  try {
    const { techStack, level, domain } = req.body;

    if (!techStack || techStack.length === 0) {
      return res.status(400).json({ success: false, message: "Tech stack is required." });
    }

    const techStackArray = Array.isArray(techStack) 
      ? techStack 
      : String(techStack).split(",").map(t => t.trim()).filter(Boolean);
      
    const techStackStr = techStackArray.join(", ");
    const levelStr = level || "Intermediate";
    const domainStr = domain && domain !== "any" ? domain : "General / Multi-disciplinary";

    const systemPrompt = `You are a visionary software architect and senior developer mentor.
Generate exactly 3 unique, non-cliché project ideas that solve real-world problems.
DO NOT suggest standard clichés like To-Do lists, Weather apps, Simple chats, E-commerce/Netflix clones, recipe apps, notes apps, or basic calculators.
Each project must have a clear value proposition, comparison against typical cliché alternatives, tech stack alignment, and a step-by-step architectural roadmap.
Output MUST be raw JSON format with NO markdown formatting (no backticks, no markdown code block formatting).
JSON format:
[
  {
    "title": "Anti-Cliche Project Title",
    "clicheComparison": "Contrast this with the typical cliche. E.g. 'Instead of a basic e-commerce store, this is a community-driven excess-food sharing marketplace...'",
    "description": "A detailed explanation of the project idea, what it solves, and why it is interesting.",
    "realWorldProblem": "The specific real-world problem it addresses.",
    "techStackUsed": ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    "difficulty": "Intermediate",
    "features": [
      {
        "name": "Feature 1",
        "description": "Details of feature 1"
      },
      {
        "name": "Feature 2",
        "description": "Details of feature 2"
      },
      {
        "name": "Feature 3",
        "description": "Details of feature 3"
      }
    ],
    "architecturalRoadmap": [
      "Step 1: Set up the DB schema and write migrations for energy tracking.",
      "Step 2: Build the core backend API to calculate energy decay and priority coefficients.",
      "Step 3: Develop the frontend dashboard with Framer Motion transitions."
    ]
  }
]`;

    const userPrompt = `Generate 3 anti-cliche projects for:
- Tech Stack: ${techStackStr}
- Experience level: ${levelStr}
- Target Domain/Theme: ${domainStr}
Ensure ideas are highly innovative and align with the provided tech stack.`;

    // Wrapped: callGemini returns null on quota exhaustion
    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini project-idea-generator error:", aiErr.message);
    }

    if (!aiOutput) {
      // Mock Fallback using the user's tech stack and experience level
      const mockResult = [
        {
          title: "EcoRoute: Dynamic Carbon-Footprint Transit Optimizer",
          clicheComparison: "Instead of a generic Google Maps clone or weather tracker, EcoRoute calculates carbon emission metrics per transport option in real-time, helping users budget their green transit.",
          description: `A green logistics dashboard built on ${techStackStr} that overlays real-time public transit APIs, ridesharing emissions, and pedestrian routing to give users a unified 'carbon score' for their daily commute.`,
          realWorldProblem: "Inability for urban commuters to easily quantify and reduce their personal daily transportation emissions.",
          techStackUsed: techStackArray,
          difficulty: levelStr,
          features: [
            { name: "Multi-Modal Emission Engine", description: "Calculates precise CO2 metrics based on transport type and vehicle efficiency parameters." },
            { name: "Gamified Green Goals", description: "Users earn badges and rank on a local neighborhood leaderboard for carbon reduction." },
            { name: "Route Comparison Chart", description: "Interactive visual comparison of speed vs. emissions vs. cost." }
          ],
          architecturalRoadmap: [
            "Step 1: Set up server-side integration with open routing APIs (like OpenRouteService or Google Directions).",
            "Step 2: Implement emission calculation equations based on EPA guidelines.",
            "Step 3: Build a responsive dashboard UI with active charts displaying route comparison statistics."
          ]
        },
        {
          title: "FocusShift: Cognitive Energy Task Scheduler",
          clicheComparison: "Instead of a basic To-Do checklist or kanban board, FocusShift maps out tasks according to the user's circadian rhythm and mental energy levels.",
          description: `An intelligent productivity app built on ${techStackStr} where users log their high/medium/low energy periods, and tasks are automatically scheduled to run during their peak cognitive hours.`,
          realWorldProblem: "Standard calendar systems encourage static scheduling, which leads to burnout and drop in student productivity during low-energy states.",
          techStackUsed: techStackArray,
          difficulty: levelStr,
          features: [
            { name: "Chronotype Questionnaire", description: "Determines user's natural daily energy flow (morning person vs. night owl)." },
            { name: "Adaptive Task Prioritizer", description: "Algorithmically reschedules high-difficulty coding tasks to high-energy time slots." },
            { name: "Focus Timer with Decay", description: "A smart timer that adjusts break intervals depending on duration of previous focused blocks." }
          ],
          architecturalRoadmap: [
            "Step 1: Define database schemas for user chronotypes, tasks, and historical productivity logs.",
            "Step 2: Develop the scheduling algorithm that scores tasks by energy requirements.",
            "Step 3: Create a clean, distraction-free timer dashboard with ambient animations."
          ]
        },
        {
          title: "NeighbourAid: Peer-to-Peer Local Skill Swap",
          clicheComparison: "Instead of a basic social media feed or e-commerce clone, NeighbourAid uses mutual credit and local networking to swap skills without monetary transactions.",
          description: `A localized platform built on ${techStackStr} where community members trade skills (e.g. coding tutoring for plumbing help) using a time-banked credit system.`,
          realWorldProblem: "High cost of professional services and educational tutoring, which isolates local community members from exchanging value.",
          techStackUsed: techStackArray,
          difficulty: levelStr,
          features: [
            { name: "Mutual Trust Time-ledger", description: "Keeps transaction history of hours served and hours consumed securely." },
            { name: "Geofenced Skill Search", description: "Locates users with desired skills within a customizable 5-kilometer radius." },
            { name: "Interactive Availability Calendar", description: "Allows real-time scheduling and booking of swap sessions." }
          ],
          architecturalRoadmap: [
            "Step 1: Build the backend ledger services for time-credit verification.",
            "Step 2: Add geolocation queries in the database to retrieve nearby users efficiently.",
            "Step 3: Implement an instant chat-request flow to coordinate swap meetups."
          ]
        }
      ];
      return res.status(200).json({ success: true, ideas: mockResult, quotaFallback: true });
    }

    try {
      const ideas = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, ideas });
    } catch (parseErr) {
      console.error("AI JSON Parse Error:", parseErr.message, "\nRaw:", aiOutput);
      res.status(500).json({ success: false, message: "Failed to parse AI-generated project ideas. Try again." });
    }
  } catch (err) {
    next(err);
  }
});


// ──────────────────────────────────────────────────────────────────────────────
// 7. SMART NOTES GENERATOR SUITE
// ──────────────────────────────────────────────────────────────────────────────
router.post("/smart-notes/generate", awardXp, async (req, res, next) => {
  try {
    const { subject, style, mode, filesContext, customSyllabusText } = req.body;

    const systemPrompt = `You are a professional academic notes generator and study advisor.
Generate rich, detailed, and highly structured study notes on the subject: "${subject || "General Study"}".
Incorporate any provided file context or syllabus text.
Your response MUST be a raw JSON object with NO markdown code block formatting (no backticks, no code fence blocks).
JSON Schema:
{
  "title": "A precise and descriptive note title",
  "content": "Comprehensive and detailed notes formatted in rich Markdown, including headings, lists, concepts, code examples, and theoretical walkthroughs. DO NOT summarize briefly; make it highly useful and educational.",
  "keyTakeaways": ["Takeaway bullet point 1", "Takeaway bullet point 2", "Takeaway bullet point 3", "Takeaway bullet point 4"],
  "formulas": ["Key equation, theorem, or functional law (optional)", "Another equation (optional)"]
}`;

    const userPrompt = `Subject: ${subject}
Note Style: ${style}
Study Mode: ${mode}
Syllabus Focus: ${customSyllabusText || "None specified"}
Uploaded File Text Context:
${filesContext || "No files uploaded"}`;

    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini smart-notes error:", aiErr.message);
    }

    if (!aiOutput) {
      // Fallback
      const fallbackResult = {
        title: `${subject || "General"} - Study Notes`,
        content: `### Summary of ${subject || "General Study"}\n\nThis note revision is matching the style **${style}** and study mode **${mode}**. \n\n* **Syllabus Focus:** ${customSyllabusText || "Standard Subject Curriculum"}\n\n* **Extracted File Context:** ${filesContext ? filesContext.substring(0, 150) + "..." : "No additional text files uploaded."}\n\n*(Note: This is a fallback note since AI credits are temporarily limited. Use the study buddy chat below to ask specific details).*`,
        keyTakeaways: [
          `Focusing on ${subject || "general study concepts"}.`,
          "Structure aligns with academic guidelines.",
          "Check the flashcards and quiz section for self-assessments."
        ],
        formulas: []
      };
      return res.status(200).json({ success: true, note: fallbackResult, isFallback: true });
    }

    try {
      const note = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, note });
    } catch (parseErr) {
      console.warn("Smart-notes JSON parse error, formatting raw text:", parseErr.message);
      const cleanContent = aiOutput.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
      const extractedNote = {
        title: `${subject || "Study"} Notes`,
        content: cleanContent,
        keyTakeaways: [
          `Key study concepts for ${subject || "this topic"}.`,
          "Structure aligns with academic guidelines.",
          "Review step-by-step logic and formulas before exams."
        ],
        formulas: []
      };
      res.status(200).json({ success: true, note: extractedNote });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/smart-notes/chat", awardXp, async (req, res, next) => {
  try {
    const { message, history, filesContext, subject } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const systemPrompt = `You are a helpful, professional, and smart AI Study Buddy and academic tutor.
Answer the student's question about the notes or study materials.
Use the provided extracted text context from their uploaded study files as the primary source of truth:
[STUDY CONTEXT]
${filesContext || "No files uploaded."}

If the question is not directly related to the study context, use your general knowledge to answer clearly, step-by-step, using Markdown for formatting.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.sender === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let reply = null;
    try {
      reply = await callGemini(systemPrompt, contents);
    } catch (aiErr) {
      console.error("Gemini smart-notes chat error:", aiErr.message);
    }

    if (!reply) {
      reply = "⚠️ **AI Quota Reached** — The generative AI models are temporarily rate-limited. Please try again in 1 minute.";
    }

    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
});

router.post("/smart-notes/flashcards", awardXp, async (req, res, next) => {
  try {
    const { subject, filesContext } = req.body;

    const systemPrompt = `You are a helpful study advisor.
Generate exactly 4-6 high-yield flashcards (question and answer) based on the provided study subject and text context.
Output MUST be a raw JSON array of objects with NO markdown formatting (no backticks, no code fence blocks).
JSON Format:
[
  {
    "front": "The concept question or key term",
    "back": "Detailed but concise answer or definition",
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]`;

    const userPrompt = `Subject: ${subject}
Context:
${filesContext || "No files uploaded."}`;

    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini flashcard generator error:", aiErr.message);
    }

    if (!aiOutput) {
      // Mock Fallback
      const fallbackFlashcards = [
        { front: `Explain the core concept of ${subject || "this topic"}.`, back: "This refers to the primary framework and foundational concepts outlined in the syllabus.", difficulty: "Medium" },
        { front: "Why is self-testing effective?", back: "Active recall reinforces neural connections and strengthens memory retention.", difficulty: "Easy" }
      ];
      return res.status(200).json({ success: true, flashcards: fallbackFlashcards, isFallback: true });
    }

    try {
      const flashcards = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, flashcards });
    } catch (parseErr) {
      console.error("Failed to parse flashcards json:", parseErr.message);
      res.status(500).json({ success: false, message: "AI flashcard parsing failed. Try again." });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/smart-notes/quiz", awardXp, async (req, res, next) => {
  try {
    const { subject, filesContext } = req.body;

    const systemPrompt = `You are an academic test generator.
Generate exactly 3-5 quiz questions based on the study subject and text context.
Include a mix of MCQs, True/False, and Fill-in-the-blank questions.
Output MUST be a raw JSON array of objects with NO markdown formatting (no backticks, no code fence blocks).
JSON Format:
[
  {
    "type": "MCQ" | "TrueFalse" | "FillBlank",
    "question": "The question description",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only include for MCQ or True/False (e.g. ["True", "False"])
    "answer": "The exact correct answer matching one of the options (or the exact fill-in value)",
    "explanation": "Brief explanation of why this answer is correct."
  }
]`;

    const userPrompt = `Subject: ${subject}
Context:
${filesContext || "No files uploaded."}`;

    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini quiz generator error:", aiErr.message);
    }

    if (!aiOutput) {
      const fallbackQuiz = [
        { type: "TrueFalse", question: `Reviewing ${subject || "study subjects"} regularly increases exam scores.`, options: ["True", "False"], answer: "True", explanation: "Distributed practice is proven to boost performance." }
      ];
      return res.status(200).json({ success: true, quiz: fallbackQuiz, isFallback: true });
    }

    try {
      const quiz = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, quiz });
    } catch (parseErr) {
      console.error("Failed to parse quiz json:", parseErr.message);
      res.status(500).json({ success: false, message: "AI quiz parsing failed. Try again." });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/smart-notes/mindmap", awardXp, async (req, res, next) => {
  try {
    const { subject, topic, filesContext } = req.body;

    const systemPrompt = `You are a visual learning architect.
Generate a dynamic, structured Mind Map hierarchy for the topic "${topic || "Core Architecture"}" in the subject "${subject || "General Study"}".
Output MUST be a raw JSON object with NO markdown code fence blocks.
JSON Schema:
{
  "id": "root",
  "label": "${subject || "General"} - ${topic || "Core Principles"}",
  "color": "#a855f7",
  "expanded": true,
  "children": [
    {
      "id": "branch-1",
      "label": "Fundamentals & Definitions",
      "color": "#ea580c",
      "expanded": true,
      "children": [
        { "id": "sub-1", "label": "Core Mechanism" },
        { "id": "sub-2", "label": "Primary Rules" }
      ]
    },
    {
      "id": "branch-2",
      "label": "Architectural Components",
      "color": "#3b82f6",
      "expanded": false,
      "children": [
        { "id": "sub-3", "label": "Data Flow & Execution" },
        { "id": "sub-4", "label": "State Management" }
      ]
    },
    {
      "id": "branch-3",
      "label": "Exam & Application Scenarios",
      "color": "#10b981",
      "expanded": false,
      "children": [
        { "id": "sub-5", "label": "Common Mistakes" },
        { "id": "sub-6", "label": "Performance Optimization" }
      ]
    }
  ]
}`;

    const userPrompt = `Subject: ${subject}\nTopic: ${topic || "Core Concepts"}\nContext:\n${filesContext || "No files uploaded."}`;

    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini mindmap generator error:", aiErr.message);
    }

    if (!aiOutput) {
      const fallbackMindMap = {
        id: "root",
        label: `${subject || "General"} - ${topic || "Overview"}`,
        color: "#a855f7",
        expanded: true,
        children: [
          {
            id: "b1",
            label: "Core Principles",
            color: "#ea580c",
            expanded: true,
            children: [{ id: "s1", label: "Fundamental Concepts" }, { id: "s2", label: "Key Rules" }]
          },
          {
            id: "b2",
            label: "Practical Applications",
            color: "#3b82f6",
            expanded: false,
            children: [{ id: "s3", label: "Code & Logic Examples" }]
          }
        ]
      };
      return res.status(200).json({ success: true, mindmap: fallbackMindMap, isFallback: true });
    }

    try {
      const mindmap = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, mindmap });
    } catch (parseErr) {
      console.error("Failed to parse mindmap json:", parseErr.message);
      res.status(500).json({ success: false, message: "AI mindmap parsing failed. Try again." });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
