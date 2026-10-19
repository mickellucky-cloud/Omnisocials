import {
  WorkspaceId,
  PostItem,
  ConversationThread,
  ListeningMention,
  HeatmapCell,
  CompetitorStats,
  CannedMacro,
} from "@/types";
import { defaultTeamMembers } from "./workspaces";

export const initialCannedMacros: CannedMacro[] = [
  {
    id: "macro-1",
    shortcut: "!hours",
    title: "Support Operating Hours",
    content: "Our global enterprise engineering team monitors systems 24/7/365. Standard tier inquiries are handled Mon-Fri 8 AM - 8 PM EST.",
    category: "Support",
  },
  {
    id: "macro-2",
    shortcut: "!security",
    title: "Security & SOC2 Compliance",
    content: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). You can request our latest SOC2 Type II audit report directly via trust@acmecloud.com.",
    category: "Product",
  },
  {
    id: "macro-3",
    shortcut: "!sla",
    title: "99.999% SLA Guarantee",
    content: "Enterprise customers receive contractual financial-backed 99.999% availability with automated service credit disbursements.",
    category: "Support",
  },
  {
    id: "macro-4",
    shortcut: "!demo",
    title: "Schedule Architecture Review",
    content: "We'd love to examine your architecture! You can book a 30-minute deep-dive with our Principal Solutions Architects at https://cal.com/acme/architecture.",
    category: "Product",
  },
];

