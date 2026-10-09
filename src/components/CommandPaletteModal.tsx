import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { CommandItem } from '../config/siteConfig';
import { IconHelper } from './IconHelper';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
  onExecuteCommand: (command: CommandItem) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  commands,
  onExecuteCommand,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = commands.filter((cmd) => {
    return (
      cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredCommands.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onExecuteCommand(filteredCommands[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, onExecuteCommand]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/75 backdrop-blur-[12px] animate-fade-in">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Command Bar Modal */}
      <div
        className="relative w-full max-w-[640px] rounded-[16px] bg-[#07080a] border border-[#2f3031] overflow-hidden z-10"
        style={{
          boxShadow:
            'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.25) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset, 0 32px 72px -12px rgba(0,0,0,0.9)',
        }}
      >
        {/* Input Field Well */}
        <div className="flex items-center px-4 py-3.5 bg-[#07080a] border-b border-[#1b1c1e]">
          <Search className="w-5 h-5 text-[#9c9c9d] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-[#ffffff] font-['Inter'] text-[16px] placeholder-[#6a6b6c] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#6a6b6c] hover:text-[#ffffff] mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block font-['GeistMono'] text-[11px] text-[#6a6b6c] bg-[#111214] px-1.5 py-0.5 rounded border border-[#2f3031]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-[380px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-[#6a6b6c] font-['Inter'] text-[14px]">
              No commands matching "{searchTerm}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    onExecuteCommand(cmd);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] cursor-pointer transition-all duration-100 ${
                    isSelected
                      ? 'bg-[#111214] border-l-2 border-[#ff6363] text-[#ffffff]'
                      : 'hover:bg-[#111214]/60 text-[#9c9c9d] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-7 h-7 rounded-[99999px] flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#ff6363]/20 text-[#ff6363] border border-[#ff6363]/40'
                          : 'bg-[#1b1c1e] text-[#e6e6e6] border border-[#2f3031]'
                      }`}
                    >
                      <IconHelper name={cmd.icon} className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-['Inter'] text-[14px] font-medium text-[#ffffff] truncate">
                        {cmd.title}
                      </span>
                      <span className="font-['Inter'] text-[12px] text-[#6a6b6c] truncate">
                        {cmd.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c]">
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="font-['GeistMono'] text-[10px] text-[#6a6b6c] bg-[#1b1c1e] px-1.5 py-0.5 rounded border border-[#2f3031]">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <div className="flex items-center gap-1 bg-[#e6e6e6] text-[#454647] text-[11px] font-['Inter'] font-medium px-1.5 py-0.5 rounded">
                        <span>↵</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#07080a] border-t border-[#1b1c1e] text-[11px] font-['GeistMono'] text-[#6a6b6c]">
          <span>Raycast Interactive Command Palette</span>
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
