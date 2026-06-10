import React from "react";
import RoadmapOverview from "@/components/roadmap/RoadmapOverview";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Tech Roadmap Hub | SmartPicks Student Hub",
  description: "Explore interactive language ecosystem maps, career timelines, and checkbox checkpoints for AI/ML, Web Development, and DevOps engineering.",
};

export default function RoadmapsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-foreground mb-8 transition-colors select-none"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Student Hub
        </Link>
        <RoadmapOverview />
      </div>
    </div>
  );
}
