import React from "react";
import { PostVariant, Workspace } from "@/types";
import { MessageCircle, Heart, Repeat, Share2, Bookmark, Send, ThumbsUp, MoreHorizontal, CheckCircle2 } from "lucide-react";

interface PreviewProps {
  variant: PostVariant;
  workspace: Workspace;
}

export const XPreview: React.FC<PreviewProps> = ({ variant, workspace }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-slate-900 shadow-sm font-sans">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={workspace.avatarUrl}
          alt={workspace.name}
          className="w-10 h-10 rounded-full object-cover border border-slate-200"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-bold text-sm text-slate-900 truncate">{workspace.name}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span className="text-xs text-slate-500">@{workspace.slug} · 1m</span>
          </div>

          <div className="mt-2 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {variant.text || "Start typing your concept in the composer..."}
          </div>

          {variant.hashtags && variant.hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {variant.hashtags.map((h, i) => (
                <span key={i} className="text-xs text-blue-600 hover:underline font-medium">
                  {h}
                </span>
              ))}
            </div>
          )}

          {variant.mediaUrls && variant.mediaUrls[0] && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={variant.mediaUrls[0]}
                alt="Post attachment"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-slate-400 text-xs pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer">
              <MessageCircle className="w-4 h-4" /> <span>38</span>
            </div>
            <div className="flex items-center gap-1 hover:text-emerald-600 transition-colors cursor-pointer">
              <Repeat className="w-4 h-4" /> <span>84</span>
            </div>
            <div className="flex items-center gap-1 hover:text-pink-600 transition-colors cursor-pointer">
              <Heart className="w-4 h-4" /> <span>412</span>
            </div>
            <div className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LinkedInPreview: React.FC<PreviewProps> = ({ variant, workspace }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-slate-900 shadow-sm font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={workspace.avatarUrl}
            alt={workspace.name}
            className="w-11 h-11 rounded-lg object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-1 font-bold text-sm text-slate-900">
              {workspace.name}
              <span className="text-[10px] text-slate-400 font-normal ml-1">· 1st</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{workspace.tagline}</p>
            <p className="text-[10px] text-slate-400">1h · Edited · 🌐</p>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400" />
      </div>

      <div className="mt-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
        {variant.text || "Your professional insight preview..."}
      </div>

      {variant.hashtags && variant.hashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {variant.hashtags.map((h, i) => (
            <span key={i} className="text-xs text-blue-700 font-medium">
              {h}
            </span>
          ))}
        </div>
      )}

      {variant.mediaUrls && variant.mediaUrls[0] && (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={variant.mediaUrls[0]}
            alt="Attachment"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {variant.firstComment && (
        <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
          <span className="font-semibold text-blue-900">Scheduled 1st Comment:</span> {variant.firstComment}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
        <button 
          aria-label="Like post"
          className="tap-press min-h-[32px] px-2 py-1 rounded-lg flex items-center gap-1.5 hover:text-blue-700 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Like
        </button>
        <button 
          aria-label="Comment on post"
          className="tap-press min-h-[32px] px-2 py-1 rounded-lg flex items-center gap-1.5 hover:text-blue-700 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" /> Comment
        </button>
        <button 
          aria-label="Repost"
          className="tap-press min-h-[32px] px-2 py-1 rounded-lg flex items-center gap-1.5 hover:text-blue-700 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Repeat className="w-3.5 h-3.5 shrink-0" /> Repost
        </button>
        <button 
          aria-label="Send via message"
          className="tap-press min-h-[32px] px-2 py-1 rounded-lg flex items-center gap-1.5 hover:text-blue-700 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Send className="w-3.5 h-3.5 shrink-0" /> Send
        </button>
      </div>
    </div>
  );
};

export const InstagramPreview: React.FC<PreviewProps> = ({ variant, workspace }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl max-w-sm mx-auto text-slate-900 shadow-sm font-sans overflow-hidden">
      {/* IG Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workspace.avatarUrl}
              alt={workspace.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900 leading-tight">{workspace.slug}</div>
            <div className="text-[10px] text-slate-500">Original audio</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400" />
      </div>

      {/* IG Media Box (Square 1:1) */}
      <div className="aspect-square bg-slate-100 relative flex items-center justify-center overflow-hidden">
        {variant.mediaUrls && variant.mediaUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={variant.mediaUrls[0]}
            alt="Instagram media"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-6 text-slate-400 text-xs">
            No media attached. High-engagement IG posts require an image or video asset.
          </div>
        )}
      </div>

      {/* IG Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between text-slate-800 mb-2">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 hover:text-rose-600 transition-colors cursor-pointer" />
            <MessageCircle className="w-5 h-5 hover:text-slate-900 cursor-pointer" />
            <Send className="w-5 h-5 hover:text-slate-900 cursor-pointer" />
          </div>
          <Bookmark className="w-5 h-5 hover:text-slate-900 cursor-pointer" />
        </div>

        <div className="text-xs font-semibold text-slate-900 mb-1">1,842 likes</div>

        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
          <span className="font-semibold text-slate-900 mr-1.5">{workspace.slug}</span>
          {variant.text || "Your Instagram caption..."}
        </div>

        {variant.hashtags && variant.hashtags.length > 0 && (
          <div className="mt-1 text-[11px] text-blue-600 font-medium">
            {variant.hashtags.join(" ")}
          </div>
        )}

        <div className="mt-2 text-[10px] text-slate-400 uppercase">2 hours ago</div>
      </div>
    </div>
  );
};

export const TelegramPreview: React.FC<PreviewProps> = ({ variant, workspace }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-slate-900 shadow-sm font-sans">
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={workspace.avatarUrl}
          alt={workspace.name}
          className="w-9 h-9 rounded-full object-cover border border-slate-200"
        />
        <div>
          <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
            {workspace.name} Channel
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-medium">Channel</span>
          </div>
          <div className="text-[10px] text-slate-500">14.2k subscribers</div>
        </div>
      </div>

      <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100">
        {variant.mediaUrls && variant.mediaUrls[0] && (
          <div className="rounded-lg overflow-hidden mb-2.5 aspect-video bg-slate-100 border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={variant.mediaUrls[0]}
              alt="Telegram Media"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
          {variant.text || "Telegram broadcast preview..."}
        </div>

        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono">
          <span>09:42</span>
          <span className="text-sky-600">✓✓</span>
        </div>
      </div>
    </div>
  );
};
