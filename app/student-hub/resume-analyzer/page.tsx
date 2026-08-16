"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, ShieldCheck, Sparkles, AlertTriangle, RefreshCw,
  Key, Lock, Zap, FileText, Briefcase, TrendingUp, CheckCircle2,
  XCircle, ArrowRight, Copy, Check, ChevronDown, Target,
  UploadCloud, X, File, FileType2, User, Award,
  BarChart2, Lightbulb, Gauge, BookOpen, Briefcase as BriefcaseIcon,
  GraduationCap, FolderOpen, BadgeCheck, Phone, ChevronRight, Layers,
  Sliders, Wand2, Percent, ListFilter, LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────── TYPES ─────────────── */
interface BulletImprovement { original: string; improved: string; }
interface KeywordDensity   { keyword: string; inResume: number; inJd: number; status: "good" | "low" | "missing"; }
interface SectionScore     { score: number; feedback: string; }
interface WeakVerb         { found: string; suggested: string; }
interface AnalyzerResult {
  matchScore: number;
  missingKeywords: string[];
  keywordDensity: KeywordDensity[];
  sectionScores: Record<string, SectionScore>;
  actionVerbScore: number;
  weakVerbs: WeakVerb[];
  quantificationScore: number;
  unquantifiedBullets: string[];
  tailoredSummary: string;
  bulletImprovements: BulletImprovement[];
  overallFeedback: string;
}

type TabType = "overview" | "keywords" | "sections" | "verbs" | "quant" | "summary";

/* ─────────────── LOADING STEPS ─────────────── */
const STEPS = [
  { label: "Parsing resume structure...",       icon: FileText   },
  { label: "Extracting JD requirements...",     icon: Briefcase  },
  { label: "Running keyword alignment...",      icon: Key        },
  { label: "Scoring ATS compatibility...",      icon: Target     },
  { label: "Analyzing action verbs...",         icon: Gauge      },
  { label: "Generating bullet rewrites...",     icon: Sparkles   },
  { label: "Writing tailored summary...",       icon: User       },
  { label: "Compiling full report...",          icon: TrendingUp },
];

