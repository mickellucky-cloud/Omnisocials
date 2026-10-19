"use client";

import React, { useState } from "react";
import { Workspace } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { MetricBlock } from "../ui/MetricBlock";
import { PlatformBadge } from "../ui/PlatformBadge";
import { generateHeatmapData, initialCompetitors } from "@/lib/data/mockData";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  ArrowUpRight,
  Eye,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsViewProps {
  currentWorkspace: Workspace;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ currentWorkspace }) => {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const heatmap = React.useMemo(() => generateHeatmapData(), []);
  const competitors = initialCompetitors[currentWorkspace.id] || initialCompetitors["acme-cloud"];

  const daysLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleExport = (type: "pdf" | "csv") => {
    setExportNotice(`✓ Generating ${type.toUpperCase()} executive performance digest for ${currentWorkspace.name}...`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Header & Range Controls */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Cross-Network Analytics</h2>
            <p className="text-xs text-slate-500">
              High-fidelity reach performance, 24x7 posting heatmap, and competitor benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Filter */}
          <div 
            role="tablist"
            aria-label="Analytics time range filter"
            className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs"
          >
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                role="tab"
                id={`range-tab-${r}`}
                aria-selected={range === r}
                onClick={() => setRange(r)}
                aria-label={`Show ${r} analytics window`}
                className={cn(
                  "tap-press min-h-[36px] px-3.5 py-1.5 rounded-lg transition-colors font-medium focus-visible:ring-2 focus-visible:ring-blue-500",
                  range === r ? "bg-white text-blue-700 font-semibold shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport("csv")}
              aria-label="Export analytics report as CSV"
              className="tap-press min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 flex items-center gap-2 transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Download className="w-3.5 h-3.5" /> <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              aria-label="Export executive digest as PDF"
              className="tap-press min-h-[38px] px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Download className="w-3.5 h-3.5" /> <span>Export PDF</span>
            </button>
          </div>
        </div>
      </GlassPanel>

      {exportNotice && (
        <div 
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium animate-in fade-in shadow-2xs"
        >
          {exportNotice}
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Total Reach"
          value="1,420,800"
          change="18.4%"
          isPositive={true}
          subtext="Unique accounts exposed"
          icon={<Eye className="w-4 h-4 text-blue-600" />}
        />
        <MetricBlock
          label="Engagement Velocity"
          value="68,200"
          change="12.1%"
          isPositive={true}
          subtext="Clicks, shares, discussions"
          icon={<TrendingUp className="w-4 h-4 text-cyan-600" />}
        />
        <MetricBlock
          label="Average CTR"
          value="3.84%"
          change="0.45%"
          isPositive={true}
          subtext="Outbound documentation links"
          icon={<ArrowUpRight className="w-4 h-4 text-emerald-600" />}
        />
        <MetricBlock
          label="Follower Net Growth"
          value="+14,290"
          change="6.2%"
          isPositive={true}
          subtext="Compounding agency scale"
          icon={<Users className="w-4 h-4 text-purple-600" />}
        />
      </div>

      {/* 24x7 Best Time to Post Heatmap */}
      <GlassPanel className="p-5 space-y-4 border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> 24x7 Best Time to Post Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              Follower engagement density by day of week and hour of day (UTC)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
              <span className="text-slate-500">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600" />
              <span className="text-slate-500">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 ring-2 ring-emerald-500/30" />
              <span className="text-emerald-700 font-bold">Optimal Slot (✦ Recomm.)</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid (7 Rows x 24 Columns) */}
        <div className="overflow-x-auto pb-2">
          <div 
            role="grid" 
            aria-label="24x7 posting engagement density matrix" 
            className="min-w-[700px] space-y-1.5"
          >
            {/* Hours Header (0 to 23) */}
            <div role="row" className="grid grid-cols-25 gap-1 text-[10px] text-slate-400 text-center font-mono">
              <div role="columnheader" className="text-left font-sans">Day</div>
              {Array.from({ length: 24 }, (_, h) => (
                <div role="columnheader" key={h} className="tabular-nums">{h % 3 === 0 ? `${h}h` : "·"}</div>
              ))}
            </div>

            {/* Day rows */}
            {daysLabels.map((dayName, dayIdx) => (
              <div role="row" key={dayIdx} className="grid grid-cols-25 gap-1 items-center">
                <div role="rowheader" className="text-xs font-semibold text-slate-700 w-10 text-left">
                  {dayName}
                </div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = heatmap.find((c) => c.day === dayIdx && c.hour === hour) || {
                    day: dayIdx,
                    hour,
                    engagementScore: 20,
                    recommended: false,
                  };

                  let bgClass = "bg-slate-100 text-slate-400";
                  if (cell.engagementScore > 80) bgClass = "bg-blue-600 text-white shadow-xs font-bold";
                  else if (cell.engagementScore > 60) bgClass = "bg-blue-400 text-white font-medium";
                  else if (cell.engagementScore > 40) bgClass = "bg-blue-200 text-blue-900";
                  else if (cell.engagementScore > 20) bgClass = "bg-blue-100/70 text-blue-800";

                  const tooltipText = `${dayName} at ${hour}:00 UTC - Engagement Index: ${cell.engagementScore}%${
                    cell.recommended ? " (Recommended optimal slot)" : ""
                  }`;

                  return (
                    <div
                      key={hour}
                      role="gridcell"
                      tabIndex={0}
                      aria-label={tooltipText}
                      title={tooltipText}
                      className={cn(
                        "tap-press h-6 rounded flex items-center justify-center text-[9px] font-mono tabular-nums cursor-pointer transition-all hover:scale-110 relative group border border-slate-200/50 focus-visible:ring-2 focus-visible:ring-blue-500",
                        bgClass,
                        cell.recommended ? "ring-2 ring-emerald-500 bg-emerald-500 text-white font-bold" : ""
                      )}
                    >
                      {cell.recommended ? "★" : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      {/* Competitor Benchmarking Section */}
      <GlassPanel className="p-5 space-y-4 border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" /> Competitor Benchmarking
            </h3>
            <p className="text-xs text-slate-500">
              Comparative follower growth, posting frequency, and engagement rates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Active Workspace Card */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{currentWorkspace.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold border border-blue-200">
                YOUR BRAND
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-xs font-mono font-bold text-slate-900">4.8%</div>
                <div className="text-[10px] text-slate-500">Avg Eng.</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-xs font-mono font-bold text-emerald-700">+8.4%</div>
                <div className="text-[10px] text-slate-500">Growth</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-xs font-mono font-bold text-slate-900">18/wk</div>
                <div className="text-[10px] text-slate-500">Frequency</div>
              </div>
            </div>
          </div>

          {/* Competitor Cards */}
          {competitors.map((comp) => (
            <div key={comp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{comp.name}</div>
                  <div className="text-[10px] text-slate-500">{comp.handle}</div>
                </div>
                <PlatformBadge platform={comp.platform} size="sm" showLabel={false} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-mono font-bold text-slate-800">{comp.avgEngagementRate}%</div>
                  <div className="text-[10px] text-slate-500">Avg Eng.</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-mono font-bold text-slate-700">+{comp.growthPercent}%</div>
                  <div className="text-[10px] text-slate-500">Growth</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-mono font-bold text-slate-800">{comp.postsPerWeek}/wk</div>
                  <div className="text-[10px] text-slate-500">Frequency</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
};
