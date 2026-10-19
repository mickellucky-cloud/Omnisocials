import { NextRequest, NextResponse } from "next/server";
import {
  publishToTelegram,
  publishToAyrshare,
  publishToTwitter,
  publishToLinkedIn,
  publishToFacebookPage,
} from "@/lib/social/realSocialClients";
import { PlatformCredentials, PublishResult } from "@/lib/social/credentials";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platforms,
      text,
      mediaUrls,
      credentials,
    } = body as {
      platforms: string[];
      text: string;
      mediaUrls?: string[];
      credentials?: PlatformCredentials;
    };

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: "At least one target platform must be specified" },
        { status: 400 }
      );
    }

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Post copy cannot be empty" },
        { status: 400 }
      );
    }

    const results: PublishResult[] = [];
    const now = new Date().toISOString();

    // Check if Ayrshare API key is provided and can handle multi-network publishing
    const ayrshareKey = credentials?.ayrshareApiKey || process.env.AYRSHARE_API_KEY;
    const ayrshareEligible = ["x", "twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube", "threads"];
    
    // We categorize platforms into Ayrshare-handled (if key exists) vs direct platform handled
    for (const platform of platforms) {
      const lower = platform.toLowerCase();

      // 1. Telegram is always direct via bot API
      if (lower === "telegram") {
        const token = credentials?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = credentials?.telegramChatId || process.env.TELEGRAM_CHAT_ID;
        if (!token || !chatId) {
          results.push({
            platform: "telegram",
            success: false,
            error: "Missing Telegram Bot Token or Chat ID. Configure in Social Accounts.",
            timestamp: now,
          });
        } else {
          const res = await publishToTelegram(token, chatId, text);
          results.push(res);
        }
        continue;
      }

      // 2. If Ayrshare is configured and platform is supported by Ayrshare:
      if (ayrshareKey && ayrshareEligible.includes(lower)) {
        // Map platform name to Ayrshare format (e.g. 'x' -> 'twitter')
        const mapped = lower === "x" ? "twitter" : lower;
        const ayrResults = await publishToAyrshare(ayrshareKey, [mapped], text, mediaUrls);
        if (ayrResults.length > 0) {
          results.push({
            ...ayrResults[0],
            platform: lower, // retain original platform id
          });
          continue;
        }
      }

      // 3. Direct Platform Handlers
      if (lower === "x") {
        const token = credentials?.twitterBearerToken || process.env.TWITTER_BEARER_TOKEN;
        if (!token) {
          results.push({
            platform: "x",
            success: false,
            error: "No X API Bearer Token configured. Add your token in Social Accounts.",
            timestamp: now,
          });
        } else {
          const res = await publishToTwitter(token, text);
          results.push(res);
        }
      } else if (lower === "linkedin") {
        const token = credentials?.linkedinAccessToken || process.env.LINKEDIN_ACCESS_TOKEN;
        const authorUrn = credentials?.linkedinAuthorUrn || process.env.LINKEDIN_AUTHOR_URN;
        if (!token || !authorUrn) {
          results.push({
            platform: "linkedin",
            success: false,
            error: "Missing LinkedIn Access Token or Author URN. Configure in Social Accounts.",
            timestamp: now,
          });
        } else {
          const res = await publishToLinkedIn(token, authorUrn, text);
          results.push(res);
        }
      } else if (lower === "facebook") {
        const token = credentials?.metaPageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;
        const pageId = credentials?.metaPageId || process.env.META_PAGE_ID;
        if (!token || !pageId) {
          results.push({
            platform: "facebook",
            success: false,
            error: "Missing Facebook Page Access Token or Page ID. Configure in Social Accounts.",
            timestamp: now,
          });
        } else {
          const res = await publishToFacebookPage(token, pageId, text);
          results.push(res);
        }
      } else {
        // Fallback for networks that require Ayrshare or OAuth approval
        results.push({
          platform: lower,
          success: false,
          error: `Real live delivery for '${platform}' requires either an Ayrshare API Key or Direct API credentials configured in Social Accounts.`,
          timestamp: now,
        });
      }
    }

    const overallSuccess = results.some((r) => r.success);
    return NextResponse.json({
      success: overallSuccess,
      results,
      summary: {
        total: results.length,
        succeeded: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process social publication request" },
      { status: 500 }
    );
  }
}
