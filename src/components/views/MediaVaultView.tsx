"use client";

import React, { useState } from "react";
import { Workspace } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import { FolderGit2, Upload, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaVaultViewProps {
  currentWorkspace: Workspace;
  onSelectMediaForPost?: (url: string) => void;
}

export const MediaVaultView: React.FC<MediaVaultViewProps> = ({
  currentWorkspace,
  onSelectMediaForPost,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const assets = [
    {
      id: "media-1",
      title: "Master Architecture Cluster 3D",
      category: "renders",
      aspectRatio: "16:9",
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      resolution: "3840 x 2160",
      size: "2.4 MB",
    },
    {
      id: "media-2",
      title: "Cyber Resilience Data Stream",
      category: "graphics",
      aspectRatio: "1:1",
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      resolution: "2048 x 2048",
      size: "1.8 MB",
    },
    {
      id: "media-3",
      title: "High Precision Jewelry Macro",
      category: "photos",
      aspectRatio: "4:5",
      url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
      resolution: "1600 x 2000",
      size: "3.1 MB",
    },
    {
      id: "media-4",
      title: "Server Racks Telemetry Halo",
      category: "renders",
      aspectRatio: "16:9",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      resolution: "3840 x 2160",
      size: "4.2 MB",
    },
    {
      id: "media-5",
      title: "Parisian Atelier Workshop",
      category: "photos",
      aspectRatio: "1:1",
      url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
      resolution: "2000 x 2000",
      size: "2.1 MB",
    },
    {
      id: "media-6",
      title: "Cryptographic Node Visualization",
      category: "graphics",
      aspectRatio: "9:16",
      url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
      resolution: "1080 x 1920",
      size: "1.9 MB",
    },
  ];

  const filtered = assets.filter(
    (a) => activeCategory === "all" || a.category === activeCategory
  );

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cloud Media Vault</h2>
            <p className="text-xs text-slate-500">
              High-resolution brand assets, aspect ratio cropper, and quick-attach studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Tabs */}
          <div 
            role="tablist"
            aria-label="Media asset category filter"
            className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs"
          >
            {["all", "renders", "graphics", "photos"].map((cat) => (
              <button
                key={cat}
                role="tab"
                id={`media-tab-${cat}`}
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "tap-press min-h-[36px] px-3.5 py-1.5 rounded-lg capitalize transition-colors font-medium focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeCategory === cat ? "bg-white text-blue-700 font-semibold shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            aria-label="Upload new media asset to cloud vault"
            className="tap-press min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span>Upload Asset</span>
          </button>
        </div>
      </GlassPanel>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((asset) => (
          <GlassPanel key={asset.id} className="p-3 space-y-3 border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between group shadow-xs">
            <div>
              {/* Asset Image Box */}
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-white/90 backdrop-blur-md text-slate-800 font-mono font-semibold border border-slate-200 shadow-2xs">
                  {asset.aspectRatio}
                </span>
              </div>

              <div className="mt-2.5">
                <h3 className="text-xs font-bold text-slate-900 truncate">{asset.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
                  <span>{asset.resolution}</span>
                  <span>·</span>
                  <span>{asset.size}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(asset.url)}
                aria-label={`Copy media URL for asset: ${asset.title}`}
                className="tap-press min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {copiedUrl === asset.url ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                <span>{copiedUrl === asset.url ? "Copied" : "Copy URL"}</span>
              </button>

              {onSelectMediaForPost && (
                <button
                  onClick={() => onSelectMediaForPost(asset.url)}
                  aria-label={`Attach ${asset.title} to composer`}
                  className="tap-press min-h-[36px] px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Use in Composer
                </button>
              )}
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
};
