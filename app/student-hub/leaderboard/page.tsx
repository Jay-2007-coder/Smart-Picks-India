"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Sparkles, Loader2, Award, Crown, ChevronRight, Star, Users, Zap, Award as MedBadge } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardUser {
  _id: string;
  name: string;
  profileImage: string | null;
  xp: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Spotlight pos
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/v1/student-hub/leaderboard");
        const data = await response.json();
        if (response.ok && data.success) {
          setUsers(data.leaderboard || []);
        } else {
          throw new Error(data.message || "Failed to load leaderboard.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Split into top 3 and others
  const topThree = users.slice(0, 3);
  const others = users.slice(3);

  // Rearrange top 3 for podium: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push(topThree[1]);
  if (topThree[0]) podiumOrder.push(topThree[0]);
  if (topThree[2]) podiumOrder.push(topThree[2]);

  // Contender Metrics
  const totalContenders = users.length;
  const totalXP = users.reduce((acc, curr) => acc + curr.xp, 0);
  const placementReadyCount = users.filter(u => u.xp >= 300).length;
  const placementReadyRate = totalContenders > 0 ? Math.round((placementReadyCount / totalContenders) * 100) : 0;

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-[#09090B] text-slate-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col font-sans antialiased relative overflow-hidden select-none pb-16"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(20, 184, 166, 0.04) 0%, transparent 60%)`
      }}
    >
      {/* Glow Backdrops */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none animate-pulse" />

      {/* 1. NAVBAR BACK BUTTON */}
      <header className="sticky top-0 z-40 bg-[#09090B]/60 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link 
            href="/student-hub" 
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-105 rounded-xl transition-all active:scale-95 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Student Hub
          </Link>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-lg mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-[10px] font-black uppercase tracking-widest">
            <Trophy className="h-3.5 w-3.5 text-teal-400 animate-bounce" />
            Rankings League
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-450 via-emerald-450 to-indigo-400 tracking-tight leading-none">
            Student Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-semibold">
            Compete with students across India. Earn XP by using AI study helper tools, completing interview decks, and coding mock rounds.
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
            <p className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Loading rankings...</p>
          </div>
        ) : error ? (
          <div className="p-8 border border-rose-500/20 bg-rose-500/5 text-rose-400 rounded-3xl text-center space-y-2">
            <h3 className="font-black text-sm uppercase tracking-wider text-rose-500">Error Loading Rankings</h3>
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/20">
            <Award className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="font-extrabold text-zinc-300 text-sm">No Rankings Yet</h3>
            <p className="text-xs text-zinc-500 mt-1 font-semibold">Start using Student Hub AI tools to earn XP and rank here!</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Contenders Metrics Widget */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto w-full">
              <div className="bg-zinc-900/20 border border-zinc-850 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-teal-500/20 transition-all duration-305 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl" />
                <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500">Contenders</span>
                <span className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-teal-400" /> {totalContenders}
                </span>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-850 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-teal-500/20 transition-all duration-305 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl" />
                <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500">Total League XP</span>
                <span className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-1.5">
                  <Zap className="h-4.5 w-4.5 text-indigo-400" /> {totalXP.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-850 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-teal-500/20 transition-all duration-305 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
                <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500">Placement Ready</span>
                <span className="text-xl sm:text-2xl font-black text-teal-450 flex items-center gap-1.5">
                  <MedBadge className="h-4.5 w-4.5 text-teal-405" /> {placementReadyRate}%
                </span>
              </div>
            </div>

            {/* Podium for top 3 */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 items-end gap-2 sm:gap-6 max-w-xl mx-auto w-full pt-10 pb-4 relative">
                {podiumOrder.map((user, idx) => {
                  const isFirst = user._id === topThree[0]._id;
                  const isSecond = topThree[1] && user._id === topThree[1]._id;
                  const isThird = topThree[2] && user._id === topThree[2]._id;

                  let rankLabel = "1st";
                  let podiumHeight = "h-44 sm:h-52";
                  let podiumBg = "bg-gradient-to-t from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30";
                  let avatarBorder = "ring-4 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
                  let medalColor = "bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]";

                  if (isSecond) {
                    rankLabel = "2nd";
                    podiumHeight = "h-32 sm:h-40";
                    podiumBg = "bg-gradient-to-t from-slate-400/10 via-slate-400/5 to-transparent border border-slate-400/20";
                    avatarBorder = "ring-4 ring-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.15)]";
                    medalColor = "bg-slate-300 text-zinc-950";
                  } else if (isThird) {
                    rankLabel = "3rd";
                    podiumHeight = "h-24 sm:h-32";
                    podiumBg = "bg-gradient-to-t from-amber-700/10 via-amber-700/5 to-transparent border border-amber-700/15";
                    avatarBorder = "ring-4 ring-amber-700 shadow-[0_0_10px_rgba(180,83,9,0.1)]";
                    medalColor = "bg-amber-700 text-zinc-100";
                  }

                  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: isFirst ? 0.1 : isSecond ? 0.2 : 0.3 }}
                      className="flex flex-col items-center flex-1 text-center relative group"
                    >
                      {/* 1st Place Crown Badge */}
                      {isFirst && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
                          <Crown className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        </div>
                      )}

                      {/* Avatar */}
                      <div className="relative mb-3.5 z-10">
                        <div className={`h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-zinc-200 text-lg sm:text-2xl shadow-2xl ${avatarBorder}`}>
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            initialLetter
                          )}
                        </div>
                        <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black ${medalColor}`}>
                          {isFirst ? "1" : isSecond ? "2" : "3"}
                        </span>
                      </div>

                      {/* Name & XP */}
                      <div className="mb-3 z-10">
                        <p className="text-xs sm:text-sm font-black text-zinc-200 truncate max-w-[80px] sm:max-w-[120px]">{user.name}</p>
                        <p className="text-[10px] sm:text-xs text-teal-400 font-extrabold">{user.xp.toLocaleString("en-IN")} XP</p>
                      </div>

                      {/* Podium Stand */}
                      <div className={`w-full rounded-t-3xl flex flex-col justify-end p-4 text-zinc-350 font-black shadow-2xl backdrop-blur-md relative overflow-hidden ${podiumBg} ${podiumHeight}`}>
                        <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
                        <span className="text-lg sm:text-2xl opacity-90 tracking-tighter">{rankLabel}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* List for lower ranks */}
            {others.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-zinc-850 shadow-2xl bg-zinc-950/20 backdrop-blur-xl overflow-hidden"
              >
                <div className="p-4 border-b border-zinc-850 bg-zinc-950/40 font-black text-[9px] uppercase tracking-wider text-zinc-550 flex justify-between">
                  <span>Rank & Student</span>
                  <span>XP Score</span>
                </div>
                <div className="divide-y divide-zinc-900/60">
                  {others.map((user, idx) => {
                    const rank = idx + 4;
                    const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";
                    const isTopTen = rank <= 10;

                    return (
                      <div 
                        key={user._id} 
                        className="p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-all duration-200 group cursor-pointer relative"
                      >
                        {/* Hover accent line */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-teal-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-center gap-3">
                          <span className={`w-6 text-center text-xs font-black ${
                            isTopTen ? "text-teal-400" : "text-zinc-600"
                          }`}>
                            {rank}
                          </span>
                          
                          <div className="h-9 w-9 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs shadow-sm relative group-hover:border-teal-500/30 transition-colors">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-zinc-400">{initialLetter}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-zinc-200 group-hover:text-teal-450 transition-colors">{user.name}</span>
                            {isTopTen && (
                              <span className="text-[7px] font-black uppercase text-teal-500 tracking-widest mt-0.5">Top 10 Contender</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-teal-400 group-hover:scale-105 transition-transform">
                            {user.xp.toLocaleString("en-IN")} XP
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-650 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
