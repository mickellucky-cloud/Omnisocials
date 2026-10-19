import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricBlockProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
  sparklineData?: number[];
  sparklineColor?: string;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
  label,
  value,
  change,
  isPositive = true,
  subtext,
  icon,
  className,
  sparklineData = [24, 32, 28, 45, 42, 60, 58, 72, 85],
  sparklineColor = "#2563EB",
}) => {
  // Generate SVG path for sparkline
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 120;
  const height = 36;
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200 group relative overflow-hidden",
        className
      )}
    >
      {/* Ambient gradient aura */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />

      <div>
        <div className="flex items-center justify-between text-slate-500 mb-2.5">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 font-mono">
            {label}
          </span>
          {icon && (
            <div className="text-slate-600 p-2 rounded-xl bg-slate-100/80 border border-slate-200/80 group-hover:scale-105 transition-transform">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {change && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs",
                  isPositive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-rose-600" />
                )}
                {change}
              </span>
            )}
          </div>

          {/* Mini Sparkline Chart */}
          <div className="shrink-0">
            <svg width="80" height="28" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              <defs>
                <linearGradient id={`grad-${label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill={`url(#grad-${label.replace(/\s+/g, "")})`} />
              <path
                d={pathD}
                fill="none"
                stroke={sparklineColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {subtext && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{subtext}</span>
          <span className="font-mono text-[10px] text-slate-400">Live 24h</span>
        </div>
      )}
    </div>
  );
};
