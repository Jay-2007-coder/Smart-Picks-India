import React from 'react';

export interface LanguageNode {
  id: string;
  name: string;
  tagline: string;
  domain: 'web' | 'data' | 'systems' | 'enterprise';
  useCases: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bestResource: { title: string; url: string };
  usedInRoadmaps: { label: string; roadmap: string; phase: string }[];
  interrelationNote: string;
  logoSvg: string; // SVG path d attribute or raw SVG markup
}

export const LANGUAGES_DATA: LanguageNode[] = [
  {
    id: "python",
    name: "Python",
    tagline: "The Swiss Army knife of programming",
    domain: "data",
    useCases: [
      "AI & Machine Learning (PyTorch, Scikit-learn)",
      "Data Analysis & Visualization (Pandas, Seaborn)",
      "Backend API development (FastAPI, Django)"
    ],
    difficulty: "beginner",
    bestResource: { title: "Python for Everybody", url: "https://www.py4e.com/" },
    usedInRoadmaps: [
      { label: "AI/ML Phase 0-4", roadmap: "aiml", phase: "0" },
      { label: "DevOps Phase 3-4", roadmap: "devops", phase: "3" }
    ],
    interrelationNote: "Python interpreter is written in C. Python wraps high-performance C++ engines (like NumPy/TensorFlow) to run deep learning math at native speed.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-emerald-500"><path d="M14.25.18c-.9 0-1.75.11-2.47.28-1.57.37-2.16 1.12-2.16 2.62v2.25h4.78c.84 0 1.5.65 1.5 1.5v3.38h1.88c1.5 0 2.25-.6 2.62-2.16.48-1.97.48-3.47 0-5.44-.37-1.57-1.12-2.16-2.62-2.16H14.25zm-3.37 5.62c-.84 0-1.5.66-1.5 1.5v3.38H4.6c-1.5 0-2.25.6-2.62 2.16-.48 1.97-.48 3.47 0 5.44.37 1.57 1.12 2.16 2.62 2.16h3.56v-4.78c0-.84.66-1.5 1.5-1.5h4.78V9.18c0-1.5-.6-2.16-2.16-2.16H10.88v-1.2zm-2.25 1.5c.4 0 .75.35.75.75s-.35.75-.75.75-.75-.35-.75-.75.35-.75.75-.75zm6.75 9c.4 0 .75.35.75.75s-.35.75-.75.75-.75-.35-.75-.75.35-.75.75-.75z"/></svg>`
  },
  {
    id: "javascript",
    name: "JavaScript",
    tagline: "The heartbeat of the modern web",
    domain: "web",
    useCases: [
      "Dynamic browser UIs & DOM manipulation",
      "Full-stack Web server creation (Node.js, Express)",
      "Mobile Applications development (React Native)"
    ],
    difficulty: "beginner",
    bestResource: { title: "JavaScript.info", url: "https://javascript.info/" },
    usedInRoadmaps: [
      { label: "Web Dev Phase 0-5", roadmap: "webdev", phase: "0" },
      { label: "AI/ML Phase 2 API UI", roadmap: "aiml", phase: "2" }
    ],
    interrelationNote: "JavaScript inspired by Java syntax, but has a completely different dynamic runtime. TypeScript is a typed superset of JavaScript.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-yellow-500"><path d="M3 3h18v18H3V3zm14.53 14.2c-.37-.58-.75-1.1-1.4-1.48-.48-.28-.9-.45-1.5-.45-.48 0-.97.16-1.2.48-.2.27-.27.67-.27 1.25v2.06c0 .75-.48 1.12-1.2 1.12s-1.2-.37-1.2-1.12v-3.37c0-.75.48-1.13 1.2-1.13h1.8c1.5 0 2.25.75 2.62 2.16.3 1.1.3 2 0 3.09h-1.05zm-6.75-1.87v2.06c0 .75-.48 1.12-1.2 1.12s-1.2-.37-1.2-1.12v-1.68h-1.5c-.75 0-1.13-.38-1.13-1.13V15.2c0-.75.38-1.13 1.13-1.13h2.62c1.5 0 2.25.75 2.63 2.16.14.53.18 1.09.18 1.68v.17l-1.5-.75z"/></svg>`
  },
  {
    id: "typescript",
    name: "TypeScript",
    tagline: "JavaScript scaled for enterprise growth",
    domain: "web",
    useCases: [
      "Large-scale codebase maintenance",
      "Robust frontend components (React, Next.js)",
      "Typed Backend APIs (NestJS, Node.js)"
    ],
    difficulty: "intermediate",
    bestResource: { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
    usedInRoadmaps: [
      { label: "Web Dev Phase 2-5", roadmap: "webdev", phase: "2" }
    ],
    interrelationNote: "TypeScript compile-time safety provides a transition to understanding enterprise-typed structures like Java or C++.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-blue-500"><path d="M3 3h18v18H3V3zm12.38 12.38h-3v.75h3v1.5h-3v.75h3v1.5h-4.5v-6h4.5v1.5zm-5.25-1.5h-1.5v6H7.13v-6H5.63V13.9h4.5v-.02z"/></svg>`
  },
  {
    id: "java",
    name: "Java",
    tagline: "Build once, run anywhere enterprise standard",
    domain: "enterprise",
    useCases: [
      "Enterprise Backend Microservices (Spring Boot)",
      "Legacy Android App Cores",
      "Big Data Systems (Apache Spark, Hadoop)"
    ],
    difficulty: "intermediate",
    bestResource: { title: "Java Programming (MOOC)", url: "https://java-programming.mooc.fi/" },
    usedInRoadmaps: [
      { label: "Enterprise Stacks", roadmap: "webdev", phase: "5" }
    ],
    interrelationNote: "Java syntax is heavily inspired by C++. Java was designed to hide memory allocation (Garbage Collection), making it safer but higher overhead.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-amber-600"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.68 14.19c-.43.51-1.04.85-1.68.85s-1.25-.34-1.68-.85c-.39-.46-.57-1.08-.52-1.72.05-.64.32-1.23.77-1.64.44-.4 1.01-.63 1.63-.63h.2v.2c0 .64-.32 1.23-.77 1.64-.44.4-1.01.63-1.63.63h-.2v-.2c0-.64.32-1.23.77-1.64zm-.8-3.69v-.2c0-.64.32-1.23.77-1.64.44-.4 1.01-.63 1.63-.63h.2v.2c0 .64-.32 1.23-.77 1.64-.44.4-1.01.63-1.63.63h-.2zm.8-3.5c-.43.51-1.04.85-1.68.85s-1.25-.34-1.68-.85c-.39-.46-.57-1.08-.52-1.72.05-.64.32-1.23.77-1.64.44-.4 1.01-.63 1.63-.63h.2v.2c0 .64-.32 1.23-.77 1.64-.44.4-1.01.63-1.63.63h-.2v-.2c0-.64.32-1.23.77-1.64z"/></svg>`
  },
  {
    id: "c",
    name: "C",
    tagline: "The foundations of modern computing",
    domain: "systems",
    useCases: [
      "Operating System Kernels (Linux, Windows)",
      "Embedded Systems & IoT microcontrollers",
      "High-speed compilers & engine runtimes"
    ],
    difficulty: "advanced",
    bestResource: { title: "C Programming Language (Book)", url: "https://archive.org/details/TheCProgrammingLanguageSecondEdition" },
    usedInRoadmaps: [
      { label: "DevOps Systems", roadmap: "devops", phase: "0" },
      { label: "AI/ML Base Libs", roadmap: "aiml", phase: "1" }
    ],
    interrelationNote: "Almost all operating systems and major lang interpreters (Python, JS V8) are written in C. C++ directly extends C.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-slate-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.38 13.5c-.8.8-2 1-3 .8-.9-.2-1.8-.8-2.2-1.7-.5-.9-.5-2 0-2.9.4-.9 1.3-1.5 2.2-1.7 1-.2 2.2 0 3 .8.3.3.3.8 0 1.1s-.8.3-1.1 0c-.4-.4-1-.5-1.5-.4-.5.1-.9.4-1.1.9-.3.5-.3 1.1 0 1.6.2.5.6.8 1.1.9.5.1 1.1 0 1.5-.4.3-.3.8-.3 1.1 0s.3.8 0 1.1z"/></svg>`
  },
  {
    id: "cpp",
    name: "C++",
    tagline: "Uncompromising runtime power and control",
    domain: "systems",
    useCases: [
      "Game development engines (Unreal Engine)",
      "High-frequency financial trading systems",
      "Browser engine layout cores (Chrome, Safari)"
    ],
    difficulty: "advanced",
    bestResource: { title: "Learn C++", url: "https://www.learncpp.com/" },
    usedInRoadmaps: [
      { label: "AI/ML Compute core", roadmap: "aiml", phase: "1" }
    ],
    interrelationNote: "If you know Java or TypeScript, C++ is 40% easier to learn due to OOP familiarity, but requires managing manual memory allocation.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-sky-650"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 11.5h-1.5v1.5h-1.5v-1.5h-1.5v-1.5h1.5v-1.5h1.5v1.5h1.5v1.5zm3-1.5h-1.5v1.5H18v-1.5h-1.5v-1.5H18v-1.5h1.5v1.5h1.5v1.5zM9.53 14c-.37-.58-.75-1.1-1.4-1.48-.48-.28-.9-.45-1.5-.45-.48 0-.97.16-1.2.48-.2.27-.27.67-.27 1.25v2.06c0 .75-.48 1.12-1.2 1.12S3.76 16.63 3.76 15.88v-3.37c0-.75.48-1.13 1.2-1.13h1.8c1.5 0 2.25.75 2.62 2.16.3 1.1.3 2 0 3.09H8.33L9.53 14z"/></svg>`
  },
  {
    id: "sql",
    name: "SQL",
    tagline: "The universal language of structured data",
    domain: "data",
    useCases: [
      "Relational database transactions & schemas",
      "Business intelligence reporting operations",
      "Data analysis pipelines (aggregating sets)"
    ],
    difficulty: "beginner",
    bestResource: { title: "SQLBolt Interactive Lessons", url: "https://sqlbolt.com/" },
    usedInRoadmaps: [
      { label: "Web Dev Phase 3", roadmap: "webdev", phase: "3" },
      { label: "AI/ML Phase 0-1", roadmap: "aiml", phase: "0" }
    ],
    interrelationNote: "Relational database engines (Postgres, MySQL) are coded in C/C++ to optimize CPU speeds. Python queries SQL databases to load modeling sets.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-amber-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-1.79-8-4v-2.5c0 2.21 3.59 4 8 4s8-1.79 8-4V16c0 2.21-3.59 4-8 4zm0-5c-4.41 0-8-1.79-8-4V8.5c0 2.21 3.59 4 8 4s8-1.79 8-4V11c0 2.21-3.59 4-8 4zm0-5c-4.41 0-8-1.79-8-4s3.59-4 8-4 8 1.79 8 4-3.59 4-8 4z"/></svg>`
  },
  {
    id: "r",
    name: "R",
    tagline: "Statistical analysis and charting specialized tool",
    domain: "data",
    useCases: [
      "Academic research mathematical modeling",
      "Data visualization plotting (ggplot2)",
      "Bioinformatics data pipelines"
    ],
    difficulty: "intermediate",
    bestResource: { title: "R for Data Science (Book)", url: "https://r4ds.hadley.nz/" },
    usedInRoadmaps: [
      { label: "AI/ML Research Data", roadmap: "aiml", phase: "1" }
    ],
    interrelationNote: "R competes directly with Python for data science; R has stronger mathematical plotting engines, but Python is a more versatile general-purpose scripting language.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-blue-600"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.88 12.38h-1.5l-1.12-2.25h-.75v2.25H9v-6.75h2.62c1.25 0 2.06.63 2.06 1.88 0 .88-.38 1.5-.94 1.75l1.14 3.12zm-.38-4.88c0-.63-.38-.88-.94-.88H10.5v1.75h1.06c.56 0 .94-.25.94-.87z"/></svg>`
  },
  {
    id: "go",
    name: "Go",
    tagline: "Google's concurrent cloud language",
    domain: "systems",
    useCases: [
      "High-throughput cloud backend APIs",
      "DevOps tools (Docker & Kubernetes built in Go)",
      "Microservice networking infrastructure"
    ],
    difficulty: "intermediate",
    bestResource: { title: "A Tour of Go", url: "https://go.dev/tour/" },
    usedInRoadmaps: [
      { label: "DevOps Phase 2-5", roadmap: "devops", phase: "2" }
    ],
    interrelationNote: "Go was designed by Google engineers to replace C++ in backend services, keeping C-like speeds but introducing a simpler concurrency model (goroutines) and garbage collection.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-sky-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.25 12.38c-.37.58-.75 1.1-1.4 1.48-.48.28-.9.45-1.5.45-.48 0-.97-.16-1.2-.48-.2-.27-.27-.67-.27-1.25v-2.06c0-.75.48-1.12 1.2-1.12s1.2.37 1.2 1.12v1.68h1.5v-2.06c0-.75.48-1.12 1.2-1.12s1.2.37 1.2 1.12v2.06c-.05 1.22-.8 2-2.03 2z"/></svg>`
  },
  {
    id: "bash",
    name: "Bash",
    tagline: "The glue script of Linux systems administration",
    domain: "systems",
    useCases: [
      "Automating Server Maintenance Tasks",
      "Writing CI/CD Pipeline Steps (GitHub Actions)",
      "Local developer workflow scripts"
    ],
    difficulty: "intermediate",
    bestResource: { title: "Bash Guide for Beginners", url: "https://tldp.org/LDP/Bash-Beginners-Guide/html/" },
    usedInRoadmaps: [
      { label: "DevOps Phase 0-5", roadmap: "devops", phase: "0" },
      { label: "AI/ML MLOps scripts", roadmap: "aiml", phase: "3" }
    ],
    interrelationNote: "Bash shell scripting glues together tools (git, docker, compilers, test runners) written in all other compiled languages.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-neutral-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 13.5H9.75v-1.5H13.5v1.5zm-5.44-3.56l2.06-2.06-2.06-2.06 1.06-1.06 3.12 3.12-3.12 3.12-1.06-1.06z"/></svg>`
  },
  {
    id: "kotlin",
    name: "Kotlin",
    tagline: "Modern Android and backend enterprise choice",
    domain: "enterprise",
    useCases: [
      "Native Android Application development",
      "Enterprise JVM Backend services",
      "Multiplatform client developments"
    ],
    difficulty: "intermediate",
    bestResource: { title: "Kotlin Docs & Tutorials", url: "https://kotlinlang.org/docs/home.html" },
    usedInRoadmaps: [
      { label: "Mobile / Enterprise Development", roadmap: "webdev", phase: "5" }
    ],
    interrelationNote: "Kotlin was designed by JetBrains to compile to JVM bytecode, making it 100% interoperable with Java while correcting Java's verbosity and nullability issues.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-indigo-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5l-4.5-4.5v4.5H8.62V7.12H12l4.5 4.5V16.5z"/></svg>`
  },
  {
    id: "swift",
    name: "Swift",
    tagline: "Apple's choice for safe and rapid iOS systems coding",
    domain: "enterprise",
    useCases: [
      "Native iOS / macOS Applications development",
      "System level scripting for Apple ecosystem",
      "Swift Server APIs"
    ],
    difficulty: "intermediate",
    bestResource: { title: "Swift Tour guide", url: "https://docs.swift.org/swift-book/documentation/the-swift-language-guide/" },
    usedInRoadmaps: [
      { label: "App Development Stacks", roadmap: "webdev", phase: "2" }
    ],
    interrelationNote: "Swift was created by Apple to replace Objective-C, leveraging compile-time optimizations similar to Rust and C++, while presenting simple scripting syntax like Python.",
    logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-orange-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.38 13.5c-.8.8-2 1-3 .8-.9-.2-1.8-.8-2.2-1.7-.5-.9-.5-2 0-2.9.4-.9 1.3-1.5 2.2-1.7 1-.2 2.2 0 3 .8.3.3.3.8 0 1.1s-.8.3-1.1 0c-.4-.4-1-.5-1.5-.4-.5.1-.9.4-1.1.9-.3.5-.3 1.1 0 1.6.2.5.6.8 1.1.9.5.1 1.1 0 1.5-.4.3-.3.8-.3 1.1 0s.3.8 0 1.1z"/></svg>`
  }
];
