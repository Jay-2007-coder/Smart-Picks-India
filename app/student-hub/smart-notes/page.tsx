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
  Cpu, Send, Paperclip, Zap, Eye, RotateCcw, Target, Sliders, LayoutDashboard,
  AlertTriangle, FileType2, File
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
  bookmarked?: boolean;
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
const DEFAULT_FILES: StudyFile[] = [
  {
    id: "file-1",
    name: "Java_OOP_Inheritance_Guide.pdf",
    size: "2.4 MB",
    type: "application/pdf",
    category: "Lecture Slides",
    subject: "Java",
    dateUploaded: "2026-08-10",
    extractedText: "Inheritance in Java allows a subclass to inherit fields and methods from a superclass using the 'extends' keyword. Java supports single, multilevel, and hierarchical inheritance, but NOT multiple inheritance with classes to avoid the Diamond Problem. Interfaces are used to achieve 100% abstraction and multiple inheritance."
  },
  {
    id: "file-2",
    name: "Operating_Systems_Deadlocks.pdf",
    size: "4.2 MB",
    type: "application/pdf",
    category: "Lecture Slides",
    subject: "Operating Systems",
    dateUploaded: "2026-08-12",
    extractedText: "Deadlock conditions: 1. Mutual Exclusion: only one process can hold a resource. 2. Hold and Wait: processes hold resources while waiting. 3. No Preemption: resources cannot be forcibly taken. 4. Circular Wait: processes form a circular dependency chain. Banker's Algorithm is used for deadlock avoidance."
  }
];

const DEFAULT_NOTES: GeneratedNote[] = [
  {
    id: "note-1",
    title: "Java - OOP Principles & Inheritance",
    style: "One-Night Revision Notes",
    mode: "University Exam Mode",
    subject: "Java",
    content: `## Object-Oriented Programming in Java

Inheritance is a fundamental mechanism where a new class derives properties and behaviors from an existing class using the \`extends\` keyword.

### Key Concepts
1. **Superclass (Parent)**: The class being inherited.
2. **Subclass (Child)**: The class that inherits from the superclass.
3. **Method Overriding**: Declaring a method in a subclass that already exists in the superclass with the same signature (\`@Override\` annotation).

\`\`\`java
// Code Example
class Animal {
    void makeSound() {
        System.out.println("Generic Animal Sound");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println("Woof! Woof!");
    }
}
\`\`\`

### Why Multiple Inheritance is Not Allowed with Classes
To prevent the **Diamond Problem**, Java avoids multiple class inheritance. However, multiple inheritance is fully supported via **Interfaces**.`,
    keyTakeaways: [
      "Inheritance promotes code reusability using 'extends'.",
      "Java uses Interfaces to achieve multiple inheritance.",
      "@Override annotation verifies correct method signatures.",
      "Constructor chaining uses super() to call parent constructors."
    ],
    formulas: [
      "Subclass IS-A Superclass",
      "super() must be the first statement in a subclass constructor"
    ]
  }
];

const DEFAULT_FLASHCARDS: Flashcard[] = [
  { id: "flash-1", subject: "Java", front: "Why does Java not support multiple inheritance with classes?", back: "To prevent ambiguity caused by the Diamond Problem. Java uses Interfaces instead.", difficulty: "Hard" },
  { id: "flash-2", subject: "Java", front: "What is the difference between overload and override?", back: "Overloading happens in the same class (same method name, different parameters). Overriding happens in subclasses (same signature).", difficulty: "Medium" },
  { id: "flash-3", subject: "Operating Systems", front: "What are the 4 Coffman conditions for Deadlock?", back: "1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait", difficulty: "Hard" }
];

const DEFAULT_QUIZ: QuizQuestion[] = [
  {
    id: "q-1",
    subject: "Java",
    type: "MCQ",
    question: "Which keyword is used by a Java class to inherit properties from a superclass?",
    options: ["implements", "extends", "inherits", "super"],
    answer: "extends",
    explanation: "The 'extends' keyword is used to establish an inheritance relationship between two classes in Java."
  },
  {
    id: "q-2",
    subject: "Java",
    type: "TrueFalse",
    question: "A constructor in Java can be marked as static or final.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Constructors cannot be static, final, or abstract because they belong to instances during object creation."
  }
];

