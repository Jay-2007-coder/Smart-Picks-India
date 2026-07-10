"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function StudentHubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Student Hub Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md space-y-6">
        {/* Icon */}
        <div className="inline-flex p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto">
          <AlertTriangle className="h-10 w-10" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">
            Something Went Wrong
          </h1>
          <p className="text-sm text-white/40 font-semibold leading-relaxed">
            The AI tool ran into an unexpected error. This is usually a temporary issue — try again.
          </p>
        </div>

        {/* Error details (dev only style) */}
        {error?.message && (
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-left">
            <p className="text-[10px] font-mono text-white/30 truncate">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/student-hub"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-white/70 text-xs font-black uppercase tracking-widest hover:border-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
