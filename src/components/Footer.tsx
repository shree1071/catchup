import React from 'react';
import { Sparkles, Disc as Discord, Globe, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  version: string;
  projectName: string;
  onOpenCommandPalette: () => void;
  onOpenCustomizer: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  version,
  projectName,
  onOpenCommandPalette,
  onOpenCustomizer,
}) => {
  return (
    <footer className="w-full border-t border-[#1b1c1e] bg-[#040506] py-12 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        {/* Top row: Brand & Status */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between pb-8 border-b border-[#111214] gap-4">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255, 99, 99, 0.4))' }}
            >
              <polygon points="12,2 22,12 12,22 2,12" fill="#ff6363" />
            </svg>
            <span className="font-['Inter'] text-[13px] font-medium text-[#ffffff]">
              {projectName}
            </span>
            <span className="text-[#363739]">/</span>
            <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c]">
              BMSIT&M Hackathon 2026 • The Unread Problem
            </span>
          </div>

          {/* Operational Status Dot */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-[9999px] bg-[#07080a] border border-[#1b1c1e] text-[11px] font-['GeistMono'] text-[#6a6b6c]">
            <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
            <span>ALL SYSTEMS OPERATIONAL</span>
            <span className="text-[#2f3031]">•</span>
            <span>PING: 4ms</span>
          </div>
        </div>

        {/* Middle Navigation & Links */}
        <div className="w-full py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-[13px] font-['Inter']">
          <div>
            <div className="font-medium text-[#ffffff] mb-3">Product</div>
            <ul className="space-y-2 text-[#9c9c9d]">
              <li>
                <button
                  onClick={onOpenCommandPalette}
                  className="hover:text-[#ffffff] transition-colors cursor-pointer"
                >
                  Command Palette (⌘K)
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-[#ffffff] transition-colors">
                  Architecture
                </a>
              </li>
              <li>
                <a href="#extensions" className="hover:text-[#ffffff] transition-colors">
                  Extensions Store
                </a>
              </li>
              <li>
                <a href="#quickstart" className="hover:text-[#ffffff] transition-colors">
                  CLI & Bootstrap
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-medium text-[#ffffff] mb-3">Hackathon Prep</div>
            <ul className="space-y-2 text-[#9c9c9d]">
              <li>
                <button
                  onClick={onOpenCustomizer}
                  className="hover:text-[#ffffff] text-[#ff6363] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Configure PS</span>
                </button>
              </li>
              <li>
                <span className="text-[#6a6b6c]">Judging Demo Script</span>
              </li>
              <li>
                <span className="text-[#6a6b6c]">Live Latency Metrics</span>
              </li>
              <li>
                <span className="text-[#6a6b6c]">API Documentation</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-medium text-[#ffffff] mb-3">Resources</div>
            <ul className="space-y-2 text-[#9c9c9d]">
              <li>
                <a href="https://raycast.com" target="_blank" rel="noreferrer" className="hover:text-[#ffffff] transition-colors flex items-center gap-1">
                  <span>Raycast Style Specs</span>
                  <ArrowUpRight className="w-3 h-3 text-[#6a6b6c]" />
                </a>
              </li>
              <li>
                <span className="text-[#6a6b6c]">Tailwind v4 Engine</span>
              </li>
              <li>
                <span className="text-[#6a6b6c]">Vite & React 19</span>
              </li>
              <li>
                <span className="text-[#6a6b6c]">Lucide System Icons</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-medium text-[#ffffff] mb-3">Community</div>
            <ul className="space-y-2 text-[#9c9c9d]">
              <li className="flex items-center gap-2 hover:text-[#ffffff] cursor-pointer">
                <Globe className="w-4 h-4 text-[#6a6b6c]" />
                <span>GitHub Repository</span>
              </li>
              <li className="flex items-center gap-2 hover:text-[#ffffff] cursor-pointer">
                <Discord className="w-4 h-4 text-[#6a6b6c]" />
                <span>Hackathon War Room</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Technical Meta Strip */}
        <div className="w-full pt-8 border-t border-[#111214] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-['GeistMono'] text-[#6a6b6c]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{version}</span>
            <span className="text-[#363739]">|</span>
            <span>macOS 13+ • Windows 11 • Linux</span>
            <span className="text-[#363739]">|</span>
            <span>AES-256 local encrypted vault</span>
          </div>

          <div className="text-[#6a6b6c]">
            Designed with Raycast Midnight Dark & Coral Pulse System.
          </div>
        </div>
      </div>
    </footer>
  );
};
