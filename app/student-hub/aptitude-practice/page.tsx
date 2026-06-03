"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Play, RefreshCw, CheckCircle, XCircle, ArrowRight, Clock } from "lucide-react";

interface Question {
  id: number;
  category: "Quantitative" | "Logical" | "Verbal";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Quantitative",
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in metres?",
    options: ["120 m", "150 m", "180 m", "324 m"],
    answer: "150 m",
    explanation: "First convert Speed to m/sec: 60 * (5/18) = 50/3 m/sec. Distance = Speed * Time = (50/3) * 9 = 150 metres. Therefore, the length of the train is 150 m.",
  },
  {
    id: 2,
    category: "Logical",
    question: "If A + B means A is brother of B; A - B means A is sister of B and A * B means A is father of B. Which of the following means C is the son of M?",
    options: ["M - N * C + F", "F - C + N * M", "M * N - C + F", "N + M - F * C"],
    answer: "M * N - C + F",
    explanation: "M * N indicates M is the father of N. N - C indicates N is the sister of C. C + F indicates C is the brother of F. Since N, C, F are siblings and M is their father, and C is male (brother of F), C is indeed the son of M.",
  },
  {
    id: 3,
    category: "Verbal",
    question: "Choose the word which is most opposite in meaning to the word 'FRUGAL':",
    options: ["Economical", "Extravagant", "Miserly", "Paltry"],
    answer: "Extravagant",
    explanation: "'Frugal' means careful, sparing, or economical with regards to money. Its direct opposite is 'Extravagant', meaning spending money excessively or wastefully.",
  },
  {
    id: 4,
    category: "Quantitative",
    question: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the principal sum?",
    options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    answer: "Rs. 698",
    explanation: "S.I. for 1 year = Rs. (854 - 815) = Rs. 39. S.I. for 3 years = Rs. (39 * 3) = Rs. 117. Principal = Amount - S.I. = Rs. (815 - 117) = Rs. 698.",
  },
  {
    id: 5,
    category: "Logical",
    question: "Find the odd one out from the following group: 3, 5, 11, 14, 17",
    options: ["3", "11", "14", "17"],
    answer: "14",
    explanation: "All numbers in the group are prime numbers except 14, which is a composite number (divisible by 2 and 7).",
  },
];

export default function AptitudePractice() {
  const [gameState, setGameState] = useState<"welcome" | "quiz" | "summary">("welcome");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answersLog, setAnswersLog] = useState<{ [qId: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [score, setScore] = useState(0);

  // Timer loop
  useEffect(() => {
    if (gameState !== "quiz") return;

    if (timeLeft === 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // Confetti celebration on perfect score
  useEffect(() => {
    if (gameState === "summary" && score === QUESTIONS.length) {
      try {
        import("canvas-confetti").then((module) => {
          const confetti = module.default;
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        });
      } catch (e) {
        console.error("Confetti error:", e);
      }
    }
  }, [gameState, score]);

  const startQuiz = () => {
    setGameState("quiz");
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswersLog({});
    setScore(0);
    setTimeLeft(30);
  };

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return; // prevent changing answer
    setSelectedAnswer(option);
    
    const currentQuestion = QUESTIONS[currentIdx];
    setAnswersLog({ ...answersLog, [currentQuestion.id]: option });
    
    if (option === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setGameState("summary");
    }
  };

  const currentQuestion = QUESTIONS[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-3xl">
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
            <h1 className="text-3xl font-extrabold tracking-tight">Aptitude Quiz Practice</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Solve quantitative, logical, and verbal placement mock exams with real-time countdown clocks.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Clock className="h-4 w-4" /> practice quiz
          </span>
        </div>

        {/* Welcome screen */}
        {gameState === "welcome" && (
          <div className="bg-card border border-border/80 rounded-3xl p-8 text-center shadow-md space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
              <HelpCircle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-foreground">Placement Aptitude Mock Test</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Test includes {QUESTIONS.length} selected queries covering quantitative, logical, and grammar sections. You get 30 seconds per query card.
              </p>
            </div>
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              <Play className="h-4 w-4" /> Start Mock Test
            </button>
          </div>
        )}

        {/* Quiz screen */}
        {gameState === "quiz" && currentQuestion && (
          <div className="space-y-6">
            {/* Status bar */}
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
              <span>Question {currentIdx + 1} of {QUESTIONS.length}</span>
              <span className="flex items-center gap-1 text-rose-500 font-extrabold">
                <Clock className="h-4 w-4 animate-pulse" /> {timeLeft}s remaining
              </span>
            </div>

            {/* Question card */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-600 bg-brand-50/50 dark:bg-brand-950/20 rounded-md border border-brand-500/10">
                {currentQuestion.category}
              </span>
              <h3 className="text-base font-extrabold text-foreground leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options list */}
            <div className="grid sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQuestion.answer;
                
                let btnStyle = "bg-card border-border hover:border-brand-500/20 hover:bg-brand-500/5";
                if (selectedAnswer) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
                  } else if (isCorrect) {
                    btnStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
                  } else {
                    btnStyle = "opacity-60 bg-muted/20 border-border/40";
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswerSelect(opt)}
                    disabled={!!selectedAnswer}
                    className={`p-4 text-left text-xs font-bold rounded-2xl border transition-all flex items-center justify-between ${btnStyle} cursor-pointer`}
                  >
                    <span>{opt}</span>
                    {selectedAnswer && isSelected && isCorrect && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />}
                    {selectedAnswer && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation / Explanations */}
            {selectedAnswer && (
              <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4 shadow-sm animate-fadeIn">
                <div className="text-xs space-y-1.5 leading-relaxed text-muted-foreground">
                  <strong className="text-foreground font-black block">Step-by-Step Explanation:</strong>
                  {currentQuestion.explanation}
                </div>
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1 ml-auto text-[10px] font-black text-brand-600 hover:text-brand-700"
                >
                  Next Question <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Score summary panel */}
        {gameState === "summary" && (
          <div className="space-y-6">
            <div className="bg-card border border-border/85 rounded-3xl p-8 text-center shadow-md space-y-5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                QUIZ COMPLETED
              </span>
              <h2 className="text-5xl font-black text-brand-600">
                {score} / {QUESTIONS.length}
              </h2>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-extrabold text-foreground text-sm">
                  {score >= 4 ? "Excellent Job! You are Placement Ready." : "Good Effort! Keep practicing to improve speeds."}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You successfully solved {score} out of {QUESTIONS.length} questions correctly.
                </p>
              </div>
              <button
                onClick={startQuiz}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Restart Practice
              </button>
            </div>

            {/* Solutions review listing */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-foreground text-sm border-l-4 border-brand-600 pl-3 uppercase tracking-wider">
                Solutions Review
              </h3>
              {QUESTIONS.map((q) => {
                const userAns = answersLog[q.id];
                const isCorrect = userAns === q.answer;

                return (
                  <div key={q.id} className="bg-card border border-border/80 rounded-3xl p-5 space-y-3.5 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm font-extrabold text-foreground leading-snug">{q.question}</h4>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase shrink-0">
                          <CheckCircle className="h-3.5 w-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase shrink-0">
                          <XCircle className="h-3.5 w-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-muted-foreground">
                      <p>
                        Your Answer:{" "}
                        <span className={isCorrect ? "text-emerald-600" : "text-rose-600 font-extrabold"}>
                          {userAns || "Time Expired"}
                        </span>
                      </p>
                      <p>
                        Correct Answer: <span className="text-emerald-600">{q.answer}</span>
                      </p>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-muted-foreground border-t border-border/30 pt-3 italic">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
