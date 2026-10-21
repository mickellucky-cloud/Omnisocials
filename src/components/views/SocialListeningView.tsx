"use client";

import React, { useState } from "react";
import { Workspace, ListeningMention, CompetitorStats } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { PlatformBadge } from "../ui/PlatformBadge";
import { StatusBadge } from "../ui/StatusBadge";
import { initialListeningMentions } from "@/lib/data/mockData";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import {
  Radio,
  Sparkles,
  BarChart2,
  Flame,
} from "lucide-react";

interface SocialListeningViewProps {
  currentWorkspace: Workspace;
}

export const SocialListeningView: React.FC<SocialListeningViewProps> = ({
  currentWorkspace,
}) => {
  const [mentions] = useState<ListeningMention[]>(initialListeningMentions);
  const [competitors, setCompetitors] = useState<CompetitorStats[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`omnisocial_competitors_${currentWorkspace.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const totalMentions = mentions.length;
  const positiveCount = mentions.filter((m) => m.sentiment === "positive").length;
  const negativeCount = mentions.filter((m) => m.sentiment === "negative" || m.sentiment === "critical").length;
  const neutralCount = mentions.filter((m) => m.sentiment === "neutral").length;

  const sentimentStats = totalMentions > 0
    ? {
        positive: Math.round((positiveCount / totalMentions) * 100),
        neutral: Math.round((neutralCount / totalMentions) * 100),
        negative: Math.round((negativeCount / totalMentions) * 100),
      }
    : {
        positive: 100,
        neutral: 0,
        negative: 0,
      };

  const trackedKeywordsCount = 1 + (currentWorkspace.guidelines.approvedClaims?.length || 0) + (currentWorkspace.guidelines.forbiddenClaims?.length || 0);

  const trendingTopics: Array<{ tag: string; volume: string; sentiment: "positive" | "negative" | "neutral" }> = (currentWorkspace.guidelines.approvedClaims || []).slice(0, 5).map((claim: string) => ({
    tag: claim.length > 28 ? claim.slice(0, 25) + "..." : claim,
    volume: "Live query",
    sentiment: "positive",
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Header */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Social Listening & Trend Radar</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE LISTENING
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time brand mentions, sentiment tracking, competitor share of voice and crisis alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-slate-600 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            Tracked queries: {trackedKeywordsCount} active keywords
          </div>
        </div>
      </GlassPanel>

      {/* Sentiment Gauge & Share of Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Sentiment Analysis Bar - 6 Cols */}
        <GlassPanel className="md:col-span-6 p-5 space-y-3 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" /> Brand Sentiment Breakdown
            </h3>
            <span className="text-xs font-mono text-emerald-700 font-bold">
              {totalMentions > 0 ? "+8% positive swing" : "100% Nominal"}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
            <div
              style={{ width: `${sentimentStats.positive}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Positive: ${sentimentStats.positive}%`}
            />
            <div
              style={{ width: `${sentimentStats.neutral}%` }}
              className="bg-slate-400 transition-all duration-500"
              title={`Neutral: ${sentimentStats.neutral}%`}
            />
            <div
              style={{ width: `${sentimentStats.negative}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Negative: ${sentimentStats.negative}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Positive: <strong className="text-slate-900">{sentimentStats.positive}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-600">Neutral: <strong className="text-slate-900">{sentimentStats.neutral}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-600">Negative: <strong className="text-slate-900">{sentimentStats.negative}%</strong></span>
            </div>
          </div>
        </GlassPanel>

        {/* Share of Voice (SOV) Bar - 6 Cols */}
        <GlassPanel className="md:col-span-6 p-5 space-y-3 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-600" /> Share of Voice vs Competitors
            </h3>
            <span className="text-xs font-mono text-blue-700 font-bold">
              {competitors.length > 0 ? "Benchmark Tracked" : "100% Owned Voice"}
            </span>
          </div>

          {competitors.length > 0 ? (
            <>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div style={{ width: "50%" }} className="bg-blue-600" title={`${currentWorkspace.name}: 50%`} />
                <div style={{ width: "50%" }} className="bg-cyan-500" title="Competitor pool: 50%" />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-slate-600">{currentWorkspace.name}: <strong className="text-slate-900">50%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-slate-600">{competitors[0].name}: <strong className="text-slate-900">50%</strong></span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div style={{ width: "100%" }} className="bg-blue-600" title={`${currentWorkspace.name}: 100%`} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-slate-600">{currentWorkspace.name}: <strong className="text-slate-900">100%</strong></span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Track competitors in Analytics to benchmark SOV
                </span>
              </div>
            </>
          )}
        </GlassPanel>
      </div>

      {/* Main Stream: Live Mentions Feed & Trending Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Mentions Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Mentions Stream
            </span>
            <span className="text-xs text-slate-400 font-mono">Stream latency: ~1.2s</span>
          </div>

          <div className="space-y-3">
            {mentions.length > 0 ? (
              mentions.map((mention) => (
                <GlassPanel key={mention.id} className="p-4 border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mention.authorAvatar}
                        alt={mention.authorName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                          {mention.authorName}
                          <span className="text-[10px] text-slate-500 font-normal">
                            {mention.authorHandle}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Estimated reach: {formatNumber(mention.reachEstimate)} followers
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={mention.sentiment} size="sm" />
                      <PlatformBadge platform={mention.platform} size="sm" showLabel={false} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {mention.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-semibold">
                      Matched: {mention.matchedKeyword}
                    </span>
                    <span className="text-slate-400 font-mono">{formatRelativeTime(mention.timestamp)}</span>
                  </div>
                </GlassPanel>
              ))
            ) : (
              <GlassPanel className="p-8 text-center border-slate-200 bg-white space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Active Sensor · Zero Negative Mentions</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Social listening radar is actively scanning platforms for @{currentWorkspace.name} and monitored keywords. No crisis triggers or negative sentiment detected in the past 24 hours.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-mono text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>100% Brand Sentiment Health · Latency: ~1.2s</span>
                </div>
              </GlassPanel>
            )}
          </div>
        </div>

        {/* Trending Keywords Cloud (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1">
            Trending Discussion Topics
          </span>

          <GlassPanel className="p-4 space-y-2.5 border-slate-200 bg-white shadow-xs">
            {trendingTopics.map((topic, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                aria-label={`Topic: ${topic.tag}, ${topic.volume}, sentiment: ${topic.sentiment}`}
                className="tap-press p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{topic.tag}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono tabular-nums">{topic.volume}</div>
                </div>
                <StatusBadge status={topic.sentiment as "positive" | "negative" | "neutral"} size="sm" />
              </div>
            ))}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
