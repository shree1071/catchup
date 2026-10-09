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

interface ComposioConnectSectionProps {
  onOpenTeamsCatchUp?: () => void;
  onOpenZapierModal?: () => void;
  onNotify?: (msg: string) => void;
}

// Pixel-perfect Brand Logos for Composio-connected platforms
export const PlatformIcons = {
  Teams: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 48 48" className={`${className} shrink-0`} fill="none">
      <path
        d="M29 16.5h11a3.5 3.5 0 0 1 3.5 3.5v15a3.5 3.5 0 0 1-3.5 3.5H29a2 2 0 0 1-2-2V18.5a2 2 0 0 1 2-2z"
        fill="#505AC9"
      />
      <circle cx="34.5" cy="10.5" r="4.5" fill="#505AC9" />
      <path
        d="M9 20.5h15a3.5 3.5 0 0 1 3.5 3.5v17a3.5 3.5 0 0 1-3.5 3.5H9a3.5 3.5 0 0 1-3.5-3.5V24A3.5 3.5 0 0 1 9 20.5z"
        fill="#464EB8"
      />
      <circle cx="16.5" cy="12.5" r="5.5" fill="#464EB8" />
      <rect x="7" y="24" width="19" height="18" rx="2" fill="#7B83EB" />
      <path
        d="M19 28.5h-5v2.2h1.8v8.3h2.4v-8.3H19v-2.2z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  Slack: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none">
      <path
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523 2.52 2.52 0 0 1 2.52-2.52h2.52v2.52c0 1.394-1.127 2.523-2.52 2.523z"
        fill="#E01E5A"
      />
      <path
        d="M6.302 15.165a2.528 2.528 0 0 1 2.52-2.523 2.52 2.52 0 0 1 2.52 2.523v6.315a2.528 2.528 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52v-6.315z"
        fill="#E01E5A"
      />
      <path
        d="M8.822 5.042a2.528 2.528 0 0 1-2.52-2.52 2.52 2.52 0 0 1 2.52-2.522 2.52 2.52 0 0 1 2.52 2.522v2.52H8.822z"
        fill="#36C5F0"
      />
      <path
        d="M8.822 6.302a2.528 2.528 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.52H2.507A2.528 2.528 0 0 1-.013 8.822a2.52 2.52 0 0 1 2.52-2.52h6.315z"
        fill="#36C5F0"
      />
      <path
        d="M18.958 8.822a2.528 2.528 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.523h-2.52v-2.523c0-1.393 1.127-2.52 2.52-2.52z"
        fill="#2EB67D"
      />
      <path
        d="M17.698 8.822a2.528 2.528 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52V2.507A2.528 2.528 0 0 1 15.178-.013a2.52 2.52 0 0 1 2.52 2.52v6.315z"
        fill="#2EB67D"
      />
      <path
        d="M15.178 18.958a2.528 2.528 0 0 1 2.52 2.52 2.52 2.52 0 0 1 2.52 2.522 2.52 2.52 0 0 1-2.52-2.522v-2.52h2.52z"
        fill="#ECB22E"
      />
      <path
        d="M15.178 17.698a2.528 2.528 0 0 1-2.52-2.52 2.52 2.52 0 0 1 2.52-2.52h6.315a2.528 2.528 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.52h-6.315z"
        fill="#ECB22E"
      />
    </svg>
  ),
  Notion: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.433-.84c1.167-.093 1.587.327 1.353 1.493l-1.914 9.939c-.234 1.213-.7 1.587-1.867 1.68l-11.854.747c-1.167.093-1.634-.374-1.4-1.587l1.821-9.985c.234-1.213.607-1.633 1.954-1.633zm2.94 2.893l-1.4 7.514 1.774-.14 1.4-7.514-1.774.14zm5.087-.373l-3.267.233-.28 1.447 1.447-.093 1.82 4.154-.42 2.24 2.707-.186.42-2.24-1.773-4.108 1.4-.093.28-1.447-2.334.093zm3.92-.28l-1.4 7.514 1.774-.14 1.4-7.514-1.774.14z" />
    </svg>
  ),
  GitHub: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  ),
  Discord: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  Google: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
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
      oauthUrl: 'https://connect.composio.dev/link/lk_pQFDirDB0_mA',
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
      oauthUrl: 'https://connect.composio.dev/link/lk_u8c23cBc0A4e',
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
      oauthUrl: 'https://connect.composio.dev/link/lk_f0pnCtTxFs7s',
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
      oauthUrl: 'https://connect.composio.dev/link/lk_github_connect',
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
      oauthUrl: 'https://connect.composio.dev/link/lk_discord_connect',
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
      oauthUrl: 'https://connect.composio.dev/link/lk_google_connect',
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

  const handleConnectWithOAuth = (platformId: string, platformName: string, oauthUrl: string) => {
    setConnectingApp(platformId);
    // Open Composio OAuth authorization page directly
    window.open(oauthUrl, '_blank', 'noopener,noreferrer');
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
