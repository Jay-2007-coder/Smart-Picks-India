"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Compass, Search, Award, Flame, Bell, Settings,
  Star, Bookmark, ChevronDown, ChevronRight, X, Sparkles, Zap,
  Trophy, Briefcase, BookOpen, Check, Copy, HelpCircle, FileText,
  ChevronUp, Users, Code, Terminal, Clock, ShieldAlert, Heart,
  Building, Brain, Server, ShieldCheck, TrendingUp, DollarSign,
  ListTodo, Map, Activity, ExternalLink, GraduationCap, LayoutGrid,
  CheckSquare, RefreshCw, Lock as LockIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─────────────── TYPES & INTERFACES ─────────────── */
interface TechCard {
  name: string;
  whatIsIt: string;
  whyUsed: string;
  analogy: string;
  beginnerDesc: string;
  advancedDesc: string;
  advantages: string[];
  limitations: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  learningTime: string;
  prerequisites: string[];
  interviewQuestion: { q: string; a: string };
  miniProject: { title: string; desc: string };
  resources: string[];
}

interface RoadmapNode {
  id: string;
  title: string;
  phase: "Foundation" | "Core Concepts" | "Projects" | "Advanced Concepts" | "Industry Tools" | "Deployment" | "System Design" | "Interview Preparation" | "Job Ready";
  explanation: string;
  objectives: string[];
  timeEstimate: string;
  resources: string[];
  projectCheckpoint: { title: string; desc: string };
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

interface SkillNode {
  id: string;
  name: string;
  tier: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  whyMatters: string;
  dependencies: string[];
  hours: number;
  importance: "High" | "Medium" | "Low";
  techs: string[];
  unlocked: boolean;
  completed: boolean;
}

interface ProjectDetails {
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Industry-Level";
  problemStatement: string;
  features: string[];
  architecture: string;
  techStack: string[];
  outcomes: string[];
  completionTime: string;
  resumeValue: number; // 1 to 5
}

interface RoleDetails {
  role: string;
  icon: any;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  demand: "High" | "Very High" | "Critical";
  growth: string; // percentage
  remoteWork: "Yes" | "Partial" | "No";
  about: string;
  importance: string;
  problemsSolved: string;
  responsibilities: string[];
  industries: {
    name: string;
    howUsed: string;
    example: string;
    growthPotential: string;
  }[];
  technologies: TechCard[];
  roadmap: RoadmapNode[];
  skillsTree: SkillNode[];
  projects: ProjectDetails[];
  placementPrep: {
    dsa: string;
    systemDesign: string;
    coreSubjects: string[];
    resumeRules: string[];
    githubRules: string[];
    portfolioRules: string[];
    mockQuestions: { q: string; topic: string }[];
  };
  salaries: {
    internship: number; // INR per month
    fresher: number; // LPA
    mid: number; // LPA
    senior: number; // LPA
    globalTrend: string;
    remoteTrend: string;
  };
  trends: {
    trendingTechs: string[];
    emergingSkills: string[];
    predictions: string;
  };
}

/* ─────────────── DOMAINS CATALOG ─────────────── */
const DOMAINS = [
  {
    name: "Software Development",
    roles: ["Frontend Developer", "Backend Developer", "Full Stack MERN Developer", "Java Full Stack Developer", "Python Full Stack Developer"]
  },
  {
    name: "Mobile Development",
    roles: ["Android Developer", "Flutter Developer", "iOS Developer", "React Native Developer"]
  },
  {
    name: "Artificial Intelligence",
    roles: ["AI Engineer", "Machine Learning Engineer", "Deep Learning Engineer", "Data Scientist", "Generative AI Engineer", "AI Agent Engineer", "Prompt Engineer", "Computer Vision Engineer", "NLP Engineer"]
  },
  {
    name: "Cloud & DevOps",
    roles: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer (SRE)", "Platform Engineer", "MLOps Engineer"]
  },
  {
    name: "Data Domain",
    roles: ["Data Analyst", "Data Engineer", "Business Intelligence Developer", "Database Administrator"]
  },
  {
    name: "Security Domain",
    roles: ["Cyber Security Analyst", "Ethical Hacker", "Penetration Tester", "Security Engineer"]
  },
  {
    name: "Emerging Technologies",
    roles: ["Blockchain Developer", "Web3 Developer", "AR/VR Developer", "Game Developer", "IoT Engineer", "Robotics Engineer"]
  },
  {
    name: "Career Tracks",
    roles: ["Freelancing", "Startup Founder", "Technical Product Manager", "Solutions Architect", "System Design Engineer"]
  }
];

export default function CareerBlueprintHub() {
  const { user, loading: authLoading } = useAuth() as any;

  // Selected Career track details
  const [selectedRole, setSelectedRole] = useState("Full Stack MERN Developer");
  const [selectedDomain, setSelectedDomain] = useState("Software Development");
  const [activeTab, setActiveTab] = useState<"overview" | "salaries" | "technologies" | "roadmap" | "skills" | "projects" | "placement" | "mentor">("overview");
  
  // Navigation sidebar search query
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  
  // Comparative analysis state
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareRoleA, setCompareRoleA] = useState("Full Stack MERN Developer");
  const [compareRoleB, setCompareRoleB] = useState("AI Agent Engineer");

  // Dynamic user gamified metrics
  const [xp, setXp] = useState(2450);
  const [streak, setStreak] = useState(12);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(["Pioneer", "Skill Builder"]);
  const [completedNodesMap, setCompletedNodesMap] = useState<Record<string, boolean>>({});
  const [selectedQuizNodeId, setSelectedQuizNodeId] = useState<string | null>(null);
  const [quizAnswerIndex, setQuizAnswerIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);
  
  // Dynamic card expands
  const [expandedTechCard, setExpandedTechCard] = useState<string | null>(null);
  const [selectedRoadmapNode, setSelectedRoadmapNode] = useState<string | null>(null);
  const [selectedSkillNode, setSelectedSkillNode] = useState<string | null>(null);

