import React, { useState } from 'react';
import { Search, CornerDownLeft, Check, ExternalLink, Sparkles } from 'lucide-react';
import type { CommandItem } from '../config/siteConfig';
import { IconHelper } from './IconHelper';

interface AppWindowMockupProps {
  commands: CommandItem[];
  onOpenCommandPalette: () => void;
  onExecuteCommand?: (command: CommandItem) => void;
}

export const AppWindowMockup: React.FC<AppWindowMockupProps> = ({
  commands,
  onOpenCommandPalette,
  onExecuteCommand,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'All' | 'AI Tools' | 'Commands' | 'Navigation'>('All');
  const [executedFeedback, setExecutedFeedback] = useState<string | null>(null);

  const filteredCommands = commands.filter((cmd) => {
    const matchesTab = activeTab === 'All' || cmd.category === activeTab;
    const matchesSearch =
      cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSelect = (idx: number, item: CommandItem) => {
    setSelectedIndex(idx);
    setExecutedFeedback(`Triggered: ${item.title}`);
    onExecuteCommand?.(item);
    setTimeout(() => setExecutedFeedback(null), 2500);
  };

  return (
    <div id="command-center" className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 my-8 sm:my-14">
      {/* Container with tactile key shadow and window chrome */}
      <div
        className="relative rounded-[16px] bg-[#07080a] border border-[#2f3031]/80 overflow-hidden"
        style={{
          boxShadow:
            'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.22) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 24px 60px 12px, rgba(0, 0, 0, 0.6) 0px -1px 0px 0px inset',
        }}
      >
        {/* Top Window Bar: Traffic Lights + Window Title */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#07080a] border-b border-[#1b1c1e]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#363739]/60 hover:bg-[#ff5f56] transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-[#363739]/60 hover:bg-[#ffbd2e] transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-[#363739]/60 hover:bg-[#27c93f] transition-colors cursor-pointer" />
            <span className="ml-3 font-['GeistMono'] text-[11px] text-[#6a6b6c] tracking-wide">
              catchup-ai // unread-chat-triage-cockpit
            </span>
          </div>

          <div className="flex items-center gap-3">
            {executedFeedback && (
              <span className="flex items-center gap-1.5 text-[11px] font-['GeistMono'] text-[#59d499] bg-[#59d499]/10 px-2 py-0.5 rounded-[4px] border border-[#59d499]/30 animate-pulse">
                <Check className="w-3 h-3" />
                {executedFeedback}
              </span>
            )}
            <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c] hidden sm:inline">
              Press <kbd className="bg-[#111214] text-[#9c9c9d] px-1 py-0.5 rounded border border-[#2f3031]">↑</kbd> <kbd className="bg-[#111214] text-[#9c9c9d] px-1 py-0.5 rounded border border-[#2f3031]">↓</kbd> or click to triage
            </span>
          </div>
        </div>

        {/* Command Search Well: Recessed Input Well (#111214) */}
        <div className="p-3 sm:p-4 bg-[#07080a] border-b border-[#1b1c1e]">
          <div className="relative flex items-center bg-[#111214] rounded-[8px] border border-[#2f3031] px-3.5 py-2.5 transition-all focus-within:border-[#ff6363]/60 focus-within:ring-1 focus-within:ring-[#ff6363]/30">
            <Search className="w-4 h-4 text-[#9c9c9d] mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search 121 unread messages, @mentions, P0 incidents, or action items (e.g. 'war-room', 'Sarah', 'P0', 'PR')..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-transparent text-[#ffffff] font-['Inter'] text-[15px] sm:text-[16px] placeholder-[#6a6b6c] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[12px] text-[#6a6b6c] hover:text-[#ffffff] px-1.5 font-['GeistMono']"
              >
                Clear
              </button>
            )}
            <div className="ml-2 pl-2 border-l border-[#2f3031] flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-['GeistMono'] text-[#6a6b6c]">ACTIONS</span>
              <kbd className="bg-[#1b1c1e] text-[#9c9c9d] text-[10px] px-1.5 py-0.5 rounded border border-[#363739]">
                ↵
              </kbd>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-[12px] font-['Inter']">
            {(['All', 'AI Tools', 'Commands', 'Navigation'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer shrink-0 ${
                  activeTab === tab
                    ? 'bg-[#1b1c1e] text-[#ffffff] border border-[#363739]'
                    : 'text-[#6a6b6c] hover:text-[#9c9c9d] hover:bg-[#111214]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Command Result List */}
        <div className="p-2 sm:p-3 max-h-[360px] overflow-y-auto space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-[#6a6b6c] font-['Inter'] text-[14px]">
              No matching commands found for "{searchTerm}".
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(idx, item)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-[8px] cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#111214] border-l-2 border-[#ff6363] text-[#ffffff]'
                      : 'hover:bg-[#111214]/60 text-[#9c9c9d] border-l-2 border-transparent'
                  }`}
                  style={{
                    backgroundColor: isSelected ? '#111214' : 'transparent',
                  }}
                >
                  {/* Left: Icon + Title + Subtitle */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-[99999px] flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#ff6363]/15 text-[#ff6363] border border-[#ff6363]/40'
                          : 'bg-[#1b1c1e] text-[#e6e6e6] border border-[#2f3031]'
                      }`}
                    >
                      <IconHelper name={item.icon} className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-['Inter'] text-[14px] font-medium truncate ${
                            isSelected ? 'text-[#ffffff]' : 'text-[#ffffff]/90'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.category === 'AI Tools' && (
                          <span className="bg-[#ff6363]/10 text-[#ff6363] text-[10px] font-mono px-1.5 py-0.2 rounded border border-[#ff6363]/20 font-medium">
                            AI
                          </span>
                        )}
                      </div>
                      <span className="font-['Inter'] text-[12px] text-[#6a6b6c] truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Right: Shortcut Key / Action Trigger */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block font-['GeistMono'] text-[11px] text-[#6a6b6c] bg-[#1b1c1e] px-1.5 py-0.5 rounded border border-[#2f3031]">
                        {item.shortcut}
                      </kbd>
                    )}

                    <div
                      className={`flex items-center gap-1 font-['Inter'] text-[12px] px-2 py-1 rounded-[6px] transition-colors ${
                        isSelected
                          ? 'bg-[#e6e6e6] text-[#454647] font-medium'
                          : 'opacity-0 group-hover:opacity-100 text-[#9c9c9d] bg-[#1b1c1e]'
                      }`}
                    >
                      <span>{item.actionText || 'Run'}</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Window Footer Strip: Navigation hints */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#07080a] border-t border-[#1b1c1e] text-[11px] font-['GeistMono'] text-[#6a6b6c]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
              <span className="text-[#ffffff]/90 font-medium">121 Unread Messages</span>
            </span>
            <span className="text-[#2f3031]">•</span>
            <span>Groq LPU (gpt-oss-20b) + Local Edge</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCommandPalette}
              className="text-[#9c9c9d] hover:text-[#ffffff] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Command Palette (⌘K)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
