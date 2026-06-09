"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Code2,
  Server,
  Cpu,
  ArrowRight,
  GitCommit,
  Network,
  BookOpen,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Roadmap Data Definition
const ROADMAPS = {
  webdev: {
    title: "Web Development Roadmap",
    icon: Code2,
    color: "from-blue-500 to-indigo-600",
    textColor: "text-blue-500",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/5",
    stages: [
      {
        id: "beg",
        name: "Beginner Frontend",
        duration: "4-6 Weeks",
        topics: ["HTML5 semantic tags & SEO basics", "CSS3 Flexbox, Grid, & Responsive Web Design", "JavaScript ES6+ fundamentals, DOM manipulation, APIs"],
        tools: ["VS Code", "Git & GitHub", "Chrome DevTools"],
        interconnect: "Feeds inputs into DevOps (requires Git commit workflows) and AI/ML (gathers raw training data through forms).",
      },
      {
        id: "int",
        name: "Intermediate Fullstack",
        duration: "8-12 Weeks",
        topics: ["React.js or Next.js components & states", "Tailwind CSS & component styling systems", "Node.js REST API servers & SQL/NoSQL databases"],
        tools: ["npm/yarn", "Postman", "MongoDB / PostgreSQL"],
        interconnect: "Creates the API clients that connect to AI model endpoints (FastAPI/Flask) and packages apps into Docker containers.",
      },
      {
        id: "adv",
        name: "Advanced Architecture",
        duration: "12+ Weeks",
        topics: ["System Design & Web Performance optimization", "GraphQL, web socket push notifications, & Serverless", "Micro-frontends & custom server-side caching"],
        tools: ["Redis", "Vercel / AWS", "Sentry"],
        interconnect: "Works directly with DevOps to configure CDN caching (Cloudflare) and serverless function deployments.",
      },
    ],
  },
  aiml: {
    title: "AI & Machine Learning Roadmap",
    icon: Cpu,
    color: "from-teal-500 to-emerald-600",
    textColor: "text-teal-500",
    bgClass: "bg-teal-500/10 dark:bg-teal-500/5",
    stages: [
      {
        id: "beg",
        name: "Math & Programming Basics",
        duration: "6-8 Weeks",
        topics: ["Python variables, lists, dictionaries, & files", "Calculus, Linear Algebra, & Probability distributions", "SQL database queries & Excel aggregations"],
        tools: ["Jupyter Notebooks", "Anaconda", "Google Colab"],
        interconnect: "Uses C/C++ libraries under the hood (like NumPy/Pandas) for fast matrix algebra operations.",
      },
      {
        id: "int",
        name: "Machine Learning Core",
        duration: "10-14 Weeks",
        topics: ["Data Preprocessing & Exploratory Data Analysis (EDA)", "Supervised algorithms (Regression, Decision Trees, SVM)", "Unsupervised models (K-Means Clustering, PCA dimension reductions)"],
        tools: ["Scikit-Learn", "NumPy & Pandas", "Matplotlib / Seaborn"],
        interconnect: "Prepares mathematical weights and serialized model files (.pkl, .onnx) that Web Dev APIs will consume.",
      },
      {
        id: "adv",
        name: "Deep Learning & MLOps",
        duration: "16+ Weeks",
        topics: ["Artificial Neural Networks & Transformer models (LLMs)", "Model fine-tuning, retrieval-augmented generation (RAG)", "Model tracking, containerized deployments, & scaling"],
        tools: ["PyTorch / TensorFlow", "Hugging Face", "MLflow / Docker"],
        interconnect: "Overlaps with DevOps to configure GPU pipelines (NVIDIA CUDA) and Kubernetes cluster deployments.",
      },
    ],
  },
  devops: {
    title: "DevOps & Cloud Roadmap",
    icon: Server,
    color: "from-rose-500 to-orange-600",
    textColor: "text-rose-500",
    bgClass: "bg-rose-500/10 dark:bg-rose-500/5",
    stages: [
      {
        id: "beg",
        name: "Linux & Networking Fundamentals",
        duration: "4-6 Weeks",
        topics: ["Linux file systems, shell commands, & Bash scripting", "IP addresses, DNS lookup, HTTP/S protocols", "Git branches, merging, & repository operations"],
        tools: ["Ubuntu Bash", "Git", "SSH Keys"],
        interconnect: "Provides the underlying operating environment for both Web servers and AI model scripting.",
      },
      {
        id: "int",
        name: "CI/CD & Containerization",
        duration: "8-10 Weeks",
        topics: ["Docker container packaging & docker-compose configurations", "GitHub Actions workflows for automated code testing", "Nginx web servers as reverse proxies & load balancers"],
        tools: ["Docker", "GitHub Actions", "Nginx"],
        interconnect: "Automates the building and testing of Web apps and compiles deployment configurations for server hosts.",
      },
      {
        id: "adv",
        name: "Kubernetes & Infrastructure as Code (IaC)",
        duration: "12+ Weeks",
        topics: ["Kubernetes container orchestration & pods scheduling", "Terraform script blueprints for cloud infrastructure setup", "Application monitoring, logging, & security scanning"],
        tools: ["Kubernetes (K8s)", "Terraform", "Prometheus & Grafana"],
        interconnect: "Provisions cloud server farms that scale Web Dev API requests and run parallel AI inference engines.",
      },
    ],
  },
};

