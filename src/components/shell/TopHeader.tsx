"use client";

import React, { useState, useEffect } from "react";
import { Workspace } from "@/types";
import { NavViewId } from "./Sidebar";
import { Search, Plus, Bell, Command, Menu, Sparkles, Clock, Share2 } from "lucide-react";

interface TopHeaderProps {
  currentView: NavViewId;
  currentWorkspace: Workspace;
  onOpenCommandPalette: () => void;
  onQuickCreate: () => void;
  onOpenConnectAccounts: () => void;
  onToggleMobileMenu: () => void;
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
}) => {
  const [currentTime, setCurrentTime] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">{meta.title}</h1>
            <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {isNotificationOpen && (
            <div className="glass-dropdown absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-xl z-50 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>Workspace Activity</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                    3 New
                  </span>
                </div>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-64 overflow-y-auto">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">𝕏 Post Dispatched</span>
                    <span className="text-[10px] text-slate-400 font-mono">2m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    "Next-gen cloud architecture..." successfully published with 0 latency errors.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">OAuth Handshake Verified</span>
                    <span className="text-[10px] text-slate-400 font-mono">14m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Token refreshed for LinkedIn Enterprise with w_organization_social scope.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Viral Velocity Alert</span>
                    <span className="text-[10px] text-slate-400 font-mono">1h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Instagram Reel engagement rate reached 5.4% (2.5x above workspace baseline).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Link Account Button */}
        <button
          onClick={onOpenConnectAccounts}
          aria-label="Open Linked Social Accounts Hub"
          className="tap-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Link Account</span>
        </button>

        {/* Quick New Post CTA */}
        <button
          onClick={onQuickCreate}
          aria-label="Create new adaptive post in Content Studio"
          className="tap-press flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Post</span>
        </button>
      </div>
    </header>
  );
};
