"use client";

import React, { useState } from "react";
import { Workspace, ConversationThread, ThreadMessage, InternalNote } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { PlatformBadge } from "../ui/PlatformBadge";
import { StatusBadge } from "../ui/StatusBadge";
import { initialCannedMacros } from "@/lib/data/mockData";
import { saveThread } from "@/lib/data/storage";
import { formatRelativeTime } from "@/lib/utils";
import {
  Inbox,
  Search,
  Send,
  Sparkles,
  CheckCircle2,
  Lock,
  RefreshCw,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedInboxViewProps {
  currentWorkspace: Workspace;
  threads: ConversationThread[];
  onRefresh: () => void;
  onNavigateToAccounts?: () => void;
}

export const UnifiedInboxView: React.FC<UnifiedInboxViewProps> = ({
  currentWorkspace,
  threads,
  onRefresh,
  onNavigateToAccounts,
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || "");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [replyText, setReplyText] = useState("");
  const [internalNoteText, setInternalNoteText] = useState("");
  const [activeTab, setActiveTab] = useState<"reply" | "notes">("reply");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  // Filters logic
  const filteredThreads = threads.filter((t) => {
    if (filterCategory === "unread" && !t.isUnread) return false;
    if (filterCategory === "vip" && t.customer.tier !== "VIP") return false;
    if (filterCategory === "critical" && t.sentiment !== "critical" && t.sentiment !== "negative") return false;
    if (filterCategory === "assigned" && t.assignedTo?.name !== currentWorkspace.team[0]?.name) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.customer.name.toLowerCase().includes(q) ||
        t.customer.handle.toLowerCase().includes(q) ||
        t.lastMessageSnippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedThread) return;

    const newMessage: ThreadMessage = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedThread: ConversationThread = {
      ...selectedThread,
      messages: [...selectedThread.messages, newMessage],
      lastMessageSnippet: `Agent: ${replyText.trim()}`,
      lastMessageTime: new Date().toISOString(),
      isUnread: false,
      status: "resolved",
      currentlyTypingBy: undefined, // Clear collision banner
    };

    saveThread(updatedThread);
    setReplyText("");
    setFeedback(`✓ Response sent to ${selectedThread.customer.name}!`);
    onRefresh();
  };

  const handleAddInternalNote = () => {
    if (!internalNoteText.trim() || !selectedThread) return;

    const newNote: InternalNote = {
      id: `note-${Date.now()}`,
      authorName: currentWorkspace.team[0]?.name || "Sarah Jenkins",
      authorAvatar: currentWorkspace.team[0]?.avatar || "https://avatar.vercel.sh/user",
      text: internalNoteText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedThread: ConversationThread = {
      ...selectedThread,
      internalNotes: [...(selectedThread.internalNotes || []), newNote],
    };

    saveThread(updatedThread);
    setInternalNoteText("");
    setFeedback("🔒 Internal team note attached to customer profile.");
    onRefresh();
  };

  const handleSynthesizeAI = async () => {
    if (!selectedThread) return;
    setIsSynthesizing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/ai/reply-inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          customerName: selectedThread.customer.name,
          messages: selectedThread.messages,
          intent: selectedThread.intent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReplyText(data.reply);
        setFeedback("✦ Brand-aligned response synthesized with Gemini AI!");
      }
    } catch (err) {
      console.error("Reply synthesis error:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const filterTabs = [
    { id: "all", label: "All Inbound", count: threads.length },
    { id: "unread", label: "Unread", count: threads.filter((t) => t.isUnread).length, color: "text-blue-600" },
    { id: "vip", label: "VIP", count: threads.filter((t) => t.customer.tier === "VIP").length, color: "text-amber-700" },
    { id: "critical", label: "Crisis", count: threads.filter((t) => t.sentiment === "critical" || t.sentiment === "negative").length, color: "text-rose-700" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Banner */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Unified Smart Social Inbox</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                3-Pane Sprout Grade
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Aggregated DMs, mentions and replies with team collision detection and live CRM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time webhook sync active</span>
        </div>
      </GlassPanel>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-500 hover:text-slate-800 text-xs font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Inbox Zero Screen when threads is completely empty */}
      {threads.length === 0 ? (
        <GlassPanel className="p-10 md:p-16 border-slate-200 bg-white text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Inbox Zero · No Pending Messages</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All social customer inquiries, Telegram group messages, X mentions, and LinkedIn comments are up to date. Incoming direct messages will stream in here automatically.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onNavigateToAccounts && (
              <button
                onClick={onNavigateToAccounts}
                className="tap-press min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 inline-flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Link Social Accounts & Verify APIs</span>
              </button>
            )}
            <button
              onClick={onRefresh}
              className="tap-press min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-2 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check for New Messages</span>
            </button>
          </div>
        </GlassPanel>
      ) : (
        /* 3-Pane Enterprise Layout Container */
        <div>
          {/* Mobile Filter Chips Bar (Visible on mobile when in list view) */}
          <div className={cn("md:hidden mb-4 overflow-x-auto pb-1 flex items-center gap-1.5", mobileDetailOpen ? "hidden" : "flex")}>
            {filterTabs.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={cn(
                  "tap-press min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shadow-2xs border flex items-center gap-2",
                  filterCategory === f.id
                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                    : "bg-white text-slate-600 border-slate-200"
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full",
                    filterCategory === f.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[620px] rounded-2xl overflow-hidden">
            {/* Pane 1: Smart Filter Folders (3 Cols) - Desktop only */}
            <div className="hidden md:flex md:col-span-3 bg-white border border-slate-200 p-3.5 space-y-4 rounded-2xl flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                  Engagement Folders
                </div>

                <div className="space-y-1">
                  {[
                    { id: "all", label: "All Inbound", count: threads.length },
                    { id: "unread", label: "Unread Messages", count: threads.filter((t) => t.isUnread).length, color: "text-blue-600" },
                    { id: "vip", label: "VIP Customers", count: threads.filter((t) => t.customer.tier === "VIP").length, color: "text-amber-700" },
                    { id: "critical", label: "Crisis & Negative", count: threads.filter((t) => t.sentiment === "critical" || t.sentiment === "negative").length, color: "text-rose-700" },
                    { id: "assigned", label: "Assigned to Me", count: threads.filter((t) => t.assignedTo?.name === currentWorkspace.team[0]?.name).length },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterCategory(f.id)}
                      aria-pressed={filterCategory === f.id}
                      className={cn(
                        "tap-press min-h-[36px] w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-2xs",
                        filterCategory === f.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <span className={filterCategory === f.id ? "text-blue-700 font-semibold" : f.color}>{f.label}</span>
                      <span
                        className={cn(
                          "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full",
                          filterCategory === f.id ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Canned Macro Quick Shortcuts */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                  Canned Response Macros
                </div>
                <div className="space-y-1">
                  {initialCannedMacros.map((macro) => (
                    <button
                      key={macro.id}
                      onClick={() => setReplyText(macro.content)}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-[11px]"
                    >
                      <div className="font-semibold text-blue-700 font-mono">{macro.shortcut}</div>
                      <div className="text-slate-500 text-[10px] truncate">{macro.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pane 2: Conversation Stream List (4 Cols) - Visible on desktop, or on mobile when not in detail mode */}
            <div
              className={cn(
                "md:col-span-4 bg-white border border-slate-200 p-3.5 space-y-3 rounded-2xl flex-col shadow-xs",
                mobileDetailOpen ? "hidden md:flex" : "flex"
              )}
            >
              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[540px] pr-1">
                {filteredThreads.map((thread) => {
                  const isSelected = selectedThread?.id === thread.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedThreadId(thread.id);
                        setMobileDetailOpen(true);
                        if (thread.suggestedResponse) setReplyText(thread.suggestedResponse);
                      }}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer group",
                        isSelected
                          ? "bg-blue-50/80 border-blue-300 shadow-xs ring-1 ring-blue-400/20"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thread.customer.avatar}
                            alt={thread.customer.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1">
                              {thread.customer.name}
                              {thread.customer.tier === "VIP" && (
                                <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
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
                        <span className="text-[10px] text-slate-400 font-mono">{formatRelativeTime(thread.lastMessageTime)}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredThreads.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No conversations match the current filter.
                  </div>
                )}
              </div>
            </div>

            {/* Pane 3: Conversation Canvas & CRM Panel (5 Cols) - Visible on desktop, or on mobile when in detail mode */}
            <div
              className={cn(
                "md:col-span-5 bg-white border border-slate-200 p-4 space-y-4 rounded-2xl flex-col justify-between shadow-xs",
                mobileDetailOpen ? "flex" : "hidden md:flex"
              )}
            >
              {selectedThread ? (
                <>
                  <div>
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setMobileDetailOpen(false)}
                      className="md:hidden mb-3 tap-press min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 border border-slate-300 shadow-2xs w-full"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-600" />
                      <span>← Back to Inbound Messages</span>
                    </button>

                    {/* Collision Detection Banner */}
                    {selectedThread.currentlyTypingBy && (
                      <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>
                          ⚠️ <strong>{selectedThread.currentlyTypingBy}</strong> is reviewing and drafting a response to this thread.
                        </span>
                      </div>
                    )}

                    {/* Customer CRM Header Bar */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedThread.customer.avatar}
                          alt={selectedThread.customer.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            {selectedThread.customer.name}
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono font-semibold">
                              {selectedThread.customer.tier}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{selectedThread.customer.bio}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span>{selectedThread.customer.followerCount.toLocaleString()} followers</span>
                            <span>·</span>
                            <span>{selectedThread.customer.interactionCount} past interactions</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tab Switcher: Reply vs Internal Team Notes */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                      <button
                        onClick={() => setActiveTab("reply")}
                        className={cn(
                          "text-xs font-semibold px-3 py-1 rounded-lg transition-colors",
                          activeTab === "reply"
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        Reply to Customer
                      </button>
                      <button
                        onClick={() => setActiveTab("notes")}
                        className={cn(
                          "text-xs font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1",
                          activeTab === "notes"
                            ? "bg-amber-600 text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Internal Notes ({selectedThread.internalNotes?.length || 0})</span>
                      </button>
                    </div>

                    {/* Message Stream or Notes Stream */}
                    {activeTab === "reply" ? (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 mb-3">
                        {selectedThread.messages.map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              "p-3 rounded-xl text-xs max-w-[85%] leading-relaxed shadow-2xs",
                              m.sender === "customer"
                                ? "bg-slate-100 border border-slate-200 text-slate-800 mr-auto"
                                : "bg-blue-600 text-white ml-auto"
                            )}
                          >
                            <div className={cn("font-semibold text-[10px] mb-1", m.sender === "customer" ? "text-slate-500" : "text-blue-100")}>
                              {m.sender === "customer" ? selectedThread.customer.name : "Agency Agent"}
                            </div>
                            <div>{m.text}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-3">
                        {(selectedThread.internalNotes || []).map((n) => (
                          <div
                            key={n.id}
                            className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-amber-800 mb-1 font-semibold">
                              <span>{n.authorName} (Internal Team)</span>
                              <span className="font-mono text-amber-600">{new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <p>{n.text}</p>
                          </div>
                        ))}
                        {(!selectedThread.internalNotes || selectedThread.internalNotes.length === 0) && (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No internal notes yet. Use internal notes to coordinate with teammates before replying.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Composer Area */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {activeTab === "reply" ? (
                      <>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={handleSynthesizeAI}
                            disabled={isSynthesizing}
                            className="text-xs text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1 disabled:opacity-50"
                          >
                            {isSynthesizing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-600" />}
                            <span>✦ AI Suggest Reply</span>
                          </button>
                          <span className="text-[10px] text-slate-400">Shift+Enter for new line</span>
                        </div>

                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${selectedThread.customer.name}...`}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 resize-none leading-relaxed"
                        />

                        <div className="flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">
                            Replying via <strong className="text-slate-800 uppercase">{selectedThread.platform}</strong>
                          </div>
                          <button
                            onClick={handleSendReply}
                            aria-label="Send reply to thread"
                            className="tap-press min-h-[40px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Reply</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <textarea
                          rows={3}
                          value={internalNoteText}
                          onChange={(e) => setInternalNoteText(e.target.value)}
                          placeholder="Add an internal note visible only to your agency teammates..."
                          className="w-full bg-amber-50/50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-950 placeholder:text-slate-400 outline-none focus:bg-white focus:border-amber-400 resize-none leading-relaxed"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleAddInternalNote}
                            aria-label="Save internal note"
                            className="tap-press min-h-[40px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Save Internal Note</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Select a conversation thread to inspect and reply.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
