import { NextRequest, NextResponse } from "next/server";
import { initialWorkspaces } from "@/lib/data/workspaces";
import { WorkspaceId } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, customerName, messages, intent } = await req.json();

    const wsId = (workspaceId || "acme-cloud") as WorkspaceId;
    const ws = initialWorkspaces.find((w) => w.id === wsId) || initialWorkspaces[0];
    const apiKey = process.env.GEMINI_API_KEY;
    const lastMessage = messages?.[messages.length - 1]?.text || "";

    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a world-class customer success leader at ${ws.name}.
Customer Name: ${customerName}
Intent: ${intent}
Brand Voice Guidelines: ${ws.guidelines.brandVoice}
Approved Claims: ${ws.guidelines.approvedClaims.join("; ")}
Last Message from Customer: "${lastMessage}"

Write a concise, warm, highly competent reply (under 80 words) resolving the customer's question.`;

        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();
        return NextResponse.json({ reply, source: "gemini-live" });
      } catch (err) {
        console.warn("[OmniSocial AI] Live Gemini reply failed, falling back:", err);
      }
    }

    // High quality intelligent fallback
    let fallbackReply = `Hi ${customerName || "there"}! Thank you for reaching out to ${ws.name}. `;
    if (intent === "Product Inquiry") {
      fallbackReply += `Yes, our platform is fully architected to support this. You can review our technical documentation at https://${ws.slug}.com/docs or let us know if you'd like a private architectural demo!`;
    } else if (intent === "Support Issue") {
      fallbackReply += `We are actively investigating this right now. Our engineering team has prioritized your ticket and we'll follow up shortly with a resolution.`;
    } else if (intent === "Partnership") {
      fallbackReply += `We're thrilled by the collaboration opportunity. I'm connecting you directly with our partnerships lead to arrange a joint strategic discussion.`;
    } else {
      fallbackReply += `We really appreciate your support and feedback as we continue expanding ${ws.name}! Feel free to let us know if there's anything else we can assist with.`;
    }

    return NextResponse.json({ reply: fallbackReply, source: "intelligent-fallback" });
  } catch (error) {
    console.error("[OmniSocial AI] Inbox reply error:", error);
    return NextResponse.json({ error: "Failed to synthesize reply" }, { status: 500 });
  }
}