/* ─────────────── JD TEMPLATES ─────────────── */
const JD_TEMPLATES: Record<string, { label: string; icon: string; category: string; jd: string }> = {
  "frontend-engineer": {
    label: "Frontend Engineer", icon: "🎨", category: "Engineering",
    jd: `We are looking for a skilled Frontend Engineer to join our team.

Requirements:
- 2+ years of experience with React.js, Next.js, or Vue.js
- Proficiency in TypeScript and modern JavaScript (ES6+)
- Experience with REST APIs and GraphQL
- Strong knowledge of HTML5, CSS3, responsive design
- Familiarity with Tailwind CSS or similar utility frameworks
- Experience with state management (Redux, Zustand, Context API)
- Version control with Git and collaborative GitHub workflows
- Unit testing experience (Jest, React Testing Library)
- Good understanding of web performance and Core Web Vitals

Nice to have:
- Experience with CI/CD pipelines
- Familiarity with Docker
- Contributions to open source projects`,
  },
  "backend-engineer": {
    label: "Backend Engineer", icon: "⚙️", category: "Engineering",
    jd: `We are hiring a Backend Engineer to build scalable, reliable server-side systems.

Requirements:
- 2+ years of experience in backend development
- Proficiency in Node.js, Python (FastAPI/Django), or Java (Spring Boot)
- Strong knowledge of RESTful API design principles
- Experience with relational databases (PostgreSQL, MySQL) and NoSQL (MongoDB, Redis)
- Familiarity with microservices architecture and message queues (RabbitMQ, Kafka)
- Experience with cloud platforms: AWS, GCP, or Azure
- Understanding of authentication & security best practices (OAuth2, JWT, HTTPS)
- Containerization and orchestration: Docker, Kubernetes
- Version control and code review processes`,
  },
  "fullstack-developer": {
    label: "Full Stack Developer", icon: "🔀", category: "Engineering",
    jd: `Looking for a Full Stack Developer capable of owning features end-to-end.

Requirements:
- 3+ years of full stack development experience
- Frontend: React.js / Next.js, TypeScript, CSS/Tailwind
- Backend: Node.js / Express or Python / FastAPI
- Database: PostgreSQL / MongoDB, Redis for caching
- RESTful API development and integration
- Authentication systems (JWT, OAuth2, sessions)
- Cloud deployment (Vercel, AWS, Railway, Render)
- Git, CI/CD, agile/scrum practices`,
  },
  "data-scientist": {
    label: "Data Scientist", icon: "📊", category: "Data & AI",
    jd: `We seek a Data Scientist to extract insights and build predictive models.

Requirements:
- Bachelor's or Master's in Computer Science, Statistics, or related field
- 2+ years working with Python (pandas, NumPy, scikit-learn, matplotlib)
- Machine learning: regression, classification, clustering, ensemble methods
- Experience with deep learning frameworks: TensorFlow or PyTorch
- SQL and working with large datasets
- Statistical analysis, A/B testing, hypothesis testing
- Data visualization: Tableau, Power BI, or matplotlib/seaborn`,
  },
  "ml-engineer": {
    label: "ML Engineer", icon: "🤖", category: "Data & AI",
    jd: `We are hiring a Machine Learning Engineer to productionize AI systems.

Requirements:
- Strong Python programming skills
- Deep learning: PyTorch, TensorFlow, Keras
- Model training, fine-tuning, evaluation, and deployment
- MLOps practices: model versioning, monitoring, retraining pipelines
- Experience with LLMs, transformers, and prompt engineering
- REST APIs for serving models (FastAPI, Flask)
- Docker and Kubernetes for containerized deployments
- Vector databases (Pinecone, Weaviate, Chroma)`,
  },
  "devops-engineer": {
    label: "DevOps Engineer", icon: "🚀", category: "Infrastructure",
    jd: `Seeking a DevOps Engineer to manage infrastructure and streamline deployments.

Requirements:
- 3+ years DevOps / SRE experience
- Cloud platforms: AWS (EC2, S3, RDS, Lambda), GCP, or Azure
- Infrastructure as Code: Terraform, Ansible, CloudFormation
- Container orchestration: Kubernetes, Helm charts
- CI/CD pipelines: GitHub Actions, Jenkins, GitLab CI
- Monitoring: Prometheus, Grafana, Datadog
- Linux system administration
- Networking: VPCs, load balancers, DNS, SSL`,
  },
  "product-manager": {
    label: "Product Manager", icon: "🗺️", category: "Product",
    jd: `We're looking for a Product Manager to define and drive our product roadmap.

Requirements:
- 3+ years of product management experience in a tech company
- Ability to define product vision, strategy, and roadmap
- Experience writing PRDs, user stories, and acceptance criteria
- Data-driven decision making: SQL, analytics tools (Mixpanel, Amplitude)
- Conducting user interviews and translating insights into features
- Agile / Scrum methodology and sprint planning
- Excellent written and verbal communication`,
  },
  "uiux-designer": {
    label: "UI/UX Designer", icon: "🎯", category: "Design",
    jd: `Join us as a UI/UX Designer to craft exceptional digital experiences.

Requirements:
- 2+ years of UI/UX design experience
- Proficiency in Figma (prototyping, auto-layout, components, design systems)
- Strong portfolio showcasing web and mobile design work
- Understanding of user-centered design principles and design thinking
- Conducting user research, usability testing, and competitive analysis
- Creating wireframes, user flows, and high-fidelity mockups
- Knowledge of accessibility standards (WCAG 2.1)`,
  },
};

const CATEGORY_ORDER = ["Engineering", "Data & AI", "Infrastructure", "Product", "Design"];

const SECTION_META: Record<string, { label: string; icon: React.ElementType }> = {
  contactInfo:    { label: "Contact Info",    icon: Phone         },
  summary:        { label: "Summary",         icon: User          },
  experience:     { label: "Experience",      icon: BriefcaseIcon },
  skills:         { label: "Skills",          icon: Key           },
  education:      { label: "Education",       icon: GraduationCap },
  projects:       { label: "Projects",        icon: FolderOpen    },
  certifications: { label: "Certifications", icon: BadgeCheck    },
};

