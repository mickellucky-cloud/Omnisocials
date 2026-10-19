"use client";

import React, { useState } from "react";
import { Workspace, PlatformId, PostItem } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { StatusBadge } from "../ui/StatusBadge";
import { PlatformBadge } from "../ui/PlatformBadge";
import { isQueuePaused, setQueuePaused, reorderQueue, updatePostStatus } from "@/lib/data/storage";
import {
  Clock,
  Pause,
  Play,
  ArrowUp,
  ArrowDown,
  Trash2,
  Calendar,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartQueueViewProps {
  currentWorkspace: Workspace;
  posts: PostItem[];
  onRefresh: () => void;
  onNavigateToStudio: () => void;
}

export const SmartQueueView: React.FC<SmartQueueViewProps> = ({
  currentWorkspace,
  posts,
  onRefresh,
  onNavigateToStudio,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [paused, setPaused] = useState<boolean>(() => isQueuePaused(currentWorkspace.id));
  const [feedback, setFeedback] = useState<string | null>(null);

  // Active queue posts
  const queuedPosts = posts.filter(
    (p) =>
      p.status === "queued" &&
      (selectedPlatform === "all" || p.targetPlatforms.includes(selectedPlatform as PlatformId))
  );

  const handleTogglePause = () => {
    const nextState = !paused;
    setPaused(nextState);
    setQueuePaused(currentWorkspace.id, nextState);
    setFeedback(
      nextState
        ? "⏸ Emergency Pause activated! Automated dispatches frozen across all channels."
        : "▶ Queue resumed! Automated scheduling is active."
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= queuedPosts.length) return;

    const copy = [...queuedPosts];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    reorderQueue(
      currentWorkspace.id,
      copy.map((p) => p.id)
    );
    onRefresh();
  };

  const handleShareNext = (postId: string) => {
    const currentList = [...queuedPosts];
    const targetIndex = currentList.findIndex((p) => p.id === postId);
    if (targetIndex > 0) {
      const [item] = currentList.splice(targetIndex, 1);
      currentList.unshift(item);
      reorderQueue(
        currentWorkspace.id,
        currentList.map((p) => p.id)
      );
      setFeedback("⚡ Post moved to the very top of the queue for immediate next release!");
      onRefresh();
    }
  };

  const handleDelete = (postId: string) => {
    updatePostStatus(postId, "draft");
    setFeedback("Post moved from queue back to drafts.");
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Header & Emergency Pause Bar */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Buffer-Style Smart Queue</h2>
              {paused ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  PAUSED
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AUTOMATION ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Posts automatically dispatch at your predetermined weekly time slots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Emergency Kill Switch */}
          <button
            onClick={handleTogglePause}
            aria-pressed={paused}
            aria-label={paused ? "Resume automated queue dispatches" : "Emergency pause: freeze all automated dispatches"}
            className={cn(
              "tap-press min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-offset-2",
              paused
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 focus-visible:ring-emerald-500"
                : "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 focus-visible:ring-rose-400"
            )}
          >
            {paused ? <Play className="w-4 h-4 shrink-0" /> : <Pause className="w-4 h-4 shrink-0" />}
            <span>{paused ? "Resume All Queues" : "Emergency Pause Kill Switch"}</span>
          </button>

          <button
            onClick={onNavigateToStudio}
            aria-label="Create and schedule a new post in the queue"
            className="tap-press min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add to Queue</span>
          </button>
        </div>
      </GlassPanel>

      {feedback && (
        <div 
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-2xs"
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            aria-label="Dismiss notification"
            className="tap-press min-h-[32px] px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-medium rounded-lg hover:bg-blue-100/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Posting Schedule Slot Overview */}
      <GlassPanel className="p-5 border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" /> Active Weekly Posting Schedules
            </h3>
            <p className="text-xs text-slate-500">Pre-configured time slots for automatic release</p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Timezone: UTC</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {Object.entries(currentWorkspace.postingSchedules).slice(0, 4).map(([platform, slots]) => (
            <div key={platform} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <PlatformBadge platform={platform as PlatformId} size="sm" />
                <span className="text-[10px] text-slate-400 font-mono">{slots.length} slots/day</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {slots.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-mono font-medium shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Queue List with Reordering */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Upcoming Releases</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
              {queuedPosts.length} queued
            </span>
          </div>

          {/* Filter tabs */}
          <div 
            role="tablist"
            aria-label="Queue platform network filter"
            className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs"
          >
            {[
              { id: "all", label: "All Networks" },
              { id: "x", label: "𝕏" },
              { id: "linkedin", label: "in" },
              { id: "instagram", label: "IG" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`queue-tab-${tab.id}`}
                aria-selected={selectedPlatform === tab.id}
                aria-controls="queue-list"
                onClick={() => setSelectedPlatform(tab.id)}
                className={cn(
                  "tap-press min-h-[36px] px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500",
                  selectedPlatform === tab.id
                    ? "bg-white text-blue-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queued Cards */}
        <div id="queue-list" role="region" aria-label="Queued posts list" className="space-y-3">
          {queuedPosts.map((post, idx) => (
            <GlassPanel
              key={post.id}
              className="p-4 border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              {/* Order index & details */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-700 shrink-0">
                  #{idx + 1}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900 truncate">{post.title}</span>
                    <StatusBadge status={post.status} size="sm" />
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      Slot: {post.queueSlotTime || "Next Available"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.rawConcept}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {post.targetPlatforms.map((p) => (
                      <PlatformBadge key={p} platform={p} size="sm" showLabel={false} />
                    ))}
                    <span className="text-[11px] text-slate-400">
                      Created by {post.author.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Reordering Controls */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 w-full md:w-auto justify-end">
                {idx > 0 && (
                  <button
                    onClick={() => handleShareNext(post.id)}
                    aria-label={`Move post "${post.title}" to top of queue`}
                    className="tap-press min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                    title="Move to top for immediate next release"
                  >
                    Share Next
                  </button>
                )}

                <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    aria-label={`Move queue item ${idx + 1} up`}
                    className="tap-press min-h-[32px] min-w-[32px] flex items-center justify-center p-1.5 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === queuedPosts.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    aria-label={`Move queue item ${idx + 1} down`}
                    className="tap-press min-h-[32px] min-w-[32px] flex items-center justify-center p-1.5 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(post.id)}
                  aria-label={`Remove post "${post.title}" from queue`}
                  className="tap-press min-h-[36px] min-w-[36px] flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassPanel>
          ))}

          {queuedPosts.length === 0 && (
            <GlassPanel className="p-10 text-center text-slate-500 text-xs space-y-2 border-slate-200 bg-white">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-semibold text-slate-800 text-sm">Your Buffer Queue is empty</div>
              <p>Posts added to the queue will automatically publish according to your schedule.</p>
              <button
                onClick={onNavigateToStudio}
                aria-label="Compose new queued post"
                className="tap-press min-h-[44px] mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm shadow-blue-500/20 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Plus className="w-4 h-4" /> Compose New Queued Post
              </button>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
};