export const initialPosts: PostItem[] = [
  {
    id: "post-1",
    workspaceId: "acme-cloud",
    title: "Multi-Region Distributed Database Launch",
    rawConcept: "Announcing Acme Distributed Engine v3. Sub-5ms p99 latency across 14 geographic zones with automated Raft consensus failover.",
    targetPlatforms: ["x", "linkedin"],
    status: "queued",
    queueSlotTime: "09:00",
    scheduledFor: "2026-10-20T09:00:00Z",
    author: defaultTeamMembers.sarah,
    createdAt: "2026-10-18T14:20:00Z",
    campaignTag: "v3_launch",
    approvalHistory: [
      {
        id: "appr-1",
        authorName: "Sarah Jenkins",
        action: "submitted",
        timestamp: "2026-10-18T14:22:00Z",
      },
      {
        id: "appr-2",
        authorName: "Marcus Vance",
        action: "approved",
        timestamp: "2026-10-18T15:00:00Z",
        notes: "Verified telemetry benchmarks with SRE team. Approved for automated buffer queue.",
      },
    ],
    variants: {
      x: {
        platform: "x",
        text: "Today we are shipping Acme Engine v3.\n\nSub-5ms p99 read/write latency across 14 global regions with zero-downtime Raft failover.\n\nBuilt for telemetry workloads that cannot tolerate a millisecond of jitter.",
        hashtags: ["#DistributedSystems", "#CloudInfra", "#DatabaseEngine"],
        mediaUrls: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"],
      },
      linkedin: {
        platform: "linkedin",
        text: "Building distributed systems at scale requires fundamental architectural tradeoffs — until today.\n\nWe are proud to introduce Acme Engine v3: our next-generation distributed database engine designed to process petabyte-scale telemetry with sub-5ms p99 latency across 14 global cloud regions.\n\nKey Engineering Milestones:\n• Zero-downtime consensus transitions via tuned Raft replication\n• Automated lock-free partition rebalancing\n• Native integration with Kubernetes operators\n\nRead the complete whitepaper and benchmarks below.",
        hashtags: ["#CloudComputing", "#EnterpriseArchitecture", "#DevOps", "#SRE"],
        mediaUrls: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"],
        firstComment: "Link to full architectural benchmarks: https://acmecloud.com/whitepapers/v3-benchmarks",
      },
      instagram: {
        platform: "instagram",
        text: "Next-gen infrastructure is here. Sub-5ms latency across 14 regions.\n.\n.\nLink in bio to read the v3 whitepaper.",
        hashtags: ["#tech", "#engineering", "#cloud"],
        mediaUrls: [],
      },
      facebook: { platform: "facebook", text: "", hashtags: [], mediaUrls: [] },
      tiktok: { platform: "tiktok", text: "", hashtags: [], mediaUrls: [] },
      youtube: { platform: "youtube", text: "", hashtags: [], mediaUrls: [] },
      telegram: { platform: "telegram", text: "", hashtags: [], mediaUrls: [] },
      threads: { platform: "threads", text: "", hashtags: [], mediaUrls: [] },
    },
  },
  {
    id: "post-2",
    workspaceId: "acme-cloud",
    title: "Live SRE Incident Post-Mortem Podcast",
    rawConcept: "How we mitigated a 1.2 Tbps volumetric DDoS attack without losing a single customer packet. Tune in to Episode 42.",
    targetPlatforms: ["x", "linkedin", "youtube"],
    status: "pending_approval",
    scheduledFor: "2026-10-21T13:00:00Z",
    author: defaultTeamMembers.david,
    createdAt: "2026-10-19T08:15:00Z",
    campaignTag: "sre_unfiltered",
    approvalHistory: [
      {
        id: "appr-3",
        authorName: "David Kim",
        action: "submitted",
        timestamp: "2026-10-19T08:20:00Z",
        notes: "Awaiting legal/security sign-off on IP scrubbing in transcript.",
      },
    ],
    variants: {
      x: {
        platform: "x",
        text: "1.2 Tbps DDoS attack.\n0 dropped customer packets.\n\nIn SRE Unfiltered Ep. 42, our Head of Security breaks down how our BGP Anycast mesh deflected one of the largest attacks of 2026 in 400 milliseconds.",
        hashtags: ["#CyberSecurity", "#DDoS", "#InfraSecurity"],
        mediaUrls: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"],
      },
      linkedin: {
        platform: "linkedin",
        text: "Transparency is the bedrock of enterprise trust.\n\nWhen a coordinated 1.2 Tbps volumetric DDoS attack targeted our European edge cluster last Thursday, our automated mitigation systems responded in under 400ms without a single packet dropped.\n\nIn this episode of SRE Unfiltered, we unpack the post-mortem telemetry, edge filtering rules, and lessons learned.",
        hashtags: ["#DevOps", "#InfoSec", "#Resilience", "#TechLeadership"],
        mediaUrls: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"],
      },
      youtube: {
        platform: "youtube",
        text: "Dissecting a 1.2 Tbps Attack: Full Architecture Teardown\n\nWatch our principal network engineers inspect real packet captures and demonstrate our edge deflection pipeline.",
        hashtags: ["#Cybersecurity", "#Networking", "#TechTalk"],
        mediaUrls: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"],
      },
      instagram: { platform: "instagram", text: "", hashtags: [], mediaUrls: [] },
      facebook: { platform: "facebook", text: "", hashtags: [], mediaUrls: [] },
      tiktok: { platform: "tiktok", text: "", hashtags: [], mediaUrls: [] },
      telegram: { platform: "telegram", text: "", hashtags: [], mediaUrls: [] },
      threads: { platform: "threads", text: "", hashtags: [], mediaUrls: [] },
    },
  },
  {
    id: "post-3",
    workspaceId: "acme-cloud",
    title: "Weekly Developer Productivity Tip",
    rawConcept: "3 curl commands every SRE should have in their .zshrc to debug TLS handshake latency.",
    targetPlatforms: ["x"],
    status: "published",
    publishedAt: "2026-10-18T17:30:00Z",
    author: defaultTeamMembers.sarah,
    createdAt: "2026-10-17T11:00:00Z",
    campaignTag: "developer_advocacy",
    approvalHistory: [
      {
        id: "appr-4",
        authorName: "Sarah Jenkins",
        action: "submitted",
        timestamp: "2026-10-17T11:05:00Z",
      },
      {
        id: "appr-5",
        authorName: "Marcus Vance",
        action: "approved",
        timestamp: "2026-10-17T12:00:00Z",
      },
    ],
    variants: {
      x: {
        platform: "x",
        text: "3 curl commands every SRE should keep bookmarked:\n\n1. Measure time to first byte:\ncurl -w \"@curl-format.txt\" -o /dev/null -s https://api.acme.com\n\n2. Inspect TLS cipher negotiation in terminal\n\n3. Trace DNS resolver chain\n\nBookmark this for your on-call shift 🔖",
        hashtags: ["#Linux", "#DevOps", "#SysAdmin", "#Terminal"],
        mediaUrls: [],
      },
      linkedin: { platform: "linkedin", text: "", hashtags: [], mediaUrls: [] },
      instagram: { platform: "instagram", text: "", hashtags: [], mediaUrls: [] },
      facebook: { platform: "facebook", text: "", hashtags: [], mediaUrls: [] },
      tiktok: { platform: "tiktok", text: "", hashtags: [], mediaUrls: [] },
      youtube: { platform: "youtube", text: "", hashtags: [], mediaUrls: [] },
      telegram: { platform: "telegram", text: "", hashtags: [], mediaUrls: [] },
      threads: { platform: "threads", text: "", hashtags: [], mediaUrls: [] },
    },
  },

  // Lumina Atelier Posts
  {
    id: "post-4",
    workspaceId: "lumina-atelier",
    title: "The Solstice Emerald Choker Release",
    rawConcept: "Crafted from 100% recycled 18k yellow gold with unheated Colombian emeralds. Only 12 numbered pieces worldwide.",
    targetPlatforms: ["instagram", "tiktok", "x"],
    status: "queued",
    queueSlotTime: "15:00",
    scheduledFor: "2026-10-20T15:00:00Z",
    author: defaultTeamMembers.chloe,
    createdAt: "2026-10-18T10:00:00Z",
    campaignTag: "solstice_edition",
    approvalHistory: [
      {
        id: "appr-6",
        authorName: "Chloé Laurent",
        action: "submitted",
        timestamp: "2026-10-18T10:05:00Z",
      },
      {
        id: "appr-7",
        authorName: "Chloé Laurent",
        action: "approved",
        timestamp: "2026-10-18T10:10:00Z",
        notes: "Visuals color-graded for high-contrast mobile displays.",
      },
    ],
    variants: {
      instagram: {
        platform: "instagram",
        text: "Twelve numbered heirlooms. An eternity of conscious craftsmanship.\n\nThe Solstice Emerald Choker is forged from solid certified recycled 18k gold, set with unheated Muzo emeralds hand-selected by our atelier masters.\n\nNow open for private collector acquisition via the link in our bio.",
        hashtags: ["#LuminaAtelier", "#HauteJoaillerie", "#FineJewelry", "#ParisianAtelier", "#ConsciousLuxury"],
        mediaUrls: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80"],
        firstComment: "Direct atelier inquiry concierge: concierge@luminaatelier.com",
      },
      tiktok: {
        platform: "tiktok",
        text: "Watch 140 hours of hand-bezel setting condensed into 45 seconds. The Solstice Emerald Choker ✨ #satisfyingcraft #jewelrymaker #luxuryprocess",
        hashtags: ["#jewelrymaking", "#luxury", "#artisanal"],
        mediaUrls: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80"],
      },
      x: {
        platform: "x",
        text: "The Solstice Emerald Choker.\n12 pieces worldwide. 100% recycled 18k gold.\n\nAvailable today for collectors at luminaatelier.com",
        hashtags: ["#HauteJoaillerie", "#LuminaAtelier"],
        mediaUrls: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80"],
      },
      linkedin: { platform: "linkedin", text: "", hashtags: [], mediaUrls: [] },
      facebook: { platform: "facebook", text: "", hashtags: [], mediaUrls: [] },
      youtube: { platform: "youtube", text: "", hashtags: [], mediaUrls: [] },
      telegram: { platform: "telegram", text: "", hashtags: [], mediaUrls: [] },
      threads: { platform: "threads", text: "", hashtags: [], mediaUrls: [] },
    },
  },
];

