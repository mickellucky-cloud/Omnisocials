import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  className?: string;
  glowColor?: "blue" | "cyan" | "purple" | "none";
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  elevated = false,
  className,
  glowColor = "none",
  ...props
}) => {
  const glowStyles = {
    none: "",
    blue: "hover:border-blue-500/30 transition-all duration-300",
    cyan: "hover:border-cyan-500/30 transition-all duration-300",
    purple: "hover:border-purple-500/30 transition-all duration-300",
  };

  return (
    <div
      className={cn(
        elevated ? "glass-panel-elevated" : "glass-panel",
        "rounded-2xl p-5 relative overflow-hidden transition-all duration-200",
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
