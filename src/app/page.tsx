"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Workspace, PostItem, ConversationThread } from "@/types";
import { initialWorkspaces } from "@/lib/data/workspaces";
import { getStoredPosts, getStoredThreads } from "@/lib/data/storage";
import { CheckCircle2, Sparkles, X } from "lucide-react";

// Shell components
import { Sidebar, NavViewId } from "@/components/shell/Sidebar";
import { TopHeader } from "@/components/shell/TopHeader";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { LiquidGlassNav } from "@/components/shell/LiquidGlassNav";
import { LoginLockScreen } from "@/components/auth/LoginLockScreen";

// Feature Views
import { CommandCenterView } from "@/components/views/CommandCenterView";
import { ContentStudioView } from "@/components/views/ContentStudioView";
import { SmartQueueView } from "@/components/views/SmartQueueView";
import { CalendarView } from "@/components/views/CalendarView";
import { ApprovalsView } from "@/components/views/ApprovalsView";
import { UnifiedInboxView } from "@/components/views/UnifiedInboxView";
import { SocialListeningView } from "@/components/views/SocialListeningView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { SocialAccountsView } from "@/components/views/SocialAccountsView";
import { MediaVaultView } from "@/components/views/MediaVaultView";
import { BrandBrainView } from "@/components/views/BrandBrainView";

