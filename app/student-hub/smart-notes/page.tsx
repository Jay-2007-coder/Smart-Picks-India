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
  FileCode, Layers, UserCheck, Settings, Database, ArrowRight, Lightbulb
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ==============================================================================
// 1. DATA MODELS & SEED DATA
// ==============================================================================

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
}

interface QuizQuestion {
  id: string;
  type: "MCQ" | "TrueFalse" | "FillBlank";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface MindMapNode {
  id: string;
  label: string;
  expanded?: boolean;
  color?: string;
  children?: MindMapNode[];
}

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
    subject: "Database Management",
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
  },
  {
    id: "file-4",
    name: "OS_Bankers_Algorithm_Scan.jpg",
    size: "2.5 MB",
    type: "image/jpeg",
    category: "Handwritten Note",
    subject: "Operating Systems",
    dateUploaded: "2026-06-14",
    extractedText: "Banker's Algorithm uses: Available[m], Max[n][m], Allocation[n][m], Need[n][m]. Need = Max - Allocation. If Request <= Need and Request <= Available, pretend to allocate and run safety algorithm.",
    diagramsCount: 1,
    equationsCount: 4
  }
];

const SAMPLE_NOTES: GeneratedNote[] = [
  {
    id: "note-1",
    title: "Operating Systems - Deadlock Conditions",
    style: "One-Night Revision Notes",
    mode: "University Exam Mode",
    subject: "Operating Systems",
    content: "A Deadlock is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process in the set. For a deadlock to occur, four conditions must hold simultaneously in the system: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.",
    keyTakeaways: [
      "Deadlock requires 4 simultaneous conditions.",
      "Mutual exclusion: Resources cannot be shared.",
      "Circular wait: Interdependent wait chain exists.",
      "Can be handled via prevention, avoidance (Banker's), or detection & recovery."
    ],
    formulas: [
      "Need[i][j] = Max[i][j] - Allocation[i][j]",
      "Total resources = Allocated + Available"
    ]
  },
  {
    id: "note-2",
    title: "Database Management - 3NF and BCNF",
    style: "Short Notes",
    mode: "Competitive Exam Mode",
    subject: "Database Management",
    content: "3NF is designed to eliminate transitive dependencies. BCNF (Boyce-Codd Normal Form) is a stronger version of 3NF. A relation is in BCNF if for every functional dependency X -> Y, X is a superkey.",
    keyTakeaways: [
      "3NF eliminates transitive functional dependencies.",
      "BCNF is stronger: every determinant must be a candidate key.",
      "All BCNF relations are in 3NF, but not vice-versa."
    ]
  }
];

const SAMPLE_FLASHCARDS: Flashcard[] = [
  { id: "flash-1", front: "What are the 4 conditions of Deadlock?", back: "1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait", difficulty: "Hard", bookmarked: true },
  { id: "flash-2", front: "What is the formula for Banker's Algorithm Need Matrix?", back: "Need[i][j] = Max[i][j] - Allocation[i][j]", difficulty: "Medium", bookmarked: false },
  { id: "flash-3", front: "What is BCNF?", back: "A relation is in BCNF if for every functional dependency X -> Y, X is a candidate key / superkey.", difficulty: "Hard", bookmarked: false },
  { id: "flash-4", front: "TCP vs UDP: Which is connectionless?", back: "UDP (User Datagram Protocol)", difficulty: "Easy", bookmarked: true }
];

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: "q-1",
    type: "MCQ",
    question: "Which of the following deadlock handling methods uses the Banker's Algorithm?",
    options: ["Deadlock Prevention", "Deadlock Avoidance", "Deadlock Recovery", "Deadlock Detection"],
    answer: "Deadlock Avoidance",
    explanation: "Banker's Algorithm is a classic deadlock avoidance algorithm. It determines if allocating resources will lead to a safe state."
  },
  {
    id: "q-2",
    type: "TrueFalse",
    question: "A resource allocation graph containing a cycle always indicates a deadlock in systems with single-instance resources.",
    options: ["True", "False"],
    answer: "True",
    explanation: "If every resource type has exactly one instance, then a cycle in the resource allocation graph is a necessary and sufficient condition for deadlock."
  },
  {
    id: "q-3",
    type: "FillBlank",
    question: " Boyyce-Codd Normal Form (BCNF) requires that for every functional dependency X -> Y, X must be a ________.",
    answer: "superkey",
    explanation: "For a table to be in BCNF, in all functional dependencies (X -> Y), X must be a superkey or candidate key."
  }
];

