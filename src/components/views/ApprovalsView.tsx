"use client";

import React, { useState } from "react";
import { Workspace, PostItem } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { StatusBadge } from "../ui/StatusBadge";
import { PlatformBadge } from "../ui/PlatformBadge";
import { updatePostStatus } from "@/lib/data/storage";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalsViewProps {
  currentWorkspace: Workspace;
  posts: PostItem[];
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  currentWorkspace,
  posts,
  onRefresh,
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string>(
    posts.find((p) => p.status === "pending_approval")?.id || posts[0]?.id || ""
  );
  const [revisionNotes, setRevisionNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedPost = posts.find((p) => p.id === selectedPostId) || posts[0];

  const pendingList = posts.filter((p) => p.status === "pending_approval");
  const approvedList = posts.filter((p) => p.status === "approved" || p.status === "queued");

  const handleApprove = () => {
    if (!selectedPost) return;
    updatePostStatus(selectedPost.id, "queued", {
      id: `appr-${Date.now()}`,
      authorName: currentWorkspace.team[0].name,
      action: "approved",
      timestamp: new Date().toISOString(),
      notes: "Editorial compliance verified. Approved and queued.",
    });
    setFeedback(`✓ Post "${selectedPost.title}" approved and scheduled in Buffer Queue!`);
    onRefresh();
  };

  const handleRequestChanges = () => {
    if (!selectedPost) return;
    if (!revisionNotes) {
      alert("Please provide revision feedback notes for the author.");
      return;
    }
    updatePostStatus(selectedPost.id, "changes_requested", {
      id: `appr-${Date.now()}`,
      authorName: currentWorkspace.team[0].name,
      action: "requested_changes",
      timestamp: new Date().toISOString(),
      notes: revisionNotes,
    });
    setFeedback(`Revisions requested for "${selectedPost.title}".`);
    setRevisionNotes("");
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Header */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Post Approvals & Governance</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                {pendingList.length} Pending Sign-off
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Multi-tier editorial sign-off pipeline with immutable compliance audit logging
            </p>
          </div>
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
            aria-label="Dismiss feedback notification"
            className="tap-press min-h-[32px] px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-medium rounded-lg hover:bg-blue-100/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Lists by Stage (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Pending Sign-off Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Review ({pendingList.length})
              </span>
              <span className="text-[10px] text-slate-400">Requires Manager Action</span>
            </div>

            <div className="space-y-2">
              {pendingList.map((post) => (
                <div
                  key={post.id}
                  role="button"
                  tabIndex={0}
                  aria-selected={selectedPostId === post.id}
                  aria-label={`Select pending post: ${post.title}`}
                  onClick={() => setSelectedPostId(post.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPostId(post.id);
                    }
                  }}
                  className={cn(
                    "tap-press p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500",
                    selectedPostId === post.id
                      ? "bg-blue-50/80 border-blue-300 shadow-xs ring-1 ring-blue-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">
                      {post.title}
                    </span>
                    <StatusBadge status={post.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.rawConcept}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      {post.targetPlatforms.map((p) => (
                        <PlatformBadge key={p} platform={p} size="sm" showLabel={false} />
                      ))}
                    </div>
                    <span>By {post.author.name}</span>
                  </div>
                </div>
              ))}

              {pendingList.length === 0 && (
                <div className="p-6 rounded-xl border border-slate-200 bg-white text-center text-slate-400 text-xs">
                  Zero items currently pending sign-off.
                </div>
              )}
            </div>
          </div>

          {/* Approved & Queued History */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Approved & Queued ({approvedList.length})
            </span>

            <div className="space-y-2">
              {approvedList.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  role="button"
                  tabIndex={0}
                  aria-selected={selectedPostId === post.id}
                  aria-label={`Select approved post: ${post.title}`}
                  onClick={() => setSelectedPostId(post.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPostId(post.id);
                    }
                  }}
                  className={cn(
                    "tap-press p-3 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500",
                    selectedPostId === post.id
                      ? "bg-blue-50/80 border-blue-300 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">{post.title}</span>
                    <StatusBadge status={post.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reviewer Inspector & Audit Trail (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedPost ? (
            <GlassPanel className="p-5 space-y-4 border-slate-200 bg-white shadow-xs">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{selectedPost.title}</h3>
                    <StatusBadge status={selectedPost.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Submitted by <strong className="text-slate-800 font-semibold">{selectedPost.author.name}</strong></span>
                    <span>·</span>
                    <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedPost.targetPlatforms.map((p) => (
                    <PlatformBadge key={p} platform={p} size="sm" />
                  ))}
                </div>
              </div>

              {/* Raw Concept & Copy Inspector */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Post Content Preview
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedPost.variants.x?.text ||
                    selectedPost.variants.linkedin?.text ||
                    selectedPost.rawConcept}
                </div>
              </div>

              {/* Reviewer Action Box */}
              {selectedPost.status === "pending_approval" && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>Editorial Sign-off Decision</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Revision notes (required if requesting changes)..."
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                    <button
                      onClick={handleRequestChanges}
                      aria-label={`Request revisions for post "${selectedPost.title}"`}
                      className="tap-press min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-300 transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      Request Revisions
                    </button>
                    <button
                      onClick={handleApprove}
                      aria-label={`Approve and add post "${selectedPost.title}" to Buffer queue`}
                      className="tap-press min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Approve & Add to Buffer Queue</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Immutable Audit Trail History */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Compliance Audit Trail</span>
                </div>

                <div className="space-y-2">
                  {(selectedPost.approvalHistory || []).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {entry.authorName}{" "}
                          <span className="font-normal text-slate-500 capitalize">
                            · {entry.action.replace("_", " ")}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-[11px] text-slate-600 mt-0.5 italic">
                            &ldquo;{entry.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          ) : (
            <GlassPanel className="p-12 text-center text-slate-400 text-xs border-slate-200 bg-white">
              Select a post on the left to inspect its editorial details and sign-off status.
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
};
