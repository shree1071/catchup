import React, { useState, useEffect } from 'react';

interface NavbarProps {
  projectName: string;
  activeView: 'landing' | 'chat' | 'connect';
  onNavigateView: (view: 'landing' | 'chat' | 'connect') => void;
  onOpenCommandPalette: () => void;
  onOpenCustomizer?: () => void;
  onOpenZapierModal?: () => void;
  onOpenTeamsCatchUp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectName,
  activeView: _activeView,
  onNavigateView,
  onOpenCommandPalette,
  onOpenCustomizer: _onOpenCustomizer,
  onOpenZapierModal: _onOpenZapierModal,
  onOpenTeamsCatchUp: _onOpenTeamsCatchUp,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 sm:px-6">
      <nav
        className={`w-full max-w-[1200px] flex items-center justify-between px-3 sm:px-5 py-2.5 rounded-[10px] transition-all duration-300 ${
          scrolled
            ? 'bg-[#040506]/92 backdrop-blur-[48px] shadow-[0_8px_32px_rgba(0,0,0,0.85)] border border-[#363739]'
            : 'bg-[#07080a]/80 backdrop-blur-[48px] border border-[#363739]/80'
        }`}
        style={{
          boxShadow: 'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.5) 0px 8px 28px 0px',
        }}
      >
        {/* Left: Raycast Mark + CatchUp Brand + PS Pill */}
        <button
          onClick={() => onNavigateView('landing')}
          className="flex items-center gap-2.5 group focus:outline-none text-left cursor-pointer"
        >
          {/* Official Raycast Mark */}
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-105"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255, 99, 99, 0.4))' }}
            >
              <path
                fill="#FF6363"
                fillRule="evenodd"
                d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['Inter'] text-[14px] font-semibold text-[#ffffff] tracking-tight">
              {projectName}
            </span>
          </div>
        </button>

        {/* Center: Clean & Minimal Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigateView('connect')}
            className={`font-['Inter'] text-[13px] font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
              _activeView === 'connect' ? 'text-[#ff6363]' : 'text-[#ffffff] hover:text-[#ff6363]'
            }`}
          >
            <span>Connect Apps</span>
          </button>

          <a
            href="#command-center"
            className="font-['Inter'] text-[13px] font-medium text-[#9c9c9d] hover:text-[#ffffff] transition-colors duration-150"
          >
            Features
          </a>

          <button
            onClick={() => onNavigateView('chat')}
            className={`font-['Inter'] text-[13px] font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
              _activeView === 'chat' ? 'text-[#ff6363]' : 'text-[#9c9c9d] hover:text-[#ffffff]'
            }`}
          >
            <span>AI Copilot</span>
            <span className="bg-[#ff6363]/20 text-[#ff6363] text-[9px] font-['GeistMono'] px-1.5 py-0.2 rounded font-medium border border-[#ff6363]/30">
              Groq
            </span>
          </button>
        </div>

        {/* Right: Clean Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateView('connect')}
            className="flex items-center gap-2 bg-[#ff6363] hover:bg-[#ff7a7a] text-[#040506] font-['Inter'] text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,99,99,0.35)] active:scale-95"
          >
            <span>Connect Workspaces</span>
          </button>

          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 bg-[#111214] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] border border-[#363739] font-['Inter'] text-[12px] font-medium px-3 py-1.5 rounded-[8px] transition-all cursor-pointer"
          >
            <span>⌘K</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
