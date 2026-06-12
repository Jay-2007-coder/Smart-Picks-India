"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Play, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  Code, 
  Layers, 
  FileText,
  Mail,
  Globe
} from "lucide-react";

interface ProjectItem {
  name: string;
  desc: string;
  link: string;
  tech: string;
}

interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  desc: string;
}

interface EducationItem {
  institution: string;
  degree: string;
  years: string;
  grade: string;
}

export default function PortfolioGenerator() {
  const [name, setName] = useState("Aarav Sharma");
  const [role, setRole] = useState("Full Stack Developer, Software Engineer, Problem Solver");
  const [bio, setBio] = useState("Computer Science undergrad seeking impact opportunities. Passionate about building fast, scalable web applications, interactive interfaces, and distributed backends.");
  const [email, setEmail] = useState("aarav@email.com");
  const [github, setGithub] = useState("https://github.com");
  const [linkedin, setLinkedin] = useState("https://linkedin.com");
  const [twitter, setTwitter] = useState("https://twitter.com");
  const [customLink, setCustomLink] = useState("");
  
  const [skills, setSkills] = useState("React, Node.js, TypeScript, Next.js, PostgreSQL, Tailwind CSS, Python, Three.js");
  const [accentColor, setAccentColor] = useState<"slate" | "indigo" | "emerald" | "crimson">("indigo");

  const [experience, setExperience] = useState<ExperienceItem[]>([
    {
      company: "Tech Solutions Inc.",
      role: "Software Engineering Intern",
      duration: "June 2025 - August 2025",
      desc: "Developed responsive React modules and optimized search database index queries, reducing load times by 15%. Collaborated with team using Git/Agile.",
    }
  ]);

  const [education, setEducation] = useState<EducationItem[]>([
    {
      institution: "Smart Institute of Technology",
      degree: "B.Tech in Computer Science",
      years: "2022 - 2026",
      grade: "9.2 CGPA",
    }
  ]);
  
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      name: "Smart Picks Deals Platform",
      desc: "An affiliate deals platform built with Next.js, Express, and MongoDB. Integrates Web scraping pipelines, price trackers, and interactive data visualization panels.",
      link: "https://github.com",
      tech: "Next.js, MongoDB, Express, Puppeteer",
    },
    {
      name: "Distributed Socket Chat",
      desc: "A concurrent chat protocol application in Java using multi-threaded client-server sockets and custom security handshakes.",
      link: "https://github.com",
      tech: "Java, Sockets, Cryptography",
    },
  ]);

  const [generatedHtml, setGeneratedHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const [rightTab, setRightTab] = useState<"preview" | "code">("preview");

  const addProject = () => {
    setProjects([...projects, { name: "", desc: "", link: "", tech: "" }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addExperience = () => {
    setExperience([...experience, { company: "", role: "", duration: "", desc: "" }]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const addEducation = () => {
    setEducation([...education, { institution: "", degree: "", years: "", grade: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  // Build the generation string
  const generatePortfolioCode = () => {
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    const rolesArray = role.split(",").map((r) => r.trim()).filter(Boolean);
    
    // Theme details
    const colorMap = {
      slate: { primary: "#64748b", gradient: "linear-gradient(135deg, #475569 0%, #64748b 100%)", badge: "rgba(100, 116, 139, 0.15)", glow: "rgba(100, 116, 139, 0.4)" },
      indigo: { primary: "#6366f1", gradient: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", badge: "rgba(99, 102, 241, 0.15)", glow: "rgba(99, 102, 241, 0.4)" },
      emerald: { primary: "#10b981", gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)", badge: "rgba(16, 185, 129, 0.15)", glow: "rgba(16, 185, 129, 0.4)" },
      crimson: { primary: "#f43f5e", gradient: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)", badge: "rgba(244, 63, 94, 0.15)", glow: "rgba(244, 63, 94, 0.4)" },
    };
    const activeColor = colorMap[accentColor];

    const skillsHtml = skillsArray
      .map((s) => `<span class="skill-badge">${s}</span>`)
      .join("");

    const projectsHtml = projects
      .map((p) => {
        const techBadges = p.tech
          ? p.tech.split(",").map(t => `<span class="tech-badge">${t.trim()}</span>`).join("")
          : "";
        return `
      <div class="glass-card project-card scroll-reveal">
        <div class="project-header">
          <h3>${p.name || "Untitled Project"}</h3>
          <div class="project-tech">${techBadges}</div>
        </div>
        <p>${p.desc || "No description provided."}</p>
        ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">View Project &rarr;</a>` : ""}
      </div>`;
      })
      .join("");

    const experienceHtml = experience
      .map((exp) => `
      <div class="timeline-item scroll-reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-content glass-card">
          <span class="timeline-duration">${exp.duration || "Duration"}</span>
          <h4>${exp.role || "Role"}</h4>
          <h5>${exp.company || "Company"}</h5>
          <p>${exp.desc || "No description provided."}</p>
        </div>
      </div>`)
      .join("");

    const educationHtml = education
      .map((edu) => `
      <div class="glass-card education-card scroll-reveal">
        <span class="education-years">${edu.years || "Years"}</span>
        <h4>${edu.degree || "Degree"}</h4>
        <h5>${edu.institution || "Institution"}</h5>
        ${edu.grade ? `<p class="education-grade">Result: <strong>${edu.grade}</strong></p>` : ""}
      </div>`)
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | Dynamic Portfolio</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg: #030712;
      --card-bg: rgba(17, 24, 39, 0.45);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --brand: ${activeColor.primary};
      --brand-gradient: ${activeColor.gradient};
      --brand-badge: ${activeColor.badge};
      --brand-glow: ${activeColor.glow};
      --border: rgba(255, 255, 255, 0.08);
      --font-display: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.6;
      overflow-x: hidden;
      position: relative;
    }

    /* Background 3D Particles Container */
    #canvas-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -10;
      pointer-events: none;
    }

    /* Ambient Glow Blobs */
    .blob {
      position: fixed;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      filter: blur(120px);
      z-index: -8;
      opacity: 0.15;
      pointer-events: none;
    }
    .blob-1 {
      top: -100px;
      right: -100px;
      background: var(--brand);
    }
    .blob-2 {
      bottom: -150px;
      left: -150px;
      background: var(--brand);
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Navigation */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(3, 7, 18, 0.6);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.25rem;
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.03em;
    }
    .logo span {
      background: var(--brand-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: color 0.3s;
    }
    .nav-links a:hover {
      color: var(--text);
    }

    /* Hero Section */
    #hero {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 4rem 0;
      border-bottom: 1px solid var(--border);
    }
    .hero-greeting {
      font-size: 1rem;
      font-weight: 700;
      color: var(--brand);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 1rem;
    }
    h1 {
      font-family: var(--font-display);
      font-size: 4rem;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }
    .role-headline {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .typewriter-cursor {
      display: inline-block;
      width: 3px;
      height: 1.6rem;
      background-color: var(--brand);
      animation: blink 0.75s step-end infinite;
    }
    .hero-bio {
      color: var(--text-muted);
      max-width: 600px;
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 2.5rem;
    }
    .hero-buttons {
      display: flex;
      gap: 1rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.3s;
      cursor: pointer;
    }
    .btn-primary {
      background: var(--brand-gradient);
      color: #fff;
      box-shadow: 0 4px 20px var(--brand-glow);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px var(--brand-glow);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
    }

    /* Global Card styling (Glassmorphism) */
    .glass-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 2rem;
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .glass-card:hover {
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-3px);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }

    /* Section Styling */
    section {
      padding: 6rem 0;
      border-bottom: 1px solid var(--border);
    }
    .section-header {
      margin-bottom: 3.5rem;
    }
    .section-header h2 {
      font-family: var(--font-display);
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .section-header h2 span {
      color: var(--brand);
    }

    /* About Section */
    .about-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
    @media (min-width: 768px) {
      .about-grid {
        grid-template-columns: 2fr 1.2fr;
      }
    }
    .about-socials {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .social-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.3s;
    }
    .social-btn:hover {
      background: var(--brand-badge);
      border-color: var(--brand);
      color: var(--text);
      transform: translateX(3px);
    }

    /* Skills Grid */
    .skills-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .skill-badge {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      padding: 0.6rem 1.25rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      transition: all 0.3s;
    }
    .skill-badge:hover {
      background: var(--brand-badge);
      border-color: var(--brand);
      transform: scale(1.05);
    }

    /* Timeline Experience */
    .timeline {
      position: relative;
      padding-left: 2rem;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 0.5rem;
      bottom: 0.5rem;
      width: 2px;
      background: var(--border);
    }
    .timeline-item {
      position: relative;
      margin-bottom: 2.5rem;
    }
    .timeline-item:last-child {
      margin-bottom: 0;
    }
    .timeline-dot {
      position: absolute;
      left: -2rem;
      top: 0.6rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--brand);
      border: 4px solid var(--bg);
      transition: transform 0.3s;
    }
    .timeline-item:hover .timeline-dot {
      transform: scale(1.3);
    }
    .timeline-content {
      padding: 1.5rem;
    }
    .timeline-duration {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--brand);
      background: var(--brand-badge);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      display: inline-block;
      margin-bottom: 0.75rem;
    }
    .timeline-content h4 {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .timeline-content h5 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .timeline-content p {
      color: var(--text-muted);
      font-size: 0.85rem;
      line-height: 1.6;
    }

    /* Education Cards */
    .education-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 640px) {
      .education-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .education-card {
      padding: 1.5rem;
    }
    .education-years {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--brand);
      background: var(--brand-badge);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      display: inline-block;
      margin-bottom: 0.75rem;
    }
    .education-card h4 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .education-card h5 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .education-grade {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 768px) {
      .projects-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .project-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 250px;
    }
    .project-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .project-tech {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }
    .tech-badge {
      font-size: 0.7rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      color: var(--text-muted);
    }
    .project-card p {
      color: var(--text-muted);
      font-size: 0.85rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex-grow: 1;
    }
    .project-link {
      color: var(--brand);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      transition: transform 0.3s;
    }
    .project-link:hover {
      transform: translateX(3px);
    }

    /* Contact Section */
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
    @media (min-width: 768px) {
      .contact-grid {
        grid-template-columns: 1.2fr 2fr;
      }
    }
    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .contact-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--brand-badge);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
    }
    .contact-item h5 {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .contact-item p {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .contact-form-card {
      padding: 2rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .form-control {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text);
      font-family: var(--font-body);
      font-size: 0.85rem;
      transition: border-color 0.3s, background 0.3s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--brand);
      background: rgba(255, 255, 255, 0.04);
    }
    .contact-success {
      display: none;
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid #10b981;
      border-radius: 0.75rem;
      color: #10b981;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 4rem 0;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    /* Scroll reveal transitions */
    .scroll-reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    .scroll-reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Animations */
    @keyframes blink {
      from, to { border-color: transparent }
      50% { border-color: var(--brand) }
    }
  </style>
</head>
<body>

  <!-- Particle background container -->
  <div id="canvas-container"></div>
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>

  <!-- Navigation -->
  <nav>
    <div class="nav-container">
      <a href="#" class="logo"><span>${name.split(" ")[0] || "Port"}</span>.folio</a>
      <div class="nav-links">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        ${experience.length > 0 ? `<a href="#experience">Experience</a>` : ""}
        ${education.length > 0 ? `<a href="#education">Education</a>` : ""}
        ${projects.length > 0 ? `<a href="#projects">Projects</a>` : ""}
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>

  <div class="container">
    <!-- Hero Section -->
    <header id="hero">
      <span class="hero-greeting">Hi, my name is</span>
      <h1>${name}</h1>
      <div class="role-headline">
        <span id="typewriter"></span><span class="typewriter-cursor">|</span>
      </div>
      <p class="hero-bio">${bio}</p>
      <div class="hero-buttons">
        <a href="#projects" class="btn btn-primary">View My Work</a>
        <a href="#contact" class="btn btn-secondary">Get In Touch</a>
      </div>
    </header>

    <!-- About Section -->
    <section id="about">
      <div class="section-header">
        <h2>About <span>Me</span></h2>
      </div>
      <div class="about-grid">
        <div class="glass-card">
          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.8; margin-bottom: 1.5rem;">
            ${bio}
          </p>
          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.8;">
            I specialize in crafting high-performance, robust software architectures. Over the course of my academic and practical training, I have designed multiple scalable modules and full-stack solutions.
          </p>
        </div>
        
        <div class="about-socials">
          <h4 style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 0.5rem;">Links</h4>
          ${email ? `<a href="mailto:${email}" class="social-btn"><span style="display:inline-block; width:16px;">📧</span> Email Me</a>` : ""}
          ${github ? `<a href="${github}" target="_blank" class="social-btn"><span style="display:inline-block; width:16px;">💻</span> GitHub Profile</a>` : ""}
          ${linkedin ? `<a href="${linkedin}" target="_blank" class="social-btn"><span style="display:inline-block; width:16px;">🔗</span> LinkedIn Profile</a>` : ""}
          ${twitter ? `<a href="${twitter}" target="_blank" class="social-btn"><span style="display:inline-block; width:16px;">🐦</span> Twitter / X</a>` : ""}
          ${customLink ? `<a href="${customLink}" target="_blank" class="social-btn"><span style="display:inline-block; width:16px;">🌐</span> Website</a>` : ""}
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section id="skills">
      <div class="section-header">
        <h2>Technical <span>Skills</span></h2>
      </div>
      <div class="glass-card">
        <div class="skills-flex">
          ${skillsHtml}
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    ${experience.length > 0 ? `
    <section id="experience">
      <div class="section-header">
        <h2>Work <span>Experience</span></h2>
      </div>
      <div class="timeline">
        ${experienceHtml}
      </div>
    </section>` : ""}

    <!-- Education Section -->
    ${education.length > 0 ? `
    <section id="education">
      <div class="section-header">
        <h2>My <span>Education</span></h2>
      </div>
      <div class="education-grid">
        ${educationHtml}
      </div>
    </section>` : ""}

    <!-- Projects Section -->
    ${projects.length > 0 ? `
    <section id="projects">
      <div class="section-header">
        <h2>Featured <span>Projects</span></h2>
      </div>
      <div class="projects-grid">
        ${projectsHtml}
      </div>
    </section>` : ""}

    <!-- Contact Section -->
    <section id="contact">
      <div class="section-header">
        <h2>Contact <span>Me</span></h2>
      </div>
      <div class="contact-grid">
        <div class="contact-details">
          <h4 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Let's collaborate!</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem;">
            Whether you want to build a scaling web app, discuss internship openings, or just say hello, drop a message below.
          </p>
          
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <div>
              <h5>Location</h5>
              <p>India</p>
            </div>
          </div>
          
          ${email ? `
          <div class="contact-item">
            <div class="contact-icon">✉️</div>
            <div>
              <h5>Email Address</h5>
              <p>${email}</p>
            </div>
          </div>` : ""}
        </div>

        <div class="glass-card contact-form-card">
          <div class="contact-success" id="contact-success">
            Thank you! Your message has been sent successfully. (Simulated)
          </div>
          <form id="contact-form">
            <div class="form-group">
              <label for="frm-name">Your Name</label>
              <input type="text" id="frm-name" class="form-control" placeholder="Aarav Sharma" required>
            </div>
            <div class="form-group">
              <label for="frm-email">Email Address</label>
              <input type="email" id="frm-email" class="form-control" placeholder="aarav@email.com" required>
            </div>
            <div class="form-group">
              <label for="frm-msg">Message</label>
              <textarea id="frm-msg" class="form-control" rows="4" placeholder="Hi, let's connect..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="border: none; width: 100%; justify-content: center; margin-top: 0.5rem;">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
    </footer>
  </div>

  <!-- Three.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  
  <script>
    // Theme details
    const themeColor = '${activeColor.primary}';

    // Particle Background
    const canvasContainer = document.getElementById('canvas-container');
    let scene, camera, renderer, particlesMesh;

    function initThree() {
      try {
        if (typeof THREE === 'undefined') throw new Error('Three.js CDN failed to load.');

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 8;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.025,
          color: themeColor,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending
        });

        particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        camera.position.z = 3;

        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
          mouseX = (e.clientX / window.innerWidth) - 0.5;
          mouseY = (e.clientY / window.innerHeight) - 0.5;
        });

        function animate() {
          requestAnimationFrame(animate);
          particlesMesh.rotation.y += 0.0006;
          particlesMesh.rotation.x += 0.0003;

          particlesMesh.position.x += (mouseX * 0.4 - particlesMesh.position.x) * 0.05;
          particlesMesh.position.y += (-mouseY * 0.4 - particlesMesh.position.y) * 0.05;

          renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      } catch (err) {
        console.warn(err.message, "Running 2D Canvas fallback.");
        initCanvasFallback();
      }
    }

    function initCanvasFallback() {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '-1';
      canvasContainer.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const particles = [];
      for (let i = 0; i < 70; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 1
        });
      }

      let mouse = { x: null, y: null };
      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });

      function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = themeColor;
        ctx.globalAlpha = 0.4;

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          if (mouse.x && mouse.y) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.strokeStyle = themeColor;
              ctx.globalAlpha = 1 - (dist / 120);
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        });
        requestAnimationFrame(draw);
      }
      draw();

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });
    }

    // Typewriter effect
    const roles = ${JSON.stringify(rolesArray)};
    let currentRoleIdx = 0;
    let currentCharIdx = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 40;
    const delayBetweenRoles = 2000;
    const typewriterEl = document.getElementById('typewriter');

    function type() {
      if (!typewriterEl) return;
      const currentRole = roles[currentRoleIdx];
      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, currentCharIdx - 1);
        currentCharIdx--;
      } else {
        typewriterEl.textContent = currentRole.substring(0, currentCharIdx + 1);
        currentCharIdx++;
      }

      let timeoutSpeed = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && currentCharIdx === currentRole.length) {
        timeoutSpeed = delayBetweenRoles;
        isDeleting = true;
      } else if (isDeleting && currentCharIdx === 0) {
        isDeleting = false;
        currentRoleIdx = (currentRoleIdx + 1) % roles.length;
        timeoutSpeed = 500;
      }

      setTimeout(type, timeoutSpeed);
    }

    // Scroll reveal intersections
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    scrollRevealElements.forEach(el => observer.observe(el));

    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        contactSuccess.style.display = 'block';
        contactForm.reset();
        setTimeout(() => {
          contactSuccess.style.display = 'none';
        }, 5000);
      });
    }

    // Initialize scripts on load
    window.addEventListener('DOMContentLoaded', () => {
      initThree();
      if (roles.length > 0) {
        setTimeout(type, 600);
      }
    });
  </script>
</body>
</html>`;

    

    setGeneratedHtml(html.trim());
  };

  // Run initial compile on load or input change
  useEffect(() => {
    generatePortfolioCode();
  }, [name, role, bio, email, github, linkedin, twitter, customLink, skills, accentColor, projects, experience, education]);

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!generatedHtml) return;
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-6xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Header Title */}
        <div className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Interactive 3D Portfolio Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Construct a responsive single-file personal website with a 3D Three.js particle background and instant deployment.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Layers className="h-4 w-4" /> 3D site builder
          </span>
        </div>

        {/* Workspace layout grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls columns (Form inputs) */}
          <div className="lg:col-span-5 space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Color accent toggles */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Choose Accent Accent</h3>
              <div className="flex gap-2">
                {[
                  { name: "slate", color: "bg-slate-500" },
                  { name: "indigo", color: "bg-indigo-500" },
                  { name: "emerald", color: "bg-emerald-500" },
                  { name: "crimson", color: "bg-rose-500" }
                ].map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setAccentColor(c.name as any)}
                    className={`h-7 px-3 flex items-center gap-1 rounded-full text-[10px] font-black capitalize transition-all border ${
                      accentColor === c.name
                        ? "border-foreground text-foreground shadow"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-foreground text-sm border-b border-border/50 pb-2">Profile details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Role Headlines (Comma-separated for typewriter)</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Short Bio / Overview</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background p-2.5 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">GitHub URL</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Twitter / X URL</label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Custom Link (e.g. Blog/Website)</label>
                  <input
                    type="text"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    placeholder="https://myblog.com"
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Experience timeline config */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <h3 className="font-extrabold text-foreground text-sm">Work Experience</h3>
                <button onClick={addExperience} className="text-[10px] font-black text-brand-600 hover:text-brand-700">
                  + Add Experience
                </button>
              </div>
              {experience.map((exp, idx) => (
                <div key={idx} className="p-3 bg-muted/40 rounded-xl relative space-y-2 border border-border/30">
                  <button
                    onClick={() => removeExperience(idx)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(idx, "role", e.target.value)}
                        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Duration (e.g. Jan 2025 - Present)</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateExperience(idx, "duration", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Role Description</label>
                    <textarea
                      value={exp.desc}
                      onChange={(e) => updateExperience(idx, "desc", e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-input bg-background p-2 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education timeline config */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <h3 className="font-extrabold text-foreground text-sm">Education history</h3>
                <button onClick={addEducation} className="text-[10px] font-black text-brand-600 hover:text-brand-700">
                  + Add Education
                </button>
              </div>
              {education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-muted/40 rounded-xl relative space-y-2 border border-border/30">
                  <button
                    onClick={() => removeEducation(idx)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Degree / Major</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Years (e.g. 2022 - 2026)</label>
                      <input
                        type="text"
                        value={edu.years}
                        onChange={(e) => updateEducation(idx, "years", e.target.value)}
                        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">CGPA / Grade (Optional)</label>
                    <input
                      type="text"
                      value={edu.grade}
                      onChange={(e) => updateEducation(idx, "grade", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Projects list configuration */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <h3 className="font-extrabold text-foreground text-sm">Projects List</h3>
                <button onClick={addProject} className="text-[10px] font-black text-brand-600 hover:text-brand-700">
                  + Add Project
                </button>
              </div>
              {projects.map((proj, idx) => (
                <div key={idx} className="p-3 bg-muted/40 rounded-xl relative space-y-2 border border-border/30">
                  <button
                    onClick={() => removeProject(idx)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(idx, "name", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Tech Stack Used (Comma-separated)</label>
                    <input
                      type="text"
                      value={proj.tech}
                      onChange={(e) => updateProject(idx, "tech", e.target.value)}
                      placeholder="React, Tailwind, Node.js"
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Project Description</label>
                    <textarea
                      value={proj.desc}
                      onChange={(e) => updateProject(idx, "desc", e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-input bg-background p-2 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Project URL (e.g. GitHub/Live)</label>
                    <input
                      type="text"
                      value={proj.link}
                      onChange={(e) => updateProject(idx, "link", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right column: Tab view (Interactive Preview / Source Code) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header controls and Tab triggers */}
            <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2 bg-muted p-1 rounded-xl">
                <button
                  onClick={() => setRightTab("preview")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    rightTab === "preview"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Live Preview
                </button>
                <button
                  onClick={() => setRightTab("code")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    rightTab === "code"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code className="h-3.5 w-3.5" /> Source Code
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-muted-foreground hover:text-foreground bg-muted border border-border/80 px-3 py-1.5 rounded-lg"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Code
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-lg shadow cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download Site
                </button>
              </div>
            </div>

            {/* Preview frame display */}
            {rightTab === "preview" && (
              <div className="border border-border/80 rounded-3xl overflow-hidden bg-slate-950 shadow-md h-[78vh] relative flex flex-col">
                <div className="h-8 bg-slate-900 border-b border-border/80 flex items-center px-4 gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] font-mono text-muted-foreground/60 ml-4 select-none">portfolio-live-sandbox.html</span>
                </div>
                <iframe
                  title="Portfolio Preview"
                  srcDoc={generatedHtml}
                  className="w-full flex-grow border-none bg-slate-950"
                  sandbox="allow-scripts"
                />
              </div>
            )}

            {/* Code view text block */}
            {rightTab === "code" && (
              <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
                <pre className="text-xs text-foreground font-mono bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-y-auto h-[71vh] border border-slate-800 leading-relaxed custom-scrollbar">
                  {generatedHtml}
                </pre>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
