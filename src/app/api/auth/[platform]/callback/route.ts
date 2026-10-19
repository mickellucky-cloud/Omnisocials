import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code") || "";
  const state = searchParams.get("state") || "";

  let workspaceId = "acme-cloud";
  if (state) {
    try {
      const parsed = JSON.parse(decodeURIComponent(state));
      if (parsed.workspaceId) workspaceId = parsed.workspaceId;
    } catch {
      // ignore
    }
  }

  const callbackUrl = new URL(`/auth/callback`, request.url);
  callbackUrl.searchParams.set("platform", platform);
  callbackUrl.searchParams.set("workspace", workspaceId);
  callbackUrl.searchParams.set("code", code);
  callbackUrl.searchParams.set("state", state);

  return NextResponse.redirect(callbackUrl);
}
