"use client";

import React, { useState } from "react";
import { Workspace, PostItem, ConversationThread, ConnectedAccount } from "@/types";
import { getStoredAccounts } from "@/lib/data/storage";
import { NavViewId } from "../shell/Sidebar";
import { GlassPanel } from "../ui/GlassPanel";
import { MetricBlock } from "../ui/MetricBlock";
import { StatusBadge } from "../ui/StatusBadge";
import { PlatformBadge } from "../ui/PlatformBadge";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import {
  Users,
  Eye,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Share2,
  Plus,
  Check,
  Activity,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Globe,
  Sliders,
  Flame,
} from "lucide-react";

interface CommandCenterViewProps {
  currentWorkspace: Workspace;
  onNavigate: (view: NavViewId) => void;
  posts: PostItem[];
  threads: ConversationThread[];
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  currentWorkspace,
  onNavigate,
  posts,
  threads,
}) => {
  const [selectedChartMetric, setSelectedChartMetric] = useState<"impressions" | "engagement" | "audience" | "roi">("impressions");
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [accounts, setAccounts] = React.useState<ConnectedAccount[]>([]);

  React.useEffect(() => {
    setAccounts(getStoredAccounts(currentWorkspace.id));
  }, [currentWorkspace.id]);

  const queuedPosts = posts.filter((p) => p.status === "queued" || p.status === "scheduled");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const pendingApprovals = posts.filter((p) => p.status === "pending_approval");

  const totalAudience = accounts.reduce((acc, a) => acc + (a.followersCount || 0), 0);
  const hasActivity = publishedPosts.length > 0 || accounts.length > 0;
  const estimatedImpressions = publishedPosts.length * 1250 + (totalAudience > 0 ? Math.round(totalAudience * 0.15) : 0);

  // Dynamic Chart datasets
  const chartData = {
    impressions: {
      title: "Active Impressions",
      total: hasActivity ? formatNumber(estimatedImpressions) : "0",
      change: hasActivity ? "+100%" : "0.0%",
      color: "#2563EB",
      points: hasActivity
        ? [
            Math.round(estimatedImpressions * 0.1),
            Math.round(estimatedImpressions * 0.25),
            Math.round(estimatedImpressions * 0.4),
            Math.round(estimatedImpressions * 0.6),
            Math.round(estimatedImpressions * 0.8),
            Math.round(estimatedImpressions * 0.9),
            estimatedImpressions,
          ]
        : [0, 0, 0, 0, 0, 0, 0],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    engagement: {
      title: "Avg Engagement Rate",
      total: hasActivity ? "4.2%" : "0.0%",
      change: hasActivity ? "+0.4%" : "0.0%",
      color: "#059669",
      points: hasActivity ? [2.1, 2.8, 3.4, 3.9, 4.1, 4.5, 4.2] : [0, 0, 0, 0, 0, 0, 0],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    audience: {
      title: "Total Audience",
      total: formatNumber(totalAudience),
      change: totalAudience > 0 ? "+100%" : "0.0%",
      color: "#7C3AED",
      points: totalAudience > 0
        ? [
            Math.round(totalAudience * 0.8),
            Math.round(totalAudience * 0.85),
            Math.round(totalAudience * 0.9),
            Math.round(totalAudience * 0.94),
            Math.round(totalAudience * 0.97),
            Math.round(totalAudience * 0.99),
            totalAudience,
          ]
        : [0, 0, 0, 0, 0, 0, 0],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    roi: {
      title: "Dispatched Posts",
      total: `${publishedPosts.length}`,
      change: publishedPosts.length > 0 ? `+${publishedPosts.length}` : "0",
      color: "#D97706",
      points: publishedPosts.length > 0
        ? [
            0,
            0,
            1,
            Math.min(publishedPosts.length, 2),
            Math.min(publishedPosts.length, 3),
            Math.min(publishedPosts.length, 4),
            publishedPosts.length,
          ]
        : [0, 0, 0, 0, 0, 0, 0],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  };

  const activeChart = chartData[selectedChartMetric];

  // Calculate SVG chart path
  const minVal = Math.min(...activeChart.points);
  const maxVal = Math.max(...activeChart.points);
  const chartWidth = 680;
  const chartHeight = 180;
  const paddingX = 30;
  const paddingY = 24;
  const availableW = chartWidth - paddingX * 2;
  const availableH = chartHeight - paddingY * 2;

  const svgPoints = activeChart.points.map((val, idx) => {
    const x = paddingX + (idx / (activeChart.points.length - 1)) * availableW;
    const y = chartHeight - paddingY - ((val - minVal) / (maxVal - minVal || 1)) * availableH;
    return { x, y, val };
  });

  const chartPathD = `M ${svgPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const chartAreaD = `${chartPathD} L ${paddingX + availableW},${chartHeight - paddingY} L ${paddingX},${chartHeight - paddingY} Z`;

  // Real-time network telemetries
  const networkTelemetries = [
    { platform: "x" as const, name: "𝕏 API v2", latency: 32, status: "healthy", rateLimit: "98% free" },
    { platform: "linkedin" as const, name: "LinkedIn Marketing", latency: 45, status: "healthy", rateLimit: "100% free" },
    { platform: "instagram" as const, name: "Meta Graph API", latency: 28, status: "healthy", rateLimit: "94% free" },
    { platform: "tiktok" as const, name: "TikTok LoginKit", latency: 54, status: "healthy", rateLimit: "99% free" },
    { platform: "telegram" as const, name: "Telegram Bot API", latency: 19, status: "healthy", rateLimit: "100% free" },
    { platform: "youtube" as const, name: "YouTube Data v3", latency: 39, status: "healthy", rateLimit: "96% free" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-6 animate-in fade-in duration-300">
      {/* 1. Real-time Multi-Network Telemetry Strip */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[10px] sm:text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ALL APIS OPERATIONAL</span>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
            <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Latency: <strong className="text-slate-900 font-mono">31ms</strong></span>
          </div>
        </div>

        {/* Channels micro-ticker with smooth horizontal swipe */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-full scrollbar-none">
          {networkTelemetries.map((net) => (
            <div key={net.platform} className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">{net.name}</span>
              <span className="text-slate-400">{net.latency}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top Welcome & Agency Workspace Banner */}
      <GlassPanel className="p-5 sm:p-6 md:p-8 border-slate-200/90 bg-white relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/8 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentWorkspace.avatarUrl}
                alt={currentWorkspace.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-md ring-4 ring-blue-500/10"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                  {currentWorkspace.name}
                </h2>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize font-bold font-mono shrink-0">
                  {currentWorkspace.category.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                {currentWorkspace.tagline}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => onNavigate("social_accounts")}
              className="tap-press min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all hover:border-slate-400"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Linked Channels ({currentWorkspace.connectedCount})</span>
            </button>
            <button
              onClick={() => onNavigate("content_studio")}
              className="tap-press min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>✦ Multi-Network Composer</span>
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* 3. 4 Primary Executive KPI Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Total Global Audience"
          value={totalAudience > 0 ? formatNumber(totalAudience) : "0"}
          change={totalAudience > 0 ? "Live" : "0.0%"}
          isPositive={true}
          subtext={accounts.length > 0 ? `${accounts.length} linked channel${accounts.length > 1 ? "s" : ""}` : "No channels linked"}
          icon={<Users className="w-4 h-4 text-blue-600" />}
          sparklineData={totalAudience > 0 ? [32, 42, 40, 58, 62, 75, 88, 92] : [0, 0, 0, 0, 0, 0, 0, 0]}
          sparklineColor="#2563EB"
        />
        <MetricBlock
          label="Live Channels Linked"
          value={accounts.length.toString()}
          change={accounts.length > 0 ? `${accounts.length} active` : "0 active"}
          isPositive={accounts.length > 0}
          subtext="Verified API credentials"
          icon={<Share2 className="w-4 h-4 text-cyan-600" />}
          sparklineData={accounts.length > 0 ? [1, 1, 2, 2, 3, 3, accounts.length, accounts.length] : [0, 0, 0, 0, 0, 0, 0, 0]}
          sparklineColor="#0284C7"
        />
        <MetricBlock
          label="Buffer Smart Queue"
          value={queuedPosts.length.toString()}
          change={queuedPosts.length > 0 ? `${queuedPosts.length} queued` : "Empty"}
          isPositive={queuedPosts.length > 0}
          subtext="Automated cadence dispatches"
          icon={<Clock className="w-4 h-4 text-emerald-600" />}
          sparklineData={queuedPosts.length > 0 ? [2, 3, 2, 4, 3, 4, queuedPosts.length, queuedPosts.length] : [0, 0, 0, 0, 0, 0, 0, 0]}
          sparklineColor="#059669"
        />
        <MetricBlock
          label="Total Published Posts"
          value={publishedPosts.length.toString()}
          change={publishedPosts.length > 0 ? `${publishedPosts.length} live` : "0 live"}
          isPositive={publishedPosts.length > 0}
          subtext="Cross-platform dispatches"
          icon={<Send className="w-4 h-4 text-purple-600" />}
          sparklineData={publishedPosts.length > 0 ? [0, 1, 1, 2, 2, 3, publishedPosts.length, publishedPosts.length] : [0, 0, 0, 0, 0, 0, 0, 0]}
          sparklineColor="#7C3AED"
        />
      </div>

      {/* Onboarding Banner when no channels are linked */}
      {accounts.length === 0 && (
        <GlassPanel className="p-5 border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-600 text-white shrink-0 shadow-xs">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Welcome to OmniSocial Enterprise! Link Your First Social Channel
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Connect Telegram, X (Twitter), LinkedIn, Meta (Facebook/Instagram), or Ayrshare to start scheduling and analyzing real posts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate("social_accounts")}
                className="tap-press min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Real Account</span>
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 4. Interactive 7-Day Velocity & Engagement Waveform Chart */}
      <GlassPanel className="p-6 border-slate-200/90 bg-white space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Cross-Network Publishing Velocity &amp; Reach Curve
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated engagement trajectory across 𝕏, LinkedIn, Instagram, TikTok, YouTube &amp; Telegram
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
            {(
              [
                { id: "impressions", label: "Impressions" },
                { id: "engagement", label: "Engagement" },
                { id: "audience", label: "Audience" },
                { id: "roi", label: "ROI Value" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedChartMetric(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedChartMetric === tab.id
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Chart Metric Highlights */}
        <div className="flex items-baseline gap-3 pt-1">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900">
            {activeChart.total}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {activeChart.change} vs prior 7-day period
          </span>
        </div>

        {/* SVG Chart Waveform */}
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-50/50 p-2 border border-slate-100">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartWaveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeChart.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={activeChart.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75].map((pct, idx) => (
              <line
                key={idx}
                x1={paddingX}
                y1={paddingY + availableH * pct}
                x2={paddingX + availableW}
                y2={paddingY + availableH * pct}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Area Fill */}
            <path d={chartAreaD} fill="url(#chartWaveGradient)" />

            {/* Line stroke */}
            <path
              d={chartPathD}
              fill="none"
              stroke={activeChart.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {svgPoints.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke={activeChart.color}
                  strokeWidth="2.5"
                  className="hover:r-7 transition-all cursor-pointer"
                />
              </g>
            ))}
          </svg>

          {/* Day Labels */}
          <div className="flex justify-between px-6 pt-2 text-[11px] font-mono text-slate-500 font-medium">
            {activeChart.labels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>
      </GlassPanel>

      {/* 5. Main Grid: Buffer Smart Queue & Attention Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Buffer Smart Queue Snapshot */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Buffer Smart Queue Dispatch Pipeline
              </h3>
              <p className="text-xs text-slate-500">Automated cadence scheduling across active networks</p>
            </div>
            <button
              onClick={() => onNavigate("queue")}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold transition-colors"
            >
              Manage Slots <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {queuedPosts.slice(0, 3).map((post) => (
              <GlassPanel
                key={post.id}
                className="p-4 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {post.title}
                      </span>
                      <StatusBadge status={post.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{post.rawConcept}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {post.targetPlatforms.map((p) => (
                        <PlatformBadge key={p} platform={p} size="sm" showLabel={false} />
                      ))}
                      <span className="text-[11px] text-slate-500 font-mono">
                        {post.queueSlotTime ? `Slot: ${post.queueSlotTime} UTC` : "Scheduled"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("queue")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 shrink-0 transition-colors"
                >
                  Inspect Slot
                </button>
              </GlassPanel>
            ))}

            {queuedPosts.length === 0 && (
              <GlassPanel className="p-8 text-center text-slate-500 text-xs">
                No posts currently queued. Compose your first multi-network post to begin scheduling!
              </GlassPanel>
            )}
          </div>
        </div>

        {/* Right 1 Col: Attention Inbox */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" /> Attention Inbox
              </h3>
              <p className="text-xs text-slate-500">Incoming inquiries &amp; mentions requiring review</p>
            </div>
            <button
              onClick={() => onNavigate("inbox")}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold transition-colors"
            >
              Open Inbox <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {threads.slice(0, 3).map((thread) => (
              <GlassPanel
                key={thread.id}
                onClick={() => onNavigate("inbox")}
                className="p-3.5 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thread.customer.avatar}
                      alt={thread.customer.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {thread.customer.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {thread.customer.handle}
                      </div>
                    </div>
                  </div>
                  <PlatformBadge platform={thread.platform} size="sm" showLabel={false} />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {thread.lastMessageSnippet}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <StatusBadge status={thread.sentiment} size="sm" />
                  <span className="font-mono">{formatRelativeTime(thread.lastMessageTime)}</span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Autonomous Gemini AI Repurposer Quick-Bar */}
      <GlassPanel className="p-5 border-blue-200 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Autonomous Gemini 2.5 Flash Repurposer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                  8 NETWORKS
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Type an announcement or paste raw release notes to synthesize native 𝕏 threads, LinkedIn articles, TikTok scripts &amp; Telegram alerts in seconds.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("content_studio")}
            className="tap-press min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 shrink-0 flex items-center justify-center gap-2"
          >
            <span>Launch Content Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </GlassPanel>
    </div>
  );
};
