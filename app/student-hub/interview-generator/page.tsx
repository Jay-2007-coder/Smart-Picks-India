"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MessageSquare, RefreshCw, Play, AlertTriangle,
  ChevronDown, Lock, Check, Copy, Sparkles, Zap, Flame, Trophy,
  Award, BookOpen, Volume2, Mic, MicOff, Search, Bell, Settings,
  Star, Bookmark, ClipboardList, PenTool, Brain, Compass, HelpCircle,
  FileText, ChevronRight, X, VolumeX, Send, Code, Terminal, Clock,
  Heart, BookOpenCheck, ShieldAlert, Lightbulb
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─────────────── TYPES & INTERFACES ─────────────── */
interface Question {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: number; // in seconds
  bookmarked: boolean;
  solved: boolean;
  notes: string;
  hints: string[];
  currentHintIndex: number;
  userAnswer: string;
  evaluation: {
    score: number;
    transcript: string;
    feedback: string;
    confidence: number; // percentage
  } | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

/* ─────────────── HELPER FUNCTIONS ─────────────── */
function getDifficultyColor(diff: "Easy" | "Medium" | "Hard"): string {
  switch (diff) {
    case "Easy":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Hard":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  }
}

function getTopicBadgeStyle(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes("dsa") || t.includes("algo") || t.includes("structure"))
    return "bg-violet-500/10 text-violet-400 border-violet-500/20";
  if (t.includes("system") || t.includes("design"))
    return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  if (t.includes("oop") || t.includes("object"))
    return "bg-teal-500/10 text-teal-400 border-teal-500/20";
  if (t.includes("database") || t.includes("sql") || t.includes("dbms"))
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (t.includes("os") || t.includes("operating"))
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  if (t.includes("behavioral") || t.includes("hr"))
    return "bg-pink-500/10 text-pink-400 border-pink-500/20";
  return "bg-orange-500/10 text-orange-400 border-orange-500/20";
}

export default function InterviewGenerator() {
  const { user, loading: authLoading } = useAuth() as any;
  
  // Navigation & UI configurations
  const [role, setRole] = useState("Frontend Engineer");
  const [level, setLevel] = useState("Entry Level");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "All">("All");
  const [customSkill, setCustomSkill] = useState("");
  const [skills, setSkills] = useState<string[]>(["React", "JavaScript", "CSS Grid", "TypeScript"]);
  const [studyMode, setStudyMode] = useState<"study" | "mock" | "rapid" | "hr" | "coding" | "company">("study");
  
  // App States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabMap, setActiveTabMap] = useState<Record<string, "answer" | "voice" | "notes" | "hints">>({});

  // Streak & gamification state
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [readinessScore, setReadinessScore] = useState(0);
  const [showXpToast, setShowXpToast] = useState(false);
  const [xpGainedAmount, setXpGainedAmount] = useState(0);

  // Resume Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [isScanningResume, setIsScanningResume] = useState(false);

  // Voice Assessment / Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [voiceTargetQuestionId, setVoiceTargetQuestionId] = useState<string | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Text-To-Speech (audio playback) State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // AI Assistant panel Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: "👋 Hi there! I'm your Placement AI Assistant. How can I help you tackle these interview rounds today? Ask me to explain concepts, suggest alternate solutions, or review answers!",
      timestamp: new Date()
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scratchpad quick notes state
  const [scratchNotes, setScratchNotes] = useState("");

  // Notification badge logic
  const [notifications, setNotifications] = useState<string[]>([
    "🎉 Placement session started! Complete questions to earn XP.",
    "🔥 Keep up the daily placement prep to build your streak!"
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Cursor Spotlight effect positioning
  const spotlightContainerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!spotlightContainerRef.current) return;
    const rect = spotlightContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightContainerRef.current.style.setProperty("--mouse-x", `${x}px`);
    spotlightContainerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // Sync state values on initial boot
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;
      const savedXp = localStorage.getItem("smartpicks_student_xp");
      const savedStreak = localStorage.getItem("smartpicks_student_streak");
      const savedSolved = localStorage.getItem("smartpicks_student_solved");
      const savedReadiness = localStorage.getItem("smartpicks_student_readiness");
      const savedScratch = localStorage.getItem("smartpicks_student_scratch");
      
      if (savedXp) {
        setXp(parseInt(savedXp));
      } else if (user && user.xp !== undefined) {
        setXp(user.xp);
      }
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedSolved) setSolvedCount(parseInt(savedSolved));
      if (savedReadiness) setReadinessScore(parseInt(savedReadiness));
      if (savedScratch) setScratchNotes(savedScratch);
    }
  }, [user]);

  // Keep XP in sync with user state
  useEffect(() => {
    if (user && user.xp !== undefined) {
      setXp(user.xp);
    }
  }, [user]);

  // Sync chat auto-scrolling
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle Speech Recognition initiation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        
        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setSpeechTranscript(prev => prev + " " + finalTranscript);
        };

        rec.onerror = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Update dynamic readiness score based on question metrics
  const recalculateReadiness = (qs: Question[]) => {
    if (qs.length === 0) {
      setReadinessScore(0);
      localStorage.setItem("smartpicks_student_readiness", "0");
      return;
    }
    const total = qs.length;
    const solved = qs.filter(q => q.solved).length;
    
    // Pure dynamic calculation of solved questions percentage
    const baseScore = Math.round((solved / total) * 100);
    setReadinessScore(baseScore);
    localStorage.setItem("smartpicks_student_readiness", baseScore.toString());
  };

  const getTopicProgress = (topicKey: string) => {
    if (questions.length === 0) return 0;
    
    let filtered: Question[] = [];
    const tKey = topicKey.toLowerCase();
    
    if (tKey === "dsa") {
      filtered = questions.filter(q => q.topic.toLowerCase().includes("dsa") || q.topic.toLowerCase().includes("algo") || q.topic.toLowerCase().includes("structure") || q.topic.toLowerCase().includes("programming") || q.topic.toLowerCase().includes("language"));
    } else if (tKey === "oop") {
      filtered = questions.filter(q => q.topic.toLowerCase().includes("oop") || q.topic.toLowerCase().includes("design") || q.topic.toLowerCase().includes("object"));
    } else if (tKey === "dbms") {
      filtered = questions.filter(q => q.topic.toLowerCase().includes("db") || q.topic.toLowerCase().includes("sql") || q.topic.toLowerCase().includes("query") || q.topic.toLowerCase().includes("database"));
    } else if (tKey === "os") {
      filtered = questions.filter(q => q.topic.toLowerCase().includes("os") || q.topic.toLowerCase().includes("unix") || q.topic.toLowerCase().includes("system"));
    } else if (tKey === "hr") {
      filtered = questions.filter(q => q.topic.toLowerCase().includes("hr") || q.topic.toLowerCase().includes("behavioral"));
    }
    
    if (filtered.length === 0) return 0;
    const solved = filtered.filter(q => q.solved).length;
    return Math.round((solved / filtered.length) * 100);
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      localStorage.setItem("smartpicks_student_xp", newXp.toString());
      return newXp;
    });
    setXpGainedAmount(amount);
    setShowXpToast(true);
    setTimeout(() => setShowXpToast(false), 2800);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
      addXp(5);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Drag and Drop Resume simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".txt")) {
        setResumeName(file.name);
        setIsScanningResume(true);
        addXp(15);

        // Simulate scanning keywords
        setTimeout(() => {
          setIsScanningResume(false);
          const mockResumeSkills = ["TailwindCSS", "NextJS Router", "Git version control", "REST APIs", "Node Express"];
          // Merge unique skills
          const mergedSkills = Array.from(new Set([...skills, ...mockResumeSkills]));
          setSkills(mergedSkills);
          
          setNotifications(prev => [
            `📄 Resume scanned successfully! Found keywords: ${mockResumeSkills.join(", ")}`,
            ...prev
          ]);
        }, 2000);
      } else {
        setError("Invalid file format. Please drop a PDF, DOCX, or TXT file.");
      }
    }
  };

  // Main Submit handler (calls Gemini backend proxy)
  const handleGenerateQuestions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError("");
    setQuestions([]);
    setActiveQuestionId(null);

    // Context adjustments based on active study modes
    let promptRole = role;
    let promptLevel = level;
    let promptCompany = company;

    if (studyMode === "hr") {
      promptRole = `Human Resources & Behavioral Core for ${role}`;
    }
    if (studyMode === "coding") {
      promptRole = `DSA & Live Coding Assessment in Javascript/Python for ${role}`;
    }
    if (studyMode === "company" && !promptCompany) {
      promptCompany = "FAANG & top tech product companies";
    }

    try {
      const response = await fetch("/api/v1/student-hub/interview-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: promptRole,
          level: promptLevel,
          company: promptCompany
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Map questions back to schema structure with advanced layout settings
        const enriched = data.questions.map((q: any, idx: number) => {
          const resolvedDifficulty: "Easy" | "Medium" | "Hard" = 
            idx % 3 === 0 ? "Hard" : idx % 3 === 1 ? "Medium" : "Easy";
          
          return {
            id: `q-${Date.now()}-${idx}`,
            question: q.question,
            answer: q.answer,
            topic: q.topic || "Core Domain",
            difficulty: resolvedDifficulty,
            estimatedTime: resolvedDifficulty === "Hard" ? 180 : resolvedDifficulty === "Medium" ? 120 : 90,
            bookmarked: false,
            solved: false,
            notes: "",
            hints: [
              `Focus on the main principle behind ${q.topic || 'the topic'}.`,
              "Think about how we optimize space complexity or time bottlenecks.",
              "Look for any edge conditions like empty parameters, integer limits, or stack overflows."
            ],
            currentHintIndex: -1,
            userAnswer: "",
            evaluation: null
          };
        });

        setQuestions(enriched);
        recalculateReadiness(enriched);
        
        // Update total XP from backend response if provided, else award local XP
        if (data.totalXp) {
          setXp(data.totalXp);
          localStorage.setItem("smartpicks_student_xp", data.totalXp.toString());
        } else {
          addXp(10);
        }
      } else {
        setError(data.message || "Failed to query Gemini model. Check API limit parameters.");
      }
    } catch (err) {
      setError("Failed to reach placement servers. Ensure backend route is online.");
    } finally {
      setLoading(false);
    }
  };

  // Generate a singular similar question context
  const handleGenerateSimilar = async (targetQ: Question) => {
    addXp(15);
    setNotifications(prev => [
      `🤖 Generating similar question card on "${targetQ.topic}" topic...`,
      ...prev
    ]);

    // Fast inline API simulation based on the prompt criteria
    setTimeout(() => {
      const mockSimilar: Question = {
        id: `q-similar-${Date.now()}`,
        question: `Explain how you would write a robust error handler or unit tests around: "${targetQ.question.replace(/\?$/, "")}"?`,
        answer: `To test or wrap error handlers around this concept (${targetQ.topic}), we implement try-catch boundaries, logging, and mocked assertions. For example: \n\n\`\`\`javascript\ntry {\n  // call functionality\n} catch (error) {\n  logErrorToMonitoring(error);\n  return fallbackValue;\n}\n\`\`\``,
        topic: targetQ.topic,
        difficulty: targetQ.difficulty,
        estimatedTime: targetQ.estimatedTime,
        bookmarked: false,
        solved: false,
        notes: "",
        hints: ["Think of testing boundaries.", "What exceptions are normally thrown?"],
        currentHintIndex: -1,
        userAnswer: "",
        evaluation: null
      };

      setQuestions(prev => {
        const idx = prev.findIndex(item => item.id === targetQ.id);
        if (idx === -1) return [...prev, mockSimilar];
        const copy = [...prev];
        copy.splice(idx + 1, 0, mockSimilar);
        return copy;
      });
    }, 1200);
  };

  // Bookmark Toggle
  const toggleBookmark = (qId: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === qId ? { ...q, bookmarked: !q.bookmarked } : q))
    );
    addXp(5);
  };

  // Toggle solved state
  const toggleSolved = (qId: string) => {
    setQuestions(prev => {
      const updated = prev.map(q => {
        if (q.id === qId) {
          const nextSolved = !q.solved;
          if (nextSolved) {
            addXp(20);
            setSolvedCount(c => {
              const nextC = c + 1;
              localStorage.setItem("smartpicks_student_solved", nextC.toString());
              return nextC;
            });
            // Update streak daily
            setStreak(s => {
              const nextS = s + 1;
              localStorage.setItem("smartpicks_student_streak", nextS.toString());
              return nextS;
            });
          }
          return { ...q, solved: nextSolved };
        }
        return q;
      });
      recalculateReadiness(updated);
      return updated;
    });
  };

  // Voice Recording simulation & real browser recording interface
  const handleStartVoiceRecord = (qId: string) => {
    setSpeechTranscript("");
    setVoiceTargetQuestionId(qId);
    setIsRecording(true);
    setRecordingTime(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Already started or busy
      }
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const handleStopVoiceRecord = (qId: string) => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Already stopped
      }
    }

    // Evaluate answer simulation or assessment
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;

    // Use transcription if populated, else use high quality mock simulation matching domain
    setTimeout(() => {
      const actualTranscript = speechTranscript.trim() || 
        `To address this question regarding ${targetQ.topic}, we prioritize optimizing complexity constraints. We allocate resources, check bounds, and handle memory allocation patterns dynamically. The standard implementation runs within logarithmic space complexity limits.`;
      
      const evaluationScore = Math.floor(Math.random() * 25) + 72; // Score between 72 and 96
      const confidenceRate = Math.floor(Math.random() * 15) + 80; // Confidence between 80% and 95%

      setQuestions(prev => {
        const updated = prev.map(q => {
          if (q.id === qId) {
            return {
              ...q,
              solved: true,
              userAnswer: actualTranscript,
              evaluation: {
                score: evaluationScore,
                transcript: actualTranscript,
                confidence: confidenceRate,
                feedback: `Conceptual accuracy is extremely high (${evaluationScore}%). Dynamic usage of keywords was detected. Suggestion: elaborate on fallback edge cases to hit a 95+ score next round.`
              }
            };
          }
          return q;
        });
        recalculateReadiness(updated);
        return updated;
      });

      addXp(35);
      setSolvedCount(c => {
        const nextC = c + 1;
        localStorage.setItem("smartpicks_student_solved", nextC.toString());
        return nextC;
      });
      setVoiceTargetQuestionId(null);
    }, 1500);
  };

  // Text to Speech playback (TTS model answers reader)
  const handleReadAloud = (qId: string, text: string) => {
    if (playingAudioId === qId) {
      // Stop current audio playback
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      setPlayingAudioId(null);
    } else {
      if (synthesisRef.current) {
        synthesisRef.current.cancel(); // cancel any active reads
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setPlayingAudioId(null);
        };
        utterance.onerror = () => {
          setPlayingAudioId(null);
        };
        setPlayingAudioId(qId);
        synthesisRef.current.speak(utterance);
      }
    }
  };

  // Update Scratchpad notes
  const handleScratchpadChange = (val: string) => {
    setScratchNotes(val);
    localStorage.setItem("smartpicks_student_scratch", val);
  };

  // Interactive AI Assistant Chat replies (combining ChatGPT/Perplexity experience)
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "user",
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const promptText = chatInput.toLowerCase();
    setChatInput("");

    // AI thinking state simulation
    setTimeout(() => {
      let replyText = "";

      if (promptText.includes("recursion") || promptText.includes("dsa") || promptText.includes("stack")) {
        replyText = "💡 **Recursion Core Concepts**:\nRecursion uses the call stack to store execution contexts. Key aspects include:\n- **Base Case**: Halts execution. Without it, stack overflow occurs.\n- **Recursive Step**: Shrinks search domain.\n- **Optimization**: Use tail recursion or memoization (Dynamic Programming) to reduce time complexity to $O(N)$.";
      } else if (promptText.includes("resume") || promptText.includes("ats")) {
        replyText = "📄 **ATS Alignment Guide**:\nTo score high in resume reviews, align action verbs directly to standard engineering keywords. Use metrics ($X$\\%\ efficiency gains) and list technologies like React, Node, and Docker in dedicated columns.";
      } else if (promptText.includes("oop") || promptText.includes("class")) {
        replyText = "🧱 **OOP pillars breakdown**:\n1. **Encapsulation**: Scope protection.\n2. **Inheritance**: Reuse methods via prototypes or classes.\n3. **Polymorphism**: Dynamic dispatch overrides.\n4. **Abstraction**: Expose interfaces, hide internal workings.";
      } else if (promptText.includes("company") || promptText.includes("google") || promptText.includes("amazon")) {
        replyText = "🎯 **Company-Specific Prep Tips**:\n- **Google**: Heavy focus on algorithm performance (graphs, trees, matrix DP).\n- **Amazon**: High emphasis on Leadership Principles and scale architecture.\n- **TCS / Service firms**: Deep dive into OOP principles, DBMS queries, basic array coding.";
      } else {
        replyText = `🔍 **AI Placement Analyst**: In regards to your query for ${role} parameters: Make sure to review basic data formats (JSON structure), index optimization techniques, and asynchronous execution workflows (like Promises & event cycles).`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: `chat-reply-${Date.now()}`,
          sender: "assistant",
          text: replyText,
          timestamp: new Date()
        }
      ]);
      addXp(10);
    }, 1000);
  };

  // Check access restriction
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Dashboard access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,63,54,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 text-center shadow-2xl space-y-6 relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Access Restricted</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Please sign in to your SmartPicks account to access the futuristic AI Placement Prep system.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/interview-generator`}
            className="flex h-11 w-full items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-bold text-neutral-500 hover:text-neutral-300">
            Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  // Filter questions based on UI configurations
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficulty === "All" || q.difficulty === difficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div
      ref={spotlightContainerRef}
      onMouseMove={handleMouseMove}
      style={{ background: "#09090B" }}
      className="min-h-screen text-slate-100 relative overflow-hidden font-sans select-none pb-12"
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0 transition-opacity duration-300"
        style={{
          background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(249,115,22,0.08) 0%, transparent 80%)"
        }}
      />

      {/* Floating Animated CSS Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/0 blur-2xl animate-float"
            style={{
              width: `${Math.random() * 200 + 80}px`,
              height: `${Math.random() * 200 + 80}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${12 + Math.random() * 15}s`
            }}
          />
        ))}
      </div>

      {/* XP Reward notification toast */}
      <AnimatePresence>
        {showXpToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-orange-400/30"
          >
            <Trophy className="h-4.5 w-4.5 text-white animate-bounce" />
            <span className="text-xs font-extrabold tracking-wider uppercase text-white">+{xpGainedAmount} XP GRANTED!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Premium Navbar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/70 backdrop-blur-xl border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/student-hub"
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-800/60 text-slate-400 hover:text-orange-400 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black text-orange-500">
                AI Interview Prep
              </span>
              <h1 className="text-sm font-black tracking-tight text-white">SmartPicks Placement Suite</h1>
            </div>
          </div>

          {/* Center search element */}
          <div className="hidden md:flex items-center flex-1 max-w-sm relative">
            <Search className="absolute left-3 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interview cards, topics or parameters..."
              className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-neutral-500 outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-semibold"
            />
          </div>

          {/* Right actions: Streaks, XP, Notifications, Profile */}
          <div className="flex items-center gap-4">
            
            {/* XP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold text-xs">
              <Award className="h-3.5 w-3.5" />
              <span>{xp} XP</span>
            </div>

            {/* Streak flame */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-extrabold text-xs animate-pulse-scale">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>{streak} Days</span>
            </div>



            {/* Profile Avatar */}
            <div className="h-8 w-8 rounded-full border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center text-xs font-bold text-orange-400">
              {user.profileImage ? (
                <img src={user.profileImage} alt="User Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10 space-y-8">

        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Readiness Score */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden shadow-2xl">
            <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="url(#readinessGradient)"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - readinessScore / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white">{readinessScore}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Interview Readiness</h3>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                Score increases as you solve hard questions and hit 80+ mock values.
              </p>
            </div>
          </div>

          {/* Solved Stat */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-start">
              <BookOpenCheck className="h-5 w-5 text-orange-400" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Questions Done</span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-white">{solvedCount}</span>
              <span className="text-xs text-neutral-500 font-bold ml-1.5">/ 40 solved</span>
            </div>
            <div className="w-full bg-neutral-950/60 rounded-full h-1 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(solvedCount / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* Current multiplier / streak details */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-start">
              <Flame className="h-5 w-5 text-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Active Streak</span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-white">{streak} Days</span>
              <span className={`text-[10px] block font-black uppercase tracking-wider mt-1 ${streak > 0 ? "text-green-400" : "text-neutral-500"}`}>
                {streak > 0 ? "🔥 1.5x XP Boost Active" : "⚡ Practice daily to build streak"}
              </span>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Brain className="h-20 w-20 text-orange-500" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-500/10">
                <Sparkles className="h-3 w-3" /> System Recommendation
              </span>
              <p className="text-xs font-bold text-white leading-snug">
                {role.toLowerCase().includes("frontend") 
                  ? "Practice React component reconciliation and browser paint engine rules."
                  : role.toLowerCase().includes("backend") 
                    ? "Practice DBMS indexes tuning and SQL transaction isolation limits."
                    : role.toLowerCase().includes("devops") 
                      ? "Configure multi-container Docker Compose networks and CI/CD parameters."
                      : "Practice DBMS transactions & B-Trees matching Google targets."
                }
              </p>
            </div>
            <button
              onClick={() => {
                setRole("Backend Developer");
                setCompany("Google");
                setStudyMode("company");
                handleGenerateQuestions();
              }}
              className="mt-3 text-[10px] font-black text-orange-500 hover:text-orange-400 flex items-center gap-1 cursor-pointer self-start"
            >
              Start Practice <ChevronRight className="h-3 w-3" />
            </button>
          </div>

        </section>

        {/* 3-Column Layout Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR: Setup Parameters (Col-Span 3) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 shadow-2xl space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-orange-500" /> Parametric Filters
                </h2>
                <p className="text-[11px] text-neutral-500 mt-1">Configure placement guidelines</p>
              </div>

              {/* Study Mode Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Study Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "study", label: "Study Mode", icon: BookOpen },
                    { id: "mock", label: "Mock Oral", icon: Mic },
                    { id: "rapid", label: "Rapid Fire", icon: Flame },
                    { id: "hr", label: "HR Behavioral", icon: HelpCircle },
                    { id: "coding", label: "Live Code", icon: Code },
                    { id: "company", label: "Company Spec", icon: Trophy }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setStudyMode(mode.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-[10px] font-extrabold gap-1.5 transition-all cursor-pointer ${
                        studyMode === mode.id
                          ? "bg-orange-500/10 border-orange-500 text-orange-400"
                          : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                      }`}
                    >
                      <mode.icon className="h-4 w-4 shrink-0" />
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Role Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-neutral-950/60 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
                >
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Mobile App Developer">Mobile App Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="ML Engineer">Machine Learning Engineer</option>
                  <option value="Cloud Engineer">Cloud Engineer</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                </select>
              </div>

              {/* Target Company input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Company Target</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Amazon, Google, TCS"
                  className="w-full rounded-xl border border-neutral-850 bg-neutral-950/60 px-3 py-2 text-xs font-semibold text-slate-200 placeholder:text-neutral-600 outline-none"
                />
              </div>

              {/* Difficulty badge selectors */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Difficulty Grade</label>
                <div className="flex gap-2">
                  {["All", "Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d as any)}
                      className={`flex-1 py-1 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-colors cursor-pointer ${
                        difficulty === d
                          ? "bg-orange-500/10 text-orange-400 border-orange-500"
                          : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Target Skills input tags */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Target Skills</label>
                <form onSubmit={handleAddSkill} className="flex gap-1.5">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add Skill tag..."
                    className="flex-1 rounded-lg border border-neutral-850 bg-neutral-950/60 px-2.5 py-1 text-[11px] font-semibold text-slate-200 outline-none"
                  />
                  <button type="submit" className="px-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-black cursor-pointer">+</button>
                </form>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map(s => (
                    <span 
                      key={s} 
                      onClick={() => handleRemoveSkill(s)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-extrabold text-neutral-400 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      {s} <X className="h-2.5 w-2.5" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Drag & Drop Zone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Resume Upload (ATS alignment)</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                    isDragging 
                      ? "border-orange-500 bg-orange-500/5 shadow-inner" 
                      : resumeName 
                        ? "border-green-500/50 bg-green-500/5" 
                        : "border-neutral-850 hover:border-neutral-700 bg-neutral-950/20"
                  }`}
                >
                  <FileText className={`h-8 w-8 ${resumeName ? "text-green-400" : "text-neutral-500 animate-pulse"}`} />
                  {isScanningResume ? (
                    <div className="space-y-1.5 w-full">
                      <p className="text-[9px] font-black text-orange-400 animate-pulse uppercase tracking-widest">Scanning Resume structure...</p>
                      <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full animate-shimmer" style={{ width: "60%" }} />
                      </div>
                    </div>
                  ) : resumeName ? (
                    <div>
                      <p className="text-[10px] font-black text-green-400 truncate max-w-[180px]">{resumeName}</p>
                      <p className="text-[8px] text-neutral-500 mt-0.5 uppercase tracking-wider">Drag new file to swap</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-300 leading-snug">Drag &amp; Drop Resume PDF</p>
                      <p className="text-[9px] text-neutral-500 leading-relaxed mt-0.5">Extract core placement keywords automatically</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Core trigger button */}
              <button
                onClick={() => handleGenerateQuestions()}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-neutral-800 disabled:to-neutral-900 text-white disabled:text-neutral-500 rounded-xl text-xs font-black shadow-lg shadow-orange-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Fetching AI Cards...</>
                ) : (
                  <><Play className="h-4 w-4" /> Generate AI Interview</>
                )}
              </button>

            </div>
          </aside>

          {/* CENTER: Question Board & Accordions (Col-Span 6) */}
          <main className="lg:col-span-6 space-y-6">
            
            {/* Search/Filter subheader */}
            <div className="flex items-center justify-between gap-4 flex-wrap bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Active Round:</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {studyMode === "study" ? "Study & Learn" : studyMode === "mock" ? "Oral Interview Assessment" : studyMode === "rapid" ? "Rapid Fire 60s" : studyMode === "hr" ? "HR Behavioral Prep" : studyMode === "coding" ? "Live Coding" : "Company Custom"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Filtered:</span>
                <span className="text-xs font-black text-white">{filteredQuestions.length} Cards</span>
              </div>
            </div>

            {/* Error panel */}
            {error && (
              <div className="p-4 bg-rose-500/5 border border-rose-500/15 text-xs text-rose-400 font-bold rounded-2xl flex gap-3 items-center">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Skeleton Loading states */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-5 space-y-3 animate-pulse">
                    <div className="flex gap-2">
                      <div className="h-4 bg-neutral-800 w-16 rounded-full" />
                      <div className="h-4 bg-neutral-800 w-24 rounded-full" />
                    </div>
                    <div className="h-6 bg-neutral-800 w-3/4 rounded-lg" />
                    <div className="h-4 bg-neutral-800 w-1/2 rounded-lg opacity-60" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty Board state */}
            {!loading && filteredQuestions.length === 0 && (
              <div className="bg-neutral-900/20 backdrop-blur-xl border border-neutral-800 border-dashed rounded-3xl p-16 text-center text-neutral-500 flex flex-col items-center justify-center space-y-4 shadow-xl">
                <div className="h-16 w-16 rounded-3xl bg-neutral-900 flex items-center justify-center text-orange-500/40 border border-neutral-800">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-sm text-slate-300">Interview Board is Empty</h4>
                  <p className="text-xs text-neutral-500 mt-1.5 max-w-xs leading-relaxed mx-auto">
                    Select your placement target specs on the left column and click Generate to query our LLM models.
                  </p>
                </div>
              </div>
            )}

            {/* Question Card Accordion list */}
            {!loading && filteredQuestions.length > 0 && (
              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => {
                  const isExpanded = activeQuestionId === q.id;
                  const activeTab = activeTabMap[q.id] || "answer";
                  
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      className={`bg-neutral-900/40 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl ${
                        isExpanded 
                          ? "border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]" 
                          : "border-neutral-800/80 hover:border-neutral-700"
                      }`}
                    >
                      
                      {/* Card Header Accordion trigger */}
                      <div
                        onClick={() => setActiveQuestionId(isExpanded ? null : q.id)}
                        className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-neutral-800/20 transition-colors"
                      >
                        <div className="space-y-2.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Topic tag */}
                            <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${getTopicBadgeStyle(q.topic)}`}>
                              {q.topic}
                            </span>
                            {/* Difficulty tag */}
                            <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${getDifficultyColor(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                            {/* Estimated read time */}
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-neutral-500 uppercase tracking-widest">
                              <Clock className="h-2.5 w-2.5" /> {q.estimatedTime}s est
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-extrabold leading-snug text-slate-100 flex items-start gap-2">
                            <span className="text-orange-500 font-black shrink-0">Q{idx + 1}.</span>
                            <span>{q.question}</span>
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2.5 shrink-0 mt-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(q.id);
                            }}
                            className="p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800 text-neutral-500 hover:text-orange-400 transition-colors cursor-pointer"
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${q.bookmarked ? "fill-orange-400 text-orange-400" : ""}`} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSolved(q.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              q.solved 
                                ? "bg-green-500/10 border-green-500/30 text-green-400" 
                                : "bg-neutral-950/60 border-neutral-800 text-neutral-500 hover:text-green-400"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-neutral-500"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </div>

                      </div>

                      {/* Extended Detail Panel */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="border-t border-neutral-850 bg-neutral-950/40 overflow-hidden"
                          >
                            
                            {/* Inner Tabs Menu header */}
                            <div className="flex items-center justify-between border-b border-neutral-850 px-5 bg-neutral-950/80">
                              <div className="flex gap-4">
                                {[
                                  { id: "answer", label: "Model Answer", icon: Sparkles },
                                  { id: "voice", label: "Mock Assessment", icon: Mic },
                                  { id: "notes", label: "My Notes", icon: PenTool },
                                  { id: "hints", label: `Hints (${q.currentHintIndex + 2}/3)`, icon: Lightbulb }
                                ].map(tab => (
                                  <button
                                    key={tab.id}
                                    onClick={() => setActiveTabMap(prev => ({ ...prev, [q.id]: tab.id as any }))}
                                    className={`py-3 text-[10px] font-black uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                                      activeTab === tab.id
                                        ? "border-orange-500 text-orange-400 font-extrabold"
                                        : "border-transparent text-neutral-500 hover:text-neutral-300"
                                    }`}
                                  >
                                    <tab.icon className="h-3.5 w-3.5" />
                                    <span>{tab.label}</span>
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => handleGenerateSimilar(q)}
                                className="text-[9px] font-black uppercase text-orange-500 hover:text-orange-400 tracking-wider flex items-center gap-1 cursor-pointer"
                              >
                                <Zap className="h-3 w-3 fill-current" /> Similar Card
                              </button>
                            </div>

                            {/* Inner Dynamic Tabs Content panel */}
                            <div className="p-5">

                              {/* Tab: Model Answer */}
                              {activeTab === "answer" && (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                                        <Award className="h-3.5 w-3.5 text-orange-400" /> Ideal Placement Response
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleReadAloud(q.id, q.answer)}
                                        className="p-1 px-2.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-black text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        {playingAudioId === q.id ? (
                                          <><VolumeX className="h-3.5 w-3.5 text-red-400" /> Stop Reader</>
                                        ) : (
                                          <><Volume2 className="h-3.5 w-3.5" /> Read Aloud</>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(q.answer);
                                          addXp(5);
                                        }}
                                        className="p-1 px-2.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-black text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <Copy className="h-3.5 w-3.5" /> Copy Text
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs font-semibold leading-relaxed text-neutral-300 whitespace-pre-line bg-neutral-900/20 p-4 rounded-xl border border-neutral-850">
                                    {q.answer}
                                  </p>
                                </div>
                              )}

                              {/* Tab: Speech evaluation visualizer */}
                              {activeTab === "voice" && (
                                <div className="space-y-4">
                                  
                                  {/* Speech Visualizer box */}
                                  <div className="bg-neutral-900/80 rounded-2xl p-5 border border-neutral-800 flex flex-col items-center justify-center space-y-4">
                                    {isRecording && voiceTargetQuestionId === q.id ? (
                                      <div className="flex flex-col items-center space-y-3">
                                        <div className="flex gap-1.5 h-8 items-center">
                                          {[...Array(6)].map((_, i) => (
                                            <motion.div
                                              key={i}
                                              animate={{ height: [10, 32, 10] }}
                                              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                              className="w-1 bg-red-500 rounded-full"
                                            />
                                          ))}
                                        </div>
                                        <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">Recording mic audio ({recordingTime}s)</span>
                                        <p className="text-[10px] text-neutral-500 italic max-w-sm text-center truncate">"{speechTranscript || 'Awaiting spoken input...'}"</p>
                                        <button
                                          onClick={() => handleStopVoiceRecord(q.id)}
                                          className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                                        >
                                          Finish &amp; Evaluate
                                        </button>
                                      </div>
                                    ) : q.evaluation ? (
                                      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1 border-r border-neutral-800 flex flex-col items-center justify-center p-3 text-center">
                                          <div className="h-16 w-16 rounded-full border-4 border-green-500/30 flex items-center justify-center text-lg font-black text-green-400 shadow-md">
                                            {q.evaluation.score}%
                                          </div>
                                          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 mt-2">Evaluation Grade</span>
                                          <span className="text-[8px] text-neutral-500 font-bold mt-1">Confidence Rate: {q.evaluation.confidence}%</span>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                          <h4 className="text-[10px] font-black uppercase text-orange-400 tracking-wider">AI Speech Diagnostics</h4>
                                          <p className="text-[11px] text-neutral-300 italic">" {q.evaluation.transcript} "</p>
                                          <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 text-[10px] font-bold text-neutral-400 leading-relaxed">
                                            {q.evaluation.feedback}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 space-y-3">
                                        <div className="h-12 w-12 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
                                          <Mic className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-black text-slate-200">Interactive Oral Evaluation</h4>
                                          <p className="text-[10px] text-neutral-500 max-w-xs leading-relaxed mt-1">
                                            Speak your answer aloud. Our voice speech analyzer evaluates confidence rate and key concepts.
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => handleStartVoiceRecord(q.id)}
                                          className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                                        >
                                          <Mic className="h-4 w-4" /> Start Spoken Test
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              )}

                              {/* Tab: Notes pad */}
                              {activeTab === "notes" && (
                                <div className="space-y-3">
                                  <textarea
                                    value={q.notes}
                                    onChange={(e) => {
                                      const text = e.target.value;
                                      setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, notes: text } : item));
                                    }}
                                    placeholder="Jot down formulas, code templates, or alternate solutions here. Saves automatically..."
                                    className="w-full h-32 bg-neutral-900 border border-neutral-850 rounded-2xl p-4 text-xs font-medium text-slate-200 outline-none placeholder:text-neutral-600"
                                  />
                                  <div className="flex justify-between items-center text-[10px] text-neutral-500">
                                    <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-500" /> Auto-saved local state</span>
                                    <span>{q.notes.length} characters</span>
                                  </div>
                                </div>
                              )}

                              {/* Tab: Hints panel */}
                              {activeTab === "hints" && (
                                <div className="space-y-3">
                                  {q.currentHintIndex < 0 ? (
                                    <div className="text-center py-3 bg-neutral-900/40 rounded-xl border border-neutral-850">
                                      <p className="text-[11px] text-neutral-400">Locked behind progressive hints system.</p>
                                      <button
                                        onClick={() => {
                                          setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, currentHintIndex: 0 } : item));
                                          addXp(-2); // cost 2 XP for hint
                                        }}
                                        className="mt-2 text-[10px] font-black uppercase text-orange-500 hover:text-orange-400 tracking-wider flex items-center gap-1 mx-auto cursor-pointer"
                                      >
                                        Reveal Hint 1 (-2 XP)
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800 text-[11px] leading-relaxed text-orange-300 font-bold">
                                        💡 **Hint {q.currentHintIndex + 1}**: {q.hints[q.currentHintIndex]}
                                      </div>
                                      {q.currentHintIndex < q.hints.length - 1 && (
                                        <button
                                          onClick={() => {
                                            setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, currentHintIndex: item.currentHintIndex + 1 } : item));
                                            addXp(-2);
                                          }}
                                          className="text-[9px] font-black uppercase text-orange-500 hover:text-orange-400 tracking-wider flex items-center gap-1 cursor-pointer"
                                        >
                                          Reveal Next Hint (-2 XP)
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>

                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  );
                })}
              </div>
            )}

          </main>

          {/* RIGHT SIDEBAR: AI Copilot & Analytics panel (Col-Span 3) */}
          <aside className="lg:col-span-3 space-y-6">

            {/* AI Assistant Chat Console */}
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 shadow-2xl flex flex-col h-[380px]">
              <div className="border-b border-neutral-850 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" /> Placement Assistant
                  </h3>
                  <p className="text-[9px] text-neutral-500">Ask coding or resume queries</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              </div>

              {/* Chat conversations log */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-2.5 text-[10px] leading-relaxed font-semibold ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-tr-none"
                          : "bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-tl-none whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat action suggestions */}
              <div className="flex gap-1.5 py-1.5 border-t border-neutral-850 flex-wrap">
                {[
                  { text: "Explain Recursion", value: "Explain recursion logic" },
                  { text: "Google Tips", value: "Give me Google interview prep tips" },
                  { text: "OOP Pillars", value: "What are OOP pillars?" }
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatInput(s.value);
                    }}
                    className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-[8px] font-black text-neutral-500 hover:text-white cursor-pointer"
                  >
                    {s.text}
                  </button>
                ))}
              </div>

              {/* Chat input box */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-850">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  placeholder="Ask Assistant..."
                  className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-200 outline-none"
                />
                <button
                  onClick={handleSendChatMessage}
                  className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>

            {/* Topic Progress Analytics */}
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-neutral-800 pb-2">
                <h4 className="text-xs font-black text-white">Placement Topic Analytics</h4>
              </div>
              <div className="space-y-3.5">
                {[
                  { name: "Algorithms & DSA", progress: getTopicProgress("dsa"), color: "bg-violet-500" },
                  { name: "Object Oriented Design", progress: getTopicProgress("oop"), color: "bg-teal-500" },
                  { name: "DBMS & SQL Querying", progress: getTopicProgress("dbms"), color: "bg-blue-500" },
                  { name: "Operating Systems / UNIX", progress: getTopicProgress("os"), color: "bg-slate-500" },
                  { name: "HR & Behavioral round", progress: getTopicProgress("hr"), color: "bg-pink-500" }
                ].map((topic, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase text-neutral-400">
                      <span>{topic.name}</span>
                      <span>{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-950 rounded-full h-1 overflow-hidden border border-neutral-850/30">
                      <div className={`h-full rounded-full ${topic.color}`} style={{ width: `${topic.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Revision saved items */}
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
              <h4 className="text-xs font-black text-white">Bookmarks &amp; Saved Cards</h4>
              <div className="space-y-2">
                {questions.filter(q => q.bookmarked).length === 0 ? (
                  <p className="text-[10px] text-neutral-600 font-bold">No questions bookmarked yet. Toggle the bookmark ribbon on cards to pin.</p>
                ) : (
                  questions.filter(q => q.bookmarked).map(q => (
                    <div
                      key={q.id}
                      onClick={() => setActiveQuestionId(q.id)}
                      className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-850 text-[10px] text-slate-300 hover:text-white truncate cursor-pointer hover:border-orange-500/20"
                    >
                      ⭐ <span className="font-extrabold">{q.topic}:</span> {q.question}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Study Scratchpad quick logs */}
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-white flex items-center gap-1">
                  <ClipboardList className="h-4 w-4 text-orange-500" /> Revision Notes Pad
                </h4>
              </div>
              <textarea
                value={scratchNotes}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                placeholder="Write quick codes, review targets, or copy formulas for rapid access... Auto-saved locally."
                className="w-full h-28 bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-[10px] text-slate-300 outline-none placeholder:text-neutral-600 font-medium"
              />
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}
