"use client";

import React, { useState, useEffect } from "react";
import { Workspace } from "@/types";
import { NavViewId } from "./Sidebar";
import { Search, Plus, Bell, Command, Menu, Sparkles, Clock, Share2, Lock } from "lucide-react";
import { getStoredAccounts, getStoredPosts } from "@/lib/data/storage";
import { formatRelativeTime } from "@/lib/utils";

interface TopHeaderProps {
  currentView: NavViewId;
  currentWorkspace: Workspace;
  onOpenCommandPalette: () => void;
  onQuickCreate: () => void;
  onOpenConnectAccounts: () => void;
  onToggleMobileMenu: () => void;
  onLockDashboard?: () => void;
}

const viewTitles: Record<NavViewId, { title: string; subtitle: string }> = {
  command_center: {
    title: "Executive Command Center",
    subtitle: "Real-time ecosystem metrics & cross-channel health",
  },
  social_accounts: {
    title: "Social Media Accounts & Connection Hub",
    subtitle: "Connect and manage your X, LinkedIn, Instagram, Facebook, TikTok, YouTube & Telegram accounts",
  },
  content_studio: {
    title: "Content Studio",
    subtitle: "Adaptive multi-network composer with Gemini AI repurposing",
  },
  queue: {
    title: "Buffer Smart Queue",
    subtitle: "Automated posting schedules & slot management",
  },
  calendar: {
    title: "Publishing Calendar",
    subtitle: "Multi-view release timetable & cross-platform schedule",
  },
  approvals: {
    title: "Post Approvals & Governance",
    subtitle: "Multi-stage editorial review pipeline and audit history",
  },
  inbox: {
    title: "Unified Smart Inbox",
    subtitle: "3-pane engagement hub with collision detection & CRM",
  },
  listening: {
    title: "Social Listening & Trend Radar",
    subtitle: "Real-time sentiment tracking, SOV metrics & crisis monitor",
  },
  analytics: {
    title: "Executive Analytics & Heatmap",
    subtitle: "24x7 best-time-to-post matrix & competitor benchmarks",
  },
  media_vault: {
    title: "Cloud Media Vault",
    subtitle: "Multi-ratio visual assets, aspect ratio cropper & tags",
  },
  brand_brain: {
    title: "Workspace Brand Brain",
    subtitle: "Brand guidelines, approved claims & compliance guardrails",
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  currentWorkspace,
  onOpenCommandPalette,
  onQuickCreate,
  onOpenConnectAccounts,
  onToggleMobileMenu,
  onLockDashboard,
}) => {
  const [currentTime, setCurrentTime] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; subtitle: string; time: string }>>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const accounts = getStoredAccounts(currentWorkspace.id);
    const posts = getStoredPosts(currentWorkspace.id);

    const items: Array<{ id: string; title: string; subtitle: string; time: string }> = [];

    // Accounts notifications
    accounts.forEach((acc) => {
      items.push({
        id: `acc-${acc.id}`,
        title: `${acc.platform.toUpperCase()} Connected`,
        subtitle: `${acc.accountHandle.startsWith("@") ? acc.accountHandle : "@" + acc.accountHandle} verified and active on ${acc.platform}.`,
        time: acc.connectedAt ? formatRelativeTime(acc.connectedAt) : "Active",
      });
    });

    // Published posts notifications
    posts
      .filter((p) => p.status === "published")
      .forEach((p) => {
        items.push({
          id: `pub-${p.id}`,
          title: "Post Dispatched",
          subtitle: `"${p.title}" published to ${p.targetPlatforms.join(", ")}.`,
          time: p.publishedAt ? formatRelativeTime(p.publishedAt) : "Recently",
        });
      });

    // Queued posts
    posts
      .filter((p) => p.status === "queued")
      .slice(0, 3)
      .forEach((p) => {
        items.push({
          id: `queue-${p.id}`,
          title: "Post Queued",
          subtitle: `"${p.title}" scheduled in queue.`,
          time: p.queueSlotTime || "Upcoming",
        });
      });

    setNotifications(items.slice(0, 6));
  }, [currentWorkspace.id, isNotificationOpen]);

  const meta = viewTitles[currentView] || viewTitles.command_center;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-[140px] sm:max-w-none">
              {meta.title}
            </h1>
            <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              {currentWorkspace.name}
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-500">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* UTC Clock with Live Status Pulse */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-glow-pulse" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentTime || "00:00:00 UTC"}</span>
          </div>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          aria-label="Search and quick actions (Cmd+K)"
          className="tap-press flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-xs text-slate-600 hover:text-slate-900 shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search & Actions</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Notifications Center Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            aria-label="View recent workspace activity notifications"
            className="tap-press p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-2xs relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {isNotificationOpen && (
            <div className="glass-dropdown absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-xl z-50 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>Workspace Activity</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                      {notifications.length} New
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {n.subtitle}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 px-3 text-center space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                      <Bell className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">All systems quiet</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Real-time dispatch alerts and account sync notices will appear here as activity occurs.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        onOpenConnectAccounts();
                      }}
                      className="tap-press min-h-[32px] px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 inline-flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Link Social Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lock Dashboard Button */}
        {onLockDashboard && (
          <button
            onClick={onLockDashboard}
            aria-label="Lock Dashboard (PIN: 1234)"
            title="Lock Dashboard (PIN: 1234)"
            className="tap-press p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-2xs"
          >
            <Lock className="w-4 h-4 text-slate-500 hover:text-blue-600" />
          </button>
        )}

        {/* Link Account Button (Desktop only, mobile has it in bottom dock) */}
        <button
          onClick={onOpenConnectAccounts}
          aria-label="Open Linked Social Accounts Hub"
          className="hidden md:flex tap-press items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Link Account</span>
        </button>

        {/* Quick New Post CTA */}
        <button
          onClick={onQuickCreate}
          aria-label="Create new adaptive post in Content Studio"
          className="tap-press flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Post</span>
          <span className="sm:hidden">Post</span>
        </button>
      </div>
    </header>
  );
};