// Languages Data Definition
const LANGUAGES = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    purpose: "Best for AI/ML, Data Science, Scripting, and backend APIs.",
    relations: [
      { target: "sql", desc: "Python scripts write query commands to SQL servers to pull raw datasets." },
      { target: "js", desc: "Python backends (FastAPI/Flask) serve JSON payloads to JS frontends (React/Next)." },
      { target: "cpp", desc: "Python calls C/C++ binaries behind the scenes (NumPy/TensorFlow) to run matrix math at native speed." },
      { target: "r", desc: "Python competes with R in data analysis, but Python provides better generic scripting options." },
    ],
  },
  {
    id: "js",
    name: "JavaScript",
    icon: "🟨",
    purpose: "Best for Fullstack Web Dev, interactive UI, and mobile applications.",
    relations: [
      { target: "python", desc: "JS client code fetches prediction results from Python AI backend microservices." },
      { target: "sql", desc: "JS Node.js backends run database queries using ORMs (Prisma, Sequelize)." },
      { target: "java", desc: "JS handles user interfaces while Java handles robust enterprise core systems." },
    ],
  },
  {
    id: "cpp",
    name: "C/C++",
    icon: "⚙️",
    purpose: "Best for System Software, Gaming Engines, and high-performance computing.",
    relations: [
      { target: "python", desc: "Python wraps high-performance C++ engines (CUDA, NumPy) to run deep learning math." },
      { target: "java", desc: "Java's JVM (Java Virtual Machine) core engine is written in C++ for cross-platform execution." },
      { target: "sql", desc: "Popular database engines (like MySQL and PostgreSQL) are coded in C/C++ to optimize CPU speeds." },
    ],
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    purpose: "Best for Enterprise apps, Android cores, and big-data processing.",
    relations: [
      { target: "sql", desc: "Java applications connect to databases using JDBC drivers to run transactions." },
      { target: "js", desc: "Java spring servers serve REST APIs consumed by JavaScript single-page applications." },
      { target: "python", desc: "Java Hadoop/Spark big data systems bridge data analytics pipelines built in Python." },
    ],
  },
  {
    id: "sql",
    name: "SQL",
    icon: "🗄️",
    purpose: "Best for relational database management and transactional data operations.",
    relations: [
      { target: "python", desc: "Feeds filtered query tables to Python analytical libraries (Pandas)." },
      { target: "js", desc: "Responds to transactional fetches from Node.js database drivers." },
      { target: "r", desc: "Queries structured datasets for R statistical regression runs." },
    ],
  },
  {
    id: "r",
    name: "R Language",
    icon: "📊",
    purpose: "Best for statistical modeling, academic data analysis, and plotting.",
    relations: [
      { target: "python", desc: "Overlaps heavily in mathematical analysis; R has stronger statistical graphs." },
      { target: "sql", desc: "Queries tabular relational datasets for data analysis projects." },
    ],
  },
];

