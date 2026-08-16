"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, UploadCloud, FileText, Sparkles, Trophy, Play, CheckCircle, 
  MessageSquare, HelpCircle, Activity, Award, TrendingUp, Clock, Volume2, 
  VolumeX, Bookmark, Search, Plus, Trash2, Edit3, BookOpen, Share2, Compass, 
  Calendar, ChevronRight, Maximize2, Minimize2, ChevronDown, ChevronUp, 
  ShieldAlert, ListTodo, BrainCircuit, Download, BarChart2, Check, X, RefreshCw, 
  FileCode, Layers, UserCheck, Settings, Database, ArrowRight, Lightbulb,
  Cpu, Send, Paperclip, Zap, Eye, RotateCcw, Target, Sliders, LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ─────────────── DATA MODELS ─────────────── */
interface StudyFile {
  id: string;
  name: string;
  size: string;
  type: string;
  category: string;
  subject: string;
  dateUploaded: string;
  extractedText?: string;
  diagramsCount: number;
  equationsCount: number;
}

interface GeneratedNote {
  id: string;
  title: string;
  style: string;
  mode: string;
  subject: string;
  content: string;
  keyTakeaways: string[];
  formulas?: string[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "Easy" | "Medium" | "Hard";
  bookmarked: boolean;
  subject: string;
}

interface QuizQuestion {
  id: string;
  type: "MCQ" | "TrueFalse" | "FillBlank";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  subject: string;
}

interface MindMapNode {
  id: string;
  label: string;
  expanded?: boolean;
  color?: string;
  children?: MindMapNode[];
}

type WorkspaceTool = "home" | "notes" | "chat" | "flashcards" | "quiz" | "mindmap" | "examprep" | "files";

/* ─────────────── SEED DATA ─────────────── */
const SAMPLE_FILES: StudyFile[] = [
  {
    id: "file-1",
    name: "Lecture_3_Operating_Systems_Deadlocks.pdf",
    size: "4.2 MB",
    type: "application/pdf",
    category: "Lecture Slides",
    subject: "Operating Systems",
    dateUploaded: "2026-06-18",
    extractedText: "Deadlock conditions: 1. Mutual Exclusion: only one process can hold a resource. 2. Hold and Wait: processes hold resources while waiting. 3. No Preemption: resources cannot be forcibly taken. 4. Circular Wait: processes form a circular dependency chain.",
    diagramsCount: 2,
    equationsCount: 0
  },
  {
    id: "file-2",
    name: "Lecture_7_Database_Normalization.docx",
    size: "1.8 MB",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: "Textbook",
    subject: "DBMS",
    dateUploaded: "2026-06-17",
    extractedText: "Normalization levels: 1NF requires atomic values. 2NF requires removing partial dependencies. 3NF requires removing transitive dependencies. BCNF requires that every determinant is a candidate key.",
    diagramsCount: 0,
    equationsCount: 3
  },
  {
    id: "file-3",
    name: "Lecture_Recordings_Computer_Networks.mp3",
    size: "18.5 MB",
    type: "audio/mpeg",
    category: "Lecture Audio",
    subject: "Computer Networks",
    dateUploaded: "2026-06-15",
    extractedText: "Today we discussed TCP vs UDP. TCP is connection-oriented, reliable, and does flow control. UDP is connectionless, fast, and does no flow control. Ideal for DNS, gaming, and real-time streams.",
    diagramsCount: 0,
    equationsCount: 1
  }
];

const SAMPLE_NOTES: GeneratedNote[] = [
  {
    id: "note-1",
    title: "Operating Systems - Deadlock Conditions & Prevention",
    style: "One-Night Revision Notes",
    mode: "University Exam Mode",
    subject: "Operating Systems",
    content: `## Deadlock Core Principles
A **Deadlock** occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process in the set.

### The 4 Necessary Conditions
1. **Mutual Exclusion**: Only one process can use a resource at a time.
2. **Hold and Wait**: A process holding resources can request additional resources without releasing current ones.
3. **No Preemption**: Resources cannot be forcibly taken from a process.
4. **Circular Wait**: A closed chain of processes exists, such that each process holds at least one resource needed by the next.

\`\`\`txt
[Process P1] ---> (Resource R1) ---> [Process P2] ---> (Resource R2) ---> [Process P1]
\`\`\`

### Banker's Safety Algorithm
Used for **Deadlock Avoidance**. Given:
- \`Available[m]\`: Available instances of each resource type.
- \`Max[n][m]\`: Maximum demand of each process.
- \`Allocation[n][m]\`: Currently allocated resources.
- \`Need[n][m] = Max[n][m] - Allocation[n][m]\`.`,
    keyTakeaways: [
      "Deadlock requires 4 simultaneous conditions.",
      "Mutual exclusion: Resources cannot be shared.",
      "Circular wait: Interdependent wait chain exists.",
      "Banker's Algorithm tests safety before granting requests."
    ],
    formulas: [
      "Need[i][j] = Max[i][j] - Allocation[i][j]",
      "Total resources = Allocated + Available"
    ]
  },
  {
    id: "note-2",
    title: "Database Management - Normalization (3NF vs BCNF)",
    style: "Short Notes",
    mode: "Competitive Exam Mode",
    subject: "DBMS",
    content: `## Database Normalization
Normalization organizes data to reduce redundancy and improve data integrity.

### Key Normal Forms
- **1NF**: Atomic values only.
- **2NF**: 1NF + No partial functional dependencies.
- **3NF**: 2NF + No transitive functional dependencies.
- **BCNF**: Strict 3NF where every determinant (X in X → Y) must be a superkey.`,
    keyTakeaways: [
      "3NF eliminates transitive functional dependencies.",
      "BCNF requires every determinant to be a superkey.",
      "All BCNF relations are in 3NF, but not vice-versa."
    ]
  }
];

const SAMPLE_FLASHCARDS: Flashcard[] = [
  { id: "flash-1", subject: "Operating Systems", front: "What are the 4 Coffman conditions for Deadlock?", back: "1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait", difficulty: "Hard", bookmarked: true },
  { id: "flash-2", subject: "Operating Systems", front: "Formula for Banker's Algorithm Need Matrix?", back: "Need[i][j] = Max[i][j] - Allocation[i][j]", difficulty: "Medium", bookmarked: false },
  { id: "flash-3", subject: "DBMS", front: "What is BCNF?", back: "A relation is in BCNF if for every functional dependency X -> Y, X is a superkey.", difficulty: "Hard", bookmarked: false },
  { id: "flash-4", subject: "Computer Networks", front: "Which protocol is connectionless: TCP or UDP?", back: "UDP (User Datagram Protocol)", difficulty: "Easy", bookmarked: true }
];

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: "q-1",
    subject: "Operating Systems",
    type: "MCQ",
    question: "Which deadlock handling algorithm tests system state before granting resources?",
    options: ["Banker's Algorithm", "Ostrich Algorithm", "Round Robin", "SJF"],
    answer: "Banker's Algorithm",
    explanation: "Banker's Algorithm is a deadlock avoidance technique that ensures the system remains in a safe state."
  },
  {
    id: "q-2",
    subject: "Operating Systems",
    type: "TrueFalse",
    question: "A cycle in a resource allocation graph with single-instance resources guarantees a deadlock.",
    options: ["True", "False"],
    answer: "True",
    explanation: "For single-instance resource systems, a cycle in the resource allocation graph is a necessary and sufficient condition for deadlock."
  },
  {
    id: "q-3",
    subject: "DBMS",
    type: "FillBlank",
    question: "In BCNF, for every non-trivial functional dependency X -> Y, X must be a ________.",
    answer: "superkey",
    explanation: "For a relation to be in BCNF, every determinant X must be a candidate key or superkey."
  }
];

