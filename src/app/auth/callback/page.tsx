"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PlatformId, WorkspaceId } from "@/types";
import { OAUTH_PLATFORM_CONFIGS } from "@/lib/social/oauth";
import { CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { getStoredRealCredentials } from "@/lib/social/credentials";
import { saveConnectedAccount } from "@/lib/data/storage";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const platform = (searchParams.get("platform") || "x") as PlatformId;
  const workspaceId = (searchParams.get("workspace") || "acme-cloud") as WorkspaceId;
  const config = OAUTH_PLATFORM_CONFIGS[platform] || OAUTH_PLATFORM_CONFIGS.x;

  const [statusText, setStatusText] = useState("Syncing connected social accounts...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function syncAccounts() {
      try {
        const creds = getStoredRealCredentials(workspaceId);
        const res = await fetch("/api/social/ayrshare/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: creds.ayrshareApiKey,
            workspaceId,
          }),
        });

        const data = await res.json();
        if (data.ok && Array.isArray(data.accounts)) {
          // Save all synced real accounts to localStorage
          data.accounts.forEach((acc: any) => {
            saveConnectedAccount(acc);
          });
          setStatusText(`Successfully synced ${data.accounts.length} social channels! Redirecting...`);
          setTimeout(() => {
            router.push(`/?tab=social_accounts&synced=${data.accounts.length}`);
          }, 800);
        } else {
          // If no accounts yet or key missing, redirect back with feedback
          setTimeout(() => {
            router.push(`/?tab=social_accounts&status=checked`);
          }, 1000);
        }
      } catch (err: any) {
        setError(err.message || "Failed to sync accounts from social gateway.");
        setTimeout(() => {
          router.push("/?tab=social_accounts");
        }, 1500);
      }
    }

    syncAccounts();
  }, [workspaceId, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-blue-600/20 antialiased text-white">
      <div className="w-full max-w-md bg-slate-800/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg"
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

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Authenticating Social Gateway</h2>
          <p className="text-xs text-slate-400">
            Confirming permissions with Ayrshare official OAuth 2.0 gateway.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3">
          {error ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
          )}
          <span className="text-xs font-medium text-slate-200">
            {error || statusText}
          </span>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>OAuth 2.0 PKCE Session Completed</span>
        </div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
          Completing Social Authentication...
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