  // AI Mentor Chat console state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: "user" | "assistant"; text: string }[]>([
    {
      id: "mentor-init",
      sender: "assistant",
      text: "🎓 Welcome to your AI Career Mentor Console. I can help evaluate which path suits your strengths, suggest project ideas, design custom schedules, or answer questions about salary trends. Try selecting one of the quick prompts below!"
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState<string[]>([
    "🎉 Career blueprint dashboard loaded. Complete milestones to earn XP!",
    "🔥 12-Day Streak active."
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Local Storage synchronizer
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedXp = localStorage.getItem("smartpicks_blueprint_xp");
      const savedStreak = localStorage.getItem("smartpicks_blueprint_streak");
      const savedBadges = localStorage.getItem("smartpicks_blueprint_badges");
      const savedNodes = localStorage.getItem("smartpicks_blueprint_completed_nodes");
      
      if (savedXp) setXp(parseInt(savedXp));
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedBadges) setUnlockedBadges(JSON.parse(savedBadges));
      if (savedNodes) setCompletedNodesMap(JSON.parse(savedNodes));
    }
  }, []);

  // Update chat layout scroll bounds
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const addXp = (amount: number, reason: string) => {
    setXp(prev => {
      const next = prev + amount;
      localStorage.setItem("smartpicks_blueprint_xp", next.toString());
      return next;
    });
    // Add badge check
    if (xp > 3000 && !unlockedBadges.includes("Master Explorer")) {
      const newBadges = [...unlockedBadges, "Master Explorer"];
      setUnlockedBadges(newBadges);
      localStorage.setItem("smartpicks_blueprint_badges", JSON.stringify(newBadges));
    }
  };

  /* ─────────────── HIGHLY POLISHED HARDCODED DATABASE VALUES ─────────────── */
  const MOCK_ROLES_DATABASE: Record<string, RoleDetails> = useMemo(() => {
    return {
      "Full Stack MERN Developer": {
        role: "Full Stack MERN Developer",
        icon: LayoutGrid,
        category: "Software Development",
        level: "Beginner",
        duration: "6 Months",
        difficulty: "Medium",
        demand: "Critical",
        growth: "28%",
        remoteWork: "Yes",
        about: "A MERN Full Stack Developer builds dynamic, high-performance web applications using JavaScript/TypeScript across all application layers. MERN represents MongoDB, Express.js, React, and Node.js.",
        importance: "MERN stack enables fast, modular single-language development (JavaScript/TypeScript) from front to back, maximizing code reuse and operational speed for startups and tech products alike.",
        problemsSolved: "Removes language mismatch friction between browser and server, handles heavy concurrent data streams, and accelerates MVP development cycles.",
        responsibilities: [
          "Design scalable schema models in MongoDB and write robust backend logic with Express.",
          "Develop interactive component architectures in React and handle state flows with Next.js/Zustand.",
          "Construct secure OAuth/JWT user authentication protocols and design performant REST & GraphQL APIs.",
          "Package containers with Docker and deploy endpoints on AWS/Vercel."
        ],
        industries: [
          { name: "SaaS & Startups", howUsed: "Rapid deployment of scalable MVP dashboards, chat systems, and customer registries.", example: "Slack, Notion, Miro", growthPotential: "High" },
          { name: "E-Commerce", howUsed: "Constructing inventory feeds, checkout sequences, and personalized analytics boards.", example: "Shopify ecosystem partners", growthPotential: "Stable" },
          { name: "EdTech & FinTech", howUsed: "Processing interactive courses, document uploads, and payment ledgers.", example: "Razorpay portal dashboards", growthPotential: "High" }
        ],
        technologies: [
          {
            name: "React.js",
            whatIsIt: "A component-based frontend library developed by Facebook for building single-page user interfaces.",
            whyUsed: "Virtual DOM allows swift updates, components make code modular and reusable, and the ecosystem is massive.",
            analogy: "Like Lego blocks: you construct self-contained modules (buttons, panels) and connect them to build a complex castle.",
            beginnerDesc: "A library that lets you construct custom HTML structures in JavaScript (JSX) that refresh automatically when data changes.",
            advancedDesc: "Declarative UI framework leveraging abstract reconciliations, fiber-based scheduler queues, hook bindings, and state streams.",
            advantages: ["Modular architecture", "Fast rendering via virtual DOM", "Rich community ecosystems"],
            limitations: ["Steep initial JSX learning curve", "Requires state library boilerplate for large apps"],
            difficulty: "Medium",
            learningTime: "4 Weeks",
            prerequisites: ["HTML5", "CSS3", "ES6 JavaScript"],
            interviewQuestion: {
              q: "Explain React's reconciliation process and what the Virtual DOM is.",
              a: "React creates an in-memory virtual representation of the DOM. When state changes, a new Virtual DOM tree is generated. React diffs the old and new trees using an optimized heuristic algorithm, batching updates to commit only modified elements to the real browser DOM, minimizing layout repaints."
            },
            miniProject: {
              title: "Interactive Kanban taskboard",
              desc: "A card taskboard enabling drag-and-drop actions, local-storage state persistency, and custom search tags."
            },
            resources: ["Official React Docs", "Beta.reactjs.org guide", "Scrimba React Course"]
          },
          {
            name: "Node.js & Express",
            whatIsIt: "Node.js is a runtime enabling JavaScript execution on servers. Express is a minimalist web framework for building APIs.",
            whyUsed: "Runs on Chrome V8 engine, uses an asynchronous event loop for rapid file I/O operations, and supports NPM packages.",
            analogy: "Like a restaurant kitchen: Node is the fast chef executing orders asynchronously, and Express is the waiter dispatching menu tickets.",
            beginnerDesc: "Server tools allowing JavaScript to query database records, secure routes, and process client requests.",
            advancedDesc: "Single-threaded non-blocking network stack utilizing libuv event loops, system-level thread pool schedules, and modular middlewares.",
            advantages: ["Fast asynchronous execution", "Unified language stack", "Vast NPM repository"],
            limitations: ["Single-threaded compute bottlenecks", "Callback hell issues if asynchronous logic isn't handled with promises"],
            difficulty: "Medium",
            learningTime: "5 Weeks",
            prerequisites: ["Asynchronous JS", "REST conventions"],
            interviewQuestion: {
              q: "What is the libuv library and event loop in Node?",
              a: "Libuv is a multi-platform C support library that handles asynchronous I/O, file operations, thread pools, and network requests. The event loop continuously schedules task queues: timers, pending callbacks, poll phases, and close handlers, offloading intensive system operations to helper threads."
            },
            miniProject: {
              title: "Dynamic REST API with file attachments",
              desc: "Write middleware-restricted endpoints for user profiles supporting secure image uploads via Multer."
            },
            resources: ["Nodejs.org guides", "ExpressJS API manual", "FreeCodeCamp Node Course"]
          }
        ],
        roadmap: [
          {
            id: "mern-node-1",
            title: "Web foundations & JavaScript",
            phase: "Foundation",
            explanation: "Master HTML5 semantics, flexbox/grid layout flows, and ES6 JavaScript parameters (promises, closures, destructuring).",
            objectives: ["Build responsive static page mockups", "Write clean recursive scripts", "Interact with Fetch APIs"],
            timeEstimate: "3 Weeks",
            resources: ["MDN Web Docs", "JavaScript.info", "Odin Project"],
            projectCheckpoint: { title: "Custom API Weather Board", desc: "A dashboard fetching weather stats with animated visual graphs." },
            quiz: {
              question: "Which array function in JavaScript modifies the original array inline?",
              options: ["map()", "filter()", "splice()", "slice()"],
              answerIndex: 2,
              explanation: "splice() modifies the original array by removing or replacing items. slice() creates a copy."
            }
          },
          {
            id: "mern-node-2",
            title: "React components & hooks",
            phase: "Core Concepts",
            explanation: "Understand state, props, rendering, useEffect, useMemo, custom hooks, and context APIs.",
            objectives: ["Design modular components", "Implement context state boundaries", "Build custom hook queries"],
            timeEstimate: "4 Weeks",
            resources: ["React Official Documentation", "Traversy React course"],
            projectCheckpoint: { title: "E-Commerce checkout cart", desc: "A state-driven cart counting prices, applying promo codes, and maintaining state." },
            quiz: {
              question: "What hook is used to cache complex computation results across component re-renders?",
              options: ["useEffect", "useCallback", "useMemo", "useRef"],
              answerIndex: 2,
              explanation: "useMemo caches the computed value of an expensive calculation, while useCallback caches the callback function itself."
            }
          }
        ],
        skillsTree: [
          { id: "s-mern-1", name: "Semantic HTML & CSS", tier: "Beginner", whyMatters: "Essential foundation for writing structured pages.", dependencies: [], hours: 40, importance: "High", techs: ["HTML", "CSS"], unlocked: true, completed: false },
          { id: "s-mern-2", name: "DOM & ES6 JavaScript", tier: "Beginner", whyMatters: "Allows writing interactive browser behaviors.", dependencies: ["s-mern-1"], hours: 80, importance: "High", techs: ["JS"], unlocked: true, completed: false },
          { id: "s-mern-3", name: "React Components", tier: "Intermediate", whyMatters: "Building block for modular components.", dependencies: ["s-mern-2"], hours: 120, importance: "High", techs: ["React"], unlocked: false, completed: false },
          { id: "s-mern-4", name: "Express API Engines", tier: "Intermediate", whyMatters: "Powers the data exchange layer.", dependencies: ["s-mern-2"], hours: 100, importance: "High", techs: ["Express", "Node"], unlocked: false, completed: false },
          { id: "s-mern-5", name: "Database Schema Models", tier: "Advanced", whyMatters: "Defines business data storage shapes.", dependencies: ["s-mern-4"], hours: 60, importance: "High", techs: ["MongoDB", "PostgreSQL"], unlocked: false, completed: false },
          { id: "s-mern-6", name: "DevOps Container Deployment", tier: "Expert", whyMatters: "Pushes local code to global production scales.", dependencies: ["s-mern-5"], hours: 90, importance: "Medium", techs: ["Docker", "AWS"], unlocked: false, completed: false }
        ],
        projects: [
          {
            title: "MERN SaaS Project Tracker",
            level: "Industry-Level",
            problemStatement: "Engineering teams need a place to map sprint velocity, logs, and task cards without visual clutter.",
            features: ["Interactive drag kanban board", "Real-time user edits via WebSockets", "Role access checks", "Performance telemetry dashboards"],
            architecture: "Client-Server split with MongoDB replication sets, JWT cookies, and Redis cache layer.",
            techStack: ["React", "Express", "Node", "MongoDB", "Redis", "Socket.io"],
            outcomes: ["State synchronization logic", "Database transaction configurations", "Performance caching benchmarks"],
            completionTime: "4 Weeks",
            resumeValue: 5
          }
        ],
        placementPrep: {
          dsa: "Strong basics of arrays, hash maps, two-pointer algorithms, and stack queries. Tree recursion for routing layouts is secondary.",
          systemDesign: "Caching layers (Redis), rate-limiting middleware, CORS setups, load balancers, database horizontal scaling.",
          coreSubjects: ["Computer Networks", "Database Management Systems (DBMS)", "Operating Systems fundamentals"],
          resumeRules: ["Include active links to deployed full-stack products.", "Detail API latency reductions achieved with caching ($X$\\% metrics)."],
          githubRules: ["Create structured README files.", "Demonstrate Git workflow patterns with pull requests and code reviews."],
          portfolioRules: ["Provide single-page fast-loading profiles.", "Host interactive project demonstrations directly on the web."],
          mockQuestions: [
            { q: "What is CORS, and how do you resolve its issues on Node endpoints?", topic: "Backend Networking" },
            { q: "Explain the difference between state and props in React.", topic: "Frontend State" }
          ]
        },
        salaries: {
          internship: 25000,
          fresher: 6.5,
          mid: 14.5,
          senior: 28,
          globalTrend: "High international outsourcing and remote demand.",
          remoteTrend: "Ranges from $25,000 to $80,000 USD for offshore engineers."
        },
        trends: {
          trendingTechs: ["Next.js Server Actions", "TypeScript strict configuration", "Zustand global stores"],
          emergingSkills: ["Edge runtime optimizations", "AI SDK interfaces integration"],
          predictions: "Traditional SPAs are shifting toward server-rendered hybrid structures to improve SEO metrics and performance."
        }
      },

      "AI Agent Engineer": {
        role: "AI Agent Engineer",
        icon: Brain,
        category: "Artificial Intelligence",
        level: "Advanced",
        duration: "8 Months",
        difficulty: "Hard",
        demand: "Critical",
        growth: "45%",
        remoteWork: "Yes",
        about: "AI Agent Engineers build autonomous systems that can perceive environment triggers, make choices using LLMs, use tools (via APIs), maintain context memory, and cooperate in multi-agent networks.",
        importance: "Moves AI usage from simple chatbots to autonomous systems that perform actual workflows on external software.",
        problemsSolved: "Overcomes context limitations of simple prompts, enables AI self-correction, and automates multi-step processes.",
        responsibilities: [
          "Design system prompts, agent structures, and API tools for LLM agents.",
          "Build multi-agent coordinate systems with LangGraph, CrewAI, or AutoGen.",
          "Implement vector databases and semantic memory structures.",
          "Optimize prompt sequences, model costs, latency, and reliability loops."
        ],
        industries: [
          { name: "Automations & enterprise", howUsed: "Building autonomous customer workflows, scanning documents, and updating databases.", example: "Salesforce Agentforce, n8n integration", growthPotential: "Critical" },
          { name: "Software Development", howUsed: "Automating developer environments, running tests, fixing bugs, and compiling code.", example: "Devin-like code agents", growthPotential: "Critical" }
        ],
        technologies: [
          {
            name: "LangGraph",
            whatIsIt: "A framework by LangChain to build multi-agent applications using stateful graphs.",
            whyUsed: "Supports cyclic graph loops, state persistency, human-in-the-loop validation, and parallel execution.",
            analogy: "Like a board of directors: every node is a specialized agent, and the graph defines how decisions are routed between them.",
            beginnerDesc: "A programming library to build AI agent steps as flowcharts that can pass information back and forth.",
            advancedDesc: "Stateful orchestration library using directed graphs with execution checkpointing, parallel runs, and state history replay.",
            advantages: ["Supports complex feedback loops", "Granular state control", "Built-in telemetry integrations"],
            limitations: ["Steep learning curve compared to simple chains", "High prompt tokens cost"],
            difficulty: "Hard",
            learningTime: "4 Weeks",
            prerequisites: ["Python async", "LangChain basics"],
            interviewQuestion: {
              q: "Explain how state persistency is managed in LangGraph nodes.",
              a: "LangGraph uses checkpointers to save the state of the graph at every step. This state includes message logs and internal variables. If a node fails, requires human input, or loops back, the system can restore the state from any point in the history."
            },
            miniProject: {
              title: "Autonomous Research Agent",
              desc: "A multi-agent team where Agent 1 searches the web, Agent 2 checks facts, and Agent 3 compiles reports."
            },
            resources: ["LangChain academy", "LangGraph docs", "DeepLearning.AI Agent courses"]
          }
        ],
        roadmap: [
          {
            id: "ai-node-1",
            title: "Python & LLM basics",
            phase: "Foundation",
            explanation: "Build a strong foundation in Python OOP, async scripts, prompt engineering, and basic LLM APIs.",
            objectives: ["Call OpenAI/Gemini endpoints", "Design clean system prompts", "Implement structured JSON outputs"],
            timeEstimate: "3 Weeks",
            resources: ["Python docs", "OpenAI cookbook"],
            projectCheckpoint: { title: "API caller with JSON schema validation", desc: "A script query builder parsing responses into validated models." },
            quiz: {
              question: "What model capability is required for an agent to interact with databases and external APIs?",
              options: ["Fine-tuning", "RAG", "Tool Calling", "Few-shot prompting"],
              answerIndex: 2,
              explanation: "Tool calling allows LLMs to output structured parameters to run local or remote APIs."
            }
          }
        ],
        skillsTree: [
          { id: "s-ai-1", name: "Python Coding & APIs", tier: "Beginner", whyMatters: "Prerequisite language for AI work.", dependencies: [], hours: 60, importance: "High", techs: ["Python"], unlocked: true, completed: false },
          { id: "s-ai-2", name: "Prompt Engineering & RAG", tier: "Beginner", whyMatters: "Allows structuring LLM outputs.", dependencies: ["s-ai-1"], hours: 60, importance: "High", techs: ["RAG", "Vector DBs"], unlocked: true, completed: false },
          { id: "s-ai-3", name: "Tool Calling & Functions", tier: "Intermediate", whyMatters: "Connects LLMs to the external world.", dependencies: ["s-ai-2"], hours: 80, importance: "High", techs: ["APIs"], unlocked: false, completed: false },
          { id: "s-ai-4", name: "Stateful Multi-Agent Systems", tier: "Advanced", whyMatters: "Enables agents to work as a team.", dependencies: ["s-ai-3"], hours: 120, importance: "High", techs: ["LangGraph", "CrewAI"], unlocked: false, completed: false }
        ],
        projects: [
          {
            title: "Automated Placement Bot",
            level: "Advanced",
            problemStatement: "Students need personalized mock feedback based on their target resume and jobs.",
            features: ["Extracts job description parameters", "Conducts mock tests", "Self-corrects and evaluates transcripts"],
            architecture: "Multi-agent structure using LangGraph state checkpointing and vector indexes.",
            techStack: ["Python", "LangGraph", "ChromaDB", "FastAPI", "Next.js"],
            outcomes: ["Multi-agent coordination structures", "Vector storage indexing"],
            completionTime: "5 Weeks",
            resumeValue: 5
          }
        ],
        placementPrep: {
          dsa: "Basic parsing algorithms, string search filters, and graph representations.",
          systemDesign: "Handling high token load queues, concurrency logs, vector index updates, API rate limits.",
          coreSubjects: ["Probability and Statistics", "Database Architectures", "System scaling"],
          resumeRules: ["Detail custom agent workflows you built.", "Specify token reduction metrics or prompt latency speedups ($X$\\% improvements)."],
          githubRules: ["Include clear demo links.", "Keep API keys secure in env setups."],
          portfolioRules: ["Provide interactive dashboards to test agents in real-time."],
          mockQuestions: [
            { q: "How do cycles differ in LangGraph compared to standard LangChain pipelines?", topic: "Graph Orchestrations" }
          ]
        },
        salaries: {
          internship: 40000,
          fresher: 8.5,
          mid: 18,
          senior: 36,
          globalTrend: "Extreme demand with massive venture capital funding.",
          remoteTrend: "Ranges from $50,000 to $120,000 USD for remote talent."
        },
        trends: {
          trendingTechs: ["Model Context Protocol (MCP)", "LangGraph state checkpointing", "PydanticAI type checking"],
          emergingSkills: ["Edge AI execution", "Local agent models runs (Ollama)"],
          predictions: "Autonomous agent networks will replace static pipelines, automating complex backend scripts."
        }
      }
    };
  }, [selectedRole]);

  // Dynamic Generator Fallback to cover ALL remaining roles
  const activeRoleDetails = useMemo((): RoleDetails => {
    if (MOCK_ROLES_DATABASE[selectedRole]) {
      return MOCK_ROLES_DATABASE[selectedRole];
    }
    
    // Generate intelligent details on the fly
    const resolvedDifficulty: "Easy" | "Medium" | "Hard" = 
      selectedRole.includes("Senior") || selectedRole.includes("Architect") || selectedRole.includes("MLOps") || selectedRole.includes("SRE") || selectedRole.includes("Deep Learning")
        ? "Hard"
        : selectedRole.includes("Analyst") || selectedRole.includes("Prompt") || selectedRole.includes("Freelancing")
          ? "Easy"
          : "Medium";

    const isAi = selectedDomain === "Artificial Intelligence";
    const isCloud = selectedDomain === "Cloud & DevOps";
    const isSecurity = selectedDomain === "Security Domain";
    
    return {
      role: selectedRole,
      icon: isAi ? Brain : isCloud ? Server : isSecurity ? ShieldAlert : Briefcase,
      category: selectedDomain,
      level: resolvedDifficulty === "Hard" ? "Advanced" : resolvedDifficulty === "Medium" ? "Intermediate" : "Beginner",
      duration: resolvedDifficulty === "Hard" ? "9 Months" : resolvedDifficulty === "Medium" ? "6 Months" : "3 Months",
      difficulty: resolvedDifficulty,
      demand: resolvedDifficulty === "Hard" ? "Critical" : "High",
      growth: resolvedDifficulty === "Hard" ? "35%" : "22%",
      remoteWork: "Yes",
      about: `Professional career track for ${selectedRole} in the ${selectedDomain} industry. This role focuses on high-yield production tasks and target configurations.`,
      importance: `Essential role ensuring high performance, optimization, and system safety in modern digital platforms.`,
      problemsSolved: `Automates workflows, resolves technical bottlenecks, and scales infrastructure setup rules.`,
      responsibilities: [
        `Configure and support systems aligned with ${selectedRole} standard conventions.`,
        "Collaborate with development teams to align technology stacks and production targets.",
        "Perform testing, diagnostic audits, and speed optimizations.",
        "Review architectural blueprints and construct clean documentation."
      ],
      industries: [
        { name: "Enterprise SaaS", howUsed: "Scaling secure customer interfaces, processing databases, and optimizing runtime performance.", example: "Salesforce, AWS, Snowflake", growthPotential: "High" },
        { name: "Startups & Agencies", howUsed: "Building quick models, testing features, and automating routine deployment templates.", example: "Y-Combinator companies", growthPotential: "Very High" }
      ],
      technologies: [
        {
          name: "Standard Tools & SDKs",
          whatIsIt: "Primary command-line, code frameworks, or interface APIs used in production systems.",
          whyUsed: "Provides industry-proven performance standards and reduces coding boilerplate.",
          analogy: "Like a craftsman's workbench: you need the right tools nearby to build high-quality solutions.",
          beginnerDesc: "Core frameworks and helper libraries that simplify building features for this role.",
          advancedDesc: "Complex configurations, caching libraries, asynchronous call pipelines, and strict type management.",
          advantages: ["Increases workflow speed", "High community support", "Production stability"],
          limitations: ["Frequent updates", "High runtime memory footprints"],
          difficulty: resolvedDifficulty,
          learningTime: "4 Weeks",
          prerequisites: ["Basic Programming", "CLI basics"],
          interviewQuestion: {
            q: `What is the most critical constraint when scaling tools for ${selectedRole}?`,
            a: "Optimizing database memory load, managing call latency times, keeping endpoints secure, and ensuring modular components."
          },
          miniProject: {
            title: "Industry dashboard template",
            desc: "A clean dashboard compiling monitoring alerts, logging errors, and managing configurations."
          },
          resources: ["Documentation manuals", "Tech blogs", "Youtube tutorials"]
        }
      ],
      roadmap: [
        {
          id: `road-node-${selectedRole.toLowerCase().replace(/\s+/g, "-")}-1`,
          title: "Introduction & Syntax",
          phase: "Foundation",
          explanation: "Master core programming syntax, terminal controls, and system rules.",
          objectives: ["Understand base commands", "Write simple scripts", "Configure workspace tools"],
          timeEstimate: "3 Weeks",
          resources: ["Official guides", "MDN tutorials"],
          projectCheckpoint: { title: "Basic Calculator Console", desc: "A simple calculator console parsing inputs and executing operations." },
          quiz: {
            question: "Which data structure is optimal for caching key-value parameters?",
            options: ["Array", "Linked List", "Hash Map / Object", "Binary Tree"],
            answerIndex: 2,
            explanation: "Hash maps allow constant time lookup O(1) for keys, making them ideal for caching configurations."
          }
        }
      ],
      skillsTree: [
        { id: "s-gen-1", name: "Core Fundamentals", tier: "Beginner", whyMatters: "Base requirement for all follow-up systems.", dependencies: [], hours: 40, importance: "High", techs: ["CLI", "Syntax"], unlocked: true, completed: false },
        { id: "s-gen-2", name: "Advanced Operations", tier: "Intermediate", whyMatters: "Allows handling real-world systems.", dependencies: ["s-gen-1"], hours: 80, importance: "High", techs: ["Frameworks"], unlocked: false, completed: false },
        { id: "s-gen-3", name: "System Orchestrations", tier: "Advanced", whyMatters: "Coordinates multi-layered environments.", dependencies: ["s-gen-2"], hours: 100, importance: "High", techs: ["Cloud", "Security"], unlocked: false, completed: false }
      ],
      projects: [
        {
          title: `Autonomous ${selectedRole} dashboard`,
          level: "Advanced",
          problemStatement: "Organizations need a place to coordinate telemetry, trace logs, and manage configuration keys.",
          features: ["Real-time alerts", "Role permissions configurations", "Interactive graphs", "Export data templates"],
          architecture: "Serverless lambda pipeline with vector stores and cache layers.",
          techStack: ["Python", "FastAPI", "Docker", "AWS"],
          outcomes: ["Telemetry tracking", "Cloud security architectures"],
          completionTime: "4 Weeks",
          resumeValue: 4
        }
      ],
      placementPrep: {
        dsa: "Data structure basics: Hash maps, Arrays, and binary search patterns.",
        systemDesign: "System design basics: load balancing, microservices structure, database index tuning.",
        coreSubjects: ["Database Systems", "Operating Systems", "Networking"],
        resumeRules: ["Highlight real metrics of projects.", "List exact technologies in skills matrices."],
        githubRules: ["Show green commit streaks.", "Structure clean repository branches."],
        portfolioRules: ["Provide interactive live demos."],
        mockQuestions: [
          { q: "Explain the standard architectural flow of this role.", topic: "Architecture" }
        ]
      },
      salaries: {
        internship: 20000,
        fresher: 5.5,
        mid: 12.0,
        senior: 24.0,
        globalTrend: "High growth in remote placements and enterprise roles.",
        remoteTrend: "Ranges from $35,000 to $90,000 USD."
      },
      trends: {
        trendingTechs: ["AI Assistants", "Serverless edges", "Strict type verification"],
        emergingSkills: ["AI models fine-tuning", "Modular architecture construction"],
        predictions: "Automation will increase development velocity, shifting engineers' time toward architecture."
      }
    };
  }, [selectedRole, selectedDomain]);

  // Selected Quiz Node helper
  const selectedRoadmapNodeDetails = useMemo(() => {
    return activeRoleDetails.roadmap.find(n => n.id === selectedRoadmapNode);
  }, [activeRoleDetails, selectedRoadmapNode]);

  // List of filtered roles based on sidebar search
  const filteredRolesByDomain = useMemo(() => {
    return DOMAINS.map(domain => {
      const matched = domain.roles.filter(r => r.toLowerCase().includes(roleSearchQuery.toLowerCase()));
      return {
        ...domain,
        roles: matched
      };
    }).filter(d => d.roles.length > 0);
  }, [roleSearchQuery]);

  // Side-by-side Role comparisons
  const roleADetails = useMemo(() => {
    if (MOCK_ROLES_DATABASE[compareRoleA]) return MOCK_ROLES_DATABASE[compareRoleA];
    return { ...activeRoleDetails, role: compareRoleA };
  }, [compareRoleA, activeRoleDetails]);

  const roleBDetails = useMemo(() => {
    if (MOCK_ROLES_DATABASE[compareRoleB]) return MOCK_ROLES_DATABASE[compareRoleB];
    return { ...activeRoleDetails, role: compareRoleB, salaries: { fresher: 8.0, mid: 16.0, senior: 30.0 } };
  }, [compareRoleB, activeRoleDetails]);

  // Submit dynamic quiz response
  const handleSubmitQuiz = () => {
    if (quizAnswerIndex === null || !selectedRoadmapNodeDetails) return;
    setQuizSubmitted(true);
    const correct = quizAnswerIndex === selectedRoadmapNodeDetails.quiz.answerIndex;
    setQuizSuccess(correct);

    if (correct) {
      addXp(30, `Solved Quiz: ${selectedRoadmapNodeDetails.title}`);
      setCompletedNodesMap((prev: Record<string, boolean>) => {
        const next = { ...prev, [selectedRoadmapNodeDetails.id]: true };
        localStorage.setItem("smartpicks_blueprint_completed_nodes", JSON.stringify(next));
        return next;
      });
      setNotifications((prev: string[]) => [
        `🏆 Milestone Unlocked! Completed "${selectedRoadmapNodeDetails.title}" node (+30 XP)`,
        ...prev
      ]);
    }
  };

  // Dynamic chat mentor responder
  const handleSendMentorMessage = (predefinedMsg?: string) => {
    const textToSend = predefinedMsg || chatInput;
    if (!textToSend.trim()) return;

    setChatMessages(prev => [...prev, { id: `user-${Date.now()}`, sender: "user", text: textToSend }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "";
      const text = textToSend.toLowerCase();

      if (text.includes("salary") || text.includes("earn")) {
        reply = `💰 **Salary Analytics for ${activeRoleDetails.role}**:\n- **Fresher**: ₹${activeRoleDetails.salaries.fresher} LPA\n- **Mid-Level**: ₹${activeRoleDetails.salaries.mid} LPA\n- **Senior Developer**: ₹${activeRoleDetails.salaries.senior} LPA\n\nGlobal Remote Market Trend: ${activeRoleDetails.salaries.remoteTrend}`;
      } else if (text.includes("suit") || text.includes("start")) {
        reply = `🚀 **Career Matchmaker Evaluation**:\nBased on current industry demand for **${activeRoleDetails.role}**:\n- **Prerequisites**: Fast coding skills, standard CLI, logic.\n- **Learning Duration**: ${activeRoleDetails.duration}\n- **Market Growth Rate**: ${activeRoleDetails.growth}\n- **Recommendation**: If you enjoy building visual elements, Frontend/MERN is best. If logic and data structures fascinate you, go for Backend/AI Agent systems.`;
      } else if (text.includes("project")) {
        reply = `📂 **Suggested Projects for ${activeRoleDetails.role}**:\nHere is a high-yield project idea to build:\n\n**Title**: ${activeRoleDetails.projects[0]?.title || 'Autonomous Telemetry Suite'}\n- **Problem**: ${activeRoleDetails.projects[0]?.problemStatement || 'Managing high-yield log telemetry'}\n- **Tech Stack**: ${activeRoleDetails.projects[0]?.techStack.join(", ") || 'Python, Docker, AWS'}\n- **Resume Value Rating**: ${activeRoleDetails.projects[0]?.resumeValue || 4}/5 stars.`;
      } else {
        reply = `🤖 **AI Career Mentor**: To excel as a **${activeRoleDetails.role}**, I recommend focusing on the **${activeRoleDetails.roadmap[0]?.title || 'Web Foundations'}** phase. Spend roughly ${activeRoleDetails.roadmap[0]?.timeEstimate || '3 weeks'} building basic terminal and logic scripts before moving to advanced cloud pipelines.`;
      }

      setChatMessages(prev => [...prev, { id: `reply-${Date.now()}`, sender: "assistant", text: reply }]);
      addXp(10, "Interacted with AI Career Mentor");
    }, 1000);
  };

  // Check access restriction
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Dashboard access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 text-center shadow-2xl space-y-6 relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <LockIcon className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Access Restricted</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Please sign in to your SmartPicks account to access the Career Blueprint Hub.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/career-blueprint`}
            className="flex h-11 w-full items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-650 hover:to-red-700 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-bold text-neutral-500 hover:text-neutral-300">
            Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ background: "#09090B" }}
      className="min-h-screen text-slate-100 relative overflow-hidden font-sans pb-12 select-none"
    >
      {/* Background spotlights & elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-cyan-500/5 to-purple-500/0 blur-3xl animate-float"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Sticky Sub-Header */}
      <header className="sticky top-0 z-40 bg-[#09090b]/75 backdrop-blur-xl border-b border-neutral-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/student-hub"
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400 flex items-center gap-1">
                <Compass className="h-3 w-3 animate-spin" /> Career Blueprint Hub
              </span>
              <h1 className="text-sm font-black tracking-tight text-white">Career Operating System</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 text-[10px] font-black text-slate-300 hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              ⚖️ Compare Tracks
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold text-xs">
              <Trophy className="h-3.5 w-3.5" />
              <span>{xp} XP</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold text-xs">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>{streak} Days</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors relative cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-cyan-400 rounded-full animate-ping" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                      <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">Blueprint Alerts</span>
                      <button onClick={() => setShowNotifications(false)} className="text-neutral-500 hover:text-white text-xs cursor-pointer">Clear</button>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((msg, i) => (
                        <div key={i} className="text-[10px] leading-relaxed text-neutral-300 bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/40 font-semibold">
                          {msg}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar */}
            <div className="h-8 w-8 rounded-full border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center text-xs font-bold text-cyan-400">
              {user.profileImage ? (
                <img src={user.profileImage} alt="User Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR: Domain Categories & Roles Menu (Col-Span 3) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-850 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Explore Career Tracks</h3>
                <div className="mt-2.5 relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="text"
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                    placeholder="Search careers..."
                    className="w-full bg-neutral-950/80 border border-neutral-850 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-bold text-slate-200 placeholder:text-neutral-600 outline-none"
                  />
                </div>
              </div>

              {/* Collapsible Domain & role selector rows */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredRolesByDomain.map((domain, i) => (
                  <div key={i} className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-cyan-500 tracking-wider block">{domain.name}</span>
                    <div className="space-y-1">
                      {domain.roles.map(r => (
                        <button
                          key={r}
                          onClick={() => {
                            setSelectedRole(r);
                            setSelectedDomain(domain.name);
                            addXp(10, `Explored Career Path: ${r}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                            selectedRole === r
                              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                              : "bg-transparent border border-transparent text-neutral-400 hover:bg-neutral-800/35 hover:text-white"
                          }`}
                        >
                          <span className="truncate">{r}</span>
                          {selectedRole === r && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </aside>

          {/* RIGHT PANELS Stage (Col-Span 9) */}
          <main className="lg:col-span-9 space-y-6">

            {/* Stage Title Summary card */}
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-850 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <activeRoleDetails.icon className="h-32 w-32 text-cyan-500" />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded bg-neutral-800 text-[8px] font-black text-cyan-400 uppercase tracking-widest border border-cyan-500/10">
                  {activeRoleDetails.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-[8px] font-black text-slate-300 uppercase tracking-widest border border-neutral-850">
                  {activeRoleDetails.level}
                </span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-[8px] font-black text-green-400 uppercase tracking-widest border border-green-500/10">
                  Demand: {activeRoleDetails.demand}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white">{activeRoleDetails.role} Roadmap</h2>
              <p className="text-xs text-neutral-400 mt-2 max-w-2xl leading-relaxed">{activeRoleDetails.about}</p>

              {/* Horizontal Workspace tab triggers */}
              <div className="flex items-center gap-1 border-t border-neutral-800 mt-6 pt-2 flex-wrap">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "salaries", label: "Market & Salary" },
                  { id: "technologies", label: "Technologies Used" },
                  { id: "roadmap", label: "Roadmap Flow" },
                  { id: "skills", label: "Skill Trees" },
                  { id: "projects", label: "Project Roadmap" },
                  { id: "placement", label: "Placement Prep" },
                  { id: "mentor", label: "AI Career Mentor" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB INTERFACES */}
            <div className="min-h-[400px]">
              
              {/* Tab: Overview details */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Importance & problems solved */}
                  <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black uppercase text-cyan-500 tracking-wider">Industry Relevance</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">{activeRoleDetails.importance}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-black uppercase text-cyan-500 tracking-wider">Day-To-Day Problems Solved</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">{activeRoleDetails.problemsSolved}</p>
                    </div>
                    
                    {/* Responsibilities */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider">Core Responsibilities</h4>
                      <div className="space-y-2">
                        {activeRoleDetails.responsibilities.map((res, i) => (
                          <div key={i} className="flex gap-2 text-[11px] text-neutral-400 leading-relaxed">
                            <CheckSquare className="h-4 w-4 text-cyan-500 shrink-0" />
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Industry usage table */}
                  <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider">Active Hiring Sectors</h3>
                    <div className="space-y-4">
                      {activeRoleDetails.industries.map((ind, i) => (
                        <div key={i} className="bg-neutral-950/40 p-3.5 rounded-2xl border border-neutral-850 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-white">{ind.name}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-400">{ind.growthPotential} Growth</span>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed">{ind.howUsed}</p>
                          <p className="text-[10px] text-neutral-500 font-bold">Examples: {ind.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: Market & Salary details */}
              {activeTab === "salaries" && (
                <div className="space-y-6">
                  
                  {/* Custom SVG Bar Chart */}
                  <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-cyan-400" /> CTC Compensation Index (LPA)
                        </h3>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Average salary trends within Indian IT markets</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-black uppercase tracking-widest">
                        India Trends
                      </span>
                    </div>

                    <div className="flex flex-col gap-5 pt-3">
                      {[
                        { label: "Internship (Stipend/mo)", value: activeRoleDetails.salaries.internship, isMonthly: true },
                        { label: "Fresher / Entry Grade", value: activeRoleDetails.salaries.fresher, isLpa: true },
                        { label: "Mid-Level Professional", value: activeRoleDetails.salaries.mid, isLpa: true },
                        { label: "Senior Staff / Lead", value: activeRoleDetails.salaries.senior, isLpa: true }
                      ].map((sal, i) => {
                        const maxValue = 40; // Max ceiling for LPA index scaling
                        // Stipend relative scaling
                        const relativePercent = sal.isMonthly 
                          ? (sal.value / 60000) * 100 
                          : (sal.value / maxValue) * 100;
                        
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-neutral-300">{sal.label}</span>
                              <span className="font-black text-white">
                                {sal.isMonthly 
                                  ? `₹${(sal.value).toLocaleString()}/mo` 
                                  : `₹${sal.value} LPA`}
                              </span>
                            </div>
                            <div className="w-full bg-neutral-950 rounded-full h-3.5 overflow-hidden border border-neutral-850 relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${relativePercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Global and remote trends cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-2">
                      <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider">Global Offshore Market</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{activeRoleDetails.salaries.globalTrend}</p>
                    </div>
                    <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-2">
                      <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider">Remote Freelancing Opportunities</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{activeRoleDetails.salaries.remoteTrend}</p>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: Technologies Used Card list */}
              {activeTab === "technologies" && (
                <div className="space-y-4">
                  {activeRoleDetails.technologies.map((tech, i) => {
                    const isOpen = expandedTechCard === tech.name;
                    return (
                      <div
                        key={i}
                        className="bg-neutral-900/40 border border-neutral-850 rounded-3xl overflow-hidden shadow-xl"
                      >
                        <button
                          onClick={() => setExpandedTechCard(isOpen ? null : tech.name)}
                          className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-neutral-800/10"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Tech Stack Core</span>
                            <h3 className="text-sm font-black text-white">{tech.name}</h3>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-neutral-500 transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-neutral-850 bg-neutral-950/40 p-5 space-y-5"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">What is it?</span>
                                    <p className="text-xs text-neutral-300 leading-relaxed font-semibold">{tech.whatIsIt}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Why do we use it?</span>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{tech.whyUsed}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Analogy</span>
                                    <p className="text-xs text-neutral-400 leading-relaxed italic">" {tech.analogy} "</p>
                                  </div>
                                </div>

                                <div className="space-y-3 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-850">
                                  <div className="flex justify-between text-[10px] text-neutral-400 font-extrabold uppercase">
                                    <span>Learn Time: {tech.learningTime}</span>
                                    <span>Level: {tech.difficulty}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Beginner Concept</span>
                                    <p className="text-[11px] text-neutral-300 leading-relaxed mt-0.5">{tech.beginnerDesc}</p>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Advanced Pipeline</span>
                                    <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">{tech.advancedDesc}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-neutral-850 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-neutral-900/20 p-3 rounded-xl border border-neutral-850 space-y-1">
                                  <span className="text-[9px] font-black uppercase text-amber-500">Interview QA Check</span>
                                  <p className="text-xs font-bold text-white">Q: {tech.interviewQuestion.q}</p>
                                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">A: {tech.interviewQuestion.a}</p>
                                </div>
                                <div className="bg-neutral-900/20 p-3 rounded-xl border border-neutral-850 space-y-1">
                                  <span className="text-[9px] font-black uppercase text-green-500">Suggested Build Checkpoint</span>
                                  <p className="text-xs font-bold text-white">Project: {tech.miniProject.title}</p>
                                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">{tech.miniProject.desc}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab: Learning Roadmap Flow */}
              {activeTab === "roadmap" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* SVG Nodes diagram list (Col-Span 7) */}
                  <div className="lg:col-span-7 bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col items-center">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Click node to inspect milestone</span>
                    
                    <div className="relative w-full flex flex-col items-center gap-8 pt-4">
                      {/* Vertical connector line */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-neutral-800 left-1/2 transform -translate-x-1/2 z-0" />

                      {activeRoleDetails.roadmap.map((node, idx) => {
                        const isSelected = selectedRoadmapNode === node.id;
                        const isCompleted = completedNodesMap[node.id];
                        
                        return (
                          <div key={node.id} className="relative z-10 flex flex-col items-center">
                            <button
                              onClick={() => {
                                setSelectedRoadmapNode(node.id);
                                setQuizSubmitted(false);
                                setQuizAnswerIndex(null);
                              }}
                              className={`h-11 w-44 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                isSelected
                                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105"
                                  : isCompleted
                                    ? "bg-green-500/10 border-green-500/40 text-green-400 hover:bg-green-500/20"
                                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                              }`}
                            >
                              {isCompleted ? <Check className="h-4.5 w-4.5 text-green-400" /> : <Map className="h-4.5 w-4.5" />}
                              <span>{node.title}</span>
                            </button>
                            <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-1.5">{node.phase}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Node Inspect details & mini quiz (Col-Span 5) */}
                  <div className="lg:col-span-5">
                    {selectedRoadmapNodeDetails ? (
                      <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-5">
                        <div className="border-b border-neutral-800 pb-3">
                          <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider block">{selectedRoadmapNodeDetails.phase} Phase</span>
                          <h3 className="text-sm font-black text-white">{selectedRoadmapNodeDetails.title}</h3>
                          <p className="text-[10px] text-neutral-500 mt-1">Est. Duration: {selectedRoadmapNodeDetails.timeEstimate}</p>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed font-semibold">{selectedRoadmapNodeDetails.explanation}</p>

                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">Objectives Checklist</h4>
                          <div className="space-y-1">
                            {selectedRoadmapNodeDetails.objectives.map((obj, i) => (
                              <div key={i} className="flex gap-2 text-[10px] text-neutral-400">
                                <Check className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Quiz Node */}
                        <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-850 space-y-3">
                          <span className="text-[9px] font-black uppercase text-orange-400 flex items-center gap-1">
                            <HelpCircle className="h-3.5 w-3.5" /> Milestone Quiz assessment (+30 XP)
                          </span>
                          <p className="text-xs font-bold text-slate-200">{selectedRoadmapNodeDetails.quiz.question}</p>
                          
                          <div className="space-y-2 pt-1.5">
                            {selectedRoadmapNodeDetails.quiz.options.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  if (!quizSubmitted) setQuizAnswerIndex(i);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                  quizAnswerIndex === i
                                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                                    : "bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>

                          {!quizSubmitted ? (
                            <button
                              onClick={handleSubmitQuiz}
                              disabled={quizAnswerIndex === null}
                              className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-1.5"
                            >
                              Submit Quiz Verification
                            </button>
                          ) : (
                            <div className="pt-2 text-[10px] space-y-2">
                              {quizSuccess ? (
                                <p className="text-green-400 font-extrabold flex items-center gap-1">🎉 Correct answer! XP awarded.</p>
                              ) : (
                                <p className="text-red-400 font-extrabold flex items-center gap-1">❌ Incorrect. Try checking the answer key details.</p>
                              )}
                              <p className="text-neutral-500 leading-relaxed">{selectedRoadmapNodeDetails.quiz.explanation}</p>
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      <div className="bg-neutral-900/20 border border-neutral-800 border-dashed rounded-3xl p-12 text-center text-neutral-500 shadow-xl">
                        <Map className="h-10 w-10 text-neutral-700 mx-auto mb-2.5 animate-pulse" />
                        <p className="text-xs font-bold text-neutral-400">Select a roadmap checkpoint node to inspect lessons and complete quizzes.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Tab: Skill Trees */}
              {activeTab === "skills" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Skill Node Grid (Col-Span 7) */}
                  <div className="lg:col-span-7 bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-neutral-800 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider">Unlockable Skill Tree Matrix</h3>
                    </div>

                    <div className="space-y-6">
                      {["Beginner", "Intermediate", "Advanced", "Expert"].map((tier) => {
                        const tierNodes = activeRoleDetails.skillsTree.filter(n => n.tier === tier);
                        if (tierNodes.length === 0) return null;
                        
                        return (
                          <div key={tier} className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500 block">{tier} Tier</span>
                            <div className="grid grid-cols-2 gap-3">
                              {tierNodes.map(node => {
                                const isSelected = selectedSkillNode === node.id;
                                return (
                                  <button
                                    key={node.id}
                                    onClick={() => setSelectedSkillNode(node.id)}
                                    className={`p-3 text-left rounded-2xl border transition-all cursor-pointer flex justify-between items-start gap-2 ${
                                      isSelected
                                        ? "bg-cyan-500/10 border-cyan-500"
                                        : "bg-neutral-950 border-neutral-850 hover:border-neutral-700"
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black text-slate-200 block truncate max-w-[140px]">{node.name}</span>
                                      <span className="text-[8px] text-neutral-500 font-bold block">{node.hours} hrs</span>
                                    </div>
                                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-md" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skill Node details (Col-Span 5) */}
                  <div className="lg:col-span-5">
                    {selectedSkillNode ? (
                      (() => {
                        const sDetails = activeRoleDetails.skillsTree.find(n => n.id === selectedSkillNode);
                        if (!sDetails) return null;
                        
                        return (
                          <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-4">
                            <div className="border-b border-neutral-850 pb-2">
                              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest block">{sDetails.tier} node</span>
                              <h3 className="text-xs font-black text-white">{sDetails.name}</h3>
                              <span className="text-[9px] text-neutral-500">Prerequisites: {sDetails.dependencies.join(", ") || "None"}</span>
                            </div>

                            <p className="text-[11px] text-neutral-300 leading-relaxed font-semibold">{sDetails.whyMatters}</p>

                            <div className="space-y-1">
                              <span className="text-[8px] font-black uppercase text-neutral-500 tracking-wider block">Target Stack tools</span>
                              <div className="flex flex-wrap gap-1.5">
                                {sDetails.techs.map(t => (
                                  <span key={t} className="px-2 py-0.5 rounded bg-neutral-950 text-[9px] text-cyan-400 border border-neutral-850 font-bold">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="bg-neutral-900/20 border border-neutral-800 border-dashed rounded-3xl p-12 text-center text-neutral-500 shadow-xl">
                        <Award className="h-10 w-10 text-neutral-700 mx-auto mb-2.5 animate-pulse" />
                        <p className="text-xs font-bold text-neutral-400">Click a Skill Node to inspect dependancy structures and hourly targets.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Tab: Project roadmap cards */}
              {activeTab === "projects" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeRoleDetails.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8px] font-black uppercase tracking-widest">
                            {proj.level}
                          </span>
                          <div className="flex gap-1.5">
                            {[...Array(proj.resumeValue)].map((_, idx) => (
                              <Star key={idx} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <h3 className="text-xs font-black text-white leading-snug">{proj.title}</h3>
                        <p className="text-[11px] text-neutral-400 leading-relaxed font-semibold">Problem: {proj.problemStatement}</p>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">Features Checklist</span>
                          <div className="space-y-1">
                            {proj.features.map((feat, idx) => (
                              <div key={idx} className="flex gap-2 text-[10px] text-neutral-300">
                                <CheckSquare className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-[10px] font-bold text-neutral-500">
                          Architecture: <span className="text-neutral-300 font-semibold">{proj.architecture}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-neutral-850 pt-3 flex-wrap gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {proj.techStack.map(t => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-neutral-950 text-[8px] text-slate-400 border border-neutral-850 font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="text-[9px] text-cyan-500 font-black uppercase tracking-widest">Est. {proj.completionTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Placement Prep & mock questions */}
              {activeTab === "placement" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Guidelines checklist (Col-Span 6) */}
                  <div className="lg:col-span-6 bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-5">
                    <h3 className="text-xs font-black uppercase text-cyan-500 tracking-wider">Placement Readiness Checklist</h3>

                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">DSA Requirements</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">{activeRoleDetails.placementPrep.dsa}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">System Design Checklist</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{activeRoleDetails.placementPrep.systemDesign}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Core Subjects</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {activeRoleDetails.placementPrep.coreSubjects.map(sub => (
                            <span key={sub} className="px-2 py-0.5 rounded bg-neutral-950 text-[9px] text-cyan-400 border border-neutral-850 font-bold">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interview QA (Col-Span 6) */}
                  <div className="lg:col-span-6 bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider">Target Mock Interview Questions</h3>
                    <div className="space-y-3">
                      {activeRoleDetails.placementPrep.mockQuestions.map((mq, idx) => (
                        <div key={idx} className="bg-neutral-950/40 p-3.5 rounded-2xl border border-neutral-850 space-y-1.5">
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-cyan-500">
                            <span>Q{idx + 1}</span>
                            <span>Topic: {mq.topic}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-300">{mq.q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: AI Mentor Chat console */}
              {activeTab === "mentor" && (
                <div className="bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 shadow-2xl flex flex-col h-[400px] justify-between">
                  <div className="border-b border-neutral-850 pb-2 flex justify-between items-center">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" /> AI Career Mentor
                    </h3>
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-[10px] leading-relaxed font-semibold ${
                            msg.sender === "user"
                              ? "bg-cyan-500 text-white rounded-tr-none"
                              : "bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-tl-none whitespace-pre-line"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Preloaded suggestion query list */}
                  <div className="flex gap-1.5 pb-2 flex-wrap border-t border-neutral-850 pt-2">
                    {[
                      { text: "Estimate Salary?", msg: "What salary can I expect for this role in India?" },
                      { text: "Suggested Projects?", msg: "Suggest high-yield portfolio projects for this track" },
                      { text: "Suit my profile?", msg: "Would this career track suit my entry-level profile?" }
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMentorMessage(s.msg)}
                        className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-[8px] font-black text-neutral-500 hover:text-white cursor-pointer"
                      >
                        {s.text}
                      </button>
                    ))}
                  </div>

                  {/* Chat input form */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-850">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMentorMessage()}
                      placeholder="Ask AI Career Mentor..."
                      className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-[10px] text-slate-200 outline-none placeholder:text-neutral-600 font-bold"
                    />
                    <button
                      onClick={() => handleSendMentorMessage()}
                      className="p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl cursor-pointer"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </main>

        </div>
      </div>

      {/* Career Comparison Modal overlay */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-6"
            >
              
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  ⚖️ Career Comparison Matrix
                </h3>
                <button 
                  onClick={() => setShowCompareModal(false)}
                  className="text-neutral-500 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Selector selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-neutral-500">Track A</label>
                  <select
                    value={compareRoleA}
                    onChange={(e) => setCompareRoleA(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs font-bold text-slate-200 focus:outline-none"
                  >
                    {DOMAINS.flatMap(d => d.roles).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-neutral-500">Track B</label>
                  <select
                    value={compareRoleB}
                    onChange={(e) => setCompareRoleB(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs font-bold text-slate-200 focus:outline-none"
                  >
                    {DOMAINS.flatMap(d => d.roles).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table details comparison matrix */}
              <div className="border border-neutral-800 rounded-2xl overflow-hidden text-[11px] font-semibold">
                <div className="grid grid-cols-3 bg-neutral-950 p-3 text-neutral-450 border-b border-neutral-800">
                  <span>Parameter</span>
                  <span>{compareRoleA}</span>
                  <span>{compareRoleB}</span>
                </div>
                <div className="divide-y divide-neutral-800">
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-neutral-500">Target Level</span>
                    <span className="text-white font-extrabold">{roleADetails.level}</span>
                    <span className="text-white font-extrabold">{roleBDetails.level}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-neutral-500">Difficulty Rating</span>
                    <span className="text-white font-extrabold">{roleADetails.difficulty}</span>
                    <span className="text-white font-extrabold">{roleBDetails.difficulty}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-neutral-500">Est. Learn Duration</span>
                    <span className="text-white font-extrabold">{roleADetails.duration}</span>
                    <span className="text-white font-extrabold">{roleBDetails.duration}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-neutral-500">India Fresher CTC</span>
                    <span className="text-green-400 font-extrabold">₹{roleADetails.salaries.fresher} LPA</span>
                    <span className="text-green-400 font-extrabold">₹{roleBDetails.salaries.fresher} LPA</span>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-neutral-500">Mid-Level Salary</span>
                    <span className="text-green-400 font-extrabold">₹{roleADetails.salaries.mid} LPA</span>
                    <span className="text-green-400 font-extrabold">₹{roleBDetails.salaries.mid} LPA</span>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-neutral-500">SaaS Demand Potential</span>
                    <span className="text-white font-extrabold">{roleADetails.demand}</span>
                    <span className="text-white font-extrabold">{roleBDetails.demand}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
