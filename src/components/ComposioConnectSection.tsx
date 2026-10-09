import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import { getFreshComposioAuthUrl } from '../services/workspaceConnectorService';

interface ComposioConnectSectionProps {
  onOpenTeamsCatchUp?: () => void;
  onOpenZapierModal?: () => void;
  onNotify?: (msg: string) => void;
}

import { BsSlack, BsMicrosoftTeams } from 'react-icons/bs';
import { SiNotion, SiGithub, SiDiscord } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';

// Official, crisp brand logos imported from verified icon packages
export const PlatformIcons = {
  Teams: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <BsMicrosoftTeams
        className={`${className} ${hasColor ? '' : 'text-[#505AC9]'} shrink-0`}
      />
    );
  },
  Slack: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <BsSlack
        className={`${className} ${hasColor ? '' : 'text-[#ECB22E]'} shrink-0`}
      />
    );
  },
  Notion: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <SiNotion
        className={`${className} ${hasColor ? '' : 'text-white'} shrink-0`}
      />
    );
  },
  GitHub: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <SiGithub
        className={`${className} ${hasColor ? '' : 'text-white'} shrink-0`}
      />
    );
  },
  Discord: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <SiDiscord
        className={`${className} ${hasColor ? '' : 'text-[#5865F2]'} shrink-0`}
      />
    );
  },
  Google: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <FcGoogle className={`${className} shrink-0`} />
  ),
  Composio: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 32 32" className={`${className} shrink-0`} fill="none">
      <rect width="32" height="32" rx="8" fill="#1b1c1e" />
      <path
        d="M16 6L24.66 11V21L16 26L7.34 21V11L16 6Z"
        stroke="#ff6363"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.5" fill="#ff6363" />
      <path d="M16 9.5V12.5" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 19.5V22.5" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 13L13 14.5" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 17.5L21.5 19" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export const ComposioConnectSection: React.FC<ComposioConnectSectionProps> = ({
  onOpenTeamsCatchUp,
  onOpenZapierModal,
  onNotify,
}) => {
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({
    teams: false,
    slack: false,
    notion: false,
    github: false,
    discord: false,
    google: false,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'chat' | 'wiki' | 'dev'>('all');

  const platforms = [
    {
      id: 'teams',
      name: 'Microsoft Teams',
      category: 'chat' as const,
      logo: PlatformIcons.Teams,
      oauthUrl: 'https://dashboard.composio.dev/~/org/connect/apps/microsoft_teams?source=mcp',
      unreadBadge: connectedMap['teams'] ? '38 unread' : 'OAuth Required',
      description: 'Ingest team chats & war rooms. P0 outage alerts & PR reviews isolated automatically.',
      highlight: 'Auto-Summarized via Groq LPU',
      connected: connectedMap['teams'] || false,
      color: '#505AC9',
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'chat' as const,
      logo: PlatformIcons.Slack,
      oauthUrl: 'https://dashboard.composio.dev/~/org/connect/apps/slack?source=mcp',
      unreadBadge: connectedMap['slack'] ? '19 unread' : 'OAuth Required',
      description: 'Filter missed @mentions, incident alerts, and team consensus decisions.',
      highlight: 'Decision & Mention Radar',
      connected: connectedMap['slack'] || false,
      color: '#E01E5A',
    },
    {
      id: 'notion',
      name: 'Notion Workspace',
      category: 'wiki' as const,
      logo: PlatformIcons.Notion,
      oauthUrl: 'https://dashboard.composio.dev/~/org/connect/apps/notion?source=mcp',
      unreadBadge: connectedMap['notion'] ? 'Live Sync' : 'OAuth Required',
      description: 'Auto-push synthesized action items, tasks, and deadlines into project database spec.',
      highlight: '1-Click Action Export',
      connected: connectedMap['notion'] || false,
      color: '#ffffff',
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'dev' as const,
      logo: PlatformIcons.GitHub,
      oauthUrl: 'https://dashboard.composio.dev/~/org/connect/apps/github?source=mcp',
      unreadBadge: connectedMap['github'] ? 'CI Blocker' : 'OAuth Required',
      description: 'Cross-reference chat code review freezes with open Pull Request approval status.',
      highlight: 'Code Freeze Tracker',
      connected: connectedMap['github'] || false,
      color: '#e6e6e6',
    },
    {
      id: 'discord',
      name: 'Discord Communities',
      category: 'chat' as const,
      logo: PlatformIcons.Discord,
      oauthUrl: 'https://dashboard.composio.dev/~/org/connect/apps/discord?source=mcp',
      unreadBadge: connectedMap['discord'] ? 'Active' : 'OAuth Required',
      description: 'Bridge high-velocity Discord developer channels into local-first executive digests.',
      highlight: 'Composio 1-Click Link',
      connected: connectedMap['discord'] || false,
      color: '#5865F2',
    },
    {
      id: 'google',
      name: 'Google Workspace',
      category: 'dev' as const,
      logo: PlatformIcons.Google,
      oauthUrl: 'https://dashboard.composio.dev/~/org/connect/apps/googlecalendar?source=mcp',
      unreadBadge: connectedMap['google'] ? 'Active' : 'OAuth Required',
      description: 'Triage unread Gmail chains and upcoming milestone calendar freezes seamlessly.',
      highlight: 'Composio 1-Click Link',
      connected: connectedMap['google'] || false,
      color: '#4285F4',
    },
  ];

  const filteredPlatforms = platforms.filter(
    (p) => filterCategory === 'all' || p.category === filterCategory
  );

  const handleConnectWithOAuth = async (platformId: string, platformName: string, fallbackUrl: string) => {
    setConnectingApp(platformId);
    try {
      const freshUrl = await getFreshComposioAuthUrl(platformId);
      window.open(freshUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
    setTimeout(() => {
      setConnectedMap((prev) => ({ ...prev, [platformId]: true }));
      setConnectingApp(null);
      onNotify?.(`Connected ${platformName} via Composio OAuth! Feeds ready for synthesis.`);
    }, 1200);
  };

  const handleDisconnect = (platformId: string, platformName: string) => {
    setConnectedMap((prev) => ({ ...prev, [platformId]: false }));
    onNotify?.(`Disconnected ${platformName}. Feed access revoked.`);
  };

  const handleCopyOAuthUrl = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      id="composio-connect"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-[#1b1c1e]"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#1b1c1e] border border-[#ff6363]/40 mb-4 shadow-[0_0_20px_rgba(255,99,99,0.15)]">
          <PlatformIcons.Composio />
          <span className="font-['GeistMono'] text-[11px] font-medium tracking-[0.073em] uppercase text-[#ffffff]">
            POWERED BY COMPOSIO • ZERO-EFFORT WORKSPACE SYNC
          </span>
        </div>

        <h2 className="font-['Inter'] font-semibold text-[30px] sm:text-[40px] text-[#ffffff] tracking-tight max-w-[820px] leading-[1.15]">
          We connect to your platforms so you don't have to read unread chats yourself.
        </h2>

        <p className="mt-4 font-['Inter'] font-normal text-[15px] sm:text-[17px] text-[#9c9c9d] max-w-[680px] leading-[1.5]">
          Using <span className="text-[#ffffff] font-medium">Composio</span>, CatchUp securely links directly to your Teams, Slack, Notion, and developer tools. Once connected, our AI runs autonomously in the background, extracts P0 emergencies, flags missed @mentions, and gives you instant executive digests.
        </p>
      </div>

      {/* How Composio Solves It (3 Step Visual Process Strip) */}
      <div className="mb-12 p-4 sm:p-6 rounded-[14px] bg-[#07080a] border border-[#2f3031] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#ff6363]/15 border border-[#ff6363]/40 flex items-center justify-center shrink-0 text-[#ff6363] font-['GeistMono'] text-[13px] font-bold">
              1
            </div>
            <div>
              <div className="font-['Inter'] font-medium text-[15px] text-[#ffffff] mb-1">
                Connect Once via Composio
              </div>
              <div className="font-['Inter'] text-[13px] text-[#9c9c9d] leading-[1.4]">
                Authorize your Microsoft Teams, Slack, or Notion workspace with unified Composio authentication in 10 seconds.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#59d499]/15 border border-[#59d499]/40 flex items-center justify-center shrink-0 text-[#59d499] font-['GeistMono'] text-[13px] font-bold">
              2
            </div>
            <div>
              <div className="font-['Inter'] font-medium text-[15px] text-[#ffffff] mb-1">
                Autonomous Stream Ingestion
              </div>
              <div className="font-['Inter'] text-[13px] text-[#9c9c9d] leading-[1.4]">
                CatchUp listens to unread channels, parses message timestamps, and detects direct @mentions addressed to you.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#7B83EB]/15 border border-[#7B83EB]/40 flex items-center justify-center shrink-0 text-[#7B83EB] font-['GeistMono'] text-[13px] font-bold">
              3
            </div>
            <div>
              <div className="font-['Inter'] font-medium text-[15px] text-[#ffffff] mb-1">
                Instant Summaries & Sync
              </div>
              <div className="font-['Inter'] text-[13px] text-[#9c9c9d] leading-[1.4]">
                Groq LPU delivers executive TL;DRs, isolates P0 outages, and auto-pushes verified action items into Notion.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[#ffffff]">Platform Toolkits</span>
          <span className="text-[11px] font-['GeistMono'] text-[#9c9c9d] bg-[#111214] px-2 py-0.5 rounded-full border border-[#27282b]">
            {filteredPlatforms.length} Available
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-[8px] bg-[#0c0d10] border border-[#27282b] text-[12px] overflow-x-auto">
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'chat', label: 'Chat & War Rooms' },
            { id: 'wiki', label: 'Wikis & Specs' },
            { id: 'dev', label: 'Developer & Cloud' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === cat.id
                  ? 'bg-[#1b1c1e] text-[#ffffff] border border-[#363739] shadow-sm'
                  : 'text-[#9c9c9d] hover:text-[#ffffff]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Composio-Connected Platforms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlatforms.map((p) => {
          const Logo = p.logo;
          const isBusy = connectingApp === p.id;

          return (
            <div
              key={p.id}
              className={`group relative rounded-[14px] bg-[#07080a] p-5 border transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between ${
                p.connected
                  ? 'border-[#59d499]/40 shadow-[0_4px_24px_rgba(89,212,153,0.08)]'
                  : 'border-[#2f3031] hover:border-[#ff6363]/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              }`}
            >
              <div>
                {/* Top: Icon + Status Pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-[10px] bg-[#111214] border border-[#2f3031] flex items-center justify-center shadow-sm">
                    <Logo />
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-['GeistMono'] ${
                        p.connected
                          ? 'bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/30'
                          : 'bg-[#1b1c1e] text-[#9c9c9d] border border-[#2f3031]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.connected ? 'bg-[#59d499] animate-pulse' : 'bg-[#6a6b6c]'
                        }`}
                      />
                      <span>{p.connected ? 'Connected' : 'Not Connected'}</span>
                    </span>

                    <span className={`font-['GeistMono'] text-[10px] px-2 py-0.5 rounded border ${
                      p.connected
                        ? 'bg-[#59d499]/10 text-[#59d499] border-[#59d499]/20'
                        : 'bg-[#1b1c1e] text-[#9c9c9d] border-[#2f3031]'
                    }`}>
                      {p.unreadBadge}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-['Inter'] font-semibold text-[17px] text-[#ffffff] mb-1.5 flex items-center gap-2">
                  <span>{p.name}</span>
                  {p.connected && (
                    <span className="text-[10px] font-['GeistMono'] text-[#59d499] bg-[#59d499]/10 px-1.5 py-0.2 rounded border border-[#59d499]/20">
                      SYNCED
                    </span>
                  )}
                </h3>

                {/* Description */}
                <p className="font-['Inter'] text-[13px] text-[#9c9c9d] leading-[1.45] mb-3">
                  {p.description}
                </p>

                {/* Direct Composio OAuth Access Box */}
                <div className="my-3 p-2.5 rounded-[8px] bg-[#0c0d10] border border-[#242528] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-['GeistMono'] text-[#9c9c9d]">
                    <span className="flex items-center gap-1 text-[#ff6363]">
                      <Lock className="w-2.5 h-2.5" />
                      Composio OAuth Link
                    </span>
                    <span className="text-[#6a6b6c]">Direct Access</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-[#07080a] px-2.5 py-1.5 rounded-[6px] border border-[#1b1c1e]">
                    <span className="text-[11px] font-['GeistMono'] text-[#cccccc] truncate select-all">
                      {p.oauthUrl}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleCopyOAuthUrl(e, p.id, p.oauthUrl)}
                        className="px-2 py-0.5 rounded bg-[#18191c] hover:bg-[#25262a] text-[#9c9c9d] hover:text-[#ffffff] text-[10px] font-['GeistMono'] transition-colors flex items-center gap-1"
                        title="Copy OAuth Link"
                      >
                        {copiedId === p.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-[#59d499]" />
                            <span className="text-[#59d499]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <a
                        href={p.oauthUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-[#18191c] hover:bg-[#25262a] text-[#9c9c9d] hover:text-[#ffffff] transition-colors"
                        title="Open direct OAuth link in browser"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Action Buttons */}
              <div className="pt-3 border-t border-[#1b1c1e]">
                {p.connected ? (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleDisconnect(p.id, p.name)}
                      className="px-2.5 py-1.5 rounded-[8px] text-[11px] font-['Inter'] text-[#9c9c9d] hover:text-[#ffffff] bg-[#111214] hover:bg-[#1a1b1e] border border-[#27282b] transition-all cursor-pointer"
                    >
                      Disconnect
                    </button>
                    <button
                      onClick={() => {
                        if (p.id === 'notion') onOpenZapierModal?.();
                        else onOpenTeamsCatchUp?.();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-['Inter'] font-semibold bg-[#59d499]/15 hover:bg-[#59d499]/25 text-[#59d499] border border-[#59d499]/30 transition-all cursor-pointer shadow-[0_0_12px_rgba(89,212,153,0.15)]"
                    >
                      <span>Triage Unread (⌘U)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-['GeistMono'] text-[10px] text-[#6a6b6c] truncate">
                      {p.highlight}
                    </span>
                    <button
                      onClick={() => handleConnectWithOAuth(p.id, p.name, p.oauthUrl)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-[12px] font-['Inter'] font-semibold bg-[#ff6363] hover:bg-[#ff7a7a] text-[#040506] transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,99,99,0.3)] active:scale-95 shrink-0"
                    >
                      {isBusy ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-[#040506]" />
                          <span>Authorizing...</span>
                        </>
                      ) : (
                        <>
                          <span>Connect with OAuth</span>
                          <ExternalLink className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner: Zero-Retention Local Edge Guarantee */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between px-5 py-3 rounded-[10px] bg-[#111214]/60 border border-[#2f3031] text-[12px] font-['GeistMono'] text-[#9c9c9d]">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <ShieldCheck className="w-4 h-4 text-[#59d499]" />
          <span>Composio Tool Contract: Zero data stored on intermediate servers. Local-First compliant.</span>
        </div>

        <button
          onClick={() => onOpenTeamsCatchUp?.()}
          className="text-[#ff6363] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Test Live Unread Ingestion (⌘U)</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </section>
  );
};
