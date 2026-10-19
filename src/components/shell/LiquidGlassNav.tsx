"use client";

import React from "react";
import { NavViewId } from "./Sidebar";
import { LayoutDashboard, PenTool, Clock, Inbox, BarChart3, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiquidGlassNavProps {
  currentView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  unreadInboxCount?: number;
}

export const LiquidGlassNav: React.FC<LiquidGlassNavProps> = ({
  currentView,
  onSelectView,
  unreadInboxCount = 0,
}) => {
  const tabs = [
    { id: "command_center" as NavViewId, label: "Home", icon: LayoutDashboard },
    { id: "social_accounts" as NavViewId, label: "Channels", icon: Share2 },
    { id: "content_studio" as NavViewId, label: "Create", icon: PenTool },
    { id: "queue" as NavViewId, label: "Queue", icon: Clock },
    { id: "inbox" as NavViewId, label: "Inbox", icon: Inbox, badge: unreadInboxCount },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-around py-1 px-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 border-t-white shadow-xl shadow-slate-900/10"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectView(tab.id)}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "tap-press min-h-[48px] min-w-[48px] relative flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150",
              isActive ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <div className="relative">
              <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.8]")} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            {isActive && (
              <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
