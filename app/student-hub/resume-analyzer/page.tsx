"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, ShieldCheck, Sparkles, AlertTriangle, RefreshCw,
  Key, Lock, Zap, FileText, Briefcase, TrendingUp, CheckCircle2,
  XCircle, ArrowRight, Copy, Check, ChevronDown, Target,
  UploadCloud, X, File, FileType2, User, Award,
  BarChart2, Lightbulb, Gauge, BookOpen, Briefcase as BriefcaseIcon,
  GraduationCap, FolderOpen, BadgeCheck, Phone
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

/* ─────────────── SECTION META ─────────────── */
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
  if (s >= 80) return { label: "Strong Match",   color: "#10b981", glow: "rgba(16,185,129,0.25)", cls: "text-emerald-400", bar: "bg-emerald-500" };
  if (s >= 55) return { label: "Moderate Match", color: "#f59e0b", glow: "rgba(245,158,11,0.25)",  cls: "text-amber-400",  bar: "bg-amber-500"  };
  return             { label: "Weak Match",       color: "#ef4444", glow: "rgba(239,68,68,0.25)",   cls: "text-rose-400",   bar: "bg-rose-500"   };
}

function sectionColor(s: number) {
  if (s >= 75) return { bar: "bg-emerald-500", text: "text-emerald-400" };
  if (s >= 45) return { bar: "bg-amber-500",   text: "text-amber-400"   };
  return               { bar: "bg-rose-500",    text: "text-rose-400"    };
}

function verbColor(s: number) {
  if (s >= 75) return { cls: "text-emerald-400", label: "Excellent", bar: "bg-emerald-500" };
  if (s >= 50) return { cls: "text-amber-400",   label: "Average",   bar: "bg-amber-500"  };
  return               { cls: "text-rose-400",    label: "Weak",      bar: "bg-rose-500"   };
}

function quantColor(s: number) {
  if (s >= 60) return { cls: "text-emerald-400", label: "Good" };
  if (s >= 35) return { cls: "text-amber-400",   label: "Low"  };
  return               { cls: "text-rose-400",    label: "Poor" };
}

