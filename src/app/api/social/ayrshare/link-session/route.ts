import { NextRequest, NextResponse } from "next/server";

/**
 * Generates a real Ayrshare SSO Link Session URL.
 * Users open this URL to link their real Twitter/X, LinkedIn, Facebook, Instagram,
 * YouTube, TikTok, and Pinterest accounts via native OAuth.
 *
 * Official Ayrshare API: POST https://api.ayrshare.com/api/profiles/link-sessions
 * Fallback API: POST https://api.ayrshare.com/api/profiles/generateJWT
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      apiKey: clientApiKey,
      profileKey,
      allowedSocial,
      redirectUrl,
    } = body as {
      apiKey?: string;
      profileKey?: string;
      allowedSocial?: string[];
      redirectUrl?: string;
    };

    const apiKey = (clientApiKey || process.env.AYRSHARE_API_KEY || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ayrshare API Key is required. Please enter your Ayrshare API Key in Social Accounts or set AYRSHARE_API_KEY in your environment.",
          requiresApiKey: true,
        },
        { status: 400 }
      );
    }

    const host = req.headers.get("host") || "omnisocials.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;
    const returnRedirect = redirectUrl || `${origin}/?tab=social_accounts&ayrshare_linked=true`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (profileKey) {
      headers["Profile-Key"] = profileKey;
    }

    // Try primary modern endpoint: /profiles/link-sessions
    let sessionUrl: string | null = null;
    let errorMessage: string | null = null;

    try {
      const linkSessionRes = await fetch("https://api.ayrshare.com/api/profiles/link-sessions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          expiresIn: 15,
          redirect: returnRedirect,
          allowedSocial: allowedSocial && allowedSocial.length > 0 ? allowedSocial : undefined,
        }),
      });

      const linkSessionData = await linkSessionRes.json();

      if (linkSessionRes.ok && linkSessionData.url) {
        sessionUrl = linkSessionData.url;
      } else if (linkSessionData.message || linkSessionData.error) {
        errorMessage = linkSessionData.message || linkSessionData.error;
      }
    } catch (err: any) {
      errorMessage = err.message;
    }

    // If link-sessions didn't succeed, try legacy/fallback endpoint: /profiles/generateJWT
    if (!sessionUrl) {
      try {
        const jwtRes = await fetch("https://api.ayrshare.com/api/profiles/generateJWT", {
          method: "POST",
          headers,
          body: JSON.stringify({
            domain: host,
            profileKey: profileKey || undefined,
            redirect: returnRedirect,
          }),
        });

        const jwtData = await jwtRes.json();
        if (jwtRes.ok && jwtData.url) {
          sessionUrl = jwtData.url;
        } else if (!errorMessage && (jwtData.message || jwtData.error)) {
          errorMessage = jwtData.message || jwtData.error;
        }
      } catch (err: any) {
        if (!errorMessage) errorMessage = err.message;
      }
    }

    if (!sessionUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            errorMessage ||
            "Failed to generate Ayrshare Link Session. Please verify your Ayrshare API key.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: sessionUrl,
      expiresInMinutes: 15,
      redirect: returnRedirect,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Internal server error while creating Ayrshare link session",
      },
      { status: 500 }
    );
  }
}
