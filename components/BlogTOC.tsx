"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  title: string;
}

interface BlogTOCProps {
  items: TocItem[];
}

export default function BlogTOC({ items }: BlogTOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  // Track which heading is visible using IntersectionObserver
  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const offset = 96; // sticky nav height + breathing room
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveId(id);
        history.replaceState(null, "", `#${id}`);
      }
    },
    []
  );

  if (!items.length) return null;

  return (
    <nav className="space-y-0.5" aria-label="Table of contents">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={`flex items-start gap-2 text-sm rounded-lg px-2.5 py-1.5 transition-all duration-200 group ${
              isActive
                ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 font-semibold"
                : "text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 hover:bg-muted/50"
            }`}
          >
            <ChevronRight
              className={`h-3.5 w-3.5 mt-0.5 shrink-0 transition-transform duration-200 ${
                isActive
                  ? "text-brand-600 dark:text-brand-400 translate-x-0.5"
                  : "text-muted-foreground/40 group-hover:text-brand-500 group-hover:translate-x-0.5"
              }`}
            />
            <span className="leading-snug">{item.title}</span>
          </a>
        );
      })}
    </nav>
  );
}