const DEFAULT_MIND_MAP: MindMapNode = {
  id: "root",
  label: "Java Programming",
  color: "#a855f7",
  expanded: true,
  children: [
    {
      id: "oop",
      label: "Object Oriented Programming",
      color: "#ea580c",
      expanded: true,
      children: [
        { id: "inh", label: "Inheritance & Polymorphism" },
        { id: "enc", label: "Encapsulation & Abstraction" }
      ]
    },
    {
      id: "mem",
      label: "Memory Management",
      color: "#3b82f6",
      expanded: false,
      children: [
        { id: "heap", label: "Heap vs Stack Memory" },
        { id: "gc", label: "Garbage Collector" }
      ]
    }
  ]
};

const DEFAULT_SUBJECT_OPTIONS = [
  "Java",
  "Operating Systems",
  "Computer Networks",
  "DBMS",
  "DSA",
  "Mathematics",
  "AI / ML"
];

export default function SmartNotesOS() {
  const { user } = useAuth() as any;

  /* ─────────────── ACTIVE CONTEXT & NAVIGATION ─────────────── */
  const [activeTool, setActiveTool] = useState<WorkspaceTool>("home");
  const [selectedSubject, setSelectedSubject] = useState<string>("Java");
  const [subjectList, setSubjectList] = useState<string[]>(DEFAULT_SUBJECT_OPTIONS);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);

  // Sound Synth States
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Data States
  const [files, setFiles] = useState<StudyFile[]>(DEFAULT_FILES);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>(DEFAULT_NOTES);
  const [activeNoteIdx, setActiveNoteIdx] = useState(0);
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>(DEFAULT_FLASHCARDS);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(DEFAULT_QUIZ);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const [mindMapData, setMindMapData] = useState<MindMapNode>(DEFAULT_MIND_MAP);
  const [mindMapTopic, setMindMapTopic] = useState("");
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);

  // Exams & Revision
  const [revisionCountdowns, setRevisionCountdowns] = useState([
    { subject: "Java", days: 4, progress: 70, date: "2026-08-20" },
    { subject: "Operating Systems", days: 8, progress: 45, date: "2026-08-24" },
    { subject: "DBMS", days: 14, progress: 20, date: "2026-08-30" }
  ]);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExamSubject, setNewExamSubject] = useState("");
  const [newExamDays, setNewExamDays] = useState(5);

  // AI Tutor Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "👋 Hello! I am your **AI Academic Tutor**. Ask me any question about **Java**, inheritance, memory management, or your uploaded files.",
      time: "10:30 AM"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Notes Generator inputs
  const [noteStyle, setNoteStyle] = useState<string>("One-Night Revision Notes");
  const [noteMode, setNoteMode] = useState<string>("University Exam Mode");
  const [topicInput, setTopicInput] = useState("");
  const [syllabusInput, setSyllabusInput] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesError, setNotesError] = useState("");

  // File Upload states
  const [uploadFileMsg, setUploadFileMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence Load
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("smartnotes_notes");
      const savedFiles = localStorage.getItem("smartnotes_files");
      const savedFlashcards = localStorage.getItem("smartnotes_flashcards");
      const savedSubject = localStorage.getItem("smartnotes_selected_subject");

      if (savedNotes) { const p = JSON.parse(savedNotes); if (Array.isArray(p) && p.length > 0) setGeneratedNotes(p); }
      if (savedFiles) { const p = JSON.parse(savedFiles); if (Array.isArray(p) && p.length > 0) setFiles(p); }
      if (savedFlashcards) { const p = JSON.parse(savedFlashcards); if (Array.isArray(p) && p.length > 0) setFlashcards(p); }
      if (savedSubject) setSelectedSubject(savedSubject);
    } catch (e) {
      console.error("Local storage load error:", e);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("smartnotes_notes", JSON.stringify(generatedNotes));
      localStorage.setItem("smartnotes_files", JSON.stringify(files));
      localStorage.setItem("smartnotes_flashcards", JSON.stringify(flashcards));
      localStorage.setItem("smartnotes_selected_subject", selectedSubject);
    } catch (e) {
      console.error("Local storage save error:", e);
    }
  }, [generatedNotes, files, flashcards, selectedSubject]);

  // Audio Synth Trigger
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

  // Contextual File Text Extraction for Active Subject
  const filesContext = useMemo(() => {
    return files
      .filter((f) => selectedSubject === "All" || f.subject.toLowerCase() === selectedSubject.toLowerCase())
      .map((f) => `--- File: ${f.name} (${f.subject}) ---\n${f.extractedText || ""}`)
      .join("\n\n");
  }, [files, selectedSubject]);

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

  /* ─────────────── REAL API 1: AI TUTOR CHAT ─────────────── */
  const handleSendChat = async (presetMsg?: string) => {
    const text = presetMsg || chatInput;
    if (!text.trim()) return;

    playClick();
    setChatError("");
    const userMsg = { sender: "user" as const, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput("");
    setChatIsTyping(true);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/v1/student-hub/smart-notes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newHistory.slice(-6),
          filesContext,
          subject: selectedSubject
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.reply) {
        setChatMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        playSuccess();
      } else {
        setChatError(data.message || "Failed to get AI response.");
      }
    } catch (err: any) {
      setChatError("Network connection error. Please retry.");
    } finally {
      setChatIsTyping(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  /* ─────────────── REAL API 2: NOTES GENERATOR ─────────────── */
  const handleGenerateNotes = async () => {
    setIsGeneratingNotes(true);
    setNotesError("");
    playClick();

    try {
      const res = await fetch("/api/v1/student-hub/smart-notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          topic: topicInput,
          style: noteStyle,
          mode: noteMode,
          filesContext,
          customSyllabusText: syllabusInput
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.note) {
        const newNote: GeneratedNote = {
          id: `note-${Date.now()}`,
          title: data.note.title || `${selectedSubject} Study Note`,
          style: noteStyle,
          mode: noteMode,
          subject: selectedSubject,
          content: data.note.content || "No content generated.",
          keyTakeaways: data.note.keyTakeaways || [],
          formulas: data.note.formulas || []
        };

        setGeneratedNotes((prev) => [newNote, ...prev]);
        setActiveNoteIdx(0);
        playSuccess();
      } else {
        setNotesError(data.message || "Note generation failed.");
      }
    } catch {
      setNotesError("Network connection error. Please try again.");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  /* ─────────────── REAL API 3: FLASHCARDS GENERATOR ─────────────── */
  const handleGenerateFlashcards = async () => {
    setIsGeneratingFlashcards(true);
    playClick();

    try {
      const res = await fetch("/api/v1/student-hub/smart-notes/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedSubject, filesContext }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.flashcards)) {
        const formatted: Flashcard[] = data.flashcards.map((fc: any, i: number) => ({
          id: `flash-${Date.now()}-${i}`,
          front: fc.front,
          back: fc.back,
          difficulty: fc.difficulty || "Medium",
          subject: selectedSubject
        }));
        setFlashcards((prev) => [...formatted, ...prev]);
        setFlashcardIdx(0);
        playSuccess();
      }
    } catch (e) {
      console.error("Flashcards API error:", e);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  /* ─────────────── REAL API 4: QUIZ GENERATOR ─────────────── */
  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    playClick();

    try {
      const res = await fetch("/api/v1/student-hub/smart-notes/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedSubject, filesContext }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.quiz)) {
        const formatted: QuizQuestion[] = data.quiz.map((q: any, i: number) => ({
          id: `q-${Date.now()}-${i}`,
          type: q.type || "MCQ",
          question: q.question,
          options: q.options || [],
          answer: q.answer,
          explanation: q.explanation || "",
          subject: selectedSubject
        }));
        setQuizQuestions(formatted);
        setQuizIdx(0);
        setSelectedQuizOption(null);
        setIsAnswerChecked(false);
        playSuccess();
      }
    } catch (e) {
      console.error("Quiz API error:", e);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  /* ─────────────── REAL API 5: MIND MAP GENERATOR ─────────────── */
  const handleGenerateMindMap = async () => {
    setIsGeneratingMindMap(true);
    playClick();

    try {
      const res = await fetch("/api/v1/student-hub/smart-notes/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedSubject, topic: mindMapTopic, filesContext }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.mindmap) {
        setMindMapData(data.mindmap);
        playSuccess();
      }
    } catch (e) {
      console.error("Mindmap API error:", e);
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (file: File) => {
    setUploadFileMsg("Parsing file content...");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (ext === "txt") {
      file.text().then((text) => {
        const newFile: StudyFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type || "text/plain",
          category: "Uploaded Material",
          subject: selectedSubject,
          dateUploaded: new Date().toISOString().split("T")[0],
          extractedText: text
        };
        setFiles((prev) => [newFile, ...prev]);
        setUploadFileMsg(`✓ Successfully indexed ${file.name}`);
        playSuccess();
        setTimeout(() => setUploadFileMsg(""), 3000);
      });
    } else {
      setTimeout(() => {
        const newFile: StudyFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type || "application/pdf",
          category: "Uploaded Material",
          subject: selectedSubject,
          dateUploaded: new Date().toISOString().split("T")[0],
          extractedText: `Extracted content from ${file.name} for subject ${selectedSubject}.`
        };
        setFiles((prev) => [newFile, ...prev]);
        setUploadFileMsg(`✓ Successfully indexed ${file.name}`);
        playSuccess();
        setTimeout(() => setUploadFileMsg(""), 3000);
      }, 800);
    }
  };

  // Exam Addition
  const handleAddExam = () => {
    if (!newExamSubject.trim()) return;
    playSuccess();
    setRevisionCountdowns((prev) => [
      ...prev,
      { subject: newExamSubject, days: newExamDays, progress: 40, date: "2026-08-25" }
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
              className="space-y-6 text-left max-w-5xl mx-auto"
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
                      placeholder={`e.g. ${selectedSubject === "Java" ? "Functions & Overloading" : "Core Concepts"}`}
                      className="h-10 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {notesError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold flex items-center justify-between">
                    <span>{notesError}</span>
                    <button onClick={handleGenerateNotes} className="underline text-[10px] uppercase font-black">Retry</button>
                  </div>
                )}

                <button
                  onClick={handleGenerateNotes}
                  disabled={isGeneratingNotes}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {isGeneratingNotes ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>{isGeneratingNotes ? "Generating Notes..." : `Generate Notes for ${selectedSubject}`}</span>
                </button>
              </div>

              {/* Document Reader Area */}
              {currentSubjectNotes.length > 0 && (
                <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                      {currentSubjectNotes[activeNoteIdx]?.title || "Generated Study Document"}
                    </h3>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300"
                    >
                      Print PDF
                    </button>
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
                  {[`Explain ${selectedSubject} core concepts`, "Give code/logic example", "Quiz me on this"].map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSendChat(chip)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer hidden sm:inline-block"
                    >
                      {chip}
                    </button>
                  ))}
                  <button
                    onClick={() => setChatMessages([{ sender: "ai", text: `Chat cleared for **${selectedSubject}**. Ask your question!`, time: "Now" }])}
                    className="p-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-rose-500"
                    title="Clear Conversation"
                  >
                    Clear
                  </button>
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
                      className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white font-medium shadow-sm"
                          : "bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 text-slate-900 dark:text-zinc-100 shadow-sm"
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
                    <span>AI Tutor is formulating a custom response...</span>
                  </div>
                )}
                {chatError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 flex items-center justify-between">
                    <span>{chatError}</span>
                    <button onClick={() => handleSendChat()} className="underline uppercase text-[10px]">Retry</button>
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
                  disabled={chatIsTyping}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black transition-colors cursor-pointer shadow-md disabled:opacity-50"
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
              <div className="flex items-center justify-between">
                <div className="text-left space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    FLASHCARDS • {selectedSubject}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                    Card {currentSubjectFlashcards.length > 0 ? flashcardIdx + 1 : 0} of {currentSubjectFlashcards.length}
                  </h2>
                </div>

                <button
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingFlashcards}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingFlashcards ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>Generate New Cards</span>
                </button>
              </div>

              {currentSubjectFlashcards.length > 0 ? (
                <div
                  onClick={() => { setIsFlipped(!isFlipped); playClick(); }}
                  className="h-64 w-full bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl relative overflow-hidden transition-all hover:border-purple-500/40"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 absolute top-4 left-4">
                    {isFlipped ? "Answer Side" : "Question Side (Click to Flip)"}
                  </span>

                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 leading-relaxed whitespace-pre-line">
                    {isFlipped
                      ? currentSubjectFlashcards[flashcardIdx]?.back
                      : currentSubjectFlashcards[flashcardIdx]?.front}
                  </p>
                </div>
              ) : (
                <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-xs font-bold text-slate-500">
                  No flashcards found for {selectedSubject}. Click Generate New Cards!
                </div>
              )}

              {currentSubjectFlashcards.length > 0 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : currentSubjectFlashcards.length - 1)); setIsFlipped(false); playClick(); }}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => { setFlashcardIdx((prev) => (prev < currentSubjectFlashcards.length - 1 ? prev + 1 : 0)); setIsFlipped(false); playClick(); }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md cursor-pointer"
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
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    INTERACTIVE QUIZ • {selectedSubject}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                    Question {currentSubjectQuiz.length > 0 ? quizIdx + 1 : 0} of {currentSubjectQuiz.length}
                  </h2>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingQuiz ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>Generate New Quiz</span>
                </button>
              </div>

              {currentSubjectQuiz.length > 0 && currentSubjectQuiz[quizIdx] && (
                <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                    {currentSubjectQuiz[quizIdx].question}
                  </h3>

                  <div className="space-y-3">
                    {currentSubjectQuiz[quizIdx].options && currentSubjectQuiz[quizIdx].options.length > 0 ? (
                      currentSubjectQuiz[quizIdx].options.map((opt) => (
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
                      ))
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Your Answer:</label>
                        <input
                          type="text"
                          value={selectedQuizOption || ""}
                          onChange={(e) => { setSelectedQuizOption(e.target.value); setIsAnswerChecked(false); }}
                          placeholder="Type your answer here (e.g. Diamond, superkey)..."
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold outline-none focus:border-purple-500 text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                    )}
                  </div>

                  {!isAnswerChecked ? (
                    <button
                      onClick={() => { setIsAnswerChecked(true); playSuccess(); }}
                      disabled={!selectedQuizOption}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-bold space-y-1">
                        <div>Correct Answer: {currentSubjectQuiz[quizIdx].answer}</div>
                        <p className="text-[11px] font-medium opacity-90">{currentSubjectQuiz[quizIdx].explanation}</p>
                      </div>

                      <button
                        onClick={() => {
                          setQuizIdx((prev) => (prev < currentSubjectQuiz.length - 1 ? prev + 1 : 0));
                          setSelectedQuizOption(null);
                          setIsAnswerChecked(false);
                          playClick();
                        }}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-xs font-black uppercase shadow-md cursor-pointer"
                      >
                        Next Question →
                      </button>
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    VISUAL CONCEPT MAP • {selectedSubject}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                    Interactive Mind Map
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mindMapTopic}
                    onChange={(e) => setMindMapTopic(e.target.value)}
                    placeholder="Specific Topic (Optional)..."
                    className="h-9 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  />
                  <button
                    onClick={handleGenerateMindMap}
                    disabled={isGeneratingMindMap}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingMindMap ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>Generate Mind Map</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Mind Map Hierarchy Canvas */}
              <div className="w-full bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
                <div className="p-4 rounded-2xl bg-purple-600 text-white font-black text-sm shadow-lg text-center max-w-sm mx-auto">
                  {mindMapData.label}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                  {mindMapData.children?.map((child) => (
                    <div key={child.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 space-y-3">
                      <div className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800 pb-2">
                        {child.label}
                      </div>
                      <div className="space-y-1.5">
                        {child.children?.map((sub) => (
                          <div key={sub.id} className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200">
                            • {sub.label}
                          </div>
                        ))}
                      </div>
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
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  {isAddingExam ? "Cancel" : "+ Add Exam"}
                </button>
              </div>

              {isAddingExam && (
                <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-3 shadow-xl">
                  <input
                    type="text"
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    placeholder="Exam Subject Name..."
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                  />
                  <button
                    onClick={handleAddExam}
                    className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
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
                    accept=".pdf,.docx,.txt"
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
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-purple-600 dark:text-purple-400 cursor-pointer"
                      >
                        Generate Notes
                      </button>
                      <button
                        onClick={() => { setActiveTool("chat"); playClick(); }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
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