function HomeContent() {
  const searchParams = useSearchParams();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(initialWorkspaces[0]);
  const [currentView, setCurrentView] = useState<NavViewId>("command_center");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Celebratory OAuth Return Banner
  const [oauthSuccessNotice, setOauthSuccessNotice] = useState<{
    platform: string;
    handle: string;
  } | null>(null);

  // Hydrated data states
  const [posts, setPosts] = useState<PostItem[]>(() => getStoredPosts(initialWorkspaces[0].id));
  const [threads, setThreads] = useState<ConversationThread[]>(() =>
    getStoredThreads(initialWorkspaces[0].id)
  );

  const refreshData = useCallback(() => {
    setPosts(getStoredPosts(currentWorkspace.id));
    setThreads(getStoredThreads(currentWorkspace.id));
  }, [currentWorkspace.id]);

  useEffect(() => {
    refreshData();
  }, [currentWorkspace.id, refreshData]);

  // Detect OAuth return state from query params
  useEffect(() => {
    const connected = searchParams.get("connected");
    const status = searchParams.get("status");
    const handle = searchParams.get("handle");
    const tab = searchParams.get("tab");

    if (connected && status === "success") {
      setOauthSuccessNotice({
        platform: connected.toUpperCase(),
        handle: handle || "account",
      });

      if (tab === "social_accounts") {
        setCurrentView("social_accounts");
      }

      refreshData();

      // Clean URL params without reloading
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams, refreshData]);

  // Unread & Pending counts
  const unreadInboxCount = threads.filter((t) => t.isUnread).length;
  const pendingApprovalsCount = posts.filter((p) => p.status === "pending_approval").length;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600/20 selection:text-blue-900 overflow-hidden">
      {/* 4-Layer Depth: Atmosphere / Canvas Layer 0 (Subtle Light Gradients) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-[15%] left-1/4 w-[750px] h-[750px] rounded-full bg-blue-100/50 blur-[140px]" />
        <div className="absolute top-1/3 -right-[10%] w-[650px] h-[650px] rounded-full bg-indigo-100/40 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-1/3 w-[800px] h-[600px] rounded-full bg-sky-100/40 blur-[160px]" />
      </div>

      <div className="relative z-10 flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar
          className="hidden md:flex"
          currentView={currentView}
          onSelectView={setCurrentView}
          currentWorkspace={currentWorkspace}
          onSelectWorkspace={setCurrentWorkspace}
          onOpenConnectModal={() => setCurrentView("social_accounts")}
          unreadInboxCount={unreadInboxCount}
          pendingApprovalsCount={pendingApprovalsCount}
          onLockDashboard={() => setIsLocked(true)}
        />

        {/* Mobile Slide-in Drawer with Framer Motion */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="relative w-72 max-w-[80vw] bg-white border-r border-slate-200 h-full flex flex-col z-10 shadow-2xl"
              >
                <Sidebar
                  className="w-full h-full flex flex-col border-none"
                  currentView={currentView}
                  onSelectView={(v) => {
                    setCurrentView(v);
                    setIsMobileMenuOpen(false);
                  }}
                  currentWorkspace={currentWorkspace}
                  onSelectWorkspace={(ws) => {
                    setCurrentWorkspace(ws);
                    setIsMobileMenuOpen(false);
                  }}
                  onOpenConnectModal={() => {
                    setCurrentView("social_accounts");
                    setIsMobileMenuOpen(false);
                  }}
                  unreadInboxCount={unreadInboxCount}
                  pendingApprovalsCount={pendingApprovalsCount}
                  onCloseMobile={() => setIsMobileMenuOpen(false)}
                  onLockDashboard={() => {
                    setIsMobileMenuOpen(false);
                    setIsLocked(true);
                  }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <TopHeader
            currentView={currentView}
            currentWorkspace={currentWorkspace}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onQuickCreate={() => setCurrentView("content_studio")}
            onOpenConnectAccounts={() => setCurrentView("social_accounts")}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
            onLockDashboard={() => setIsLocked(true)}
          />

          {/* View Container with generous bottom padding for mobile dock */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-28 md:pb-8 overflow-y-auto">
            {currentView === "command_center" && (
              <CommandCenterView
                currentWorkspace={currentWorkspace}
                onNavigate={setCurrentView}
                posts={posts}
                threads={threads}
              />
            )}
            {currentView === "content_studio" && (
              <ContentStudioView
                currentWorkspace={currentWorkspace}
                onPostCreated={refreshData}
                onOpenAccounts={() => setCurrentView("social_accounts")}
              />
            )}
            {currentView === "queue" && (
              <SmartQueueView
                currentWorkspace={currentWorkspace}
                posts={posts}
                onRefresh={refreshData}
                onNavigateToStudio={() => setCurrentView("content_studio")}
              />
            )}
            {currentView === "calendar" && (
              <CalendarView
                currentWorkspace={currentWorkspace}
                posts={posts}
                onNavigateToStudio={() => setCurrentView("content_studio")}
              />
            )}
            {currentView === "approvals" && (
              <ApprovalsView
                currentWorkspace={currentWorkspace}
                posts={posts}
                onRefresh={refreshData}
              />
            )}
            {currentView === "inbox" && (
              <UnifiedInboxView
                currentWorkspace={currentWorkspace}
                threads={threads}
                onRefresh={refreshData}
                onNavigateToAccounts={() => setCurrentView("social_accounts")}
              />
            )}
            {currentView === "listening" && (
              <SocialListeningView currentWorkspace={currentWorkspace} />
            )}
            {currentView === "analytics" && (
              <AnalyticsView currentWorkspace={currentWorkspace} />
            )}
            {currentView === "social_accounts" && (
              <SocialAccountsView currentWorkspace={currentWorkspace} />
            )}
            {currentView === "media_vault" && (
              <MediaVaultView
                currentWorkspace={currentWorkspace}
                onSelectMediaForPost={() => setCurrentView("content_studio")}
              />
            )}
            {currentView === "brand_brain" && (
              <BrandBrainView currentWorkspace={currentWorkspace} />
            )}
          </div>
        </main>
      </div>

      {/* Apple-Style Celebratory OAuth Return Toast */}
      <AnimatePresence>
        {oauthSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-20 right-4 md:right-8 z-50 max-w-md p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-300 shadow-xl shadow-emerald-500/10 flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <span>Social Account Authenticated!</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">
                  {oauthSuccessNotice.platform}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Successfully authorized <strong className="text-slate-900">{oauthSuccessNotice.handle}</strong>. Token exchange verified and real-time dispatches are now active.
              </p>
            </div>
            <button
              onClick={() => setOauthSuccessNotice(null)}
              aria-label="Dismiss notification"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apple-Style Liquid Glass Mobile Floating Dock */}
      <LiquidGlassNav
        currentView={currentView}
        onSelectView={setCurrentView}
        unreadInboxCount={unreadInboxCount}
      />

      {/* Global Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectView={setCurrentView}
        onSelectWorkspace={setCurrentWorkspace}
        currentWorkspace={currentWorkspace}
      />

      {/* Security Login Lock Screen with Passcode PIN (Default: 1234) */}
      <AnimatePresence>
        {isLocked && (
          <LoginLockScreen
            currentWorkspace={currentWorkspace}
            onUnlock={() => setIsLocked(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
