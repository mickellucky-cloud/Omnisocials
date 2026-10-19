"use client";

import React, { useState } from "react";
import { Workspace, WorkspaceId } from "@/types";
import { initialWorkspaces } from "@/lib/data/workspaces";
import { cn } from "@/lib/utils";
import {
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
  ChevronDown,
  Check,
  Plus,
  Link as LinkIcon,
} from "lucide-react";

export type NavViewId =
  | "command_center"
  | "social_accounts"
  | "content_studio"
  | "queue"
  | "calendar"
  | "approvals"
  | "inbox"
  | "listening"
  | "analytics"
  | "media_vault"
  | "brand_brain";

interface NavItem {
  id: NavViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeCount?: number;
  badgeColor?: string;
  count?: number;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  currentWorkspace: Workspace;
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenConnectModal?: () => void;
  unreadInboxCount?: number;
  pendingApprovalsCount?: number;
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentWorkspace,
  onSelectWorkspace,
  onOpenConnectModal,
  unreadInboxCount = 1,
  pendingApprovalsCount = 1,
  className,
  onCloseMobile,
}) => {
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: "Core Channels & Hub",
      items: [
        { id: "command_center", label: "Command Center", icon: LayoutDashboard },
        {
          id: "social_accounts",
          label: "Linked Social Accounts",
          icon: Share2,
          count: currentWorkspace.connectedCount,
          badge: "Manage",
          highlight: true,
        },
      ],
    },
    {
      title: "Publishing & Creation",
      items: [
        { id: "content_studio", label: "Content Studio", icon: PenTool, badge: "✦ AI" },
        { id: "queue", label: "Smart Buffer Queue", icon: Clock },
        { id: "calendar", label: "Content Calendar", icon: CalendarDays },
        {
          id: "approvals",
          label: "Post Approvals",
          icon: ShieldCheck,
          badgeCount: pendingApprovalsCount,
        },
      ],
    },
    {
      title: "Engagement & Intelligence",
      items: [
        {
          id: "inbox",
          label: "Smart Inbox",
          icon: Inbox,
          badgeCount: unreadInboxCount,
          badgeColor: "bg-blue-600 text-white",
        },
        { id: "listening", label: "Social Listening", icon: Radio, badge: "Radar" },
        { id: "analytics", label: "Analytics & Heatmap", icon: BarChart3 },
      ],
    },
    {
      title: "Assets & Governance",
      items: [
        { id: "media_vault", label: "Media Vault", icon: FolderGit2 },
        { id: "brand_brain", label: "Brand Brain & Guidelines", icon: BrainCircuit },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 border-r border-slate-200 bg-white/95 backdrop-blur-xl flex flex-col justify-between shrink-0 select-none z-30 transition-all",
        className
      )}
    >
      <div>
        {/* Brand Header & Multi-Workspace Switcher */}
        <div className="p-4 border-b border-slate-200 relative">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-sm">
              Ω
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                OmniSocial <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono font-semibold">SAAS</span>
              </span>
              <p className="text-[10px] text-slate-500">Social Media Management Suite</p>
            </div>
          </div>

          {/* Workspace Switcher Trigger */}
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            aria-expanded={isWorkspaceDropdownOpen}
            aria-haspopup="listbox"
            aria-label="Switch managed brand workspace"
            className="tap-press w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 text-left shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentWorkspace.avatarUrl}
                alt={currentWorkspace.name}
                className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">{currentWorkspace.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{currentWorkspace.category.replace("_", " ")}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Workspace Switcher Dropdown */}
          {isWorkspaceDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsWorkspaceDropdownOpen(false)}
              />
              <div
                role="listbox"
                aria-label="Brand Workspaces"
                className="absolute top-[108px] left-3 right-3 z-50 bg-white rounded-xl p-1.5 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Managed Brand / Client
                </div>
                {initialWorkspaces.map((ws) => (
                  <button
                    key={ws.id}
                    role="option"
                    aria-selected={ws.id === currentWorkspace.id}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className={cn(
                      "tap-press w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors",
                      ws.id === currentWorkspace.id
                        ? "bg-blue-600 text-white font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ws.avatarUrl}
                        alt={ws.name}
                        className="w-5 h-5 rounded object-cover"
                      />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {ws.id === currentWorkspace.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Prominent Quick Link Account Action */}
          <button
            onClick={() => {
              if (onOpenConnectModal) onOpenConnectModal();
              else onSelectView("social_accounts");
            }}
            aria-label="Link a new social media account"
            className="tap-press w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Social Account</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-270px)]">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => {
                        onSelectView(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={cn(
                        "tap-press w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isActive && (
                          <span className="w-1 h-3.5 rounded-full bg-blue-600 -ml-1 shrink-0 animate-in fade-in duration-150" />
                        )}
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors shrink-0",
                            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-md font-mono font-medium",
                              item.highlight
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.badgeCount !== undefined && item.badgeCount > 0 && (
                          <span
                            suppressHydrationWarning
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                              item.badgeColor || "bg-amber-100 text-amber-800 border border-amber-200"
                            )}
                          >
                            {item.badgeCount}
                          </span>
                        )}
                        {item.count !== undefined && (
                          <span className="text-[10px] text-slate-400 font-mono font-medium">
                            {item.count} ch
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile & Live Status */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentWorkspace.team[0]?.avatar || "https://avatar.vercel.sh/user"}
                alt="User"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {currentWorkspace.team[0]?.name || "Admin"}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {currentWorkspace.team[0]?.role || "Admin"}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
