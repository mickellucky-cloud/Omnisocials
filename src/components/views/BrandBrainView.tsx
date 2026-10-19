"use client";

import React, { useState } from "react";
import { Workspace } from "@/types";
import { GlassPanel } from "../ui/GlassPanel";
import {
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Link,
  Save,
} from "lucide-react";

interface BrandBrainViewProps {
  currentWorkspace: Workspace;
}

export const BrandBrainView: React.FC<BrandBrainViewProps> = ({ currentWorkspace }) => {
  const [saved, setSaved] = useState(false);
  const [brandVoice, setBrandVoice] = useState(currentWorkspace.guidelines.brandVoice);
  const [utmCampaign, setUtmCampaign] = useState(currentWorkspace.guidelines.utmDefaultCampaign);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <GlassPanel className="p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workspace Brand Brain</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono font-semibold">
                {currentWorkspace.name}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Approved claims, tone directives, regulatory blacklist, and team RBAC
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          aria-label="Save brand voice directives and compliance guidelines"
          className="tap-press min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>Save Guidelines</span>
        </button>
      </GlassPanel>

      {saved && (
        <div 
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in shadow-2xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Brand guidelines and compliance constraints successfully updated!</span>
        </div>
      )}

      {/* Guidelines & Tone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Brand Voice & Approved Claims (7 Cols) */}
        <div className="md:col-span-7 space-y-5">
          {/* Brand Voice Editor */}
          <GlassPanel className="p-5 space-y-3 border-slate-200 bg-white shadow-xs">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Core Brand Voice & Personality Directive
            </div>
            <textarea
              rows={3}
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 resize-none leading-relaxed"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentWorkspace.guidelines.toneDescriptors.map((tone, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-medium"
                >
                  ✦ {tone}
                </span>
              ))}
            </div>
          </GlassPanel>

          {/* Approved Value Claims */}
          <GlassPanel className="p-5 space-y-3 border-emerald-200 bg-emerald-50/50 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Approved Claims</span>
              </div>
              <span className="text-[10px] text-slate-500">Auto-suggested by AI</span>
            </div>

            <div className="space-y-2">
              {currentWorkspace.guidelines.approvedClaims.map((claim, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 shadow-2xs"
                >
                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{claim}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Forbidden Blacklist */}
          <GlassPanel className="p-5 space-y-3 border-rose-200 bg-rose-50/50 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Forbidden Claims & Regulatory Blacklist</span>
              </div>
              <span className="text-[10px] text-rose-700 font-bold font-mono">STRICT GUARDRAILS</span>
            </div>

            <div className="space-y-2">
              {currentWorkspace.guidelines.forbiddenClaims.map((claim, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-rose-900 flex items-start gap-2 shadow-2xs"
                >
                  <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
                  <span>{claim}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right Column: UTM Builder & Team RBAC (5 Cols) */}
        <div className="md:col-span-5 space-y-5">
          {/* UTM Tracking Defaults */}
          <GlassPanel className="p-5 space-y-3 border-slate-200 bg-white shadow-xs">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Link className="w-4 h-4 text-blue-600" />
              <span>Default Link Tracking (UTM)</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Default Campaign Tag</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-mono"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-mono">
                Preview: ?utm_source=[platform]&amp;utm_campaign={utmCampaign}
              </div>
            </div>
          </GlassPanel>

          {/* Team Members & RBAC */}
          <GlassPanel className="p-5 space-y-3 border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Team Members & Roles</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentWorkspace.team.length} Seats
              </span>
            </div>

            <div className="space-y-2">
              {currentWorkspace.team.map((member) => (
                <div
                  key={member.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{member.name}</div>
                      <div className="text-[10px] text-slate-500">{member.email}</div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono capitalize shadow-2xs font-medium">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
