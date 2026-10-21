import { Workspace, WorkspaceId, ConnectedAccount, TeamMember } from "@/types";

export const defaultTeamMembers: Record<string, TeamMember> = {
  sarah: {
    id: "user-sarah",
    name: "Sarah Jenkins",
    email: "sarah@agency.design",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  marcus: {
    id: "user-marcus",
    name: "Marcus Vance",
    email: "marcus@agency.design",
    role: "manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  },
  david: {
    id: "user-david",
    name: "David Kim",
    email: "david@agency.design",
    role: "editor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  chloe: {
    id: "user-chloe",
    name: "Chloé Laurent",
    email: "chloe@lumina.luxury",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
  tyler: {
    id: "user-tyler",
    name: "Tyler Hayes",
    email: "tyler@apexmedia.co",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
  },
  alex: {
    id: "user-alex",
    name: "Alexander Wright",
    email: "alex@nexusprotocol.io",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
  },
};

export const initialWorkspaces: Workspace[] = [
  {
    id: "acme-cloud",
    name: "Acme Cloud",
    slug: "acme-cloud",
    category: "tech_saas",
    tagline: "Enterprise Distributed Infrastructure & Observability",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
    brandColor: "#3B82F6",
    guidelines: {
      brandVoice: "Data-driven, architectural authority, engineering-first, approachable clarity.",
      toneDescriptors: ["Authoritative", "Analytical", "Empowering", "Reliable"],
      approvedClaims: [
        "99.999% SLA uptime on distributed multi-region clusters",
        "Sub-10ms query execution across PB-scale telemetry datasets",
        "Zero-trust credential automation with native Kubernetes integrations"
      ],
      forbiddenClaims: [
        "Absolute immunity to hardware failure",
        "Guaranteed 100% cost reductions",
        "Unverified zero-day claims without CVE audit links"
      ],
      defaultHashtags: ["#CloudArchitecture", "#DevOps", "#SRE", "#DistributedSystems"],
      utmDefaultCampaign: "spring_launch_2026",
    },
    postingSchedules: {
      x: ["09:00", "13:00", "17:30"],
      linkedin: ["08:30", "12:15"],
      instagram: ["11:00", "16:00"],
      facebook: ["10:00"],
      tiktok: ["15:00"],
      youtube: ["14:00"],
      telegram: ["12:00"],
      threads: ["09:30", "18:00"],
    },
    team: [
      defaultTeamMembers.sarah,
      defaultTeamMembers.marcus,
      defaultTeamMembers.david,
    ],
    connectedCount: 0,
  },
  {
    id: "lumina-atelier",
    name: "Lumina Atelier",
    slug: "lumina-atelier",
    category: "ecommerce",
    tagline: "Architectural High-Jewelry & Conscious Luxury Goods",
    avatarUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=120&q=80",
    brandColor: "#F59E0B",
    guidelines: {
      brandVoice: "Understated elegance, tactile refinement, poetic craft, bespoke excellence.",
      toneDescriptors: ["Sophisticated", "Sensorial", "Poetic", "Conscious"],
      approvedClaims: [
        "100% certified conflict-free recycled precious metals",
        "Handcrafted in Parisian ateliers with master jewelers",
        "Lifetime heirloom warranty and complimentary bespoke polishing"
      ],
      forbiddenClaims: [
        "Fast-fashion clearance or discount language",
        "Synthetic gemstone comparisons",
        "Aggressive scarcity tactics or urgency clickbait"
      ],
      defaultHashtags: ["#LuminaAtelier", "#ConsciousLuxury", "#HauteJoaillerie", "#FineCraft"],
      utmDefaultCampaign: "solstice_edition_2026",
    },
    postingSchedules: {
      x: ["12:00"],
      linkedin: ["10:00"],
      instagram: ["10:30", "15:00", "20:00"],
      facebook: ["14:00"],
      tiktok: ["17:00", "21:00"],
      youtube: ["18:00"],
      telegram: ["11:00"],
      threads: ["11:00", "19:00"],
    },
    team: [
      defaultTeamMembers.chloe,
      defaultTeamMembers.sarah,
    ],
    connectedCount: 0,
  },
  {
    id: "apex-media",
    name: "Apex Media",
    slug: "apex-media",
    category: "creator",
    tagline: "High-Velocity Digital Creator Network & Culture Lab",
    avatarUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=120&q=80",
    brandColor: "#EC4899",
    guidelines: {
      brandVoice: "High-energy, razor-sharp wit, hyper-relatable, dynamic pacing, internet native.",
      toneDescriptors: ["Playful", "Bold", "Provocative", "Culturally Aware"],
      approvedClaims: [
        "Over 12M monthly active impressions across short-form syndication",
        "Creator-owned independent production studio",
        "Weekly masterclasses in algorithmic storytelling"
      ],
      forbiddenClaims: [
        "Get-rich-quick schemes or paid engagement pods",
        "Targeted harassment or unverified celebrity gossip",
        "Misleading thumbnails without narrative payoff"
      ],
      defaultHashtags: ["#ApexMedia", "#CreatorEconomy", "#VisualStorytelling", "#DigitalCulture"],
      utmDefaultCampaign: "creator_summit_2026",
    },
    postingSchedules: {
      x: ["09:00", "12:00", "15:00", "18:00", "21:00"],
      linkedin: ["11:00"],
      instagram: ["12:00", "16:00", "20:30"],
      facebook: ["13:00"],
      tiktok: ["11:00", "14:00", "18:00", "22:00"],
      youtube: ["15:00", "19:00"],
      telegram: ["10:00", "16:00"],
      threads: ["10:00", "14:00", "19:00"],
    },
    team: [
      defaultTeamMembers.tyler,
      defaultTeamMembers.david,
    ],
    connectedCount: 0,
  },
  {
    id: "nexus-protocol",
    name: "Nexus Protocol",
    slug: "nexus-protocol",
    category: "crypto_web3",
    tagline: "Sub-Millisecond Institutional Perpetual DEX & Liquidity Engine",
    avatarUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=120&q=80",
    brandColor: "#06B6D4",
    guidelines: {
      brandVoice: "Rigorous cryptographic integrity, institutional execution, zero counterparty drag.",
      toneDescriptors: ["Mathematical", "Futuristic", "Institutional", "Transparent"],
      approvedClaims: [
        "Sub-millisecond off-chain matching with zero-knowledge on-chain settlement",
        "Audited by top tier smart contract security researchers with formal verification",
        "Non-custodial vaults with isolated margin risk controls"
      ],
      forbiddenClaims: [
        "Promises of guaranteed yields, profits, or price targets",
        "Unregistered securities solicitation",
        "FOMO-inducing pumps or speculative financial advice"
      ],
      defaultHashtags: ["#NexusProtocol", "#DeFi", "#PerpDEX", "#ZeroKnowledge", "#Web3"],
      utmDefaultCampaign: "mainnet_alpha_v2",
    },
    postingSchedules: {
      x: ["08:00", "12:00", "16:00", "20:00"],
      linkedin: ["09:00"],
      instagram: ["13:00"],
      facebook: ["10:00"],
      tiktok: ["16:00"],
      youtube: ["17:00"],
      telegram: ["09:00", "13:00", "17:00", "21:00"],
      threads: ["10:00", "18:00"],
    },
    team: [
      defaultTeamMembers.alex,
      defaultTeamMembers.marcus,
    ],
    connectedCount: 0,
  },
];

export const initialConnectedAccounts: ConnectedAccount[] = [];
