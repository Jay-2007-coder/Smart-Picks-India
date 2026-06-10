"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Plus, Trash2, Printer } from "lucide-react";

interface Education {
  institution: string;
  degree: string;
  duration: string;
  score: string;
}

interface Project {
  title: string;
  tech: string;
  description: string;
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export default function ResumeBuilder() {
  // Personal Details
  const [personal, setPersonal] = useState({
    name: "Aarav Sharma",
    title: "Software Engineering Student",
    email: "aarav.sharma@email.com",
    phone: "+91 98765 43210",
    github: "github.com/aaravsharma",
    linkedin: "linkedin.com/in/aaravsharma",
    summary: "Dedicated and detail-oriented Computer Science student with strong fundamentals in algorithms, data structures, and full-stack web development. Experienced in building responsive React applications and REST APIs.",
  });

  // Education list
  const [education, setEducation] = useState<Education[]>([
    {
      institution: "Indian Institute of Technology, Delhi",
      degree: "B.Tech in Computer Science and Engineering",
      duration: "2022 - 2026",
      score: "CGPA: 8.9 / 10.0",
    },
    {
      institution: "Delhi Public School, R.K. Puram",
      degree: "Class XII (CBSE)",
      duration: "2022",
      score: "Percentage: 96.4%",
    },
  ]);

  // Projects
  const [projects, setProjects] = useState<Project[]>([
    {
      title: "Smart Picks Deals Platform",
      tech: "Next.js, Node.js, Express, MongoDB, TailwindCSS",
      description: "Developed a deals aggregator website with user authentication, email alerts, and an interactive admin dashboard. Handled automated web scraping scripts to synchronize Amazon product prices and discounts.",
    },
    {
      title: "Distributed Chat System",
      tech: "Java, Socket Programming, Multithreading",
      description: "Designed a multi-client chatting server implementing socket sockets, secure TLS messaging, and thread-pool execution, achieving concurrent chat rooms handling up to 50 active nodes.",
    },
  ]);

  // Experiences
  const [experience, setExperience] = useState<Experience[]>([
    {
      company: "Tech Solutions India",
      role: "Software Developer Intern",
      duration: "May 2025 - July 2025",
      description: "Refactored client onboarding portal components, leading to a 30% reduction in screen loading latency. Assisted senior engineers in migrating microservices databases to MongoDB Atlas.",
    },
  ]);

  // Skills
  const [skills, setSkills] = useState({
    languages: "Java, C++, Python, JavaScript, SQL",
    frameworks: "React, Next.js, Node.js, Express, TailwindCSS",
    tools: "Git, GitHub, VS Code, Postman, Docker",
  });

  const handlePrint = () => {
    window.print();
  };

  // State managers
  const updatePersonal = (field: string, value: string) => {
    setPersonal({ ...personal, [field]: value });
  };

  const updateSkill = (field: string, value: string) => {
    setSkills({ ...skills, [field]: value });
  };

  const addEducation = () => {
    setEducation([...education, { institution: "", degree: "", duration: "", score: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addProject = () => {
    setProjects([...projects, { title: "", tech: "", description: "" }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addExperience = () => {
    setExperience([...experience, { company: "", role: "", duration: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12 print:bg-white print:py-0 print:min-h-0">
      {/* CSS overrides for print style */}
      <style jsx global>{`
        @media print {
          header, footer, nav, button, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .resume-preview-container {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      <div className="container-custom max-w-7xl no-print">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Title Header */}
        <div className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Print-Ready Resume Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in your academic profile and instantly export an ATS-friendly, single-page PDF.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print / Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="container-custom max-w-7xl grid lg:grid-cols-12 gap-8 print:block">
        {/* Input Panel (Form Editor) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {/* Personal Info */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-foreground text-sm border-b border-border/50 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={personal.name}
                  onChange={(e) => updatePersonal("name", e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Title / Role</label>
                <input
                  type="text"
                  value={personal.title}
                  onChange={(e) => updatePersonal("title", e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => updatePersonal("email", e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Phone Number</label>
                <input
                  type="text"
                  value={personal.phone}
                  onChange={(e) => updatePersonal("phone", e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">GitHub Profile</label>
                <input
                  type="text"
                  value={personal.github}
                  onChange={(e) => updatePersonal("github", e.target.value)}
                  placeholder="github.com/username"
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">LinkedIn Profile</label>
                <input
                  type="text"
                  value={personal.linkedin}
                  onChange={(e) => updatePersonal("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Professional Summary</label>
                <textarea
                  value={personal.summary}
                  onChange={(e) => updatePersonal("summary", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs font-semibold focus-visible:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <h3 className="font-extrabold text-foreground text-sm">Education</h3>
              <button onClick={addEducation} className="text-[10px] font-black text-brand-600 hover:text-brand-700">
                + Add New
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Duration</label>
                    <input
                      type="text"
                      value={edu.duration}
                      onChange={(e) => updateEducation(idx, "duration", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">GPA / Percentage</label>
                    <input
                      type="text"
                      value={edu.score}
                      onChange={(e) => updateEducation(idx, "score", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <h3 className="font-extrabold text-foreground text-sm">Projects</h3>
              <button onClick={addProject} className="text-[10px] font-black text-brand-600 hover:text-brand-700">
                + Add New
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
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Project Title</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(idx, "title", e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Tech Stack</label>
                  <input
                    type="text"
                    value={proj.tech}
                    onChange={(e) => updateProject(idx, "tech", e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Description Details</label>
                  <textarea
                    value={proj.description}
                    onChange={(e) => updateProject(idx, "description", e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs font-semibold focus-visible:outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Work Experience */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <h3 className="font-extrabold text-foreground text-sm">Experience</h3>
              <button onClick={addExperience} className="text-[10px] font-black text-brand-600 hover:text-brand-700">
                + Add New
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
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Company / Organization</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(idx, "company", e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Job Title / Role</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, "role", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateExperience(idx, "duration", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Job Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, "description", e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs font-semibold focus-visible:outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Technical Skills */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-foreground text-sm border-b border-border/50 pb-2">
              Technical Skills
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Languages</label>
                <input
                  type="text"
                  value={skills.languages}
                  onChange={(e) => updateSkill("languages", e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Frameworks / Libraries</label>
                <input
                  type="text"
                  value={skills.frameworks}
                  onChange={(e) => updateSkill("frameworks", e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Tools / Databases</label>
                <input
                  type="text"
                  value={skills.tools}
                  onChange={(e) => updateSkill("tools", e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Preview (A4 Sheet view) */}
        <div className="lg:col-span-7 print:w-full">
          <div className="bg-white text-slate-900 border border-slate-200 shadow-xl rounded-3xl p-8 max-w-[21cm] min-h-[29.7cm] mx-auto resume-preview-container flex flex-col justify-between font-sans print:rounded-none print:shadow-none print:border-none print:p-0">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-none">{personal.name}</h2>
                <p className="text-xs font-bold text-slate-600 mt-1.5 uppercase tracking-wider">{personal.title}</p>
                <div className="flex justify-center items-center gap-4 text-[10px] font-semibold text-slate-500 mt-3 flex-wrap">
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>{personal.phone}</span>}
                  {personal.github && <span>{personal.github}</span>}
                  {personal.linkedin && <span>{personal.linkedin}</span>}
                </div>
              </div>

              {/* Summary */}
              {personal.summary && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
                    Profile Summary
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-700 text-justify">{personal.summary}</p>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
                    Education
                  </h4>
                  <div className="space-y-2.5">
                    {education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div>
                          <p className="font-extrabold text-slate-900">{edu.institution || "Institution Name"}</p>
                          <p className="text-slate-600 font-medium italic mt-0.5">{edu.degree || "Degree Details"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-700">{edu.duration || "Duration"}</p>
                          <p className="font-bold text-slate-800 mt-0.5">{edu.score || "Grade"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
                    Work Experience
                  </h4>
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-start text-[11px]">
                          <div>
                            <span className="font-extrabold text-slate-900">{exp.company || "Company"}</span>
                            <span className="text-slate-500 font-bold mx-2">|</span>
                            <span className="text-slate-700 font-semibold italic">{exp.role || "Role"}</span>
                          </div>
                          <span className="font-bold text-slate-600">{exp.duration || "Duration"}</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-700 pl-2 border-l-2 border-slate-300">
                          {exp.description || "Description details..."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
                    Key Projects
                  </h4>
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="space-y-1 text-[11px]">
                        <div className="flex justify-between items-start">
                          <p className="font-extrabold text-slate-900">{proj.title || "Project Title"}</p>
                          <p className="text-[9px] font-bold text-slate-500 italic bg-slate-100 px-1.5 py-0.5 rounded">
                            {proj.tech || "Tech Stack"}
                          </p>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-700 pl-2 border-l-2 border-slate-300">
                          {proj.description || "Project details..."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
                  Technical Skills
                </h4>
                <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-700 pl-2">
                  {skills.languages && (
                    <p>
                      <strong className="text-slate-900 font-bold">Languages:</strong> {skills.languages}
                    </p>
                  )}
                  {skills.frameworks && (
                    <p>
                      <strong className="text-slate-900 font-bold">Frameworks &amp; Libraries:</strong> {skills.frameworks}
                    </p>
                  )}
                  {skills.tools && (
                    <p>
                      <strong className="text-slate-900 font-bold">Developer Tools:</strong> {skills.tools}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Footer */}
            <div className="text-center pt-8 border-t border-slate-200 mt-8 text-[9px] font-bold text-slate-400">
              Generated via SmartPicks Student Placement Hub
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
