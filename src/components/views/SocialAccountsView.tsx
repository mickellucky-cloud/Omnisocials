"use client";

import React, { useState, useEffect } from "react";
import { Workspace, ConnectedAccount, PlatformId } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { PlatformBadge } from "../ui/PlatformBadge";
import { formatNumber } from "@/lib/utils";
import {
  Share2,
  Plus,
  RefreshCw,
  CheckCircle2,
  Key,
  ShieldCheck,
  Zap,
  ExternalLink,
  Lock,
  ArrowRight,
  Info,
  Check,
  AlertTriangle,
  Server,
  Terminal,
  Send,
  Eye,
  EyeOff,
  Trash2,
  Globe,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PlatformCredentials,
  getStoredRealCredentials,
  saveStoredRealCredentials,
  VerificationResult,
} from "@/lib/social/credentials";
import { getStoredAccounts, saveConnectedAccount, disconnectAccount } from "@/lib/data/storage";
import { buildOAuthAuthorizationUrl, OAUTH_PLATFORM_CONFIGS } from "@/lib/social/oauth";

interface SocialAccountsViewProps {
  currentWorkspace: Workspace;
  onAccountConnected?: () => void;
}

export const SocialAccountsView: React.FC<SocialAccountsViewProps> = ({
  currentWorkspace,
  onAccountConnected,
}) => {
  const [activeTab, setActiveTab] = useState<"oauth" | "direct" | "ayrshare" | "env">("oauth");
  const [credentials, setCredentials] = useState<PlatformCredentials>({});
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<VerificationResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Accounts list
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [pingingId, setPingingId] = useState<string | null>(null);

  // Load credentials and accounts on mount / workspace change
  useEffect(() => {
    const creds = getStoredRealCredentials(currentWorkspace.id);
    setCredentials(creds);
    setAccounts(getStoredAccounts(currentWorkspace.id));
  }, [currentWorkspace.id]);

  const toggleShowToken = (key: string) => {
    setShowTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateCredential = (field: keyof PlatformCredentials, value: string) => {
    const updated = { ...credentials, [field]: value };
    setCredentials(updated);
    saveStoredRealCredentials(currentWorkspace.id, updated);
  };

  const handleVerify = async (platform: string) => {
    setVerifyingPlatform(platform);
    setVerificationFeedback(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/social/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          credentials,
        }),
      });
      const data: VerificationResult = await res.json();
      setVerificationFeedback(data);

      if (data.ok) {
        setFeedback(`✓ Real API connection verified for ${platform.toUpperCase()} (${data.accountHandle || data.accountName}) in ${data.latencyMs}ms!`);

        // If verified, update or add to connected accounts fleet
        const platformId = platform as PlatformId;
        const newOrUpdatedAcc: ConnectedAccount = {
          id: `acc-${platform}-${Date.now()}`,
          workspaceId: currentWorkspace.id,
          platform: platformId,
          accountHandle: data.accountHandle || `@${currentWorkspace.slug}_${platform}`,
          accountName: data.accountName || `${currentWorkspace.name} (${platform.toUpperCase()})`,
          accountAvatar: data.avatarUrl || currentWorkspace.avatarUrl,
          status: "active",
          followersCount: data.details?.followersCount || 0,
          latencyMs: data.latencyMs || 45,
          connectedAt: new Date().toISOString(),
          scopes: ["read", "write", "publish"],
        };

        saveConnectedAccount(newOrUpdatedAcc);
        setAccounts(getStoredAccounts(currentWorkspace.id));

        if (onAccountConnected) onAccountConnected();
      }
    } catch (err: any) {
      setVerificationFeedback({
        ok: false,
        platform,
        error: err.message || "Failed to contact verification endpoint",
      });
    } finally {
      setVerifyingPlatform(null);
    }
  };

  const handleTestPing = async (acc: ConnectedAccount) => {
    setPingingId(acc.id);
    try {
      const res = await fetch("/api/social/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: acc.platform,
          credentials,
        }),
      });
      const data: VerificationResult = await res.json();
      setPingingId(null);

      if (data.ok) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === acc.id ? { ...a, latencyMs: data.latencyMs || 35, status: "active" } : a))
        );
        setFeedback(`✓ Ping successful for ${acc.accountHandle}: ${data.latencyMs}ms response time.`);
      } else {
        setFeedback(`⚠️ Ping returned: ${data.error || "No active credentials configured for live check"}`);
      }
    } catch {
      setPingingId(null);
      setFeedback("⚠️ Network error while pinging platform.");
    }
  };

  const handleDisconnect = (id: string) => {
    disconnectAccount(currentWorkspace.id, id);
    setAccounts(getStoredAccounts(currentWorkspace.id));
    setFeedback("Account removed from active management.");
    if (onAccountConnected) onAccountConnected();
  };

  const handleClearCredentials = (platform: string) => {
    const updated = { ...credentials };
    if (platform === "telegram") {
      delete updated.telegramBotToken;
      delete updated.telegramChatId;
    } else if (platform === "ayrshare") {
      delete updated.ayrshareApiKey;
    } else if (platform === "x") {
      delete updated.twitterBearerToken;
      delete updated.twitterApiKey;
    } else if (platform === "linkedin") {
      delete updated.linkedinAccessToken;
      delete updated.linkedinAuthorUrn;
    } else if (platform === "facebook") {
      delete updated.metaPageAccessToken;
      delete updated.metaPageId;
    }
    setCredentials(updated);
    saveStoredRealCredentials(currentWorkspace.id, updated);
    setFeedback(`Cleared credentials for ${platform.toUpperCase()}`);
  };

  const handleConnectOAuth = (platform: PlatformId) => {
    const url = buildOAuthAuthorizationUrl({
      platform,
      workspaceId: currentWorkspace.id,
    });
    window.location.href = url;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Banner */}
      <GlassPanel className="p-6 border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Social Media Accounts &amp; Real API Hub
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-semibold font-mono">
                  {accounts.length} Active Channels
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Link and authenticate your real social media accounts with live API keys, Bot tokens, or unified cross-platform gateways.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Workspace:</span>
            <span className="text-xs font-bold text-slate-800 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 font-mono">
              {currentWorkspace.name}
            </span>
          </div>
        </div>
      </GlassPanel>

      {/* Verification Feedback Banner */}
      {verificationFeedback && (
        <div
          className={cn(
            "p-4 rounded-xl border text-xs flex items-start justify-between shadow-xs animate-in fade-in",
            verificationFeedback.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          )}
        >
          <div className="flex items-start gap-2.5">
            {verificationFeedback.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {verificationFeedback.ok
                  ? `Live Connection Verified: ${verificationFeedback.accountName || verificationFeedback.platform}`
                  : `API Verification Failed for ${verificationFeedback.platform.toUpperCase()}`}
              </div>
              <p className="mt-0.5 text-slate-600">
                {verificationFeedback.ok
                  ? `Successfully authenticated with ${verificationFeedback.platform.toUpperCase()} API (${verificationFeedback.accountHandle || "token valid"}). Latency: ${verificationFeedback.latencyMs}ms.`
                  : verificationFeedback.error}
              </p>
              {verificationFeedback.details && (
                <div className="mt-2 p-2 bg-white/70 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  {JSON.stringify(verificationFeedback.details)}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setVerificationFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {feedback && !verificationFeedback && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-blue-700 hover:text-blue-900 font-semibold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Enterprise Security Architecture Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Enterprise Credential Isolation: </span>
            <span className="text-slate-600">
              API tokens and Bot keys are stored securely in your private session storage. Zero keys are exposed to third-party trackers.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-blue-700 border border-blue-200 shadow-2xs">
            E2E ISOLATION
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            LIVE DISPATCH
          </span>
        </div>
      </div>

      {/* Integration Options Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("oauth")}
          className={cn(
            "tap-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs",
            activeTab === "oauth"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Globe className="w-4 h-4" />
          <span>1-Click Social Connect (OAuth 2.0)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold uppercase tracking-wider">
            Fast
          </span>
        </button>

        <button
          onClick={() => setActiveTab("direct")}
          className={cn(
            "tap-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs",
            activeTab === "direct"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Zap className="w-4 h-4" />
          <span>Direct Platform API Keys (Telegram, X, LinkedIn, Meta)</span>
        </button>

        <button
          onClick={() => setActiveTab("ayrshare")}
          className={cn(
            "tap-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs",
            activeTab === "ayrshare"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Server className="w-4 h-4" />
          <span>Ayrshare Unified API (1-Click Multi-Network)</span>
        </button>

        <button
          onClick={() => setActiveTab("env")}
          className={cn(
            "tap-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs",
            activeTab === "env"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Terminal className="w-4 h-4" />
          <span>.env.local Config Template</span>
        </button>
      </div>

      {/* TAB 0: 1-Click Social Connect (OAuth 2.0) */}
      {activeTab === "oauth" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Direct Browser-to-Social OAuth Redirect Flow</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Click <strong>Connect</strong> below to redirect to the official social provider authorization screen, authenticate permissions, and return automatically to Omnisocial.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-blue-800 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200">
                OAuth 2.0 PKCE · Zero Token Exposure
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(
              [
                "x",
                "linkedin",
                "instagram",
                "facebook",
                "tiktok",
                "youtube",
                "telegram",
                "threads",
              ] as PlatformId[]
            ).map((pId) => {
              const cfg = OAUTH_PLATFORM_CONFIGS[pId];
              const connectedAcc = accounts.find((a) => a.platform === pId);

              return (
                <GlassPanel
                  key={pId}
                  className="p-5 border-slate-200 bg-white flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
                          style={{ backgroundColor: cfg.brandColor }}
                        >
                          {pId === "x" && "𝕏"}
                          {pId === "linkedin" && "in"}
                          {pId === "instagram" && "IG"}
                          {pId === "facebook" && "f"}
                          {pId === "tiktok" && "TT"}
                          {pId === "youtube" && "▶"}
                          {pId === "telegram" && "✈"}
                          {pId === "threads" && "@"}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 leading-tight">
                            {cfg.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {connectedAcc ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {connectedAcc.accountHandle}
                              </span>
                            ) : (
                              "Not linked yet"
                            )}
                          </div>
                        </div>
                      </div>

                      {connectedAcc ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase font-mono">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                          Available
                        </span>
                      )}
                    </div>

                    {/* Permission scopes checklist */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-800 text-[10px] uppercase tracking-wider">
                        Authorized Permissions:
                      </div>
                      <div className="space-y-1">
                        {cfg.permissionsDescription.slice(0, 2).map((desc, i) => (
                          <div key={i} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connect CTA Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleConnectOAuth(pId)}
                      aria-label={`Connect or authenticate with ${cfg.name}`}
                      style={{
                        backgroundColor: connectedAcc ? "#F8FAFC" : cfg.brandColor,
                        color: connectedAcc ? "#1E293B" : "#FFFFFF",
                        borderColor: connectedAcc ? "#E2E8F0" : cfg.brandColor,
                      }}
                      className={cn(
                        "tap-press min-h-[44px] flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-2xs hover:opacity-95 focus-visible:ring-2 focus-visible:ring-blue-500"
                      )}
                    >
                      <span>{connectedAcc ? `Reconnect ${cfg.name}` : `Connect with ${cfg.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {connectedAcc && (
                      <button
                        onClick={() => handleDisconnect(connectedAcc.id)}
                        aria-label={`Disconnect ${cfg.name}`}
                        className="tap-press min-h-[44px] px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                      >
                        Unlink
                      </button>
                    )}
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: Direct Platform Credentials */}
      {activeTab === "direct" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Telegram Bot (Instant, Free, No App Review) */}
            <GlassPanel className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Telegram Channel / Group</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                        Zero Approvals Needed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct broadcast messages to any public channel or group via BotFather.
                    </p>
                  </div>
                </div>
                <PlatformBadge platform="telegram" size="sm" showLabel={false} />
              </div>

              {/* Step-by-step instructions */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>How to connect in 60 seconds:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-slate-600">
                  <li>Open Telegram and message <strong>@BotFather</strong> to create a new bot and get your token.</li>
                  <li>Add your new bot as an <strong>Administrator</strong> to your target Channel or Group.</li>
                  <li>Enter the Bot Token and your Channel username below (e.g. <code>@MyBrandAlerts</code>).</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Bot Token (from @BotFather)
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.telegram ? "text" : "password"}
                      placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRstuvwxYZ"
                      value={credentials.telegramBotToken || ""}
                      onChange={(e) => updateCredential("telegramBotToken", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowToken("telegram")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showTokens.telegram ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Channel / Chat ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @MyChannelUsername or -100123456789"
                    value={credentials.telegramChatId || ""}
                    onChange={(e) => updateCredential("telegramChatId", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClearCredentials("telegram")}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>

                <button
                  onClick={() => handleVerify("telegram")}
                  disabled={verifyingPlatform === "telegram" || !credentials.telegramBotToken}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "telegram" && "animate-spin")} />
                  <span>Test &amp; Connect Telegram</span>
                </button>
              </div>
            </GlassPanel>

            {/* 2. Twitter / X API v2 */}
            <GlassPanel className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-300">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">X / Twitter API v2</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-300">
                        OAuth 2.0 / Bearer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish posts, read mentions, and monitor user timelines.
                    </p>
                  </div>
                </div>
                <PlatformBadge platform="x" size="sm" showLabel={false} />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Developer Portal Scopes Required:</span>
                  <a
                    href="https://developer.twitter.com/en/portal/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Developer Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  tweet.read, tweet.write, users.read
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    User Access Token or Bearer Token
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.x ? "text" : "password"}
                      placeholder="Paste your Twitter API User Bearer/Access Token..."
                      value={credentials.twitterBearerToken || ""}
                      onChange={(e) => updateCredential("twitterBearerToken", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowToken("x")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showTokens.x ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClearCredentials("x")}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>

                <button
                  onClick={() => handleVerify("x")}
                  disabled={verifyingPlatform === "x" || !credentials.twitterBearerToken}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "x" && "animate-spin")} />
                  <span>Test &amp; Connect X</span>
                </button>
              </div>
            </GlassPanel>

            {/* 3. LinkedIn REST API */}
            <GlassPanel className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">LinkedIn REST API</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        Member &amp; Organization
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish posts to personal profiles and organization company pages.
                    </p>
                  </div>
                </div>
                <PlatformBadge platform="linkedin" size="sm" showLabel={false} />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Required Scopes:</span>
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>LinkedIn Developers</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  w_member_social, openid, profile, email
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    LinkedIn Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.linkedin ? "text" : "password"}
                      placeholder="Paste your LinkedIn OAuth 2.0 Access Token..."
                      value={credentials.linkedinAccessToken || ""}
                      onChange={(e) => updateCredential("linkedinAccessToken", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowToken("linkedin")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showTokens.linkedin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Author URN
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. urn:li:person:YOUR_ID or urn:li:organization:YOUR_ORG_ID"
                    value={credentials.linkedinAuthorUrn || ""}
                    onChange={(e) => updateCredential("linkedinAuthorUrn", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClearCredentials("linkedin")}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>

                <button
                  onClick={() => handleVerify("linkedin")}
                  disabled={verifyingPlatform === "linkedin" || !credentials.linkedinAccessToken}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "linkedin" && "animate-spin")} />
                  <span>Test &amp; Connect LinkedIn</span>
                </button>
              </div>
            </GlassPanel>

            {/* 4. Meta / Facebook Pages & Instagram */}
            <GlassPanel className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Meta Graph API</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                        Facebook &amp; Instagram
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish posts to Facebook Business Pages and linked Instagram accounts.
                    </p>
                  </div>
                </div>
                <PlatformBadge platform="facebook" size="sm" showLabel={false} />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Token Generator:</span>
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Graph API Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  pages_manage_posts, pages_read_engagement
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Page Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.facebook ? "text" : "password"}
                      placeholder="Paste your Meta Page Access Token..."
                      value={credentials.metaPageAccessToken || ""}
                      onChange={(e) => updateCredential("metaPageAccessToken", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowToken("facebook")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showTokens.facebook ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Facebook Page ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 109283746501928"
                    value={credentials.metaPageId || ""}
                    onChange={(e) => updateCredential("metaPageId", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClearCredentials("facebook")}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>

                <button
                  onClick={() => handleVerify("facebook")}
                  disabled={verifyingPlatform === "facebook" || !credentials.metaPageAccessToken}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "facebook" && "animate-spin")} />
                  <span>Test &amp; Connect Meta</span>
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}

      {/* TAB 2: Ayrshare Unified API */}
      {activeTab === "ayrshare" && (
        <GlassPanel className="p-6 border-slate-200 bg-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 shadow-xs">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Ayrshare Unified Social API</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    Recommended for SaaS
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  1 single API key automatically connects and publishes to X, LinkedIn, Facebook, Instagram, TikTok, YouTube, and Threads without requiring individual app reviews.
                </p>
              </div>
            </div>

            <a
              href="https://app.ayrshare.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 self-start md:self-auto"
            >
              <span>Get Ayrshare API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 block">
              Enter your Ayrshare API Key
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showTokens.ayrshare ? "text" : "password"}
                  placeholder="Paste Ayrshare API Key (e.g. 5D9F2-XXXX-XXXX-XXXX)"
                  value={credentials.ayrshareApiKey || ""}
                  onChange={(e) => updateCredential("ayrshareApiKey", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => toggleShowToken("ayrshare")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showTokens.ayrshare ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => handleVerify("ayrshare")}
                disabled={verifyingPlatform === "ayrshare" || !credentials.ayrshareApiKey}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCw className={cn("w-4 h-4", verifyingPlatform === "ayrshare" && "animate-spin")} />
                <span>Verify Ayrshare Key</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              When configured, the Content Studio Composer will automatically dispatch live cross-platform broadcasts through your Ayrshare account.
            </p>
          </div>
        </GlassPanel>
      )}

      {/* TAB 3: .env.local Configuration Snippet */}
      {activeTab === "env" && (
        <GlassPanel className="p-6 border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Server Environment Variables Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prefer storing API keys in your server environment rather than the browser? Add these keys to your <code>.env.local</code> file in the project root:
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl text-slate-100 font-mono text-xs overflow-x-auto shadow-inner space-y-1.5 leading-relaxed">
            <div className="text-slate-400"># OmniSocial Studio Real API Credentials</div>
            <div>AYRSHARE_API_KEY=&quot;&quot;</div>
            <div className="text-slate-400"># Direct Telegram Bot</div>
            <div>TELEGRAM_BOT_TOKEN=&quot;&quot;</div>
            <div>TELEGRAM_CHAT_ID=&quot;@YourChannel&quot;</div>
            <div className="text-slate-400"># Direct Twitter / X API v2</div>
            <div>TWITTER_BEARER_TOKEN=&quot;&quot;</div>
            <div className="text-slate-400"># Direct LinkedIn API</div>
            <div>LINKEDIN_ACCESS_TOKEN=&quot;&quot;</div>
            <div>LINKEDIN_AUTHOR_URN=&quot;urn:li:person:YOUR_ID&quot;</div>
            <div className="text-slate-400"># Direct Meta Graph API</div>
            <div>META_PAGE_ACCESS_TOKEN=&quot;&quot;</div>
            <div>META_PAGE_ID=&quot;&quot;</div>
          </div>
        </GlassPanel>
      )}

      {/* Active Connected Accounts Fleet Details */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Connected Channels for {currentWorkspace.name}
            </h3>
            <p className="text-xs text-slate-500">
              Accounts authorized to publish content and monitor engagement.
            </p>
          </div>
        </div>

        {accounts.length === 0 ? (
          <GlassPanel className="p-8 text-center border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">No Social Accounts Linked Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Select an option above (like Telegram or Ayrshare) and enter your API keys to link your live accounts.
            </p>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <GlassPanel key={acc.id} className="p-4 space-y-3 border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={acc.accountAvatar}
                      alt={acc.accountName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900 leading-tight">{acc.accountName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{acc.accountHandle}</div>
                    </div>
                  </div>
                  <PlatformBadge platform={acc.platform} size="sm" showLabel={false} />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">API Status</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active &amp; Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Audience</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatNumber(acc.followersCount)} followers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Live Latency</span>
                    <span className="font-mono text-emerald-700 font-semibold">{acc.latencyMs} ms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    disabled={pingingId === acc.id}
                    onClick={() => handleTestPing(acc)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className={cn("w-3 h-3", pingingId === acc.id && "animate-spin")} />
                    <span>Ping Live API</span>
                  </button>

                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