export const initialThreads: ConversationThread[] = [
  {
    id: "thread-1",
    workspaceId: "acme-cloud",
    platform: "x",
    customer: {
      name: "Dr. Alistair Thorne",
      handle: "@athorne_sre",
      platform: "x",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      bio: "VP of Infrastructure @ QuantumScale. Ex-AWS, distributed databases enthusiast.",
      followerCount: 42800,
      tier: "VIP",
      sentimentHistory: "positive",
      tags: ["Enterprise Prospect", "High Priority", "Speaker"],
      interactionCount: 14,
    },
    lastMessageSnippet: "Does the Acme v3 Raft engine support custom quorum weights across asynchronous disaster-recovery standby nodes?",
    lastMessageTime: "2026-10-19T09:42:00Z",
    status: "open",
    assignedTo: defaultTeamMembers.sarah,
    sentiment: "positive",
    intent: "Product Inquiry",
    isUnread: true,
    currentlyTypingBy: "Sarah Jenkins", // Collision Detection demonstration!
    suggestedResponse: "Hi Alistair! Yes, Acme v3 allows configuring weighted voter nodes and non-voting learners with asynchronous log shipping. Full docs: https://docs.acmecloud.com/raft/quorums. Happy to set up an architecture demo!",
    messages: [
      {
        id: "msg-101",
        sender: "customer",
        text: "Saw the v3 announcement. Impressive p99 numbers on telemetry ingestion.",
        timestamp: "2026-10-19T09:30:00Z",
        sentiment: "positive",
      },
      {
        id: "msg-102",
        sender: "agent",
        text: "Thanks Alistair! The team spent 9 months optimizing zero-copy serialization buffers.",
        timestamp: "2026-10-19T09:35:00Z",
      },
      {
        id: "msg-103",
        sender: "customer",
        text: "Does the Acme v3 Raft engine support custom quorum weights across asynchronous disaster-recovery standby nodes?",
        timestamp: "2026-10-19T09:42:00Z",
        sentiment: "positive",
      },
    ],
    internalNotes: [
      {
        id: "note-1",
        authorName: "Marcus Vance",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        text: "Alistair's company is currently running 2,400 Cassandra nodes and evaluating a migration. Treat as Tier-1 enterprise lead.",
        timestamp: "2026-10-19T09:36:00Z",
      },
    ],
  },
  {
    id: "thread-2",
    workspaceId: "acme-cloud",
    platform: "linkedin",
    customer: {
      name: "Helena Zhou",
      handle: "helenazhou-cto",
      platform: "linkedin",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
      bio: "Chief Technology Officer at FinLedger Global. Forbes 30 Under 30.",
      followerCount: 28400,
      tier: "Ambassador",
      sentimentHistory: "positive",
      tags: ["Enterprise Client", "Keynote Co-Speaker"],
      interactionCount: 29,
    },
    lastMessageSnippet: "Our compliance team approved the enterprise SOC2 agreement! When can our DevOps team begin the staging VPC peering?",
    lastMessageTime: "2026-10-19T08:15:00Z",
    status: "assigned",
    assignedTo: defaultTeamMembers.marcus,
    sentiment: "positive",
    intent: "Partnership",
    isUnread: false,
    suggestedResponse: "Fantastic news Helena! Our Principal Cloud Architect Marcus Vance will send over the private Terraform peering module and schedule our joint kickoff call.",
    messages: [
      {
        id: "msg-201",
        sender: "customer",
        text: "Our compliance team approved the enterprise SOC2 agreement! When can our DevOps team begin the staging VPC peering?",
        timestamp: "2026-10-19T08:15:00Z",
        sentiment: "positive",
      },
    ],
    internalNotes: [],
  },
  {
    id: "thread-3",
    workspaceId: "acme-cloud",
    platform: "x",
    customer: {
      name: "CryptoHunter99",
      handle: "@cryptohunter99",
      platform: "x",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      bio: "Alpha calls & automated bot tracking.",
      followerCount: 1200,
      tier: "Standard",
      sentimentHistory: "negative",
      tags: ["Flagged", "Spam Risk"],
      interactionCount: 2,
    },
    lastMessageSnippet: "Why is your API returning HTTP 429 rate limit errors when I poll the public endpoint 5,000 times a minute??? Fix your servers!",
    lastMessageTime: "2026-10-19T07:20:00Z",
    status: "flagged",
    sentiment: "critical",
    intent: "Support Issue",
    isUnread: false,
    suggestedResponse: "Hello! Our public endpoint is rate-limited to 60 requests/minute to prevent abusive scraping. For high-frequency data pipelines, please configure an Enterprise API key with dedicated throughput limits.",
    messages: [
      {
        id: "msg-301",
        sender: "customer",
        text: "Why is your API returning HTTP 429 rate limit errors when I poll the public endpoint 5,000 times a minute??? Fix your servers!",
        timestamp: "2026-10-19T07:20:00Z",
        sentiment: "critical",
      },
    ],
    internalNotes: [
      {
        id: "note-2",
        authorName: "Sarah Jenkins",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
        text: "IP address was flagged by Cloudflare for brute force polling. No server degradation occurred.",
        timestamp: "2026-10-19T07:30:00Z",
      },
    ],
  },
];

