"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, HelpCircle, Play, RefreshCw, CheckCircle, XCircle, 
  ArrowRight, Clock, Volume2, VolumeX, Lightbulb, Trophy, Sparkles, 
  Award, ChevronDown, ChevronUp, AlertCircle, ShieldCheck, Flame, 
  Search, Bell, Zap, Calculator, Settings, Target, Lock, Check, 
  Flag, X, Maximize2, Minimize2, Activity, TrendingUp, Info
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Question {
  id: number;
  category: "Quantitative" | "Logical" | "Verbal";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  hint: string;
  companies?: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Quantitative",
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in metres?",
    options: ["120 m", "150 m", "180 m", "324 m"],
    answer: "150 m",
    explanation: "First convert Speed to m/sec: 60 * (5/18) = 50/3 m/sec. Distance = Speed * Time = (50/3) * 9 = 150 metres. Therefore, the length of the train is 150 m.",
    hint: "Speed in m/s = Speed in km/hr * 5/18. Distance = Speed * Time.",
    companies: ["TCS", "Accenture", "Wipro"]
  },
  {
    id: 2,
    category: "Logical",
    question: "If A + B means A is brother of B; A - B means A is sister of B and A * B means A is father of B. Which of the following means C is the son of M?",
    options: ["M - N * C + F", "F - C + N * M", "M * N - C + F", "N + M - F * C"],
    answer: "M * N - C + F",
    explanation: "M * N indicates M is the father of N. N - C indicates N is the sister of C. C + F indicates C is the brother of F. Since N, C, F are siblings and M is their father, and C is male (brother of F), C is indeed the son of M.",
    hint: "Start by analyzing the genders. C must be male, which is indicated by 'C + F' (brother).",
    companies: ["Infosys", "Capgemini", "Accenture"]
  },
  {
    id: 3,
    category: "Verbal",
    question: "Choose the word which is most opposite in meaning to the word 'FRUGAL':",
    options: ["Economical", "Extravagant", "Miserly", "Paltry"],
    answer: "Extravagant",
    explanation: "'Frugal' means careful, sparing, or economical with regards to money. Its direct opposite is 'Extravagant', meaning spending money excessively or wastefully.",
    hint: "Think of a word that describes someone who spends money recklessly or wastefully.",
    companies: ["TCS", "Wipro"]
  },
  {
    id: 4,
    category: "Quantitative",
    question: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the principal sum?",
    options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    answer: "Rs. 698",
    explanation: "S.I. for 1 year = Rs. (854 - 815) = Rs. 39. S.I. for 3 years = Rs. (39 * 3) = Rs. 117. Principal = Amount - S.I. = Rs. (815 - 117) = Rs. 698.",
    hint: "The difference in amounts over 1 year is the interest earned for that single year.",
    companies: ["Accenture", "Capgemini"]
  },
  {
    id: 5,
    category: "Logical",
    question: "Find the odd one out from the following group: 3, 5, 11, 14, 17",
    options: ["3", "11", "14", "17"],
    answer: "14",
    explanation: "All numbers in the group are prime numbers except 14, which is a composite number (divisible by 2 and 7).",
    hint: "Examine whether each number is prime (divisible only by itself and 1).",
    companies: ["Infosys", "Wipro"]
  },
  {
    id: 6,
    category: "Quantitative",
    question: "Two pipes A and B can fill a cistern in 37.5 minutes and 45 minutes respectively. Both pipes are opened. The cistern will be filled in just half an hour, if pipe B is turned off after:",
    options: ["5 min", "9 min", "10 min", "15 min"],
    answer: "9 min",
    explanation: "Let B be turned off after x minutes. Pipe A works for the entire 30 minutes. Portion filled by A in 30 min = 30 / 37.5 = 4/5. Remaining 1/5 portion is filled by B in x min: x * (1/45) = 1/5 => x = 9 minutes.",
    hint: "Pipe A runs for the entire 30 minutes. Find its contribution first, then calculate how long B runs to finish the rest.",
    companies: ["Amazon", "TCS"]
  },
  {
    id: 7,
    category: "Quantitative",
    question: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
    options: ["2 hours", "3 hours", "4 hours", "5 hours"],
    answer: "4 hours",
    explanation: "Downstream speed = Speed of boat + Speed of stream = 13 + 4 = 17 km/hr. Time taken = Distance / Speed = 68 / 17 = 4 hours.",
    hint: "Downstream speed is faster because the stream helps the boat. Add the two speeds together.",
    companies: ["Amazon", "Infosys"]
  },
  {
    id: 8,
    category: "Quantitative",
    question: "If a person sells an item for Rs. 350 and incurs a loss of 30%, at what price should he sell it to gain 20%?",
    options: ["Rs. 500", "Rs. 540", "Rs. 600", "Rs. 620"],
    answer: "Rs. 600",
    explanation: "A loss of 30% means Selling Price = 70% of Cost Price. 0.7 * CP = 350 => CP = Rs. 500. To gain 20%, new Selling Price = 500 * 1.2 = Rs. 600.",
    hint: "First find the original cost price. Selling at a 30% loss is equivalent to selling at 70% of the cost.",
    companies: ["Accenture", "TCS"]
  },
  {
    id: 9,
    category: "Quantitative",
    question: "The average age of a class of 24 students is 15 years. When the teacher's age is included, the average increases by 1 year. What is the teacher's age?",
    options: ["35 years", "38 years", "40 years", "42 years"],
    answer: "40 years",
    explanation: "Total sum of students' ages = 24 * 15 = 360 years. Total sum including the teacher = 25 * 16 = 400 years. Teacher's age = 400 - 360 = 40 years.",
    hint: "Find the sum of all ages before and after the teacher is added, then subtract the two sums.",
    companies: ["Capgemini", "Infosys"]
  },
  {
    id: 10,
    category: "Quantitative",
    question: "A and B invest in a business in the ratio 3:2. If 5% of the total profit goes to charity and A's share is Rs. 855, the total profit is:",
    options: ["Rs. 1425", "Rs. 1500", "Rs. 1537", "Rs. 1576"],
    answer: "Rs. 1500",
    explanation: "Let total profit be P. Profit after charity = 0.95P. A's share = 3/5 of 0.95P = 0.57P = Rs. 855. P = 855 / 0.57 = Rs. 1500.",
    hint: "A gets 3 parts out of 5 from the remaining 95% of profit. Solve for total profit.",
    companies: ["Amazon", "Accenture"]
  },
  {
    id: 11,
    category: "Logical",
    question: "If 'GIVE' is coded as 'VIEG' and 'OVER' is coded as 'EVRO', how will 'DISK' be coded?",
    options: ["SIKD", "KIDS", "SIDK", "KDSI"],
    answer: "SIKD",
    explanation: "The letters swap positions based on index mapping: 1st shifts to 4th, 2nd stays 2nd, 3rd shifts to 1st, 4th shifts to 3rd (indices: 1234 -> 3241). For DISK, D(1) I(2) S(3) K(4) becomes S I K D.",
    hint: "Track the movements of letters by looking at the positions: e.g. G (1st) goes to the end (4th) in VIEG.",
    companies: ["TCS", "Wipro"]
  },
  {
    id: 12,
    category: "Logical",
    question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
    options: ["His nephew's", "His son's", "His father's", "His own"],
    answer: "His son's",
    explanation: "'My father's son' must be the speaker himself since he has no siblings. Therefore, the statement simplifies to: 'that man's father is myself'. The photo is of his son.",
    hint: "Identify who 'my father's son' refers to, given that the speaker is an only child.",
    companies: ["Infosys", "Accenture"]
  },
  {
    id: 13,
    category: "Logical",
    question: "If South-East becomes North, North-East becomes West and so on, what will West become?",
    options: ["North-East", "North-West", "South-East", "South-West"],
    answer: "South-East",
    explanation: "South-East is rotated by 135 degrees counter-clockwise to become North. Applying the same 135-degree counter-clockwise rotation to West lands on South-East.",
    hint: "Draw a compass and determine the degree of shift from South-East to North (it is 135 degrees counter-clockwise).",
    companies: ["Capgemini", "Wipro"]
  },
  {
    id: 14,
    category: "Logical",
    question: "Choose the correct analogy: Light : Sun :: Heat : ?",
    options: ["Electricity", "Moon", "Fire", "Stars"],
    answer: "Fire",
    explanation: "The Sun is a primary natural source of Light. Similarly, Fire is a primary source of Heat.",
    hint: "Find the primary generator or source of the energy mentioned in the analogy.",
    companies: ["TCS", "Infosys"]
  },
  {
    id: 15,
    category: "Logical",
    question: "Insert the missing number in the series: 2, 6, 12, 20, 30, ?, 56",
    options: ["38", "40", "42", "44"],
    answer: "42",
    explanation: "The difference between terms increases by even numbers: 2 (+4) -> 6 (+6) -> 12 (+8) -> 20 (+10) -> 30. The next term should add 12: 30 + 12 = 42.",
    hint: "Check the difference between consecutive numbers: +4, +6, +8, +10...",
    companies: ["Amazon", "Capgemini"]
  },
  {
    id: 16,
    category: "Logical",
    question: "Six books are kept on top of each other. History is just above Commerce. Math is between Physics and Chemistry. English is between History and Physics. Which book is at the bottom if Chemistry is at the top?",
    options: ["Commerce", "History", "Physics", "English"],
    answer: "Commerce",
    explanation: "Order top-to-bottom: Chemistry (top), Math, Physics, English, History, Commerce. Therefore, Commerce is at the bottom.",
    hint: "Start with Chemistry at the top, and place Math and Physics below it. Then place English and History, and finally Commerce.",
    companies: ["Amazon", "TCS"]
  },
  {
    id: 17,
    category: "Verbal",
    question: "Identify the synonym of the word 'OBSTINATE':",
    options: ["Flexible", "Stubborn", "Docile", "Submissive"],
    answer: "Stubborn",
    explanation: "'Obstinate' describes someone who is extremely headstrong and refuses to alter their opinion; hence, 'Stubborn' is a direct synonym.",
    hint: "Think of someone who is difficult to persuade or refuses to change their mind.",
    companies: ["Wipro", "TCS"]
  },
  {
    id: 18,
    category: "Verbal",
    question: "Select the word that is correctly spelled:",
    options: ["Accomodation", "Accommodation", "Acomodation", "Accommadation"],
    answer: "Accommodation",
    explanation: "The correct spelling is 'Accommodation', which features double 'c' and double 'm'.",
    hint: "The word has two pairs of double letters in the middle: 'cc' and 'mm'.",
    companies: ["Capgemini", "Accenture"]
  },
  {
    id: 19,
    category: "Verbal",
    question: "Complete the sentence: If I _______ his address, I would have written to him.",
    options: ["know", "knew", "had known", "would know"],
    answer: "had known",
    explanation: "This is a Type 3 conditional (unreal past). It uses 'If + past perfect' combined with 'would have + past participle' in the main clause.",
    hint: "The main clause has 'would have written' which means the condition must be in the past perfect tense.",
    companies: ["Infosys", "Wipro"]
  },
  {
    id: 20,
    category: "Verbal",
    question: "Select the word that describes a person who hates or distrusts humankind:",
    options: ["Misanthrope", "Philanthropist", "Misogynist", "Optimist"],
    answer: "Misanthrope",
    explanation: "A 'Misanthrope' is a person who holds a general dislike or distrust of human nature. 'Philanthropist' is the opposite (humankind lover).",
    hint: "The prefix 'mis-' indicates hatred, and the root 'anthrope' refers to humans.",
    companies: ["Amazon", "Accenture"]
  },
  {
    id: 21,
    category: "Verbal",
    question: "Find the error in the sentence: 'Neither the teacher nor the students was present in the class.'",
    options: ["Neither the teacher", "nor the students", "was present", "in the class"],
    answer: "was present",
    explanation: "Under subject-verb agreement rules for 'neither... nor', the verb agrees with the closer subject. 'students' is plural, so it requires 'were present'.",
    hint: "Identify the subjects connected by 'nor' and see which one is closer to the verb.",
    companies: ["TCS", "Wipro"]
  },
  {
    id: 22,
    category: "Verbal",
    question: "What is the meaning of the idiom 'To spill the beans'?",
    options: ["To waste food", "To perform a task poorly", "To reveal a secret", "To start a fight"],
    answer: "To reveal a secret",
    explanation: "The idiom 'spill the beans' historically means to prematurely or accidentally reveal confidential information or secrets.",
    hint: "It relates to letting a secret out, usually by mistake.",
    companies: ["Capgemini", "Infosys"]
  },
  {
    id: 23,
    category: "Verbal",
    question: "Choose the correct passive voice of: 'The chef prepared a delicious meal.'",
    options: ["A delicious meal is prepared by the chef.", "A delicious meal was prepared by the chef.", "A delicious meal has been prepared by the chef.", "A delicious meal had prepared by the chef."],
    answer: "A delicious meal was prepared by the chef.",
    explanation: "The active verb 'prepared' is in the simple past. The passive construction must use 'was/were + past participle' ('was prepared').",
    hint: "Identify the tense of 'prepared' (simple past) and form the passive using 'was/were'.",
    companies: ["Accenture", "TCS"]
  },
  {
    id: 24,
    category: "Quantitative",
    question: "A sum of Rs. 12,500 amounts to Rs. 15,500 in 4 years at simple interest. What is the rate of interest?",
    options: ["5%", "6%", "7%", "8%"],
    answer: "6%",
    explanation: "Total Simple Interest = Rs. 15500 - 12500 = Rs. 3000. Interest = (P * R * T) / 100 => 3000 = (12500 * R * 4) / 100 => R = 6%.",
    hint: "Simple Interest = Amount - Principal. Use the formula: SI = (P * R * T) / 100 to solve for R.",
    companies: ["Wipro", "Infosys"]
  },
  {
    id: 25,
    category: "Quantitative",
    question: "A train passes a platform in 36 seconds and a man standing on the platform in 20 seconds. If the speed of the train is 54 km/hr, what is the length of the platform?",
    options: ["120 m", "240 m", "300 m", "360 m"],
    answer: "240 m",
    explanation: "Speed of train = 54 * (5/18) = 15 m/s. Length of train = 15 * 20 = 300 m. Let platform be P. Time to cross platform: (300 + P)/15 = 36 => 300 + P = 540 => P = 240 m.",
    hint: "First find the speed in m/s. Then find the length of the train using the time it takes to pass the standing man.",
    companies: ["Amazon", "Capgemini"]
  },
  {
    id: 26,
    category: "Quantitative",
    question: "The ratio between the present ages of P and Q is 6:7. If Q is 4 years older than P, what will be the ratio of the ages of P and Q after 4 years?",
    options: ["3:4", "7:8", "8:9", "None of these"],
    answer: "7:8",
    explanation: "Let ages be 6x and 7x. 7x - 6x = 4 => x = 4. Present ages: P = 24, Q = 28. After 4 years: P = 28, Q = 32. New Ratio = 28:32 = 7:8.",
    hint: "Use the age difference of 4 years to find their actual current ages, then add 4 to each and find the ratio.",
    companies: ["TCS", "Accenture"]
  },
  {
    id: 27,
    category: "Logical",
    question: "Which digit will appear on the face opposite to the face with number 4 in a standard dice if faces show: 1 adjacent to 2, 3; 4 adjacent to 5, 6; and 1 is opposite to 4?",
    options: ["1", "2", "3", "5"],
    answer: "1",
    explanation: "The question statement explicitly states that '1 is opposite to 4'. Thus, 1 is the opposite face.",
    hint: "Read the sentence structure closely; the relationship is declared directly at the end of the premise.",
    companies: ["Infosys", "Wipro"]
  },
  {
    id: 28,
    category: "Logical",
    question: "Find the missing number in the grid:\nRow 1: [7, 14, 21]\nRow 2: [6, 18, 36]\nRow 3: [5, 20, ?]",
    options: ["40", "60", "80", "100"],
    answer: "60",
    explanation: "Row multipliers for 1st -> 2nd term: Row 1 is *2, Row 2 is *3, Row 3 is *4. Multipliers for 2nd -> 3rd term: Row 1 is *1.5 (21), Row 2 is *2 (36), Row 3 must be *3 (60). Thus, 20 * 3 = 60.",
    hint: "Identify the arithmetic relationship within each row. The factor sequence increases logically for each step.",
    companies: ["Capgemini", "TCS"]
  },
  {
    id: 29,
    category: "Verbal",
    question: "Choose the correct option to fill in the blank: The meeting has been postponed _______ next Monday.",
    options: ["to", "until", "for", "against"],
    answer: "until",
    explanation: "'Until' is the appropriate preposition used to denote the duration/extension of delay up to a specific future point in time.",
    hint: "We are referring to the date up to which the event has been delayed.",
    companies: ["Accenture", "Wipro"]
  },
  {
    id: 30,
    category: "Verbal",
    question: "Select the word which means 'a speech or piece of writing that praises highly, typically someone who has just died':",
    options: ["Elegy", "Eulogy", "Epitaph", "Obituary"],
    answer: "Eulogy",
    explanation: "A 'Eulogy' is a formal speech or piece of writing praising a person (often recently deceased). 'Elegy' is a sad poem, 'Epitaph' is tombstone text.",
    hint: "The Greek prefix 'eu-' means 'good' or 'well', and '-logia' means speech.",
    companies: ["Amazon", "Infosys"]
  }
];

