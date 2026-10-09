import React, { useState } from 'react';
import type { ExtensionTile } from '../config/siteConfig';
import { IconHelper } from './IconHelper';
import { Plus, Check } from 'lucide-react';

interface ExtensionsGridProps {
  extensions: ExtensionTile[];
  onOpenZapierModal?: () => void;
  onOpenTeamsCatchUp?: () => void;
}

export const ExtensionsGrid: React.FC<ExtensionsGridProps> = ({
  extensions,
  onOpenZapierModal,
  onOpenTeamsCatchUp,
}) => {
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({
    'ext-teams-catchup': true,
    'ext-zapier-mcp': true,
    'ext-teams-notion': true,
  });

  const handleInstallToggle = (id: string) => {
    if (id === 'ext-teams-catchup' && onOpenTeamsCatchUp) {
      onOpenTeamsCatchUp();
      return;
    }
    if ((id === 'ext-zapier-mcp' || id === 'ext-teams-notion') && onOpenZapierModal) {
      onOpenZapierModal();
      return;
    }
    setInstalledMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="extensions" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-[#1b1c1e]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#1b1c1e] border border-[#363739]/60 mb-3">
            <span className="font-['GeistMono'] text-[11px] font-medium tracking-[0.073em] uppercase text-[#ffffff]">
              ECOSYSTEM & STORE
            </span>
          </div>
          <h2 className="font-['Inter'] font-normal text-[28px] sm:text-[34px] text-[#ffffff] tracking-tight">
            Infinite extensions. Zero bloat.
          </h2>
          <p className="mt-2 font-['Inter'] text-[15px] text-[#9c9c9d] max-w-[500px]">
            Modular integrations pre-configured for APIs, vector stores, and Zapier MCP agent pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenZapierModal && (
            <button
              onClick={onOpenZapierModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#ff6363]/10 hover:bg-[#ff6363]/20 border border-[#ff6363]/30 text-[#ff6363] text-[12px] font-['GeistMono'] transition-all cursor-pointer"
            >
              <span>Zapier MCP Hub</span>
              <span>→</span>
            </button>
          )}
          <span className="font-['GeistMono'] text-[12px] text-[#6a6b6c]">
            {extensions.length} curated modules installed
          </span>
        </div>
      </div>

      {/* Grid of Extension Tiles: 8px radius, 8px padding, 1px solid #363739 border, tight 8px gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {extensions.map((ext) => {
          const isTeamsCatchUp = ext.id === 'ext-teams-catchup';
          const isZapierExt = ext.id === 'ext-zapier-mcp' || ext.id === 'ext-teams-notion';
          const isInstalled = !!installedMap[ext.id];

          return (
            <div
              key={ext.id}
              onClick={() => {
                if (isTeamsCatchUp && onOpenTeamsCatchUp) {
                  onOpenTeamsCatchUp();
                } else if (isZapierExt && onOpenZapierModal) {
                  onOpenZapierModal();
                }
              }}
              className={`flex items-center justify-between p-3 rounded-[8px] bg-[#07080a] border transition-colors duration-150 group ${
                isTeamsCatchUp
                  ? 'border-[#ff6363]/60 hover:border-[#ff6363] bg-[#ff6363]/5 cursor-pointer shadow-[0_0_20px_rgba(255,99,99,0.12)]'
                  : isZapierExt
                  ? 'border-[#ff6363]/40 hover:border-[#ff6363] cursor-pointer'
                  : 'border-[#363739]/80 hover:border-[#9c9c9d]/50'
              }`}
              style={{
                boxShadow: isTeamsCatchUp || isZapierExt
                  ? 'rgba(255, 99, 99, 0.08) 0px 0px 20px 2px, rgba(255, 255, 255, 0.03) 0px 1px 0px 0px inset'
                  : 'rgba(255, 255, 255, 0.03) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.3) 0px 2px 4px 0px',
              }}
            >
              {/* Left: 99999px Circular Icon + Name & Category */}
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-9 h-9 rounded-[99999px] flex items-center justify-center shrink-0 transition-colors ${
                    isZapierExt
                      ? 'bg-[#ff6363]/15 border border-[#ff6363]/40 text-[#ff6363]'
                      : 'bg-[#111214] border border-[#2f3031] text-[#e6e6e6] group-hover:border-[#ff6363]/40'
                  }`}
                >
                  <IconHelper
                    name={ext.icon}
                    className={`w-4 h-4 ${isZapierExt ? 'text-[#ff6363]' : 'text-[#e6e6e6]'}`}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-['Inter'] text-[14px] font-medium text-[#ffffff] truncate">
                      {ext.name}
                    </span>
                    {isTeamsCatchUp ? (
                      <span className="bg-[#ff6363]/20 text-[#ff6363] text-[9px] font-['GeistMono'] px-1.5 py-0.2 rounded font-semibold border border-[#ff6363]/40">
                        ⚡ GROQ PS
                      </span>
                    ) : isZapierExt ? (
                      <span className="bg-[#ff6363]/15 text-[#ff6363] text-[9px] font-['GeistMono'] px-1.5 py-0.2 rounded font-medium border border-[#ff6363]/30">
                        MCP
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Inter'] text-[12px] text-[#6a6b6c] truncate">
                      {ext.category}
                    </span>
                    <span className="text-[#363739] text-[10px]">•</span>
                    <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c]">
                      {ext.installs}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Install Action Pill */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInstallToggle(ext.id);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-['Inter'] font-medium transition-all cursor-pointer shrink-0 ${
                  isTeamsCatchUp
                    ? 'bg-[#ff6363] text-[#040506] font-semibold hover:bg-[#ff7a7a] shadow-[0_2px_8px_rgba(255,99,99,0.4)]'
                    : isZapierExt
                    ? 'bg-[#ff6363]/20 text-[#ff6363] hover:bg-[#ff6363]/30 border border-[#ff6363]/40'
                    : isInstalled
                    ? 'bg-[#1b1c1e] text-[#59d499] border border-[#59d499]/30'
                    : 'bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] border border-[#2f3031] hover:border-[#363739]'
                }`}
              >
                {isTeamsCatchUp ? (
                  <>
                    <span>Catch Up (⌘U)</span>
                    <span>→</span>
                  </>
                ) : isZapierExt ? (
                  <>
                    <span>Configure</span>
                    <span>→</span>
                  </>
                ) : isInstalled ? (
                  <>
                    <Check className="w-3 h-3 text-[#59d499]" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Enable</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
