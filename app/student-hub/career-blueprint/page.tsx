"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Compass, Search, Award, Flame, Settings,
  Star, Bookmark, ChevronDown, ChevronRight, X, Sparkles, Zap,
  Trophy, Briefcase, BookOpen, Check, Copy, HelpCircle, FileText,
  ChevronUp, Users, Code, Terminal, Clock, ShieldAlert, Heart,
  Building, Brain, Server, ShieldCheck, TrendingUp, DollarSign,
  ListTodo, Map, Activity, ExternalLink, GraduationCap, LayoutGrid,
  CheckSquare, RefreshCw, Lock as LockIcon, Cpu, BarChart2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─────────────── TYPES & INTERFACES ─────────────── */
interface TechCard {
  name: string;
  category?: string;
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

/* ─────────────── TECHNOLOGIES DATABASE & RESOLVERS ─────────────── */
const TECH_DATABASE: Record<string, Omit<TechCard, "name" | "category">> = {
  "React": {
    whatIsIt: "A declarative, component-based frontend library for building highly interactive user interfaces.",
    whyUsed: "It leverages a Virtual DOM to minimize direct browser manipulation, rendering state changes efficiently.",
    analogy: "Like a building constructed from modular prefabricated rooms (Lego blocks) that can be swapped out instantly without rebuilding the structure.",
    beginnerDesc: "Learn JSX syntax, component props, and basic hooks like useState and useEffect to manage component lifecycles.",
    advancedDesc: "Master concurrent features (useTransition, Suspense), fiber reconciliation internals, and custom hook abstraction.",
    advantages: ["Component modularity", "Massive ecosystem and libraries", "Fast updates via Virtual DOM"],
    limitations: ["Unopinionated design requires architectural decisions", "Frequent state updates can cause performance issues if not optimized"],
    difficulty: "Medium",
    learningTime: "3-4 Weeks",
    prerequisites: ["HTML", "CSS", "ES6 JavaScript (closures, array methods, async/await)"],
    interviewQuestion: {
      q: "What is reconciliation in React and how does the Virtual DOM help?",
      a: "Reconciliation is React's algorithm to sync the virtual UI tree with the real DOM. When state changes, a new Virtual DOM tree is generated. React diffs it with the old tree and batches updates to commit only the minimum changes, avoiding expensive layout repaints."
    },
    miniProject: {
      title: "Collaborative Sprint Board",
      desc: "An interactive project management board enabling card dragging, list filtering, and local state management."
    },
    resources: ["Official React Docs (react.dev)", "Kent C. Dodds - Epic React", "Scrimba React Course"]
  },
  "Next.js": {
    whatIsIt: "A production-grade React framework providing Server Components, App Routing, optimization tools, and Server Actions.",
    whyUsed: "It solves SEO and page load speed issues through Server-Side Rendering (SSR), Static Site Generation (SSG), and Edge Middleware.",
    analogy: "Like a high-end restaurant where dishes are pre-cooked and plated in the kitchen (server) rather than having the guest cook them at the table (client).",
    beginnerDesc: "Learn file-based App Routing, page layouts, data fetching with fetch(), and client vs. server components.",
    advancedDesc: "Master Incremental Static Regeneration (ISR), Server Actions, intercepting/parallel routes, and middleware edge functions.",
    advantages: ["Excellent out-of-the-box SEO", "Zero configuration routing and asset optimization", "Hybrid SSR/SSG models"],
    limitations: ["Steep learning curve with App Router", "Serverless environment deployment quirks"],
    difficulty: "Medium",
    learningTime: "2-3 Weeks",
    prerequisites: ["React", "Basic Node.js concepts"],
    interviewQuestion: {
      q: "What is the difference between Server and Client Components in Next.js App Router?",
      a: "Server Components render on the server, sending pre-rendered HTML to the browser and reducing client bundle sizes. Client Components are hydration-ready components that execute on the client, enabling client-side state hooks and event listeners."
    },
    miniProject: {
      title: "SEO-Optimized Product Catalogue",
      desc: "A dynamic catalog using Incremental Static Regeneration, dynamic route prefetching, and metadata optimization."
    },
    resources: ["Next.js Learn Course", "Vercel Documentation", "Next.js GitHub repository"]
  },
  "Spring Boot": {
    whatIsIt: "An opinionated framework that simplifies Java enterprise application development through auto-configuration.",
    whyUsed: "It eliminates boilerplate code, hosts an embedded Tomcat server, and integrates the entire Spring ecosystem.",
    analogy: "Like renting a fully furnished apartment where everything is pre-connected, instead of buying empty space and laying the wiring yourself.",
    beginnerDesc: "Learn Dependency Injection, basic annotations (@RestController, @Service, @Autowired), and building REST endpoints.",
    advancedDesc: "Master custom starter packs, Spring AOP (Aspect-Oriented Programming), dynamic profiles, and JDBC connection pool configurations.",
    advantages: ["No XML configuration required", "Embedded server simplifies deployments", "Robust transaction management"],
    limitations: ["High memory footprint compared to Go or Node.js", "Opinionated setup makes customization complex"],
    difficulty: "Hard",
    learningTime: "4-5 Weeks",
    prerequisites: ["Core Java", "SQL Databases"],
    interviewQuestion: {
      q: "Explain Bean scopes in Spring Boot.",
      a: "By default, Spring Beans are Singletons (one instance per container). Other scopes include Prototype (new instance every request), Request (one per HTTP request), Session, and Application."
    },
    miniProject: {
      title: "Secure E-Commerce Core API",
      desc: "A Java Spring Boot service integrating database migrations, JPA relation mappings, and custom exception handlers."
    },
    resources: ["Spring Boot Documentation", "Java Brains Spring Course", "Baeldung Spring tutorials"]
  },
  "Docker": {
    whatIsIt: "A containerization platform that packages applications and dependencies into isolated container environments.",
    whyUsed: "It solves the 'works on my machine' issue by ensuring consistency across development, testing, and production.",
    analogy: "Like standardized shipping containers on a cargo ship: they all fit the slots perfectly, regardless of whether they hold cars, electronics, or food.",
    beginnerDesc: "Learn to write Dockerfiles, build images, run containers, and manage environment variables.",
    advancedDesc: "Master multi-stage builds, container security, network bridges, volume mounts, and Docker Compose orchestration.",
    advantages: ["Consistent environment delivery", "Isolation of processes", "Resource-efficient compared to Virtual Machines"],
    limitations: ["Persistent data requires volume configuration", "Slight runtime overhead for network bridging"],
    difficulty: "Medium",
    learningTime: "1-2 Weeks",
    prerequisites: ["Basic Terminal Command Line"],
    interviewQuestion: {
      q: "What is the difference between a Docker Image and a Docker Container?",
      a: "A Docker Image is a read-only blueprint containing the OS, application code, and libraries. A Docker Container is a runnable, writeable instance of that image executing as an isolated process on the host kernel."
    },
    miniProject: {
      title: "Multi-Service App Container Stack",
      desc: "Containerize a Next.js frontend, a Node.js backend, and a PostgreSQL database using a Docker Compose network configuration."
    },
    resources: ["Docker Get Started Guide", "Katacoda Interactive Labs", "Docker Mastery Course"]
  },
  "Kubernetes": {
    whatIsIt: "An open-source container orchestration engine that automates deployment, scaling, and container management.",
    whyUsed: "It ensures high availability, self-healing containers, automatic horizontal scaling, and service discovery.",
    analogy: "Like a conductor of an orchestra: directing individual musicians (containers) to play in sync, scale volume, and step in if a musician falls ill.",
    beginnerDesc: "Learn basic objects like Pods, Deployments, Services, Namespaces, and running kubectl commands.",
    advancedDesc: "Master Helm Chart templating, Custom Resource Definitions (CRDs), ingress controller configurations, and network policies.",
    advantages: ["Automatic scaling and self-healing", "Declarative configurations", "Cloud-provider independence"],
    limitations: ["High setup and configuration complexity", "Steep learning curve for local environments"],
    difficulty: "Hard",
    learningTime: "4-6 Weeks",
    prerequisites: ["Docker", "Linux basics", "Basic networking concepts"],
    interviewQuestion: {
      q: "What is a Pod in Kubernetes, and why don't we deploy Pods directly?",
      a: "A Pod is the smallest deployable unit in K8s, wrapping one or more containers sharing storage and network. We don't deploy them directly because they are ephemeral; instead, we use Deployments or ReplicaSets to ensure self-healing and replication."
    },
    miniProject: {
      title: "Highly-Available Cloud Deploy",
      desc: "Deploy a microservice cluster configured with auto-scalers, ingress routing, health checks, and config maps."
    },
    resources: ["Kubernetes interactive docs", "KubeAcademy by VMware", "Certified Kubernetes Administrator (CKA) course"]
  },
  "LangGraph": {
    whatIsIt: "A framework designed to build stateful, multi-actor applications with LLMs using graph structures.",
    whyUsed: "It natively supports cyclic graph loops, execution checkpointing, and human-in-the-loop interventions, making it perfect for complex AI agents.",
    analogy: "Like a collaborative board game: players (agents) take turns, update the game board state, and follow custom rules, with a game log tracking every move.",
    beginnerDesc: "Learn node definitions, edges, state schemas, and simple cyclic prompt chains.",
    advancedDesc: "Master state token management, parallel execution branches, custom memory checkpointers, and user intervention approvals.",
    advantages: ["Handles complex cyclic agent flows", "State persistence and time-travel debugging", "Built-in telemetry"],
    limitations: ["Steep concept curve compared to simple LangChain chains", "Requires careful management of prompt tokens"],
    difficulty: "Hard",
    learningTime: "3-4 Weeks",
    prerequisites: ["Python async/await", "LangChain fundamentals"],
    interviewQuestion: {
      q: "Why use LangGraph instead of standard LangChain pipelines for complex agents?",
      a: "Standard LangChain pipelines are directed acyclic graphs (DAGs) which struggle with feedback loops. LangGraph supports cyclic architectures, allowing agents to self-evaluate, correct errors, and collaborate statefully over multiple turns."
    },
    miniProject: {
      title: "Self-Correcting Code Writer Agent",
      desc: "An AI Agent that writes code, runs it in an isolated environment, reads terminal errors, and iterates until compilation passes."
    },
    resources: ["LangChain Academy", "LangGraph GitHub examples", "DeepLearning.AI Agentic Workflows Course"]
  }
};

function getTechCard(name: string, category: string): TechCard {
  const staticCard = TECH_DATABASE[name];
  if (staticCard) {
    return {
      ...staticCard,
      name,
      category
    };
  }

  const difficulty: "Easy" | "Medium" | "Hard" = 
    ["Cypress", "Kubernetes", "Microservices", "System Design", "Kafka", "PyTorch", "TensorFlow", "Kubeflow", "Multi-Agent Systems", "Terraform", "Ansible", "ELK Stack"].some(x => name.includes(x))
      ? "Hard"
      : ["React", "Next.js", "Spring Boot", "Redux", "Zustand", "PostgreSQL", "Docker", "GitLab CI", "LangChain", "LangGraph", "LlamaIndex", "FastAPI", "MLflow", "Airflow", "Mockito", "Hibernate", "JPA"].some(x => name.includes(x))
        ? "Medium"
        : "Easy";

  const learningTime = difficulty === "Hard" ? "4-6 Weeks" : difficulty === "Medium" ? "2-3 Weeks" : "1 Week";
  
  return {
    name,
    category,
    whatIsIt: `A critical tool/concept in the ${category} landscape, used for modern software implementation.`,
    whyUsed: `It provides industry-standard capabilities to handle ${category.toLowerCase()} workloads efficiently.`,
    analogy: `Like using a specialized tool in a toolbox that is optimized for this exact job.`,
    beginnerDesc: `Learn the setup, basic syntax, and core commands of ${name}.`,
    advancedDesc: `Master advanced configuration, scalability patterns, and performance tuning for ${name}.`,
    advantages: ["Industry standard", "High performance", "Large community support"],
    limitations: ["Learning curve", "Operational complexity"],
    difficulty,
    learningTime,
    prerequisites: ["Core programming logic", "Development foundations"],
    interviewQuestion: {
      q: `What is the primary benefit of using ${name} in a production environment?`,
      a: `It simplifies operations, enhances scalability, and integrates seamlessly within standard enterprise pipelines.`
    },
    miniProject: {
      title: `${name} Integration Demo`,
      desc: `Build a small application showcasing basic features and config options of ${name}.`
    },
    resources: [`Official ${name} Docs`, `SmartPicks ${name} Quickstart`]
  };
}

function getRoleTechnologies(role: string, domain: string, difficulty: string): TechCard[] {
  const normalizedRole = role.toLowerCase();
  
  if (normalizedRole.includes("mern")) {
    return [
      getTechCard("HTML", "Languages"),
      getTechCard("CSS", "Languages"),
      getTechCard("JavaScript", "Languages"),
      getTechCard("TypeScript", "Languages"),
      getTechCard("React", "Frontend"),
      getTechCard("Next.js", "Frontend"),
      getTechCard("Redux", "Frontend"),
      getTechCard("Zustand", "Frontend"),
      getTechCard("Node.js", "Backend"),
      getTechCard("Express.js", "Backend"),
      getTechCard("MongoDB", "Databases"),
      getTechCard("MySQL", "Databases"),
      getTechCard("PostgreSQL", "Databases"),
      getTechCard("Redis", "Databases"),
      getTechCard("JWT", "Authentication"),
      getTechCard("OAuth", "Authentication"),
      getTechCard("Docker", "DevOps"),
      getTechCard("GitHub Actions", "DevOps"),
      getTechCard("AWS", "Cloud"),
      getTechCard("REST APIs", "Architecture"),
      getTechCard("GraphQL", "Architecture"),
      getTechCard("Jest", "Testing"),
      getTechCard("Cypress", "Testing"),
      getTechCard("Postman", "Testing"),
      getTechCard("Git", "Version Control"),
      getTechCard("GitHub", "Version Control"),
    ];
  }

  if (normalizedRole.includes("frontend")) {
    return [
      getTechCard("HTML", "Languages"),
      getTechCard("CSS", "Languages"),
      getTechCard("JavaScript", "Languages"),
      getTechCard("TypeScript", "Languages"),
      getTechCard("React", "Frontend"),
      getTechCard("Next.js", "Frontend"),
      getTechCard("Redux", "Frontend"),
      getTechCard("Zustand", "Frontend"),
      getTechCard("Tailwind CSS", "Frontend"),
      getTechCard("Vite", "Build Tools"),
      getTechCard("Webpack", "Build Tools"),
      getTechCard("Jest", "Testing"),
      getTechCard("Cypress", "Testing"),
      getTechCard("Postman", "Testing"),
      getTechCard("REST APIs", "Architecture"),
      getTechCard("GraphQL", "Architecture"),
      getTechCard("Git", "Version Control"),
      getTechCard("GitHub", "Version Control"),
      getTechCard("Vercel", "Cloud & Hosting"),
    ];
  }

  if (normalizedRole.includes("backend")) {
    return [
      getTechCard("JavaScript", "Languages"),
      getTechCard("TypeScript", "Languages"),
      getTechCard("Python", "Languages"),
      getTechCard("Go", "Languages"),
      getTechCard("Node.js", "Backend"),
      getTechCard("Express.js", "Backend"),
      getTechCard("NestJS", "Backend"),
      getTechCard("MongoDB", "Databases"),
      getTechCard("PostgreSQL", "Databases"),
      getTechCard("Redis", "Databases"),
      getTechCard("JWT", "Authentication"),
      getTechCard("OAuth", "Authentication"),
      getTechCard("REST APIs", "Architecture"),
      getTechCard("GraphQL", "Architecture"),
      getTechCard("Microservices", "Architecture"),
      getTechCard("System Design", "Architecture"),
      getTechCard("Kafka", "Messaging"),
      getTechCard("RabbitMQ", "Messaging"),
      getTechCard("Docker", "DevOps"),
      getTechCard("GitHub Actions", "DevOps"),
      getTechCard("AWS", "Cloud"),
      getTechCard("Jest", "Testing"),
      getTechCard("Postman", "Testing"),
      getTechCard("Git", "Version Control"),
      getTechCard("GitHub", "Version Control"),
    ];
  }
  
  if (normalizedRole.includes("java")) {
    return [
      getTechCard("Java", "Languages"),
      getTechCard("SQL", "Languages"),
      getTechCard("JavaScript", "Languages"),
      getTechCard("Spring Boot", "Frameworks"),
      getTechCard("Spring Security", "Frameworks"),
      getTechCard("Spring MVC", "Frameworks"),
      getTechCard("Hibernate", "Frameworks"),
      getTechCard("JPA", "Frameworks"),
      getTechCard("MySQL", "Databases"),
      getTechCard("PostgreSQL", "Databases"),
      getTechCard("MongoDB", "Databases"),
      getTechCard("Redis", "Databases"),
      getTechCard("Microservices", "Architecture"),
      getTechCard("REST APIs", "Architecture"),
      getTechCard("Design Patterns", "Architecture"),
      getTechCard("Kafka", "Messaging"),
      getTechCard("RabbitMQ", "Messaging"),
      getTechCard("Docker", "DevOps"),
      getTechCard("Kubernetes", "DevOps"),
      getTechCard("Jenkins", "DevOps"),
      getTechCard("AWS", "Cloud"),
      getTechCard("Azure", "Cloud"),
      getTechCard("JUnit", "Testing"),
      getTechCard("Mockito", "Testing"),
      getTechCard("Maven", "Build Tools"),
      getTechCard("Gradle", "Build Tools"),
    ];
  }
  
  if (normalizedRole.includes("agent")) {
    return [
      getTechCard("Python", "Languages"),
      getTechCard("JavaScript", "Languages"),
      getTechCard("Prompt Engineering", "Concepts"),
      getTechCard("Retrieval Augmented Generation (RAG)", "Concepts"),
      getTechCard("Model Context Protocol (MCP)", "Concepts"),
      getTechCard("Agent Memory & State Management", "Concepts"),
      getTechCard("Tool Calling & Function Execution", "Concepts"),
      getTechCard("Multi-Agent Systems", "Concepts"),
      getTechCard("LangChain", "Frameworks"),
      getTechCard("LangGraph", "Frameworks"),
      getTechCard("CrewAI", "Frameworks"),
      getTechCard("AutoGen", "Frameworks"),
      getTechCard("OpenAI SDK", "Frameworks"),
      getTechCard("PydanticAI", "Frameworks"),
      getTechCard("Pinecone", "Vector Databases"),
      getTechCard("ChromaDB", "Vector Databases"),
      getTechCard("Redis", "Vector Databases"),
      getTechCard("n8n", "Integration & Workflow"),
      getTechCard("Zapier", "Integration & Workflow"),
      getTechCard("Make.com", "Integration & Workflow"),
      getTechCard("Docker", "DevOps & Hosting"),
      getTechCard("FastAPI", "DevOps & Hosting"),
      getTechCard("AWS (ECS, Lambda)", "DevOps & Hosting"),
    ];
  }
  
  if (normalizedRole.includes("ai") || normalizedRole.includes("machine learning") || normalizedRole.includes("deep learning") || normalizedRole.includes("data scientist")) {
    return [
      getTechCard("Python", "Languages"),
      getTechCard("SQL", "Languages"),
      getTechCard("NumPy", "Libraries"),
      getTechCard("Pandas", "Libraries"),
      getTechCard("Matplotlib", "Libraries"),
      getTechCard("Seaborn", "Libraries"),
      getTechCard("Scikit-Learn", "Libraries"),
      getTechCard("TensorFlow", "Deep Learning"),
      getTechCard("PyTorch", "Deep Learning"),
      getTechCard("Keras", "Deep Learning"),
      getTechCard("NLTK", "NLP"),
      getTechCard("SpaCy", "NLP"),
      getTechCard("Hugging Face Transformers", "NLP"),
      getTechCard("LangChain", "Generative AI"),
      getTechCard("LlamaIndex", "Generative AI"),
      getTechCard("OpenAI API", "Generative AI"),
      getTechCard("Vector Databases (Pinecone, ChromaDB, Weaviate)", "Generative AI"),
      getTechCard("Docker", "DevOps/MLOps"),
      getTechCard("FastAPI", "DevOps/MLOps"),
      getTechCard("AWS (SageMaker)", "DevOps/MLOps"),
      getTechCard("MLflow", "DevOps/MLOps"),
      getTechCard("Airflow", "DevOps/MLOps"),
      getTechCard("Kubeflow", "DevOps/MLOps"),
    ];
  }
  
  if (normalizedRole.includes("devops") || normalizedRole.includes("sre") || normalizedRole.includes("cloud") || normalizedRole.includes("platform")) {
    return [
      getTechCard("Linux Fundamentals", "Operating System & Networking"),
      getTechCard("Networking Basics (HTTP, DNS, SSH)", "Operating System & Networking"),
      getTechCard("Bash/Shell Scripting", "Scripting & Version Control"),
      getTechCard("Git & GitHub", "Scripting & Version Control"),
      getTechCard("Docker", "Containers & Orchestration"),
      getTechCard("Kubernetes", "Containers & Orchestration"),
      getTechCard("Jenkins", "CI/CD Pipelines"),
      getTechCard("GitHub Actions", "CI/CD Pipelines"),
      getTechCard("GitLab CI", "CI/CD Pipelines"),
      getTechCard("Terraform", "Infrastructure as Code"),
      getTechCard("Ansible", "Infrastructure as Code"),
      getTechCard("AWS", "Cloud Platforms"),
      getTechCard("Azure", "Cloud Platforms"),
      getTechCard("GCP", "Cloud Platforms"),
      getTechCard("Prometheus", "Monitoring & Logging"),
      getTechCard("Grafana", "Monitoring & Logging"),
      getTechCard("ELK Stack", "Monitoring & Logging"),
    ];
  }

  return [
    getTechCard("Git", "Version Control"),
    getTechCard("Docker", "DevOps"),
    getTechCard("AWS", "Cloud Platforms"),
  ];
}

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