export default function LearningRoadmaps() {
  const [activeTab, setActiveTab] = useState<"roadmaps" | "languages" | "stacks">("roadmaps");
  const [selectedRoadmap, setSelectedRoadmap] = useState<keyof typeof ROADMAPS>("webdev");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");

  const currentRoadmap = ROADMAPS[selectedRoadmap];
  const activeLangInfo = LANGUAGES.find((l) => l.id === selectedLanguage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-5xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Dashboard Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Developer Timelines &amp; Language Connections</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore beginner-to-advanced technology roadmaps and see how languages interconnect.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1 select-none">
            <Compass className="h-4 w-4" /> roadmaps
          </span>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border mb-8 select-none">
          {[
            { id: "roadmaps", label: "Career Roadmaps", icon: BookOpen },
            { id: "languages", label: "Language Connections", icon: Network },
            { id: "stacks", label: "Fullstack Ecosystem", icon: Sparkles },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                  isActive
                    ? "border-brand-600 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <AnimatePresence mode="wait">
          {/* TAB 1: Career Roadmaps */}
          {activeTab === "roadmaps" && (
            <motion.div
              key="roadmaps"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Stack selectors */}
              <div className="flex flex-wrap gap-3 select-none">
                {Object.entries(ROADMAPS).map(([key, data]) => {
                  const isSel = selectedRoadmap === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRoadmap(key as any)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                        isSel
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-card border-border hover:bg-muted text-foreground"
                      }`}
                    >
                      <data.icon className="h-4 w-4" />
                      {data.title.split(" ")[0]} Stack
                    </button>
                  );
                })}
              </div>

              {/* Roadmap timeline details */}
              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-8 space-y-6">
                  {currentRoadmap.stages.map((stage, idx) => (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex items-start gap-4"
                    >
                      {/* Step badge */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${currentRoadmap.bgClass} ${currentRoadmap.textColor} font-black text-xs select-none`}>
                        0{idx + 1}
                      </div>

                      {/* Info details */}
                      <div className="space-y-3 flex-1">
                        <div className="flex justify-between items-baseline flex-wrap gap-2">
                          <h3 className="text-sm font-black text-foreground">{stage.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md select-none">
                            Duration: {stage.duration}
                          </span>
                        </div>

                        {/* Topics */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest select-none">Core Modules to learn</p>
                          <ul className="list-disc pl-4 text-xs text-muted-foreground font-semibold leading-relaxed space-y-1">
                            {stage.topics.map((t, tIdx) => (
                              <li key={tIdx}>{t}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Tools */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mr-1 select-none font-sans">Tech tools:</span>
                          {stage.tools.map((t) => (
                            <span key={t} className="text-[9px] font-black text-foreground bg-muted border border-border/80 px-2 py-0.5 rounded-lg select-none">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Interrelation clue */}
                        <div className="flex gap-2 p-3.5 rounded-2xl bg-brand-500/[0.03] border border-brand-500/10 text-[11px] text-brand-650 dark:text-brand-450 font-semibold leading-relaxed">
                          <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5 animate-pulse text-brand-500" />
                          <span>
                            <strong>Connection:</strong> {stage.interconnect}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Sidebar details */}
                <div className="md:col-span-4 bg-card border border-border/85 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 select-none">
                    <div className={`p-2 rounded-xl bg-gradient-to-tr ${currentRoadmap.color} text-white`}>
                      <currentRoadmap.icon className="h-4 w-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground">Stack Overview</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    This career roadmap guides you from core fundamental structures to advanced software architecture. Focus on building hands-on projects at each phase rather than just reading documentation.
                  </p>
                  <div className="border-t border-border/60 pt-4 space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground select-none">Project Milestones</h5>
                    <div className="space-y-2 text-xs font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-emerald-500" />
                        <span>Beginner Portfolio Website</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-amber-500" />
                        <span>Intermediate API Integration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-purple-500" />
                        <span>Advanced Scalable Service</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Language Connections Network Map */}
          {activeTab === "languages" && (
            <motion.div
              key="languages"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid md:grid-cols-12 gap-8 items-start"
            >
              {/* Language selection grid */}
              <div className="md:col-span-6 space-y-4 select-none">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-2">Select Language Node</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LANGUAGES.map((lang) => {
                    const isSel = selectedLanguage === lang.id;
                    return (
                      <motion.button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                          isSel
                            ? "border-brand-500 bg-brand-500/[0.04] dark:bg-brand-500/[0.02] shadow-sm shadow-brand-500/5"
                            : "border-border hover:border-brand-500/30 bg-card hover:bg-muted/30"
                        }`}
                      >
                        <span className="text-2xl">{lang.icon}</span>
                        <span className="text-xs font-black text-foreground">{lang.name}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Purpose box */}
                {activeLangInfo && (
                  <div className="bg-muted/30 border border-border/60 p-4.5 rounded-2xl shadow-inner space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Core Function</p>
                    <p className="text-xs font-bold text-foreground leading-relaxed">
                      {activeLangInfo.purpose}
                    </p>
                  </div>
                )}
              </div>

              {/* Connections mapping */}
              <div className="md:col-span-6 space-y-6">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-2 select-none">Interrelations &bull; {activeLangInfo?.name}</h3>
                
                {activeLangInfo && activeLangInfo.relations.length > 0 ? (
                  <div className="space-y-4">
                    {activeLangInfo.relations.map((rel, rIdx) => {
                      const targetLang = LANGUAGES.find((l) => l.id === rel.target);
                      return (
                        <motion.div
                          key={rel.target}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: rIdx * 0.08 }}
                          className="bg-card border border-border/80 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5"
                        >
                          {/* Connection connector node */}
                          <div className="flex flex-col items-center select-none pt-1">
                            <span className="text-sm bg-muted border border-border px-1.5 py-0.5 rounded-lg font-bold">
                              {activeLangInfo.icon}
                            </span>
                            <div className="h-6 w-0.5 bg-dashed border-l border-dashed border-border" />
                            <span className="text-sm bg-muted border border-border px-1.5 py-0.5 rounded-lg font-bold">
                              {targetLang?.icon}
                            </span>
                          </div>

                          <div className="space-y-1 flex-1">
                            <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                              {activeLangInfo.name} <ArrowRight className="h-3.5 w-3.5 text-brand-600" /> {targetLang?.name}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                              {rel.desc}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic select-none">No active connections logged for this language node.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Fullstack Ecosystem */}
          {activeTab === "stacks" && (
            <motion.div
              key="stacks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Venn diagram representation */}
              <div className="bg-card border border-border/80 rounded-3xl p-8 shadow-sm max-w-2xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 rounded-full select-none">
                  <Network className="h-8 w-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">How Web Dev, AI/ML, and DevOps Interconnect</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-md mx-auto font-semibold">
                    In a real production software product, these three fields do not run in isolation. They align linearly to form a scalable release pipeline.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-left pt-4 select-none">
                  <div className="p-4 rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] space-y-2">
                    <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">1. The Interface (Web Dev)</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                      Builds the interactive React or Next.js app. Forms gather files or input prompts, and calls REST APIs to get predictions.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-teal-500/10 bg-teal-500/[0.02] space-y-2">
                    <h4 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">2. The Intelligence (AI/ML)</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                      Processes calculations, trains models in Python, and hosts analytical model servers (FastAPI/Flask) to return results.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] space-y-2">
                    <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">3. The Infrastructure (DevOps)</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                      Wraps model engines and Web servers into Docker containers. Sets up AWS hosting, CI/CD code runs, and scales web services.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
