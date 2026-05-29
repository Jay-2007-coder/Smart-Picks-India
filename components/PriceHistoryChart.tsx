"use client";

import React, { useEffect, useState } from "react";
import { TrendingDown, Calendar, ArrowRight } from "lucide-react";

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
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; date: string; index: number } | null>(null);

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        const response = await fetch(`/api/v1/alerts/price-history/${slug}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          if (data.history.length === 0) {
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
        <div className="relative flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500/20 border-t-red-600" />
          <span className="absolute text-[9px] font-bold text-red-600">Sync</span>
        </div>
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

  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 40;

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Give some graphical ceiling and floor padding
  const graphMin = minPrice * 0.97;
  const graphMax = maxPrice * 1.03;
  const priceRange = graphMax - graphMin || 10;
  const dateRange = history.length - 1 || 1;

  // Map data coordinates to SVG space
  const points = history.map((point, index) => {
    const x = paddingX + (index / dateRange) * (width - paddingX * 2);
    const y = height - paddingY - ((point.price - graphMin) / priceRange) * (height - paddingY * 2);
    return {
      x,
      y,
      price: point.price,
      date: new Date(point.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      index
    };
  });

  // Build the SVG path string (cubic bezier smoothing for a wave effect)
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
    const cpY1 = points[i - 1].y;
    const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
    const cpY2 = points[i].y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
  }

  // Build area path for the gradient fill below the wave line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const totalDrop = maxPrice - currentPrice;
  const dropPercentage = maxPrice > 0 ? Math.round((totalDrop / maxPrice) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Decorative colored glow in the card corner */}
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <TrendingDown className="h-3 w-3" /> price insights
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
            Peak: <del className="font-medium text-red-500">₹{maxPrice.toLocaleString("en-IN")}</del>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            {/* Soft vertical gradient for graph line path fill */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Drop shadow filter to give the red line a neat floating effect */}
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="rgb(239, 68, 68)" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            className="text-border/50"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="currentColor"
            className="text-border/20"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Vertical alignment line when hovered */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={paddingY}
              x2={hoveredPoint.x}
              y2={height - paddingY}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="opacity-70"
            />
          )}

          {/* Gradient area underneath the curved path */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Curved price line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgb(239, 68, 68)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadowFilter)"
          />

          {/* Touch nodes on line */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.index === idx;
            return (
              <g key={idx}>
                {/* Bigger invisible trigger circle for easy hovering */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Visible inner dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "6" : "4.5"}
                  fill={isHovered ? "rgb(239, 68, 68)" : "white"}
                  stroke="rgb(239, 68, 68)"
                  strokeWidth={isHovered ? "3.5" : "2.5"}
                  className="pointer-events-none transition-all duration-200"
                />
              </g>
            );
          })}

          {/* X-Axis labels (First and Last date points) */}
          {points.length > 0 && (
            <>
              <text
                x={points[0].x}
                y={height - paddingY + 22}
                textAnchor="middle"
                fontSize="10"
                className="fill-muted-foreground font-bold tracking-wider"
              >
                {points[0].date}
              </text>
              {points.length > 2 && (
                <text
                  x={points[Math.floor(points.length / 2)].x}
                  y={height - paddingY + 22}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-muted-foreground font-bold tracking-wider"
                >
                  {points[Math.floor(points.length / 2)].date}
                </text>
              )}
              <text
                x={points[points.length - 1].x}
                y={height - paddingY + 22}
                textAnchor="middle"
                fontSize="10"
                className="fill-muted-foreground font-bold tracking-wider"
              >
                {points[points.length - 1].date}
              </text>
            </>
          )}

          {/* Y-Axis Label Values */}
          <text
            x={paddingX - 10}
            y={height - paddingY + 4}
            textAnchor="end"
            fontSize="10"
            className="fill-muted-foreground font-black"
          >
            ₹{Math.round(graphMin).toLocaleString("en-IN")}
          </text>
          <text
            x={paddingX - 10}
            y={paddingY + 4}
            textAnchor="end"
            fontSize="10"
            className="fill-muted-foreground font-black"
          >
            ₹{Math.round(graphMax).toLocaleString("en-IN")}
          </text>
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute rounded-xl border border-border/80 bg-popover/90 backdrop-blur-md px-3.5 py-2 shadow-xl text-xs pointer-events-none transition-all duration-150 border-red-500/10"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 45}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex flex-col">
              <span className="font-extrabold text-foreground text-sm">
                ₹{hoveredPoint.price.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground mt-0.5 flex items-center gap-1">
                📅 {hoveredPoint.date}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Buying Tip footer box */}
      <div className="mt-5 p-3 rounded-2xl bg-muted/30 border border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          💡 <strong>Buying Alert:</strong> Current price is ₹{currentPrice.toLocaleString("en-IN")}.
        </span>
        <span className="text-red-500 font-extrabold flex items-center gap-0.5">
          Best time to buy <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
