import { PlatformCredentials, VerificationResult, PublishResult } from "./credentials";

/**
 * Real Server-side Platform Dispatcher and Verifier
 */

export async function verifyTelegram(
  botToken: string,
  chatId?: string
): Promise<VerificationResult> {
  const start = Date.now();
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
      method: "GET",
    });
    const data = await res.json();
    const latencyMs = Date.now() - start;

    if (!data.ok) {
      return {
        ok: false,
        platform: "telegram",
        error: data.description || "Telegram Bot Token rejected by Telegram API",
        latencyMs,
      };
    }

    const botUser = data.result;
    return {
      ok: true,
      platform: "telegram",
      accountName: botUser.first_name || "Telegram Bot",
      accountHandle: `@${botUser.username || "unknown"}`,
      details: {
        id: botUser.id,
        isBot: botUser.is_bot,
        canJoinGroups: botUser.can_join_groups,
        targetChat: chatId || "Not specified yet",
      },
      latencyMs,
    };
  } catch (err: any) {
    return {
      ok: false,
      platform: "telegram",
      error: err.message || "Failed to reach Telegram API",
      latencyMs: Date.now() - start,
    };
  }
}

export async function publishToTelegram(
  botToken: string,
  chatId: string,
  text: string
): Promise<PublishResult> {
  const now = new Date().toISOString();
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
    const data = await res.json();

    if (!data.ok) {
      return {
        platform: "telegram",
        success: false,
        error: data.description || "Telegram API rejected the broadcast message",
        timestamp: now,
      };
    }

    const msgId = data.result?.message_id;
    return {
      platform: "telegram",
      success: true,
      postId: String(msgId),
      postUrl: chatId.startsWith("@") ? `https://t.me/${chatId.replace("@", "")}/${msgId}` : undefined,
      timestamp: now,
    };
  } catch (err: any) {
    return {
      platform: "telegram",
      success: false,
      error: err.message || "Failed to deliver message to Telegram",
      timestamp: now,
    };
  }
}

export async function verifyAyrshare(apiKey: string): Promise<VerificationResult> {
  const start = Date.now();
  try {
    const res = await fetch("https://app.ayrshare.com/api/profiles", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const data = await res.json();
    const latencyMs = Date.now() - start;

    if (data.status === "error" || data.error) {
      return {
        ok: false,
        platform: "ayrshare",
        error: data.message || data.error || "Ayrshare API key authentication failed",
        latencyMs,
      };
    }

    const activePlatforms = data.activeSocialAccounts || data.profiles || [];
    return {
      ok: true,
      platform: "ayrshare",
      accountName: data.title || "Ayrshare Unified Hub",
      accountHandle: `@${data.profileKey || "workspace"}`,
      details: {
        connectedPlatforms: activePlatforms,
        quota: data.quota || "Standard",
      },
      latencyMs,
    };
  } catch (err: any) {
    return {
      ok: false,
      platform: "ayrshare",
      error: err.message || "Failed to reach Ayrshare API",
      latencyMs: Date.now() - start,
    };
  }
}

export async function publishToAyrshare(
  apiKey: string,
  platforms: string[],
  post: string,
  mediaUrls?: string[]
): Promise<PublishResult[]> {
  const now = new Date().toISOString();
  try {
    const res = await fetch("https://app.ayrshare.com/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        post,
        platforms,
        mediaUrls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : undefined,
      }),
    });
    const data = await res.json();

    if (data.status === "error") {
      return platforms.map((p) => ({
        platform: p,
        success: false,
        error: data.message || "Ayrshare post dispatch failed",
        timestamp: now,
      }));
    }

    return (data.postIds || []).map((item: any) => ({
      platform: item.platform,
      success: item.status === "success",
      postId: item.id,
      postUrl: item.postUrl,
      error: item.status !== "success" ? item.message : undefined,
      timestamp: now,
    }));
  } catch (err: any) {
    return platforms.map((p) => ({
      platform: p,
      success: false,
      error: err.message || "Failed to connect to Ayrshare",
      timestamp: now,
    }));
  }
}

export async function verifyTwitter(bearerToken: string): Promise<VerificationResult> {
  const start = Date.now();
  try {
    const res = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics", {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    const latencyMs = Date.now() - start;
    const data = await res.json();

    if (!res.ok || data.errors) {
      const msg = data.errors?.[0]?.message || data.detail || `Twitter API returned ${res.status}`;
      return {
        ok: false,
        platform: "x",
        error: msg,
        latencyMs,
      };
    }

    return {
      ok: true,
      platform: "x",
      accountName: data.data?.name || "X Account",
      accountHandle: `@${data.data?.username || "unknown"}`,
      avatarUrl: data.data?.profile_image_url,
      details: {
        id: data.data?.id,
        followersCount: data.data?.public_metrics?.followers_count,
        followingCount: data.data?.public_metrics?.following_count,
      },
      latencyMs,
    };
  } catch (err: any) {
    return {
      ok: false,
      platform: "x",
      error: err.message || "Network error connecting to Twitter API v2",
      latencyMs: Date.now() - start,
    };
  }
}

