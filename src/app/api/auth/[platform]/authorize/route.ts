import { NextRequest, NextResponse } from "next/server";
import { PlatformId, WorkspaceId } from "@/types";
import { buildOAuthAuthorizationUrl } from "@/lib/social/oauth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = (searchParams.get("workspaceId") || "acme-cloud") as WorkspaceId;
  const redirectUri = searchParams.get("redirectUri") || undefined;

  const authUrl = buildOAuthAuthorizationUrl({
    platform: platform as PlatformId,
    workspaceId,
    redirectUri,
  });

  return NextResponse.redirect(new URL(authUrl, request.url));
}
