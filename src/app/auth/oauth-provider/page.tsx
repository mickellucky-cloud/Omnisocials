"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PlatformId, WorkspaceId } from "@/types";
import { OAUTH_PLATFORM_CONFIGS } from "@/lib/social/oauth";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

function OAuthConsentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const platform = (searchParams.get("platform") || "x") as PlatformId;
  const workspaceId = (searchParams.get("workspace") || "acme-cloud") as WorkspaceId;
  const state = searchParams.get("state") || "";

  const config = OAUTH_PLATFORM_CONFIGS[platform] || OAUTH_PLATFORM_CONFIGS.x;

  const [accountHandle, setAccountHandle] = useState(
    platform === "x"
      ? "@AcmeCloudHQ"
      : platform === "linkedin"
      ? "acme-cloud-enterprise"
      : platform === "instagram"
      ? "@acmecloudlife"
      : platform === "tiktok"
      ? "@acmecloud_tok"
      : platform === "telegram"
      ? "@AcmeCloud_AnnounceBot"
      : platform === "youtube"
      ? "@AcmeCloudEngineers"
      : platform === "threads"
      ? "@acmecloudlife"
      : `@${workspaceId}_${platform}`
  );

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(config.defaultScopes);

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    const authCode = `oauth_code_${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    setTimeout(() => {
      const callbackUrl = `/auth/callback?platform=${platform}&workspace=${workspaceId}&code=${authCode}&handle=${encodeURIComponent(
        accountHandle
      )}&state=${encodeURIComponent(state)}`;
      router.push(callbackUrl);
    }, 700);
  };

  const handleCancel = () => {
    router.push(`/?tab=social_accounts&cancelled=${platform}`);
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  // Provider-specific visual styling
  const isDarkBranded = platform === "x" || platform === "threads";
  const isLinkedIn = platform === "linkedin";
  const isMeta = platform === "facebook" || platform === "instagram";
  const isTelegram = platform === "telegram";

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 selection:bg-blue-500/20",
        isDarkBranded ? "bg-[#0A0A0C] text-slate-100" : "bg-[#F3F4F6] text-slate-900"
      )}
    >
      {/* Top Brand Provider Navigation Bar */}
      <header
        className={cn(
          "w-full max-w-md mb-4 flex items-center justify-between px-2 text-xs",
          isDarkBranded ? "text-slate-400" : "text-slate-500"
        )}
      >
        <div className="flex items-center gap-1.5 font-semibold">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure OAuth 2.0 Authorization Server</span>
        </div>
        <span className="font-mono text-[11px]">TLS 1.3 · 256-bit</span>
      </header>

      {/* Main Authentic OAuth Card */}
      <div
        className={cn(
          "w-full max-w-md rounded-2xl shadow-xl overflow-hidden border transition-all animate-in fade-in zoom-in-95 duration-200",
          isDarkBranded
            ? "bg-[#16181C] border-white/10 shadow-black/80"
            : "bg-white border-slate-200 shadow-slate-200/50"
        )}
      >
        {/* Social Network Provider Header Banner */}
        <div
          className={cn(
            "p-6 pb-4 border-b flex items-center justify-between",
            isDarkBranded ? "border-white/10 bg-black/40" : "border-slate-100 bg-slate-50/50"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Social Platform Icon Badge */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
              style={{ backgroundColor: config.brandColor }}
            >
              {platform === "x" && "𝕏"}
              {platform === "linkedin" && "in"}
              {platform === "instagram" && "IG"}
              {platform === "facebook" && "f"}
              {platform === "youtube" && "▶"}
              {platform === "telegram" && "✈"}
              {platform === "tiktok" && "TT"}
              {platform === "threads" && "@"}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base leading-tight">{config.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Verified
                </span>
              </div>
              <p className={cn("text-xs mt-0.5", isDarkBranded ? "text-slate-400" : "text-slate-500")}>
                Authorize third-party application access
              </p>
            </div>
          </div>
        </div>

        {/* Application Authorization Request */}
        <div className="p-6 space-y-5">
          {/* App requesting access info */}
          <div
            className={cn(
              "p-3.5 rounded-xl border flex items-center gap-3",
              isDarkBranded ? "bg-white/5 border-white/10" : "bg-blue-50/50 border-blue-100"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs truncate">Omnisocial SaaS Enterprise</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </div>
              <p className={cn("text-[11px] truncate", isDarkBranded ? "text-slate-400" : "text-slate-500")}>
                Enterprise Social Media Management Platform
              </p>
            </div>
          </div>

          {/* Active Account Switcher */}
          <div>
            <label
              className={cn("block text-[11px] font-semibold uppercase tracking-wider mb-1.5", isDarkBranded ? "text-slate-400" : "text-slate-500")}
            >
              Authorizing Account Profile
            </label>
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border text-xs",
                isDarkBranded ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-600 font-bold flex items-center justify-center text-xs">
                  {accountHandle.charAt(1) || "A"}
                </div>
                <div>
                  <input
                    type="text"
                    value={accountHandle}
                    onChange={(e) => setAccountHandle(e.target.value)}
                    className={cn(
                      "bg-transparent font-semibold text-xs outline-none",
                      isDarkBranded ? "text-white" : "text-slate-900"
                    )}
                    placeholder="@your_handle"
                  />
                  <div className={cn("text-[10px]", isDarkBranded ? "text-slate-400" : "text-slate-500")}>
                    Workspace: {workspaceId}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-blue-500 font-medium">Editable</span>
            </div>
          </div>

          {/* Permissions / Scopes Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-[11px] font-semibold uppercase tracking-wider", isDarkBranded ? "text-slate-400" : "text-slate-500")}>
                Requested Permissions & Scopes
              </span>
              <span className="text-[10px] text-emerald-500 font-mono font-bold">Standard Partner Tier</span>
            </div>

            <div className="space-y-2">
              {config.permissionsDescription.map((desc, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors",
                    isDarkBranded ? "bg-white/5 border-white/5" : "bg-slate-50/80 border-slate-100"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className={cn("leading-relaxed", isDarkBranded ? "text-slate-200" : "text-slate-700")}>
                    {desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Isolation Disclaimer */}
          <div
            className={cn(
              "p-3 rounded-xl text-[11px] leading-relaxed flex items-start gap-2",
              isDarkBranded ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"
            )}
          >
            <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
            <span>
              By clicking <strong>Authorize app</strong>, you allow Omnisocial to manage posts and analytics in accordance with {config.name}&apos;s Developer Policy. You can revoke access at any time in your account settings.
            </span>
          </div>

          {/* CTA Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={isAuthorizing}
              className={cn(
                "tap-press min-h-[44px] flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center",
                isDarkBranded
                  ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
              )}
            >
              Cancel
            </button>

            <button
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              style={{
                backgroundColor: isDarkBranded ? "#FFFFFF" : config.brandColor,
                color: isDarkBranded ? "#000000" : "#FFFFFF",
              }}
              className="tap-press min-h-[44px] flex-[1.6] py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
            >
              {isAuthorizing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <span>Authorize app</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div
          className={cn(
            "p-3.5 text-center text-[10px] border-t flex items-center justify-center gap-2",
            isDarkBranded ? "border-white/10 text-slate-500" : "border-slate-100 text-slate-400"
          )}
        >
          <span>Redirect URI: /auth/callback</span>
          <span>·</span>
          <a
            href={config.docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-0.5 text-blue-500"
          >
            OAuth 2.0 Docs <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OAuthProviderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthConsentContent />
    </Suspense>
  );
}