export async function publishToTwitter(bearerToken: string, text: string): Promise<PublishResult> {
  const now = new Date().toISOString();
  try {
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    if (!res.ok || data.errors) {
      return {
        platform: "x",
        success: false,
        error: data.errors?.[0]?.message || data.detail || `HTTP ${res.status}: ${res.statusText}`,
        timestamp: now,
      };
    }

    const tweetId = data.data?.id;
    return {
      platform: "x",
      success: true,
      postId: tweetId,
      postUrl: tweetId ? `https://x.com/i/web/status/${tweetId}` : undefined,
      timestamp: now,
    };
  } catch (err: any) {
    return {
      platform: "x",
      success: false,
      error: err.message || "Failed to publish tweet via X API v2",
      timestamp: now,
    };
  }
}

export async function verifyLinkedIn(accessToken: string): Promise<VerificationResult> {
  const start = Date.now();
  try {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const latencyMs = Date.now() - start;
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        ok: false,
        platform: "linkedin",
        error: data.message || `LinkedIn API error: ${res.status} ${res.statusText}`,
        latencyMs,
      };
    }

    return {
      ok: true,
      platform: "linkedin",
      accountName: data.name || `${data.given_name || ""} ${data.family_name || ""}`.trim() || "LinkedIn Member",
      accountHandle: data.sub ? `@user_${data.sub.slice(0, 8)}` : "@linkedin_user",
      avatarUrl: data.picture,
      details: {
        sub: data.sub,
        email: data.email,
      },
      latencyMs,
    };
  } catch (err: any) {
    return {
      ok: false,
      platform: "linkedin",
      error: err.message || "Failed to connect to LinkedIn API",
      latencyMs: Date.now() - start,
    };
  }
}

export async function publishToLinkedIn(
  accessToken: string,
  authorUrn: string,
  text: string
): Promise<PublishResult> {
  const now = new Date().toISOString();
  try {
    const body = {
      author: authorUrn.startsWith("urn:li:") ? authorUrn : `urn:li:person:${authorUrn}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        platform: "linkedin",
        success: false,
        error: data.message || `LinkedIn HTTP ${res.status}: ${res.statusText}`,
        timestamp: now,
      };
    }

    const urn = data.id || "";
    return {
      platform: "linkedin",
      success: true,
      postId: urn,
      postUrl: urn ? `https://www.linkedin.com/feed/update/${urn}` : undefined,
      timestamp: now,
    };
  } catch (err: any) {
    return {
      platform: "linkedin",
      success: false,
      error: err.message || "Failed to publish post to LinkedIn",
      timestamp: now,
    };
  }
}

export async function verifyMetaPage(pageAccessToken: string, pageId?: string): Promise<VerificationResult> {
  const start = Date.now();
  try {
    const target = pageId ? `${pageId}?fields=id,name,picture` : "me?fields=id,name,picture";
    const res = await fetch(`https://graph.facebook.com/v19.0/${target}&access_token=${pageAccessToken}`);
    const latencyMs = Date.now() - start;
    const data = await res.json();

    if (data.error) {
      return {
        ok: false,
        platform: "facebook",
        error: data.error.message || "Meta Graph API token error",
        latencyMs,
      };
    }

    return {
      ok: true,
      platform: "facebook",
      accountName: data.name || "Facebook Page",
      accountHandle: `@page_${data.id}`,
      avatarUrl: data.picture?.data?.url,
      details: {
        pageId: data.id,
      },
      latencyMs,
    };
  } catch (err: any) {
    return {
      ok: false,
      platform: "facebook",
      error: err.message || "Failed to connect to Meta Graph API",
      latencyMs: Date.now() - start,
    };
  }
}

export async function publishToFacebookPage(
  pageAccessToken: string,
  pageId: string,
  message: string
): Promise<PublishResult> {
  const now = new Date().toISOString();
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: pageAccessToken,
      }),
    });
    const data = await res.json();

    if (data.error) {
      return {
        platform: "facebook",
        success: false,
        error: data.error.message || "Facebook Graph API post error",
        timestamp: now,
      };
    }

    const postId = data.id;
    return {
      platform: "facebook",
      success: true,
      postId,
      postUrl: postId ? `https://facebook.com/${postId}` : undefined,
      timestamp: now,
    };
  } catch (err: any) {
    return {
      platform: "facebook",
      success: false,
      error: err.message || "Failed to publish post to Facebook",
      timestamp: now,
    };
  }
}
