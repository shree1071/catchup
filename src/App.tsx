import { useState, useEffect, lazy, Suspense } from 'react';
import { defaultSiteConfig, type SiteConfig, type CommandItem } from './config/siteConfig';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Check } from 'lucide-react';
import { Footer } from './components/Footer';

import { TriageComparisonSection } from './components/TriageComparisonSection';
import { ComposioConnectSection } from './components/ComposioConnectSection';
import { AppWindowMockup } from './components/AppWindowMockup';
import { FeatureGrid } from './components/FeatureGrid';
import { ExtensionsGrid } from './components/ExtensionsGrid';
import { QuickStartTerminal } from './components/QuickStartTerminal';

// Lazy-loaded heavy subviews & modals for optimal bundle splitting
const ChatbotView = lazy(() => import('./components/ChatbotView').then(m => ({ default: m.ChatbotView })));
const ConnectedWorkspaceView = lazy(() => import('./components/ConnectedWorkspaceView').then(m => ({ default: m.ConnectedWorkspaceView })));
const CommandPaletteModal = lazy(() => import('./components/CommandPaletteModal').then(m => ({ default: m.CommandPaletteModal })));
const ZapierMcpModal = lazy(() => import('./components/ZapierMcpModal').then(m => ({ default: m.ZapierMcpModal })));
const TeamsCatchUpModal = lazy(() => import('./components/TeamsCatchUpModal').then(m => ({ default: m.TeamsCatchUpModal })));
const CustomizeDrawer = lazy(() => import('./components/CustomizeDrawer').then(m => ({ default: m.CustomizeDrawer })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-5 h-5 border-2 border-[#ff6363]/30 border-t-[#ff6363] rounded-full animate-spin" />
    </div>
  );
}

export function App() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [activeView, setActiveView] = useState<'landing' | 'connect' | 'chat'>('landing');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isZapierModalOpen, setIsZapierModalOpen] = useState(false);
  const [isTeamsCatchUpOpen, setIsTeamsCatchUpOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Global Keyboard Shortcuts (⌘K for palette, ⌘J for AI Chat, ⌘Z for Zapier MCP, ⌘U for Teams CatchUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setActiveView((prev) => (prev === 'chat' ? 'landing' : 'chat'));
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        setIsZapierModalOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        setIsTeamsCatchUpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateConfig = (updated: Partial<SiteConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleExecuteCommand = (cmd: CommandItem) => {
    if (
      cmd.id === 'cmd-teams-catchup' ||
      cmd.id === 'cmd-teams-product' ||
      cmd.id === 'cmd-teams-mentions' ||
      cmd.id === 'cmd-toggle-privacy' ||
      cmd.id === 'cmd-what-did-i-miss'
    ) {
      setIsTeamsCatchUpOpen(true);
      setActiveToast(`Launched: ${cmd.title}`);
      setTimeout(() => setActiveToast(null), 3000);
      return;
    }

    if (cmd.id === 'cmd-groq-chat') {
      setActiveView('chat');
      setActiveToast('Switched to Groq AI Copilot');
      setTimeout(() => setActiveToast(null), 2500);
      return;
    }

    if (
      cmd.id === 'cmd-zapier-mcp' ||
      cmd.id === 'cmd-teams-message' ||
      cmd.id === 'cmd-notion-sync'
    ) {
      setIsZapierModalOpen(true);
      setActiveToast(`Launched: ${cmd.title}`);
      setTimeout(() => setActiveToast(null), 3000);
      return;
    }

    setActiveToast(`Executed: ${cmd.title} [${cmd.category}]`);
    setTimeout(() => {
      setActiveToast(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#040506] text-[#9c9c9d] font-['Inter'] relative selection:bg-[#ff6363]/30 selection:text-[#ffffff]">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#07080a] border border-[#363739] text-[#ffffff] px-4 py-2.5 rounded-[8px] shadow-[0_8px_30px_rgba(0,0,0,0.8)] font-['Inter'] text-[13px] animate-fade-in">
          <div className="w-5 h-5 rounded-full bg-[#59d499]/15 border border-[#59d499]/40 flex items-center justify-center text-[#59d499]">
            <Check className="w-3 h-3" />
          </div>
          <span>{activeToast}</span>
        </div>
      )}

      {/* Floating Glass Navigation (Hidden in Chat view for full-screen conversational UI) */}
      {activeView !== 'chat' && (
        <Navbar
          projectName={config.projectName}
          activeView={activeView}
          onNavigateView={(view) => setActiveView(view)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onOpenZapierModal={() => setIsZapierModalOpen(true)}
          onOpenTeamsCatchUp={() => setIsTeamsCatchUpOpen(true)}
        />
      )}

      {/* Main View: Landing vs Connect Hub vs AI Chatbot */}
      <ErrorBoundary fallbackTitle="View failed to load">
        <main className={`flex flex-col items-center w-full ${activeView === 'landing' ? 'pt-0' : activeView === 'chat' ? 'pt-0 h-screen overflow-hidden' : 'pt-20'}`}>
        {activeView === 'landing' ? (
          <>
            {/* Hero Section with Red/Blue Gradient Geometry & 56px Inter regular title */}
            <Hero
              tagline={config.tagline}
              subheadline={config.subheadline}
              version={config.version}
              platform={config.platform}
              installCommand={config.installCommand}
              heroBadgeText={config.heroBadgeText}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenCatchUp={() => setIsTeamsCatchUpOpen(true)}
              onOpenConnectWorkspace={() => setActiveView('connect')}
            />

            {/* Interactive "The Unread Chaos vs CatchUp AI Clarity" Live Triage Comparison */}
            <TriageComparisonSection
              onOpenCatchUpModal={() => setIsTeamsCatchUpOpen(true)}
              onOpenZapierModal={() => setIsZapierModalOpen(true)}
            />

            {/* Composio Platform Integrations Section (Teams, Slack, Notion, GitHub, Discord) */}
            <ComposioConnectSection
              onOpenTeamsCatchUp={() => setIsTeamsCatchUpOpen(true)}
              onOpenZapierModal={() => setIsZapierModalOpen(true)}
              onNotify={(msg) => {
                setActiveToast(msg);
                setTimeout(() => setActiveToast(null), 3000);
              }}
            />

            {/* Central Command Window Mockup (Tactile Key Shadow & Selected Coral Pulse) */}
            <AppWindowMockup
              commands={config.commands}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onExecuteCommand={handleExecuteCommand}
            />

            {/* Modular Architecture Feature Cards */}
            <FeatureGrid features={config.features} />

            {/* Extensions Ecosystem Showcase */}
            <ExtensionsGrid
              extensions={config.extensions}
              onOpenZapierModal={() => setIsZapierModalOpen(true)}
              onOpenTeamsCatchUp={() => setIsTeamsCatchUpOpen(true)}
            />

            {/* Quickstart Terminal & Bootstrap */}
            <QuickStartTerminal installCommand={config.installCommand} />
          </>
        ) : activeView === 'connect' ? (
          /* Dedicated Connected Workspaces (Slack, Notion, Teams) & AI Summarizer Studio */
          <Suspense fallback={<LoadingFallback />}>
            <ConnectedWorkspaceView
              onBackToLanding={() => setActiveView('landing')}
              onNavigateToChat={() => setActiveView('chat')}
              onOpenZapierModal={() => setIsZapierModalOpen(true)}
            />
          </Suspense>
        ) : (
          /* Full AI Chatbot View powered by Groq API & Zapier MCP */
          <Suspense fallback={<LoadingFallback />}>
            <ChatbotView
              onBackToLanding={() => setActiveView('landing')}
              onOpenZapierModal={() => setIsZapierModalOpen(true)}
            />
          </Suspense>
        )}
        </main>
      </ErrorBoundary>

      {/* Footer (Hidden in chat view for native full-height chat app) */}
      {activeView !== 'chat' && (
        <Footer
          version={config.version}
          projectName={config.projectName}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />
      )}

      <Suspense fallback={null}>
        {/* Global Command Palette Overlay Modal (⌘K) */}
        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          commands={config.commands}
          onExecuteCommand={handleExecuteCommand}
        />

        {/* Zapier MCP & Agent Skills Modal (Teams, Notion, Slack) */}
        <ZapierMcpModal
          isOpen={isZapierModalOpen}
          onClose={() => setIsZapierModalOpen(false)}
          onNotify={(msg) => {
            setActiveToast(msg);
            setTimeout(() => setActiveToast(null), 3000);
          }}
        />

        {/* Teams CatchUp "What Did I Miss?" AI Summarizer (Groq LPU + Local-First) */}
        <TeamsCatchUpModal
          isOpen={isTeamsCatchUpOpen}
          onClose={() => setIsTeamsCatchUpOpen(false)}
          onNotify={(msg) => {
            setActiveToast(msg);
            setTimeout(() => setActiveToast(null), 3000);
          }}
        />

        {/* Hackathon PS Customizer Drawer */}
        <CustomizeDrawer
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          config={config}
          onUpdateConfig={handleUpdateConfig}
        />
      </Suspense>
    </div>
  );
}

export default App;
