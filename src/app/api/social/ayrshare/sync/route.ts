import { NextRequest, NextResponse } from "next/server";
import { ConnectedAccount, PlatformId, WorkspaceId } from "@/types";

/**
 * Normalizes Ayrshare platform name to OmniSocial PlatformId
 */
function mapAyrsharePlatform(platform: string): PlatformId {
  const p = platform.toLowerCase();
  if (p === "twitter" || p === "x") return "x";
  if (p === "facebook") return "facebook";
  if (p === "instagram") return "instagram";
  if (p === "linkedin") return "linkedin";
  if (p === "youtube") return "youtube";
  if (p === "tiktok") return "tiktok";
  if (p === "threads") return "threads";
  if (p === "telegram") return "telegram";
  return "x";
}

/**
 * Syncs real connected social accounts from Ayrshare.
 * Calls official Ayrshare endpoint: GET https://api.ayrshare.com/api/user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      apiKey: clientApiKey,
      profileKey,
      workspaceId = "acme-cloud",
    } = body as {
      apiKey?: string;
      profileKey?: string;
      workspaceId?: WorkspaceId;
    };

    const apiKey = (clientApiKey || process.env.AYRSHARE_API_KEY || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ayrshare API Key is required. Please provide your API key or configure AYRSHARE_API_KEY in your environment.",
          requiresApiKey: true,
        },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    };

    if (profileKey) {
      headers["Profile-Key"] = profileKey;
    }

    const res = await fetch("https://api.ayrshare.com/api/user", {
      method: "GET",
      headers,
    });

    const data = await res.json();

    if (!res.ok || data.status === "error") {
      return NextResponse.json(
        {
          ok: false,
          error:
            data.message ||
            data.error ||
            `Ayrshare API returned status ${res.status}: ${res.statusText}`,
        },
        { status: res.status }
      );
    }

    // data.activeSocialAccounts is an array of active platform keys e.g. ["twitter", "linkedin", "facebook"]
    const rawActive: string[] = data.activeSocialAccounts || [];

    // data.displayNames is an array of { platform, displayName, id, created }
    const displayNamesList: Array<{
      platform: string;
      displayName: string;
      id?: string;
    }> = Array.isArray(data.displayNames) ? data.displayNames : [];

    const displayNamesMap = new Map<string, string>();
    displayNamesList.forEach((item) => {
      if (item && item.platform && item.displayName) {
        displayNamesMap.set(item.platform.toLowerCase(), item.displayName);
      }
    });

    // Transform into OmniSocial ConnectedAccount fleet
    const syncedAccounts: ConnectedAccount[] = rawActive.map((platformKey) => {
      const pId = mapAyrsharePlatform(platformKey);
      const rawLower = platformKey.toLowerCase();
      const displayName = displayNamesMap.get(rawLower) || `${platformKey.toUpperCase()} Account`;
      const cleanHandle = displayName.startsWith("@") ? displayName : `@${displayName.replace(/\s+/g, "").toLowerCase()}`;

      const avatarUrl = data.profileImageUrls?.[rawLower] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80";

      return {
        id: `ayr-${rawLower}-${workspaceId}`,
        workspaceId,
        platform: pId,
        accountHandle: cleanHandle,
        accountName: displayName,
        accountAvatar: avatarUrl,
        status: "active",
        followersCount: 0,
        latencyMs: 38,
        connectedAt: new Date().toISOString(),
        scopes: ["read", "write", "publish", "analytics"],
      };
    });

    return NextResponse.json({
      ok: true,
      activeSocialAccounts: rawActive,
      accountCount: syncedAccounts.length,
      accounts: syncedAccounts,
      profileKey: data.profileKey,
      title: data.title,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Failed to sync accounts from Ayrshare",
      },
      { status: 500 }
    );
  }
}
