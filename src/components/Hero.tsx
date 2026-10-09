import React, { useState } from 'react';
import { RaycastHeroScene } from './RaycastHeroScene';
import { Sparkles, ArrowDown, ShieldCheck, Zap } from 'lucide-react';
import { PlatformIcons } from './PlatformIcons';

interface HeroProps {
  tagline: string;
  subheadline: string;
  version: string;
  platform: string;
  installCommand: string;
  heroBadgeText: string;
  onOpenCommandPalette: () => void;
  onOpenCustomizer: () => void;
  onOpenCatchUp?: () => void;
  onOpenConnectWorkspace?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  tagline,
  subheadline,
  version: _version,
  platform: _platform,
  installCommand: _installCommand,
  heroBadgeText: _heroBadgeText,
  onOpenCommandPalette: _onOpenCommandPalette,
  onOpenCustomizer: _onOpenCustomizer,
  onOpenCatchUp,
  onOpenConnectWorkspace,
}) => {
  const [selectedBg, setSelectedBg] = useState<string>('exact-live');

  return (
    <section
      id="overview"
      className="relative w-full min-h-screen py-24 sm:py-32 overflow-hidden flex flex-col items-center justify-center text-center select-none"
    >
      {/* =========================================================================
          AUTHENTIC RAYCAST HERO BACKGROUND (Exact dark straight crimson ribbons)
          ========================================================================= */}
      <RaycastHeroScene selectedBg={selectedBg} onSelectBg={setSelectedBg} />

      {/* DEAD-CENTER TEXT CONTENT & INTERACTIVE CTA */}
      <div className="w-full max-w-[980px] px-4 sm:px-6 flex flex-col items-center justify-center relative z-10 m-auto animate-fade-in">
        {/* Hackathon PS Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111214]/80 border border-[#ff6363]/40 backdrop-blur-md mb-6 shadow-[0_0_24px_rgba(255,99,99,0.18)]">
          <span className="w-2 h-2 rounded-full bg-[#ff6363] animate-pulse" />
          <span className="font-['GeistMono'] text-[11px] font-medium tracking-[0.06em] uppercase text-[#ffffff]">
            BMSIT&M HACKATHON 2026 • THE UNREAD PROBLEM
          </span>
        </div>

        {/* Headline: 52px - 84px Inter font, bold, crisp white with crimson highlight */}
        <h1 className="font-['Inter'] font-semibold text-[44px] sm:text-[60px] md:text-[72px] lg:text-[80px] text-[#ffffff] tracking-[-0.035em] leading-[1.04] drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)] max-w-[900px]">
          {tagline.toLowerCase().includes('what did i miss') ? (
            <>
              The Unread Problem.
              <br />
              <span className="bg-gradient-to-r from-[#ffffff] via-[#ffffff] to-[#ff6363] bg-clip-text text-transparent">
                "What Did I Miss?"
              </span>
            </>
          ) : (
            tagline
          )}
        </h1>

        {/* Subheadline: 18px - 21px Inter font, white/ash */}
        <p className="mt-5 sm:mt-6 font-['Inter'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#ffffff]/90 max-w-[680px] leading-[1.45] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
          {subheadline ||
            'A lightning-fast AI micro-app that prioritizes overwhelming chat conversations into executive summaries, P0 outage alerts, action items, and missed @mentions — with local-first edge privacy.'}
        </p>

        {/* Hero Interactive Call-to-Actions (Clean 2-button layout) */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 z-20">
          <button
            onClick={onOpenConnectWorkspace}
            className="flex items-center gap-2 bg-[#ff6363] hover:bg-[#ff7a7a] text-[#040506] font-['Inter'] font-semibold text-[14px] px-6 py-3 rounded-[10px] shadow-[0_4px_28px_rgba(255,99,99,0.45)] transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#040506]" />
            <span>Connect Workspaces & Summarize</span>
          </button>

          <button
            onClick={onOpenCatchUp}
            className="flex items-center gap-2 bg-[#111214]/90 hover:bg-[#1b1c1e] text-[#ffffff] border border-[#363739] font-['Inter'] font-medium text-[14px] px-5 py-3 rounded-[10px] backdrop-blur-md transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          >
            <span>Live Triage (⌘U)</span>
            <ArrowDown className="w-4 h-4 text-[#9c9c9d]" />
          </button>
        </div>

        {/* Unified Composio Platform Integrations Strip */}
        <div className="mt-10 sm:mt-12 w-full max-w-[880px] flex flex-col items-center text-center">
          {/* Top Announcement Pill */}
          <button
            onClick={onOpenConnectWorkspace}
            className="group relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0d0f14]/90 hover:bg-[#141721] border border-[#262836] hover:border-[#ff6363]/50 transition-all duration-300 shadow-[0_0_24px_rgba(255,99,99,0.12)] backdrop-blur-xl cursor-pointer mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6363] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6363] shadow-[0_0_6px_#ff6363]" />
            </span>
            <span className="text-[10px] font-['GeistMono'] font-bold uppercase tracking-wider text-[#ff7575] bg-[#ff6363]/12 border border-[#ff6363]/25 px-2 py-0.5 rounded-full">
              OAUTH 2.0
            </span>
            <span className="text-[12px] font-['Inter'] font-medium text-[#d4d6e0] tracking-tight group-hover:text-[#ffffff] transition-colors">
              CONNECT ONCE VIA COMPOSIO • AUTONOMOUS AI INGESTION
            </span>
            <span className="text-[12px] text-[#ff6363] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
              →
            </span>
          </button>

          {/* Platform Logos Pill Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {[
              {
                id: 'teams',
                name: 'Microsoft Teams',
                Icon: PlatformIcons.Teams,
                hoverClass: 'hover:border-[#505AC9]/50 hover:shadow-[0_4px_20px_rgba(80,90,201,0.22)]',
              },
              {
                id: 'slack',
                name: 'Slack',
                Icon: PlatformIcons.Slack,
                hoverClass: 'hover:border-[#E01E5A]/50 hover:shadow-[0_4px_20px_rgba(224,30,90,0.22)]',
              },
              {
                id: 'notion',
                name: 'Notion',
                Icon: PlatformIcons.Notion,
                hoverClass: 'hover:border-[#ffffff]/40 hover:shadow-[0_4px_20px_rgba(255,255,255,0.12)]',
              },
              {
                id: 'github',
                name: 'GitHub',
                Icon: PlatformIcons.GitHub,
                hoverClass: 'hover:border-[#9c9c9d]/40 hover:shadow-[0_4px_20px_rgba(255,255,255,0.1)]',
              },
              {
                id: 'discord',
                name: 'Discord',
                Icon: PlatformIcons.Discord,
                hoverClass: 'hover:border-[#5865F2]/50 hover:shadow-[0_4px_20px_rgba(88,101,242,0.22)]',
              },
              {
                id: 'google',
                name: 'Google Workspace',
                Icon: PlatformIcons.Google,
                hoverClass: 'hover:border-[#4285F4]/50 hover:shadow-[0_4px_20px_rgba(66,133,244,0.22)]',
              },
            ].map(({ id, name, Icon, hoverClass }) => (
              <button
                key={id}
                onClick={onOpenConnectWorkspace}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] bg-[#0c0d12]/90 hover:bg-[#141620] border border-[#232532] ${hoverClass} transition-all duration-200 cursor-pointer shadow-sm group shrink-0 hover:-translate-y-0.5 active:translate-y-0`}
                title={`Connect ${name} via Composio`}
              >
                <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="font-['Inter'] text-[13px] font-medium text-[#d4d6e0] group-hover:text-[#ffffff] transition-colors">
                  {name}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3.5 text-[12px] font-['Inter'] text-[#7a7b82]">
            We connect to your platforms so you don't have to read unread chats yourself.
          </p>
        </div>

        {/* Clean Architecture Spec Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[12px] font-['GeistMono'] text-[#9c9c9d]">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#59d499]" />
            <span>&lt;1.2s Groq LPU Synthesis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#59d499]" />
            <span>100% Local-First Edge Privacy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6363]" />
            <span>Slack, Notion & Teams Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
