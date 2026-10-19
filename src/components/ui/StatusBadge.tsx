import React from "react";
import { PostStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status:
    | PostStatus
    | "positive"
    | "neutral"
    | "negative"
    | "critical"
    | "active"
    | "warning"
    | "disconnected";
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  pending_approval: {
    label: "Pending Review",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500 animate-pulse",
  },
  changes_requested: {
    label: "Changes Needed",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  approved: {
    label: "Approved",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-600",
  },
  queued: {
    label: "In Buffer Queue",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-600",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-600",
  },
  published: {
    label: "Published",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  failed: {
    label: "Failed",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-600",
  },

  // Sentiments
  positive: {
    label: "Positive",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  neutral: {
    label: "Neutral",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  negative: {
    label: "Negative",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-600",
  },
  critical: {
    label: "Crisis Alert",
    bg: "bg-red-50",
    text: "text-red-800 font-bold",
    border: "border-red-300",
    dot: "bg-red-600 animate-ping",
  },

  // Account Statuses
  active: {
    label: "Connected",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  warning: {
    label: "Token Expiring",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-600",
  },
  disconnected: {
    label: "Offline",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = "md",
}) => {
  const conf = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium shadow-2xs",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        conf.bg,
        conf.text,
        conf.border,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", conf.dot)} />
      {conf.label}
    </span>
  );
};