  // Notification state (alerts shown inline, no bell UI)
  const [notifications, setNotifications] = useState<string[]>([
    "🎉 Career blueprint loaded. Complete milestones to earn XP!",
    "🔥 12-Day Streak active."
  ]);

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
        technologies: [],
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
          },
          {
            id: "mern-node-3",
            title: "Node.js & Express API Development",
            phase: "Advanced Concepts",
            explanation: "Master server development, file I/O streams, custom middlewares, database integrations, and REST rules.",
            objectives: ["Build secure REST APIs", "Implement authentication middleware", "Connect Express to database clusters"],
            timeEstimate: "4 Weeks",
            resources: ["NodeJS documentation", "Express guides"],
            projectCheckpoint: { title: "File Storage Gateway", desc: "Secure API processing user files and storing metadata in database schemas." },
            quiz: {
              question: "What library handles background operations and thread pools for asynchronous file runs in Node.js?",
              options: ["V8 Engine", "libuv", "PM2", "Systemd"],
              answerIndex: 1,
              explanation: "libuv provides the asynchronous event loop and thread pool models that offload blocking OS commands in Node.js."
            }
          },
          {
            id: "mern-node-4",
            title: "Production Deployment & Telemetry",
            phase: "Deployment",
            explanation: "Learn how to wrap applications into Docker container clusters, construct CI/CD paths, and monitor server logs.",
            objectives: ["Containerize full-stack apps", "Deploy to AWS/GCP servers", "Set up monitoring and log traces"],
            timeEstimate: "3 Weeks",
            resources: ["Docker manual", "Prometheus core documents"],
            projectCheckpoint: { title: "Automated Deployment Pipeline", desc: "Full container stack automatically deployed using GitHub Actions workflow rules." },
            quiz: {
              question: "Which container management command defines service volumes and ports for multi-container stacks locally?",
              options: ["docker run", "docker-compose up", "docker build", "docker push"],
              answerIndex: 1,
              explanation: "docker-compose up compiles and starts multi-container setups defined in a docker-compose.yml configuration."
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
          resumeRules: ["Include active links to deployed full-stack products.", "Detail API latency reductions achieved with caching ($X$\% metrics)."],
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

      "Frontend Developer": {
        role: "Frontend Developer",
        icon: Code,
        category: "Software Development",
        level: "Beginner",
        duration: "4 Months",
        difficulty: "Easy",
        demand: "High",
        growth: "22%",
        remoteWork: "Yes",
        about: "A Frontend Developer builds user-facing web interfaces, implementing layouts, interactions, animations, and optimizing client-side performance.",
        importance: "Ensures visually stunning, accessible, and fast design translation from mockups to active runtime interfaces.",
        problemsSolved: "Resolves layout shifts, client rendering delay, visual bugs, and slow page interactions.",
        responsibilities: [
          "Design and build responsive UI layouts using React/Next.js and clean styling patterns.",
          "Coordinate state updates using Zustand/Redux and optimize data fetches.",
          "Ensure accessibility compliance matching WCAG standard rules.",
          "Write clean modular visual components and execute testing scripts."
        ],
        industries: [
          { name: "SaaS Dashboards", howUsed: "Constructing analytics panels, responsive controls, and visual drag tools.", example: "Figma, Notion", growthPotential: "Very High" },
          { name: "E-Commerce", howUsed: "Optimizing landing flows, product catalogs, and cart state synchronization.", example: "Shopify interfaces", growthPotential: "High" },
          { name: "Agencies & Marketing", howUsed: "Crafting marketing assets, rich animations, and static web pages.", example: "Vercel networks", growthPotential: "Stable" }
        ],
        technologies: [],
        roadmap: [
          {
            id: "fe-node-1",
            title: "Semantic HTML & Responsive CSS",
            phase: "Foundation",
            explanation: "Master DOM structure, flexbox/grid layout models, CSS custom properties, and responsive design mechanics.",
            objectives: ["Construct semantic layout blocks", "Build custom responsive components", "Adjust alignments for standard mobile viewports"],
            timeEstimate: "3 Weeks",
            resources: ["MDN Web CSS Guides", "CSS Tricks reference manuals"],
            projectCheckpoint: { title: "Responsive Media Dashboard", desc: "A dashboard incorporating sidebars, video panels, and responsive grid cards." },
            quiz: {
              question: "Which CSS layout method allows alignment in both columns and rows simultaneously?",
              options: ["Flexbox", "CSS Grid", "Table Layout", "Absolute Positioning"],
              answerIndex: 1,
              explanation: "CSS Grid is a two-dimensional layout engine, whereas Flexbox is primarily one-dimensional."
            }
          },
          {
            id: "fe-node-2",
            title: "Advanced JavaScript & DOM API",
            phase: "Core Concepts",
            explanation: "Understand closure bindings, scope chains, event delegation, and asynchronous promise handlers.",
            objectives: ["Process promise callbacks", "Manipulate browser nodes dynamically", "Manage client-side caching configs"],
            timeEstimate: "3 Weeks",
            resources: ["JavaScript.info tutorials", "Eloquent JS Book"],
            projectCheckpoint: { title: "Interactive Scheduler Client", desc: "A visual schedule client updating calendar data via REST mock streams." },
            quiz: {
              question: "What is event delegation in browser JavaScript?",
              options: ["Passing state to child frames", "Attaching a single listener to a parent node to manage child event triggers", "Binding click inputs to thread queues", "Stopping events from bubbling"],
              answerIndex: 1,
              explanation: "Event delegation leverages event bubbling to listen at a parent level rather than binding handlers to multiple individual children."
            }
          },
          {
            id: "fe-node-3",
            title: "React Components & State",
            phase: "Core Concepts",
            explanation: "Master component render triggers, hooks (useState, useEffect, useMemo), and state reconciliation flows.",
            objectives: ["Build modular UI components", "Construct custom custom hooks", "Define data context boundaries"],
            timeEstimate: "4 Weeks",
            resources: ["React dev manuals", "Scrimba React courses"],
            projectCheckpoint: { title: "SaaS Task Manager UI", desc: "A modular, hook-driven Kanban application with offline state fallback templates." },
            quiz: {
              question: "Which hook should be used to memoize a function definition to prevent useless child re-renders?",
              options: ["useMemo", "useCallback", "useRef", "useEffect"],
              answerIndex: 1,
              explanation: "useCallback returns a memoized version of the callback function itself, while useMemo memoizes the computed value."
            }
          },
          {
            id: "fe-node-4",
            title: "Testing & Quality Assurance",
            phase: "Advanced Concepts",
            explanation: "Implement testing protocols for UI libraries, and execute headless E2E testing using Jest, React Testing Library, and Cypress.",
            objectives: ["Write component tests", "Execute automated E2E browser runs", "Measure client performance vitals"],
            timeEstimate: "3 Weeks",
            resources: ["Cypress manuals", "Testing Library guides"],
            projectCheckpoint: { title: "Dashboard Component Test Suite", desc: "A React testing package validating forms, API loads, and checking error limits." },
            quiz: {
              question: "What does FCP stand for in Google Web Vitals metrics?",
              options: ["First Contentful Paint", "Fast Client Rendering", "File Control Protocol", "First Component Process"],
              answerIndex: 0,
              explanation: "First Contentful Paint (FCP) measures the duration from when a user navigates to when the browser renders the first piece of DOM content."
            }
          }
        ],
        skillsTree: [
          { id: "s-fe-1", name: "Responsive CSS Layouts", tier: "Beginner", whyMatters: "Enables creating clean designs across device sizes.", dependencies: [], hours: 40, importance: "High", techs: ["HTML", "CSS"], unlocked: true, completed: false },
          { id: "s-fe-2", name: "Dynamic DOM & JS Basics", tier: "Beginner", whyMatters: "Adds scripting interaction logic to web layouts.", dependencies: ["s-fe-1"], hours: 60, importance: "High", techs: ["JS"], unlocked: true, completed: false },
          { id: "s-fe-3", name: "React State Frameworks", tier: "Intermediate", whyMatters: "Building block for modern SPA components.", dependencies: ["s-fe-2"], hours: 100, importance: "High", techs: ["React", "Zustand"], unlocked: false, completed: false },
          { id: "s-fe-4", name: "Next.js SSR Architectures", tier: "Intermediate", whyMatters: "Improves initial page loads and search indexing.", dependencies: ["s-fe-3"], hours: 80, importance: "High", techs: ["Next.js"], unlocked: false, completed: false },
          { id: "s-fe-5", name: "Frontend Testing & Quality", tier: "Advanced", whyMatters: "Secures updates from breaking user paths.", dependencies: ["s-fe-3"], hours: 60, importance: "Medium", techs: ["Jest", "Cypress"], unlocked: false, completed: false }
        ],
        projects: [
          {
            title: "Modular SaaS UI Component Library",
            level: "Advanced",
            problemStatement: "Organizations copy and paste components, leading to broken buttons and styling inconsistencies.",
            features: ["WCAG accessible design states", "Automated theme compilation config", "Visual catalog docs playground"],
            architecture: "Component workspace compiled into an NPM module package with automated Storybook specs.",
            techStack: ["React", "TypeScript", "Storybook", "Jest"],
            outcomes: ["Reusable visual components", "Consistent branding deployment workflows"],
            completionTime: "4 Weeks",
            resumeValue: 5
          }
        ],
        placementPrep: {
          dsa: "String manipulation, arrays search routines, and basic DOM tree structures representation.",
          systemDesign: "Web browser performance patterns, assets caching rules, CDN distribution configurations, and asset compilation bundling.",
          coreSubjects: ["Computer Networks", "Software Design Principles", "Web Standards & Accessibility"],
          resumeRules: ["List raw page load speed improvements.", "Provide links to interactive component demo hosts."],
          githubRules: ["Show clean visual code structures.", "Include interactive web mock screenshots in README files."],
          portfolioRules: ["Provide responsive mobile-first portfolios with fast initial load speed."],
          mockQuestions: [
            { q: "What is the key difference between SSR and client-side hydration?", topic: "Performance Vitals" },
            { q: "Explain how closure allows you to maintain reference variables in event handlers.", topic: "JS Scope" }
          ]
        },
        salaries: {
          internship: 20000,
          fresher: 5.5,
          mid: 12.0,
          senior: 24.0,
          globalTrend: "High remote placements for React and state systems optimization developers.",
          remoteTrend: "Ranges from $30,000 to $75,000 USD."
        },
        trends: {
          trendingTechs: ["Server Component flows", "Strict Type check configurations", "Micro-interaction engines"],
          emergingSkills: ["AI prototyping integrations", "Dynamic edge page compiling"],
          predictions: "Web application interfaces will shift toward edge pre-rendering and compile-time layout optimizations, cutting client runtime code volume."
        }
      },

      "Backend Developer": {
        role: "Backend Developer",
        icon: Server,
        category: "Software Development",
        level: "Intermediate",
        duration: "6 Months",
        difficulty: "Medium",
        demand: "Critical",
        growth: "25%",
        remoteWork: "Yes",
        about: "A Backend Developer architects servers, designs database models, establishes security authorizations, and manages data streaming engines.",
        importance: "Serves as the core processor of all software data systems, defining security rules, backend API shapes, and routing pipelines.",
        problemsSolved: "Resolves database query delays, server bottlenecks, security gaps, and high API timeouts under heavy loads.",
        responsibilities: [
          "Build secure server APIs using frameworks like Node.js/Express, Python, or Go.",
          "Write optimized SQL database schemas and handle indexing queries.",
          "Implement secure authentication schemes (JWT, OAuth) and CORS settings.",
          "Design microservices pipelines and message distribution systems."
        ],
        industries: [
          { name: "Enterprise SaaS", howUsed: "Processing transaction records, managing tenant configurations, and scaling data queues.", example: "Salesforce, AWS APIs", growthPotential: "High" },
          { name: "Banking & FinTech", howUsed: "Executing concurrent transactions, logging history audit trails, and securing customer tokens.", example: "Stripe, Razorpay APIs", growthPotential: "Critical" },
          { name: "Streaming Media", howUsed: "Managing real-time content delivery indices, segmenting user feeds, and caching hot assets.", example: "Netflix systems, Spotify", growthPotential: "High" }
        ],
        technologies: [],
        roadmap: [
          {
            id: "be-node-1",
            title: "Server Runtimes & REST Rules",
            phase: "Foundation",
            explanation: "Understand server lifecycles, HTTP header configurations, routing mechanisms, and REST standards.",
            objectives: ["Build simple web servers", "Write clean request middlewares", "Parse URL parameters and body payloads"],
            timeEstimate: "3 Weeks",
            resources: ["NodeJS core docs", "REST API Tutorial guidelines"],
            projectCheckpoint: { title: "REST Book Directory API", desc: "A web server exposing REST endpoints supporting full CRUD features with file persistence." },
            quiz: {
              question: "Which HTTP method is defined as idempotent and typically updates resource values fully?",
              options: ["POST", "PUT", "PATCH", "DELETE"],
              answerIndex: 1,
              explanation: "PUT is idempotent; sending the same payload multiple times yields the same final system state. POST creates a resource, causing repeated edits."
            }
          },
          {
            id: "be-node-2",
            title: "Databases & Index Optimizations",
            phase: "Core Concepts",
            explanation: "Master relational (SQL) and non-relational (NoSQL) schemas, foreign key mappings, and indexing strategies.",
            objectives: ["Write complex database queries", "Design database connection pools", "Analyze query performance indicators"],
            timeEstimate: "4 Weeks",
            resources: ["PostgreSQL tutorial manuals", "MongoDB University"],
            projectCheckpoint: { title: "Social Feed DB Schema", desc: "A database structure handling user connections, posts, and comments with index optimization logs." },
            quiz: {
              question: "How does a database index improve select query performance?",
              options: ["By compressing table blocks", "By creating an optimized B-Tree structure for faster lookup searches", "By caching outputs in server memory", "By lock scheduling rows"],
              answerIndex: 1,
              explanation: "An index creates an ordered data index structure (typically a B-Tree), reducing search scans from O(N) to O(log N)."
            }
          },
          {
            id: "be-node-3",
            title: "Microservices & Message Brokers",
            phase: "Advanced Concepts",
            explanation: "Learn architectural isolation, horizontal scaling patterns, event-driven message networks, and caching strategies.",
            objectives: ["Build event message processors", "Integrate Redis caching layers", "Design distributed configurations"],
            timeEstimate: "4 Weeks",
            resources: ["Kafka intro documents", "Microservices.io guide"],
            projectCheckpoint: { title: "Event-Driven Order Process Engine", desc: "A microservice pipeline coordinating checkout transactions using Redis channels and RabbitMQ." },
            quiz: {
              question: "Which role does a Message Queue play in microservice architectures?",
              options: ["Storing large user files", "Decoupling services, handling backpressure, and ensuring async durability", "Formatting JSON layouts", "Securing API auth keys"],
              answerIndex: 1,
              explanation: "Message queues allow asynchronous processing and handle volume spikes (backpressure) by decoupling target producers and consumers."
            }
          },
          {
            id: "be-node-4",
            title: "Distributed Caching & High Load Tuning",
            phase: "Deployment",
            explanation: "Learn to scale backend systems using Redis caching layers, connection pools, and write-ahead logging tuning to handle thousands of concurrent requests.",
            objectives: ["Configure Redis cache invalidation strategies", "Tune database connection pools", "Implement horizontal scaling with load balancers"],
            timeEstimate: "4 Weeks",
            resources: ["Redis Developer Guide", "High Performance PostgreSQL", "System Design Primer"],
            projectCheckpoint: {
              title: "Distributed Cache Invalidator",
              desc: "A microservice listening to database update triggers and invalidating related cache keys on Redis clusters in real-time."
            },
            quiz: {
              question: "Which cache invalidation strategy updates the cache and the database synchronously inside the write transaction?",
              options: ["Cache-Aside", "Write-Through", "Write-Behind", "Refresh-Ahead"],
              answerIndex: 1,
              explanation: "Write-Through cache writes data directly to both the cache and the underlying database in a single synchronous write block."
            }
          }
        ],
        skillsTree: [
          { id: "s-be-1", name: "System Programming Logic", tier: "Beginner", whyMatters: "Language core to execute backend algorithms.", dependencies: [], hours: 60, importance: "High", techs: ["Node.js", "Python"], unlocked: true, completed: false },
          { id: "s-be-2", name: "Database Schema Designs", tier: "Beginner", whyMatters: "Enables secure data persistence and lookup tuning.", dependencies: ["s-be-1"], hours: 80, importance: "High", techs: ["SQL", "MongoDB"], unlocked: true, completed: false },
          { id: "s-be-3", name: "REST & GraphQL APIs", tier: "Intermediate", whyMatters: "Connects web clients to internal system data.", dependencies: ["s-be-2"], hours: 100, importance: "High", techs: ["Express", "FastAPI"], unlocked: false, completed: false },
          { id: "s-be-4", name: "Distributed Cache & Queues", tier: "Advanced", whyMatters: "Accelerates reads and handles asynchronous messaging peaks.", dependencies: ["s-be-3"], hours: 80, importance: "High", techs: ["Redis", "Kafka"], unlocked: false, completed: false },
          { id: "s-be-5", name: "Microservice System Architecture", tier: "Advanced", whyMatters: "Scales engineering team output and deploy safety.", dependencies: ["s-be-3"], hours: 100, importance: "High", techs: ["Docker", "Microservices"], unlocked: false, completed: false }
        ],
        projects: [
          {
            title: "Scalable E-Commerce Transaction Engine",
            level: "Industry-Level",
            problemStatement: "During flash sales, server instances crash due to database row locking bottlenecks.",
            features: ["Queue-based checkout processing", "Distributed inventory locks", "Real-time stock broadcast channels"],
            architecture: "Microservices stack using Redis mutex locks, PostgreSQL transactional isolation, and RabbitMQ message queues.",
            techStack: ["Node.js", "PostgreSQL", "Redis", "RabbitMQ", "Docker"],
            outcomes: ["Processed 5000 requests/sec with zero duplicate checkouts", "Automatic cache invalidations"],
            completionTime: "4 Weeks",
            resumeValue: 5
          }
        ],
        placementPrep: {
          dsa: "Trees, graphs BFS/DFS algorithms, hash map collisions resolutions, sorting queues, and memory caching parameters.",
          systemDesign: "Database index design, caching strategies (Write-Through vs Cache-Aside), rate limiters, load balancing, and SQL ACID guarantees.",
          coreSubjects: ["Database Management Systems (DBMS)", "Operating Systems (scheduling, threads)", "Computer Networks (TCP/IP, HTTP)"],
          resumeRules: ["Quantify achievements (e.g., 'Reduced query latency by 45% using database index modifications').", "List system deployment metrics."],
          githubRules: ["Show API documentation folders.", "Provide postman integration files directly in repository checkouts."],
          portfolioRules: ["Provide links to active Swagger/REST API instances with sample keys."],
          mockQuestions: [
            { q: "How do SQL ACID properties differ from NoSQL BASE properties?", topic: "Database Theory" },
            { q: "What is database thread pool exhaustion and how is it resolved?", topic: "Server Concurrency" }
          ]
        },
        salaries: {
          internship: 30000,
          fresher: 7.0,
          mid: 15.0,
          senior: 30.0,
          globalTrend: "Massive demand for distributed system architectures and API scalability experts.",
          remoteTrend: "Ranges from $45,000 to $95,000 USD."
        },
        trends: {
          trendingTechs: ["Serverless backends", "Rust for web infrastructure", "gRPC communication channels"],
          emergingSkills: ["Vector database architectures setup", "Edge telemetry configurations"],
          predictions: "Backend architectures are shifting toward distributed edge microservices and direct RPC pipelines to minimize routing times."
        }
      },

      "Java Full Stack Developer": {
        role: "Java Full Stack Developer",
        icon: Briefcase,
        category: "Software Development",
        level: "Advanced",
        duration: "7 Months",
        difficulty: "Hard",
        demand: "Critical",
        growth: "24%",
        remoteWork: "Yes",
        about: "A Java Full Stack Developer engineers enterprise applications, combining Java Spring Boot backends with modern JavaScript frontend layers.",
        importance: "Critical for building secure, highly scalable, and transactional enterprise web apps in banking, logistics, and healthcare.",
        problemsSolved: "Resolves architectural complexity, secure transactions management, legacy updates, and database mapping bugs.",
        responsibilities: [
          "Design enterprise backends with Java, Spring Boot, and Hibernate JPA.",
          "Develop frontend layers in React or Angular, aligning styles with design guidelines.",
          "Implement robust Spring Security setups (OAuth2, JWT, role checks).",
          "Automate deployment using Jenkins pipelines, Maven/Gradle, and Docker containers."
        ],
        industries: [
          { name: "Banking & FinTech", howUsed: "Building transaction engines, ledger portals, and risk management systems.", example: "JPMorgan, HSBC systems", growthPotential: "Stable" },
          { name: "Enterprise Systems", howUsed: "Managing inventory data feeds, logistics coordinates, and corporate dashboard workflows.", example: "SAP partner integrations", growthPotential: "High" },
          { name: "Healthcare Tech", howUsed: "Processing patient records directories, securing medical telemetry, and integrating system APIs.", example: "Hospitals portal architectures", growthPotential: "Very High" }
        ],
        technologies: [],
        roadmap: [
          {
            id: "java-node-1",
            title: "Core Java & Build Systems",
            phase: "Foundation",
            explanation: "Master Java OOP, collections frameworks, multi-threading basics, and build automation frameworks (Maven/Gradle).",
            objectives: ["Write complex multi-threaded console scripts", "Manage Maven dependency XML configurations", "Implement custom collection structures"],
            timeEstimate: "4 Weeks",
            resources: ["Oracle Java Docs", "Baeldung Java tutorials"],
            projectCheckpoint: { title: "Multi-threaded Library Log Suite", desc: "A console script managing library inventory records with concurrent search queues." },
            quiz: {
              question: "Which collection in Java allows unique elements only and does not guarantee sorting order?",
              options: ["ArrayList", "HashSet", "HashMap", "TreeSet"],
              answerIndex: 1,
              explanation: "HashSet stores unique elements leveraging hashing mechanisms, but does not guarantee any iteration order."
            }
          },
          {
            id: "java-node-2",
            title: "Database Mapping & Spring Core",
            phase: "Core Concepts",
            explanation: "Learn Spring core configurations, Dependency Injection, Hibernate ORM, JPA mapping, and SQL database transactions.",
            objectives: ["Configure Spring Bean scopes", "Map entity tables using JPA annotations", "Implement transaction boundaries"],
            timeEstimate: "4 Weeks",
            resources: ["Spring Framework tutorials", "Hibernate manuals"],
            projectCheckpoint: { title: "JPA Booking Directory", desc: "A service mapping user bookings, seats, and payments with relational databases." },
            quiz: {
              question: "What JPA annotation defines a relationship where one parent record owns multiple children records?",
              options: ["@ManyToOne", "@OneToMany", "@ManyToMany", "@Transient"],
              answerIndex: 1,
              explanation: "@OneToMany specifies a single parent entity is linked to a collection of child entities in ORM mappings."
            }
          },
          {
            id: "java-node-3",
            title: "Spring Security & React UI",
            phase: "Advanced Concepts",
            explanation: "Secure API endpoints using Spring Security configurations, handle JWT tokens, and connect React components to endpoints.",
            objectives: ["Build role-based auth security filters", "Write custom React components to query APIs", "Implement state stores for logged users"],
            timeEstimate: "5 Weeks",
            resources: ["Spring Security manuals", "React learning paths"],
            projectCheckpoint: { title: "Secure E-Commerce Dashboard", desc: "A full-stack React-Spring dashboard managing active catalog listings with role logins." },
            quiz: {
              question: "Which filter component in Spring Security intercepts requests to extract and validate JWT headers?",
              options: ["AuthenticationManager", "OncePerRequestFilter", "SecurityContextHolder", "DaoAuthenticationProvider"],
              answerIndex: 1,
              explanation: "OncePerRequestFilter is subclassed to execute custom logic (like token validation) once per request lifecycle."
            }
          },
          {
            id: "java-node-4",
            title: "Enterprise Clustering & API Gateways",
            phase: "Deployment",
            explanation: "Understand how to route traffic, aggregate configuration settings, and monitor health metrics across decoupled Spring Cloud microservice instances using Consul or Eureka.",
            objectives: ["Set up Spring Cloud Gateway routing rules", "Configure a central Spring Cloud Config server", "Monitor telemetry endpoints with Prometheus and Grafana"],
            timeEstimate: "4 Weeks",
            resources: ["Spring Cloud Documentation", "Baeldung Spring Boot Tutorials", "Prometheus Monitoring in JVM"],
            projectCheckpoint: {
              title: "Secure Microservices Gateway System",
              desc: "An enterprise gateway checking JWT tokens and routing client requests to backend billing and account microservices."
            },
            quiz: {
              question: "Which Spring Cloud component dynamically routes incoming external API calls to appropriate internal microservice instances?",
              options: ["Spring Cloud Config", "Spring Cloud Gateway", "Spring Cloud OpenFeign", "Spring Cloud Eureka"],
              answerIndex: 1,
              explanation: "Spring Cloud Gateway handles routing, filtering, rate limiting, and security verification for incoming request flows."
            }
          }
        ],
        skillsTree: [
          { id: "s-java-1", name: "Core Java OOP", tier: "Beginner", whyMatters: "Language core for all enterprise backend scripts.", dependencies: [], hours: 80, importance: "High", techs: ["Java"], unlocked: true, completed: false },
          { id: "s-java-2", name: "SQL & Hibernate JPA", tier: "Beginner", whyMatters: "Enables database object mappings.", dependencies: ["s-java-1"], hours: 80, importance: "High", techs: ["SQL", "Hibernate"], unlocked: true, completed: false },
          { id: "s-java-3", name: "Spring Boot APIs", tier: "Intermediate", whyMatters: "Automates enterprise setup configurations.", dependencies: ["s-java-2"], hours: 100, importance: "High", techs: ["Spring Boot"], unlocked: false, completed: false },
          { id: "s-java-4", name: "React Frontend Systems", tier: "Intermediate", whyMatters: "Builds user interface dashboards.", dependencies: ["s-java-1"], hours: 80, importance: "Medium", techs: ["React", "JS"], unlocked: false, completed: false },
          { id: "s-java-5", name: "Spring Security & Microservices", tier: "Advanced", whyMatters: "Protects financial systems and coordinates networks.", dependencies: ["s-java-3"], hours: 120, importance: "High", techs: ["Spring Security", "Microservices"], unlocked: false, completed: false }
        ],
        projects: [
          {
            title: "Enterprise Microservices Banking API",
            level: "Industry-Level",
            problemStatement: "Banking systems need decoupled modules for billing, accounts, and alerts running without centralized failures.",
            features: ["Spring Cloud routing gateway", "Distributed logging aggregation", "Automated rollbacks on payment failure"],
            architecture: "Microservices cluster using Spring Cloud Eureka, Spring Security OAuth2, PostgreSQL database instances, and Kafka streams.",
            techStack: ["Java", "Spring Boot", "Spring Cloud", "PostgreSQL", "Kafka", "Docker"],
            outcomes: ["Zero-downtime service rolling updates", "Secure banking operations compliant with audit rules"],
            completionTime: "5 Weeks",
            resumeValue: 5
          }
        ],
        placementPrep: {
          dsa: "Trees structures, graphs, sorting lists, hash maps operations, and string matching indices.",
          systemDesign: "Spring Cloud configurations, Eureka service discoveries, API Gateways, database transaction levels, and design pattern classifications.",
          coreSubjects: ["Operating Systems", "Object Oriented Analysis & Design (OOAD)", "Database Systems (DBMS)"],
          resumeRules: ["Mention Maven dependency structures.", "State exact database transactions scale metrics achieved."],
          githubRules: ["Structure directories cleanly with src/main/java folders.", "Demonstrate clean Maven pom.xml configuration files."],
          portfolioRules: ["Provide details of complete enterprise project components deployment setups."],
          mockQuestions: [
            { q: "What is the difference between @Controller and @RestController annotations in Spring?", topic: "Spring MVC" },
            { q: "Explain Java Garbage Collection models and heap space partitions.", topic: "JVM Internals" }
          ]
        },
        salaries: {
          internship: 30000,
          fresher: 7.5,
          mid: 16.0,
          senior: 32.0,
          globalTrend: "High corporate hiring demand for Java backend and Spring Cloud specialists.",
          remoteTrend: "Ranges from $40,000 to $90,000 USD."
        },
        trends: {
          trendingTechs: ["Java Virtual Threads (Project Loom)", "Spring Boot GraalVM native images", "Microservice architectures"],
          emergingSkills: ["Cloud security certifications", "Reactive backend frameworks (WebFlux)"],
          predictions: "JVM runtimes will become significantly lighter using native image compilations, increasing deployment speeds in serverless cloud environments."
        }
      },

      "AI Engineer": {
        role: "AI Engineer",
        icon: Brain,
        category: "Artificial Intelligence",
        level: "Advanced",
        duration: "8 Months",
        difficulty: "Hard",
        about: "An AI Engineer designs statistical machine learning systems, deep neural network algorithms, data engineering scripts, and deploys model engines.",
        demand: "Critical",
        growth: "38%",
        remoteWork: "Yes",
        importance: "Empowers digital products with intelligent features like pattern forecasting, audio/video analysis, and automated choices.",
        problemsSolved: "Resolves predictive modeling inaccuracies, data engineering delays, and high latency of model APIs.",
        responsibilities: [
          "Preprocess raw data feeds using NumPy, Pandas, and data cleansing scripts.",
          "Train classical machine learning models (Scikit-Learn) and neural networks (PyTorch/TensorFlow).",
          "Build model endpoints using FastAPI and MLOps metrics logs.",
          "Configure cloud training structures and monitor model drift indices."
        ],
        industries: [
          { name: "Automotive Tech", howUsed: "Training object detection algorithms, processing sensor feeds, and predicting failures.", example: "ADAS models", growthPotential: "High" },
          { name: "E-Commerce", howUsed: "Constructing user recommendation engines, clustering products, and predicting purchasing cycles.", example: "Amazon models", growthPotential: "High" },
          { name: "FinTech & Banking", howUsed: "Running credit risk forecasts, analyzing fraud metrics, and forecasting stock values.", example: "Hedge fund systems", growthPotential: "Very High" }
        ],
        technologies: [],
        roadmap: [
          {
            id: "ai-ml-node-1",
            title: "Data Manipulation & Stats",
            phase: "Foundation",
            explanation: "Learn Python script optimization, linear algebra metrics (matrices), stats rules, and Pandas data analytics.",
            objectives: ["Clean messy dataset files", "Calculate statistical properties", "Create plots and data graphs"],
            timeEstimate: "3 Weeks",
            resources: ["Python for Data Analysis Book", "Kaggle tutorials"],
            projectCheckpoint: { title: "Housing Prices Analytics", desc: "A Python script cleaning property records and reporting price averages." },
            quiz: {
              question: "Which Pandas function is utilized to group records based on a column and compute group metrics?",
              options: ["merge()", "groupby()", "pivot()", "concat()"],
              answerIndex: 1,
              explanation: "groupby() splits dataset rows according to categories, allowing aggregate metrics calculation on the groups."
            }
          },
          {
            id: "ai-ml-node-2",
            title: "Classical Machine Learning",
            phase: "Core Concepts",
            explanation: "Understand linear regression models, decision trees, classification scoring, and Scikit-Learn tools.",
            objectives: ["Train predictive models", "Optimize model hyperparameter values", "Evaluate classification arrays"],
            timeEstimate: "4 Weeks",
            resources: ["Scikit-Learn documentation", "Introduction to Statistical Learning"],
            projectCheckpoint: { title: "Customer Churn Predictor", desc: "A classification script modeling client churn based on usage history logs." },
            quiz: {
              question: "What metrics evaluate binary classifiers when there is class imbalance in the targets?",
              options: ["Accuracy score", "Precision, Recall, and F1-Score", "Mean Squared Error", "R-Squared"],
              answerIndex: 1,
              explanation: "Precision, Recall, and F1-Score track model reliability on minority classes directly, whereas accuracy yields skewed metrics."
            }
          },
          {
            id: "ai-ml-node-3",
            title: "Deep Learning & MLOps",
            phase: "Advanced Concepts",
            explanation: "Build deep neural network architectures using PyTorch, write clean FastAPI endpoints, and manage models with MLflow.",
            objectives: ["Design custom neural network layers", "Construct FastAPI web servers to serve models", "Track model parameters using MLflow"],
            timeEstimate: "5 Weeks",
            resources: ["PyTorch core docs", "MLflow tracking guide"],
            projectCheckpoint: { title: "Medical Scan Segmentation API", desc: "A FastAPI server running a PyTorch image segmentation model with telemetry logs." },
            quiz: {
              question: "Which optimizer tracks historical gradient averages dynamically to control neural network updates?",
              options: ["SGD", "Adam", "Adadelta", "RMSprop"],
              answerIndex: 1,
              explanation: "Adam (Adaptive Moment Estimation) tracks both first and second moments of gradients, optimizing updates dynamically."
            }
          },
          {
            id: "ai-ml-node-4",
            title: "Generative AI & LLM Orchestrations",
            phase: "Deployment",
            explanation: "Scale LLM deployments using vector search indexes, customize prompt templates, and construct semantic information retrieval pipelines (RAG).",
            objectives: ["Integrate OpenAI and open-source models with Python", "Index text chunks into vector databases", "Optimize prompt tokens and evaluate output safety"],
            timeEstimate: "4 Weeks",
            resources: ["LangChain Official Docs", "Pinecone Vector Search Handbook", "DeepLearning.AI Generative AI courses"],
            projectCheckpoint: {
              title: "Enterprise Vector Search Portal",
              desc: "A search engine chunking PDF documents, generating vector embeddings, and running semantic matching using local model endpoints."
            },
            quiz: {
              question: "Why is chunk overlap used when parsing documents for vector databases?",
              options: ["To reduce vector index size", "To ensure context boundaries are not lost across split points", "To make embedding generation faster", "To encrypt the documents"],
              answerIndex: 1,
              explanation: "Chunk overlap preserves surrounding sentences around splitting boundaries, preventing loss of vital contextual semantic information."
            }
          }
        ],
        skillsTree: [
          { id: "s-ai-ml-1", name: "Python Scripting & Stats", tier: "Beginner", whyMatters: "Calculates mathematical variables of ML models.", dependencies: [], hours: 60, importance: "High", techs: ["Python", "NumPy"], unlocked: true, completed: false },
          { id: "s-ai-ml-2", name: "Data Engineering & Analytics", tier: "Beginner", whyMatters: "Handles messy CSV files and coordinates datasets.", dependencies: ["s-ai-ml-1"], hours: 80, importance: "High", techs: ["Pandas", "SQL"], unlocked: true, completed: false },
          { id: "s-ai-ml-3", name: "Supervised ML Models", tier: "Intermediate", whyMatters: "Enables pattern identification and predictions.", dependencies: ["s-ai-ml-2"], hours: 100, importance: "High", techs: ["Scikit-Learn"], unlocked: false, completed: false },
          { id: "s-ai-ml-4", name: "Deep Neural Networks", tier: "Advanced", whyMatters: "Processes unformatted data like images, audio, and texts.", dependencies: ["s-ai-ml-3"], hours: 120, importance: "High", techs: ["PyTorch", "TensorFlow"], unlocked: false, completed: false },
          { id: "s-ai-ml-5", name: "MLOps Deployment Pipelines", tier: "Expert", whyMatters: "Packages models into scalable live APIs.", dependencies: ["s-ai-ml-4"], hours: 80, importance: "Medium", techs: ["FastAPI", "MLflow", "Docker"], unlocked: false, completed: false }
        ],
        projects: [
          {
            title: "Deep Learning Image Classification Stack",
            level: "Advanced",
            problemStatement: "Sorting defect logs manually in factories causes delivery delays and manual error spikes.",
            features: ["Real-time visual processing", "Auto-alert triggers on anomalies", "API endpoint scaling specs"],
            architecture: "PyTorch neural net served via FastAPI, built into a Docker container, and monitored with Prometheus telemetry.",
            techStack: ["Python", "PyTorch", "FastAPI", "Docker", "AWS"],
            outcomes: ["Automated manufacturing checks with 98.6% classification accuracy", "Model endpoints load speed below 40ms"],
            completionTime: "4 Weeks",
            resumeValue: 5
          }
        ],
        placementPrep: {
          dsa: "Linear algebra matrix algorithms representation, basic graphs, and probability search models.",
          systemDesign: "Serving models, GPU execution queues, cache layers, API scaling rules, and data pipeline flows (ETL).",
          coreSubjects: ["Linear Algebra & Calculus", "Probability & Statistics", "Data Management Systems"],
          resumeRules: ["Mention model accuracy metrics achieved.", "List dataset sizes (e.g. 'Optimized models on 5M+ row datasets')."],
          githubRules: ["Include Jupyter Notebook files showing clear graphs.", "Provide model deployment instructions in README configs."],
          portfolioRules: ["Provide demo links demonstrating model inputs and outputs in real-time."],
          mockQuestions: [
            { q: "What is the vanishing gradient problem and how do we resolve it?", topic: "Deep Learning" },
            { q: "Explain the bias-variance trade-off in machine learning models.", topic: "ML Theory" }
          ]
        },
        salaries: {
          internship: 35000,
          fresher: 8.0,
          mid: 18.0,
          senior: 35.0,
          globalTrend: "Extreme demand with massive venture capital funding.",
          remoteTrend: "Ranges from $55,000 to $120,000 USD for remote talent."
        },
        trends: {
          trendingTechs: ["Transformers architectures", "Quantization tools (llama.cpp)", "Local models run (Ollama)"],
          emergingSkills: ["Edge AI inference designs", "Fine-tuning techniques (LoRA)"],
          predictions: "Traditional ML engineering will merge with MLOps pipelines, allowing engineers to serve models to millions of edge instances securely."
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
          },
          {
            id: "ai-node-2",
            title: "Retrieval-Augmented Generation (RAG)",
            phase: "Core Concepts",
            explanation: "Understand document chunking methods, vector embeddings, semantic searches, and metadata filtering.",
            objectives: ["Vector database indexes mapping", "Write custom chunk pipelines", "Optimize semantic retrieval search accuracy"],
            timeEstimate: "4 Weeks",
            resources: ["Pinecone guides", "LlamaIndex documentation"],
            projectCheckpoint: { title: "Knowledge Base AI Finder", desc: "A system reading PDF documents, indexing semantic vector embeddings, and answering user queries." },
            quiz: {
              question: "Which database type is optimal for retrieving documents based on conceptual similarity?",
              options: ["Relational Database", "Vector Database", "Key-Value Store", "Graph Database"],
              answerIndex: 1,
              explanation: "Vector databases index high-dimensional numeric arrays representing textual semantics, enabling cosine similarity lookups."
            }
          },
          {
            id: "ai-node-3",
            title: "Stateful Agent Graphs",
            phase: "Advanced Concepts",
            explanation: "Build cyclic graph topologies, maintain agent memory buffers, configure human-in-the-loop nodes, and deploy agents.",
            objectives: ["Define cyclic state structures in LangGraph", "Create tool validation checks", "Serve agents with FastAPI endpoints"],
            timeEstimate: "5 Weeks",
            resources: ["LangGraph docs", "DeepLearning.AI agent workflows"],
            projectCheckpoint: { title: "Autonomous Research Team", desc: "A multi-agent team collaborating on topic analysis, Fact Check, and report generation." },
            quiz: {
              question: "What is 'Human-in-the-loop' configuration in LangGraph?",
              options: ["Running LLMs on personal computers", "Pausing graph runs at specific nodes for human approval before execution", "Adding feedback links to forms", "Fine-tuning models on user chats"],
              answerIndex: 1,
              explanation: "Human-in-the-loop triggers pause points (interrupts) in state graphs, requiring manual validation before the agent executes tools."
            }
          },
          {
            id: "ai-node-4",
            title: "Multi-Agent System Security & Human Controls",
            phase: "Deployment",
            explanation: "Learn to enforce safety guardrails on autonomous AI actions, configure persistent human-in-the-loop validation, and trace agent logs in production.",
            objectives: ["Enforce strict API usage limits and fallback tools", "Implement LangGraph human interrupt states", "Trace agent tokens using LangSmith/Langfuse analytics"],
            timeEstimate: "4 Weeks",
            resources: ["LangGraph Interrupt Documentation", "LangSmith Evaluation Guide", "OWASP Top 10 LLM Security"],
            projectCheckpoint: {
              title: "Agent Task Approval Console",
              desc: "A dashboard displaying agent search plans, prompting admins to approve code execution, and tracking token costs."
            },
            quiz: {
              question: "What represents the main security risk in allowing autonomous LLM agents to execute shell commands directly?",
              options: ["Prompt Injection leading to arbitrary command execution", "High network latency", "API formatting errors", "Token limits exhaustion"],
              answerIndex: 0,
              explanation: "If an attacker injects commands via prompt interfaces, the agent might execute harmful shell instructions inside the server environment."
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
          resumeRules: ["Detail custom agent workflows you built.", "Specify token reduction metrics or prompt latency speedups ($X$\% improvements)."],
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
      },

      "DevOps Engineer": {
        role: "DevOps Engineer",
        icon: Terminal,
        category: "Cloud & DevOps",
        level: "Intermediate",
        duration: "6 Months",
        difficulty: "Medium",
        demand: "Critical",
        growth: "32%",
        remoteWork: "Yes",
        about: "A DevOps Engineer automates release paths, manages cloud servers, implements Infrastructure as Code, and configures telemetry monitoring stacks.",
        importance: "Ensures the continuous integration, testing, deployment, and high availability of software operations across global cloud platforms.",
        problemsSolved: "Resolves long build times, manual deployment errors, server downtime, and slow incident response times.",
        responsibilities: [
          "Automate deployment using CI/CD pipelines (Jenkins, GitHub Actions).",
          "Manage infrastructure configuration dynamically using Terraform and Ansible.",
          "Orchestrate application containers with Docker and Kubernetes namespaces.",
          "Implement monitoring, tracing, and metric collection using Prometheus, Grafana, and ELK."
        ],
        industries: [
          { name: "Cloud SaaS", howUsed: "Auto-scaling web clusters, managing microservice networks, and setting up CDN caching.", example: "AWS platforms, GCP systems", growthPotential: "Critical" },
          { name: "FinTech Infrastructure", howUsed: "Enforcing zero-trust network boundaries, aggregate logging audits, and managing secure key stores.", example: "Stripe systems, bank backends", growthPotential: "High" },
          { name: "Digital Services", howUsed: "Automating staging servers, managing domain records, and monitoring system usage logs.", example: "Vercel networks, Cloudflare configurations", growthPotential: "Stable" }
        ],
        technologies: [],
        roadmap: [
          {
            id: "do-node-1",
            title: "Linux Core & Bash Scripting",
            phase: "Foundation",
            explanation: "Master shell command execution, file system permissions, user administration, and automated Bash scripts.",
            objectives: ["Write custom system automation scripts", "Manage server user permissions", "Configure environment files"],
            timeEstimate: "3 Weeks",
            resources: ["Linux Command Line Book", "GNU Bash reference"],
            projectCheckpoint: { title: "System Logs Parser Script", desc: "A Bash script scanning system log files, parsing error metrics, and sending automated alerts." },
            quiz: {
              question: "Which command changes file access permissions in Linux systems?",
              options: ["chown", "chmod", "chperm", "chgrp"],
              answerIndex: 1,
              explanation: "chmod (change mode) modifies read, write, and execute permissions for users, groups, and others on files."
            }
          },
          {
            id: "do-node-2",
            title: "Containers & CI/CD Pipelines",
            phase: "Core Concepts",
            explanation: "Learn container setups using Docker, microservices networking configurations, and automate builds via GitHub Actions.",
            objectives: ["Write Dockerfile configs", "Build automated build pipelines", "Publish images to container registries"],
            timeEstimate: "4 Weeks",
            resources: ["Docker documentation", "GitHub Actions docs"],
            projectCheckpoint: { title: "Automated Build Release Stack", desc: "A repository trigger building a Node container and publishing it to Docker Hub on git commits." },
            quiz: {
              question: "What represents a single task execution boundary in GitHub Actions workflows?",
              options: ["Workflow", "Job", "Step", "Runner"],
              answerIndex: 2,
              explanation: "A Step is an individual execution item (e.g. running a command or action) within a Job."
            }
          },
          {
            id: "do-node-3",
            title: "Infrastructure as Code & Cloud",
            phase: "Advanced Concepts",
            explanation: "Provision AWS cloud resources declaratively using Terraform, configure deployments with Ansible, and manage Kubernetes clusters.",
            objectives: ["Write Terraform configuration files", "Deploy services to K8s nodes", "Manage cloud cluster access keys"],
            timeEstimate: "5 Weeks",
            resources: ["HashiCorp Terraform docs", "Kubernetes tutorials"],
            projectCheckpoint: { title: "Cloud High Availability Stack", desc: "Terraform configuration deploying load balancers and running containers on a Kubernetes cluster." },
            quiz: {
              question: "How does Terraform track the actual state of cloud resources it manages?",
              options: ["By scanning cloud providers live", "Using a local or remote terraform.tfstate file", "By parsing Git history logs", "Through env variables"],
              answerIndex: 1,
              explanation: "Terraform uses the state file (tfstate) to map configuration variables to actual deployed real-world resource instances."
            }
          },
          {
            id: "do-node-4",
            title: "GitOps Pipelines & Continuous Delivery",
            phase: "Deployment",
            explanation: "Implement automated state synchronization between your Git repos and running Kubernetes clusters using GitOps operators like ArgoCD.",
            objectives: ["Configure ArgoCD application manifests", "Manage secure cluster states dynamically via Git pull requests", "Perform canary deployments on Kubernetes clusters"],
            timeEstimate: "4 Weeks",
            resources: ["ArgoCD Documentation", "GitOps Guidebook", "Cloud Native CNCF Interactive Map"],
            projectCheckpoint: {
              title: "Self-Healing GitOps Deployment",
              desc: "A Kubernetes repository deploying application charts using ArgoCD that automatically reverts manual cluster changes back to Git state configurations."
            },
            quiz: {
              question: "What is the primary architectural principle of GitOps?",
              options: ["The Git repository serves as the single source of truth for declared infrastructure states", "Deployments must be triggered by typing commands in server SSH terminals", "Always use relational databases for system settings", "Cloud keys must be public"],
              answerIndex: 0,
              explanation: "GitOps specifies that the entire system state (infrastructure, configurations, and application containers) is stored in Git, which is synced to the cluster continuously."
            }
          }
        ],
        skillsTree: [
          { id: "s-do-1", name: "Linux & Terminal scripting", tier: "Beginner", whyMatters: "Prerequisite for configuring servers and execution nodes.", dependencies: [], hours: 60, importance: "High", techs: ["Linux", "Bash"], unlocked: true, completed: false },
          { id: "s-do-2", name: "Containers Orchestrations", tier: "Beginner", whyMatters: "Enables packaging applications consistently.", dependencies: ["s-do-1"], hours: 80, importance: "High", techs: ["Docker", "Kubernetes"], unlocked: true, completed: false },
          { id: "s-do-3", name: "Automated CI/CD Pipelines", tier: "Intermediate", whyMatters: "Accelerates code release speeds and checks bugs.", dependencies: ["s-do-2"], hours: 80, importance: "High", techs: ["Jenkins", "GitHub Actions"], unlocked: false, completed: false },
          { id: "s-do-4", name: "Infrastructure as Code (IaC)", tier: "Advanced", whyMatters: "Allows scaling cloud clusters programmatically.", dependencies: ["s-do-2"], hours: 100, importance: "High", techs: ["Terraform", "Ansible"], unlocked: false, completed: false },
          { id: "s-do-5", name: "Telemetry & Monitoring", tier: "Advanced", whyMatters: "Tracks error rates and alerts teams on down-times.", dependencies: ["s-do-3"], hours: 80, importance: "Medium", techs: ["Prometheus", "Grafana", "ELK"], unlocked: false, completed: false }
        ],
        projects: [
          {
            title: "GitOps Kubernetes Infrastructure Deployment",
            level: "Industry-Level",
            problemStatement: "Manual deployments cause drift between production and test environments.",
            features: ["Automated configuration synchronization", "Sealed cloud credential files", "Self-healing deployments on K8s"],
            architecture: "GitOps architecture deploying configurations via ArgoCD pipelines onto AWS EKS clusters.",
            techStack: ["Kubernetes", "Terraform", "ArgoCD", "Prometheus", "AWS"],
            outcomes: ["Achieved 100% environment sync safety", "Deployment time cut from 4 hours to 8 minutes"],
            completionTime: "4 Weeks",
            resumeValue: 5
          }
        ],
        placementPrep: {
          dsa: "Basic parsing algorithms, path searches, trees, and hash map registries.",
          systemDesign: "Load balancers routing, cloud firewalls, logging pipelines scaling, high availability setups, and recovery procedures.",
          coreSubjects: ["Computer Networks (TCP, HTTP, DNS, SSH)", "Operating Systems fundamentals", "Cloud Architectures"],
          resumeRules: ["State system reliability metrics (e.g. 'Achieved 99.99% system uptime').", "Mention container scale coordinates."],
          githubRules: ["Show clean Terraform structural files.", "Include pipeline execution check logs in README listings."],
          portfolioRules: ["Provide structural diagrams illustrating build pipelines and cloud topologies."],
          mockQuestions: [
            { q: "What is configuration drift and how does Terraform solve it?", topic: "Infrastructure as Code" },
            { q: "Explain the container boot lifecycle and K8s readiness/liveness checks.", topic: "Orchestration" }
          ]
        },
        salaries: {
          internship: 30000,
          fresher: 7.0,
          mid: 15.0,
          senior: 32.0,
          globalTrend: "High corporate demand for cloud security automation and GitOps execution specialists.",
          remoteTrend: "Ranges from $50,000 to $105,000 USD."
        },
        trends: {
          trendingTechs: ["GitOps pipelines (ArgoCD)", "Zero-Trust network configs", "Serverless K8s nodes"],
          emergingSkills: ["AI pipeline automation", "Platform engineering setups"],
          predictions: "Operations automation will shift toward developer platform portals, hiding cluster configs behind standard self-service dashboards."
        }
      }
    };
  }, []);

  // Dynamic Generator Fallback to cover ALL remaining roles
  const activeRoleDetails = useMemo((): RoleDetails => {
    let details: RoleDetails;
    if (MOCK_ROLES_DATABASE[selectedRole]) {
      details = { ...MOCK_ROLES_DATABASE[selectedRole] };
    } else {
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

      details = {
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
        technologies: [],
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
    }

    // Dynamic enrichment with categories
    details.technologies = getRoleTechnologies(details.role, details.category, details.difficulty);
    return details;
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

      {/* Sticky Sub-Header — Blueprint Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/student-hub"
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase tracking-widest font-black text-cyan-400 flex items-center gap-1">
                <Compass className="h-2.5 w-2.5" /> Career Blueprint Hub
              </span>
              <h1 className="text-sm font-black tracking-tight text-white leading-none truncate">Career Operating System</h1>
            </div>
          </div>

          {/* Right: Stats + Compare */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCompareModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:text-white text-[10px] font-black text-slate-400 transition-all uppercase tracking-wider cursor-pointer"
            >
              ⚖️ Compare
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold text-[11px]">
              <Trophy className="h-3 w-3" />
              <span>{xp} XP</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold text-[11px]">
              <Flame className="h-3 w-3 fill-current" />
              <span>{streak}d</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT SIDEBAR: Domain Categories & Roles Menu */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-[3.75rem]">
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/60 rounded-2xl overflow-hidden shadow-xl">
              {/* Sidebar Header */}
              <div className="px-4 pt-4 pb-3 border-b border-neutral-800/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black uppercase text-neutral-300 tracking-widest">Career Tracks</h3>
                  <span className="text-[9px] font-black text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                    {DOMAINS.flatMap(d => d.roles).length} Paths
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3 w-3 text-neutral-500" />
                  <input
                    type="text"
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                    placeholder="Search careers..."
                    className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-bold text-slate-200 placeholder:text-neutral-600 outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* Scrollable Domain & Role list */}
              <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto p-3 pr-2">
                {filteredRolesByDomain.map((domain, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-cyan-500/80 tracking-widest block px-1 pt-1">{domain.name}</span>
                    <div className="space-y-0.5">
                      {domain.roles.map(r => (
                        <button
                          key={r}
                          onClick={() => {
                            setSelectedRole(r);
                            setSelectedDomain(domain.name);
                            addXp(10, `Explored Career Path: ${r}`);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                            selectedRole === r
                              ? "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300"
                              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white border border-transparent"
                          }`}
                        >
                          <span className="truncate">{r}</span>
                          {selectedRole === r && <ChevronRight className="h-3 w-3 shrink-0 text-cyan-400" />}
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

            {/* Role Hero Summary Card */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              {/* Decorative role icon watermark */}
              <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none select-none">
                <activeRoleDetails.icon className="h-36 w-36 text-cyan-400" />
              </div>

              {/* Meta Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                  {activeRoleDetails.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                  {activeRoleDetails.level}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-400 uppercase tracking-widest">
                  ⬬ {activeRoleDetails.demand} Demand
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[9px] font-black text-purple-400 uppercase tracking-widest">
                  ↑ {activeRoleDetails.growth} Growth
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                  {activeRoleDetails.difficulty} Difficulty
                </span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">{activeRoleDetails.role}</h2>
              <p className="text-[11px] text-neutral-400 mt-1.5 max-w-2xl leading-relaxed">{activeRoleDetails.about}</p>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-neutral-800/50">
                <div className="text-center">
                  <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider block">Duration</span>
                  <span className="text-xs font-black text-white">{activeRoleDetails.duration}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider block">Fresher CTC</span>
                  <span className="text-xs font-black text-green-400">₹{activeRoleDetails.salaries?.fresher} LPA</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider block">Remote</span>
                  <span className="text-xs font-black text-cyan-400">{activeRoleDetails.remoteWork}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider block">Skills Nodes</span>
                  <span className="text-xs font-black text-white">{activeRoleDetails.skillsTree?.length || 0}</span>
                </div>
              </div>

              {/* Horizontal Workspace Tab Bar */}
              <div className="flex items-center gap-0.5 border-t border-neutral-800/40 mt-5 pt-3 flex-wrap">
                {[
                  { id: "overview", label: "Overview", icon: "📁" },
                  { id: "salaries", label: "Market & Salary", icon: "💰" },
                  { id: "technologies", label: "Tech Stack", icon: "⚡" },
                  { id: "roadmap", label: "Roadmap", icon: "🗺️" },
                  { id: "skills", label: "Skill Tree", icon: "🌳" },
                  { id: "projects", label: "Projects", icon: "🛠️" },
                  { id: "placement", label: "Placement Prep", icon: "🏆" },
                  { id: "mentor", label: "AI Mentor", icon: "🤖" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                        : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/40"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB INTERFACES */}
            <div className="min-h-[400px]">
              
              {/* Tab: Overview details */}
              {activeTab === "overview" && (
                <div className="space-y-5">

                  {/* Top Row: Relevance + Problems Solved */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Industry Relevance Card */}
                    <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-neutral-800/50 pb-2.5">
                        <div className="h-6 w-6 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Industry Relevance</h3>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">{activeRoleDetails.importance}</p>
                      <div className="pt-2 border-t border-neutral-800/40">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-5 w-5 rounded bg-orange-500/10 flex items-center justify-center shrink-0">
                            <Zap className="h-3 w-3 text-orange-400" />
                          </div>
                          <h4 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Problems Solved Daily</h4>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{activeRoleDetails.problemsSolved}</p>
                      </div>
                    </div>

                    {/* Core Responsibilities Card */}
                    <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-neutral-800/50 pb-2.5">
                        <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                          <ListTodo className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Core Responsibilities</h3>
                      </div>
                      <div className="space-y-2">
                        {activeRoleDetails.responsibilities.map((res, i) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <span className="h-4 w-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-[11px] text-neutral-400 leading-relaxed">{res}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Active Hiring Sectors */}
                  <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-800/50 pb-2.5">
                      <div className="h-6 w-6 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <Building className="h-3.5 w-3.5 text-green-400" />
                      </div>
                      <h3 className="text-[10px] font-black uppercase text-green-400 tracking-widest">Active Hiring Sectors</h3>
                      <span className="ml-auto text-[9px] font-black text-neutral-500 uppercase">{activeRoleDetails.industries.length} Sectors</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {activeRoleDetails.industries.map((ind, i) => (
                        <div key={i} className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/50 space-y-1.5 hover:border-neutral-700 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[11px] font-black text-white leading-tight">{ind.name}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/15 px-1.5 py-0.5 rounded shrink-0">
                              {ind.growthPotential}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed">{ind.howUsed}</p>
                          <div className="flex items-center gap-1 pt-1 border-t border-neutral-800/40">
                            <Building className="h-2.5 w-2.5 text-neutral-600 shrink-0" />
                            <p className="text-[9px] text-neutral-500 font-semibold truncate">{ind.example}</p>
                          </div>
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
                  {(() => {
                    const groups: Record<string, TechCard[]> = {};
                    activeRoleDetails.technologies.forEach(tech => {
                      const cat = tech.category || "Core Stack";
                      if (!groups[cat]) groups[cat] = [];
                      groups[cat].push(tech);
                    });

                    return (
                      <div className="space-y-8">
                        {Object.entries(groups).map(([catName, techList]) => (
                          <div key={catName} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">{catName}</h3>
                              <div className="h-[1px] bg-neutral-800/60 flex-1" />
                              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest">{techList.length} Tools</span>
                            </div>
                            <div className="space-y-3">
                              {techList.map((tech) => {
                                const isOpen = expandedTechCard === tech.name;
                                return (
                                  <div
                                    key={tech.name}
                                    className="bg-neutral-900/40 border border-neutral-850 rounded-3xl overflow-hidden shadow-xl"
                                  >
                                    <button
                                      onClick={() => setExpandedTechCard(isOpen ? null : tech.name)}
                                      className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-neutral-800/10"
                                    >
                                      <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">{tech.category || "Tech Stack Core"}</span>
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
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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
