"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PlatformId, WorkspaceId } from "@/types";
import { OAUTH_PLATFORM_CONFIGS } from "@/lib/social/oauth";
import { ShieldCheck, Lock, ArrowRight, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { getStoredRealCredentials } from "@/lib/social/credentials";

function OAuthConsentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const platform = (searchParams.get("platform") || "x") as PlatformId;
  const workspaceId = (searchParams.get("workspace") || "acme-cloud") as WorkspaceId;
  const config = OAUTH_PLATFORM_CONFIGS[platform] || OAUTH_PLATFORM_CONFIGS.x;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to create a real Ayrshare Link Session for authentic multi-network OAuth
    async function initRealLinkSession() {
      try {
        const creds = getStoredRealCredentials(workspaceId);
        const res = await fetch("/api/social/ayrshare/link-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: creds.ayrshareApiKey,
            allowedSocial: platform === "x" ? ["twitter"] : [platform],
            redirectUrl: `${window.location.origin}/?tab=social_accounts&ayrshare_linked=true`,
          }),
        });

        const data = await res.json();
        if (data.ok && data.url) {
          // Redirect directly to the real Ayrshare SSO OAuth URL
          window.location.href = data.url;
        } else {
          setIsLoading(false);
          setError(
            data.error ||
              "Ayrshare API Key is required to launch real social OAuth. Please configure your key in Social Accounts settings."
          );
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || "Failed to initialize secure social linking session.");
      }
    }

    initRealLinkSession();
  }, [platform, workspaceId]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-500/20">
      <div className="w-full max-w-md bg-slate-800/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg"
          style={{ backgroundColor: config.brandColor }}
        >
          {platform === "x" && "𝕏"}
          {platform === "linkedin" && "in"}
          {platform === "instagram" && "IG"}
          {platform === "facebook" && "f"}
          {platform === "youtube" && "▶"}
          {platform === "tiktok" && "TT"}
          {platform === "threads" && "@"}
          {platform === "telegram" && "✈"}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Authentic {config.name} Linking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            OmniSocial uses Ayrshare&apos;s enterprise social gateway for live OAuth 2.0 handshakes without mock data.
          </p>
        </div>

        {isLoading ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
            <div className="text-xs font-semibold text-slate-200">
              Initializing Secure OAuth Gateway...
            </div>
            <p className="text-[11px] text-slate-400">
              Connecting to Ayrshare SSO session for {config.name}.
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-amber-200">
                  Ayrshare API Key Needed
                </div>
                <p className="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => router.push("/?tab=social_accounts")}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Go to Social Accounts Settings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://www.ayrshare.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Get Free Ayrshare API Key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>TLS 1.3 · Official Ayrshare API Gateway</span>
        </div>
      </div>
    </div>
  );
}

export default function OAuthProviderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
          Loading OAuth Gateway...
        </div>
      }
    >
      <OAuthConsentContent />
    </Suspense>
  );
}
