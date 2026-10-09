import React, { useState } from 'react';
import { X, Sparkles, Check, Copy } from 'lucide-react';
import type { SiteConfig } from '../config/siteConfig';

interface CustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onUpdateConfig: (updated: Partial<SiteConfig>) => void;
}

export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const presets = [
    {
      name: 'BMSIT&M PS: The Unread Problem',
      projectName: 'CatchUp // AI',
      tagline: 'The Unread Problem — "What Did I Miss?"',
      subheadline:
        'A lightning-fast AI micro-app that prioritizes overwhelming chat conversations, extracts decisions & action items, surfaces missed @mentions, and keeps data 100% private with local-first processing.',
      heroBadgeText: 'BMSIT&M HACKATHON 2026 • THE UNREAD PROBLEM',
      installCommand: 'npx catchup-ai --channel teams-war-room',
    },
    {
      name: 'AI Agent & DevTools',
      projectName: 'KORONA // COMMAND',
      tagline: 'Your shortcut to everything.',
      subheadline:
        'An ultra-fast developer cockpit built for the 2026 hackathon. Neural command routing, sub-millisecond workflows, and modular extensions at your fingertips.',
      heroBadgeText: 'AI COMMAND LAYER • READY FOR TOMORROW',
      installCommand: 'npm create hackathon-pilot@latest',
    },
    {
      name: 'Healthcare & Clinical AI',
      projectName: 'MEDPULSE // NEURAL',
      tagline: 'Instant diagnostic reasoning for critical care.',
      subheadline:
        'Sub-second clinical triage and multimodal patient record synthesis powered by fine-tuned medical reasoning models.',
      heroBadgeText: 'CLINICAL TRIAGE • HACKATHON 2026',
      installCommand: 'npm create medpulse-ai@latest',
    },
    {
      name: 'Fintech & Fraud Sentinel',
      projectName: 'SENTINEL // VAULT',
      tagline: 'Autonomous transaction intelligence at wire speed.',
      subheadline:
        'Graph-neural fraud interdiction and real-time ledger verification processing 100,000 TPS under 5ms latency.',
      heroBadgeText: 'FINANCIAL INTELLIGENCE • REAL-TIME MESH',
      installCommand: 'npm create sentinel-fraud@latest',
    },
    {
      name: 'Cyber Security & Zero Trust',
      projectName: 'AEGIS // ZERO-TRUST',
      tagline: 'Autonomous edge threat interceptor.',
      subheadline:
        'Real-time behavioral telemetry, automated zero-day quarantine, and micro-segmentation for high-threat infrastructure.',
      heroBadgeText: 'DEFENSE MATRIX • ACTIVE MONITORING',
      installCommand: 'npm create aegis-security@latest',
    },
  ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    onUpdateConfig({
      projectName: preset.projectName,
      tagline: preset.tagline,
      subheadline: preset.subheadline,
      heroBadgeText: preset.heroBadgeText,
      installCommand: preset.installCommand,
    });
  };

  const handleCopyConfigSnippet = () => {
    const snippet = `// Paste into src/config/siteConfig.ts tomorrow:
export const defaultSiteConfig: SiteConfig = {
  hackathonName: "${config.hackathonName}",
  projectName: "${config.projectName}",
  tagline: "${config.tagline}",
  subheadline: "${config.subheadline}",
  version: "${config.version}",
  platform: "${config.platform}",
  installCommand: "${config.installCommand}",
  primaryCtaText: "${config.primaryCtaText}",
  secondaryCtaText: "${config.secondaryCtaText}",
  heroBadgeText: "${config.heroBadgeText}",
  // ...features and commands
};`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[6px] animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-[480px] h-full bg-[#07080a] border-l border-[#2f3031] p-6 overflow-y-auto flex flex-col justify-between z-10"
        style={{
          boxShadow: 'rgba(255, 255, 255, 0.05) -1px 0px 0px 0px inset, -16px 0 40px rgba(0,0,0,0.8)',
        }}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1b1c1e]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff6363]" />
              <h3 className="font-['Inter'] font-semibold text-[16px] text-[#ffffff]">
                Hackathon Customizer
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#6a6b6c] hover:text-[#ffffff] rounded hover:bg-[#111214]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Notice */}
          <div className="my-4 p-3 rounded-[8px] bg-[#111214] border border-[#2f3031] text-[12px] font-['Inter'] text-[#9c9c9d] leading-relaxed">
            <span className="text-[#ffffff] font-medium">Tomorrow's Hackathon Workflow:</span>
            <br />
            When your Problem Statement (PS) is released tomorrow, edit{' '}
            <code className="text-[#ff6363] font-mono">src/config/siteConfig.ts</code> or tweak the fields below in real-time to match your pitch!
          </div>

          {/* Preset Switcher */}
          <div className="mb-6">
            <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase tracking-wider mb-2">
              Try Instant Demo Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="p-2 text-left rounded-[6px] bg-[#111214] hover:bg-[#1b1c1e] border border-[#2f3031] hover:border-[#363739] text-[12px] font-['Inter'] text-[#ffffff] transition-all cursor-pointer"
                >
                  <div className="font-medium text-[#ffffff] truncate">{p.name}</div>
                  <div className="text-[10px] text-[#6a6b6c] truncate">{p.projectName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Form Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={config.projectName}
                onChange={(e) => onUpdateConfig({ projectName: e.target.value })}
                className="w-full bg-[#111214] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[14px] text-[#ffffff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase mb-1">
                Hero Headline (Tagline)
              </label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => onUpdateConfig({ tagline: e.target.value })}
                className="w-full bg-[#111214] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[14px] text-[#ffffff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase mb-1">
                Subheadline
              </label>
              <textarea
                rows={3}
                value={config.subheadline}
                onChange={(e) => onUpdateConfig({ subheadline: e.target.value })}
                className="w-full bg-[#111214] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase mb-1">
                Hero Badge Eyebrow
              </label>
              <input
                type="text"
                value={config.heroBadgeText}
                onChange={(e) => onUpdateConfig({ heroBadgeText: e.target.value })}
                className="w-full bg-[#111214] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase mb-1">
                Install / CLI Command
              </label>
              <input
                type="text"
                value={config.installCommand}
                onChange={(e) => onUpdateConfig({ installCommand: e.target.value })}
                className="w-full bg-[#111214] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-[#1b1c1e] space-y-2">
          <button
            onClick={handleCopyConfigSnippet}
            className="w-full flex items-center justify-center gap-2 bg-[#e6e6e6] hover:bg-[#ffffff] text-[#454647] font-['Inter'] text-[13px] font-medium py-2 rounded-[8px] transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-[#59d499]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Config for siteConfig.ts'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-1.5 text-[12px] font-['Inter'] text-[#9c9c9d] hover:text-[#ffffff] transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
