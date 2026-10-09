import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface QuickStartTerminalProps {
  installCommand: string;
}

export const QuickStartTerminal: React.FC<QuickStartTerminalProps> = ({ installCommand: _installCommand }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bash' | 'powershell' | 'docker'>('bash');

  const codeSnippets = {
    bash: `# 1. Launch CatchUp AI micro-app with Groq LPU acceleration
npx catchup-ai --channel teams-war-room --groq-lpu

# 2. Or run in 100% Local-First Edge Privacy mode (Zero Cloud Retention)
npx catchup-ai --local-first --offline

# 3. Export synthesized action items to Notion workspace via Zapier MCP
npx catchup-ai --sync-notion --channel product-launch`,
    powershell: `# PowerShell Execution
npx catchup-ai --channel teams-war-room --groq-lpu

# Local-First zero retention execution
npx catchup-ai --local-first --offline`,
    docker: `# Run isolated edge container with zero cloud telemetry
docker run -p 5173:5173 -it catchup-ai:local-edge`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="quickstart" className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-[#1b1c1e]">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#1b1c1e] border border-[#363739]/60 mb-3">
          <span className="font-['GeistMono'] text-[11px] font-medium tracking-[0.073em] uppercase text-[#ffffff]">
            ONE-LINE LOCAL-FIRST BOOTSTRAP
          </span>
        </div>
        <h2 className="font-['Inter'] font-normal text-[28px] sm:text-[34px] text-[#ffffff] tracking-tight">
          Run CatchUp AI on any machine in seconds.
        </h2>
        <p className="mt-2 font-['Inter'] text-[15px] text-[#9c9c9d] max-w-[540px]">
          Seamless terminal execution, instant Teams hookups, and zero cloud lock-in for 100% data security.
        </p>
      </div>

      {/* Terminal Block */}
      <div
        className="rounded-[16px] bg-[#07080a] border border-[#2f3031] overflow-hidden"
        style={{
          boxShadow:
            'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.2) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 16px 36px 0px',
        }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#07080a] border-b border-[#1b1c1e]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/70" />
            <span className="ml-2 font-['GeistMono'] text-[11px] text-[#6a6b6c]">
              bash // bootstrap.sh
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(['bash', 'powershell', 'docker'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-['GeistMono'] text-[11px] px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#1b1c1e] text-[#ffffff] border border-[#363739]'
                    : 'text-[#6a6b6c] hover:text-[#9c9c9d]'
                }`}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={handleCopy}
              className="ml-2 flex items-center gap-1.5 font-['GeistMono'] text-[11px] text-[#9c9c9d] hover:text-[#ffffff] bg-[#111214] hover:bg-[#1b1c1e] px-2.5 py-1 rounded-[6px] border border-[#2f3031] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#59d499]" />
                  <span className="text-[#59d499]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Terminal Code Body */}
        <div className="p-4 sm:p-6 bg-[#040506] font-['GeistMono'] text-[13px] sm:text-[14px] leading-relaxed overflow-x-auto">
          <pre className="text-[#e6e6e6]">
            {codeSnippets[activeTab].split('\n').map((line, idx) => {
              if (line.startsWith('#')) {
                return (
                  <div key={idx} className="text-[#6a6b6c]">
                    {line}
                  </div>
                );
              }
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[#ff6363] select-none">$</span>
                  <span className="text-[#ffffff]">{line}</span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#07080a] border-t border-[#1b1c1e] text-[11px] font-['GeistMono'] text-[#6a6b6c]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#59d499]" />
            <span>Dev server ready in 180ms</span>
          </div>
          <span>HTTP port: 5173</span>
        </div>
      </div>
    </section>
  );
};
