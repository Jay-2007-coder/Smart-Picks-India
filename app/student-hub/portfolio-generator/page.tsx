"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Download, Play, Plus, Trash2, Copy, Check } from "lucide-react";

interface ProjectItem {
  name: string;
  desc: string;
  link: string;
}

export default function PortfolioGenerator() {
  const [name, setName] = useState("Aarav Sharma");
  const [role, setRole] = useState("Full Stack Developer");
  const [bio, setBio] = useState("Computer Science undergrad seeking impact opportunities. Passionate about building fast, accessible web applications and distributed backends.");
  const [email, setEmail] = useState("aarav@email.com");
  const [github, setGithub] = useState("https://github.com");
  const [linkedin, setLinkedin] = useState("https://linkedin.com");
  
  const [skills, setSkills] = useState("React, Node.js, TypeScript, PostgreSQL, Python");
  
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      name: "Smart Picks Deals Platform",
      desc: "An affiliate deals platform using Next.js and Node.js backend. Serves dynamic scrapers and user metrics panels.",
      link: "#",
    },
    {
      name: "Distributed Socket Chat",
      desc: "A concurrent chat protocol application in Java using standard client-server socket structures.",
      link: "#",
    },
  ]);

  const [generatedHtml, setGeneratedHtml] = useState("");
  const [copied, setCopied] = useState(false);

  const addProject = () => {
    setProjects([...projects, { name: "", desc: "", link: "" }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const generatePortfolioCode = () => {
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    const projectsHtml = projects
      .map(
        (p) => `
      <div class="project-card">
        <h3>${p.name || "Untitled Project"}</h3>
        <p>${p.desc || "No description provided."}</p>
        ${p.link ? `<a href="${p.link}" target="_blank">View Project &rarr;</a>` : ""}
      </div>`
      )
      .join("");

    const skillsHtml = skillsArray
      .map((s) => `<span class="skill-badge">${s}</span>`)
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | Portfolio</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --brand: #e11d48;
      --border: rgba(255, 255, 255, 0.08);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2rem;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
    }
    .role {
      color: var(--brand);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }
    .bio {
      color: var(--text-muted);
      max-width: 500px;
      margin: 0 auto;
      font-size: 0.95rem;
    }
    .socials {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    .socials a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: color 0.2s;
    }
    .socials a:hover {
      color: var(--brand);
    }
    section {
      margin-bottom: 3rem;
    }
    h2 {
      font-size: 1.4rem;
      font-weight: 800;
      border-left: 4px solid var(--brand);
      padding-left: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .skill-badge {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .projects-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 640px) {
      .projects-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .project-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      padding: 1.5rem;
      border-radius: 1rem;
      display: flex;
      flex-col: column;
      justify-content: space-between;
      transition: transform 0.2s, border-color 0.2s;
    }
    .project-card:hover {
      transform: translateY(-2px);
      border-color: rgba(225, 29, 72, 0.3);
    }
    .project-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .project-card p {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .project-card a {
      color: var(--brand);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.85rem;
    }
    footer {
      text-align: center;
      margin-top: 5rem;
      border-top: 1px solid var(--border);
      padding-top: 2rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${name}</h1>
      <p class="role">${role}</p>
      <p class="bio">${bio}</p>
      <div class="socials">
        ${email ? `<a href="mailto:${email}">Email</a>` : ""}
        ${github ? `<a href="${github}" target="_blank">GitHub</a>` : ""}
        ${linkedin ? `<a href="${linkedin}" target="_blank">LinkedIn</a>` : ""}
      </div>
    </header>

    <section id="skills">
      <h2>Skills</h2>
      <div class="skills-grid">
        ${skillsHtml}
      </div>
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <div class="projects-grid">
        ${projectsHtml}
      </div>
    </section>

    <footer>
      <p>&copy; ${new Date().getFullYear()} ${name}. Generated via SmartPicks India.</p>
    </footer>
  </div>
</body>
</html>`;

    setGeneratedHtml(html.trim());
  };

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
      <div className="container-custom max-w-5xl">
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
            <h1 className="text-3xl font-extrabold tracking-tight">Portfolio Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Construct a responsive single-file personal website and download it instantly to deploy on free hosting.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> website builder
          </span>
        </div>

        {/* Workspace layout grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Controls columns */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-foreground text-sm border-b border-border/50 pb-2">Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Headline Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Short Bio Summary</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
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
                  <label className="text-[10px] font-black uppercase text-muted-foreground">GitHub Link</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">LinkedIn Link</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>
              </div>
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
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Short description</label>
                    <input
                      type="text"
                      value={proj.desc}
                      onChange={(e) => updateProject(idx, "desc", e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Project Url (Optional)</label>
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

            <button
              onClick={generatePortfolioCode}
              className="flex h-11 w-full items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer"
            >
              <Play className="h-4 w-4" /> Build HTML File
            </button>
          </div>

          {/* Code view columns */}
          <div className="lg:col-span-7 space-y-4">
            {!generatedHtml && (
              <div className="bg-card border border-border/80 border-dashed rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <CheckCircle className="h-10 w-10 text-brand-500/30" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Portfolio Ready to Compile</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Fill in your details and click Build HTML File to create the deployment code.
                  </p>
                </div>
              </div>
            )}

            {generatedHtml && (
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
                {/* Header operations */}
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <h3 className="font-extrabold text-foreground text-sm">Generated HTML Code</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[10px] font-black text-muted-foreground hover:text-foreground bg-muted border border-border/80 px-2.5 py-1 rounded-lg"
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
                      className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-brand-600 hover:bg-brand-700 px-3 py-1 rounded-lg"
                    >
                      <Download className="h-3.5 w-3.5" /> Download index.html
                    </button>
                  </div>
                </div>

                <pre className="text-xs text-foreground font-mono bg-slate-900 text-slate-100 p-4 rounded-xl overflow-y-auto max-h-[30rem] border border-slate-800 leading-relaxed">
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
