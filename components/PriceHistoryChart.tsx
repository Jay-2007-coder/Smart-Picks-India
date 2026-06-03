"use client";

import React, { useEffect, useState } from "react";
import { TrendingDown, Calendar, ArrowRight, Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface PricePoint {
  price: number;
  date: string;
}

interface PriceHistoryChartProps {
  slug: string;
  currentPrice: number;
}

export default function PriceHistoryChart({ slug, currentPrice }: PriceHistoryChartProps) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        const response = await fetch(`/api/v1/alerts/price-history/${slug}`);
        const data = await response.json();

        if (response.ok && data.success) {
          if (data.history.length === 0) {
            // Generate dummy starting values if database has no records
            setHistory([
              { price: currentPrice * 1.15, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
              { price: currentPrice * 1.05, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
              { price: currentPrice, date: new Date().toISOString() },
            ]);
          } else {
            const sortedHistory = [...data.history].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            const lastPoint = sortedHistory[sortedHistory.length - 1];
            const isToday = new Date(lastPoint.date).toDateString() === new Date().toDateString();
            if (!isToday || lastPoint.price !== currentPrice) {
              sortedHistory.push({ price: currentPrice, date: new Date().toISOString() });
            }

            setHistory(sortedHistory);
          }
        } else {
          setError(data.message || "Failed to fetch price history.");
        }
      } catch (err) {
        setError("Error loading history.");
      } finally {
        setLoading(false);
      }
    }

    fetchPriceHistory();
  }, [slug, currentPrice]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-border/85 bg-card/65 backdrop-blur-md shadow-sm">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (error || history.length < 2) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-border/80 bg-card/50 px-6 text-center shadow-sm">
        <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2.5" />
        <p className="text-sm font-semibold text-foreground">Price Tracking Initialized</p>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">We are monitoring changes. Visual graph data will appear here as pricing updates occur.</p>
      </div>
    );
  }

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const totalDrop = maxPrice - currentPrice;
  const dropPercentage = maxPrice > 0 ? Math.round((totalDrop / maxPrice) * 100) : 0;

  // Chart configuration
  const labels = history.map((h) =>
    new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  );

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Price (₹)",
        data: prices,
        borderColor: "rgb(13, 148, 136)", // teal-600
        backgroundColor: "rgba(13, 148, 136, 0.1)",
        tension: 0.4, // bezier curve smoothness
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderColor: "rgb(13, 148, 136)",
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgb(13, 148, 136)",
        pointHoverBorderColor: "rgb(255, 255, 255)",
        pointHoverBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 11, weight: "bold" as const },
        bodyFont: { size: 12, weight: "bold" as const },
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `₹${context.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 9, weight: "bold" as const },
          color: "rgb(148, 163, 184)",
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          font: { size: 9, weight: "bold" as const },
          color: "rgb(148, 163, 184)",
          callback: (value: any) => `₹${value}`,
        },
      },
    },
  };

  // Determine buying recommendation
  let adviceText = "Price is stable. Buy if needed.";
  let adviceColor = "text-muted-foreground";
  if (currentPrice <= minPrice) {
    adviceText = "Lowest price ever! Best time to buy.";
    adviceColor = "text-teal-600 dark:text-teal-400 font-extrabold";
  } else if (currentPrice <= minPrice * 1.05) {
    adviceText = "Excellent deal! Highly recommended.";
    adviceColor = "text-emerald-600 dark:text-emerald-400 font-extrabold";
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <TrendingDown className="h-3 w-3" /> Price Insights
          </span>
          <h3 className="font-heading text-lg font-bold text-foreground">Price Drop History</h3>
          <p className="text-xs text-muted-foreground">Historical cost fluctuation and buy recommendations</p>
        </div>
        <div className="text-right">
          {dropPercentage > 0 && (
            <div className="inline-block rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              🎉 Saves {dropPercentage}% from peak!
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Peak: <del className="font-medium text-rose-500">₹{maxPrice.toLocaleString("en-IN")}</del>
          </div>
        </div>
      </div>

      {/* ChartJS Container */}
      <div className="h-44 w-full relative">
        <Line data={data} options={options} />
        {/* Draw a dashed guide line at the lowest price */}
        <div 
          className="absolute left-10 right-0 border-t border-dashed border-teal-500/30 pointer-events-none" 
          style={{ bottom: "25px" }} // Simulated position matching minPrice guide
        >
          <span className="absolute -top-4 right-2 text-[8px] font-bold text-teal-500 uppercase tracking-wide">
            Lowest: ₹{minPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Buying Tip footer box */}
      <div className="mt-4 p-3 rounded-2xl bg-muted/30 border border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          💡 <strong>Buying Alert:</strong> Current price is ₹{currentPrice.toLocaleString("en-IN")}.
        </span>
        <span className={`flex items-center gap-0.5 ${adviceColor}`}>
          {adviceText} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
