import { NextRequest, NextResponse } from "next/server";
import {
  verifyTelegram,
  verifyAyrshare,
  verifyTwitter,
  verifyLinkedIn,
  verifyMetaPage,
} from "@/lib/social/realSocialClients";
import { PlatformCredentials, VerificationResult } from "@/lib/social/credentials";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, credentials } = body as {
      platform: string;
      credentials?: PlatformCredentials;
    };

    if (!platform) {
      return NextResponse.json(
        { ok: false, error: "Platform name is required (e.g. 'telegram', 'ayrshare', 'x', 'linkedin', 'facebook')" },
        { status: 400 }
      );
    }

    let result: VerificationResult;

    switch (platform) {
      case "telegram": {
        const token = credentials?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = credentials?.telegramChatId || process.env.TELEGRAM_CHAT_ID;
        if (!token) {
          return NextResponse.json({
            ok: false,
            platform: "telegram",
            error: "No Telegram Bot Token provided. Enter your Bot Token from @BotFather.",
          });
        }
        result = await verifyTelegram(token, chatId);
        break;
      }

      case "ayrshare": {
        const apiKey = credentials?.ayrshareApiKey || process.env.AYRSHARE_API_KEY;
        if (!apiKey) {
          return NextResponse.json({
            ok: false,
            platform: "ayrshare",
            error: "No Ayrshare API Key provided. Enter your key from app.ayrshare.com.",
          });
        }
        result = await verifyAyrshare(apiKey);
        break;
      }

      case "x": {
        const token = credentials?.twitterBearerToken || process.env.TWITTER_BEARER_TOKEN;
        if (!token) {
          return NextResponse.json({
            ok: false,
            platform: "x",
            error: "No X/Twitter Bearer or User Token provided. Enter your token from Twitter Developer Portal.",
          });
        }
        result = await verifyTwitter(token);
        break;
      }

      case "linkedin": {
        const token = credentials?.linkedinAccessToken || process.env.LINKEDIN_ACCESS_TOKEN;
        if (!token) {
          return NextResponse.json({
            ok: false,
            platform: "linkedin",
            error: "No LinkedIn Access Token provided. Enter your token from LinkedIn Developer Portal.",
          });
        }
        result = await verifyLinkedIn(token);
        break;
      }

      case "facebook": {
        const token = credentials?.metaPageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;
        const pageId = credentials?.metaPageId || process.env.META_PAGE_ID;
        if (!token) {
          return NextResponse.json({
            ok: false,
            platform: "facebook",
            error: "No Meta Page Access Token provided. Enter your token from Meta Developer Portal.",
          });
        }
        result = await verifyMetaPage(token, pageId);
        break;
      }

      default:
        return NextResponse.json(
          { ok: false, error: `Verification for platform '${platform}' is not directly supported yet.` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}
