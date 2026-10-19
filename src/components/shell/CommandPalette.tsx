"use client";

import React, { useState, useEffect } from "react";
import { Workspace } from "@/types";
import { initialWorkspaces } from "@/lib/data/workspaces";
import { NavViewId } from "./Sidebar";
import {
  Search,
  LayoutDashboard,
  PenTool,
  Clock,
  CalendarDays,
  ShieldCheck,
  Inbox,
  Radio,
  BarChart3,
  Share2,
  FolderGit2,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: NavViewId) => void;
  onSelectWorkspace: (ws: Workspace) => void;
  currentWorkspace: Workspace;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onSelectWorkspace,
  currentWorkspace,
}) => {
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const views = [
    { id: "command_center" as NavViewId, label: "Command Center Dashboard", icon: LayoutDashboard, category: "Navigation" },
    { id: "social_accounts" as NavViewId, label: "Linked Social Accounts & Connection Hub", icon: Share2, category: "Channels" },
    { id: "content_studio" as NavViewId, label: "Create Adaptive Post (Content Studio)", icon: PenTool, category: "Actions" },
    { id: "queue" as NavViewId, label: "Smart Buffer Queue", icon: Clock, category: "Navigation" },
    { id: "approvals" as NavViewId, label: "Post Approvals Pipeline", icon: ShieldCheck, category: "Navigation" },
    { id: "inbox" as NavViewId, label: "Smart Inbox & Customer CRM", icon: Inbox, category: "Navigation" },
    { id: "listening" as NavViewId, label: "Social Listening & Crisis Radar", icon: Radio, category: "Navigation" },
    { id: "analytics" as NavViewId, label: "Analytics & Best-Time Heatmap", icon: BarChart3, category: "Navigation" },
    { id: "calendar" as NavViewId, label: "Content Calendar Timetable", icon: CalendarDays, category: "Navigation" },
    { id: "media_vault" as NavViewId, label: "Cloud Media Vault", icon: FolderGit2, category: "Navigation" },
    { id: "brand_brain" as NavViewId, label: "Workspace Brand Brain & Compliance", icon: BrainCircuit, category: "Navigation" },
  ];

  const filteredViews = views.filter((v) =>
    v.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredWorkspaces = initialWorkspaces.filter((w) =>
    w.name.toLowerCase().includes(query.toLowerCase()) ||
    w.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a command, social channel, or workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search commands, views, and workspaces"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-200 text-slate-600 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Workspaces Section */}
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Switch Workspace / Brand
            </div>
            <div className="space-y-1">
              {filteredWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    onClose();
                  }}
                  className={`tap-press w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                    ws.id === currentWorkspace.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ws.avatarUrl}
                      alt={ws.name}
                      className="w-6 h-6 rounded-md object-cover border border-slate-200"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-slate-900">{ws.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {ws.category.replace("_", " ")} · {ws.connectedCount} channels
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Views & Commands Section */}
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Views & Tools
            </div>
            <div className="space-y-1">
              {filteredViews.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      onClose();
                    }}
                    className="tap-press w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-800">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-medium text-slate-600">OmniSocial SaaS Suite</span>
        </div>
      </div>
    </div>
  );
};
