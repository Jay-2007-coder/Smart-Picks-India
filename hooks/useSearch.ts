"use client";
import { useState, useEffect, useCallback } from "react";

export interface SearchResult {
  slug: string;
  title: string;
  type: "product" | "blog" | "category";
  image?: string;
  category?: string;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return { query, setQuery, results, loading, open, setOpen, clear };
}
