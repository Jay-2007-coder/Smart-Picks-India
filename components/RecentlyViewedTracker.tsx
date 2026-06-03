"use client";

import { useEffect } from "react";

interface TrackerProps {
  slug: string;
}

export default function RecentlyViewedTracker({ slug }: TrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      const stored = localStorage.getItem("smart_picks_recently_viewed");
      let list: string[] = stored ? JSON.parse(stored) : [];
      
      // Filter out current slug and insert it at the start
      list = list.filter((s) => s !== slug);
      list.unshift(slug);
      
      // Cap list to the last 10 products
      list = list.slice(0, 10);
      
      localStorage.setItem("smart_picks_recently_viewed", JSON.stringify(list));
    } catch (err) {
      console.error("Error updating recently viewed items in localStorage:", err);
    }
  }, [slug]);

  return null;
}
