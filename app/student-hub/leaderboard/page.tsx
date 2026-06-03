"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Sparkles, Loader2, Award } from "lucide-react";
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

  return (
    <div className="container-custom max-w-4xl py-12">
      {/* Back button */}
      <div className="mb-8">
        <Link 
          href="/student-hub" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Student Hub
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold mb-3">
            <Trophy className="h-3.5 w-3.5" />
            Rankings
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Student Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Compete with students across India. Earn XP by using AI study helper tools!
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading rankings...</p>
          </div>
        ) : error ? (
          <div className="p-8 border border-rose-500/20 bg-rose-500/5 text-rose-500 rounded-3xl text-center">
            <h3 className="font-bold">Error Loading Rankings</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-3xl">
            <Award className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-bold text-foreground">No Rankings Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Start using Student Hub AI tools to earn XP and rank here!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Podium for top 3 */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 items-end gap-2 sm:gap-6 max-w-xl mx-auto w-full pt-8 pb-4">
                {podiumOrder.map((user, idx) => {
                  const isFirst = user._id === topThree[0]._id;
                  const isSecond = topThree[1] && user._id === topThree[1]._id;
                  const isThird = topThree[2] && user._id === topThree[2]._id;

                  let rankLabel = "1st";
                  let podiumHeight = "h-40 sm:h-48";
                  let podiumBg = "bg-teal-600/90 dark:bg-teal-600/90";
                  let avatarBorder = "ring-4 ring-amber-400";
                  let medalColor = "text-amber-400";

                  if (isSecond) {
                    rankLabel = "2nd";
                    podiumHeight = "h-28 sm:h-36";
                    podiumBg = "bg-teal-700/80 dark:bg-teal-700/80";
                    avatarBorder = "ring-4 ring-slate-300";
                    medalColor = "text-slate-300";
                  } else if (isThird) {
                    rankLabel = "3rd";
                    podiumHeight = "h-20 sm:h-28";
                    podiumBg = "bg-teal-800/70 dark:bg-teal-800/70";
                    avatarBorder = "ring-4 ring-amber-600";
                    medalColor = "text-amber-600";
                  }

                  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: isFirst ? 0.1 : isSecond ? 0.2 : 0.3 }}
                      className="flex flex-col items-center flex-1 text-center"
                    >
                      {/* Avatar */}
                      <div className="relative mb-3">
                        <div className={`h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center font-bold text-foreground text-lg sm:text-2xl shadow-xl ${avatarBorder}`}>
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            initialLetter
                          )}
                        </div>
                        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md ${medalColor}`}>
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      {/* Name & XP */}
                      <div className="mb-2">
                        <p className="text-xs sm:text-sm font-black text-foreground truncate max-w-[80px] sm:max-w-[120px]">{user.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-bold">{user.xp.toLocaleString("en-IN")} XP</p>
                      </div>

                      {/* Podium Stand */}
                      <div className={`w-full rounded-t-2xl flex flex-col justify-end p-3 text-white font-black shadow-lg shadow-black/5 ${podiumBg} ${podiumHeight}`}>
                        <span className="text-lg sm:text-2xl opacity-90">{rankLabel}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* List for lower ranks */}
            {others.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-border shadow-xl bg-white dark:bg-slate-950 overflow-hidden"
              >
                <div className="p-4 border-b border-border bg-muted/40 font-bold text-xs text-muted-foreground flex justify-between">
                  <span>Rank & Name</span>
                  <span>XP Score</span>
                </div>
                <div className="divide-y divide-border/60">
                  {others.map((user, idx) => {
                    const rank = idx + 4;
                    const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";
                    return (
                      <div 
                        key={user._id} 
                        className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-sm font-black text-muted-foreground text-center">
                            {rank}
                          </span>
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs shadow-sm">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover rounded-full" />
                            ) : (
                              initialLetter
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground">{user.name}</span>
                        </div>
                        <span className="text-sm font-black text-teal-600 dark:text-teal-400">
                          {user.xp.toLocaleString("en-IN")} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