function kwColor(status: string) {
  if (status === "good")    return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" };
  if (status === "low")     return { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   dot: "bg-amber-500"   };
  return                           { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20",    dot: "bg-rose-500"    };
}

function FileIcon({ ext }: { ext: string }) {
  if (ext === "pdf")  return <FileType2 className="h-5 w-5 text-rose-400" />;
  if (ext === "docx") return <FileText  className="h-5 w-5 text-blue-400" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ResumeAnalyzer() {
  const { user, loading: authLoading } = useAuth();

  const [resumeMode,      setResumeMode]      = useState<"paste" | "upload">("paste");
  const [resumeText,      setResumeText]      = useState("");
  const [uploadedFile,    setUploadedFile]    = useState<File | null>(null);
  const [fileParseMsg,    setFileParseMsg]    = useState("");
  const [parsedFromFile,  setParsedFromFile]  = useState(false);
  const [isDragging,      setIsDragging]      = useState(false);

  const [jdMode,          setJdMode]          = useState<"paste" | "template">("paste");
  const [jobDescription,  setJobDescription]  = useState("");
  const [jdTemplateKey,   setJdTemplateKey]   = useState("");
  const [jdDropOpen,      setJdDropOpen]      = useState(false);

  const [loading,         setLoading]         = useState(false);
  const [stepIdx,         setStepIdx]         = useState(0);
  const [error,           setError]           = useState("");
  const [result,          setResult]          = useState<AnalyzerResult | null>(null);
  const [copiedIdx,       setCopiedIdx]       = useState<number | null>(null);
  const [openBullet,      setOpenBullet]      = useState<number | null>(null);
  const [summarycopied,   setSummaryCopied]   = useState(false);

  const stepTimer   = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef  = useRef<HTMLDivElement>(null);
  const jdDropRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      setStepIdx(0);
      stepTimer.current = setInterval(() => setStepIdx(p => (p + 1) % STEPS.length), 1600);
    } else {
      if (stepTimer.current) clearInterval(stepTimer.current);
    }
    return () => { if (stepTimer.current) clearInterval(stepTimer.current); };
  }, [loading]);

  useEffect(() => {
    if (result) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  }, [result]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (jdDropRef.current && !jdDropRef.current.contains(e.target as Node)) setJdDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── File parsing ── */
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
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        const buf  = await file.arrayBuffer();
        const pdf  = await pdfjsLib.getDocument({ data: buf }).promise;
        let full   = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          setFileParseMsg(`Parsing PDF page ${i}/${pdf.numPages}...`);
          const pg = await pdf.getPage(i);
          const ct = await pg.getTextContent();
          full    += ct.items.map((x: any) => x.str).join(" ") + "\n";
        }
        setResumeText(full.trim()); setParsedFromFile(true);
        setFileParseMsg(`✓ Extracted ${full.trim().length} chars from ${pdf.numPages}-page PDF`); return;
      }
      if (ext === "docx") {
        setFileParseMsg("Parsing Word document...");
        const mammoth = await import("mammoth");
        const buf     = await file.arrayBuffer();
        const out     = await mammoth.extractRawText({ arrayBuffer: buf });
        setResumeText(out.value.trim()); setParsedFromFile(true);
        setFileParseMsg(`✓ Extracted ${out.value.trim().length} chars from .docx`); return;
      }
      setFileParseMsg("⚠ Unsupported format. Use PDF, DOCX, or TXT.");
    } catch { setFileParseMsg("⚠ Failed to parse file. Paste the text manually."); }
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
    if (!rText || !jdText) { setError("Please provide both your resume and a job description."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch("/api/v1/student-hub/resume-analyzer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: rText, jobDescription: jdText }),
      });
      const data = await res.json();
      if (res.ok && data.success) setResult(data.result);
      else setError(data.message || "Failed to analyze. Please try again.");
    } catch { setError("Network error — check your connection."); }
    finally  { setLoading(false); }
  };

  /* ── Auth guards ── */
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Checking access...</p>
      </div>
    </div>
  );
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full bg-card border border-border/80 rounded-3xl p-8 text-center shadow-lg space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <Lock className="h-7 w-7 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">Sign in to use the AI Resume Analyzer and ATS Grader.</p>
        </div>
        <Link href="/login?redirect=/student-hub/resume-analyzer"
          className="flex h-11 w-full items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow transition-all active:scale-95">
          Sign In to Continue
        </Link>
        <Link href="/student-hub" className="block text-[11px] font-black text-muted-foreground hover:text-foreground">Back to Hub</Link>
      </motion.div>
    </div>
  );

  /* ── Main ── */
  const theme  = result ? scoreTheme(result.matchScore) : null;
  const radius = 60; const circ = 2 * Math.PI * radius;

  const grouped = CATEGORY_ORDER.reduce<Record<string, { key: string; t: typeof JD_TEMPLATES[string] }[]>>((acc, cat) => {
    acc[cat] = Object.entries(JD_TEMPLATES).filter(([, t]) => t.category === cat).map(([key, t]) => ({ key, t }));
    return acc;
  }, {});

  return (
    <div className="min-h-screen select-none">

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-brand-500/8 blur-3xl" />
          <div className="absolute -top-10 right-1/4 h-64 w-64 rounded-full bg-emerald-500/8 blur-3xl" />
          <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-cyan-500/6 blur-3xl" />
        </div>
        <div className="container-custom max-w-5xl relative z-10 py-10">
          <Link href="/student-hub"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Hub
          </Link>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start gap-6 sm:items-center justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Full ATS Suite</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                Beat the{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-brand-400 to-cyan-400 bg-clip-text text-transparent">
                  ATS Filter
                </span>
              </h1>
              <p className="text-sm text-muted-foreground font-semibold max-w-md leading-relaxed">
                Complete ATS analysis — match score, section health, keyword heatmap, verb strength, quantification audit, tailored summary, and AI bullet rewrites.
              </p>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0">
              {[
                { icon: "🎯", label: "7-Section Health Check" },
                { icon: "🔑", label: "Keyword Density Map"    },
                { icon: "💪", label: "Action Verb Audit"      },
                { icon: "📊", label: "Quantification Score"   },
                { icon: "✍️", label: "Tailored Summary"       },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-[10px] font-black text-muted-foreground whitespace-nowrap">
                  <span>{f.icon}</span> {f.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="container-custom max-w-5xl py-10">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ━━━ LEFT PANEL ━━━ */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2">
            <form onSubmit={handleAnalyze} className="space-y-5 sticky top-24">

              {/* RESUME */}
              <div className="bg-card border border-border/70 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                  <div className="h-6 w-6 rounded-lg bg-brand-500/15 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-brand-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground flex-1">Your Resume</span>
                  <div className="flex rounded-lg bg-muted/40 border border-border/40 p-0.5 text-[10px] font-black">
                    {(["paste", "upload"] as const).map(m => (
                      <button key={m} type="button"
                        onClick={() => { setResumeMode(m); if (m === "paste") { setUploadedFile(null); setFileParseMsg(""); setParsedFromFile(false); }}}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer
                          ${resumeMode === m ? "bg-brand-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        {m === "upload" ? "📎 Upload" : "📝 Paste"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <AnimatePresence mode="wait">
                    {resumeMode === "paste" && (
                      <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-end mb-1.5">
                          <span className={`text-[10px] font-bold ${resumeText.length > 50 ? "text-emerald-400" : "text-muted-foreground"}`}>{resumeText.length} chars</span>
                        </div>
                        <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                          placeholder="Paste your education, skills, work history, and projects here..."
                          rows={9} required={resumeMode === "paste"}
                          className="w-full rounded-xl border border-border/50 bg-background/60 p-3 text-xs font-semibold
                            focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10
                            resize-none leading-relaxed transition-all placeholder:text-muted-foreground/40" />
                      </motion.div>
                    )}
                    {resumeMode === "upload" && (
                      <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        <div
                          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-8 cursor-pointer text-center transition-all
                            ${isDragging ? "border-brand-500 bg-brand-500/10"
                              : uploadedFile ? "border-emerald-500/40 bg-emerald-500/5"
                              : "border-border/50 hover:border-brand-500/40 hover:bg-brand-500/5"}`}>
                          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                            onChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} />
                          {uploadedFile ? (
                            <div className="space-y-2">
                              <FileIcon ext={uploadedFile.name.split(".").pop() ?? ""} />
                              <p className="text-xs font-black text-foreground truncate max-w-[180px] mx-auto">{uploadedFile.name}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                              <button type="button" onClick={e => { e.stopPropagation(); setUploadedFile(null); setResumeText(""); setFileParseMsg(""); setParsedFromFile(false); }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 hover:bg-rose-500/20 cursor-pointer">
                                <X className="h-3 w-3" /> Remove
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <UploadCloud className="h-8 w-8 text-brand-400/50 mx-auto" />
                              <p className="text-xs font-black text-foreground">Drop your resume here</p>
                              <p className="text-[10px] text-muted-foreground">or click to browse</p>
                              <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">PDF · DOCX · TXT</p>
                            </div>
                          )}
                        </div>
                        <AnimatePresence>
                          {fileParseMsg && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className={`flex items-center gap-2 p-3 rounded-xl text-[11px] font-bold border
                                ${parsedFromFile ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                  : fileParseMsg.startsWith("⚠") ? "bg-rose-500/5 border-rose-500/20 text-rose-400"
                                  : "bg-brand-500/5 border-brand-500/20 text-brand-400"}`}>
                              {parsedFromFile ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                : fileParseMsg.startsWith("⚠") ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                : <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />}
                              {fileParseMsg}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {parsedFromFile && resumeText && (
                          <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Extracted Preview</p>
                            <p className="text-[10px] text-muted-foreground font-semibold line-clamp-4 leading-relaxed">{resumeText.slice(0, 300)}...</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* JD */}
              <div className="bg-card border border-border/70 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                  <div className="h-6 w-6 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground flex-1">Job Description</span>
                  <div className="flex rounded-lg bg-muted/40 border border-border/40 p-0.5 text-[10px] font-black">
                    {(["template", "paste"] as const).map(m => (
                      <button key={m} type="button" onClick={() => setJdMode(m)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer
                          ${jdMode === m ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        {m === "template" ? "📋 Templates" : "📝 Paste"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-3">
                  <AnimatePresence>
                    {jdMode === "template" && (
                      <motion.div key="tmpl" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <div ref={jdDropRef} className="relative mb-3">
                          <button type="button" onClick={() => setJdDropOpen(p => !p)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/60 bg-background/60 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer">
                            {jdTemplateKey ? (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-base">{JD_TEMPLATES[jdTemplateKey].icon}</span>
                                <div className="text-left min-w-0">
                                  <p className="text-xs font-black text-foreground truncate">{JD_TEMPLATES[jdTemplateKey].label}</p>
                                  <p className="text-[9px] text-muted-foreground">{JD_TEMPLATES[jdTemplateKey].category}</p>
                                </div>
                              </div>
                            ) : <span className="text-xs font-semibold text-muted-foreground">Select a Job Role Template...</span>}
                            <motion.div animate={{ rotate: jdDropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {jdDropOpen && (
                              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                                className="absolute z-50 top-full mt-1.5 w-full bg-popover border border-border/80 rounded-2xl shadow-xl overflow-hidden">
                                <div className="max-h-[300px] overflow-y-auto">
                                  {CATEGORY_ORDER.map(cat => (
                                    <div key={cat}>
                                      <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 sticky top-0">{cat}</div>
                                      {grouped[cat]?.map(({ key, t }) => (
                                        <button key={key} type="button" onClick={() => selectJdTemplate(key)}
                                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors cursor-pointer ${jdTemplateKey === key ? "bg-purple-500/10" : ""}`}>
                                          <span className="text-base shrink-0">{t.icon}</span>
                                          <p className="text-xs font-black text-foreground flex-1">{t.label}</p>
                                          {jdTemplateKey === key && <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                                        </button>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {jdTemplateKey && (
                          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Template loaded — edit below if needed
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-bold ${jobDescription.length > 50 ? "text-emerald-400" : "text-muted-foreground"}`}>{jobDescription.length} chars</span>
                  </div>
                  <textarea value={jobDescription} onChange={e => { setJobDescription(e.target.value); if (jdMode === "template") setJdTemplateKey(""); }}
                    placeholder={jdMode === "template" ? "Select a template above, or type your JD here..." : "Paste the full job post requirements, skills, and qualifications..."}
                    rows={9} required
                    className="w-full rounded-xl border border-border/50 bg-background/60 p-3 text-xs font-semibold
                      focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10
                      resize-none leading-relaxed transition-all placeholder:text-muted-foreground/40" />
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-2 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-xs text-rose-500 font-bold">
                    <div className="flex gap-2 items-start"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>
                    {error.includes("limit") && (
                      <Link href="/student-hub/upgrade"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[9px] uppercase tracking-wider font-black self-start">
                        <Zap className="h-3 w-3 fill-current animate-pulse" /> Upgrade to Pro
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.button type="submit" disabled={loading || (resumeMode === "upload" && !parsedFromFile && !resumeText)}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="relative w-full h-14 rounded-2xl font-black text-sm text-white overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/15">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-brand-600 to-emerald-700" />
                {!loading && <div className="absolute inset-0 opacity-25" style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.5) 50%,transparent 60%)", backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite" }} />}
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</> : <><ShieldCheck className="h-4 w-4" /> Run Full ATS Analysis</>}
                </span>
              </motion.button>

              {result && !loading && (
                <button type="button" onClick={() => { setResult(null); setResumeText(""); setJobDescription(""); setUploadedFile(null); setFileParseMsg(""); setParsedFromFile(false); setJdTemplateKey(""); }}
                  className="w-full h-10 rounded-xl border border-border/60 text-[10px] font-black text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer">
                  ↺ Analyze Another Resume
                </button>
              )}
            </form>
          </motion.div>

          {/* ━━━ RIGHT PANEL ━━━ */}
          <div ref={resultsRef} className="lg:col-span-3 space-y-5">
            <AnimatePresence mode="wait">

              {/* LOADING */}
              {loading && (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[500px] space-y-8">
                  <div className="relative h-28 w-28">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-spin" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-2.5 rounded-full border-2 border-brand-500/25 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
                    <div className="absolute inset-5 rounded-full border-2 border-cyan-500/35 animate-spin" style={{ animationDuration: "1.5s" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {React.createElement(STEPS[stepIdx].icon, { className: "h-9 w-9 text-emerald-400" })}
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="font-black text-foreground text-base">Running Full ATS Analysis</h4>
                    <AnimatePresence mode="wait">
                      <motion.p key={stepIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}
                        className="text-xs text-muted-foreground font-semibold">{STEPS[stepIdx].label}</motion.p>
                    </AnimatePresence>
                    <div className="flex gap-1.5 justify-center mt-3">
                      {STEPS.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === stepIdx ? "w-6 bg-emerald-500" : "w-1.5 bg-border"}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* EMPTY */}
              {!loading && !result && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-5 border-2 border-dashed border-border/50 rounded-3xl p-8">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                      <ShieldCheck className="h-10 w-10 text-emerald-400/40" />
                    </div>
                    <motion.div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <span className="text-[8px]">✨</span>
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-foreground text-base">Full ATS Suite Ready</h4>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mx-auto font-semibold">
                      Upload or paste your resume · select a JD template · hit <span className="text-emerald-400 font-black">Run Full ATS Analysis</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                    {[
                      { icon: "🎯", t: "ATS Match Score"    },
                      { icon: "🏥", t: "Section Health"     },
                      { icon: "🔑", t: "Keyword Heatmap"    },
                      { icon: "💪", t: "Verb Strength"      },
                      { icon: "📊", t: "Quantification Audit"},
                      { icon: "✍️", t: "Tailored Summary"   },
                    ].map(f => (
                      <div key={f.t} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/40 text-[10px] font-bold text-muted-foreground">
                        <span>{f.icon}</span>{f.t}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RESULTS */}
              {!loading && result && theme && (
                <motion.div key="results" initial="hidden" animate="show"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                  className="space-y-5">

                  {/* ── 1. SCORE CARD ── */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    className="bg-card border border-border/70 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: theme.glow }} />
                    <div className="relative flex flex-col sm:flex-row items-center gap-8">
                      <div className="relative h-36 w-36 shrink-0">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r={radius} className="stroke-border" strokeWidth="10" fill="none" />
                          <motion.circle cx="72" cy="72" r={radius} stroke={theme.color} strokeWidth="10" fill="none"
                            strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: circ - (result.matchScore / 100) * circ }}
                            transition={{ duration: 1.2, ease: "easeOut" }} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-foreground">{result.matchScore}%</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${theme.cls}`}>{theme.label}</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full space-y-3">
                        <div>
                          <h3 className="text-base font-black text-foreground">ATS Compatibility Score</h3>
                          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Based on keyword compliance, experience alignment, and JD technical requirements.</p>
                        </div>
                        {[
                          { label: "Keyword Match",   pct: Math.min(100, result.matchScore + 5) },
                          { label: "Skill Alignment", pct: Math.max(10,  result.matchScore - 10) },
                          { label: "ATS Formatting",  pct: Math.min(100, result.matchScore + 15) },
                        ].map(bar => (
                          <div key={bar.label} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                              <span>{bar.label}</span><span>{bar.pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                              <motion.div className={`h-full rounded-full ${theme.bar}`}
                                initial={{ width: 0 }} animate={{ width: `${bar.pct}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* ── 2. SECTION HEALTH ── */}
                  {result.sectionScores && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                          <BarChart2 className="h-4 w-4 text-cyan-400" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Section Health Check</h4>
                        <span className="ml-auto text-[10px] text-muted-foreground font-bold">7 sections analyzed</span>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(result.sectionScores).map(([key, val]) => {
                          const meta = SECTION_META[key];
                          const col  = sectionColor(val.score);
                          const Icon = meta?.icon ?? BookOpen;
                          return (
                            <div key={key} className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-[11px] font-black text-foreground flex-1">{meta?.label ?? key}</span>
                                <span className={`text-[11px] font-black tabular-nums ${col.text}`}>{val.score}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                                <motion.div className={`h-full rounded-full ${col.bar}`}
                                  initial={{ width: 0 }} animate={{ width: `${val.score}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} />
                              </div>
                              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed pl-5">{val.feedback}</p>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ── 3. KEYWORD DENSITY HEATMAP ── */}
                  {result.keywordDensity && result.keywordDensity.length > 0 && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-brand-500/10 flex items-center justify-center">
                          <Key className="h-4 w-4 text-brand-400" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Keyword Density Heatmap</h4>
                        <div className="ml-auto flex gap-2 text-[9px] font-black">
                          <span className="text-emerald-400">● Good</span>
                          <span className="text-amber-400">● Low</span>
                          <span className="text-rose-400">● Missing</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {result.keywordDensity.map((kw, idx) => {
                          const col    = kwColor(kw.status);
                          const pct    = kw.inJd > 0 ? Math.min(100, Math.round((kw.inResume / kw.inJd) * 100)) : 0;
                          return (
                            <motion.div key={idx}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`flex items-center gap-3 p-3 rounded-xl border ${col.bg} ${col.border}`}>
                              <div className={`h-2 w-2 rounded-full shrink-0 ${col.dot}`} />
                              <span className={`text-[11px] font-black flex-1 ${col.text}`}>{kw.keyword}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-20 h-1.5 rounded-full bg-black/20 overflow-hidden">
                                  <motion.div className={`h-full rounded-full ${col.dot}`}
                                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.05 + 0.2 }} />
                                </div>
                                <span className={`text-[10px] font-black tabular-nums w-12 text-right ${col.text}`}>
                                  {kw.inResume}/{kw.inJd}×
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold pt-1">
                        Shows keyword occurrences in your resume vs. the JD. Aim for at least 50% density on every key term.
                      </p>
                    </motion.div>
                  )}

                  {/* ── 4. ACTION VERB SCORE ── */}
                  {result.actionVerbScore !== undefined && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Gauge className="h-4 w-4 text-purple-400" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Action Verb Strength</h4>
                        <span className={`ml-auto text-sm font-black ${verbColor(result.actionVerbScore).cls}`}>
                          {result.actionVerbScore}/100 · {verbColor(result.actionVerbScore).label}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-border/40 overflow-hidden">
                        <motion.div className={`h-full rounded-full ${verbColor(result.actionVerbScore).bar}`}
                          initial={{ width: 0 }} animate={{ width: `${result.actionVerbScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }} />
                      </div>
                      {result.weakVerbs && result.weakVerbs.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Weak Phrases to Replace</p>
                          {result.weakVerbs.map((v, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/40">
                              <span className="text-xs text-rose-400 font-bold line-through shrink-0">"{v.found}"</span>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs text-emerald-400 font-black">"{v.suggested}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── 5. QUANTIFICATION SCORE ── */}
                  {result.quantificationScore !== undefined && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <BarChart2 className="h-4 w-4 text-amber-400" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Quantification Audit</h4>
                        <span className={`ml-auto text-sm font-black ${quantColor(result.quantificationScore).cls}`}>
                          {result.quantificationScore}% · {quantColor(result.quantificationScore).label}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-border/40 overflow-hidden">
                        <motion.div className={`h-full rounded-full ${result.quantificationScore >= 60 ? "bg-emerald-500" : result.quantificationScore >= 35 ? "bg-amber-500" : "bg-rose-500"}`}
                          initial={{ width: 0 }} animate={{ width: `${result.quantificationScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                        Percentage of bullet points that include numbers, percentages, or measurable outcomes. <span className="font-black text-foreground">Target: 60%+</span>
                      </p>
                      {result.unquantifiedBullets && result.unquantifiedBullets.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Bullets Needing Metrics</p>
                          {result.unquantifiedBullets.map((b, i) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                              <p className="text-[10px] text-muted-foreground font-semibold italic">"{b}"</p>
                            </div>
                          ))}
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            💡 Add numbers: "Developed API" → "Developed API serving <span className="font-black text-foreground">1,200+ req/min</span> with <span className="font-black text-foreground">99.9% uptime</span>"
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── 6. TAILORED SUMMARY ── */}
                  {result.tailoredSummary && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-emerald-400" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">AI Tailored Summary</h4>
                        <button type="button" onClick={copySummary}
                          className="ml-auto h-7 w-7 rounded-lg border border-border/50 bg-background flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                          {summarycopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-sm font-semibold text-foreground leading-relaxed">"{result.tailoredSummary}"</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3 text-amber-400" />
                        Copy this and paste it at the top of your resume as your professional summary.
                      </p>
                    </motion.div>
                  )}

                  {/* ── 7. MISSING KEYWORDS ── */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-rose-500/10 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-rose-400" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Missing Keywords</h4>
                      {result.missingKeywords.length > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400">
                          {result.missingKeywords.length} gaps
                        </span>
                      )}
                    </div>
                    {result.missingKeywords.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.map((word, idx) => (
                            <motion.span key={idx} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-rose-500/8 text-rose-400 border border-rose-500/20 rounded-lg">
                              <XCircle className="h-3 w-3 shrink-0" /> {word}
                            </motion.span>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed border-t border-border/40 pt-3">
                          💡 <span className="font-black text-foreground">Pro tip:</span> Naturally weave these into your skills section and bullet points to improve ATS ranking.
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4" /> No major keyword gaps found — excellent coverage!
                      </div>
                    )}
                  </motion.div>

                  {/* ── 8. BULLET IMPROVEMENTS ── */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-brand-500/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-brand-400" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">AI Bullet Rewrites</h4>
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-black text-brand-400">
                        {result.bulletImprovements.length} improved
                      </span>
                    </div>
                    <div className="space-y-3">
                      {result.bulletImprovements.map((bullet, idx) => {
                        const isOpen = openBullet === idx;
                        return (
                          <div key={idx} className="border border-border/50 rounded-2xl overflow-hidden">
                            <button type="button" onClick={() => setOpenBullet(isOpen ? null : idx)}
                              className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-muted/20 transition-colors">
                              <div className="h-5 w-5 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-black text-brand-400">{idx + 1}</span>
                              </div>
                              <p className="text-xs font-semibold text-muted-foreground flex-1 truncate italic">"{bullet.original.slice(0, 80)}{bullet.original.length > 80 ? "..." : ""}"</p>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                  <div className="p-4 pt-0 space-y-3">
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original</p>
                                      <p className="text-xs text-muted-foreground font-semibold leading-relaxed italic">"{bullet.original}"</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/15 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-400">AI Optimized</p>
                                        <button type="button" onClick={() => copyBullet(bullet.improved, idx)}
                                          className="h-6 w-6 rounded-lg border border-border/50 bg-background flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                          {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                        </button>
                                      </div>
                                      <p className="text-xs text-foreground font-bold leading-relaxed">"{bullet.improved}"</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
                                      <ArrowRight className="h-3 w-3" /> Stronger verbs · quantified impact · keyword-rich
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* ── 9. RECRUITER FEEDBACK ── */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    className="bg-card border border-border/70 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Recruiter Feedback</h4>
                    </div>
                    <p className="text-xs leading-relaxed font-semibold text-muted-foreground whitespace-pre-line">{result.overallFeedback}</p>
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
