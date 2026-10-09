import React, { useState } from 'react';
import { RaycastHeroScene } from './RaycastHeroScene';
import { Sparkles, ArrowDown, ShieldCheck, Zap } from 'lucide-react';
import { PlatformIcons } from './ComposioConnectSection';

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
        <div className="mt-10 sm:mt-12 w-full max-w-[840px] flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111214] border border-[#27282b] text-[11px] font-['GeistMono'] text-[#9c9c9d] uppercase tracking-[0.08em] mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6363] animate-pulse" />
            <span>Connect Once via Composio • Autonomous AI Ingestion</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {[
              { id: 'teams', name: 'Microsoft Teams', Icon: PlatformIcons.Teams },
              { id: 'slack', name: 'Slack', Icon: PlatformIcons.Slack },
              { id: 'notion', name: 'Notion', Icon: PlatformIcons.Notion },
              { id: 'github', name: 'GitHub', Icon: PlatformIcons.GitHub },
              { id: 'discord', name: 'Discord', Icon: PlatformIcons.Discord },
              { id: 'google', name: 'Google Workspace', Icon: PlatformIcons.Google },
            ].map(({ id, name, Icon }) => (
              <button
                key={id}
                onClick={onOpenConnectWorkspace}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#0c0d10] hover:bg-[#16171d] border border-[#27282b] hover:border-[#ff6363]/40 transition-all cursor-pointer shadow-sm group shrink-0"
                title={`Connect ${name} via Composio`}
              >
                <div className="w-4 h-4 shrink-0 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-['Inter'] text-[12px] font-medium text-[#cccccc] group-hover:text-[#ffffff]">
                  {name}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-[12px] font-['Inter'] text-[#6a6b6c]">
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
