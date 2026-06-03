import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import DigitalProduct from "../models/DigitalProduct.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-picks-auth";

const digitalProducts = [
  // 3x Engineering Notes (OS, DBMS, CN) — free tier
  {
    title: "Operating Systems Lecture Notes",
    slug: "operating-systems-lecture-notes",
    description: "Comprehensive, semester-aligned lecture notes covering processes, scheduling, synchronization, deadlocks, and memory management.",
    category: "notes",
    type: "free",
    price: 0,
    imageUrl: "https://picsum.photos/seed/operating-systems-lecture-notes/300/400",
    filePath: "/uploads/os-notes.pdf",
    fileUrl: "https://example.com/files/os-notes.pdf",
    tags: ["operating systems", "notes", "semester exam", "cse"],
    status: "active",
    downloadCount: 145,
    averageRating: 4.8
  },
  {
    title: "Database Management Systems (DBMS) Notes",
    slug: "dbms-lecture-notes",
    description: "Easy to understand guide covering ER diagrams, normalization, SQL queries, transaction management, and concurrency control.",
    category: "notes",
    type: "free",
    price: 0,
    imageUrl: "https://picsum.photos/seed/dbms-lecture-notes/300/400",
    filePath: "/uploads/dbms-notes.pdf",
    fileUrl: "https://example.com/files/dbms-notes.pdf",
    tags: ["dbms", "database", "sql", "cse"],
    status: "active",
    downloadCount: 189,
    averageRating: 4.7
  },
  {
    title: "Computer Networks (CN) Lecture Notes",
    slug: "computer-networks-notes",
    description: "Standard reference notes mapping ISO-OSI stack layers, TCP/IP, IP addressing, routing algorithms, and network security protocols.",
    category: "notes",
    type: "free",
    price: 0,
    imageUrl: "https://picsum.photos/seed/computer-networks-notes/300/400",
    filePath: "/uploads/cn-notes.pdf",
    fileUrl: "https://example.com/files/cn-notes.pdf",
    tags: ["computer networks", "notes", "routing", "internet"],
    status: "active",
    downloadCount: 112,
    averageRating: 4.6
  },

  // 2x DSA & Interview Guides — paid (₹99)
  {
    title: "Cracking the DSA Interview Guide",
    slug: "cracking-dsa-interview-guide",
    description: "Deep-dive study guide covering 150+ standard coding patterns, arrays, trees, dynamic programming, and mock solutions.",
    category: "guides",
    type: "paid",
    price: 99,
    imageUrl: "https://picsum.photos/seed/cracking-dsa-interview-guide/300/400",
    filePath: "/uploads/dsa-guide.pdf",
    fileUrl: "https://example.com/files/dsa-guide.pdf",
    tags: ["dsa", "interview", "coding", "algorithms"],
    status: "active",
    downloadCount: 320,
    averageRating: 4.9
  },
  {
    title: "System Design Prep Handbook",
    slug: "system-design-prep-handbook",
    description: "Master horizontal scaling, load balancing, caching, databases, and microservices architectures with realistic system designs.",
    category: "guides",
    type: "paid",
    price: 99,
    imageUrl: "https://picsum.photos/seed/system-design-prep-handbook/300/400",
    filePath: "/uploads/system-design.pdf",
    fileUrl: "https://example.com/files/system-design.pdf",
    tags: ["system design", "architecture", "interview", "scale"],
    status: "active",
    downloadCount: 215,
    averageRating: 4.8
  },

  // 2x Resume Packages — paid (₹149)
  {
    title: "ATS-Friendly Tech Resume Template",
    slug: "ats-friendly-tech-resume",
    description: "Highly optimized LaTeX and DOCX resume template designed specifically to clear automated recruiter tracking systems.",
    category: "templates",
    type: "paid",
    price: 149,
    imageUrl: "https://picsum.photos/seed/ats-friendly-tech-resume/300/400",
    filePath: "/uploads/ats-resume.zip",
    fileUrl: "https://example.com/files/ats-resume.zip",
    tags: ["resume", "cv", "ats", "job application"],
    status: "active",
    downloadCount: 450,
    averageRating: 4.9
  },
  {
    title: "Modern Portfolio & CV Design Kit",
    slug: "modern-portfolio-cv-kit",
    description: "A comprehensive package containing premium Figma, HTML, and Word formats for creative developers and designers.",
    category: "templates",
    type: "paid",
    price: 149,
    imageUrl: "https://picsum.photos/seed/modern-portfolio-cv-kit/300/400",
    filePath: "/uploads/cv-kit.zip",
    fileUrl: "https://example.com/files/cv-kit.zip",
    tags: ["cv kit", "figma", "portfolio", "templates"],
    status: "active",
    downloadCount: 280,
    averageRating: 4.7
  },

  // 2x AI Prompt Packs — freemium
  {
    title: "ChatGPT Prompts for Software Engineers",
    slug: "chatgpt-prompts-software-engineers",
    description: "Over 500 hand-tested high-quality prompts to accelerate coding speed, write unit tests, review bugs, and automate docs.",
    category: "prompts",
    type: "freemium",
    price: 0,
    imageUrl: "https://picsum.photos/seed/chatgpt-prompts-software-engineers/300/400",
    filePath: "/uploads/chatgpt-prompts.pdf",
    fileUrl: "https://example.com/files/chatgpt-prompts.pdf",
    tags: ["chatgpt", "ai prompts", "productivity", "coding"],
    status: "active",
    downloadCount: 560,
    averageRating: 4.8
  },
  {
    title: "Midjourney & Stable Diffusion Art Prompts",
    slug: "midjourney-diffusion-art-prompts",
    description: "Learn the secrets of generative AI styling, lighting, aspect ratios, and styles to render premium web interfaces and art.",
    category: "prompts",
    type: "freemium",
    price: 0,
    imageUrl: "https://picsum.photos/seed/midjourney-diffusion-art-prompts/300/400",
    filePath: "/uploads/art-prompts.pdf",
    fileUrl: "https://example.com/files/art-prompts.pdf",
    tags: ["midjourney", "stable diffusion", "ai art", "prompts"],
    status: "active",
    downloadCount: 390,
    averageRating: 4.5
  },

  // 2x Coding Cheat Sheets — free
  {
    title: "Python & JavaScript Syntax Cheat Sheet",
    slug: "python-js-syntax-cheatsheet",
    description: "Quick double-sided cheatsheet highlighting ES6 methods, arrays, dictionaries, list comprehensions, and handy syntax.",
    category: "cheatsheets",
    type: "free",
    price: 0,
    imageUrl: "https://picsum.photos/seed/python-js-syntax-cheatsheet/300/400",
    filePath: "/uploads/syntax-cheatsheet.pdf",
    fileUrl: "https://example.com/files/syntax-cheatsheet.pdf",
    tags: ["cheatsheet", "python", "javascript", "syntax"],
    status: "active",
    downloadCount: 980,
    averageRating: 4.9
  },
  {
    title: "SQL & Git Commands Reference Sheet",
    slug: "sql-git-commands-ref",
    description: "An absolute essential reference sheet listing database queries, joins, git rebasing, branches, and stash controls.",
    category: "cheatsheets",
    type: "free",
    price: 0,
    imageUrl: "https://picsum.photos/seed/sql-git-commands-ref/300/400",
    filePath: "/uploads/git-cheatsheet.pdf",
    fileUrl: "https://example.com/files/git-cheatsheet.pdf",
    tags: ["git", "sql", "reference", "commands"],
    status: "active",
    downloadCount: 740,
    averageRating: 4.8
  },

  // 1x Placement Mega Bundle — paid (₹299)
  {
    title: "Ultimate Campus Placement Mega Bundle",
    slug: "ultimate-campus-placement-mega-bundle",
    description: "Your ultimate placement pack: Includes full DSA handbook, Resume builder access, 10 Aptitude practice sets, and HR interview guides.",
    category: "guides",
    type: "paid",
    price: 299,
    imageUrl: "https://picsum.photos/seed/ultimate-campus-placement-mega-bundle/300/400",
    filePath: "/uploads/placement-bundle.zip",
    fileUrl: "https://example.com/files/placement-bundle.zip",
    tags: ["placement bundle", "campus recruitment", "all in one", "tcs infy wits"],
    status: "active",
    downloadCount: 890,
    averageRating: 5.0
  }
];

async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database connected.");

    console.log("🧹 Clearing old digital products...");
    await DigitalProduct.deleteMany({});
    console.log("✅ Old products cleared.");

    console.log("🌱 Seeding 12 digital products...");
    const created = await DigitalProduct.create(digitalProducts);
    console.log(`✅ Successfully seeded ${created.length} products!`);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database disconnected.");
  }
}

seedDatabase();
