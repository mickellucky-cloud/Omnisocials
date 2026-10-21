import { PlatformId, WorkspaceId, ConnectedAccount } from "@/types";

export interface OAuthConfig {
  platform: PlatformId;
  name: string;
  brandColor: string;
  logoType: string;
  authUrl: string;
  defaultScopes: string[];
  permissionsDescription: string[];
  docUrl: string;
}

export const OAUTH_PLATFORM_CONFIGS: Record<PlatformId, OAuthConfig> = {
  x: {
    platform: "x",
    name: "𝕏 (formerly Twitter)",
    brandColor: "#000000",
    logoType: "x",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    defaultScopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    permissionsDescription: [
      "Read your Tweets and timeline",
      "Publish and schedule Posts on your behalf",
      "View profile follower analytics and engagement velocity",
      "Keep account linked offline with automated token refresh",
    ],
    docUrl: "https://developer.x.com/en/docs/authentication/oauth-2-0",
  },
  linkedin: {
    platform: "linkedin",
    name: "LinkedIn",
    brandColor: "#0A66C2",
    logoType: "linkedin",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    defaultScopes: ["openid", "profile", "w_member_social", "r_organization_social", "w_organization_social"],
    permissionsDescription: [
      "Access your company page profile and member identity",
      "Create, share, and schedule organic professional updates",
      "Retrieve post impression counts and engagement metrics",
    ],
    docUrl: "https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow",
  },
  instagram: {
    platform: "instagram",
    name: "Instagram Professional",
    brandColor: "#E1306C",
    logoType: "instagram",
    authUrl: "https://api.instagram.com/oauth/authorize",
    defaultScopes: ["instagram_basic", "instagram_content_publish", "pages_read_engagement"],
    permissionsDescription: [
      "Publish single-image, carousel, and Reel media assets",
      "Manage comments, mentions, and community discussions",
      "Access Instagram Insights (reach, impressions, saves)",
    ],
    docUrl: "https://developers.facebook.com/docs/instagram-platform/instagram-graph-api",
  },
  facebook: {
    platform: "facebook",
    name: "Facebook Pages",
    brandColor: "#1877F2",
    logoType: "facebook",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    defaultScopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    permissionsDescription: [
      "Manage and schedule posts on your verified business pages",
      "Read page audience insights and engagement analytics",
      "Respond to incoming inbox page comments and messages",
    ],
    docUrl: "https://developers.facebook.com/docs/pages/overview",
  },
  youtube: {
    platform: "youtube",
    name: "YouTube Channel",
    brandColor: "#FF0000",
    logoType: "youtube",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    defaultScopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
    permissionsDescription: [
      "Upload video announcements and YouTube Shorts",
      "View video views, watch time, and subscriber counts",
      "Inspect comment discussions on published videos",
    ],
    docUrl: "https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps",
  },
  telegram: {
    platform: "telegram",
    name: "Telegram Channel / Bot",
    brandColor: "#24A1DE",
    logoType: "telegram",
    authUrl: "https://oauth.telegram.org/auth",
    defaultScopes: ["telegram.channel.admin", "telegram.bot.messages"],
    permissionsDescription: [
      "Dispatch broadcasts and Rich Markdown bulletins to channel",
      "Receive real-time user questions and feedback via bot webhook",
      "Instant 0-latency message verification",
    ],
    docUrl: "https://core.telegram.org/bots/api",
  },
  threads: {
    platform: "threads",
    name: "Threads by Meta",
    brandColor: "#000000",
    logoType: "threads",
    authUrl: "https://threads.net/oauth/authorize",
    defaultScopes: ["threads_basic", "threads_content_publish"],
    permissionsDescription: [
      "Publish text discussions and rich links to Threads",
      "Read replies and conversation threads",
    ],
    docUrl: "https://developers.facebook.com/docs/threads",
  },
  tiktok: {
    platform: "tiktok",
    name: "TikTok for Business",
    brandColor: "#000000",
    logoType: "tiktok",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    defaultScopes: ["user.info.basic", "video.publish", "video.upload"],
    permissionsDescription: [
      "Access your TikTok creator profile and identity",
      "Directly publish short-form video content and carousel clips",
      "Retrieve video views, likes, and viewer retention metrics",
    ],
    docUrl: "https://developers.tiktok.com/doc/login-kit-web",
  },
};

/**
 * Builds the authorization URL for a given platform.
 * If live credentials (like Client ID) are provided in env, returns direct provider URL.
 * Otherwise returns the internal high-fidelity social authentication portal URL.
 */
export function buildOAuthAuthorizationUrl(params: {
  platform: PlatformId;
  workspaceId: WorkspaceId;
  redirectUri?: string;
  customClientId?: string;
}): string {
  const { platform, workspaceId, customClientId } = params;
  const config = OAUTH_PLATFORM_CONFIGS[platform];
  if (!config) return `/auth/oauth-provider?platform=${platform}&workspace=${workspaceId}`;

  // Check if live environment variable or credential has a Client ID
  const envClientId =
    customClientId ||
    (platform === "x" ? process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID : undefined) ||
    (platform === "linkedin" ? process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID : undefined) ||
    (platform === "facebook" || platform === "instagram" ? process.env.NEXT_PUBLIC_META_APP_ID : undefined);

  const state = encodeURIComponent(
    JSON.stringify({
      workspaceId,
      platform,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2, 10),
    })
  );

  // If real OAuth Client ID is supplied, redirect to the real provider OAuth URL
  if (envClientId) {
    const defaultCallback = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "http://localhost:3005/auth/callback";
    const redirectUri = encodeURIComponent(params.redirectUri || defaultCallback);
    const scopes = encodeURIComponent(config.defaultScopes.join(" "));

    if (platform === "x") {
      return `${config.authUrl}?response_type=code&client_id=${envClientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
    }
    if (platform === "linkedin") {
      return `${config.authUrl}?response_type=code&client_id=${envClientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;
    }
    if (platform === "facebook" || platform === "instagram") {
      return `${config.authUrl}?client_id=${envClientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;
    }
  }

  // Otherwise, route to our high-fidelity Social Authentication Portal
  return `/auth/oauth-provider?platform=${platform}&workspace=${workspaceId}&state=${state}`;
}

/**
 * Generates an authenticated ConnectedAccount object upon successful OAuth return.
 */
export function createAuthenticatedAccount(params: {
  platform: PlatformId;
  workspaceId: WorkspaceId;
  handle?: string;
  name?: string;
  avatar?: string;
}): ConnectedAccount {
  const { platform, workspaceId, handle, name, avatar } = params;
  const config = OAUTH_PLATFORM_CONFIGS[platform];

  const defaultAvatar = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80";

  return {
    id: `acc-${platform}-${Date.now()}`,
    workspaceId,
    platform,
    accountHandle: handle || `@${workspaceId}_${platform}`,
    accountName: name || `${workspaceId} (${config?.name || platform.toUpperCase()})`,
    accountAvatar: avatar || defaultAvatar,
    status: "active",
    followersCount: 0,
    latencyMs: 38,
    connectedAt: new Date().toISOString(),
    scopes: config?.defaultScopes || ["read", "write", "publish"],
  };
}
