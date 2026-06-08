"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, HelpCircle, Play, RefreshCw, CheckCircle, XCircle, 
  ArrowRight, Clock, Volume2, VolumeX, Lightbulb, Trophy, Sparkles, 
  Award, ChevronDown, ChevronUp, AlertCircle, ShieldCheck
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  category: "Quantitative" | "Logical" | "Verbal";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  hint: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Quantitative",
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in metres?",
    options: ["120 m", "150 m", "180 m", "324 m"],
    answer: "150 m",
    explanation: "First convert Speed to m/sec: 60 * (5/18) = 50/3 m/sec. Distance = Speed * Time = (50/3) * 9 = 150 metres. Therefore, the length of the train is 150 m.",
    hint: "Speed in m/s = Speed in km/hr * 5/18. Distance = Speed * Time."
  },
  {
    id: 2,
    category: "Logical",
    question: "If A + B means A is brother of B; A - B means A is sister of B and A * B means A is father of B. Which of the following means C is the son of M?",
    options: ["M - N * C + F", "F - C + N * M", "M * N - C + F", "N + M - F * C"],
    answer: "M * N - C + F",
    explanation: "M * N indicates M is the father of N. N - C indicates N is the sister of C. C + F indicates C is the brother of F. Since N, C, F are siblings and M is their father, and C is male (brother of F), C is indeed the son of M.",
    hint: "Start by analyzing the genders. C must be male, which is indicated by 'C + F' (brother)."
  },
  {
    id: 3,
    category: "Verbal",
    question: "Choose the word which is most opposite in meaning to the word 'FRUGAL':",
    options: ["Economical", "Extravagant", "Miserly", "Paltry"],
    answer: "Extravagant",
    explanation: "'Frugal' means careful, sparing, or economical with regards to money. Its direct opposite is 'Extravagant', meaning spending money excessively or wastefully.",
    hint: "Think of a word that describes someone who spends money recklessly or wastefully."
  },
  {
    id: 4,
    category: "Quantitative",
    question: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the principal sum?",
    options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    answer: "Rs. 698",
    explanation: "S.I. for 1 year = Rs. (854 - 815) = Rs. 39. S.I. for 3 years = Rs. (39 * 3) = Rs. 117. Principal = Amount - S.I. = Rs. (815 - 117) = Rs. 698.",
    hint: "The difference in amounts over 1 year is the interest earned for that single year."
  },
  {
    id: 5,
    category: "Logical",
    question: "Find the odd one out from the following group: 3, 5, 11, 14, 17",
    options: ["3", "11", "14", "17"],
    answer: "14",
    explanation: "All numbers in the group are prime numbers except 14, which is a composite number (divisible by 2 and 7).",
    hint: "Examine whether each number is prime (divisible only by itself and 1)."
  },
  {
    id: 6,
    category: "Quantitative",
    question: "Two pipes A and B can fill a cistern in 37.5 minutes and 45 minutes respectively. Both pipes are opened. The cistern will be filled in just half an hour, if pipe B is turned off after:",
    options: ["5 min", "9 min", "10 min", "15 min"],
    answer: "9 min",
    explanation: "Let B be turned off after x minutes. Pipe A works for the entire 30 minutes. Portion filled by A in 30 min = 30 / 37.5 = 4/5. Remaining 1/5 portion is filled by B in x min: x * (1/45) = 1/5 => x = 9 minutes.",
    hint: "Pipe A runs for the entire 30 minutes. Find its contribution first, then calculate how long B runs to finish the rest."
  },
  {
    id: 7,
    category: "Quantitative",
    question: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
    options: ["2 hours", "3 hours", "4 hours", "5 hours"],
    answer: "4 hours",
    explanation: "Downstream speed = Speed of boat + Speed of stream = 13 + 4 = 17 km/hr. Time taken = Distance / Speed = 68 / 17 = 4 hours.",
    hint: "Downstream speed is faster because the stream helps the boat. Add the two speeds together."
  },
  {
    id: 8,
    category: "Quantitative",
    question: "If a person sells an item for Rs. 350 and incurs a loss of 30%, at what price should he sell it to gain 20%?",
    options: ["Rs. 500", "Rs. 540", "Rs. 600", "Rs. 620"],
    answer: "Rs. 600",
    explanation: "A loss of 30% means Selling Price = 70% of Cost Price. 0.7 * CP = 350 => CP = Rs. 500. To gain 20%, new Selling Price = 500 * 1.2 = Rs. 600.",
    hint: "First find the original cost price. Selling at a 30% loss is equivalent to selling at 70% of the cost."
  },
  {
    id: 9,
    category: "Quantitative",
    question: "The average age of a class of 24 students is 15 years. When the teacher's age is included, the average increases by 1 year. What is the teacher's age?",
    options: ["35 years", "38 years", "40 years", "42 years"],
    answer: "40 years",
    explanation: "Total sum of students' ages = 24 * 15 = 360 years. Total sum including the teacher = 25 * 16 = 400 years. Teacher's age = 400 - 360 = 40 years.",
    hint: "Find the sum of all ages before and after the teacher is added, then subtract the two sums."
  },
  {
    id: 10,
    category: "Quantitative",
    question: "A and B invest in a business in the ratio 3:2. If 5% of the total profit goes to charity and A's share is Rs. 855, the total profit is:",
    options: ["Rs. 1425", "Rs. 1500", "Rs. 1537", "Rs. 1576"],
    answer: "Rs. 1500",
    explanation: "Let total profit be P. Profit after charity = 0.95P. A's share = 3/5 of 0.95P = 0.57P = Rs. 855. P = 855 / 0.57 = Rs. 1500.",
    hint: "A gets 3 parts out of 5 from the remaining 95% of profit. Solve for total profit."
  },
  {
    id: 11,
    category: "Logical",
    question: "If 'GIVE' is coded as 'VIEG' and 'OVER' is coded as 'EVRO', how will 'DISK' be coded?",
    options: ["SIKD", "KIDS", "SIDK", "KDSI"],
    answer: "SIKD",
    explanation: "The letters swap positions based on index mapping: 1st shifts to 4th, 2nd stays 2nd, 3rd shifts to 1st, 4th shifts to 3rd (indices: 1234 -> 3241). For DISK, D(1) I(2) S(3) K(4) becomes S I K D.",
    hint: "Track the movements of letters by looking at the positions: e.g. G (1st) goes to the end (4th) in VIEG."
  },
  {
    id: 12,
    category: "Logical",
    question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
    options: ["His nephew's", "His son's", "His father's", "His own"],
    answer: "His son's",
    explanation: "'My father's son' must be the speaker himself since he has no siblings. Therefore, the statement simplifies to: 'that man's father is myself'. The photo is of his son.",
    hint: "Identify who 'my father's son' refers to, given that the speaker is an only child."
  },
  {
    id: 13,
    category: "Logical",
    question: "If South-East becomes North, North-East becomes West and so on, what will West become?",
    options: ["North-East", "North-West", "South-East", "South-West"],
    answer: "South-East",
    explanation: "South-East is rotated by 135 degrees counter-clockwise to become North. Applying the same 135-degree counter-clockwise rotation to West lands on South-East.",
    hint: "Draw a compass and determine the degree of shift from South-East to North (it is 135 degrees counter-clockwise)."
  },
  {
    id: 14,
    category: "Logical",
    question: "Choose the correct analogy: Light : Sun :: Heat : ?",
    options: ["Electricity", "Moon", "Fire", "Stars"],
    answer: "Fire",
    explanation: "The Sun is a primary natural source of Light. Similarly, Fire is a primary source of Heat.",
    hint: "Find the primary generator or source of the energy mentioned in the analogy."
  },
  {
    id: 15,
    category: "Logical",
    question: "Insert the missing number in the series: 2, 6, 12, 20, 30, ?, 56",
    options: ["38", "40", "42", "44"],
    answer: "42",
    explanation: "The difference between terms increases by even numbers: 2 (+4) -> 6 (+6) -> 12 (+8) -> 20 (+10) -> 30. The next term should add 12: 30 + 12 = 42.",
    hint: "Check the difference between consecutive numbers: +4, +6, +8, +10..."
  },
  {
    id: 16,
    category: "Logical",
    question: "Six books are kept on top of each other. History is just above Commerce. Math is between Physics and Chemistry. English is between History and Physics. Which book is at the bottom if Chemistry is at the top?",
    options: ["Commerce", "History", "Physics", "English"],
    answer: "Commerce",
    explanation: "Order top-to-bottom: Chemistry (top), Math, Physics, English, History, Commerce. Therefore, Commerce is at the bottom.",
    hint: "Start with Chemistry at the top, and place Math and Physics below it. Then place English and History, and finally Commerce."
  },
  {
    id: 17,
    category: "Verbal",
    question: "Identify the synonym of the word 'OBSTINATE':",
    options: ["Flexible", "Stubborn", "Docile", "Submissive"],
    answer: "Stubborn",
    explanation: "'Obstinate' describes someone who is extremely headstrong and refuses to alter their opinion; hence, 'Stubborn' is a direct synonym.",
    hint: "Think of someone who is difficult to persuade or refuses to change their mind."
  },
  {
    id: 18,
    category: "Verbal",
    question: "Select the word that is correctly spelled:",
    options: ["Accomodation", "Accommodation", "Acomodation", "Accommadation"],
    answer: "Accommodation",
    explanation: "The correct spelling is 'Accommodation', which features double 'c' and double 'm'.",
    hint: "The word has two pairs of double letters in the middle: 'cc' and 'mm'."
  },
  {
    id: 19,
    category: "Verbal",
    question: "Complete the sentence: If I _______ his address, I would have written to him.",
    options: ["know", "knew", "had known", "would know"],
    answer: "had known",
    explanation: "This is a Type 3 conditional (unreal past). It uses 'If + past perfect' combined with 'would have + past participle' in the main clause.",
    hint: "The main clause has 'would have written' which means the condition must be in the past perfect tense."
  },
  {
    id: 20,
    category: "Verbal",
    question: "Select the word that describes a person who hates or distrusts humankind:",
    options: ["Misanthrope", "Philanthropist", "Misogynist", "Optimist"],
    answer: "Misanthrope",
    explanation: "A 'Misanthrope' is a person who holds a general dislike or distrust of human nature. 'Philanthropist' is the opposite (humankind lover).",
    hint: "The prefix 'mis-' indicates hatred, and the root 'anthrope' refers to humans."
  },
  {
    id: 21,
    category: "Verbal",
    question: "Find the error in the sentence: 'Neither the teacher nor the students was present in the class.'",
    options: ["Neither the teacher", "nor the students", "was present", "in the class"],
    answer: "was present",
    explanation: "Under subject-verb agreement rules for 'neither... nor', the verb agrees with the closer subject. 'students' is plural, so it requires 'were present'.",
    hint: "Identify the subjects connected by 'nor' and see which one is closer to the verb."
  },
  {
    id: 22,
    category: "Verbal",
    question: "What is the meaning of the idiom 'To spill the beans'?",
    options: ["To waste food", "To perform a task poorly", "To reveal a secret", "To start a fight"],
    answer: "To reveal a secret",
    explanation: "The idiom 'spill the beans' historically means to prematurely or accidentally reveal confidential information or secrets.",
    hint: "It relates to letting a secret out, usually by mistake."
  },
  {
    id: 23,
    category: "Verbal",
    question: "Choose the correct passive voice of: 'The chef prepared a delicious meal.'",
    options: ["A delicious meal is prepared by the chef.", "A delicious meal was prepared by the chef.", "A delicious meal has been prepared by the chef.", "A delicious meal had prepared by the chef."],
    answer: "A delicious meal was prepared by the chef.",
    explanation: "The active verb 'prepared' is in the simple past. The passive construction must use 'was/were + past participle' ('was prepared').",
    hint: "Identify the tense of 'prepared' (simple past) and form the passive using 'was/were'."
  },
  {
    id: 24,
    category: "Quantitative",
    question: "A sum of Rs. 12,500 amounts to Rs. 15,500 in 4 years at simple interest. What is the rate of interest?",
    options: ["5%", "6%", "7%", "8%"],
    answer: "6%",
    explanation: "Total Simple Interest = Rs. 15500 - 12500 = Rs. 3000. Interest = (P * R * T) / 100 => 3000 = (12500 * R * 4) / 100 => R = 6%.",
    hint: "Simple Interest = Amount - Principal. Use the formula: SI = (P * R * T) / 100 to solve for R."
  },
  {
    id: 25,
    category: "Quantitative",
    question: "A train passes a station platform in 36 seconds and a man standing on the platform in 20 seconds. If the speed of the train is 54 km/hr, what is the length of the platform?",
    options: ["120 m", "240 m", "300 m", "360 m"],
    answer: "240 m",
    explanation: "Speed of train = 54 * (5/18) = 15 m/s. Length of train = 15 * 20 = 300 m. Let platform be P. Time to cross platform: (300 + P)/15 = 36 => 300 + P = 540 => P = 240 m.",
    hint: "First find the speed in m/s. Then find the length of the train using the time it takes to pass the standing man."
  },
  {
    id: 26,
    category: "Quantitative",
    question: "The ratio between the present ages of P and Q is 6:7. If Q is 4 years older than P, what will be the ratio of the ages of P and Q after 4 years?",
    options: ["3:4", "7:8", "8:9", "None of these"],
    answer: "7:8",
    explanation: "Let ages be 6x and 7x. 7x - 6x = 4 => x = 4. Present ages: P = 24, Q = 28. After 4 years: P = 28, Q = 32. New Ratio = 28:32 = 7:8.",
    hint: "Use the age difference of 4 years to find their actual current ages, then add 4 to each and find the ratio."
  },
  {
    id: 27,
    category: "Logical",
    question: "Which digit will appear on the face opposite to the face with number 4 in a standard dice if faces show: 1 adjacent to 2, 3; 4 adjacent to 5, 6; and 1 is opposite to 4?",
    options: ["1", "2", "3", "5"],
    answer: "1",
    explanation: "The question statement explicitly states that '1 is opposite to 4'. Thus, 1 is the opposite face.",
    hint: "Read the sentence structure closely; the relationship is declared directly at the end of the premise."
  },
  {
    id: 28,
    category: "Logical",
    question: "Find the missing number in the grid:\nRow 1: [7, 14, 21]\nRow 2: [6, 18, 36]\nRow 3: [5, 20, ?]",
    options: ["40", "60", "80", "100"],
    answer: "60",
    explanation: "Row multipliers for 1st -> 2nd term: Row 1 is *2, Row 2 is *3, Row 3 is *4. Multipliers for 2nd -> 3rd term: Row 1 is *1.5 (21), Row 2 is *2 (36), Row 3 must be *3 (60). Thus, 20 * 3 = 60.",
    hint: "Identify the arithmetic relationship within each row. The factor sequence increases logically for each step."
  },
  {
    id: 29,
    category: "Verbal",
    question: "Choose the correct option to fill in the blank: The meeting has been postponed _______ next Monday.",
    options: ["to", "until", "for", "against"],
    answer: "until",
    explanation: "'Until' is the appropriate preposition used to denote the duration/extension of delay up to a specific future point in time.",
    hint: "We are referring to the date up to which the event has been delayed."
  },
  {
    id: 30,
    category: "Verbal",
    question: "Select the word which means 'a speech or piece of writing that praises someone or something highly, typically someone who has just died':",
    options: ["Elegy", "Eulogy", "Epitaph", "Obituary"],
    answer: "Eulogy",
    explanation: "A 'Eulogy' is a formal speech or piece of writing praising a person (often recently deceased). 'Elegy' is a sad poem, 'Epitaph' is tombstone text.",
    hint: "The Greek prefix 'eu-' means 'good' or 'well', and '-logia' means speech."
  }
];