export const initialListeningMentions: ListeningMention[] = [
  {
    id: "listen-1",
    workspaceId: "acme-cloud",
    platform: "x",
    authorHandle: "@cloud_architect_ben",
    authorName: "Ben Sterling",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    content: "Benchmarked @AcmeCloudHQ v3 against AWS DynamoDB and Google Spanner. Latency consistency under 100k QPS load is seriously impressive. No tail latency spikes.",
    timestamp: "2026-10-19T09:12:00Z",
    sentiment: "positive",
    engagementCount: 384,
    reachEstimate: 62000,
    matchedKeyword: "@AcmeCloudHQ",
    isCrisisSpike: false,
  },
  {
    id: "listen-2",
    workspaceId: "acme-cloud",
    platform: "x",
    authorHandle: "@devops_rants",
    authorName: "DevOps Real Talk",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    content: "Has anyone migrated from Datadog to Acme Cloud Telemetry? How's the ingestion cost curve once you exceed 50 TB/month?",
    timestamp: "2026-10-19T08:05:00Z",
    sentiment: "neutral",
    engagementCount: 112,
    reachEstimate: 19500,
    matchedKeyword: "Acme Cloud",
    isCrisisSpike: false,
  },
  {
    id: "listen-3",
    workspaceId: "acme-cloud",
    platform: "linkedin",
    authorHandle: "marina-cloud-advisor",
    authorName: "Marina Kovac",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    content: "In our latest Q4 Cloud Infrastructure Market Report, Acme Cloud showed the fastest customer retention growth in the distributed database quadrant.",
    timestamp: "2026-10-19T06:30:00Z",
    sentiment: "positive",
    engagementCount: 520,
    reachEstimate: 85000,
    matchedKeyword: "Acme Cloud",
    isCrisisSpike: false,
  },
];

