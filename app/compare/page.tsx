"use client";

import { useEffect, useState, useRef } from "react";
import { useCompare } from "@/hooks/useCompare";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Download, Loader2, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

export default function ComparePage() {
  const { comparedProducts, clearCompare } = useCompare();
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<{
    verdict: string;
    specs: Array<{ name: string; values: string[] }>;
    awards: Array<{ slug: string; award: string }>;
  } | null>(null);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (comparedProducts.length < 2) {
      setLoading(false);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/v1/ai/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products: comparedProducts }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate AI comparison.");
        }

        const data = await response.json();
        if (data.success) {
          setComparison({
            verdict: data.verdict,
            specs: data.specs,
            awards: data.awards || [],
          });
        } else {
          throw new Error(data.message || "Could not compare products.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [comparedProducts]);

  const handleExportImage = () => {
    if (!comparison || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions
    const width = 800;
    const itemWidth = 200;
    const specHeaderWidth = 200;
    const rowHeight = 60;
    const headerHeight = 220;
    const verdictHeight = 150;
    const totalHeight = headerHeight + comparison.specs.length * rowHeight + verdictHeight + 80;

    canvas.width = width;
    canvas.height = totalHeight;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, totalHeight);

    // Draw Title
    ctx.fillStyle = "#d43f36";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Smart Picks India - Product Comparison", 30, 45);

    ctx.fillStyle = "#64748b";
    ctx.font = "14px Arial";
    ctx.fillText("Handpicked smart recommendations & specification analysis", 30, 70);

    // Draw header divider
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 90);
    ctx.lineTo(width - 30, 90);
    ctx.stroke();

    // Draw Column Headers (Products)
    comparedProducts.forEach((p, idx) => {
      const x = specHeaderWidth + idx * itemWidth + 20;

      // Draw award if exists
      const award = comparison.awards?.find((a) => a.slug === p.slug)?.award;
      if (award) {
        ctx.fillStyle = "#0d9488"; // teal
        ctx.fillRect(x - 5, 105, itemWidth - 30, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(award, x + (itemWidth - 30) / 2 - 5, 119);
        ctx.textAlign = "left";
      }

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 13px Arial";
      // Wrap text
      const title = p.title || "";
      const firstLine = title.substring(0, 20);
      const secondLine = title.length > 20 ? title.substring(20, 40) + "..." : "";
      ctx.fillText(firstLine, x, 145);
      if (secondLine) ctx.fillText(secondLine, x, 160);

      ctx.fillStyle = "#d43f36";
      ctx.font = "bold 16px Arial";
      ctx.fillText(`₹${p.price.toLocaleString("en-IN")}`, x, 185);

      ctx.fillStyle = "#f59e0b";
      ctx.font = "12px Arial";
      ctx.fillText(`⭐ ${p.rating} (${p.reviewCount}+)`, x, 205);
    });

    // Draw specification rows
    let currentY = headerHeight;
    comparison.specs.forEach((spec, sIdx) => {
      // Row background zebra shading
      if (sIdx % 2 === 0) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(30, currentY, width - 60, rowHeight);
      }

      // Border bottom
      ctx.strokeStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.moveTo(30, currentY + rowHeight);
      ctx.lineTo(width - 30, currentY + rowHeight);
      ctx.stroke();

      // Spec name
      ctx.fillStyle = "#475569";
      ctx.font = "bold 13px Arial";
      ctx.fillText(spec.name, 45, currentY + 35);

      // Spec values
      spec.values.forEach((val, vIdx) => {
        if (vIdx < comparedProducts.length) {
          const x = specHeaderWidth + vIdx * itemWidth + 20;
          ctx.fillStyle = "#334155";
          ctx.font = "12px Arial";
          ctx.fillText(val.length > 25 ? val.substring(0, 22) + "..." : val, x, currentY + 35);
        }
      });

      currentY += rowHeight;
    });

    // Draw Verdict Box
    currentY += 20;
    ctx.fillStyle = "#f0fdfa";
    ctx.fillRect(30, currentY, width - 60, verdictHeight);
    ctx.strokeStyle = "#ccfbf1";
    ctx.lineWidth = 1;
    ctx.strokeRect(30, currentY, width - 60, verdictHeight);

    ctx.fillStyle = "#0f766e";
    ctx.font = "bold 15px Arial";
    ctx.fillText("SmartPicks AI Verdict", 45, currentY + 30);

    ctx.fillStyle = "#115e59";
    ctx.font = "italic 13px Arial";
    // Word wrap verdict
    const words = comparison.verdict.split(" ");
    let line = "";
    let verdictY = currentY + 55;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 100 && n > 0) {
        ctx.fillText(line, 45, verdictY);
        line = words[n] + " ";
        verdictY += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 45, verdictY);

    // Save as image
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `smart-picks-comparison.png`;
    link.href = dataUrl;
    link.click();
  };

  if (comparedProducts.length < 2) {
    return (
      <div className="container-custom max-w-4xl py-24 text-center">
        <div className="max-w-md mx-auto p-8 bg-muted/20 border border-border rounded-3xl shadow-lg">
          <h2 className="text-xl font-bold text-foreground">Not Enough Products Selected</h2>
          <p className="text-sm text-muted-foreground mt-3">
            Please select at least 2 products to use the AI Comparison Tool. You can check the "Compare" box on any product card.
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Link href="/" className="btn-primary bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm py-2 px-5">
              Go to Home Page
            </Link>
            <Link href="/deals" className="btn-secondary rounded-xl text-sm py-2 px-5">
              Browse Hot Deals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom max-w-5xl py-12">
      {/* Back navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to shopping
        </Link>

        {comparison && !loading && (
          <button
            onClick={handleExportImage}
            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg border border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" /> Export Comparison Image
          </button>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold mb-2">
              <Sparkles className="h-3 w-3" /> AI Engine Active
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Compare Smart Picks
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyzing specifications and value metrics powered by Gemini intelligence.
            </p>
          </div>
          <button
            onClick={clearCompare}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-colors border border-rose-500/10 text-right self-start md:self-auto"
          >
            Clear Selections
          </button>
        </div>

        {/* Comparison Block */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">
              Generating comparative specs analysis using Gemini AI...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 border border-rose-500/20 bg-rose-500/5 text-rose-500 rounded-3xl text-center">
            <h3 className="font-bold">Comparison Failed</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : (
          comparison && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8"
            >
              {/* Desktop Comparison Table */}
              <div className="overflow-x-auto rounded-3xl border border-border shadow-xl bg-white dark:bg-slate-950">
                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="p-6 font-black text-sm text-muted-foreground w-1/4">Specs / Features</th>
                      {comparedProducts.map((p) => {
                        const award = comparison.awards?.find((a) => a.slug === p.slug)?.award;
                        return (
                          <th key={p.slug} className="p-6 w-1/4 relative align-top">
                            {/* Award Badge */}
                            {award && (
                              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-teal-600 text-white text-[9px] font-black tracking-wider uppercase shadow">
                                <Sparkles className="h-2.5 w-2.5" /> {award}
                              </span>
                            )}
                            <div className="flex flex-col gap-3 mt-2">
                              <div className="relative aspect-square w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted">
                                <Image src={p.image} alt={p.title} fill className="object-cover" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-foreground leading-tight line-clamp-2">{p.title}</h4>
                                <span className="text-xs text-brand-600 font-bold capitalize mt-1 block">{p.category}</span>
                              </div>
                              <div className="flex flex-col mt-1">
                                <span className="text-base font-black text-foreground">{formatPrice(p.price)}</span>
                                {p.oldPrice > p.price && (
                                  <span className="text-xs text-muted-foreground line-through">{formatPrice(p.oldPrice)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                {p.rating} <span className="text-muted-foreground font-medium">({p.reviewCount})</span>
                              </div>
                              <a
                                href={p.affiliateLink}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="btn-primary py-1.5 px-3 text-xs w-full justify-center flex items-center gap-1 shadow-sm mt-1"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" /> Buy Amazon
                              </a>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.specs.map((row, idx) => (
                      <tr
                        key={row.name}
                        className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${idx % 2 === 0 ? "bg-muted/20" : ""}`}
                      >
                        <td className="p-6 font-bold text-sm text-foreground">{row.name}</td>
                        {row.values.map((val, vIdx) => (
                          <td key={vIdx} className="p-6 text-sm text-muted-foreground leading-relaxed font-medium">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Verdict Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="p-6 rounded-3xl border border-teal-500/20 bg-teal-500/5 dark:bg-teal-500/10 flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="p-3 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/10">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-teal-900 dark:text-teal-100 flex items-center gap-1.5">
                    SmartPicks Expert AI Verdict
                  </h3>
                  <p className="text-sm text-teal-800 dark:text-teal-200 mt-2 leading-relaxed font-medium">
                    {comparison.verdict}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )
        )}
      </div>

      {/* Hidden canvas for image exporting */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