/* ─────────────── HELPERS ─────────────── */
function scoreTheme(s: number) {
  if (s >= 80) return { label: "Strong Match",   color: "#10b981", glow: "rgba(16,185,129,0.25)", cls: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", badgeBg: "bg-emerald-500/10 border-emerald-500/20" };
  if (s >= 55) return { label: "Moderate Match", color: "#f59e0b", glow: "rgba(245,158,11,0.25)",  cls: "text-amber-600 dark:text-amber-400",  bar: "bg-amber-500", badgeBg: "bg-amber-500/10 border-amber-500/20" };
  return             { label: "Weak Match",       color: "#ef4444", glow: "rgba(239,68,68,0.25)",   cls: "text-rose-600 dark:text-rose-400",   bar: "bg-rose-500", badgeBg: "bg-rose-500/10 border-rose-500/20" };
}

function sectionColor(s: number) {
  if (s >= 75) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (s >= 45) return { bar: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400"   };
  return               { bar: "bg-rose-500",    text: "text-rose-600 dark:text-rose-400"    };
}

function verbColor(s: number) {
  if (s >= 75) return { cls: "text-emerald-600 dark:text-emerald-400", label: "Excellent", bar: "bg-emerald-500" };
  if (s >= 50) return { cls: "text-amber-600 dark:text-amber-400",   label: "Average",   bar: "bg-amber-500"  };
  return               { cls: "text-rose-600 dark:text-rose-400",    label: "Weak",      bar: "bg-rose-500"   };
}

function quantColor(s: number) {
  if (s >= 60) return { cls: "text-emerald-600 dark:text-emerald-400", label: "Good" };
  if (s >= 35) return { cls: "text-amber-600 dark:text-amber-400",   label: "Low"  };
  return               { cls: "text-rose-600 dark:text-rose-400",    label: "Poor" };
}

function kwColor(status: string) {
  if (status === "good")    return { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" };
  if (status === "low")     return { bg: "bg-amber-500/10",   text: "text-amber-700 dark:text-amber-400",   border: "border-amber-500/20",   dot: "bg-amber-500"   };
  return                           { bg: "bg-rose-500/10",    text: "text-rose-700 dark:text-rose-400",    border: "border-rose-500/20",    dot: "bg-rose-500"    };
}

function FileIcon({ ext }: { ext: string }) {
  if (ext === "pdf")  return <FileType2 className="h-5 w-5 text-rose-500" />;
  if (ext === "docx") return <FileText  className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-slate-400 dark:text-zinc-500" />;
}

export default function ResumeAnalyzer() {
  const { user, loading: authLoading } = useAuth() as any;

  /* State */
  const [resumeMode, setResumeMode] = useState<"paste" | "upload">("paste");
  const [resumeText, setResumeText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileParseMsg, setFileParseMsg] = useState("");
  const [parsedFromFile, setParsedFromFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [jdMode, setJdMode] = useState<"paste" | "template">("paste");
  const [jobDescription, setJobDescription] = useState("");
  const [jdTemplateKey, setJdTemplateKey] = useState("");
  const [jdDropOpen, setJdDropOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  
  // Results Tab state
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [summarycopied, setSummaryCopied] = useState(false);

  const stepTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const jdDropRef = useRef<HTMLDivElement>(null);

  // Cycle processing animation steps
  useEffect(() => {
    if (loading) {
      setStepIdx(0);
      stepTimer.current = setInterval(() => setStepIdx((p) => (p + 1) % STEPS.length), 1400);
    } else {
      if (stepTimer.current) clearInterval(stepTimer.current);
    }
    return () => { if (stepTimer.current) clearInterval(stepTimer.current); };
  }, [loading]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (jdDropRef.current && !jdDropRef.current.contains(e.target as Node)) setJdDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* File parsing */
  const parseFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    setFileParseMsg("Reading file..."); setParsedFromFile(false);
    try {
      if (ext === "txt") {
        const text = await file.text();
        setResumeText(text); setParsedFromFile(true);
        setFileParseMsg(`✓ Extracted ${text.length} characters from .txt`); return;
      }
      if (ext === "pdf") {
        setFileParseMsg("Parsing PDF — loading engine...");
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        let full = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          setFileParseMsg(`Parsing PDF page ${i}/${pdf.numPages}...`);
          const pg = await pdf.getPage(i);
          const ct = await pg.getTextContent();
          full += ct.items.map((x: any) => x.str).join(" ") + "\n";
        }
        setResumeText(full.trim()); setParsedFromFile(true);
        setFileParseMsg(`✓ Extracted ${full.trim().length} chars from ${pdf.numPages}-page PDF`); return;
      }
      if (ext === "docx") {
        setFileParseMsg("Parsing Word document...");
        const mammoth = await import("mammoth");
        const buf = await file.arrayBuffer();
        const out = await mammoth.extractRawText({ arrayBuffer: buf });
        setResumeText(out.value.trim()); setParsedFromFile(true);
        setFileParseMsg(`✓ Extracted ${out.value.trim().length} chars from .docx`); return;
      }
      setFileParseMsg("⚠ Unsupported format. Use PDF, DOCX, or TXT.");
    } catch { setFileParseMsg("⚠ Failed to parse file. Paste text manually."); }
  }, []);

  const handleFileChange = (file: File) => {
    setUploadedFile(file); setResumeText(""); setParsedFromFile(false); setFileParseMsg("");
    parseFile(file);
  };

  const selectJdTemplate = (key: string) => {
    setJdTemplateKey(key); setJobDescription(JD_TEMPLATES[key].jd); setJdDropOpen(false);
  };

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text); setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copySummary = () => {
    if (result?.tailoredSummary) navigator.clipboard.writeText(result.tailoredSummary);
    setSummaryCopied(true); setTimeout(() => setSummaryCopied(false), 2000);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const rText = resumeText.trim();
    const jdText = jobDescription.trim();
    if (!rText || !jdText) { setError("Please provide both your resume and a target job description."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/v1/student-hub/resume-analyzer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: rText, jobDescription: jdText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
        setActiveTab("overview");
      } else {
        setError(data.message || "Failed to analyze. Please try again.");
      }
    } catch { setError("Network error — check your connection."); }
    finally { setLoading(false); }
  };

  /* Auth guards */
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Verifying access...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 py-12 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-xl space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Lock className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">Access Restricted</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">Sign in to use the AI Resume Analyzer and ATS Grader.</p>
        </div>
        <Link href="/login?redirect=/student-hub/resume-analyzer"
          className="flex h-11 w-full items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
          Sign In to Continue
        </Link>
        <Link href="/student-hub" className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100">Back to Hub</Link>
      </motion.div>
    </div>
  );

  const theme = result ? scoreTheme(result.matchScore) : null;
  const radius = 60; const circ = 2 * Math.PI * radius;

  const grouped = CATEGORY_ORDER.reduce<Record<string, { key: string; t: typeof JD_TEMPLATES[string] }[]>>((acc, cat) => {
    acc[cat] = Object.entries(JD_TEMPLATES).filter(([, t]) => t.category === cat).map(([key, t]) => ({ key, t }));
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative overflow-hidden select-none pb-24 transition-colors duration-300">
      
      {/* Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[25%] w-[45%] h-[45%] rounded-full bg-emerald-500/5 dark:bg-emerald-950/20 blur-[130px]" />
        <div className="absolute top-[25%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 dark:bg-cyan-950/15 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 dark:bg-purple-950/15 blur-[130px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Student Hub</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Beat The ATS Filter</span>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STEP 1: UPLOAD & INPUT STAGE (MINIMAL & FOCUSED)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence mode="wait">
        {!loading && !result && (
          <motion.main
            key="step-upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center space-y-10"
          >
            {/* Hero Section */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Resume &amp; JD Matcher</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-[1.08]">
                Beat the{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  ATS Filter
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                Upload or paste your resume alongside any Job Description to run 7-section ATS grading, keyword density audits, and AI bullet rewrites.
              </p>
            </div>

            {/* Input Form Card */}
            <form onSubmit={handleAnalyze} className="space-y-6 text-left max-w-3xl mx-auto">
              
              <div className="grid sm:grid-cols-2 gap-6 items-start">
                
                {/* 1. RESUME INPUT CARD */}
                <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Your Resume</span>
                    </label>

                    {/* Mode Toggle */}
                    <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-0.5 text-[10px] font-black">
                      <button
                        type="button"
                        onClick={() => { setResumeMode("paste"); setUploadedFile(null); setFileParseMsg(""); setParsedFromFile(false); }}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          resumeMode === "paste"
                            ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Paste Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setResumeMode("upload")}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          resumeMode === "upload"
                            ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Upload File
                      </button>
                    </div>
                  </div>

                  {resumeMode === "upload" ? (
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileChange(f);
                        }}
                      />
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault(); setIsDragging(false);
                          const f = e.dataTransfer.files?.[0];
                          if (f) handleFileChange(f);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px] ${
                          isDragging
                            ? "border-emerald-500 bg-emerald-500/10"
                            : uploadedFile
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : "border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 bg-slate-50/50 dark:bg-zinc-950/50"
                        }`}
                      >
                        {uploadedFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
                              <FileIcon ext={uploadedFile.name.split(".").pop()?.toLowerCase() ?? ""} />
                              <span className="truncate max-w-[180px]">{uploadedFile.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation(); setUploadedFile(null); setResumeText(""); setFileParseMsg(""); setParsedFromFile(false);
                                }}
                                className="text-slate-400 hover:text-rose-500 ml-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {fileParseMsg && (
                              <p className={`text-[10px] font-bold ${fileParseMsg.startsWith("✓") ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                {fileParseMsg}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <UploadCloud className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                              Click or Drag &amp; Drop Resume
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                              Supports PDF, DOCX, or TXT
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your full resume text here (experience, skills, projects, education)..."
                      className="w-full h-44 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-zinc-600 resize-none"
                    />
                  )}
                </div>

                {/* 2. JOB DESCRIPTION INPUT CARD */}
                <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Target Job Description</span>
                    </label>

                    {/* Template Dropdown */}
                    <div className="relative" ref={jdDropRef}>
                      <button
                        type="button"
                        onClick={() => setJdDropOpen(!jdDropOpen)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[10px] font-black text-cyan-700 dark:text-cyan-400 hover:border-cyan-500/40 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="h-3 w-3" />
                        <span>Presets</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {jdDropOpen && (
                        <div className="absolute right-0 top-8 z-50 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 max-h-64 overflow-y-auto">
                          {Object.entries(grouped).map(([cat, list]) => (
                            <div key={cat} className="space-y-1 mb-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 block">
                                {cat}
                              </span>
                              {list.map(({ key, t }) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => selectJdTemplate(key)}
                                  className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                  <span>{t.icon}</span>
                                  <span className="truncate">{t.label}</span>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={jobDescription}
                    onChange={(e) => { setJobDescription(e.target.value); setJdTemplateKey(""); }}
                    placeholder="Paste the target job description or click Presets to pick an engineering role..."
                    className="w-full h-44 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-zinc-600 resize-none"
                  />
                </div>

              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Run ATS Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>
          </motion.main>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STEP 2: ANALYZING STAGE (PROCESSING ANIMATION)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {loading && (
          <motion.main
            key="step-analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div className="relative h-28 w-28 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 opacity-20 blur-2xl animate-pulse" />
              <div className="absolute h-24 w-24 rounded-full border border-emerald-500/30 animate-spin" style={{ animationDuration: "6s" }} />
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Gauge className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mb-2">
              Evaluating ATS Match Score
            </h3>

            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 min-h-6">
              {STEPS[stepIdx].label}
            </p>

            <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden mt-6">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                initial={{ width: "10%" }}
                animate={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.main>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STEP 3: RESULTS EXPERIENCE (SCORE & INSIGHT TABS)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {result && theme && !loading && (
          <motion.main
            key="step-results"
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
          >
            {/* Top Bar: Action Buttons */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 flex-wrap gap-4">
              <button
                onClick={() => { setResult(null); setError(""); }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Analyze Another Resume</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:text-slate-900 dark:hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  Export Report
                </button>
              </div>
            </div>

            {/* HERO SCORE SNAPSHOT CARD */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl text-center relative overflow-hidden space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-200 dark:border-zinc-800 pb-6 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    MATCH COMPATIBILITY RATING
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                    ATS Audit Results
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                    {result.overallFeedback}
                  </p>
                </div>

                {/* Animated Circular Match Gauge */}
                <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="64" cy="64" r={radius} className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="8" fill="transparent" />
                    <motion.circle
                      cx="64" cy="64" r={radius}
                      stroke={theme.color} strokeWidth="8" fill="transparent"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: circ - (result.matchScore / 100) * circ }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                      {result.matchScore}%
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${theme.badgeBg} ${theme.cls}`}>
                      {theme.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850">
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Missing Keywords</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">{result.missingKeywords.length} Critical</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850">
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Action Verbs</span>
                  <span className={`text-base font-black ${verbColor(result.actionVerbScore).cls}`}>{result.actionVerbScore}% Score</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850">
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Quantification</span>
                  <span className={`text-base font-black ${quantColor(result.quantificationScore).cls}`}>{result.quantificationScore}% Score</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850">
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Unquantified Bullets</span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">{result.unquantifiedBullets.length} Found</span>
                </div>
              </div>

            </div>

            {/* TAB NAVIGATION BAR */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                { id: "keywords", label: `Keywords (${result.missingKeywords.length})`, icon: Key },
                { id: "sections", label: "Sections", icon: Layers },
                { id: "verbs", label: "Action Verbs", icon: Gauge },
                { id: "quant", label: "Quantification", icon: BarChart2 },
                { id: "summary", label: "Tailored Summary", icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT VIEWS */}
            <AnimatePresence mode="wait">
              
              {/* TAB 1: OVERVIEW & BULLET REWRITES */}
              {activeTab === "overview" && (
                <motion.div
                  key="tab-overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 text-left"
                >
                  {/* AI Bullet Rewrites */}
                  {result.bulletImprovements.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase text-slate-900 dark:text-zinc-100 tracking-wider flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>AI Powered Bullet Rewrites ({result.bulletImprovements.length})</span>
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {result.bulletImprovements.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 space-y-2">
                            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-start gap-2">
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 shrink-0">
                                Original
                              </span>
                              <span className="line-through opacity-80">{item.original}</span>
                            </div>
                            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-start justify-between gap-2 pt-1 border-t border-slate-200 dark:border-zinc-900">
                              <div className="flex items-start gap-2">
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                                  Improved
                                </span>
                                <span>{item.improved}</span>
                              </div>
                              <button
                                onClick={() => copyBullet(item.improved, idx)}
                                className="p-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
                                title="Copy Bullet"
                              >
                                {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: KEYWORD HEATMAP */}
              {activeTab === "keywords" && (
                <motion.div
                  key="tab-keywords"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 text-left"
                >
                  {/* Missing Keywords Warning */}
                  {result.missingKeywords.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Critical Missing Keywords ({result.missingKeywords.length})</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        These keywords appear prominently in the Job Description but are missing from your resume. Incorporate them naturally:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {result.missingKeywords.map((kw) => (
                          <span key={kw} className="px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keyword Density Grid */}
                  <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Full Keyword Density Audit
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.keywordDensity.map((kd) => {
                        const style = kwColor(kd.status);
                        return (
                          <div key={kd.keyword} className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${style.bg} ${style.border} ${style.text}`}>
                            <span className="truncate max-w-[140px]">{kd.keyword}</span>
                            <span className="text-[10px] font-black opacity-80">
                              Resume: {kd.inResume} / JD: {kd.inJd}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SECTION HEALTH SCORES */}
              {activeTab === "sections" && (
                <motion.div
                  key="tab-sections"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-5 text-left"
                >
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    7-Section Structure &amp; Content Health Audit
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(result.sectionScores).map(([key, sec]) => {
                      const meta = SECTION_META[key] ?? { label: key, icon: FileText };
                      const Icon = meta.icon;
                      const col = sectionColor(sec.score);
                      return (
                        <div key={key} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                              <span className="text-xs font-black text-slate-900 dark:text-zinc-100">{meta.label}</span>
                            </div>
                            <span className={`text-xs font-black ${col.text}`}>{sec.score}%</span>
                          </div>

                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-zinc-900 overflow-hidden">
                            <div className={`h-full ${col.bar}`} style={{ width: `${sec.score}%` }} />
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal font-medium">
                            {sec.feedback}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ACTION VERBS AUDIT */}
              {activeTab === "verbs" && (
                <motion.div
                  key="tab-verbs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Action Verb Strength &amp; Replacement Recommendations
                    </h3>
                    <span className={`text-xs font-black ${verbColor(result.actionVerbScore).cls}`}>
                      Score: {result.actionVerbScore}% ({verbColor(result.actionVerbScore).label})
                    </span>
                  </div>

                  {result.weakVerbs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.weakVerbs.map((wv, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 flex items-center justify-between text-xs font-bold">
                          <span className="text-rose-600 dark:text-rose-400 line-through">"{wv.found}"</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-black">"{wv.suggested}"</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Great job! High density of powerful action verbs detected throughout your resume.
                    </p>
                  )}
                </motion.div>
              )}

              {/* TAB 5: QUANTIFICATION AUDIT */}
              {activeTab === "quant" && (
                <motion.div
                  key="tab-quant"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Quantification &amp; Metrics Audit
                    </h3>
                    <span className={`text-xs font-black ${quantColor(result.quantificationScore).cls}`}>
                      Score: {result.quantificationScore}%
                    </span>
                  </div>

                  {result.unquantifiedBullets.length > 0 ? (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        Add metrics, percentages, or scale numbers to these bullet points:
                      </p>
                      {result.unquantifiedBullets.map((bullet, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                          • {bullet}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Excellent metric coverage! Bullet points contain measurable outcomes and numbers.
                    </p>
                  )}
                </motion.div>
              )}

              {/* TAB 6: TAILORED SUMMARY */}
              {activeTab === "summary" && (
                <motion.div
                  key="tab-summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      AI Generated Tailored Summary
                    </h3>
                    <button
                      onClick={copySummary}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {summarycopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{summarycopied ? "Copied" : "Copy Summary"}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {result.tailoredSummary}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.main>
        )}
      </AnimatePresence>

    </div>
  );
}