export const generateHeatmapData = (): HeatmapCell[] => {
  const days = 7;
  const hours = 24;
  const cells: HeatmapCell[] = [];

  for (let d = 0; d < days; d++) {
    for (let h = 0; h < hours; h++) {
      // Create realistic peak activity curves:
      // Weekdays (Mon-Fri 1-5): Peak 08:00 - 11:00 and 13:00 - 17:00
      const isWeekday = d >= 1 && d <= 5;
      let score = 20 + Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2) * 20;

      if (isWeekday) {
        if ((h >= 8 && h <= 11) || (h >= 13 && h <= 17)) {
          score += 45 + ((d * 3 + h * 5) % 15);
        } else if (h >= 18 && h <= 21) {
          score += 25;
        }
      } else {
        // Weekends: Peak 11:00 - 15:00
        if (h >= 11 && h <= 16) {
          score += 35;
        }
      }

      score = Math.min(Math.max(Math.round(score), 5), 100);
      const recommended = score >= 80;

      cells.push({
        day: d,
        hour: h,
        engagementScore: score,
        recommended,
      });
    }
  }

  return cells;
};

export const initialCompetitors: Record<WorkspaceId, CompetitorStats[]> = {
  "acme-cloud": [
    {
      id: "comp-1",
      name: "DataScale Engine",
      handle: "@DataScaleHQ",
      platform: "x",
      avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80",
      followers: 142000,
      growthPercent: 3.4,
      postsPerWeek: 14,
      avgEngagementRate: 2.8,
    },
    {
      id: "comp-2",
      name: "Nimbus DB",
      handle: "@NimbusDatabase",
      platform: "x",
      avatar: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=120&q=80",
      followers: 89000,
      growthPercent: 1.8,
      postsPerWeek: 9,
      avgEngagementRate: 2.1,
    },
  ],
  "lumina-atelier": [
    {
      id: "comp-3",
      name: "Maison Vesper",
      handle: "@maisonvesper",
      platform: "instagram",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      followers: 410000,
      growthPercent: 4.1,
      postsPerWeek: 12,
      avgEngagementRate: 4.6,
    },
  ],
  "apex-media": [
    {
      id: "comp-4",
      name: "Velocity Digital",
      handle: "@velocitydigital",
      platform: "youtube",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
      followers: 1200000,
      growthPercent: 6.8,
      postsPerWeek: 21,
      avgEngagementRate: 5.8,
    },
  ],
  "nexus-protocol": [
    {
      id: "comp-5",
      name: "Hyperion DEX",
      handle: "@HyperionDEX",
      platform: "x",
      avatar: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=120&q=80",
      followers: 195000,
      growthPercent: 2.9,
      postsPerWeek: 16,
      avgEngagementRate: 3.2,
    },
  ],
};
