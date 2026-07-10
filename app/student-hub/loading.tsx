export default function StudentHubLoading() {
  return (
    <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center gap-6">
      {/* Animated logo pulse */}
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/20 flex items-center justify-center animate-pulse">
          <svg
            className="w-8 h-8 text-violet-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        {/* Outer ring animation */}
        <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/20 animate-ping" />
      </div>

      {/* Skeleton bars */}
      <div className="w-full max-w-xl px-6 space-y-3">
        <div className="h-2.5 bg-white/5 rounded-full animate-pulse w-3/4 mx-auto" />
        <div className="h-2 bg-white/5 rounded-full animate-pulse w-1/2 mx-auto" />
      </div>

      <p className="text-xs font-bold text-white/20 uppercase tracking-widest font-mono animate-pulse">
        Loading Student Hub…
      </p>
    </div>
  );
}
