"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { Components } from "react-markdown";
import { CheckCircle2, ShoppingCart, TrendingUp, Lightbulb } from "lucide-react";

interface BlogContentProps {
  content: string;
}

// Detect if an H3 heading looks like a product listing
function isProductHeading(text: string) {
  const productKeywords = [
    "price", "rs.", "₹", "best", "buy", "deal", "earbuds", "headphones",
    "iphone", "samsung", "boat", "noise", "watch", "gadget", "under", "budget",
    "laptop", "tablet", "camera", "speaker", "smartwatch", "realme", "oppo",
    "oneplus", "xiaomi", "titan", "rockerz", "airdopes", "buds",
  ];
  const lower = text.toLowerCase();
  return productKeywords.some((k) => lower.includes(k));
}

const markdownComponents: Components = {
  // H2 — main section heading with accent bar
  h2({ children, id }) {
    return (
      <div className="mt-10 mb-5 first:mt-0">
        <h2
          id={id}
          className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-foreground scroll-mt-24"
        >
          <span className="inline-block w-1 h-7 rounded-full bg-brand-600 shrink-0" />
          {children}
        </h2>
        <div className="mt-2 h-px bg-gradient-to-r from-brand-600/20 via-brand-300/10 to-transparent" />
      </div>
    );
  },

  // H3 — product cards or sub-section headings
  h3({ children, id }) {
    const text = String(children);
    if (isProductHeading(text)) {
      return (
        <div
          id={id}
          className="scroll-mt-24 mt-6 mb-3 rounded-xl border border-brand-200/60 dark:border-brand-800/40 bg-gradient-to-r from-brand-50/60 to-transparent dark:from-brand-950/40 dark:to-transparent px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-brand-600/10 flex items-center justify-center">
              <ShoppingCart className="h-3.5 w-3.5 text-brand-600" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">{children}</h3>
          </div>
        </div>
      );
    }
    return (
      <h3
        id={id}
        className="scroll-mt-24 mt-8 mb-3 text-base sm:text-lg font-bold text-foreground flex items-center gap-2"
      >
        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
        {children}
      </h3>
    );
  },

  // Paragraph
  p({ children }) {
    return (
      <p className="text-[15px] leading-[1.85] text-foreground/85 mb-5">{children}</p>
    );
  },

  // Unordered list — styled checklist bullets
  ul({ children }) {
    return (
      <ul className="not-prose my-5 space-y-2.5 pl-0">{children}</ul>
    );
  },

  li({ children }) {
    return (
      <li className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground/85">
        <CheckCircle2 className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
        <span>{children}</span>
      </li>
    );
  },

  // Ordered list
  ol({ children }) {
    return (
      <ol className="not-prose my-5 space-y-2.5 pl-0 counter-reset-[item]">{children}</ol>
    );
  },

  // Horizontal rule — decorative divider
  hr() {
    return (
      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <TrendingUp className="h-4 w-4 text-brand-600/50" />
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  },

  // Bold — brand-colored highlight
  strong({ children }) {
    return (
      <strong className="font-semibold text-brand-700 dark:text-brand-400">{children}</strong>
    );
  },

  // Blockquote — tip box
  blockquote({ children }) {
    return (
      <blockquote className="not-prose my-6 flex gap-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 px-4 py-4">
        <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">{children}</div>
      </blockquote>
    );
  },

  // Inline code
  code({ children }) {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-brand-700 dark:text-brand-300">
        {children}
      </code>
    );
  },

  // Table
  table({ children }) {
    return (
      <div className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-muted/60">{children}</thead>;
  },
  th({ children }) {
    return (
      <th className="px-4 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide border-b border-border">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-3 text-foreground/80 border-b border-border/50 last:border-0">
        {children}
      </td>
    );
  },
};

export default function BlogContent({ content }: BlogContentProps) {
  if (!content) return null;
  return (
    <div className="blog-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}