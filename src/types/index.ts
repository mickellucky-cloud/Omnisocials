export type WorkspaceId =
  | "acme-cloud"
  | "lumina-atelier"
  | "apex-media"
  | "nexus-protocol";

export type PlatformId =
  | "x"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "telegram"
  | "threads";

export type WorkspaceCategory =
  | "tech_saas"
  | "ecommerce"
  | "creator"
  | "crypto_web3";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "editor" | "client";
  avatar: string;
}

export interface WorkspaceGuidelines {
  brandVoice: string;
  toneDescriptors: string[];
  approvedClaims: string[];
  forbiddenClaims: string[];
  defaultHashtags: string[];
  utmDefaultCampaign: string;
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  slug: string;
  category: WorkspaceCategory;
  tagline: string;
  avatarUrl: string;
  brandColor: string;
  guidelines: WorkspaceGuidelines;
  postingSchedules: Record<PlatformId, string[]>; // e.g. ["09:00", "12:30", "17:00"]
  team: TeamMember[];
  connectedCount: number;
}

export interface ConnectedAccount {
  id: string;
  workspaceId: WorkspaceId;
  platform: PlatformId;
  accountHandle: string;
  accountName: string;
  accountAvatar: string;
  status: "active" | "warning" | "disconnected";
  followersCount: number;
  latencyMs: number;
  connectedAt: string;
  scopes: string[];
}

export type PostStatus =
  | "draft"
  | "pending_approval"
  | "changes_requested"
  | "approved"
  | "queued"
  | "scheduled"
  | "published"
  | "failed";

export interface PostVariant {
  platform: PlatformId;
  text: string;
  hashtags: string[];
  mediaUrls: string[];
  firstComment?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  authorName: string;
  action: "submitted" | "approved" | "requested_changes" | "edited";
  timestamp: string;
  notes?: string;
}

export interface PostItem {
  id: string;
  workspaceId: WorkspaceId;
  title: string;
  rawConcept: string;
  targetPlatforms: PlatformId[];
  variants: Record<PlatformId, PostVariant>;
  status: PostStatus;
  scheduledFor?: string; // ISO date string
  queueSlotTime?: string; // "14:30"
  author: TeamMember;
  createdAt: string;
  publishedAt?: string;
  approvalHistory: ApprovalHistoryEntry[];
  campaignTag?: string;
  firstComment?: string;
}

export interface QueueSlot {
  id: string;
  workspaceId: WorkspaceId;
  platform: PlatformId;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  time: string; // "09:00"
  isPaused: boolean;
  assignedPostId?: string;
}

export interface CustomerProfile {
  name: string;
  handle: string;
  platform: PlatformId;
  avatar: string;
  bio: string;
  followerCount: number;
  tier: "VIP" | "Ambassador" | "Standard" | "Influencer";
  sentimentHistory: "positive" | "neutral" | "negative";
  tags: string[];
  interactionCount: number;
}

export interface ThreadMessage {
  id: string;
  sender: "customer" | "agent" | "system";
  text: string;
  timestamp: string;
  sentiment?: "positive" | "neutral" | "negative" | "critical";
}

export interface InternalNote {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export interface ConversationThread {
  id: string;
  workspaceId: WorkspaceId;
  platform: PlatformId;
  customer: CustomerProfile;
  lastMessageSnippet: string;
  lastMessageTime: string;
  status: "open" | "assigned" | "resolved" | "flagged";
  assignedTo?: TeamMember;
  sentiment: "positive" | "neutral" | "negative" | "critical";
  intent: "Product Inquiry" | "Support Issue" | "Scam Alert" | "Partnership" | "Praise";
  messages: ThreadMessage[];
  internalNotes: InternalNote[];
  suggestedResponse?: string;
  isUnread: boolean;
  currentlyTypingBy?: string; // e.g. "Sarah Jenkins" for Collision Detection!
}

export interface ListeningMention {
  id: string;
  workspaceId: WorkspaceId;
  platform: PlatformId;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  sentiment: "positive" | "neutral" | "negative" | "critical";
  engagementCount: number;
  reachEstimate: number;
  matchedKeyword: string;
  isCrisisSpike: boolean;
}

export interface HeatmapCell {
  day: number; // 0-6
  hour: number; // 0-23
  engagementScore: number; // 0-100
  recommended: boolean;
}

export interface CompetitorStats {
  id: string;
  name: string;
  handle: string;
  platform: PlatformId;
  avatar: string;
  followers: number;
  growthPercent: number;
  postsPerWeek: number;
  avgEngagementRate: number;
}

export interface CannedMacro {
  id: string;
  shortcut: string; // e.g. "!hours"
  title: string;
  content: string;
  category: "Support" | "Billing" | "Product" | "Greeting";
}