// Live leaderboard users are fetched dynamically from the database.

const BADGES = [
  { name: "Quant Overlord", desc: "100% accuracy in Math", icon: Trophy, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { name: "Streak Legend", desc: "Maintain a 7-day streak", icon: Flame, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { name: "Speedster", desc: "Solve questions under 10s", icon: Zap, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" }
];

const DAILY_CHALLENGES = [
  {
    id: "dc-1",
    title: "TCS Logic Sprint",
    desc: "Solve 5 Logical questions under 30s.",
    xp: "+150 XP",
    config: { mode: "Logical" as const, size: 5, time: 30, company: "TCS" }
  },
  {
    id: "dc-2",
    title: "Amazon Quant Extreme",
    desc: "Solve 10 Hard Quantitative questions.",
    xp: "+300 XP",
    config: { mode: "Quantitative" as const, size: 10, time: 60, company: "Amazon" }
  },
  {
    id: "dc-3",
    title: "Wipro Mixed Speed Run",
    desc: "Solve 15 mixed questions under 30s.",
    xp: "+250 XP",
    config: { mode: "Mixed" as const, size: 15, time: 30, company: "Wipro" }
  }
];

function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.35 + 0.1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${p.alpha})`; // orange-red accent particles
        ctx.fill();
      });

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.strokeStyle = "rgba(249, 115, 22, 0.025)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

export default function AptitudePractice() {
  const { user } = useAuth() as any;

  // Leaderboard State & Fetch
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/v1/student-hub/leaderboard");
      const data = await res.json();
      if (res.ok && data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error("Leaderboard load failed:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Configuration States
  const [mode, setMode] = useState<"Mixed" | "Quantitative" | "Logical" | "Verbal">("Mixed");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Company-Level">("Medium");
  const [quizSize, setQuizSize] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number>(30); // in seconds per question. 0 = no limit
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [enableCalculator, setEnableCalculator] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState(false);

  // Gameplay/Simulator States
  const [gameState, setGameState] = useState<"welcome" | "quiz" | "summary">("welcome");
  const [questionsPool, setQuestionsPool] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Navigator panels tracker arrays
  const [answersLog, setAnswersLog] = useState<{ [qId: number]: string }>({});
  const [timeSpentLog, setTimeSpentLog] = useState<{ [qId: number]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [qId: number]: boolean }>({});

  // Virtual Calculator States
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("");

  // Score summaries and XP
  const [score, setScore] = useState(0);
  const [penalties, setPenalties] = useState(0); // tracks negative marks
  const [submittingScore, setSubmittingScore] = useState(false);
  const [xpFeedback, setXpFeedback] = useState<{ baseXp: number; bonusXp: number; totalXp: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dynamic stats states
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [readinessIndex, setReadinessIndex] = useState(0);
  const [dailyGoalSolved, setDailyGoalSolved] = useState(0);

  const loadStats = () => {
    if (typeof window !== "undefined") {
      const savedStreak = localStorage.getItem("smartpicks_student_streak");
      if (savedStreak) {
        setCurrentStreak(parseInt(savedStreak));
      } else if (user && user.xp !== undefined) {
        setCurrentStreak(Math.min(30, Math.floor(user.xp / 100)));
      }

      const savedSolved = localStorage.getItem("smartpicks_student_solved");
      if (savedSolved) {
        setQuestionsSolved(parseInt(savedSolved));
      } else if (user && user.xp !== undefined) {
        setQuestionsSolved(Math.floor(user.xp / 8));
      }

      const savedHistory = localStorage.getItem("smartpicks_aptitude_history");
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          if (Array.isArray(history) && history.length > 0) {
            const totalAcc = history.reduce((sum, item) => sum + (item.accuracy || 0), 0);
            const avgAcc = Math.round(totalAcc / history.length);
            setOverallAccuracy(avgAcc);

            const totalSolved = history.reduce((sum, item) => sum + (item.score || 0), 0);
            setQuestionsSolved(totalSolved);

            const readiness = Math.min(98, Math.round(avgAcc * 0.7 + Math.min(30, (totalSolved / 10) * 30)));
            setReadinessIndex(readiness);

            const todayStr = new Date().toDateString();
            const todaySolved = history
              .filter(item => new Date(item.date).toDateString() === todayStr)
              .reduce((sum, item) => sum + (item.score || 0), 0);
            setDailyGoalSolved(Math.min(10, todaySolved));
            return;
          }
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
      
      if (user && user.xp !== undefined) {
        setOverallAccuracy(user.xp > 0 ? Math.min(96, 72 + Math.floor((user.xp % 250) / 10)) : 0);
        setReadinessIndex(user.xp > 0 ? Math.min(98, Math.round((user.xp > 0 ? Math.min(96, 72 + Math.floor((user.xp % 250) / 10)) : 0) * 0.7 + (Math.floor(user.xp / 8) / 300) * 30)) : 0);
        setDailyGoalSolved(Math.min(10, Math.floor((user.xp % 100) / 10)));
      } else {
        setOverallAccuracy(0);
        setReadinessIndex(0);
        setDailyGoalSolved(0);
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  // Custom spotlight tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const questionStartTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Web Audio Synth
  const playTone = (freq: number, type: "sine" | "triangle" | "sawtooth", duration: number, volume: number = 0.05) => {
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
      // Audio synth silent fail
    }
  };

  const playClick = () => playTone(600, "sine", 0.08, 0.03);
  const playCorrect = () => {
    playTone(523.25, "triangle", 0.12, 0.05); // C5
    setTimeout(() => playTone(659.25, "triangle", 0.12, 0.05), 80); // E5
    setTimeout(() => playTone(783.99, "triangle", 0.25, 0.05), 160); // G5
  };
  const playIncorrect = () => {
    playTone(150, "sawtooth", 0.25, 0.05);
  };
  const playComplete = () => {
    playTone(523.25, "sine", 0.15, 0.05);
    setTimeout(() => playTone(587.33, "sine", 0.15, 0.05), 150);
    setTimeout(() => playTone(659.25, "sine", 0.15, 0.05), 300);
    setTimeout(() => playTone(783.99, "sine", 0.4, 0.05), 450);
  };

  // Timer Countdown loop
  useEffect(() => {
    if (gameState !== "quiz" || timeLimit === 0) return;

    setTimeLeft(timeLimit);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, gameState, timeLimit]);

  const handleTimeout = () => {
    playIncorrect();
    const currentQ = questionsPool[currentIdx];
    const duration = timeLimit;
    
    setTimeSpentLog((prev) => ({ ...prev, [currentQ.id]: duration }));
    setAnswersLog((prev) => ({ ...prev, [currentQ.id]: "Timeout" }));
    setSelectedAnswer("Timeout");
    
    if (negativeMarking) {
      setPenalties((prev) => prev + 0.25);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questionsPool[currentIdx];
    const duration = Math.round((Date.now() - questionStartTime.current) / 1000);
    
    setTimeSpentLog((prev) => ({ ...prev, [currentQ.id]: duration }));
    setAnswersLog((prev) => ({ ...prev, [currentQ.id]: option }));

    const isCorrect = option === currentQ.answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      playCorrect();
    } else {
      playIncorrect();
      if (negativeMarking) {
        setPenalties((prev) => prev + 0.25);
      }
    }
  };

  const startTest = () => {
    playClick();

    // Compile the pool
    let pool = [...QUESTIONS];
    
    if (isRevisionMode) {
      // Revision mode pulls questions that are commonly flagged or simulated weak items
      pool = pool.filter((q) => q.id % 2 === 0);
    }

    // Filter by mode/category
    if (mode !== "Mixed") {
      pool = pool.filter((q) => q.category === mode);
    }

    // Filter by target company
    if (selectedCompany) {
      pool = pool.filter((q) => q.companies?.includes(selectedCompany));
    }

    // Fallback if filtering returns zero questions
    if (pool.length === 0) {
      pool = [...QUESTIONS].filter((q) => q.category === (mode === "Mixed" ? "Quantitative" : mode));
    }

    // Shuffle using Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const testPool = pool.slice(0, Math.min(quizSize, pool.length));
    
    setQuestionsPool(testPool);
    setAnswersLog({});
    setTimeSpentLog({});
    setFlaggedQuestions({});
    setGameState("quiz");
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setScore(0);
    setPenalties(0);
    setCalcOpen(false);
    setCalcDisplay("");
    questionStartTime.current = Date.now();
  };

  const startDailyChallenge = (challenge: typeof DAILY_CHALLENGES[0]) => {
    playClick();
    setMode(challenge.config.mode);
    setQuizSize(challenge.config.size);
    setTimeLimit(challenge.config.time);
    setSelectedCompany(challenge.config.company);
    setDifficulty("Company-Level");
    setIsRevisionMode(false);

    let pool = [...QUESTIONS];
    if (challenge.config.mode !== "Mixed") {
      pool = pool.filter((q) => q.category === challenge.config.mode);
    }
    if (challenge.config.company) {
      pool = pool.filter((q) => q.companies?.includes(challenge.config.company));
    }
    if (pool.length === 0) {
      pool = [...QUESTIONS].filter((q) => q.category === challenge.config.mode);
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const testPool = pool.slice(0, Math.min(challenge.config.size, pool.length));
    setQuestionsPool(testPool);
    setAnswersLog({});
    setTimeSpentLog({});
    setFlaggedQuestions({});
    setGameState("quiz");
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setScore(0);
    setPenalties(0);
    setCalcOpen(false);
    setCalcDisplay("");
    questionStartTime.current = Date.now();
  };

  // Submit test and trigger rewards
  const submitTest = async () => {
    playComplete();
    setGameState("summary");

    // Confetti
    if (score >= Math.ceil(questionsPool.length * 0.7)) {
      try {
        const confettiModule = await import("canvas-confetti");
        confettiModule.default({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti silent fail
      }
    }

    // Save test results to localStorage history
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("smartpicks_aptitude_history");
      let history = [];
      if (savedHistory) {
        try { history = JSON.parse(savedHistory); } catch {}
      }
      const actualScore = Math.max(0, score - penalties);
      const testAccuracy = Math.round((actualScore / questionsPool.length) * 100);
      
      history.push({
        score: actualScore,
        total: questionsPool.length,
        accuracy: testAccuracy,
        date: new Date().toISOString()
      });
      localStorage.setItem("smartpicks_aptitude_history", JSON.stringify(history));

      // Update global solved count in localStorage
      const currentGlobalSolved = parseInt(localStorage.getItem("smartpicks_student_solved") || "0");
      const nextGlobalSolved = currentGlobalSolved + actualScore;
      localStorage.setItem("smartpicks_student_solved", nextGlobalSolved.toString());

      // Update global streak if score is non-zero
      if (actualScore > 0) {
        const currentGlobalStreak = parseInt(localStorage.getItem("smartpicks_student_streak") || "0");
        const nextGlobalStreak = currentGlobalStreak + 1;
        localStorage.setItem("smartpicks_student_streak", nextGlobalStreak.toString());
      }
      
      loadStats();
    }

    if (!user) return;
    
    setSubmittingScore(true);
    try {
      const computedScore = Math.max(0, score - penalties);
      const res = await fetch("/api/v1/student-hub/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: Math.round(computedScore), totalQuestions: questionsPool.length }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setXpFeedback({
          baseXp: data.bonusXp > 0 ? (data.bonusXp - 10) : 10,
          bonusXp: data.bonusXp || 0,
          totalXp: data.totalXp,
        });
        fetchLeaderboard();
      }
    } catch {
      // Silent error
    } finally {
      setSubmittingScore(false);
    }
  };

  // Scientific Calculator functionality
  const handleCalcPress = (val: string) => {
    playClick();
    if (val === "C") {
      setCalcDisplay("");
    } else if (val === "⌫") {
      setCalcDisplay(calcDisplay.slice(0, -1));
    } else if (val === "=") {
      try {
        // Safe evaluation
        const sanitized = calcDisplay.replace(/x/g, "*").replace(/÷/g, "/");
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcDisplay(String(Number(res).toFixed(4).replace(/\.?0+$/, "")));
      } catch {
        setCalcDisplay("Error");
      }
    } else {
      if (calcDisplay === "Error") {
        setCalcDisplay(val);
      } else {
        setCalcDisplay(calcDisplay + val);
      }
    }
  };

  // Statistics Computations
  const dailyGoalPercentage = dailyGoalSolved * 10;

  const pathD = user 
    ? "M 10,80 L 58,75 L 106,70 L 154,72 L 202,60 L 250,55 L 290,48" 
    : "M 10,90 L 58,90 L 106,90 L 154,90 L 202,90 L 250,90 L 290,90";
  const areaD = user
    ? "M 10,80 L 58,75 L 106,70 L 154,72 L 202,60 L 250,55 L 290,48 L 290,95 L 10,95 Z"
    : "M 10,90 L 58,90 L 106,90 L 154,90 L 202,90 L 250,90 L 290,90 L 290,95 L 10,95 Z";
  const dots = user
    ? [
        { cx: 10, cy: 80 },
        { cx: 58, cy: 75 },
        { cx: 106, cy: 70 },
        { cx: 154, cy: 72 },
        { cx: 202, cy: 60 },
        { cx: 250, cy: 55 },
        { cx: 290, cy: 48 }
      ]
    : [
        { cx: 10, cy: 90 },
        { cx: 58, cy: 90 },
        { cx: 106, cy: 90 },
        { cx: 154, cy: 90 },
        { cx: 202, cy: 90 },
        { cx: 250, cy: 90 },
        { cx: 290, cy: 90 }
      ];

  const predictedScore = useMemo(() => {
    let accuracyFactor = 80;
    if (difficulty === "Easy") accuracyFactor = 92;
    if (difficulty === "Hard") accuracyFactor = 68;
    if (selectedCompany === "Amazon") accuracyFactor = 64;
    return accuracyFactor;
  }, [difficulty, selectedCompany]);

  const recommendedTopics = useMemo(() => {
    if (mode === "Quantitative") return ["Probability", "Permutations & Combinations", "Pipes & Cisterns"];
    if (mode === "Logical") return ["Blood Relations", "Syllogisms", "Direction Sense"];
    if (mode === "Verbal") return ["Subject-Verb Agreement", "Spelling", "Idioms"];
    return ["Circadian Task Allocation", "Carbon Transit Calculations", "Multi-modal Logic Engines"];
  }, [mode]);

  return (
    <div 
      className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans antialiased relative overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(234, 88, 12, 0.08) 0%, transparent 50%)`
      }}
    >
      <CanvasParticles />
      {/* Animated glowing backdrop bubbles */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-orange-600/5 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-red-600/5 blur-3xl pointer-events-none animate-pulse" />

      {/* ──────────────────────────────────────────────────────────────────────────────
          1. STICKY NAVBAR
          ────────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-zinc-950/60 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {gameState !== "welcome" ? (
              <button
                onClick={() => {
                  playClick();
                  setGameState("welcome");
                }}
                className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <Link 
                href="/student-hub"
                onClick={playClick}
                className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-orange-500 tracking-widest">
                Placement Hub
              </span>
              <span className="text-sm font-extrabold text-zinc-100">Aptitude Practice OS</span>
            </div>
          </div>

          {/* Quick Stats Search Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl max-w-xs focus-within:border-orange-500/50 transition-all duration-300">
              <Search className="h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search practice plans..." 
                className="bg-transparent border-none outline-none text-xs text-zinc-300 placeholder:text-zinc-600 font-semibold"
              />
            </div>

            {/* Streaks */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/25 rounded-xl">
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-xs font-black text-orange-500">{currentStreak} Day Streak</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl">
              <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-black text-yellow-500">{(user?.xp || 0).toLocaleString("en-IN")} XP</span>
            </div>

            {/* Mute button */}
            <button 
              onClick={() => { setSoundEnabled(!soundEnabled); playClick(); }}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-orange-500" /> : <VolumeX className="h-4 w-4" />}
            </button>


          </div>
        </div>
      </header>

      {/* Main dynamic gameplay routers */}
      <AnimatePresence mode="wait">
        {/* ──────────────────────────────────────────────────────────────────────────────
            2. WELCOME DASHBOARD STATE
            ────────────────────────────────────────────────────────────────────────────── */}
        {gameState === "welcome" && (
          <motion.main 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
          >
            {/* HEROS SECTIONS */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Placement Readiness Card */}
              <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/35 backdrop-blur-xl p-6 flex flex-col justify-between h-40 group hover:border-orange-500/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-2xl group-hover:bg-orange-600/10 transition-all duration-300" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Readiness Score</h4>
                    <p className="text-3xl font-black text-zinc-100 mt-1">{readinessIndex}%</p>
                  </div>
                  <Activity className="h-5 w-5 text-orange-500 animate-pulse" />
                </div>
                <div className="w-full relative z-10">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                    <span>Target readiness: 90%+</span>
                    <span>{user ? (readinessIndex >= 90 ? "Ready for placement" : "Keep practicing") : "Sign in to calculate"}</span>
                  </div>
                  <div className="w-full bg-zinc-950/80 rounded-full h-2 overflow-hidden border border-zinc-900">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full" style={{ width: `${readinessIndex}%` }} />
                  </div>
                </div>
              </div>

              {/* Accuracy Rate */}
              <div className="rounded-3xl border border-white/5 bg-neutral-900/35 backdrop-blur-xl p-6 flex flex-col justify-between h-40 group hover:border-orange-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all duration-300" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Average Accuracy</h4>
                    <p className="text-3xl font-black text-zinc-100 mt-1">{overallAccuracy}%</p>
                  </div>
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 relative z-10">
                  {user ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5" /> +2.4% than last week
                    </>
                  ) : (
                    <span className="text-zinc-550">No activity this week</span>
                  )}
                </div>
              </div>

              {/* Solved Questions */}
              <div className="rounded-3xl border border-white/5 bg-neutral-900/35 backdrop-blur-xl p-6 flex flex-col justify-between h-40 group hover:border-orange-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Solved / Total</h4>
                    <p className="text-3xl font-black text-zinc-100 mt-1">{questionsSolved}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-[10px] font-bold text-zinc-500 relative z-10">
                  {user ? "Goal: solve 250 problems" : "Sign in to track progress"}
                </div>
              </div>

              {/* Daily Goal progress */}
              <div className="rounded-3xl border border-white/5 bg-neutral-900/35 backdrop-blur-xl p-6 flex flex-col justify-between h-40 group hover:border-orange-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Daily Goal</h4>
                    <p className="text-3xl font-black text-zinc-100 mt-1">{dailyGoalSolved} / 10</p>
                  </div>
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-[10px] font-bold text-zinc-500 relative z-10">
                  {user ? `${dailyGoalPercentage}% completed today` : "Sign in to set goals"}
                </div>
              </div>
            </section>

            {/* THREE COLUMN GRID */}
            <div className="grid lg:grid-cols-4 gap-8">
              {/* LEFT SIDEBAR (CONFIGURATIONS) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-neutral-900/35 border border-white/5 backdrop-blur-xl rounded-3xl p-5 space-y-5">
                  <h3 className="text-xs font-black uppercase text-orange-500 tracking-wider flex items-center gap-1.5 pb-3 border-b border-zinc-800/80">
                    <Settings className="h-4 w-4" /> Config board
                  </h3>

                  {/* Mode select */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Category mode</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["Mixed", "Quantitative", "Logical", "Verbal"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { playClick(); setMode(cat); setSelectedCompany(null); }}
                          className={`py-2 px-1 text-[10px] font-extrabold rounded-xl border text-center transition-all cursor-pointer ${
                            mode === cat && !selectedCompany
                              ? "bg-gradient-to-br from-orange-500/15 to-red-500/5 border-orange-500/60 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                              : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty level */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Difficulty</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["Easy", "Medium", "Hard", "Company-Level"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => { playClick(); setDifficulty(lvl); }}
                          className={`py-2 px-1 text-[10px] font-extrabold rounded-xl border text-center transition-all cursor-pointer ${
                            difficulty === lvl
                              ? "bg-gradient-to-br from-orange-500/15 to-red-500/5 border-orange-500/60 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                              : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size count */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Number of questions</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[5, 10, 15, 20].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => { playClick(); setQuizSize(sz); }}
                          className={`py-1.5 text-[10px] font-extrabold rounded-lg border text-center transition-all cursor-pointer ${
                            quizSize === sz
                              ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                              : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timer per question */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Time limit per q</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: "Untimed", value: 0 },
                        { label: "30s", value: 30 },
                        { label: "60s", value: 60 }
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => { playClick(); setTimeLimit(t.value); }}
                          className={`py-1.5 text-[9px] font-extrabold rounded-lg border text-center transition-all cursor-pointer ${
                            timeLimit === t.value
                              ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                              : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3.5 border-t border-zinc-800 pt-3">
                    {/* Negative marking */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-200">Negative marking</span>
                        <span className="text-[9px] text-zinc-500">-0.25 on wrong answers</span>
                      </div>
                      <button
                        onClick={() => { playClick(); setNegativeMarking(!negativeMarking); }}
                        className={`w-9 h-5 rounded-full relative p-0.5 cursor-pointer transition-all ${
                          negativeMarking ? "bg-orange-500" : "bg-zinc-800"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white transition-all ${negativeMarking ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* Virtual calculator */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-200">Virtual calculator</span>
                        <span className="text-[9px] text-zinc-500">In-game sidebar calculator</span>
                      </div>
                      <button
                        onClick={() => { playClick(); setEnableCalculator(!enableCalculator); }}
                        className={`w-9 h-5 rounded-full relative p-0.5 cursor-pointer transition-all ${
                          enableCalculator ? "bg-orange-500" : "bg-zinc-800"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white transition-all ${enableCalculator ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* Revision Mode */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-200">Revision Mode</span>
                        <span className="text-[9px] text-zinc-500">Practice weak/incorrect items</span>
                      </div>
                      <button
                        onClick={() => { playClick(); setIsRevisionMode(!isRevisionMode); }}
                        className={`w-9 h-5 rounded-full relative p-0.5 cursor-pointer transition-all ${
                          isRevisionMode ? "bg-orange-500" : "bg-zinc-800"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white transition-all ${isRevisionMode ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Company specific tests */}
                  <div className="space-y-2 border-t border-zinc-800 pt-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Company-specific tests</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["Amazon", "TCS", "Infosys", "Accenture", "Wipro", "Capgemini"].map((comp) => (
                        <button
                          key={comp}
                          onClick={() => {
                            playClick();
                            setSelectedCompany(selectedCompany === comp ? null : comp);
                            setDifficulty("Company-Level");
                          }}
                          className={`py-1.5 px-1 text-[9px] font-black rounded-lg border text-center transition-all cursor-pointer ${
                            selectedCompany === comp
                              ? "border-orange-500 bg-orange-500/10 text-orange-500"
                              : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-500"
                          }`}
                        >
                          {comp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN (MOCK TEST PREVIEW & START) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Simulator dashboard preview card */}
                <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-950/80 p-8 shadow-xl flex flex-col justify-between min-h-[360px] group">
                  {/* Glowing absolute badges */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          Active exam spec
                        </span>
                        <h2 className="text-2xl font-black text-zinc-100 tracking-tight pt-2">
                          {selectedCompany ? `${selectedCompany} Placement Mock` : `${mode} Aptitude Practice`}
                        </h2>
                      </div>
                      <span className="px-3 py-1.5 rounded-full text-xs font-black bg-zinc-800 border border-zinc-700 text-zinc-300">
                        {difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-y border-zinc-800/80 py-4 text-left">
                      <div>
                        <span className="text-[8px] font-black uppercase text-zinc-500">Total size</span>
                        <p className="text-sm font-extrabold text-zinc-200 mt-0.5">{quizSize} Questions</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-zinc-500">Duration</span>
                        <p className="text-sm font-extrabold text-zinc-200 mt-0.5">
                          {timeLimit > 0 ? `${Math.round((timeLimit * quizSize) / 60)} minutes` : "Untimed"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-zinc-500">Total marks</span>
                        <p className="text-sm font-extrabold text-zinc-200 mt-0.5">
                          +{quizSize}.0 / {negativeMarking ? `-${(0.25 * quizSize).toFixed(1)}` : "0"}
                        </p>
                      </div>
                    </div>

                    {/* AI Score prediction */}
                    <div className="bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl p-4 flex gap-3 items-start">
                      <Zap className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        {user ? (
                          <>
                            <h4 className="text-xs font-black text-orange-500 uppercase tracking-wide">
                              AI Predicted Score: {predictedScore}%
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                              Based on your previous {questionsSolved} questions and {overallAccuracy}% accuracy, you are projected to score in the top 15% on this test board.
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="text-xs font-black text-orange-500 uppercase tracking-wide">
                              AI Score Prediction Locked
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                              Sign in to allow the AI to analyze your practice history and project your placement exam readiness scores.
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Recommended topics */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] font-black text-zinc-500 uppercase">Focus Topics:</span>
                      {recommendedTopics.map((topic) => (
                        <span key={topic} className="px-2 py-0.5 bg-zinc-800/50 border border-zinc-800 text-[10px] font-bold text-zinc-300 rounded-md">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pulsing play button */}
                  <div className="pt-8">
                    <button
                      onClick={startTest}
                      className="w-full relative flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-2xl border border-white/20 animate-ping pointer-events-none opacity-40" />
                      <Play className="h-4 w-4 fill-white" /> Start test simulator
                    </button>
                  </div>
                </div>

                {/* Placement Readiness Trend SVG Line Chart */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-orange-500" /> Placement Readiness Trend
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {user ? "+19% this month" : "0% delta"}
                    </span>
                  </div>
                  <div className="h-28 w-full flex items-end">
                    <svg viewBox="0 0 300 100" className="w-full h-full">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="3 3" />
                      
                      {/* Path line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Area fill */}
                      <path
                        d={areaD}
                        fill="url(#areaGradient)"
                      />
                      
                      {/* Data dots */}
                      {dots.map((dot, index) => (
                        <circle
                          key={index}
                          cx={dot.cx}
                          cy={dot.cy}
                          r="4"
                          fill="#ea580c"
                          stroke="#09090b"
                          strokeWidth="1.5"
                        />
                      ))}
                      
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-zinc-500 px-1 pt-1">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR (LEADERBOARD, BADGES, DAILY CHALLENGES, ANALYTICS & STUDY RECS) */}
              <div className="lg:col-span-1 space-y-6">
                {/* Leaderboard */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard standings
                  </h4>
                  <div className="space-y-3">
                    {leaderboard.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4 font-semibold">No standings logged yet.</p>
                    ) : (
                      leaderboard.slice(0, 5).map((lead, idx) => {
                        const rank = idx + 1;
                        const initialLetter = lead.name
                          ? lead.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                          : "?";
                        return (
                          <div key={lead._id || idx} className="flex items-center justify-between gap-3 text-left animate-fadeIn">
                            <div className="flex items-center gap-2.5">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                idx === 0 
                                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" 
                                  : idx === 1 
                                    ? "bg-zinc-300/10 text-zinc-300 border border-zinc-400/20"
                                    : "bg-zinc-950 text-zinc-400"
                              }`}>
                                {initialLetter}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-200">{lead.name}</span>
                                <span className="text-[9px] text-zinc-500">Rank #{rank}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-zinc-400">
                              {(lead.xp || 0).toLocaleString("en-IN")} XP
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Badges shelves */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-orange-500" /> Unlocked Badges
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {BADGES.map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <div key={badge.name} className="flex flex-col items-center text-center p-2 rounded-xl border border-zinc-800/60 bg-zinc-950/40 group hover:border-orange-500/20 transition-all cursor-pointer">
                          <div className={`p-2 rounded-lg border ${badge.color} group-hover:scale-105 transition-transform`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[8px] font-black text-zinc-300 mt-1.5 truncate w-full">{badge.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Challenges */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-orange-500 fill-orange-500 animate-bounce" /> Daily Challenges
                  </h4>
                  <div className="space-y-3">
                    {DAILY_CHALLENGES.map((challenge) => (
                      <div key={challenge.id} className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-zinc-200">{challenge.title}</span>
                            <p className="text-[9px] text-zinc-500 font-semibold">{challenge.desc}</p>
                          </div>
                          <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                            {challenge.xp}
                          </span>
                        </div>
                        <button
                          onClick={() => startDailyChallenge(challenge)}
                          className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-black uppercase tracking-wider text-zinc-300 hover:text-orange-500 border border-zinc-800 hover:border-orange-500/30 rounded-xl transition-all cursor-pointer"
                        >
                          Launch Challenge
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SVG radar stats visualization */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-orange-500" /> Topic strengths
                  </h3>

                  {/* Responsive Radar Polygon SVG */}
                  <div className="flex justify-center py-2">
                    <svg viewBox="0 0 160 160" className="w-36 h-36">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#27272a" strokeWidth="0.5" />
                      <circle cx="80" cy="80" r="50" fill="none" stroke="#27272a" strokeWidth="0.5" />
                      <circle cx="80" cy="80" r="30" fill="none" stroke="#27272a" strokeWidth="0.5" />
                      {/* Axis lines */}
                      <line x1="80" y1="10" x2="80" y2="150" stroke="#27272a" strokeWidth="0.5" />
                      <line x1="10" y1="80" x2="150" y2="80" stroke="#27272a" strokeWidth="0.5" />
                      <line x1="30" y1="30" x2="130" y2="130" stroke="#27272a" strokeWidth="0.5" />
                      <line x1="130" y1="30" x2="30" y2="130" stroke="#27272a" strokeWidth="0.5" />
                      
                      {/* Topic Labels */}
                      <text x="80" y="8" textAnchor="middle" fill="#71717a" fontSize="6.5" fontWeight="bold">Quant</text>
                      <text x="148" y="83" textAnchor="start" fill="#71717a" fontSize="6.5" fontWeight="bold">Logical</text>
                      <text x="12" y="83" textAnchor="end" fill="#71717a" fontSize="6.5" fontWeight="bold">Verbal</text>
                      <text x="80" y="156" textAnchor="middle" fill="#71717a" fontSize="6.5" fontWeight="bold">Speed</text>

                      {/* Custom Polygon based on stats */}
                      <polygon 
                        points="80,20 135,80 80,125 35,80" 
                        fill="rgba(234, 88, 12, 0.15)" 
                        stroke="#ea580c" 
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 border-t border-zinc-800 pt-3">
                    <span>Weakness: Logical</span>
                    <span>Strength: Quant</span>
                  </div>
                </div>

                {/* Study plan list */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-orange-500" /> AI study recommendations
                  </h4>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-zinc-200">Logical Reasoning</span>
                        <span className="text-orange-500">20 Qs</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-semibold leading-normal">
                        Accuracy drops by 20% on blood relation problems with more than three relations.
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-zinc-200">Quantitative</span>
                        <span className="text-emerald-500">Proficient</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-semibold leading-normal">
                        You answer train speed problems in under 12 seconds with 94% accuracy. Moving to Hard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.main>
        )}

        {/* ──────────────────────────────────────────────────────────────────────────────
            3. FULLSCREEN TEST SIMULATOR
            ────────────────────────────────────────────────────────────────────────────── */}
        {gameState === "quiz" && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#09090B] flex flex-col select-none"
          >
            {/* Header */}
            <div className="h-16 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md px-6 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  Exam Session Mode
                </span>
                {isRevisionMode && (
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    Revision Mode
                  </span>
                )}
                <span className="text-sm font-extrabold text-zinc-200">
                  {selectedCompany ? `${selectedCompany} Placement Mock` : `${mode} Aptitude Practice`}
                </span>
              </div>

              {/* Timer & Submit */}
              <div className="flex items-center gap-4">
                {timeLimit > 0 ? (
                  <div className="flex items-center gap-2.5 bg-zinc-950/60 border border-zinc-800/80 px-3.5 py-1.5 rounded-2xl relative z-10 shadow-sm">
                    <div className="relative h-7 w-7 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="14" cy="14" r="10" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" fill="transparent" />
                        <circle
                          cx="14"
                          cy="14"
                          r="10"
                          stroke={timeLeft <= 8 ? "#ef4444" : timeLeft <= 15 ? "#f59e0b" : "#10b981"}
                          strokeWidth="2.5"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 10}`}
                          strokeDashoffset={`${2 * Math.PI * 10 * (1 - timeLeft / timeLimit)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute flex items-center justify-center">
                        <span className={`text-[10px] font-black ${timeLeft <= 8 ? "text-red-400 animate-pulse" : "text-zinc-200"}`}>{timeLeft}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Sec remaining</span>
                  </div>
                ) : (
                  <div className="px-3.5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-950/60 border border-zinc-850">
                    Study Mode (No limit)
                  </div>
                )}

                <button
                  onClick={submitTest}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Submit test
                </button>
              </div>
            </div>

            {/* Split workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT SIDEBAR (QUESTION GRID NAVIGATIONS & TOOLS) */}
              <div className="w-64 border-r border-zinc-800/80 bg-zinc-950/40 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
                <div className="space-y-6">
                  {/* Navigator count */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                      <span>Questions Grid</span>
                      <span>{Object.keys(answersLog).length} / {questionsPool.length} answered</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {questionsPool.map((q, idx) => {
                        const isCurrent = currentIdx === idx;
                        const isAnswered = answersLog[q.id] !== undefined;
                        const isFlagged = flaggedQuestions[q.id] === true;

                        let blockStyle = "bg-zinc-950 border-zinc-850 text-zinc-500 hover:border-zinc-700";
                        if (isCurrent) {
                          blockStyle = "border-orange-500 text-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5";
                        } else if (isFlagged) {
                          blockStyle = "border-yellow-500 text-yellow-500 bg-yellow-500/10";
                        } else if (isAnswered) {
                          blockStyle = "border-emerald-500 text-emerald-500 bg-emerald-500/10";
                        }

                        return (
                          <button
                            key={q.id}
                            onClick={() => { playClick(); setCurrentIdx(idx); setSelectedAnswer(answersLog[q.id] || null); setShowHint(false); }}
                            className={`h-10 w-full rounded-xl border font-black text-xs flex items-center justify-center transition-all cursor-pointer ${blockStyle}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Indicators info */}
                  <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400">
                      <div className="h-2.5 w-2.5 rounded bg-emerald-500/20 border border-emerald-500" /> Solved
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400">
                      <div className="h-2.5 w-2.5 rounded bg-yellow-500/20 border border-yellow-500" /> Flagged
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400">
                      <div className="h-2.5 w-2.5 rounded bg-orange-500/20 border border-orange-500" /> Active
                    </div>
                  </div>
                </div>

                {/* Virtual Calculator Toggle */}
                {enableCalculator && (
                  <div className="pt-6 border-t border-zinc-800 mt-6 relative">
                    <button
                      onClick={() => { playClick(); setCalcOpen(!calcOpen); }}
                      className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Calculator className="h-4 w-4" /> {calcOpen ? "Hide Calculator" : "Show Calculator"}
                    </button>

                    {/* Scientific Calculator Box Drawer */}
                    {calcOpen && (
                      <div className="absolute bottom-14 left-0 w-[240px] bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-2xl space-y-2 z-50 animate-fadeIn">
                        {/* Display screen */}
                        <div className="h-10 bg-zinc-900/60 border border-zinc-850 rounded-xl px-2.5 flex items-center justify-end font-mono text-sm text-zinc-100 overflow-x-auto truncate">
                          {calcDisplay || "0"}
                        </div>

                        {/* Keys Grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {["C", "(", ")", "÷", "7", "8", "9", "x", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "⌫", "="].map((char) => (
                            <button
                              key={char}
                              onClick={() => handleCalcPress(char)}
                              className={`h-8 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer transition-colors ${
                                char === "=" 
                                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                                  : char === "C" || char === "⌫"
                                    ? "bg-zinc-800/80 hover:bg-zinc-800 text-orange-500 font-black"
                                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              {char}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CENTER WORKSPACE (ACTIVE QUESTION CARD PANEL) */}
              <div className="flex-1 bg-zinc-950 p-8 flex flex-col justify-between overflow-y-auto">
                <div className="max-w-3xl w-full mx-auto space-y-8">
                  {/* Category and active status */}
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-orange-500 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      {questionsPool[currentIdx].category} Question
                    </span>
                    <button
                      onClick={() => {
                        playClick();
                        setFlaggedQuestions((prev) => ({
                          ...prev,
                          [questionsPool[currentIdx].id]: !prev[questionsPool[currentIdx].id]
                        }));
                      }}
                      className={`p-2 border rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        flaggedQuestions[questionsPool[currentIdx].id]
                          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400"
                      }`}
                    >
                      <Flag className="h-4 w-4" /> {flaggedQuestions[questionsPool[currentIdx].id] ? "Flagged for Review" : "Flag Question"}
                    </button>
                  </div>

                  {/* Question Text */}
                  <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-zinc-100 leading-relaxed">
                      <span className="text-orange-500 mr-2">Q{currentIdx + 1}.</span>
                      {questionsPool[currentIdx].question}
                    </h3>

                    {/* Hint */}
                    {showHint ? (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-xs font-semibold text-yellow-500 flex gap-2 animate-fadeIn">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-yellow-500" />
                        <div>
                          <strong>Hint:</strong> {questionsPool[currentIdx].hint}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { playClick(); setShowHint(true); }}
                        className="text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="h-3.5 w-3.5" /> Need a hint?
                      </button>
                    )}
                  </div>

                  {/* Option responses */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {questionsPool[currentIdx].options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === opt;
                      const hasSubmitted = selectedAnswer !== null;

                      let blockStyle = "bg-neutral-900/35 border-white/5 hover:border-orange-500/30 hover:bg-neutral-900/45";
                      if (isSelected) {
                        blockStyle = "border-orange-500/50 bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.06)]";
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswerSelect(opt)}
                          disabled={hasSubmitted}
                          className={`p-5 text-left text-xs sm:text-sm font-extrabold rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer ${blockStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${
                              isSelected ? "bg-orange-500 text-white" : "bg-neutral-950/80 border border-neutral-900 text-zinc-500"
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className={isSelected ? "text-white" : "text-zinc-300"}>{opt}</span>
                          </div>
                          {isSelected && <Check className="h-4.5 w-4.5 text-orange-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom actions navigator */}
                <div className="max-w-3xl w-full mx-auto border-t border-zinc-800 pt-6 flex justify-between items-center gap-4 shrink-0">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => {
                      playClick();
                      setCurrentIdx(currentIdx - 1);
                      setSelectedAnswer(answersLog[questionsPool[currentIdx - 1].id] || null);
                      setShowHint(false);
                    }}
                    className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 disabled:opacity-30 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Previous
                  </button>

                  {selectedAnswer && (
                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
                      Answer locked successfully
                    </div>
                  )}

                  {currentIdx + 1 < questionsPool.length ? (
                    <button
                      onClick={() => {
                        playClick();
                        setCurrentIdx(currentIdx + 1);
                        setSelectedAnswer(answersLog[questionsPool[currentIdx + 1].id] || null);
                        setShowHint(false);
                      }}
                      className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      Skip / Next <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={submitTest}
                      className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Finish Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────────────────────────────────────────
            4. SCORE SUMMARY REVIEW STATE
            ────────────────────────────────────────────────────────────────────────────── */}
        {gameState === "summary" && (
          <motion.main
            key="summary"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
          >
            {/* Main Score panel board */}
            <div className="bg-neutral-900/35 border border-white/5 backdrop-blur-xl rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl hover:border-orange-500/10 transition-colors duration-300">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-600" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">
                Exam scoreboard
              </span>

              <div className="flex justify-center items-center gap-2 mt-4">
                <h2 className="text-6xl font-black text-orange-500 tracking-tighter">
                  {score}
                </h2>
                <span className="text-2xl font-black text-zinc-550">/ {questionsPool.length}</span>
              </div>

              <div className="space-y-1.5 max-w-md mx-auto mt-4">
                <h4 className="font-extrabold text-zinc-100 text-base">
                  {score >= Math.ceil(questionsPool.length * 0.8)
                    ? "Exceptional! Ready for top placement opportunities."
                    : score >= Math.ceil(questionsPool.length * 0.5)
                      ? "Good performance. Review weaker topics to master speeds."
                      : "Attempt again to grow and reinforce concepts."}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                  You resolved {score} out of {questionsPool.length} problems with {negativeMarking ? `${penalties.toFixed(2)} negative marking penalties` : "no penalty marks"}.
                </p>
              </div>

              {/* Statistics grid */}
              <div className="grid grid-cols-3 gap-4 border-y border-neutral-800/50 py-5 max-w-lg mx-auto mt-6">
                <div>
                  <span className="text-[8px] font-black uppercase text-zinc-500">Accuracy rate</span>
                  <p className="text-lg font-black text-zinc-200 mt-0.5 flex items-center justify-center gap-1">
                    <Award className="h-4 w-4 text-yellow-500" /> {Math.round((score / questionsPool.length) * 100)}%
                  </p>
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase text-zinc-500">Readiness Delta</span>
                  <p className="text-lg font-black text-orange-500 mt-0.5 flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" /> +3.5% Score
                  </p>
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase text-zinc-500">Avg Speed per Q</span>
                  <p className="text-lg font-black text-zinc-200 mt-0.5 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-zinc-400" /> 
                    {questionsPool.length > 0 ? Math.round(Object.values(timeSpentLog).reduce((a, b) => a + b, 0) / questionsPool.length) : 0}s
                  </p>
                </div>
              </div>

              {/* Leaderboard/XP Standings */}
              {user ? (
                <div className="bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl p-4 max-w-md mx-auto mt-6">
                  {submittingScore ? (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Submitting score...</span>
                    </div>
                  ) : xpFeedback ? (
                    <div className="space-y-1 text-left">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20">
                        XP rewards logged
                      </span>
                      <p className="text-xs font-black text-zinc-200 pt-1">
                        +{xpFeedback.baseXp} Base XP + {xpFeedback.bonusXp} Speed Bonus XP awarded!
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold">
                        Your standings are updated! Current level is now **{(xpFeedback.totalXp).toLocaleString("en-IN")} XP**.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-zinc-400 py-1">Score logged to server profile.</p>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 max-w-md mx-auto mt-6 space-y-2">
                  <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                    Log in to save your mock records, unlock achievements, and secure placement readiness points on your profile desk!
                  </p>
                  <Link
                    href={`/login?redirect=/student-hub/aptitude-practice`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-black shadow-sm transition-all"
                  >
                    Sign In to Save stand
                  </Link>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <button
                  onClick={startTest}
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" /> Retake Test
                </button>
                <button
                  onClick={() => { playClick(); setGameState("welcome"); }}
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-xs font-black uppercase transition-all cursor-pointer active:scale-95"
                >
                  Configure Board
                </button>
              </div>
            </div>

            {/* AI Weakness report */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-orange-500" /> AI weakness diagnosis & recommendations
              </h4>
              <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-200">
                  <span>Weak Subject: Logical reasoning</span>
                  <span className="text-orange-500">Action recommended</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                  Your response time increases by 45% when dealing with Blood Relation codes. Focus on drawing relation trees during the initial 5 seconds.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => { playClick(); setMode("Logical"); setGameState("welcome"); }}
                    className="text-[10px] font-black text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Quick practice Logical Mode <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed answers list */}
            <div className="space-y-4">
              <h3 className="font-black text-zinc-200 text-sm border-l-4 border-orange-500 pl-3 uppercase tracking-wider">
                Detailed Solutions review
              </h3>

              {questionsPool.map((q, idx) => {
                const userAns = answersLog[q.id];
                const isCorrect = userAns === q.answer;

                return (
                  <div key={q.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-orange-500 bg-orange-500/10 rounded border border-orange-500/20">
                          {q.category}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Correct Choice
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-500 uppercase">
                            <XCircle className="h-3.5 w-3.5 text-red-500" /> {userAns === "Timeout" ? "Timeout" : "Incorrect Choice"}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">
                        Speed: {timeSpentLog[q.id] || 0}s
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-zinc-100 leading-relaxed">
                      <span className="text-orange-500 mr-1.5">Q{idx + 1}.</span>
                      {q.question}
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-2 text-xs font-bold text-zinc-400">
                      <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl">
                        Your choice: <span className={isCorrect ? "text-emerald-500" : "text-red-500"}>{userAns || "Skipped"}</span>
                      </div>
                      <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl">
                        Correct answer: <span className="text-emerald-500">{q.answer}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-1.5 text-xs text-zinc-400 leading-relaxed font-semibold">
                      <strong className="text-zinc-200 font-extrabold block text-xs flex items-center gap-1 border-b border-zinc-800 pb-1.5">
                        <Sparkles className="h-4 w-4 text-orange-500" /> Step-by-Step Logic
                      </strong>
                      <p className="pt-1">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
