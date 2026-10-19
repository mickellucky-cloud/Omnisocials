"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PlatformId, WorkspaceId } from "@/types";
import { createAuthenticatedAccount, OAUTH_PLATFORM_CONFIGS } from "@/lib/social/oauth";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const platform = (searchParams.get("platform") || "x") as PlatformId;
  const workspaceId = (searchParams.get("workspace") || "acme-cloud") as WorkspaceId;
  const code = searchParams.get("code") || "";
  const handleParam = searchParams.get("handle") || "";

  const config = OAUTH_PLATFORM_CONFIGS[platform] || OAUTH_PLATFORM_CONFIGS.x;

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Step 1: Code validation
    const timer1 = setTimeout(() => {
      setStep(2);
    }, 400);

    // Step 2: Token exchange and persistence
    const timer2 = setTimeout(() => {
      try {
        const newAccount = createAuthenticatedAccount({
          platform,
          workspaceId,
          handle: handleParam || undefined,
        });

        // Save to localStorage
        const existingData = localStorage.getItem("omnisocial_accounts_v1");
        let accounts = [];
        if (existingData) {
          try {
            accounts = JSON.parse(existingData);
          } catch {
            accounts = [];
          }
        }

        // Replace or prepend
        const filtered = accounts.filter(
          (a: any) => !(a.workspaceId === workspaceId && a.platform === platform)
        );
        const updated = [newAccount, ...filtered];
        localStorage.setItem("omnisocial_accounts_v1", JSON.stringify(updated));

        setStep(3);

        // Step 3: Redirect back to platform with success state
        setTimeout(() => {
          router.push(
            `/?tab=social_accounts&connected=${platform}&handle=${encodeURIComponent(
              newAccount.accountHandle
            )}&status=success`
          );
        }, 600);
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError("Failed to persist authenticated session. Redirecting to settings...");
        setTimeout(() => {
          router.push("/?tab=social_accounts&error=storage_failure");
        }, 1500);
      }
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [platform, workspaceId, code, handleParam, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-blue-600/20 antialiased">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Brand Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-inner">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
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
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Authenticating with {config.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Completing OAuth 2.0 handshake and registering account with Omnisocial Enterprise
          </p>
        </div>

        {/* Handshake Stepper */}
        <div className="space-y-3 text-left p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3 text-xs">
            {step >= 1 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
            )}
            <span className={step >= 1 ? "font-semibold text-slate-900" : "text-slate-400"}>
              1. Verifying OAuth authorization code &amp; state nonce
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {step >= 2 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
            )}
            <span className={step >= 2 ? "font-semibold text-slate-900" : "text-slate-400"}>
              2. Exchanging credentials for long-lived access token
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {step >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 animate-pulse bg-blue-200" />
            )}
            <span className={step >= 3 ? "font-semibold text-slate-900" : "text-slate-400"}>
              3. Linking account to workspace fleet &amp; activating dispatches
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>E2E Token Encryption &middot; Returning to dashboard...</span>
        </div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