const INITIAL_MIND_MAP: MindMapNode = {
  id: "root",
  label: "Operating Systems",
  color: "#a855f7",
  expanded: true,
  children: [
    {
      id: "proc",
      label: "Process Management",
      color: "#ea580c",
      expanded: true,
      children: [
        { id: "sched", label: "CPU Scheduling Algorithms" },
        { id: "sync", label: "Semaphores & Mutex" }
      ]
    },
    {
      id: "mem",
      label: "Memory Management",
      color: "#3b82f6",
      expanded: false,
      children: [
        { id: "pag", label: "Paging & Virtual Memory" },
        { id: "seg", label: "Segmentation" }
      ]
    },
    {
      id: "dead",
      label: "Deadlocks Engine",
      color: "#10b981",
      expanded: false,
      children: [
        { id: "cond", label: "4 Coffman Conditions" },
        { id: "bank", label: "Banker's Safety Algorithm" }
      ]
    }
  ]
};

const DEFAULT_SUBJECT_OPTIONS = [
  "Operating Systems",
  "Computer Networks",
  "DBMS",
  "DSA",
  "Java",
  "Mathematics",
  "AI / ML"
];

export default function SmartNotesOS() {
  const { user } = useAuth() as any;

  /* ─────────────── ACTIVE CONTEXT & NAVIGATION ─────────────── */
  const [activeTool, setActiveTool] = useState<WorkspaceTool>("home");
  const [selectedSubject, setSelectedSubject] = useState<string>("Operating Systems");
  const [subjectList, setSubjectList] = useState<string[]>(DEFAULT_SUBJECT_OPTIONS);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);

  // Sound Synth States
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Data States
  const [files, setFiles] = useState<StudyFile[]>(SAMPLE_FILES);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>(SAMPLE_NOTES);
  const [activeNoteIdx, setActiveNoteIdx] = useState(0);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SAMPLE_FLASHCARDS);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZ);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const [mindMapData, setMindMapData] = useState<MindMapNode>(INITIAL_MIND_MAP);

  // Exams & Revision
  const [revisionCountdowns, setRevisionCountdowns] = useState([
    { subject: "Operating Systems", days: 3, progress: 65, date: "2026-08-20" },
    { subject: "DBMS", days: 7, progress: 45, date: "2026-08-24" },
    { subject: "Computer Networks", days: 12, progress: 20, date: "2026-08-29" }
  ]);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExamSubject, setNewExamSubject] = useState("");
  const [newExamDays, setNewExamDays] = useState(5);
  const [newExamProgress, setNewExamProgress] = useState(40);

  // AI Tutor Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "👋 Hello! I'm your **AI Study Companion**. Ask me anything about **Operating Systems**, Deadlocks, CPU Scheduling, or request step-by-step explanations.",
      time: "10:30 AM"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Notes Generator inputs
  const [noteStyle, setNoteStyle] = useState<string>("One-Night Revision Notes");
  const [noteMode, setNoteMode] = useState<string>("University Exam Mode");
  const [topicInput, setTopicInput] = useState("");
  const [syllabusInput, setSyllabusInput] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  // File Upload states
  const [uploadFileMsg, setUploadFileMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sound Synth Trigger
  const playSound = (freq: number, type: "sine" | "triangle" | "sawtooth", duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio synth silent fallback
    }
  };

  const playClick = () => playSound(600, "sine", 0.08);
  const playSuccess = () => { playSound(523.25, "triangle", 0.1); setTimeout(() => playSound(659.25, "triangle", 0.15), 100); };

  // Filtered Subject Data
  const currentSubjectFiles = useMemo(() => {
    return files.filter(f => selectedSubject === "All" || f.subject.toLowerCase() === selectedSubject.toLowerCase());
  }, [files, selectedSubject]);

  const currentSubjectNotes = useMemo(() => {
    return generatedNotes.filter(n => selectedSubject === "All" || n.subject.toLowerCase() === selectedSubject.toLowerCase());
  }, [generatedNotes, selectedSubject]);

  const currentSubjectFlashcards = useMemo(() => {
    return flashcards.filter(f => selectedSubject === "All" || f.subject.toLowerCase() === selectedSubject.toLowerCase());
  }, [flashcards, selectedSubject]);

  const currentSubjectQuiz = useMemo(() => {
    return quizQuestions.filter(q => selectedSubject === "All" || q.subject.toLowerCase() === selectedSubject.toLowerCase());
  }, [quizQuestions, selectedSubject]);

  // Subject Addition Handler
  const handleAddNewSubject = () => {
    if (!newSubjectInput.trim()) return;
    const subName = newSubjectInput.trim();
    if (!subjectList.includes(subName)) {
      setSubjectList(prev => [...prev, subName]);
    }
    setSelectedSubject(subName);
    setNewSubjectInput("");
    setIsAddingNewSubject(false);
    setIsSubjectDropdownOpen(false);
    playSuccess();
  };

  // AI Chat Send Handler
  const handleSendChat = (presetMsg?: string) => {
    const text = presetMsg || chatInput;
    if (!text.trim()) return;

    playClick();
    const userMsg = { sender: "user" as const, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatIsTyping(true);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    setTimeout(() => {
      let aiResponse = "";
      const q = text.toLowerCase();

      if (q.includes("deadlock") || q.includes("coffman")) {
        aiResponse = `### Deadlock Coffman Conditions
For a deadlock to occur in **${selectedSubject}**, 4 conditions must hold simultaneously:

1. **Mutual Exclusion**: Non-sharable resources.
2. **Hold and Wait**: Process holding allocated resources while waiting for others.
3. **No Preemption**: Resources cannot be forcibly revoked.
4. **Circular Wait**: Interdependent wait loop among processes.

> 💡 **Exam Tip**: Banker's Safety Algorithm prevents deadlocks by testing safe sequences before allocating!`;
      } else if (q.includes("example") || q.includes("simply")) {
        aiResponse = `### Simplified Explanation (${selectedSubject})
Think of this like a busy restaurant:
- **Processes** are customers.
- **Resources** (CPU/Memory/DB Connections) are dining tables.
- **Deadlock** happens when Customer A has the fork, Customer B has the knife, and neither will eat or let go until they get both!`;
      } else if (q.includes("quiz") || q.includes("test")) {
        aiResponse = `### Quick Practice Question
**Q**: Which deadlock strategy guarantees zero deadlocks by inspecting safe states before resource allocation?
- A) Deadlock Recovery
- B) Banker's Algorithm (Avoidance)
- C) Ostrich Algorithm

*Answer: B) Banker's Algorithm!*`;
      } else {
        aiResponse = `### AI Tutor Response (${selectedSubject})
Regarding your question on **"${text}"**:

In **${selectedSubject}**, this concept is critical for exam preparation and system design. 

#### Key Principles:
1. **Core Mechanism**: Leverages allocated memory/system resources efficiently.
2. **Implementation Strategy**: Always verify bounds and boundary constraints.
3. **Performance Optimization**: Minimizes overhead during peak workloads.`;
      }

      setChatMessages(prev => [
        ...prev,
        { sender: "ai", text: aiResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setChatIsTyping(false);
      playSuccess();
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1000);
  };

  // Notes Generation Handler
  const handleGenerateNotes = () => {
    setIsGeneratingNotes(true);
    playClick();

    setTimeout(() => {
      const newNote: GeneratedNote = {
        id: `note-${Date.now()}`,
        title: topicInput.trim() ? `${selectedSubject} - ${topicInput}` : `${selectedSubject} Revision Brief`,
        style: noteStyle,
        mode: noteMode,
        subject: selectedSubject,
        content: `## ${selectedSubject} - ${topicInput || "Comprehensive Study Summary"}

### 1. Executive Concept Overview
This study module covers core architectural fundamentals of **${selectedSubject}**.

### 2. Primary Engineering Specifications
- **Optimization Ratio**: 94.2% throughput efficiency.
- **State Complexity**: O(N log N) average scaling.
- **Fault Tolerance**: Redundant state tracking and dynamic fallback recovery.

\`\`\`typescript
// Implementation Example for ${selectedSubject}
function executeWorkflow(input: string): boolean {
  console.log("Processing study payload for: " + input);
  return true;
}
\`\`\`

### 3. Exam Formula Checklist
- $$\\text{Speedup} = \\frac{\\text{Execution Time (Old)}}{\\text{Execution Time (New)}}$$
- $$\\text{Throughput} = \\frac{\\text{Total Tasks}}{\\text{Elapsed Time}}$$`,
        keyTakeaways: [
          `Key concept 1 for ${selectedSubject}.`,
          "Always verify edge cases before implementation.",
          "High exam probability for 10-mark questions."
        ],
        formulas: ["Speedup = Time(old) / Time(new)"]
      };

      setGeneratedNotes(prev => [newNote, ...prev]);
      setActiveNoteIdx(0);
      setIsGeneratingNotes(false);
      playSuccess();
    }, 1200);
  };

  // File Upload Handler
  const handleFileUpload = (file: File) => {
    setUploadFileMsg("Processing study file...");
    setTimeout(() => {
      const newFile: StudyFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || "application/pdf",
        category: "Uploaded Material",
        subject: selectedSubject,
        dateUploaded: new Date().toISOString().split("T")[0],
        extractedText: `Extracted content from ${file.name} for ${selectedSubject}.`,
        diagramsCount: 1,
        equationsCount: 2
      };
      setFiles(prev => [newFile, ...prev]);
      setUploadFileMsg(`✓ Successfully indexed ${file.name}`);
      playSuccess();
      setTimeout(() => setUploadFileMsg(""), 3000);
    }, 1000);
  };

  // Exam Addition
  const handleAddExam = () => {
    if (!newExamSubject.trim()) return;
    playSuccess();
    setRevisionCountdowns(prev => [
      ...prev,
      { subject: newExamSubject, days: newExamDays, progress: newExamProgress, date: "2026-08-25" }
    ]);
    setNewExamSubject("");
    setIsAddingExam(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative overflow-hidden select-none pb-20 transition-colors duration-300">
      
      {/* Ambient Lavender & Purple Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 dark:bg-purple-950/20 blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-500/5 dark:bg-indigo-950/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 dark:bg-cyan-950/15 blur-[140px]" />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOP NAVIGATION & SUBJECT CONTEXT BAR
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="relative z-30 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link
              href="/student-hub"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Hub</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

            {/* Brand Title */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-purple-600/20">
                ⚡
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-zinc-50">
                Smart Notes OS
              </span>
            </div>

            {/* SUBJECT SELECTOR DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-purple-700 dark:text-purple-300 hover:border-purple-500/40 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Subject:</span>
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedSubject}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>

              {isSubjectDropdownOpen && (
                <div className="absolute left-0 top-10 z-50 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 block pt-1">
                    Select Subject Context
                  </span>

                  <button
                    onClick={() => { setSelectedSubject("All"); setIsSubjectDropdownOpen(false); playClick(); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedSubject === "All"
                        ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 font-black"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span>All Subjects</span>
                    {selectedSubject === "All" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                  </button>

                  {subjectList.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => { setSelectedSubject(sub); setIsSubjectDropdownOpen(false); playClick(); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                        selectedSubject === sub
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 font-black"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="truncate">{sub}</span>
                      {selectedSubject === sub && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>
                  ))}

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-850">
                    {isAddingNewSubject ? (
                      <div className="p-1 space-y-1.5">
                        <input
                          type="text"
                          value={newSubjectInput}
                          onChange={(e) => setNewSubjectInput(e.target.value)}
                          placeholder="Subject Name..."
                          className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-bold outline-none"
                        />
                        <button
                          onClick={handleAddNewSubject}
                          className="w-full h-7 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-black uppercase"
                        >
                          Add Subject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingNewSubject(true)}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add New Subject</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Toggle Audio Feedback"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-400" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          WORKSPACE NAVIGATION TABS (Notes | AI Tutor | Flashcards | Quiz...)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className="relative z-20 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto flex items-center gap-1 py-2">
          {[
            { id: "home", label: "Workspace Home", icon: LayoutDashboard },
            { id: "notes", label: "Notes", icon: FileText, badge: `${currentSubjectNotes.length}` },
            { id: "chat", label: "AI Tutor", icon: MessageSquare },
            { id: "flashcards", label: "Flashcards", icon: Zap, badge: `${currentSubjectFlashcards.length}` },
            { id: "quiz", label: "Quiz", icon: HelpCircle },
            { id: "mindmap", label: "Mind Map", icon: BrainCircuit },
            { id: "examprep", label: "Exam Prep", icon: Calendar },
            { id: "files", label: "Files", icon: UploadCloud, badge: `${currentSubjectFiles.length}` },
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => { setActiveTool(tool.id as WorkspaceTool); playClick(); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-md"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tool.label}</span>
                {tool.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isActive ? "bg-purple-500 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"}`}>
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN WORKSPACE BODY
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* ━━━━━━━━ TOOL 1: WORKSPACE HOME / LAUNCHPAD ━━━━━━━━ */}
          {activeTool === "home" && (
            <motion.div
              key="tool-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-8 max-w-5xl mx-auto text-left"
            >
              {/* Greeting */}
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  STUDY WORKSPACE ACTIVE
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                  Good evening, Jay
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium">
                  What are you studying today in <strong className="text-slate-900 dark:text-zinc-100">{selectedSubject}</strong>?
                </p>
              </div>

              {/* Continue Studying Card */}
              <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>Continue Session</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedSubject}</h2>
                  <p className="text-xs opacity-90 font-medium">
                    {currentSubjectNotes.length} Generated Notes • {currentSubjectFiles.length} Indexed Files
                  </p>
                </div>

                <button
                  onClick={() => { setActiveTool("notes"); playClick(); }}
                  className="px-5 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
                >
                  <span>Resume Notes Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Your Subjects Grid */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Your Subjects ({subjectList.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjectList.map((sub) => {
                    const countFiles = files.filter(f => f.subject.toLowerCase() === sub.toLowerCase()).length;
                    const isCurrent = selectedSubject.toLowerCase() === sub.toLowerCase();
                    return (
                      <div
                        key={sub}
                        onClick={() => { setSelectedSubject(sub); playClick(); }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                          isCurrent
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 shadow-sm"
                            : "bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-900 dark:text-zinc-100"
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-black tracking-tight truncate">{sub}</h4>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold block">
                            {countFiles} Files Indexed
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                          <span>{isCurrent ? "Active Subject" : "Select"}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Productivity Pill Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-zinc-400 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>3 Day Study Streak Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>2.1 Hours Saved via AI Summaries</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TOOL 2: NOTES WORKSPACE ━━━━━━━━ */}
          {activeTool === "notes" && (
            <motion.div
              key="tool-notes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 text-left"
            >
              {/* Workspace Title & Config Form */}
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    NOTES WORKSPACE • {selectedSubject}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                    Generate Revision-Ready Notes
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Note Style</label>
                    <select
                      value={noteStyle}
                      onChange={(e) => setNoteStyle(e.target.value)}
                      className="h-10 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold outline-none"
                    >
                      <option value="One-Night Revision Notes">One-Night Revision Notes</option>
                      <option value="Short Notes">Short Notes</option>
                      <option value="Executive Summary">Executive Summary</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Exam Target Mode</label>
                    <select
                      value={noteMode}
                      onChange={(e) => setNoteMode(e.target.value)}
                      className="h-10 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold outline-none"
                    >
                      <option value="University Exam Mode">University Exam Mode</option>
                      <option value="Competitive Exam Mode">Competitive Exam Mode (GATE / GRE)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Specific Topic / Chapter</label>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. Deadlock Prevention & Recovery"
                      className="h-10 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateNotes}
                  disabled={isGeneratingNotes}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isGeneratingNotes ? "Synthesizing Notes..." : `Generate Notes for ${selectedSubject}`}</span>
                </button>
              </div>

              {/* Document Reader Area */}
              {currentSubjectNotes.length > 0 && (
                <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                      {currentSubjectNotes[activeNoteIdx]?.title || "Generated Study Document"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300"
                      >
                        Print PDF
                      </button>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentSubjectNotes[activeNoteIdx]?.content || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ━━━━━━━━ TOOL 3: REDESIGNED AI TUTOR ━━━━━━━━ */}
          {activeTool === "chat" && (
            <motion.div
              key="tool-chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="max-w-4xl mx-auto space-y-4 text-left flex flex-col h-[75vh]"
            >
              {/* Chat Header */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xs">
                    🤖
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100">AI Academic Tutor</h2>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                      Context: <strong className="text-purple-600 dark:text-purple-400">{selectedSubject}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {["Explain simply", "Give an example", "Quiz me"].map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSendChat(chip)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer hidden sm:inline-block"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Conversation Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white font-medium"
                          : "bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 text-slate-900 dark:text-zinc-100"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
                {chatIsTyping && (
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 p-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>AI Tutor is thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Composer */}
              <div className="p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder={`Ask anything about ${selectedSubject}...`}
                  className="flex-1 bg-transparent px-3 text-xs font-bold outline-none text-slate-900 dark:text-zinc-100 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSendChat()}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black transition-colors cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TOOL 4: FLASHCARDS WORKSPACE ━━━━━━━━ */}
          {activeTool === "flashcards" && (
            <motion.div
              key="tool-flashcards"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl mx-auto space-y-6 text-center"
            >
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  FLASHCARD REVISION • {selectedSubject}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  Card {currentSubjectFlashcards.length > 0 ? flashcardIdx + 1 : 0} of {currentSubjectFlashcards.length}
                </h2>
              </div>

              {currentSubjectFlashcards.length > 0 ? (
                <div
                  onClick={() => { setIsFlipped(!isFlipped); playClick(); }}
                  className="h-64 w-full bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl relative overflow-hidden transition-all hover:border-purple-500/40"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 absolute top-4 left-4">
                    {isFlipped ? "Answer Side" : "Question Side (Click to Flip)"}
                  </span>

                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 leading-relaxed">
                    {isFlipped
                      ? currentSubjectFlashcards[flashcardIdx]?.back
                      : currentSubjectFlashcards[flashcardIdx]?.front}
                  </p>
                </div>
              ) : (
                <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-xs font-bold text-slate-500">
                  No flashcards found for {selectedSubject}. Switch subject or generate new cards!
                </div>
              )}

              {/* Flashcard Navigation */}
              {currentSubjectFlashcards.length > 0 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : currentSubjectFlashcards.length - 1)); setIsFlipped(false); playClick(); }}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => { setFlashcardIdx((prev) => (prev < currentSubjectFlashcards.length - 1 ? prev + 1 : 0)); setIsFlipped(false); playClick(); }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md"
                  >
                    Next Card →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ━━━━━━━━ TOOL 5: QUIZ WORKSPACE ━━━━━━━━ */}
          {activeTool === "quiz" && (
            <motion.div
              key="tool-quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="max-w-2xl mx-auto space-y-6 text-left"
            >
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  INTERACTIVE QUIZ • {selectedSubject}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  Question {currentSubjectQuiz.length > 0 ? quizIdx + 1 : 0} of {currentSubjectQuiz.length}
                </h2>
              </div>

              {currentSubjectQuiz.length > 0 && currentSubjectQuiz[quizIdx] && (
                <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                    {currentSubjectQuiz[quizIdx].question}
                  </h3>

                  <div className="space-y-2">
                    {currentSubjectQuiz[quizIdx].options?.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSelectedQuizOption(opt); setIsAnswerChecked(false); playClick(); }}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          selectedQuizOption === opt
                            ? "bg-purple-500/10 border-purple-500/40 text-purple-700 dark:text-purple-300"
                            : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {!isAnswerChecked ? (
                    <button
                      onClick={() => { setIsAnswerChecked(true); playSuccess(); }}
                      disabled={!selectedQuizOption}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-purple-600/20 disabled:opacity-50"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-bold space-y-1">
                      <div>Correct Answer: {currentSubjectQuiz[quizIdx].answer}</div>
                      <p className="text-[11px] font-medium opacity-90">{currentSubjectQuiz[quizIdx].explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ━━━━━━━━ TOOL 6: MIND MAP WORKSPACE ━━━━━━━━ */}
          {activeTool === "mindmap" && (
            <motion.div
              key="tool-mindmap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="max-w-4xl mx-auto space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    VISUAL CONCEPT MAP • {selectedSubject}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                    Interactive Mind Map
                  </h2>
                </div>
              </div>

              {/* Mind Map Canvas Card */}
              <div className="h-96 w-full bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
                <div className="p-4 rounded-2xl bg-purple-600 text-white font-black text-sm shadow-lg mb-6">
                  {selectedSubject} Architecture
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {["Core Concepts", "Algorithms & Models", "System Tradeoffs"].map((node) => (
                    <div key={node} className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 text-center">
                      {node}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TOOL 7: EXAM PREP WORKSPACE ━━━━━━━━ */}
          {activeTool === "examprep" && (
            <motion.div
              key="tool-examprep"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="max-w-4xl mx-auto space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    REVISION PLANNER
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                    Upcoming Exams ({revisionCountdowns.length})
                  </h2>
                </div>

                <button
                  onClick={() => setIsAddingExam(!isAddingExam)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase"
                >
                  {isAddingExam ? "Cancel" : "+ Add Exam"}
                </button>
              </div>

              {isAddingExam && (
                <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-3">
                  <input
                    type="text"
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    placeholder="Exam Subject Name..."
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                  />
                  <button
                    onClick={handleAddExam}
                    className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black uppercase"
                  >
                    Confirm &amp; Add Exam
                  </button>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                {revisionCountdowns.map((exam) => (
                  <div key={exam.subject} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                        In {exam.days} Days
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-zinc-100">{exam.progress}% Done</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">{exam.subject}</h3>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-950 overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: `${exam.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TOOL 8: FILES WORKSPACE ━━━━━━━━ */}
          {activeTool === "files" && (
            <motion.div
              key="tool-files"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="max-w-5xl mx-auto space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    STUDY MATERIAL REPOSITORY
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                    Files for {selectedSubject} ({currentSubjectFiles.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload Material</span>
                  </button>
                </div>
              </div>

              {uploadFileMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {uploadFileMsg}
                </div>
              )}

              {/* File Grid / Table */}
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-3">
                {currentSubjectFiles.map((file) => (
                  <div key={file.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-purple-600 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 truncate">{file.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.subject}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setActiveTool("notes"); playClick(); }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-purple-600 dark:text-purple-400"
                      >
                        Generate Notes
                      </button>
                      <button
                        onClick={() => { setActiveTool("chat"); playClick(); }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300"
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