const INITIAL_MIND_MAP: MindMapNode = {
  id: "root",
  label: "Operating System",
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
        { id: "pag", label: "Paging & Page Replacement" },
        { id: "seg", label: "Segmentation Partitioning" }
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

export default function SmartNotesGenerator() {
  const { user } = useAuth() as any;

  // Sound Synth States
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Layout Nav States
  const [activeTab, setActiveTab] = useState<"Notes" | "AI Chat" | "Flashcards" | "Quiz" | "Mind Map" | "Exam PYQ">("Notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Drag and Drop Upload States
  const [files, setFiles] = useState<StudyFile[]>(SAMPLE_FILES);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [fileParseMsg, setFileParseMsg] = useState("");
  const [ocrModalFile, setOcrModalFile] = useState<StudyFile | null>(null);

  // Syllabus & Custom target states
  const [customSyllabusText, setCustomSyllabusText] = useState("");

  // Modal Editing States
  const [modalFileName, setModalFileName] = useState("");
  const [modalCategory, setModalCategory] = useState<StudyFile["category"]>("Lecture Slides");
  const [modalSubject, setModalSubject] = useState("");
  const [modalDiagrams, setModalDiagrams] = useState(0);
  const [modalEquations, setModalEquations] = useState(0);
  const [modalExtractedText, setModalExtractedText] = useState("");

  // Sync modal local states on open
  useEffect(() => {
    if (ocrModalFile) {
      setModalFileName(ocrModalFile.name);
      setModalCategory(ocrModalFile.category);
      setModalSubject(ocrModalFile.subject);
      setModalDiagrams(ocrModalFile.diagramsCount);
      setModalEquations(ocrModalFile.equationsCount);
      setModalExtractedText(ocrModalFile.extractedText || "");
    }
  }, [ocrModalFile]);

  // Revision Form States
  const [newExamSubject, setNewExamSubject] = useState("");
  const [newExamDays, setNewExamDays] = useState(3);
  const [newExamProgress, setNewExamProgress] = useState(50);
  const [isAddingExam, setIsAddingExam] = useState(false);

  const handleAddExam = () => {
    if (!newExamSubject.trim()) return;
    playSuccess();
    setRevisionCountdowns(prev => [
      ...prev,
      { subject: newExamSubject, days: newExamDays, progress: newExamProgress }
    ]);
    setNewExamSubject("");
    setNewExamDays(3);
    setNewExamProgress(50);
    setIsAddingExam(false);
  };

  const handleRemoveExam = (subject: string) => {
    playClick();
    setRevisionCountdowns(prev => prev.filter(e => e.subject !== subject));
  };

  const saveOcrModalFileDetails = () => {
    if (!ocrModalFile) return;
    const updated: StudyFile = {
      ...ocrModalFile,
      name: modalFileName,
      category: modalCategory,
      subject: modalSubject,
      diagramsCount: modalDiagrams,
      equationsCount: modalEquations,
      extractedText: modalExtractedText
    };
    setFiles(prev => prev.map(f => f.id === ocrModalFile.id ? updated : f));
    setOcrModalFile(null);
    playSuccess();
  };

  // Notes Config Generator States
  const [noteStyle, setNoteStyle] = useState<string>("One-Night Revision Notes");
  const [noteMode, setNoteMode] = useState<string>("University Exam Mode");
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>(SAMPLE_NOTES);
  const [activeNoteIdx, setActiveNoteIdx] = useState(0);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Note editing states
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTakeaways, setEditTakeaways] = useState<string[]>([]);
  const [editFormulas, setEditFormulas] = useState<string[]>([]);

  // Editing Handlers
  const handleStartEdit = () => {
    if (generatedNotes.length === 0) return;
    const currentNote = generatedNotes[activeNoteIdx];
    setEditTitle(currentNote.title);
    setEditContent(currentNote.content);
    setEditTakeaways([...currentNote.keyTakeaways]);
    setEditFormulas([...(currentNote.formulas || [])]);
    setIsEditingNote(true);
    playClick();
  };

  const handleSaveEdit = () => {
    if (generatedNotes.length === 0) return;
    setGeneratedNotes((prev) => {
      const updated = [...prev];
      updated[activeNoteIdx] = {
        ...updated[activeNoteIdx],
        title: editTitle,
        content: editContent,
        keyTakeaways: editTakeaways.filter(t => t.trim() !== ""),
        formulas: editFormulas.filter(f => f.trim() !== "")
      };
      return updated;
    });
    setIsEditingNote(false);
    playSuccess();
  };

  const handleCancelEdit = () => {
    setIsEditingNote(false);
    playClick();
  };

  const handleAddTakeaway = () => {
    setEditTakeaways((prev) => [...prev, ""]);
    playClick();
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    setEditTakeaways((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleRemoveTakeaway = (index: number) => {
    setEditTakeaways((prev) => prev.filter((_, idx) => idx !== index));
    playClick();
  };

  const handleAddFormula = () => {
    setEditFormulas((prev) => [...prev, ""]);
    playClick();
  };

  const handleUpdateFormula = (index: number, val: string) => {
    setEditFormulas((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleRemoveFormula = (index: number) => {
    setEditFormulas((prev) => prev.filter((_, idx) => idx !== index));
    playClick();
  };

  const handleDeleteNote = (idxToDelete: number) => {
    playClick();
    setGeneratedNotes((prev) => {
      const updated = prev.filter((_, idx) => idx !== idxToDelete);
      if (activeNoteIdx >= updated.length && updated.length > 0) {
        setActiveNoteIdx(updated.length - 1);
      } else if (updated.length === 0) {
        setActiveNoteIdx(0);
      }
      return updated;
    });
    setIsEditingNote(false);
  };

  const handleCreateManualNote = () => {
    playClick();
    const newNote: GeneratedNote = {
      id: `note-${Date.now()}`,
      title: "New Custom Study Note",
      style: "Short Notes",
      mode: "Personal Mode",
      subject: selectedSubject === "All" ? "General Study" : selectedSubject,
      content: "Type your study notes here...",
      keyTakeaways: ["Add key takeaway points..."],
      formulas: []
    };
    setGeneratedNotes((prev) => [newNote, ...prev]);
    setActiveNoteIdx(0);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditTakeaways([...newNote.keyTakeaways]);
    setEditFormulas([...(newNote.formulas || [])]);
    setIsEditingNote(true);
  };

  const handleDeleteFile = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    setFiles((prev) => prev.filter((file) => file.id !== idToDelete));
  };

  // Chat Tutor States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    { sender: "ai", text: "Hello! I am your AI Study Companion. Ask me anything about Deadlocks, Database Normalization, or TCP/UDP.", time: "10:30 AM" }
  ]);
  const [chatIsTyping, setChatIsTyping] = useState(false);

  // Flashcard States
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SAMPLE_FLASHCARDS);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz States
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZ);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizTimer, setQuizTimer] = useState(60);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizRunning, setQuizRunning] = useState(false);
  const [quizTimerId, setQuizTimerId] = useState<any>(null);

  // Mind Map States
  const [mindMapData, setMindMapData] = useState<MindMapNode>(INITIAL_MIND_MAP);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDraggingMap = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Mind Map Connection Refs
  const rootRef = useRef<HTMLButtonElement>(null);
  const childRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [connections, setConnections] = useState<Array<{ d: string; color?: string }>>([]);

  const updateConnections = () => {
    if (!rootRef.current) return;
    const newConnections: Array<{ d: string; color?: string }> = [];
    const rootRect = rootRef.current.getBoundingClientRect();
    const parentContainer = rootRef.current.parentElement?.getBoundingClientRect();
    if (!parentContainer) return;

    const getRelativeCenter = (rect: DOMRect) => {
      return {
        x: (rect.left + rect.right) / 2 - parentContainer.left,
        y: (rect.top + rect.bottom) / 2 - parentContainer.top,
        top: rect.top - parentContainer.top,
        bottom: rect.bottom - parentContainer.top,
        left: rect.left - parentContainer.left,
        right: rect.right - parentContainer.left
      };
    };

    const rootCoords = getRelativeCenter(rootRect);

    if (mindMapData.expanded && mindMapData.children) {
      mindMapData.children.forEach((child) => {
        const childEl = childRefs.current[child.id];
        if (childEl) {
          const childRect = childEl.getBoundingClientRect();
          const childCoords = getRelativeCenter(childRect);
          
          // Draw curve from bottom of root to top of child
          const startX = rootCoords.x;
          const startY = rootCoords.bottom;
          const endX = childCoords.x;
          const endY = childCoords.top;
          
          const controlY1 = startY + (endY - startY) * 0.45;
          const controlY2 = startY + (endY - startY) * 0.45;
          
          const path = `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`;
          newConnections.push({ d: path, color: child.color || "#a855f7" });

          // Draw connections to grandchildren
          if (child.expanded && child.children) {
            child.children.forEach((grandchild) => {
              const gcEl = childRefs.current[grandchild.id];
              if (gcEl) {
                const gcRect = gcEl.getBoundingClientRect();
                const gcCoords = getRelativeCenter(gcRect);
                
                const gStartX = childCoords.x;
                const gStartY = childCoords.bottom;
                const gEndX = gcCoords.x;
                const gEndY = gcCoords.top;
                
                const gControlY1 = gStartY + (gEndY - gStartY) * 0.45;
                const gControlY2 = gStartY + (gEndY - gStartY) * 0.45;
                
                const gPath = `M ${gStartX} ${gStartY} C ${gStartX} ${gControlY1}, ${gEndX} ${gControlY2}, ${gEndX} ${gEndY}`;
                newConnections.push({ d: gPath, color: "#4b5563" });
              }
            });
          }
        }
      });
    }
    setConnections(newConnections);
  };

  useEffect(() => {
    if (activeTab === "Mind Map") {
      const timer = setTimeout(() => {
        updateConnections();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, mindMapData, zoomScale, panOffset]);

  useEffect(() => {
    if (activeTab === "Mind Map") {
      window.addEventListener("resize", updateConnections);
      return () => window.removeEventListener("resize", updateConnections);
    }
  }, [activeTab, mindMapData]);

  // Revision Scheduler States
  const [revisionPlanDays, setRevisionPlanDays] = useState<number>(3);
  const [revisionCountdowns, setRevisionCountdowns] = useState([
    { subject: "Operating Systems", days: 3, progress: 60 },
    { subject: "Database Management", days: 7, progress: 45 },
    { subject: "Computer Networks", days: 12, progress: 20 }
  ]);

  // Dynamic Subject List computation
  const subjectList = useMemo(() => {
    const defaults = ["Operating Systems", "Database Management", "Computer Networks"];
    const fromFiles = files.map(f => f.subject).filter(Boolean);
    const fromRevisions = revisionCountdowns.map(r => r.subject).filter(Boolean);
    const set = new Set([...defaults, ...fromFiles, ...fromRevisions]);
    return Array.from(set);
  }, [files, revisionCountdowns]);

  // Streak & Savings Stats
  const [streakDays, setStreakDays] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStreak = localStorage.getItem("smartpicks_student_streak");
      if (savedStreak) setStreakDays(parseInt(savedStreak));
    }
  }, []);

  const timeSavedHours = Math.round(((files.length * 0.5) + (generatedNotes.length * 0.8)) * 10) / 10;
  const subjectProgress = files.length > 0 
    ? Math.min(100, Math.round((generatedNotes.length / (files.length * 2)) * 100)) 
    : 0;

  const upcomingExam = revisionCountdowns.length > 0
    ? revisionCountdowns.reduce((prev, curr) => prev.days < curr.days ? prev : curr)
    : null;

  // Semantic Search spotlight pos
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Audio Synth triggers
  const playSound = (freq: number, type: "sine" | "triangle" | "sawtooth", duration: number, volume: number = 0.05) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Silent catch
    }
  };

  const playClick = () => playSound(550, "sine", 0.08, 0.03);
  const playSuccess = () => {
    playSound(440, "sine", 0.1, 0.04);
    setTimeout(() => playSound(554.37, "sine", 0.1, 0.04), 100);
    setTimeout(() => playSound(659.25, "sine", 0.2, 0.04), 200);
  };
  const playFlip = () => playSound(350, "triangle", 0.15, 0.04);
  const playConfetti = () => {
    playSound(523.25, "sine", 0.12, 0.03);
    setTimeout(() => playSound(659.25, "sine", 0.12, 0.03), 80);
    setTimeout(() => playSound(783.99, "sine", 0.3, 0.03), 160);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileUpload(droppedFiles[0]);
    }
  };

  const triggerLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      handleFileUpload(selected[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    playClick();
    setUploadedFileName(file.name);
    setUploadProgress(10);
    setFileParseMsg("Reading file contents...");

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    let extracted = "";

    try {
      if (ext === "txt") {
        setUploadProgress(40);
        extracted = await file.text();
        setUploadProgress(80);
      } else if (ext === "pdf") {
        setUploadProgress(30);
        setFileParseMsg("Loading PDF engine...");
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        
        const buf = await file.arrayBuffer();
        setUploadProgress(50);
        setFileParseMsg("Parsing PDF text...");
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        let full = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          setFileParseMsg(`Parsing page ${i}/${pdf.numPages}...`);
          const pg = await pdf.getPage(i);
          const ct = await pg.getTextContent();
          full += ct.items.map((x: any) => x.str).join(" ") + "\n";
          setUploadProgress(50 + Math.floor((i / pdf.numPages) * 40));
        }
        extracted = full.trim();
      } else if (ext === "docx") {
        setUploadProgress(30);
        setFileParseMsg("Loading DOCX engine...");
        const mammoth = await import("mammoth");
        const buf = await file.arrayBuffer();
        setUploadProgress(60);
        setFileParseMsg("Parsing Word document...");
        const out = await mammoth.extractRawText({ arrayBuffer: buf });
        extracted = out.value.trim();
        setUploadProgress(90);
      } else {
        extracted = `Non-text file context: ${file.name}. (Check OCR or type content outline manually).`;
        setUploadProgress(80);
      }

      setUploadProgress(100);
      setTimeout(() => {
        const newFile: StudyFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          size: sizeStr,
          type: file.type || `application/${ext}`,
          category: ext === "pdf" ? "Reference PDF" : "Lecture Slides",
          subject: selectedSubject === "All" ? "General Study" : selectedSubject,
          dateUploaded: new Date().toISOString().split("T")[0],
          extractedText: extracted || `Empty text extracted from ${file.name}`,
          diagramsCount: Math.floor(Math.random() * 3),
          equationsCount: Math.floor(Math.random() * 4)
        };
        setFiles(prev => [newFile, ...prev]);
        setUploadProgress(null);
        setUploadedFileName("");
        setFileParseMsg("");
        setOcrModalFile(newFile);
        playSuccess();
      }, 400);
    } catch (err: any) {
      console.error(err);
      setUploadProgress(null);
      setUploadedFileName("");
      setFileParseMsg("");
      alert("Failed to parse file: " + (err.message || err));
    }
  };

  const triggerNotesGeneration = async () => {
    if (isGeneratingNotes) return;
    playClick();
    setIsGeneratingNotes(true);

    try {
      const filesContext = files
        .filter(f => selectedSubject === "All" || f.subject === selectedSubject)
        .map(f => f.extractedText)
        .filter(Boolean)
        .join("\n\n")
        .substring(0, 15000);

      const response = await fetch("/api/v1/student-hub/smart-notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject === "All" ? "General Study" : selectedSubject,
          style: noteStyle,
          mode: noteMode,
          filesContext,
          customSyllabusText
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const newNote: GeneratedNote = {
          id: `note-${Date.now()}`,
          title: data.note.title || `${selectedSubject} Revision Notes`,
          style: noteStyle,
          mode: noteMode,
          subject: selectedSubject === "All" ? "General Study" : selectedSubject,
          content: data.note.content,
          keyTakeaways: data.note.keyTakeaways || [],
          formulas: data.note.formulas || []
        };
        setGeneratedNotes(prev => [newNote, ...prev]);
        setActiveNoteIdx(0);
        setIsEditingNote(false);
        playSuccess();
      } else {
        alert(data.message || "Failed to generate AI notes. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Network error: " + (err.message || err));
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const sendChatMessage = async (textStr?: string) => {
    const targetText = textStr || chatInput;
    if (!targetText.trim() || chatIsTyping) return;
    playClick();

    const newMsgs = [...chatMessages, { sender: "user" as const, text: targetText, time: "Now" }];
    setChatMessages(newMsgs);
    setChatInput("");
    setChatIsTyping(true);

    try {
      const filesContext = files
        .filter(f => selectedSubject === "All" || f.subject === selectedSubject)
        .map(f => f.extractedText)
        .filter(Boolean)
        .join("\n\n")
        .substring(0, 15000);

      const history = chatMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/v1/student-hub/smart-notes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: targetText,
          history,
          filesContext,
          subject: selectedSubject === "All" ? "General Study" : selectedSubject
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setChatMessages(prev => [...prev, { sender: "ai" as const, text: data.reply, time: "Now" }]);
        playSuccess();
      } else {
        setChatMessages(prev => [...prev, { sender: "ai" as const, text: "⚠️ " + (data.message || "Failed to receive AI response."), time: "Now" }]);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: "ai" as const, text: "⚠️ Network error connecting to AI tutor.", time: "Now" }]);
    } finally {
      setChatIsTyping(false);
    }
  };

  const generateAiFlashcards = async () => {
    if (isGeneratingFlashcards) return;
    playClick();
    setIsGeneratingFlashcards(true);

    try {
      const filesContext = files
        .filter(f => selectedSubject === "All" || f.subject === selectedSubject)
        .map(f => f.extractedText)
        .filter(Boolean)
        .join("\n\n")
        .substring(0, 15000);

      const response = await fetch("/api/v1/student-hub/smart-notes/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject === "All" ? "General Study" : selectedSubject,
          filesContext
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.flashcards && data.flashcards.length > 0) {
          const cards = data.flashcards.map((c: any, index: number) => ({
            id: `flash-${Date.now()}-${index}`,
            front: c.front,
            back: c.back,
            difficulty: c.difficulty || "Medium",
            bookmarked: false
          }));
          setFlashcards(cards);
          setFlashcardIdx(0);
          setIsFlipped(false);
          playSuccess();
        } else {
          alert("No flashcards returned from AI.");
        }
      } else {
        alert(data.message || "Failed to generate flashcards.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Network error: " + (err.message || err));
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const generateAiQuiz = async () => {
    if (isGeneratingQuiz) return;
    playClick();
    setIsGeneratingQuiz(true);

    try {
      const filesContext = files
        .filter(f => selectedSubject === "All" || f.subject === selectedSubject)
        .map(f => f.extractedText)
        .filter(Boolean)
        .join("\n\n")
        .substring(0, 15000);

      const response = await fetch("/api/v1/student-hub/smart-notes/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject === "All" ? "General Study" : selectedSubject,
          filesContext
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.quiz && data.quiz.length > 0) {
          const questions = data.quiz.map((q: any, index: number) => ({
            id: `q-${Date.now()}-${index}`,
            type: q.type || "MCQ",
            question: q.question,
            options: q.options || (q.type === "TrueFalse" ? ["True", "False"] : undefined),
            answer: q.answer,
            explanation: q.explanation || "No explanation provided."
          }));
          setQuizQuestions(questions);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setQuizRunning(false);
          playSuccess();
        } else {
          alert("No quiz questions returned from AI.");
        }
      } else {
        alert(data.message || "Failed to generate quiz.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Network error: " + (err.message || err));
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Quiz Timer control
  useEffect(() => {
    if (!quizRunning) return;
    const interval = setInterval(() => {
      setQuizTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setQuizRunning(false);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizRunning]);

  const startQuiz = () => {
    playClick();
    setQuizAnswers({});
    setQuizTimer(60);
    setQuizSubmitted(false);
    setQuizRunning(true);
  };

  const submitQuiz = () => {
    playConfetti();
    setQuizRunning(false);
    setQuizSubmitted(true);

    // trigger canvas confetti if score matches
    try {
      import("canvas-confetti").then((m) => {
        m.default({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      });
    } catch {}
  };

  // Mind Map Interactive Nodes
  const toggleMapNode = (node: MindMapNode, id: string): MindMapNode => {
    if (node.id === id) {
      return { ...node, expanded: !node.expanded };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map((c) => toggleMapNode(c, id))
      };
    }
    return node;
  };

  const handleNodeClick = (nodeId: string) => {
    playClick();
    setMindMapData((prev) => toggleMapNode(prev, nodeId));
  };

  // Mind Map mouse drag/pan handlers
  const handleMapMouseDown = (e: React.MouseEvent) => {
    isDraggingMap.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMap.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMapMouseUp = () => {
    isDraggingMap.current = false;
  };

  // Filtered Files list
  const filteredFiles = useMemo(() => {
    let pool = files;
    if (selectedSubject !== "All") {
      pool = pool.filter((f) => f.subject === selectedSubject);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter((f) => f.name.toLowerCase().includes(q) || f.extractedText?.toLowerCase().includes(q));
    }
    return pool;
  }, [files, selectedSubject, searchQuery]);

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-[#09090B] text-slate-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col font-sans antialiased relative overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.05) 0%, transparent 55%)`
      }}
    >
      {/* Animated glowing backdrop bubbles */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-3xl pointer-events-none animate-pulse" />

      {/* ──────────────────────────────────────────────────────────────────────────────
          1. STICKY NAVBAR
          ────────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-zinc-950/60 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/student-hub"
              onClick={playClick}
              className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-xl transition-all active:scale-95 animate-fadeIn"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-purple-500 tracking-widest">
                AI Workspace
              </span>
              <span className="text-sm font-extrabold text-zinc-100">Smart Notes OS</span>
            </div>
          </div>

          {/* Quick Stats Search Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl max-w-xs focus-within:border-purple-500/50 transition-all duration-300">
              <Search className="h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all files & notes..." 
                className="bg-transparent border-none outline-none text-xs text-zinc-300 placeholder:text-zinc-650 font-semibold"
              />
            </div>

            {/* Streaks */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-xl">
              <Activity className="h-4 w-4 text-purple-500 animate-pulse" />
              <span className="text-xs font-black text-purple-500">{streakDays} Day Streak</span>
            </div>

            {/* Time saved */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 rounded-xl">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-black text-indigo-500">{timeSavedHours} Hrs Saved</span>
            </div>

            {/* Mute button */}
            <button 
              onClick={() => { setSoundEnabled(!soundEnabled); playClick(); }}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-purple-500" /> : <VolumeX className="h-4 w-4" />}
            </button>


          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ──────────────────────────────────────────────────────────────────────────────
            2. HERO STATISTICS SECTION
            ────────────────────────────────────────────────────────────────────────────── */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Study Streak */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Study Streak</h4>
                <p className="text-2xl font-black text-zinc-100 mt-1">{streakDays} Days</p>
              </div>
              <Trophy className="h-5 w-5 text-purple-500 fill-purple-500" />
            </div>
            <p className="text-[10px] text-zinc-400 font-bold">
              {user ? `${streakDays} consecutive revision days logged!` : "Sign in to log revision days"}
            </p>
          </div>

          {/* Time saved */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Time Saved by AI</h4>
                <p className="text-2xl font-black text-zinc-100 mt-1">{timeSavedHours} Hours</p>
              </div>
              <Clock className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-[10px] text-zinc-400 font-bold">
              {user ? "Based on PDF scans and recording transcriptions." : "Sign in to save study hours"}
            </p>
          </div>

          {/* Subject progress */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Subject Progress</h4>
                <p className="text-2xl font-black text-zinc-100 mt-1">{subjectProgress}% Completion</p>
              </div>
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="w-full">
              <div className="w-full bg-zinc-850 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full" style={{ width: `${subjectProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Upcoming Exam Countdown */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Upcoming Exam</h4>
                <p className="text-lg font-black text-zinc-100 mt-1">{upcomingExam ? upcomingExam.subject : "No exam scheduled"}</p>
              </div>
              <Calendar className="h-5 w-5 text-rose-500" />
            </div>
            {upcomingExam ? (
              <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 max-w-fit animate-pulse-scale">
                {upcomingExam.days} days remaining
              </div>
            ) : (
              <div className="text-[10px] font-bold text-zinc-550 bg-zinc-950/40 px-2.5 py-1 rounded-lg border border-zinc-800 max-w-fit">
                Add revision exams below
              </div>
            )}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────────────
            3. THREE COLUMN WORKSPACE LAYOUT
            ────────────────────────────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* COLUMN 1: LEFT SIDEBAR (FILE UPLOAD SYSTEM & SELECTORS) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-5">
              <h3 className="text-xs font-black uppercase text-purple-500 tracking-wider flex items-center gap-1.5 pb-3 border-b border-zinc-800">
                <UploadCloud className="h-4 w-4" /> Study desk files
              </h3>

              {/* Subject Tag Selector */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Select Subject Filter</label>
                <div className="flex flex-wrap gap-1.5">
                  {["All", ...subjectList].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => { playClick(); setSelectedSubject(sub); }}
                      className={`py-1 px-2 text-[9px] font-black rounded-lg border transition-all cursor-pointer truncate max-w-[120px] ${
                        selectedSubject === sub
                          ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                          : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {sub === "Database Management" ? "DBMS" : sub === "Computer Networks" ? "Networks" : sub === "Operating Systems" ? "OS" : sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag and drop upload zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDropFile}
                className="border-2 border-dashed border-zinc-800 hover:border-purple-500/50 bg-zinc-950/50 rounded-2xl p-6 text-center transition-colors relative cursor-pointer group"
              >
                <input 
                  type="file" 
                  id="file-upload-input" 
                  onChange={triggerLocalUpload}
                  className="hidden" 
                />
                <label htmlFor="file-upload-input" className="cursor-pointer space-y-2.5 block">
                  <UploadCloud className="h-8 w-8 text-zinc-650 group-hover:text-purple-500 mx-auto transition-colors" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-350">Drag files here or click to browse</p>
                    <p className="text-[9px] text-zinc-500 font-semibold">Supports PDF, DOCX, Slides, handwritten scans, Audio, and Video files</p>
                  </div>
                </label>

                {/* Upload Progress Bar animation */}
                {uploadProgress !== null && (
                  <div className="absolute inset-0 bg-zinc-950/90 rounded-2xl flex flex-col justify-center p-4 space-y-2 z-10 animate-fadeIn">
                    <div className="flex justify-between text-[10px] font-bold text-purple-500">
                      <span className="truncate max-w-[120px]">{uploadedFileName}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-850 rounded-full h-2 overflow-hidden border border-zinc-800">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-[8px] text-zinc-500 font-semibold">{fileParseMsg || "AI Extracting OCR & Audio timestamps..."}</span>
                  </div>
                )}
              </div>

              {/* File items list */}
              <div className="space-y-2.5 border-t border-zinc-800 pt-4">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Uploaded Files ({filteredFiles.length})</label>
                
                {filteredFiles.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 font-semibold py-2 text-center">No files in subject tag.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredFiles.map((file) => {
                      const isPdf = file.name.endsWith(".pdf");
                      const isAudio = file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav");
                      const isImage = file.type.startsWith("image/") || file.name.endsWith(".jpg") || file.name.endsWith(".png");

                      return (
                        <div 
                          key={file.id} 
                          className="p-3 bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/30 backdrop-blur-md rounded-2xl flex items-center justify-between gap-3 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                          onClick={() => { playClick(); setOcrModalFile(file); }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <div className="flex items-center gap-3 truncate relative z-10">
                            <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                              isPdf ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              isAudio ? "bg-amber-500/10 text-amber-455 border border-amber-500/20" :
                              isImage ? "bg-blue-500/10 text-blue-450 border border-blue-500/20" :
                              "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="text-[10px] font-extrabold text-zinc-200 group-hover:text-purple-400 transition-colors truncate">{file.name}</span>
                              <span className="text-[8px] text-zinc-500 font-bold flex items-center gap-1.5 mt-0.5">
                                <span>{file.size}</span>
                                <span className="h-1 w-1 rounded-full bg-zinc-800" />
                                <span className="text-purple-450">{file.category}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 relative z-10">
                            <button
                              onClick={(e) => handleDeleteFile(file.id, e)}
                              className="p-1.5 border border-transparent hover:border-zinc-800 hover:bg-zinc-950 text-zinc-550 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-650 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: CENTER WORKSPACE PANEL (AI CORE MODULES) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Selector Navigation Header */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-1.5 flex flex-wrap gap-1">
              {(["Notes", "AI Chat", "Flashcards", "Quiz", "Mind Map", "Exam PYQ"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { playClick(); setActiveTab(tab); }}
                  className={`flex-1 min-w-[80px] py-2 px-1 text-[10px] font-black rounded-2xl text-center uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/10"
                      : "text-zinc-400 hover:text-zinc-200 bg-transparent hover:bg-zinc-800/40"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTAINER CONTENT WORKSPACES */}
            <AnimatePresence mode="wait">
              
              {/* MODULE 3: SMART NOTES GENERATOR TAB */}
              {activeTab === "Notes" && (
                <motion.div
                  key="notes-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Notes Configuration board */}
                  <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 space-y-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          Smart notes config
                        </span>
                        <h2 className="text-xl font-black text-zinc-100 tracking-tight pt-2">Notes Generator</h2>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">Subject: {selectedSubject === "All" ? "Operating Systems" : selectedSubject}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Notes Styles Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Note Style</label>
                        <select 
                          value={noteStyle}
                          onChange={(e) => setNoteStyle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/50"
                        >
                          <option value="Short Notes">Short Notes</option>
                          <option value="Detailed Notes">Detailed Notes</option>
                          <option value="One-Night Revision Notes">One-Night Revision Notes</option>
                          <option value="Bullet Point Notes">Bullet Point Notes</option>
                          <option value="Definitions and Formulas">Definitions & Formulas</option>
                        </select>
                      </div>

                      {/* Difficulty Modes selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Difficulty Mode</label>
                        <select 
                          value={noteMode}
                          onChange={(e) => setNoteMode(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/50"
                        >
                          <option value="Beginner Mode">Beginner Mode</option>
                          <option value="Intermediate Mode">Intermediate Mode</option>
                          <option value="Advanced Mode">Advanced Mode</option>
                          <option value="University Exam Mode">University Exam Mode</option>
                          <option value="Competitive Exam Mode">Competitive Exam Mode</option>
                        </select>
                      </div>
                    </div>

                    {/* Syllabus Focus Textarea */}
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Syllabus / Custom Topics Focus</label>
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Optional Guidance</span>
                      </div>
                      <textarea
                        value={customSyllabusText}
                        onChange={(e) => setCustomSyllabusText(e.target.value)}
                        placeholder="Paste your exam syllabus modules, target question list, or specific concepts to guide note generation..."
                        rows={3}
                        className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/50 resize-y"
                      />
                    </div>

                    <button
                      onClick={triggerNotesGeneration}
                      disabled={isGeneratingNotes}
                      className="w-full relative flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-purple-500/10 active:scale-[0.98] cursor-pointer"
                    >
                      {isGeneratingNotes ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Structuring exam formulas...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 fill-white" /> Generate notes from files
                        </>
                      )}
                    </button>
                  </div>

                  {/* Generated Notes list desk */}
                  <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-purple-500" /> Active notes ({generatedNotes.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {generatedNotes.map((n, idx) => (
                            <button
                              key={n.id}
                              onClick={() => { playClick(); setActiveNoteIdx(idx); setIsEditingNote(false); }}
                              className={`h-6 w-6 rounded-lg font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                                activeNoteIdx === idx
                                  ? "bg-purple-500 text-white"
                                  : "bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-zinc-700"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
                          <button
                            onClick={handleCreateManualNote}
                            className="p-1 bg-zinc-950 border border-zinc-805 hover:border-zinc-700 text-purple-400 hover:text-purple-300 rounded-lg text-xs font-black cursor-pointer flex items-center justify-center"
                            title="Create Custom Note"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          {generatedNotes.length > 0 && !isEditingNote && (
                            <>
                              <button
                                onClick={handleStartEdit}
                                className="p-1 bg-zinc-950 border border-zinc-805 hover:border-zinc-700 text-amber-500 hover:text-amber-400 rounded-lg text-xs font-black cursor-pointer flex items-center justify-center"
                                title="Edit Active Note"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(activeNoteIdx)}
                                className="p-1 bg-zinc-950 border border-zinc-805 hover:border-zinc-700 text-rose-500 hover:text-rose-400 rounded-lg text-xs font-black cursor-pointer flex items-center justify-center"
                                title="Delete Active Note"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {generatedNotes.length > 0 ? (
                      isEditingNote ? (
                        <div className="space-y-4 animate-fadeIn">
                          {/* Title edit */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Note Title</label>
                            <input 
                              type="text" 
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/50"
                              placeholder="Note Title"
                            />
                          </div>

                          {/* Content edit */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Content</label>
                              <span className="text-[9px] text-zinc-500 font-bold">{editContent.length} chars</span>
                            </div>
                            <textarea 
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={8}
                              className="w-full bg-zinc-950/70 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/50 resize-y animate-none"
                              placeholder="Type notes body here..."
                            />
                            {/* Formatting helper toolbar */}
                            <div className="flex flex-wrap items-center gap-1 bg-zinc-950/80 p-1.5 border border-zinc-800/60 rounded-xl">
                              <span className="text-[8px] font-black text-zinc-500 uppercase px-1.5">Quick Insert:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  playClick();
                                  setEditContent(prev => prev + (prev.endsWith("\n") || prev === "" ? "" : "\n") + "### [Section Title]\n");
                                }}
                                className="px-2 py-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-[9px] font-black uppercase tracking-wider text-zinc-300 rounded-lg transition-colors cursor-pointer"
                              >
                                Heading
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playClick();
                                  setEditContent(prev => prev + (prev.endsWith("\n") || prev === "" ? "" : "\n") + "- Bullet point detail...\n");
                                }}
                                className="px-2 py-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-[9px] font-black uppercase tracking-wider text-zinc-300 rounded-lg transition-colors cursor-pointer"
                              >
                                Bullet List
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playClick();
                                  setEditContent(prev => prev + (prev.endsWith("\n") || prev === "" ? "" : "\n") + "```javascript\n// Write code here\n```\n");
                                }}
                                className="px-2 py-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-[9px] font-mono text-zinc-300 rounded-lg transition-colors cursor-pointer"
                              >
                                Code Block
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playClick();
                                  setEditContent(prev => prev + (prev.endsWith("\n") || prev === "" ? "" : "\n") + "[Formula: e = mc^2]\n");
                                }}
                                className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[9px] font-black uppercase tracking-wider text-purple-400 rounded-lg transition-all cursor-pointer"
                              >
                                + Formula Math
                              </button>
                            </div>
                          </div>

                          {/* Key takeaways edit */}
                          <div className="p-4 bg-zinc-950/60 border border-zinc-855 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                              <strong className="text-[10px] font-black uppercase text-purple-500 tracking-wider flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Key Takeaways
                              </strong>
                              <button
                                onClick={handleAddTakeaway}
                                className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-[9px] font-bold text-purple-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <Plus className="h-3 w-3" /> Add Point
                              </button>
                            </div>
                            <div className="space-y-2">
                              {editTakeaways.map((take, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input 
                                    type="text" 
                                    value={take}
                                    onChange={(e) => handleUpdateTakeaway(idx, e.target.value)}
                                    className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-350 outline-none focus:border-purple-500/50"
                                    placeholder={`Takeaway point #${idx + 1}`}
                                  />
                                  <button
                                    onClick={() => handleRemoveTakeaway(idx)}
                                    className="p-1.5 border border-zinc-800 hover:border-rose-500/30 text-zinc-500 hover:text-rose-500 bg-zinc-950 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                              {editTakeaways.length === 0 && (
                                <p className="text-[10px] text-zinc-500 italic">No takeaways added yet.</p>
                              )}
                            </div>
                          </div>

                          {/* Equations/formulas edit */}
                          <div className="p-4 bg-purple-500/[0.02] border border-purple-500/10 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                              <strong className="text-[10px] font-black uppercase text-purple-500 tracking-wider flex items-center gap-1">
                                <Database className="h-3.5 w-3.5" /> Equations & Concepts
                              </strong>
                              <button
                                onClick={handleAddFormula}
                                className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-[9px] font-bold text-purple-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <Plus className="h-3 w-3" /> Add Formula
                              </button>
                            </div>
                            <div className="space-y-2">
                              {editFormulas.map((form, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input 
                                    type="text" 
                                    value={form}
                                    onChange={(e) => handleUpdateFormula(idx, e.target.value)}
                                    className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-350 outline-none focus:border-purple-500/50"
                                    placeholder={`Formula / Concept #${idx + 1}`}
                                  />
                                  <button
                                    onClick={() => handleRemoveFormula(idx)}
                                    className="p-1.5 border border-zinc-800 hover:border-rose-500/30 text-zinc-500 hover:text-rose-500 bg-zinc-950 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                              {editFormulas.length === 0 && (
                                <p className="text-[10px] text-zinc-500 italic">No formulas added yet.</p>
                              )}
                            </div>
                          </div>

                          {/* Save / Cancel buttons */}
                          <div className="flex gap-2 justify-end border-t border-zinc-800 pt-3">
                            <button
                              onClick={handleSaveEdit}
                              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                            >
                              <Check className="h-3.5 w-3.5" /> Save Note
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-fadeIn">
                          <div>
                            <h4 className="text-sm font-extrabold text-zinc-100">{generatedNotes[activeNoteIdx].title}</h4>
                            <span className="inline-block text-[8px] font-black uppercase text-purple-500 mt-1 px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded">
                              {generatedNotes[activeNoteIdx].style} • {generatedNotes[activeNoteIdx].mode}
                            </span>
                          </div>

                          <div className="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed font-semibold space-y-3 text-left">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => <h1 className="text-sm font-black mt-4 mb-2 text-white uppercase tracking-wide border-b border-zinc-850 pb-1">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xs font-black mt-3 mb-1.5 text-white uppercase tracking-wide">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xs font-bold mt-2.5 mb-1 text-purple-400">{children}</h3>,
                                p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-300">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2.5 space-y-1 text-zinc-300">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2.5 space-y-1 text-zinc-300">{children}</ol>,
                                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
                                code: ({ children }) => <code className="bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-purple-400">{children}</code>
                              }}
                            >
                              {generatedNotes[activeNoteIdx].content}
                            </ReactMarkdown>
                          </div>

                          {/* Key takeaways list */}
                          {generatedNotes[activeNoteIdx].keyTakeaways && generatedNotes[activeNoteIdx].keyTakeaways.length > 0 && (
                            <div className="p-4 bg-zinc-950/60 border border-zinc-855 rounded-2xl space-y-2 text-left">
                              <strong className="text-[10px] font-black uppercase text-purple-500 tracking-wider flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Key Takeaways
                              </strong>
                              <ul className="list-disc list-inside text-[10px] text-zinc-400 font-semibold space-y-1.5 pl-1">
                                {generatedNotes[activeNoteIdx].keyTakeaways.map((take, idx) => (
                                  <li key={idx}>{take}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Equations / formulas if present */}
                          {generatedNotes[activeNoteIdx].formulas && generatedNotes[activeNoteIdx].formulas.length > 0 && (
                            <div className="p-4 bg-purple-500/[0.02] border border-purple-500/10 rounded-2xl space-y-2 text-left">
                              <strong className="text-[10px] font-black uppercase text-purple-500 tracking-wider flex items-center gap-1">
                                <Database className="h-3.5 w-3.5" /> Equations & Concepts
                              </strong>
                              <div className="flex flex-wrap gap-2">
                                {generatedNotes[activeNoteIdx].formulas?.map((form, idx) => (
                                  <code key={idx} className="bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-lg text-[10px] font-mono text-zinc-300">
                                    {form}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 space-y-3">
                        <p className="text-xs text-zinc-550 text-center">No study notes generated yet. Upload files and configure the style above, or create a note manually!</p>
                        <button
                          onClick={handleCreateManualNote}
                          className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Create Note Manually
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* MODULE 4: AI TUTOR CONVERSATIONAL CHAT TAB */}
              {activeTab === "AI Chat" && (
                <motion.div
                  key="chat-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 flex flex-col h-[480px] justify-between relative"
                >
                  <div className="space-y-1 pb-3 border-b border-zinc-800">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      Context chat tutor
                    </span>
                    <h2 className="text-base font-black text-zinc-100 tracking-tight pt-1">Ask Your Notes</h2>
                  </div>

                  {/* Chat messages desk */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                        <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed text-left ${
                          msg.sender === "user"
                            ? "bg-purple-500 text-white"
                            : "bg-zinc-950 border border-zinc-850 text-zinc-300"
                        }`}>
                          {msg.sender === "user" ? (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                          ) : (
                            <div className="prose prose-invert max-w-none space-y-2">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ children }) => <h1 className="text-xs font-black mt-2 mb-1 text-white uppercase tracking-wide">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-xs font-black mt-2 mb-1 text-white uppercase tracking-wide">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-xs font-bold mt-1.5 mb-1 text-purple-400">{children}</h3>,
                                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-zinc-300">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-zinc-300">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-zinc-300">{children}</ol>,
                                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                  strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
                                  code: ({ children }) => <code className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-[10px] font-mono text-purple-400">{children}</code>
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatIsTyping && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-3 text-xs text-zinc-500 animate-pulse font-bold flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> AI Tutor simplifying concept...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick questions suggestions */}
                  <div className="flex flex-wrap gap-1.5 pb-3">
                    {[
                      "Explain Deadlock like I am 10 years old.",
                      "Summarize OS in 5 points.",
                      "Paging vs Segmentation?",
                      "Give real-world deadlock examples."
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => sendChatMessage(q)}
                        className="px-2.5 py-1 bg-zinc-950 border border-zinc-850 hover:border-purple-500/30 text-[9px] font-bold text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input form */}
                  <div className="flex gap-2 border-t border-zinc-800 pt-3">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                      placeholder="Ask the AI Tutor anything from notes..." 
                      className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={() => sendChatMessage()}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> Ask
                    </button>
                  </div>
                </motion.div>
              )}

              {/* MODULE 5: FLASHCARDS TAB */}
              {activeTab === "Flashcards" && (
                <motion.div
                  key="flashcards-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-neutral-900/35 border border-white/5 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between min-h-[320px] relative overflow-hidden group hover:border-purple-500/25 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-650/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          Card {flashcardIdx + 1} / {flashcards.length}
                        </span>
                        <button
                          onClick={generateAiFlashcards}
                          disabled={isGeneratingFlashcards}
                          className="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                        >
                          {isGeneratingFlashcards ? (
                            <>
                              <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-2.5 w-2.5 fill-white" /> Generate AI Flashcards
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          playClick();
                          setFlashcards(prev => prev.map((c, i) => i === flashcardIdx ? { ...c, bookmarked: !c.bookmarked } : c));
                        }}
                        className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                          flashcards[flashcardIdx].bookmarked
                            ? "border-purple-500/30 bg-purple-500/15 text-purple-450"
                            : "border-zinc-800 bg-zinc-950 text-zinc-550 hover:text-zinc-300"
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Flipping card container */}
                    <div 
                      onClick={() => { playFlip(); setIsFlipped(!isFlipped); }}
                      className="flex-1 flex items-center justify-center py-8 cursor-pointer relative z-10"
                      style={{ perspective: "1000px" }}
                    >
                      <div 
                        className="w-full max-w-sm min-h-[150px] rounded-2xl border border-zinc-800/80 bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center shadow-2xl transition-transform duration-500 relative"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                        }}
                      >
                        {/* Front Side */}
                        <div 
                          className="absolute inset-0 flex flex-col items-center justify-center p-4 backface-hidden"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <span className="text-[8px] font-black uppercase text-zinc-500 mb-2">Question</span>
                          <p className="text-sm font-extrabold text-zinc-200 leading-relaxed">
                            {flashcards[flashcardIdx].front}
                          </p>
                          <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest mt-4 opacity-50 animate-pulse">Click to Reveal Answer</span>
                        </div>

                        {/* Back Side */}
                        <div 
                          className="absolute inset-0 flex flex-col items-center justify-center p-4 backface-hidden bg-purple-500/[0.03]"
                          style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)"
                          }}
                        >
                          <span className="text-[8px] font-black uppercase text-purple-500 mb-2">Answer</span>
                          <p className="text-xs font-bold text-zinc-300 leading-relaxed whitespace-pre-line">
                            {flashcards[flashcardIdx].back}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-4 relative z-10">
                      <span className="text-[9px] font-black text-zinc-550 uppercase">Difficulty: {flashcards[flashcardIdx].difficulty}</span>
                      
                      <div className="flex gap-2">
                        <button
                          disabled={flashcardIdx === 0}
                          onClick={() => { playClick(); setFlashcardIdx(flashcardIdx - 1); setIsFlipped(false); }}
                          className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 disabled:opacity-30 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Prev
                        </button>
                        <button
                          disabled={flashcardIdx + 1 === flashcards.length}
                          onClick={() => { playClick(); setFlashcardIdx(flashcardIdx + 1); setIsFlipped(false); }}
                          className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODULE 6: QUIZ GENERATOR TAB */}
              {activeTab === "Quiz" && (
                <motion.div
                  key="quiz-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <div className="space-y-0.5">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          Quiz Simulator
                        </span>
                        <h2 className="text-base font-black text-zinc-100 tracking-tight pt-1">Solve Quiz</h2>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={generateAiQuiz}
                          disabled={isGeneratingQuiz || quizRunning}
                          className="px-4 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 disabled:opacity-50 text-purple-450 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                        >
                          {isGeneratingQuiz ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" /> Generate AI Quiz
                            </>
                          )}
                        </button>
                        {quizRunning ? (
                          <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl flex items-center">
                            Timer: {quizTimer}s
                          </span>
                        ) : (
                          <button
                            onClick={startQuiz}
                            className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                          >
                            {quizSubmitted ? "Retake Quiz" : "Start Quiz"}
                          </button>
                        )}
                      </div>
                    </div>

                    {quizRunning || quizSubmitted ? (
                      <div className="space-y-6 animate-fadeIn">
                        {quizQuestions.map((q, idx) => (
                          <div key={q.id} className="space-y-3 p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl text-left">
                            <span className="text-[8px] font-black uppercase text-purple-500">Question {idx + 1} ({q.type})</span>
                            <p className="text-xs font-black text-zinc-200 leading-normal">{q.question}</p>
                            
                            {q.type === "MCQ" && q.options && (
                              <div className="grid sm:grid-cols-2 gap-2">
                                {q.options.map((opt) => {
                                  const isSelected = quizAnswers[q.id] === opt;
                                  const isCorrect = opt === q.answer;
                                  let style = "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700";
                                  if (quizSubmitted) {
                                    if (isCorrect) style = "border-emerald-500 bg-emerald-500/10 text-emerald-500";
                                    else if (isSelected) style = "border-rose-500 bg-rose-500/10 text-rose-500";
                                  } else if (isSelected) {
                                    style = "border-purple-500 bg-purple-500/10 text-purple-500";
                                  }

                                  return (
                                    <button
                                      key={opt}
                                      disabled={quizSubmitted}
                                      onClick={() => { playClick(); setQuizAnswers(prev => ({ ...prev, [q.id]: opt })); }}
                                      className={`p-2.5 text-xs text-left font-bold rounded-xl border transition-all cursor-pointer ${style}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {q.type === "TrueFalse" && q.options && (
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt) => {
                                  const isSelected = quizAnswers[q.id] === opt;
                                  const isCorrect = opt === q.answer;
                                  let style = "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700";
                                  if (quizSubmitted) {
                                    if (isCorrect) style = "border-emerald-500 bg-emerald-500/10 text-emerald-500";
                                    else if (isSelected) style = "border-rose-500 bg-rose-500/10 text-rose-500";
                                  } else if (isSelected) {
                                    style = "border-purple-500 bg-purple-500/10 text-purple-500";
                                  }

                                  return (
                                    <button
                                      key={opt}
                                      disabled={quizSubmitted}
                                      onClick={() => { playClick(); setQuizAnswers(prev => ({ ...prev, [q.id]: opt })); }}
                                      className={`p-2.5 text-xs text-center font-bold rounded-xl border transition-all cursor-pointer ${style}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {q.type === "FillBlank" && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  disabled={quizSubmitted}
                                  value={quizAnswers[q.id] || ""}
                                  onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  placeholder="Type your answer here..."
                                  className="w-full bg-zinc-950 border border-zinc-805 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/50"
                                />
                                {quizSubmitted && (
                                  <div className="text-[10px] font-bold">
                                    Correct answer: <span className="text-emerald-500">{q.answer}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Solution breakdown explainer */}
                            {quizSubmitted && (
                              <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl text-[10px] text-zinc-400 font-semibold leading-relaxed">
                                <strong className="text-zinc-200 font-black block pb-1 border-b border-zinc-800 mb-1 flex items-center gap-1">
                                  <Lightbulb className="h-3.5 w-3.5 text-purple-500" /> Explanation
                                </strong>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}

                        {quizRunning && (
                          <button
                            onClick={submitQuiz}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
                          >
                            Finish Quiz
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-8">Click "Start Quiz" to launch a mock assessment.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* MODULE 7: MIND MAP GENERATOR TAB */}
              {activeTab === "Mind Map" && (
                <motion.div
                  key="mindmap-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <div className="space-y-0.5">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          Mind map generator
                        </span>
                        <h2 className="text-base font-black text-zinc-100 tracking-tight pt-1">Visual Study Structure</h2>
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { playClick(); setZoomScale(Math.min(1.5, zoomScale + 0.1)); }}
                          className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-black cursor-pointer"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => { playClick(); setZoomScale(Math.max(0.6, zoomScale - 0.1)); }}
                          className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-black cursor-pointer"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => { playClick(); setZoomScale(1); setPanOffset({ x: 0, y: 0 }); }}
                          className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-350 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Draggable mind map canvas */}
                    <div 
                      className="h-80 w-full bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
                      onMouseDown={handleMapMouseDown}
                      onMouseMove={handleMapMouseMove}
                      onMouseUp={handleMapMouseUp}
                      onMouseLeave={handleMapMouseUp}
                    >
                      <div 
                        className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-75"
                        style={{
                          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                          transformOrigin: "center center"
                        }}
                      >
                        <div className="relative p-10 flex flex-col items-center gap-10">
                          {/* SVG Connections overlay */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
                            {connections.map((conn, idx) => (
                              <motion.path
                                key={idx}
                                d={conn.d}
                                fill="none"
                                stroke={conn.color || "#a855f7"}
                                strokeWidth="1.5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.5 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                              />
                            ))}
                          </svg>

                          {/* Root Node */}
                          <button
                            ref={rootRef}
                            onClick={() => handleNodeClick(mindMapData.id)}
                            className="px-5 py-2.5 bg-zinc-900 border border-purple-500/40 text-purple-450 hover:bg-zinc-850 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer relative z-10"
                          >
                            <BrainCircuit className="h-4 w-4 text-purple-400" />
                            {mindMapData.label}
                          </button>

                          {/* Children row */}
                          {mindMapData.expanded && mindMapData.children && (
                            <div className="flex gap-4 relative z-10">
                              {mindMapData.children.map((child) => (
                                <div key={child.id} className="flex flex-col items-center gap-6">
                                  {/* Child Node */}
                                  <button
                                    ref={(el) => { childRefs.current[child.id] = el; }}
                                    onClick={() => handleNodeClick(child.id)}
                                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-purple-500/30 rounded-xl text-[10px] font-black cursor-pointer shadow-md transition-colors"
                                    style={{ borderLeftColor: child.color, borderLeftWidth: "4px" }}
                                  >
                                    {child.label}
                                  </button>

                                  {/* Grandchildren List */}
                                  {child.expanded && child.children && (
                                    <div className="flex flex-col gap-2">
                                      {child.children.map((g) => (
                                        <div 
                                          ref={(el) => { childRefs.current[g.id] = el; }}
                                          key={g.id} 
                                          className="px-3 py-1.5 bg-zinc-950/80 border border-zinc-850 rounded-lg text-[9px] font-bold text-zinc-400 max-w-[120px] text-center"
                                        >
                                          {g.label}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODULE 8 & 9: PYQ ANALYZER & EXAM EXPECTATIONS TAB */}
              {activeTab === "Exam PYQ" && (
                <motion.div
                  key="pyq-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 space-y-4">
                    <div className="space-y-0.5 pb-2 border-b border-zinc-800">
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        Exam Predictor
                      </span>
                      <h2 className="text-base font-black text-zinc-100 tracking-tight pt-1">Previous Year Paper Trends</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Topic weights list */}
                      <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-3 text-left">
                        <span className="text-[9px] font-black uppercase text-purple-500 tracking-wider">Top Repeated Concepts</span>
                        <div className="space-y-2">
                          {[
                            { topic: "Deadlocks conditions & Banker's", count: 6, weight: "High" },
                            { topic: "Database Normalization (3NF/BCNF)", count: 5, weight: "High" },
                            { topic: "Memory Partitioning & Paging", count: 4, weight: "Medium" },
                            { topic: "TCP Flow Control Windowing", count: 3, weight: "Low" }
                          ].map((trend) => (
                            <div key={trend.topic} className="flex justify-between items-center text-xs font-bold text-zinc-300 py-1.5 border-b border-zinc-900 last:border-0">
                              <span>{trend.topic}</span>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="text-zinc-500">Asked {trend.count} times</span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${
                                  trend.weight === "High" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-zinc-800 text-zinc-400"
                                }`}>
                                  {trend.weight}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expected exam questions list */}
                      <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-3 text-left">
                        <span className="text-[9px] font-black uppercase text-purple-500 tracking-wider">Expected 10-Mark Questions</span>
                        <div className="space-y-2.5 text-[10px] text-zinc-400 font-semibold">
                          <div className="flex gap-2 items-start leading-normal">
                            <span className="h-5 w-5 shrink-0 rounded bg-purple-500/10 text-purple-500 font-black text-center flex items-center justify-center">1</span>
                            <p>Illustrate Banker's deadlock safety algorithm with a 3-process resource matrix allocation state. (95% Confidence)</p>
                          </div>
                          <div className="flex gap-2 items-start leading-normal">
                            <span className="h-5 w-5 shrink-0 rounded bg-purple-500/10 text-purple-500 font-black text-center flex items-center justify-center">2</span>
                            <p>Compare Paging vs Segmentation partitioning schemes in memory management. (88% Confidence)</p>
                          </div>
                          <div className="flex gap-2 items-start leading-normal">
                            <span className="h-5 w-5 shrink-0 rounded bg-purple-500/10 text-purple-500 font-black text-center flex items-center justify-center">3</span>
                            <p>Define functional dependencies and trace BCNF normalization levels. (80% Confidence)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* COLUMN 3: RIGHT SIDEBAR (STUDY PLANNER & SYSTEM STORAGE) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* MODULE 10: REVISION SCHEDULER SYSTEM */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <ListTodo className="h-4 w-4 text-purple-500" /> Revision System
                </h4>
                <button
                  onClick={() => { playClick(); setIsAddingExam(!isAddingExam); }}
                  className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[9px] font-black uppercase tracking-wider text-purple-400 rounded-lg cursor-pointer transition-all"
                >
                  {isAddingExam ? "Cancel" : "+ Add Exam"}
                </button>
              </div>

              {isAddingExam && (
                <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-2.5 text-left animate-fadeIn">
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-550 block">Configure Exam Target</span>
                  
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-zinc-500 uppercase">Subject Name</label>
                    <input
                      type="text"
                      value={newExamSubject}
                      onChange={(e) => setNewExamSubject(e.target.value)}
                      placeholder="e.g. Software Engineering"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] text-zinc-200 outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-zinc-500 uppercase">Days Left</label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={newExamDays}
                        onChange={(e) => setNewExamDays(parseInt(e.target.value) || 1)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] text-zinc-200 outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-zinc-500 uppercase">Progress %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newExamProgress}
                        onChange={(e) => setNewExamProgress(parseInt(e.target.value) || 0)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] text-zinc-200 outline-none focus:border-purple-500/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddExam}
                    className="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Add Target
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {/* Select Revision Plan day configuration */}
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                  <span>Active Revision Timeline</span>
                  <div className="flex gap-1">
                    {[1, 3, 7, 15].map((d) => (
                      <button
                        key={d}
                        onClick={() => { playClick(); setRevisionPlanDays(d); }}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border transition-all cursor-pointer ${
                          revisionPlanDays === d
                            ? "bg-purple-500 border-purple-500 text-white"
                            : "bg-zinc-950/60 border-zinc-850 text-zinc-500"
                        }`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {revisionCountdowns.map((rev) => (
                    <div key={rev.subject} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-2 text-left relative group">
                      {/* Delete button */}
                      <button
                        onClick={() => handleRemoveExam(rev.subject)}
                        className="absolute top-2 right-2 p-1 border border-zinc-850 hover:border-rose-500/30 text-zinc-500 hover:text-rose-500 rounded bg-zinc-950 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete Target"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      <div className="flex justify-between items-center text-[10px] font-bold pr-5">
                        <span className="text-zinc-200">{rev.subject}</span>
                        <span className="text-purple-400">{rev.days} Days to exam</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-zinc-500 font-bold">
                        <span>{rev.progress}% target completion</span>
                        <span>Daily Targets active</span>
                      </div>
                      <div className="w-full bg-zinc-850 rounded-full h-1 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${rev.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Schema Storage widgets (PostgreSQL/MongoDB status) */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Database className="h-4 w-4 text-purple-500 animate-pulse" /> System Mappings
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-black text-zinc-500">
                <div className="p-2 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-1 text-center">
                  <span className="text-emerald-500">PostgreSQL Nodes</span>
                  <p className="text-[8px] text-zinc-400 leading-tight">Users, Quizzes, RevisionPlans, StudySessions</p>
                </div>
                <div className="p-2 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-1 text-center">
                  <span className="text-purple-500">MongoDB Clusters</span>
                  <p className="text-[8px] text-zinc-400 leading-tight">Files, Notes, Flashcards, MindMaps, ChatHistory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────────────────────────
          4. PREVIEW / EXTRACTION MODAL OVERLAY
          ────────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {ocrModalFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 flex flex-col justify-between text-left"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 w-full text-left">
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    AI Content Extraction Desk
                  </span>
                  
                  {/* File Name Input */}
                  <div className="pt-3 space-y-1">
                    <label className="text-[8px] font-black text-zinc-550 uppercase">File Label</label>
                    <input 
                      type="text" 
                      value={modalFileName} 
                      onChange={(e) => setModalFileName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-150 outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => { playClick(); setOcrModalFile(null); }}
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-450 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Extractions Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[9px] font-black text-zinc-450 text-left">
                <div className="space-y-1">
                  <label className="text-zinc-550 uppercase">Category</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-[10px] font-bold text-zinc-200 outline-none"
                  >
                    <option value="Lecture Slides">Lecture Slides</option>
                    <option value="Textbook Chapter">Textbook Chapter</option>
                    <option value="Handwritten Note">Handwritten Note</option>
                    <option value="Exam PYQ Paper">Exam PYQ Paper</option>
                    <option value="Reference PDF">Reference PDF</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-zinc-550 uppercase">Subject</label>
                  <input
                    type="text"
                    value={modalSubject}
                    onChange={(e) => setModalSubject(e.target.value)}
                    placeholder="e.g. OS"
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-zinc-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-550 uppercase">Diagrams</label>
                  <input
                    type="number"
                    min={0}
                    value={modalDiagrams}
                    onChange={(e) => setModalDiagrams(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-[10px] font-bold text-zinc-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-550 uppercase">Formulas</label>
                  <input
                    type="number"
                    min={0}
                    value={modalEquations}
                    onChange={(e) => setModalEquations(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-[10px] font-bold text-zinc-200 outline-none"
                  />
                </div>
              </div>

              {/* Extracted Text Area */}
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">AI OCR Text / Syllabus Context</label>
                <textarea
                  value={modalExtractedText}
                  onChange={(e) => setModalExtractedText(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-4 text-xs font-semibold text-zinc-300 leading-relaxed outline-none focus:border-purple-500/50 resize-y"
                  placeholder="Type or paste syllabus topics matching this file..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={saveOcrModalFileDetails}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-650 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Extraction Details
                </button>
                <button
                  onClick={() => {
                    // Save and ask tutor
                    if (ocrModalFile) {
                      const updated: StudyFile = {
                        ...ocrModalFile,
                        name: modalFileName,
                        category: modalCategory,
                        subject: modalSubject,
                        diagramsCount: modalDiagrams,
                        equationsCount: modalEquations,
                        extractedText: modalExtractedText
                      };
                      setFiles(prev => prev.map(f => f.id === ocrModalFile.id ? updated : f));
                      setChatInput(`Explain this: ${modalExtractedText}`);
                      setActiveTab("AI Chat");
                      setOcrModalFile(null);
                      playSuccess();
                    }
                  }}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Ask AI Tutor
                </button>
                <button
                  onClick={() => { playClick(); setOcrModalFile(null); }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
