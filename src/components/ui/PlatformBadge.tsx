import React from "react";
import { PlatformId } from "@/types";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform: PlatformId;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const platformMeta: Record<
  PlatformId,
  { label: string; bg: string; text: string; border: string; iconLabel: string }
> = {
  x: {
    label: "X (Twitter)",
    bg: "bg-slate-100",
    text: "text-slate-900",
    border: "border-slate-300",
    iconLabel: "𝕏",
  },
  linkedin: {
    label: "LinkedIn",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    iconLabel: "in",
  },
  instagram: {
    label: "Instagram",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    iconLabel: "IG",
  },
  facebook: {
    label: "Facebook",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    iconLabel: "fb",
  },
  tiktok: {
    label: "TikTok",
    bg: "bg-slate-100",
    text: "text-slate-900",
    border: "border-slate-300",
    iconLabel: "TT",
  },
  youtube: {
    label: "YouTube",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    iconLabel: "YT",
  },
  telegram: {
    label: "Telegram",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    iconLabel: "TG",
  },
  threads: {
    label: "Threads",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    iconLabel: "@",
  },
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  size = "md",
  showLabel = true,
  className,
}) => {
  const meta = platformMeta[platform] || platformMeta.x;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-lg border",
        meta.bg,
        meta.text,
        meta.border,
        sizeClasses[size],
        className
      )}
    >
      <span className="font-bold tracking-tight text-[11px] opacity-90">{meta.iconLabel}</span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
};
