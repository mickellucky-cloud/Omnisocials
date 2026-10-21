"use client";

import React, { useState } from "react";
import { Workspace, PostItem } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { PlatformBadge } from "../ui/PlatformBadge";
import { StatusBadge } from "../ui/StatusBadge";
import {
  CalendarDays,
  Plus,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  currentWorkspace: Workspace;
  posts: PostItem[];
  onNavigateToStudio: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentWorkspace,
  posts,
  onNavigateToStudio,
}) => {
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Filter posts for this workspace
  const scheduledPosts = posts.filter(
    (p) => p.status === "queued" || p.status === "scheduled" || p.status === "published" || p.status === "pending_approval"
  );

  // Match posts to day of current month
  const getPostsForDay = (day: number) => {
    return scheduledPosts.filter((post) => {
      const dateStr = post.scheduledFor || post.publishedAt || post.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  };

  // Generate current week dates
  const weekDays = React.useMemo(() => {
    const days = [];
    const currentDayOfWeek = now.getDay(); // 0 is Sun
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: d.toDateString() === now.toDateString(),
      });
    }
    return days;
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Header & Controls */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentMonthName}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                {scheduledPosts.length} Scheduled
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cross-network publishing schedule for {currentWorkspace.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div 
            role="tablist"
            aria-label="Calendar view format"
            className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1"
          >
            {(["month", "week", "list"] as const).map((mode) => (
              <button
                key={mode}
                role="tab"
                id={`cal-tab-${mode}`}
                aria-selected={viewMode === mode}
                aria-controls={`cal-view-${mode}`}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "tap-press min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize focus-visible:ring-2 focus-visible:ring-blue-500",
                  viewMode === mode
                    ? "bg-white text-blue-700 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onNavigateToStudio}
            aria-label="Schedule new cross-network post"
            className="tap-press min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Schedule Post</span>
          </button>
        </div>
      </GlassPanel>

      {/* Month Grid View */}
      {viewMode === "month" && (
        <div id="cal-view-month" role="tabpanel" aria-labelledby="cal-tab-month" className="bg-white rounded-2xl p-3 sm:p-5 overflow-hidden border border-slate-200 shadow-xs">
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[560px]">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-500 py-2 border-b border-slate-100 font-mono">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Calendar Day Blocks */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {daysInMonth.map((day) => {
                  const dayPosts = getPostsForDay(day);
                  const isToday = day === currentDay;

                  return (
                    <div
                      key={day}
                      role="button"
                      tabIndex={0}
                      aria-label={`View or schedule posts for ${day} ${currentMonthName}. ${dayPosts.length} post${dayPosts.length === 1 ? '' : 's'} scheduled.`}
                      onClick={onNavigateToStudio}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onNavigateToStudio();
                        }
                      }}
                      className={cn(
                        "tap-press min-h-[75px] sm:min-h-[105px] p-1.5 sm:p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer flex flex-col justify-between group focus-visible:ring-2 focus-visible:ring-blue-500",
                        isToday ? "ring-2 ring-blue-500 bg-blue-50/80 border-blue-400" : ""
                      )}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] font-mono",
                            isToday ? "bg-blue-600 text-white" : "text-slate-600 group-hover:text-slate-900"
                          )}
                        >
                          {day}
                        </span>
                        {isToday && (
                          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-blue-700 font-bold">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 my-1">
                        {dayPosts.slice(0, 2).map((post) => (
                          <div
                            key={post.id}
                            className="p-1 rounded-md bg-white border border-slate-200 text-[9px] sm:text-[10px] text-slate-800 truncate flex items-center gap-1 shadow-2xs font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            <span className="truncate">{post.title}</span>
                          </div>
                        ))}
                        {dayPosts.length > 2 && (
                          <span className="text-[9px] text-blue-600 font-semibold block text-center">
                            +{dayPosts.length - 2} more
                          </span>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] sm:text-[10px] text-blue-600 font-semibold flex items-center gap-0.5">
                        <Plus className="w-2.5 h-2.5" /> <span className="hidden sm:inline">Schedule</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Agenda View */}
      {viewMode === "list" && (
        <div id="cal-view-list" role="tabpanel" aria-labelledby="cal-tab-list" className="space-y-3">
          {scheduledPosts.map((post) => (
            <GlassPanel key={post.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900 truncate">{post.title}</span>
                    <StatusBadge status={post.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{post.rawConcept}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {post.targetPlatforms.map((p) => (
                        <PlatformBadge key={p} platform={p} size="sm" showLabel={false} />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Author: {post.author.name}
                    </span>
                    {post.scheduledFor && (
                      <span className="text-[11px] text-blue-600 font-mono">
                        · Scheduled: {new Date(post.scheduledFor).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToStudio}
                aria-label={`Inspect post "${post.title}" in content studio`}
                className="tap-press min-h-[38px] px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 self-end sm:self-auto"
              >
                Inspect
              </button>
            </GlassPanel>
          ))}

          {scheduledPosts.length === 0 && (
            <GlassPanel className="p-12 text-center text-slate-500 text-xs border-slate-200 bg-white space-y-3">
              <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-sm text-slate-800">No Posts Scheduled for Release</div>
              <p className="max-w-sm mx-auto text-slate-500">
                Create new cross-network content in the Content Studio to populate your publishing timeline.
              </p>
              <button
                onClick={onNavigateToStudio}
                className="tap-press min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> Compose & Schedule Post
              </button>
            </GlassPanel>
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div id="cal-view-week" role="tabpanel" aria-labelledby="cal-tab-week" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs overflow-x-auto">
          <div className="min-w-[620px] grid grid-cols-7 gap-3 text-center">
            {weekDays.map((wDay, idx) => {
              const dayPosts = getPostsForDay(wDay.dayNum);

              return (
                <div key={idx} className="space-y-2">
                  <div className={cn(
                    "text-xs font-bold py-1 border-b font-mono rounded-lg",
                    wDay.isToday ? "bg-blue-50 text-blue-700 border-blue-200" : "text-slate-700 border-slate-100"
                  )}>
                    {wDay.dayName} {wDay.dayNum}
                  </div>
                  <div className="min-h-[220px] rounded-xl bg-slate-50 border border-slate-200 p-2 space-y-2 text-left">
                    {dayPosts.map((post) => (
                      <div 
                        key={post.id}
                        role="button"
                        tabIndex={0}
                        onClick={onNavigateToStudio}
                        onKeyDown={(e) => { if (e.key === 'Enter') onNavigateToStudio(); }}
                        aria-label={`Inspect ${post.title}`}
                        className="tap-press p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-900 shadow-2xs cursor-pointer hover:border-blue-400 transition-all focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <div className="text-[10px] text-blue-700 font-mono font-semibold tabular-nums">
                          {post.queueSlotTime ? `${post.queueSlotTime} UTC` : "Scheduled"}
                        </div>
                        <div className="font-semibold truncate">{post.title}</div>
                      </div>
                    ))}
                    {dayPosts.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[10px] text-slate-400 italic pt-8">
                        No releases
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
