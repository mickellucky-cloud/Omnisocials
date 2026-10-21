import {
  WorkspaceId,
  PostItem,
  ConversationThread,
  ListeningMention,
  HeatmapCell,
  CompetitorStats,
  CannedMacro,
} from "@/types";

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

export const initialPosts: PostItem[] = [];

export const initialThreads: ConversationThread[] = [];

export const initialListeningMentions: ListeningMention[] = [];

export const generateHeatmapData = (): HeatmapCell[] => {
  const days = 7;
  const hours = 24;
  const cells: HeatmapCell[] = [];

  for (let d = 0; d < days; d++) {
    for (let h = 0; h < hours; h++) {
      const isWeekday = d >= 1 && d <= 5;
      let score = 20 + Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2) * 20;

      if (isWeekday) {
        if ((h >= 8 && h <= 11) || (h >= 13 && h <= 17)) {
          score += 45 + ((d * 3 + h * 5) % 15);
        } else if (h >= 18 && h <= 21) {
          score += 25;
        }
      } else {
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
  "acme-cloud": [],
  "lumina-atelier": [],
  "apex-media": [],
  "nexus-protocol": [],
};
