import { WorkspaceId, PlatformId, PostVariant } from "@/types";
import { initialWorkspaces } from "../data/workspaces";

interface GenerateParams {
  workspaceId: WorkspaceId;
  rawConcept: string;
  primaryMediaUrl?: string;
  tone?: "authoritative" | "engaging" | "witty" | "thought_leader";
}

export function generatePlatformVariants({
  workspaceId,
  rawConcept,
  primaryMediaUrl,
}: GenerateParams): Record<PlatformId, PostVariant> {
  const ws = initialWorkspaces.find((w) => w.id === workspaceId) || initialWorkspaces[0];
  const cleanConcept = rawConcept.trim();
  const defaultTags = ws.guidelines.defaultHashtags;
  const media = primaryMediaUrl ? [primaryMediaUrl] : [];

  // 1. X (Twitter) - Crisp, punchy, under 280 characters
  let xText = cleanConcept;
  if (xText.length > 210) {
    xText = xText.slice(0, 205) + "...";
  }
  const xVariant: PostVariant = {
    platform: "x",
    text: `${xText}\n\nKey takeaways below 👇`,
    hashtags: defaultTags.slice(0, 3),
    mediaUrls: media,
  };

  // 2. LinkedIn - Professional whitespace, bulleted takeaways, discussion CTA
  const linkedInVariant: PostVariant = {
    platform: "linkedin",
    text: `${cleanConcept}\n\nAt ${ws.name}, we believe precision and architectural rigor create compounding competitive advantages.\n\nKey Strategic Pillars:\n• Scalable architecture designed for high throughput\n• Enterprise reliability and contractual SLA backing\n• Zero-compromise user experience\n\nHow is your organization approaching these challenges this quarter? Let's discuss in the comments below.`,
    hashtags: defaultTags.slice(0, 4),
    mediaUrls: media,
    firstComment: `Read our comprehensive engineering documentation and benchmarks: https://${ws.slug}.com/docs`,
  };

  // 3. Instagram - Aesthetic storytelling, line breaks, bio link, rich hashtag block
  const instagramVariant: PostVariant = {
    platform: "instagram",
    text: `${cleanConcept}\n.\n.\nCrafted with obsession at ${ws.name}. Every detail matters when building for the next generation.\n.\n.\nTap the link in our bio to explore the full story.\n.\n.\n`,
    hashtags: [...defaultTags, "#DesignEngineering", "#Innovation", "#Excellence"],
    mediaUrls: media,
    firstComment: "Questions? Our concierge is available 24/7 in direct messages.",
  };

  // 4. Facebook - Conversational narrative with link preview
  const facebookVariant: PostVariant = {
    platform: "facebook",
    text: `Big announcement from the ${ws.name} team today!\n\n${cleanConcept}\n\nWe're opening early access to our partner network starting this week. Click the link below to get started or read our full launch blog.`,
    hashtags: defaultTags.slice(0, 2),
    mediaUrls: media,
  };

  // 5. TikTok - Fast-paced video hook, scene pacing, and audio cue
  const tiktokVariant: PostVariant = {
    platform: "tiktok",
    text: `POV: You just discovered how ${ws.name} changed everything 🔥\n\n${cleanConcept}\n\nFollow for more behind-the-scenes engineering teardowns!`,
    hashtags: [...defaultTags.slice(0, 2), "#TechTok", "#BehindTheScenes", "#BuildInPublic"],
    mediaUrls: media,
  };

  // 6. YouTube Shorts / Community Post
  const youtubeVariant: PostVariant = {
    platform: "youtube",
    text: `${ws.name} Milestone Release: ${cleanConcept}\n\nWatch our full technical breakdown video linked in the description. Don't forget to subscribe for weekly deep dives!`,
    hashtags: defaultTags.slice(0, 3),
    mediaUrls: media,
  };

  // 7. Telegram - Formatted release note with bold markdown
  const telegramVariant: PostVariant = {
    platform: "telegram",
    text: `🚀 **${ws.name.toUpperCase()} OFFICIAL ANNOUNCEMENT**\n\n${cleanConcept}\n\n⚡ **Status**: Live Across All Production Clusters\n🔗 **Website**: https://${ws.slug}.com\n\n_React with 🔥 to let us know your thoughts!_`,
    hashtags: defaultTags.slice(0, 2),
    mediaUrls: media,
  };

  // 8. Threads
  const threadsVariant: PostVariant = {
    platform: "threads",
    text: `${cleanConcept}\n\nA quick thread on what we learned building this 👇`,
    hashtags: defaultTags.slice(0, 2),
    mediaUrls: media,
  };

  return {
    x: xVariant,
    linkedin: linkedInVariant,
    instagram: instagramVariant,
    facebook: facebookVariant,
    tiktok: tiktokVariant,
    youtube: youtubeVariant,
    telegram: telegramVariant,
    threads: threadsVariant,
  };
}
