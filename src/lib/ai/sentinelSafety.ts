import { WorkspaceId } from "@/types";
import { initialWorkspaces } from "../data/workspaces";

export interface RiskEvaluationResult {
  riskLevel: "low" | "medium" | "high" | "critical";
  score: number; // 0-100
  violations: string[];
  recommendations: string[];
  passed: boolean;
}

export function evaluateSafetyAndRisk(
  workspaceId: WorkspaceId,
  content: string
): RiskEvaluationResult {
  const ws = initialWorkspaces.find((w) => w.id === workspaceId) || initialWorkspaces[0];
  const violations: string[] = [];
  const recommendations: string[] = [];
  const lower = content.toLowerCase();

  // Universal safety checks
  if (lower.includes("guarantee") && (lower.includes("profit") || lower.includes("return") || lower.includes("yield"))) {
    violations.push("Speculative financial promise detected: Guaranteed returns are strictly illegal.");
  }

  if (lower.includes("100% discount") || lower.includes("free money") || lower.includes("claim prize")) {
    violations.push("Spam/Phishing trigger words detected.");
  }

  // Workspace-specific forbidden claims
  for (const forbidden of ws.guidelines.forbiddenClaims) {
    const keyWords = forbidden.toLowerCase().split(" ").filter((w) => w.length > 4);
    const matchCount = keyWords.filter((w) => lower.includes(w)).length;
    if (matchCount >= 2) {
      violations.push(`Violation of workspace brand guideline: "${forbidden}"`);
      recommendations.push(`Revise copy to align with approved guidelines: "${ws.guidelines.approvedClaims[0] || 'State verified facts only'}"`);
    }
  }

  // Length and excessive punctuation checks
  if ((content.match(/!/g) || []).length > 4) {
    recommendations.push("Reduce excessive exclamation marks to maintain an authoritative enterprise tone.");
  }

  if (content === content.toUpperCase() && content.length > 20) {
    violations.push("Full uppercase text detected (perceived as spam / screaming).");
  }

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let score = 95;

  if (violations.length === 1) {
    riskLevel = "medium";
    score = 75;
  } else if (violations.length === 2) {
    riskLevel = "high";
    score = 45;
  } else if (violations.length >= 3) {
    riskLevel = "critical";
    score = 15;
  }

  return {
    riskLevel,
    score,
    violations,
    recommendations,
    passed: riskLevel === "low" || riskLevel === "medium",
  };
}