export default function AptitudePractice() {
  const { user } = useAuth();
  
  // Quiz configs
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Quantitative" | "Logical" | "Verbal">("All");
  const [quizSize, setQuizSize] = useState<number>(5);
  const [timedMode, setTimedMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // States
  const [gameState, setGameState] = useState<"welcome" | "quiz" | "summary">("welcome");
  const [questionsPool, setQuestionsPool] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [answersLog, setAnswersLog] = useState<{ [qId: number]: string }>({});
  const [timeSpentLog, setTimeSpentLog] = useState<{ [qId: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [score, setScore] = useState(0);
  
  // Expanded solutions review indices
  const [expandedReviews, setExpandedReviews] = useState<{ [qId: number]: boolean }>({});

  // DB Submission feedback states
  const [submittingScore, setSubmittingScore] = useState(false);
  const [xpFeedback, setXpFeedback] = useState<{ baseXp: number; bonusXp: number; totalXp: number } | null>(null);
  
  const questionStartTime = useRef<number>(0);

  // Sound synthesis using Web Audio API
  const playSound = (type: "click" | "correct" | "incorrect" | "complete") => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "correct") {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.06, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        const now = ctx.currentTime;
        playTone(523.25, now, 0.1); // C5
        playTone(659.25, now + 0.08, 0.1); // E5
        playTone(783.99, now + 0.16, 0.2); // G5
      } else if (type === "incorrect") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "complete") {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.05, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        const now = ctx.currentTime;
        playTone(523.25, now, 0.12); // C5
        playTone(523.25, now + 0.12, 0.12); // C5
        playTone(523.25, now + 0.24, 0.12); // C5
        playTone(659.25, now + 0.36, 0.15); // E5
        playTone(587.33, now + 0.51, 0.15); // D5
        playTone(783.99, now + 0.66, 0.4); // G5
      }
    } catch (err) {
      console.warn("Audio synthesis error:", err);
    }
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== "quiz" || !timedMode) return;

    if (timeLeft === 0) {
      // Auto-submit empty choice on timeout
      if (!selectedAnswer) {
        playSound("incorrect");
        const currentQ = questionsPool[currentIdx];
        setAnswersLog((prev) => ({ ...prev, [currentQ.id]: "Time Expired" }));
        setSelectedAnswer("Time Expired");
        
        const duration = Math.round((Date.now() - questionStartTime.current) / 1000);
        setTimeSpentLog((prev) => ({ ...prev, [currentQ.id]: duration }));
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, timedMode, selectedAnswer]);

  // Confetti and submission trigger on completion
  useEffect(() => {
    if (gameState !== "summary") return;

    playSound("complete");

    // Confetti burst for high scores
    if (score >= Math.ceil(questionsPool.length * 0.7)) {
      try {
        import("canvas-confetti").then((module) => {
          const confetti = module.default;
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.55 }
          });
        });
      } catch (e) {
        console.error("Confetti loading failed:", e);
      }
    }

    // Submit score to award XP if logged in
    async function submitScore() {
      if (!user) return;
      setSubmittingScore(true);
      try {
        const response = await fetch("/api/v1/student-hub/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, totalQuestions: questionsPool.length }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setXpFeedback({
            baseXp: data.xpGained || 10,
            bonusXp: data.bonusXp || 0,
            totalXp: data.totalXp,
          });
        }
      } catch (e) {
        console.error("Failed to submit score:", e);
      } finally {
        setSubmittingScore(false);
      }
    }

    submitScore();
  }, [gameState]);

  // Shuffle and set current questions
  const startQuiz = () => {
    playSound("click");
    // Filter questions
    let pool = [...QUESTIONS];
    if (categoryFilter !== "All") {
      pool = pool.filter((q) => q.category === categoryFilter);
    }

    // Shuffle pool using Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Trim to selected size
    const selectedPool = pool.slice(0, Math.min(quizSize, pool.length));

    setQuestionsPool(selectedPool);
    setGameState("quiz");
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setAnswersLog({});
    setTimeSpentLog({});
    setScore(0);
    setTimeLeft(30);
    setXpFeedback(null);
    setExpandedReviews({});
    questionStartTime.current = Date.now();
  };

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return; // Answer locked
    setSelectedAnswer(option);

    const currentQuestion = questionsPool[currentIdx];
    const duration = Math.round((Date.now() - questionStartTime.current) / 1000);

    setTimeSpentLog((prev) => ({ ...prev, [currentQuestion.id]: duration }));
    setAnswersLog((prev) => ({ ...prev, [currentQuestion.id]: option }));

    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      playSound("correct");
    } else {
      playSound("incorrect");
    }
  };

  const handleNextQuestion = () => {
    playSound("click");
    if (currentIdx + 1 < questionsPool.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowHint(false);
      setTimeLeft(30);
      questionStartTime.current = Date.now();
    } else {
      setGameState("summary");
    }
  };

  const toggleReviewCollapse = (qId: number) => {
    playSound("click");
    setExpandedReviews((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // play click to demonstrate
    if (!soundEnabled) {
      setTimeout(() => playSound("click"), 50);
    }
  };

  const currentQuestion = questionsPool[currentIdx];

  // Calculations for analytics
  const totalTimeSpent = Object.values(timeSpentLog).reduce((acc, curr) => acc + curr, 0);
  const avgTimeSpent = questionsPool.length > 0 ? Math.round(totalTimeSpent / questionsPool.length) : 0;
  
  // Category metrics
  const categoryStats = questionsPool.reduce((acc, q) => {
    const userAns = answersLog[q.id];
    const isCorrect = userAns === q.answer;
    if (!acc[q.category]) {
      acc[q.category] = { total: 0, correct: 0 };
    }
    acc[q.category].total += 1;
    if (isCorrect) acc[q.category].correct += 1;
    return acc;
  }, {} as { [key: string]: { total: number; correct: number } });

  // Quiz progress percentage
  const progressPercent = questionsPool.length > 0 ? ((currentIdx + (selectedAnswer ? 1 : 0)) / questionsPool.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-3xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          onClick={() => playSound("click")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Title Header */}
        <div className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Aptitude Quiz Practice</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Solve quantitative, logical, and verbal placement mock exams with real-time countdown clocks.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute sound" : "Unmute sound"}
              className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-brand-600" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1 border border-brand-500/10">
              <Trophy className="h-4 w-4" /> practice quiz
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* 1. Welcome Screen */}
          {gameState === "welcome" && (
            <motion.div
              key="welcome-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border/80 rounded-3xl p-8 shadow-md space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                  <HelpCircle className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-foreground">Placement Aptitude Mock Test</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Practice exam questions spanning logical reasoning, English grammar, and quantitative math. Filter categories and configure parameters below to build your custom mock board.
                  </p>
                </div>

                {/* Configurations */}
                <div className="grid sm:grid-cols-2 gap-4 text-left border-t border-border/60 pt-6 mt-6">
                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider block">
                      Category Topic
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["All", "Quantitative", "Logical", "Verbal"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            playSound("click");
                            setCategoryFilter(cat);
                          }}
                          className={`py-2 px-3 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            categoryFilter === cat
                              ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                              : "bg-card border-border hover:bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {cat === "Logical" ? "Logical Reasoning" : cat === "Verbal" ? "Verbal Ability" : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider block">
                      Number of Questions
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[5, 10, 15, 20].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => {
                            playSound("click");
                            setQuizSize(sz);
                          }}
                          className={`py-2 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            quizSize === sz
                              ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                              : "bg-card border-border hover:bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider block">
                      Quiz Timing Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          playSound("click");
                          setTimedMode(true);
                        }}
                        className={`py-2 px-3 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          timedMode
                            ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                            : "bg-card border-border hover:bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" /> Timed (30s)
                      </button>
                      <button
                        onClick={() => {
                          playSound("click");
                          setTimedMode(false);
                        }}
                        className={`py-2 px-3 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          !timedMode
                            ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                            : "bg-card border-border hover:bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        <Lightbulb className="h-3.5 w-3.5" /> Study (Untimed)
                      </button>
                    </div>
                  </div>

                  {/* Auth Gate Notification */}
                  <div className="bg-muted/40 border border-border/80 rounded-2xl p-3 flex items-start gap-2.5">
                    {user ? (
                      <>
                        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-foreground">Logged in as {user.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            Completing this quiz will award you **XP** and update your ranking on the Student Leaderboard.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-foreground">Guest Session Mode</p>
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            Scores will not save. <Link href={`/login?redirect=/student-hub/aptitude-practice`} className="text-brand-600 hover:underline font-extrabold">Sign in here</Link> to secure your standings and XP rewards!
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer hover:shadow-brand-500/10 active:scale-95 mt-6"
                >
                  <Play className="h-4 w-4 fill-white" /> Start Practice Session
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. Gameplay Quiz Screen */}
          {gameState === "quiz" && currentQuestion && (
            <motion.div
              key="quiz-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Dynamic Status / Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                  <span>Question {currentIdx + 1} of {questionsPool.length}</span>
                  {timedMode ? (
                    <span className={`flex items-center gap-1.5 font-extrabold transition-colors duration-200 ${timeLeft <= 8 ? "text-rose-500 animate-pulse" : "text-amber-500"}`}>
                      <Clock className="h-4 w-4" /> {timeLeft}s remaining
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-brand-600 bg-brand-50/50 dark:bg-brand-950/20 px-2 py-0.5 rounded border border-brand-500/10">
                      Study Mode
                    </span>
                  )}
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="bg-brand-600 h-full rounded-full"
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-center gap-3">
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-600 bg-brand-50/50 dark:bg-brand-950/20 rounded-md border border-brand-500/10">
                    {currentQuestion.category}
                  </span>

                  {/* Hint Button */}
                  <button
                    onClick={() => {
                      playSound("click");
                      setShowHint(!showHint);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                      showHint 
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        : "bg-card border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Lightbulb className="h-3.5 w-3.5" /> {showHint ? "Hide Hint" : "Need a Hint?"}
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-foreground leading-relaxed pt-2">
                  {currentQuestion.question}
                </h3>

                {/* Expandable Hint Drawer */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 bg-amber-500/5 dark:bg-amber-500/[0.02] border border-amber-500/20 rounded-2xl text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          <strong>Hint:</strong> {currentQuestion.hint}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Options Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt === currentQuestion.answer;
                  const hasSelectedAny = selectedAnswer !== null;

                  let btnStyle = "bg-card border-border hover:border-brand-500/20 hover:bg-brand-500/[0.02] hover:-translate-y-0.5";
                  
                  if (hasSelectedAny) {
                    if (isSelected) {
                      btnStyle = isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400 scale-[1.01] shadow-sm"
                        : "bg-rose-500/10 border-rose-500/35 text-rose-600 dark:text-rose-400 scale-[1.01] shadow-sm";
                    } else if (isCorrect) {
                      btnStyle = "bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400";
                    } else {
                      btnStyle = "opacity-50 bg-muted/10 border-border/40 scale-[0.99] cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={hasSelectedAny}
                      className={`p-4.5 text-left text-xs sm:text-sm font-bold rounded-2xl border transition-all flex items-center justify-between gap-3 ${btnStyle} cursor-pointer`}
                    >
                      <span>{opt}</span>
                      {hasSelectedAny && isSelected && isCorrect && <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />}
                      {hasSelectedAny && isSelected && !isCorrect && <XCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanations & Next Button */}
              {selectedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm"
                >
                  <div className="text-xs sm:text-sm space-y-2 leading-relaxed text-muted-foreground">
                    <strong className="text-foreground font-extrabold block text-sm flex items-center gap-1.5 border-b border-border/40 pb-2">
                      <Sparkles className="h-4 w-4 text-brand-600" /> Step-by-Step Explanation
                    </strong>
                    <p className="pt-1">{currentQuestion.explanation}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-wider">
                      {selectedAnswer === currentQuestion.answer ? "🎉 Correct choice!" : selectedAnswer === "Time Expired" ? "⏰ Time expired!" : "❌ Incorrect choice!"}
                    </span>
                    <button
                      onClick={handleNextQuestion}
                      className="inline-flex items-center gap-1 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      {currentIdx + 1 < questionsPool.length ? "Next Question" : "Finish Test"} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 3. Score Summary Panel */}
          {gameState === "summary" && (
            <motion.div
              key="summary-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-fadeIn"
            >
              {/* Header stats board */}
              <div className="bg-card border border-border/85 rounded-3xl p-8 text-center shadow-md space-y-6 relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-500 via-amber-500 to-rose-500" />
                
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  QUIZ COMPLETED
                </span>
                
                <div className="flex justify-center items-center gap-2">
                  <h2 className="text-6xl font-black text-brand-600 tracking-tight">
                    {score}
                  </h2>
                  <span className="text-2xl font-black text-muted-foreground">/ {questionsPool.length}</span>
                </div>

                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="font-extrabold text-foreground text-base">
                    {score >= Math.ceil(questionsPool.length * 0.8) 
                      ? "Excellent Job! You are Placement Ready." 
                      : score >= Math.ceil(questionsPool.length * 0.5)
                        ? "Good Effort! Keep practicing to improve speeds."
                        : "Review solutions and attempt again to grow."}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You successfully solved {score} out of {questionsPool.length} questions correctly.
                  </p>
                </div>

                {/* Score breakdown metrics (Average Speed, accuracy) */}
                <div className="grid grid-cols-2 gap-4 border-y border-border/60 py-4 max-w-md mx-auto">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Average Speed</p>
                    <p className="text-lg font-black text-foreground mt-1 flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-brand-500" /> {avgTimeSpent}s
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Accuracy</p>
                    <p className="text-lg font-black text-foreground mt-1 flex items-center justify-center gap-1">
                      <Award className="h-4 w-4 text-amber-500" /> {Math.round((score / questionsPool.length) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Leaderboard XP submission feedback */}
                {user ? (
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/[0.02] border border-emerald-500/20 rounded-2xl p-4 max-w-md mx-auto">
                    {submittingScore ? (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Submitting score...</span>
                      </div>
                    ) : xpFeedback ? (
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" /> XP Awarded!
                        </div>
                        <p className="text-xs font-extrabold text-foreground leading-snug">
                          +{xpFeedback.baseXp} Base XP + {xpFeedback.bonusXp} Answer Bonus XP Added!
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Your updated total XP score is **{xpFeedback.totalXp.toLocaleString("en-IN")} XP**. Check the <Link href="/student-hub/leaderboard" className="text-brand-600 hover:underline font-black">Leaderboard</Link>!
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-muted-foreground py-1">Score saved to profile.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 max-w-md mx-auto space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground leading-normal">
                      Practice logs are not recorded in guest mode. Log in to your SmartPicks profile to secure leaderboard ranking scores and earn XP tags!
                    </p>
                    <Link
                      href={`/login?redirect=/student-hub/aptitude-practice`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm transition-all"
                    >
                      Sign In to Save Scores
                    </Link>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <button
                    onClick={startQuiz}
                    className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer hover:shadow-brand-500/10 active:scale-95"
                  >
                    <RefreshCw className="h-4 w-4" /> Restart Session
                  </button>
                  <button
                    onClick={() => {
                      playSound("click");
                      setGameState("welcome");
                    }}
                    className="inline-flex items-center gap-1.5 px-6 py-3 bg-card border border-border hover:bg-muted text-foreground rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                  >
                    Change Parameters
                  </button>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                  Breakdown by Category
                </h4>
                <div className="space-y-3.5">
                  {Object.entries(categoryStats).map(([cat, stats]) => {
                    const percent = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-foreground">{cat}</span>
                          <span className="text-muted-foreground">
                            {stats.correct}/{stats.total} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-brand-600 h-full rounded-full" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Solutions Review Listing */}
              <div className="space-y-4 pt-2">
                <h3 className="font-extrabold text-foreground text-sm border-l-4 border-brand-600 pl-3 uppercase tracking-wider">
                  Detailed Solutions Review
                </h3>
                
                {questionsPool.map((q) => {
                  const userAns = answersLog[q.id];
                  const isCorrect = userAns === q.answer;
                  const isExpanded = !!expandedReviews[q.id];

                  return (
                    <div 
                      key={q.id} 
                      className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm"
                    >
                      {/* Accordion header */}
                      <button
                        onClick={() => toggleReviewCollapse(q.id)}
                        className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/20 transition-all focus:outline-none"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-brand-600 bg-brand-50/50 dark:bg-brand-950/20 rounded border border-brand-500/10">
                              {q.category}
                            </span>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-600 uppercase">
                                <CheckCircle className="h-3 w-3" /> Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-rose-600 uppercase">
                                <XCircle className="h-3 w-3" /> {userAns === "Time Expired" ? "Timeout" : "Incorrect"}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold leading-snug text-foreground">
                            {q.question}
                          </h4>
                        </div>
                        <div className="shrink-0 mt-1.5 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>

                      {/* Accordion content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-border/40 bg-muted/20"
                          >
                            <div className="p-5 space-y-4">
                              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-muted-foreground">
                                <p>
                                  Your Choice:{" "}
                                  <span className={isCorrect ? "text-emerald-600" : "text-rose-600 font-extrabold"}>
                                    {userAns || "Time Expired"}
                                  </span>
                                </p>
                                <p>
                                  Correct Answer: <span className="text-emerald-600">{q.answer}</span>
                                </p>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-muted-foreground border-t border-border/30 pt-3">
                                <strong className="text-foreground font-black block mb-1">Explanation:</strong> 
                                {q.explanation}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
