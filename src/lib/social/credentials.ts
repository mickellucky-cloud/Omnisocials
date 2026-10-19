export interface PlatformCredentials {
  // Unified Ayrshare
  ayrshareApiKey?: string;

  // Telegram
  telegramBotToken?: string;
  telegramChatId?: string;

  // Twitter / X v2
  twitterApiKey?: string;
  twitterApiSecret?: string;
  twitterAccessToken?: string;
  twitterAccessSecret?: string;
  twitterBearerToken?: string;

  // LinkedIn
  linkedinAccessToken?: string;
  linkedinAuthorUrn?: string; // e.g. urn:li:person:xxx or urn:li:organization:xxx

  // Meta (Facebook & Instagram)
  metaPageAccessToken?: string;
  metaPageId?: string;
  instagramAccountId?: string;
}

export interface VerificationResult {
  ok: boolean;
  platform: string;
  accountName?: string;
  accountHandle?: string;
  avatarUrl?: string;
  details?: Record<string, any>;
  error?: string;
  latencyMs?: number;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  timestamp: string;
}

const STORAGE_KEY = "omnisocial_real_credentials_v1";

export function getStoredRealCredentials(workspaceId: string): PlatformCredentials {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${workspaceId}`);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredRealCredentials(workspaceId: string, creds: PlatformCredentials): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${workspaceId}`, JSON.stringify(creds));
  } catch (err) {
    console.error("Failed to save credentials to localStorage", err);
  }
}
