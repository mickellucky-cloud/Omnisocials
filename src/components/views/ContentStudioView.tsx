"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Workspace, PlatformId, PostVariant, PostItem } from "@/types";
import { generatePlatformVariants } from "@/lib/ai/contentGenerator";
import { evaluateSafetyAndRisk, RiskEvaluationResult } from "@/lib/ai/sentinelSafety";
import { savePost } from "@/lib/data/storage";
import { GlassPanel } from "../ui/GlassPanel";
import { PlatformBadge } from "../ui/PlatformBadge";
import { StatusBadge } from "../ui/StatusBadge";
import {
  XPreview,
  LinkedInPreview,
  InstagramPreview,
  TelegramPreview,
} from "../preview/PlatformPreviews";
import {
  Sparkles,
  Send,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredRealCredentials, PublishResult } from "@/lib/social/credentials";

interface ContentStudioViewProps {
  currentWorkspace: Workspace;
  onPostCreated?: () => void;
  onOpenAccounts?: () => void;
}

export const ContentStudioView: React.FC<ContentStudioViewProps> = ({
  currentWorkspace,
  onPostCreated,
  onOpenAccounts,
}) => {
  const [concept, setConcept] = useState(
    `We are launching our next-generation architecture across all distributed clusters. Sub-5ms latency, contractual 99.999% SLA uptime, and zero-downtime consensus failover.`
  );
  const [targetPlatforms, setTargetPlatforms] = useState<PlatformId[]>([
    "x",
    "linkedin",
    "instagram",
    "telegram",
  ]);
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformId>("x");
  const [previewPlatform, setPreviewPlatform] = useState<PlatformId>("x");
  const [mediaUrl, setMediaUrl] = useState(
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[] | null>(null);
  const [firstComment, setFirstComment] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Initialize variants
  const [variants, setVariants] = useState<Record<PlatformId, PostVariant>>(() =>
    generatePlatformVariants({
      workspaceId: currentWorkspace.id,
      rawConcept: concept,
      primaryMediaUrl: mediaUrl,
    })
  );

  // Live safety calculation
  const currentText = variants[activePlatformTab]?.text || concept;
  const safetyResult: RiskEvaluationResult = evaluateSafetyAndRisk(
    currentWorkspace.id,
    currentText
  );

  const togglePlatform = (p: PlatformId) => {
    if (targetPlatforms.includes(p)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter((item) => item !== p));
      }
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const handleTextChange = (text: string) => {
    setVariants((prev) => ({
      ...prev,
      [activePlatformTab]: {
        ...prev[activePlatformTab],
        text,
      },
    }));
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch("/api/ai/generate-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          concept,
          primaryMediaUrl: mediaUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVariants(data.variants);
        setFeedbackMessage(
          data.source === "gemini-live"
            ? "✦ Synthesized copies via Live Google Gemini AI!"
            : "✦ Synthesized copies via Intelligent Heuristic Engine!"
        );
      }
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDispatch = async (targetStatus: "queued" | "pending_approval" | "published") => {
    let dispatchOutcomes: PublishResult[] | undefined = undefined;

    if (targetStatus === "published") {
      setIsPublishing(true);
      setFeedbackMessage(null);
      setPublishResults(null);

      try {
        const credentials = getStoredRealCredentials(currentWorkspace.id);
        const res = await fetch("/api/social/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platforms: targetPlatforms,
            text: activeVariant.text || concept,
            mediaUrls: mediaUrl ? [mediaUrl] : undefined,
            credentials,
          }),
        });

        const data = await res.json();
        if (res.ok && data.results) {
          dispatchOutcomes = data.results;
          setPublishResults(data.results);
          const successes = data.results.filter((r: PublishResult) => r.success);
          const failures = data.results.filter((r: PublishResult) => !r.success);

          if (successes.length > 0) {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#3B82F6", "#06B6D4", "#8B5CF6", "#10B981"],
            });
            setFeedbackMessage(
              `🎉 Dispatched to ${successes.length} network${successes.length > 1 ? "s" : ""}!` +
                (failures.length > 0 ? ` (${failures.length} need credentials in Social Accounts)` : "")
            );
          } else {
            setFeedbackMessage(
              `⚠️ Live dispatch incomplete: No active API credentials configured for ${targetPlatforms.join(", ").toUpperCase()}. Configure them in Social Accounts to post live.`
            );
          }
        } else {
          setFeedbackMessage(`Publishing error: ${data.error || "Unknown server error"}`);
        }
      } catch (err: any) {
        setFeedbackMessage(`Publishing failed: ${err.message || "Failed to contact dispatch server"}`);
      } finally {
        setIsPublishing(false);
      }
    }

    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      workspaceId: currentWorkspace.id,
      title: concept.slice(0, 48) + "...",
      rawConcept: concept,
      targetPlatforms,
      variants,
      status: targetStatus,
      queueSlotTime: targetStatus === "queued" ? "13:00" : undefined,
      scheduledFor: targetStatus === "queued" ? new Date(Date.now() + 86400000).toISOString() : undefined,
      author: currentWorkspace.team[0],
      createdAt: new Date().toISOString(),
      publishedAt: targetStatus === "published" ? new Date().toISOString() : undefined,
      firstComment: firstComment || undefined,
      approvalHistory: [
        {
          id: `appr-${Date.now()}`,
          authorName: currentWorkspace.team[0].name,
          action: targetStatus === "pending_approval" ? "submitted" : "approved",
          timestamp: new Date().toISOString(),
          notes: targetStatus === "pending_approval" ? "Submitted for editorial review" : "Dispatched directly",
        },
      ],
    };

    savePost(newPost);

    if (targetStatus === "queued") {
      setFeedbackMessage("⚡ Post successfully inserted into the Buffer Smart Queue!");
    } else if (targetStatus === "pending_approval") {
      setFeedbackMessage("📋 Post submitted to Editorial Approvals pipeline for manager review!");
    }

    if (onPostCreated) onPostCreated();
  };

  const activeVariant = variants[activePlatformTab] || variants.x;
  const charLimit = activePlatformTab === "x" ? 280 : 3000;
  const currentLength = (activeVariant.text || "").length;
  const isOverLimit = currentLength > charLimit;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Banner & AI Adaptation Trigger */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Adaptive Multi-Network Composer</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold border border-purple-200">
              ✦ Gemini AI Repurposer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Write one core insight; OmniSocial adapts the tone, formatting, and character budget per network.
          </p>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          aria-label="Synthesize copies across all target networks with Gemini AI"
          className="tap-press flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>✦ Adapt via Gemini AI</span>
            </>
          )}
        </button>
      </GlassPanel>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-500 hover:text-slate-800 text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Network Delivery Results Breakdown */}
      {publishResults && publishResults.length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Dispatch Breakdown
              </span>
              <span className="text-[11px] text-slate-500">
                ({publishResults.filter((r) => r.success).length}/{publishResults.length} delivered)
              </span>
            </div>
            {onOpenAccounts && (
              <button
                onClick={onOpenAccounts}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                Configure Keys in Social Accounts →
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {publishResults.map((res) => (
              <div
                key={res.platform}
                className={cn(
                  "p-3 rounded-xl border text-xs flex flex-col justify-between transition-all",
                  res.success
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/70 border-amber-200 text-amber-950"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold uppercase text-[11px] tracking-wide">{res.platform}</span>
                  {res.success ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Delivered ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Setup Needed
                    </span>
                  )}
                </div>
                {res.success ? (
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-emerald-700 truncate font-mono">
                      ID: {res.postId || "Live"}
                    </p>
                    {res.postUrl && (
                      <a
                        href={res.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 underline hover:text-blue-800 block truncate"
                      >
                        View Broadcast →
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-800 leading-tight">
                    {res.error || "Requires API credentials"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Column Composer Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Composer & Controls) - 7 Cols */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Target Networks Multi-Select */}
          <GlassPanel className="p-4 border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Select Target Networks
            </div>
            <div className="flex flex-wrap gap-2">
              {(["x", "linkedin", "instagram", "facebook", "tiktok", "youtube", "telegram"] as PlatformId[]).map(
                (p) => {
                  const isSelected = targetPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      aria-pressed={isSelected}
                      aria-label={`Toggle ${p.toUpperCase()} as target network`}
                      className={cn(
                        "tap-press min-h-[44px] flex items-center transition-all duration-150 rounded-xl",
                        isSelected ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-white opacity-100" : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <PlatformBadge platform={p} size="md" />
                    </button>
                  );
                }
              )}
            </div>
          </GlassPanel>

          {/* 2. Core Narrative Concept */}
          <GlassPanel className="p-4 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Raw Concept / Master Insight
              </span>
              <span className="text-[11px] text-slate-400">Source of AI synthesis</span>
            </div>
            <textarea
              rows={3}
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Enter your product launch, blog summary, or milestone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors resize-none leading-relaxed"
            />
          </GlassPanel>

          {/* 3. Per-Platform Customization Editor */}
          <GlassPanel className="p-4 space-y-3 border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              {/* Platform Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {targetPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setActivePlatformTab(p);
                      setPreviewPlatform(p);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                      activePlatformTab === p
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Character Limit Counter */}
              <div
                className={cn(
                  "text-xs font-mono font-medium",
                  isOverLimit ? "text-rose-600 font-bold" : "text-slate-400"
                )}
              >
                {currentLength} / {charLimit}
              </div>
            </div>

            {/* Active Platform Copy Area */}
            <textarea
              rows={6}
              value={activeVariant.text || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Write tailored copy for ${activePlatformTab}...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors resize-none leading-relaxed"
            />

            {/* First Comment Scheduler (Instagram & LinkedIn) */}
            {(activePlatformTab === "instagram" || activePlatformTab === "linkedin") && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automated First Comment (Hashtags or External Link)</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Full architectural documentation at https://..."
                  value={firstComment}
                  onChange={(e) => setFirstComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
            )}
          </GlassPanel>

          {/* 4. Sentinel Safety & Compliance Gating */}
          <GlassPanel
            className={cn(
              "p-4 border transition-colors",
              safetyResult.passed
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-rose-200 bg-rose-50/60"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {safetyResult.passed ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-xs font-bold text-slate-900">
                  Sentinel Safety & Brand Compliance
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono font-bold px-2 py-0.5 rounded border",
                  safetyResult.passed
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-rose-100 text-rose-800 border-rose-200"
                )}
              >
                Score: {safetyResult.score}/100
              </span>
            </div>

            {safetyResult.violations.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {safetyResult.violations.map((v, i) => (
                  <div key={i} className="text-xs text-rose-800 flex items-start gap-1.5">
                    <span className="text-rose-600 shrink-0 font-bold">✕</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {safetyResult.recommendations.length > 0 && (
              <div className="space-y-1 mt-2 text-[11px] text-slate-600">
                {safetyResult.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-blue-600 font-semibold">💡</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {safetyResult.violations.length === 0 && (
              <p className="text-xs text-emerald-800 mt-1">
                All copy fully complies with approved brand guidelines and regulatory constraints.
              </p>
            )}
          </GlassPanel>

          {/* 5. Dispatch & Queue Routing Bar */}
          <GlassPanel className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-slate-200 bg-slate-50/60">
            <div className="text-xs text-slate-500">
              Ready to schedule for <span className="font-semibold text-slate-900">{targetPlatforms.length} networks</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleDispatch("pending_approval")}
                className="tap-press flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-300 shadow-2xs"
              >
                Submit for Approval
              </button>
              <button
                onClick={() => handleDispatch("queued")}
                className="tap-press flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Buffer Queue</span>
              </button>
              <button
                onClick={() => handleDispatch("published")}
                disabled={isPublishing}
                className="tap-press flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </>
                )}
              </button>
            </div>
          </GlassPanel>
        </div>

        {/* Right Column (Pixel-Accurate Live Previews) - 5 Cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Live Platform Preview
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              {(["x", "linkedin", "instagram", "telegram"] as PlatformId[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreviewPlatform(p)}
                  aria-label={`Preview post on ${p.toUpperCase()}`}
                  className={cn(
                    "tap-press min-h-[32px] px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors uppercase",
                    previewPlatform === p
                      ? "bg-white text-blue-700 font-bold shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="sticky top-20">
            {previewPlatform === "x" && (
              <XPreview
                variant={variants.x || activeVariant}
                workspace={currentWorkspace}
              />
            )}
            {previewPlatform === "linkedin" && (
              <LinkedInPreview
                variant={variants.linkedin || activeVariant}
                workspace={currentWorkspace}
              />
            )}
            {previewPlatform === "instagram" && (
              <InstagramPreview
                variant={variants.instagram || activeVariant}
                workspace={currentWorkspace}
              />
            )}
            {previewPlatform === "telegram" && (
              <TelegramPreview
                variant={variants.telegram || activeVariant}
                workspace={currentWorkspace}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
