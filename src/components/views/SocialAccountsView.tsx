"use client";

import React, { useState, useEffect } from "react";
import { Workspace, ConnectedAccount, PlatformId } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { PlatformBadge } from "../ui/PlatformBadge";
import { formatNumber } from "@/lib/utils";
import {
  Share2,
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
import { OAUTH_PLATFORM_CONFIGS } from "@/lib/social/oauth";

interface SocialAccountsViewProps {
  currentWorkspace: Workspace;
  onAccountConnected?: () => void;
}

export const SocialAccountsView: React.FC<SocialAccountsViewProps> = ({
  currentWorkspace,
  onAccountConnected,
}) => {
  const [activeTab, setActiveTab] = useState<"ayrshare" | "telegram" | "direct" | "env">("ayrshare");
  const [credentials, setCredentials] = useState<PlatformCredentials>({});
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<VerificationResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Ayrshare-specific states
  const [isLaunchingSSO, setIsLaunchingSSO] = useState(false);
  const [isSyncingAyrshare, setIsSyncingAyrshare] = useState(false);
  const [ayrshareInputKey, setAyrshareInputKey] = useState("");
  const [isEditingAyrshareKey, setIsEditingAyrshareKey] = useState(false);

  // Accounts list
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [pingingId, setPingingId] = useState<string | null>(null);

  // Load credentials and accounts on mount / workspace change
  useEffect(() => {
    const creds = getStoredRealCredentials(currentWorkspace.id);
    setCredentials(creds);
    setAyrshareInputKey(creds.ayrshareApiKey || "");
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

  // Launch Ayrshare Real SSO Window
  const handleLaunchAyrshareSSO = async (specificPlatform?: string) => {
    const apiKey = (credentials.ayrshareApiKey || ayrshareInputKey || "").trim();
    if (!apiKey) {
      setFeedback("⚠️ Please enter your Ayrshare API Key first to launch the real SSO connection window.");
      setIsEditingAyrshareKey(true);
      return;
    }

    setIsLaunchingSSO(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/social/ayrshare/link-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          allowedSocial: specificPlatform ? (specificPlatform === "x" ? ["twitter"] : [specificPlatform]) : undefined,
          redirectUrl: `${window.location.origin}/?tab=social_accounts&ayrshare_linked=true`,
        }),
      });

      const data = await res.json();
      if (data.ok && data.url) {
        // Open Ayrshare's authentic SSO popup
        const width = 640;
        const height = 760;
        const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
        const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);
        
        window.open(
          data.url,
          "AyrshareSSO",
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );

        setFeedback("✓ Secure Ayrshare SSO session opened! Authenticate your social accounts, then click 'Sync Connected Channels' below.");
      } else {
        setFeedback(`⚠️ ${data.error || "Failed to generate Ayrshare link session. Please check your API key."}`);
      }
    } catch (err: any) {
      setFeedback(`⚠️ Network error: ${err.message || "Failed to reach Ayrshare API"}`);
    } finally {
      setIsLaunchingSSO(false);
    }
  };

  // Sync real accounts from Ayrshare /api/user
  const handleSyncAyrshare = async () => {
    const apiKey = (credentials.ayrshareApiKey || ayrshareInputKey || "").trim();
    if (!apiKey) {
      setFeedback("⚠️ Please enter and save your Ayrshare API Key first.");
      setIsEditingAyrshareKey(true);
      return;
    }

    setIsSyncingAyrshare(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/social/ayrshare/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          workspaceId: currentWorkspace.id,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        if (Array.isArray(data.accounts) && data.accounts.length > 0) {
          data.accounts.forEach((acc: ConnectedAccount) => {
            saveConnectedAccount(acc);
          });
          const freshAccounts = getStoredAccounts(currentWorkspace.id);
          setAccounts(freshAccounts);
          setFeedback(`✓ Successfully synced ${data.accounts.length} live social channels from Ayrshare! (${data.activeSocialAccounts.join(", ")})`);
          if (onAccountConnected) onAccountConnected();
        } else {
          setFeedback("Ayrshare reports 0 active social accounts linked yet. Click 'Launch Real Social Connect (SSO)' above to link your accounts first.");
        }
      } else {
        setFeedback(`⚠️ Ayrshare Sync error: ${data.error || "Failed to sync accounts."}`);
      }
    } catch (err: any) {
      setFeedback(`⚠️ Failed to sync accounts: ${err.message || "Network error"}`);
    } finally {
      setIsSyncingAyrshare(false);
    }
  };

  // Save Ayrshare Key and Verify
  const handleSaveAndVerifyAyrshareKey = async () => {
    const clean = ayrshareInputKey.trim();
    if (!clean) {
      setFeedback("⚠️ Please enter a valid Ayrshare API key.");
      return;
    }

    setVerifyingPlatform("ayrshare");
    setFeedback(null);

    try {
      const res = await fetch("/api/social/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "ayrshare",
          credentials: { ayrshareApiKey: clean },
        }),
      });
      const data: VerificationResult = await res.json();
      setVerificationFeedback(data);

      if (data.ok) {
        updateCredential("ayrshareApiKey", clean);
        setIsEditingAyrshareKey(false);
        setFeedback(`✓ Ayrshare API key verified! Status: Active (${data.latencyMs}ms). Now click 'Sync Connected Channels' or 'Launch Real Social Connect (SSO)'.`);
        // Auto sync after key verification
        handleSyncAyrshare();
      }
    } catch (err: any) {
      setVerificationFeedback({
        ok: false,
        platform: "ayrshare",
        error: err.message || "Failed to verify Ayrshare key",
      });
    } finally {
      setVerifyingPlatform(null);
    }
  };

  // Generic direct verification for Telegram, X, etc.
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
        setFeedback(`✓ Live connection verified for ${platform.toUpperCase()} (${data.accountHandle || data.accountName}) in ${data.latencyMs}ms!`);

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
        setFeedback(`✓ Live ping successful for ${acc.accountHandle}: ${data.latencyMs}ms latency.`);
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
    setFeedback("Account disconnected from active management.");
    if (onAccountConnected) onAccountConnected();
  };

  const handleClearCredentials = (platform: string) => {
    const updated = { ...credentials };
    if (platform === "telegram") {
      delete updated.telegramBotToken;
      delete updated.telegramChatId;
    } else if (platform === "ayrshare") {
      delete updated.ayrshareApiKey;
      setAyrshareInputKey("");
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
                Link and authenticate real social media accounts with Ayrshare SSO, Telegram Bots, and live API keys.
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
            <span className="font-bold text-slate-900">Authentic Social Gateway Architecture: </span>
            <span className="text-slate-600">
              Live OAuth 2.0 authentication powered by Ayrshare SSO (`social-media-api`) and native Telegram bots. Zero simulated forms.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-blue-700 border border-blue-200 shadow-2xs">
            AYRSHARE SSO
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            LIVE BROADCAST
          </span>
        </div>
      </div>

      {/* Integration Options Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ayrshare")}
          className={cn(
            "tap-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs",
            activeTab === "ayrshare"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Globe className="w-4 h-4" />
          <span>Ayrshare Real Social Connect (SSO)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold uppercase tracking-wider">
            Primary
          </span>
        </button>

        <button
          onClick={() => setActiveTab("telegram")}
          className={cn(
            "tap-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs",
            activeTab === "telegram"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Send className="w-4 h-4" />
          <span>Direct Telegram Bot (Instant)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500 text-white font-bold uppercase tracking-wider">
            Free
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
          <span>Direct Developer Tokens (X, LinkedIn, Meta)</span>
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

      {/* TAB 0: Ayrshare Real Social Connect (SSO) */}
      {activeTab === "ayrshare" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ayrshare Hero Header */}
          <GlassPanel className="p-6 border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wider uppercase font-mono">
                    Official Ayrshare Social Gateway
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Multi-Network OAuth 2.0
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Connect Real Social Media Accounts in 1 Click
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  OmniSocial integrates directly with Ayrshare&apos;s Social Media API (`social-media-api`). Launch the secure SSO session to authenticate Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, and Pinterest through official provider OAuth dialogs, then sync your live handles and follower data.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <button
                  onClick={() => handleLaunchAyrshareSSO()}
                  disabled={isLaunchingSSO}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4", isLaunchingSSO && "animate-spin")} />
                  <span>Launch Real Social Connect (SSO)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleSyncAyrshare}
                  disabled={isSyncingAyrshare}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4 text-blue-600", isSyncingAyrshare && "animate-spin")} />
                  <span>↻ Sync Connected Channels</span>
                </button>
              </div>
            </div>

            {/* Ayrshare API Key Configuration Drawer / Inline */}
            <div className="pt-4 border-t border-slate-200/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Ayrshare API Key Status:</span>
                      {credentials.ayrshareApiKey && !isEditingAyrshareKey ? (
                        <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Configured (••••••••{credentials.ayrshareApiKey.slice(-4)})
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-semibold">
                          Required for live linking
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Used to generate link sessions and dispatch real posts. Free tier available.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {credentials.ayrshareApiKey && !isEditingAyrshareKey ? (
                    <button
                      onClick={() => setIsEditingAyrshareKey(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 bg-white"
                    >
                      Update Key
                    </button>
                  ) : null}

                  <a
                    href="https://www.ayrshare.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white flex items-center gap-1.5"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Edit Ayrshare Key Form */}
              {(!credentials.ayrshareApiKey || isEditingAyrshareKey) && (
                <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 space-y-3 animate-in fade-in">
                  <label className="text-xs font-bold text-slate-800 block">
                    Paste your Ayrshare API Key from ayrshare.com
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showTokens.ayrshare ? "text" : "password"}
                        placeholder="Paste Ayrshare API Key (e.g. 5D9F2-XXXX-XXXX-XXXX)"
                        value={ayrshareInputKey}
                        onChange={(e) => setAyrshareInputKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowToken("ayrshare")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showTokens.ayrshare ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={handleSaveAndVerifyAyrshareKey}
                      disabled={verifyingPlatform === "ayrshare" || !ayrshareInputKey.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "ayrshare" && "animate-spin")} />
                      <span>Verify &amp; Save Key</span>
                    </button>

                    {credentials.ayrshareApiKey && (
                      <button
                        onClick={() => setIsEditingAyrshareKey(false)}
                        className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassPanel>

          {/* Supported Platforms Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ayrshare Supported Social Networks
              </h4>
              <span className="text-[11px] text-slate-500">
                Click any network to link directly through Ayrshare SSO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(
                [
                  "x",
                  "linkedin",
                  "instagram",
                  "facebook",
                  "tiktok",
                  "youtube",
                  "threads",
                  "telegram",
                ] as PlatformId[]
              ).map((pId) => {
                const cfg = OAUTH_PLATFORM_CONFIGS[pId];
                const connectedAcc = accounts.find((a) => a.platform === pId);

                return (
                  <GlassPanel
                    key={pId}
                    className="p-4 border-slate-200 bg-white flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                            style={{ backgroundColor: cfg.brandColor }}
                          >
                            {pId === "x" && "𝕏"}
                            {pId === "linkedin" && "in"}
                            {pId === "instagram" && "IG"}
                            {pId === "facebook" && "f"}
                            {pId === "tiktok" && "TT"}
                            {pId === "youtube" && "▶"}
                            {pId === "threads" && "@"}
                            {pId === "telegram" && "✈"}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-tight">
                              {cfg.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {connectedAcc ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {connectedAcc.accountHandle}
                                </span>
                              ) : (
                                "Ready to link"
                              )}
                            </div>
                          </div>
                        </div>

                        {connectedAcc ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase font-mono">
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                            SSO Ready
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {cfg.permissionsDescription[0]}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {connectedAcc ? (
                        <>
                          <button
                            onClick={() => handleTestPing(connectedAcc)}
                            disabled={pingingId === connectedAcc.id}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <RefreshCw className={cn("w-3 h-3 text-blue-600", pingingId === connectedAcc.id && "animate-spin")} />
                            <span>Ping</span>
                          </button>
                          <button
                            onClick={() => handleDisconnect(connectedAcc.id)}
                            className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-colors"
                          >
                            Unlink
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            if (pId === "telegram") {
                              setActiveTab("telegram");
                            } else {
                              handleLaunchAyrshareSSO(pId);
                            }
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>Connect {cfg.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Direct Telegram Bot */}
      {activeTab === "telegram" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GlassPanel className="p-6 border-slate-200 bg-white space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">Telegram Channel &amp; Group Bot</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      100% Free · Zero App Review
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Broadcast instant updates to your Telegram channels and community groups via Telegram Bot API.
                  </p>
                </div>
              </div>
              <PlatformBadge platform="telegram" size="md" showLabel={false} />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>How to connect in 60 seconds:</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                <li>Open Telegram and message <strong>@BotFather</strong> to create a new bot and copy your Bot Token.</li>
                <li>Add your new bot as an <strong>Administrator</strong> to your target Channel or Group.</li>
                <li>Enter the Bot Token and your Channel username below (e.g. <code>@MyBrandChannel</code>) and click Test &amp; Connect.</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Telegram Bot Token (from @BotFather)
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
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "telegram" && "animate-spin")} />
                <span>Test &amp; Connect Telegram</span>
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* TAB 2: Direct Developer Tokens */}
      {activeTab === "direct" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Twitter / X API v2 */}
            <GlassPanel className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-300">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">X / Twitter API v2</h3>
                    <p className="text-xs text-slate-500">Developer Portal Bearer Token</p>
                  </div>
                </div>
                <PlatformBadge platform="x" size="sm" showLabel={false} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  User Bearer/Access Token
                </label>
                <input
                  type={showTokens.x ? "text" : "password"}
                  placeholder="Paste Bearer Token..."
                  value={credentials.twitterBearerToken || ""}
                  onChange={(e) => updateCredential("twitterBearerToken", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClearCredentials("x")}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleVerify("x")}
                  disabled={verifyingPlatform === "x" || !credentials.twitterBearerToken}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "x" && "animate-spin")} />
                  <span>Test &amp; Connect</span>
                </button>
              </div>
            </GlassPanel>

            {/* 2. LinkedIn REST API */}
            <GlassPanel className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">LinkedIn REST API</h3>
                    <p className="text-xs text-slate-500">OAuth Access Token</p>
                  </div>
                </div>
                <PlatformBadge platform="linkedin" size="sm" showLabel={false} />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Access Token
                  </label>
                  <input
                    type={showTokens.linkedin ? "text" : "password"}
                    placeholder="LinkedIn Token..."
                    value={credentials.linkedinAccessToken || ""}
                    onChange={(e) => updateCredential("linkedinAccessToken", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Author URN
                  </label>
                  <input
                    type="text"
                    placeholder="urn:li:person:YOUR_ID"
                    value={credentials.linkedinAuthorUrn || ""}
                    onChange={(e) => updateCredential("linkedinAuthorUrn", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClearCredentials("linkedin")}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleVerify("linkedin")}
                  disabled={verifyingPlatform === "linkedin" || !credentials.linkedinAccessToken}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "linkedin" && "animate-spin")} />
                  <span>Test &amp; Connect</span>
                </button>
              </div>
            </GlassPanel>

            {/* 3. Meta Graph API */}
            <GlassPanel className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Meta Graph API</h3>
                    <p className="text-xs text-slate-500">Facebook Page Access Token</p>
                  </div>
                </div>
                <PlatformBadge platform="facebook" size="sm" showLabel={false} />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Page Token
                  </label>
                  <input
                    type={showTokens.facebook ? "text" : "password"}
                    placeholder="Page Access Token..."
                    value={credentials.metaPageAccessToken || ""}
                    onChange={(e) => updateCredential("metaPageAccessToken", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Page ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 109283746501928"
                    value={credentials.metaPageId || ""}
                    onChange={(e) => updateCredential("metaPageId", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClearCredentials("facebook")}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleVerify("facebook")}
                  disabled={verifyingPlatform === "facebook" || !credentials.metaPageAccessToken}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", verifyingPlatform === "facebook" && "animate-spin")} />
                  <span>Test &amp; Connect</span>
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}

      {/* TAB 3: .env.local Configuration Snippet */}
      {activeTab === "env" && (
        <GlassPanel className="p-6 border-slate-200 bg-white space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Server Environment Variables Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prefer storing API keys in your server environment (Vercel Project Settings) rather than the browser? Add these variables:
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl text-slate-100 font-mono text-xs overflow-x-auto shadow-inner space-y-1.5 leading-relaxed">
            <div className="text-slate-400"># OmniSocial Ayrshare Gateway Key (Recommended)</div>
            <div>AYRSHARE_API_KEY=&quot;your_ayrshare_api_key_here&quot;</div>
            <div className="text-slate-400 pt-2"># Direct Telegram Bot</div>
            <div>TELEGRAM_BOT_TOKEN=&quot;&quot;</div>
            <div>TELEGRAM_CHAT_ID=&quot;@YourChannel&quot;</div>
            <div className="text-slate-400 pt-2"># Direct Developer Tokens</div>
            <div>TWITTER_BEARER_TOKEN=&quot;&quot;</div>
            <div>LINKEDIN_ACCESS_TOKEN=&quot;&quot;</div>
            <div>LINKEDIN_AUTHOR_URN=&quot;urn:li:person:YOUR_ID&quot;</div>
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
              Live accounts authorized to publish content and monitor real engagement.
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
              Click &quot;Launch Real Social Connect (SSO)&quot; or connect a Telegram Bot above to authenticate your real accounts.
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
                      src={acc.accountAvatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80"}
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
