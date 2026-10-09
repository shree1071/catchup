import React, { useState } from 'react';
import {
  X,
  Zap,
  Check,
  Send,
  FileText,
  MessageSquare,
  ExternalLink,
  Copy,
  Plus,
  Radio,
  GitPullRequest,
} from 'lucide-react';
import {
  executeZapierMcpAction,
  type ZapierExecutionResult,
} from '../services/zapierMcpService';

interface ZapierMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export const ZapierMcpModal: React.FC<ZapierMcpModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'skills' | 'config'>('actions');
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<ZapierExecutionResult | null>(null);
  const [customParams, setCustomParams] = useState({
    teamsChannel: '#hackathon-war-room',
    teamsMessage: '🚀 Korona Command demo launched! All microservices operating at 4ms latency.',
    notionDatabase: 'Hackathon Architecture',
    notionTitle: 'Korona Neural Command Center — Project Specification',
    notionContent: 'Full architectural layout with Groq LPU reasoning and Zapier MCP orchestration.',
  });
  const [mcpApiKey, setMcpApiKey] = useState('');
  const [copiedSkill, setCopiedSkill] = useState(false);

  if (!isOpen) return null;

  const handleRunTeamsAction = async () => {
    setExecutingId('teams');
    try {
      const res = await executeZapierMcpAction({
        actionId: 'teams_post_channel_message',
        params: {
          channel: customParams.teamsChannel,
          content: customParams.teamsMessage,
        },
        apiKey: mcpApiKey,
      });
      setLatestResult(res);
      onNotify?.(`Microsoft Teams: Message sent to ${customParams.teamsChannel}`);
    } finally {
      setExecutingId(null);
    }
  };

  const handleRunNotionAction = async () => {
    setExecutingId('notion');
    try {
      const res = await executeZapierMcpAction({
        actionId: 'notion_create_database_item',
        params: {
          database: customParams.notionDatabase,
          title: customParams.notionTitle,
          body: customParams.notionContent,
        },
        apiKey: mcpApiKey,
      });
      setLatestResult(res);
      onNotify?.(`Notion: Created page "${customParams.notionTitle}"`);
    } finally {
      setExecutingId(null);
    }
  };

  const handleCopySkillCommand = () => {
    navigator.clipboard.writeText('npx skills add zapier/agent-skills --skill workflows-create');
    setCopiedSkill(true);
    setTimeout(() => setCopiedSkill(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[12px] animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-[800px] max-h-[90vh] rounded-[16px] bg-[#07080a] border border-[#2f3031] overflow-hidden flex flex-col z-10 text-left"
        style={{
          boxShadow:
            'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.22) 0px 0px 0px 1px, 0 32px 72px -12px rgba(0,0,0,0.95)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#07080a] border-b border-[#1b1c1e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#ff4f00]/15 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00]">
              <Zap className="w-4 h-4 fill-[#ff4f00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Inter'] font-semibold text-[16px] text-[#ffffff]">
                  Zapier MCP & Agent Skills Hub
                </h3>
                <span className="font-['GeistMono'] text-[10px] text-[#59d499] bg-[#59d499]/10 px-2 py-0.5 rounded border border-[#59d499]/30">
                  MCP BRIDGE ACTIVE
                </span>
              </div>
              <p className="font-['Inter'] text-[12px] text-[#9c9c9d]">
                Connect your AI agent to 6,000+ business apps: Microsoft Teams, Notion, Slack & more
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[#6a6b6c] hover:text-[#ffffff] hover:bg-[#111214] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#1b1c1e] bg-[#07080a]">
          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-2.5 px-3 text-[13px] font-['Inter'] font-medium transition-colors border-b-2 ${
              activeTab === 'actions'
                ? 'border-[#ff6363] text-[#ffffff]'
                : 'border-transparent text-[#9c9c9d] hover:text-[#ffffff]'
            }`}
          >
            Live App Integrations
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-2.5 px-3 text-[13px] font-['Inter'] font-medium transition-colors border-b-2 ${
              activeTab === 'skills'
                ? 'border-[#ff6363] text-[#ffffff]'
                : 'border-transparent text-[#9c9c9d] hover:text-[#ffffff]'
            }`}
          >
            Zapier Agent Skills
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-[13px] font-['Inter'] font-medium transition-colors border-b-2 ${
              activeTab === 'config'
                ? 'border-[#ff6363] text-[#ffffff]'
                : 'border-transparent text-[#9c9c9d] hover:text-[#ffffff]'
            }`}
          >
            MCP Server Credentials
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'actions' && (
            <>
              {/* App Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-[10px] bg-[#111214] border border-[#2f3031] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#63a1ff]" />
                    <span className="font-['Inter'] text-[13px] font-medium text-[#ffffff]">
                      MS Teams
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
                </div>

                <div className="p-3 rounded-[10px] bg-[#111214] border border-[#2f3031] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ffffff]" />
                    <span className="font-['Inter'] text-[13px] font-medium text-[#ffffff]">
                      Notion
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
                </div>

                <div className="p-3 rounded-[10px] bg-[#111214] border border-[#2f3031] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#e01e5a]" />
                    <span className="font-['Inter'] text-[13px] font-medium text-[#ffffff]">
                      Slack
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
                </div>

                <div className="p-3 rounded-[10px] bg-[#111214] border border-[#2f3031] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-[#9c9c9d]" />
                    <span className="font-['Inter'] text-[13px] font-medium text-[#ffffff]">
                      GitHub
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
                </div>
              </div>

              {/* 1. Microsoft Teams Live Runner */}
              <div className="p-4 rounded-[12px] bg-[#111214] border border-[#2f3031] space-y-3 key-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#63a1ff]/20 text-[#63a1ff] flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-['Inter'] font-medium text-[14px] text-[#ffffff]">
                      Microsoft Teams Dispatcher
                    </span>
                  </div>
                  <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c]">
                    teams_post_channel_message
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={customParams.teamsChannel}
                    onChange={(e) =>
                      setCustomParams({ ...customParams, teamsChannel: e.target.value })
                    }
                    placeholder="Teams Channel"
                    className="bg-[#07080a] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] font-mono focus:outline-none"
                  />
                  <input
                    type="text"
                    value={customParams.teamsMessage}
                    onChange={(e) =>
                      setCustomParams({ ...customParams, teamsMessage: e.target.value })
                    }
                    placeholder="Message Content"
                    className="sm:col-span-2 bg-[#07080a] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunTeamsAction}
                    disabled={executingId === 'teams'}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#e6e6e6] hover:bg-[#ffffff] text-[#454647] font-['Inter'] text-[12px] font-medium transition-all cursor-pointer btn-mist-shadow active:scale-[0.98]"
                  >
                    {executingId === 'teams' ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>Dispatch to Microsoft Teams</span>
                  </button>
                </div>
              </div>

              {/* 2. Notion Live Runner */}
              <div className="p-4 rounded-[12px] bg-[#111214] border border-[#2f3031] space-y-3 key-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#ffffff]/15 text-[#ffffff] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-['Inter'] font-medium text-[14px] text-[#ffffff]">
                      Notion Page & Database Synchronizer
                    </span>
                  </div>
                  <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c]">
                    notion_create_database_item
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customParams.notionDatabase}
                      onChange={(e) =>
                        setCustomParams({ ...customParams, notionDatabase: e.target.value })
                      }
                      placeholder="Database / Workspace"
                      className="bg-[#07080a] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      value={customParams.notionTitle}
                      onChange={(e) =>
                        setCustomParams({ ...customParams, notionTitle: e.target.value })
                      }
                      placeholder="Page Title"
                      className="bg-[#07080a] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={customParams.notionContent}
                    onChange={(e) =>
                      setCustomParams({ ...customParams, notionContent: e.target.value })
                    }
                    placeholder="Page Body Content"
                    className="w-full bg-[#07080a] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-1.5 text-[13px] text-[#ffffff] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunNotionAction}
                    disabled={executingId === 'notion'}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#e6e6e6] hover:bg-[#ffffff] text-[#454647] font-['Inter'] text-[12px] font-medium transition-all cursor-pointer btn-mist-shadow active:scale-[0.98]"
                  >
                    {executingId === 'notion' ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    <span>Create in Notion Workspace</span>
                  </button>
                </div>
              </div>

              {/* Execution Feedback Terminal */}
              {latestResult && (
                <div className="p-4 rounded-[12px] bg-[#040506] border border-[#2f3031] font-['GeistMono'] text-[12px]">
                  <div className="flex items-center justify-between text-[#59d499] mb-2 pb-2 border-b border-[#1b1c1e]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      {latestResult.message}
                    </span>
                    <span className="text-[#6a6b6c]">{latestResult.durationMs}ms</span>
                  </div>
                  <pre className="text-[#9c9c9d] overflow-x-auto leading-relaxed">
                    {JSON.stringify(latestResult.output, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="p-4 rounded-[12px] bg-[#111214] border border-[#2f3031]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-['Inter'] font-medium text-[15px] text-[#ffffff]">
                    Zapier Agent Skills Repository
                  </h4>
                  <a
                    href="https://github.com/zapier/agent-skills"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-[#63a1ff] flex items-center gap-1 hover:underline font-['GeistMono']"
                  >
                    <span>github.com/zapier/agent-skills</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[#9c9c9d] text-[13px] leading-relaxed mb-4">
                  A collection of durable workflow skills for AI coding agents maintained by Zapier teams. Compatible with MCP servers, Claude Code, Cursor, and custom agent runtimes.
                </p>

                <div className="bg-[#040506] p-3 rounded-[8px] border border-[#1b1c1e] flex items-center justify-between font-['GeistMono'] text-[12px]">
                  <code className="text-[#ff6363]">
                    npx skills add zapier/agent-skills --skill workflows-create
                  </code>
                  <button
                    onClick={handleCopySkillCommand}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1b1c1e] hover:bg-[#25272a] text-[#ffffff] cursor-pointer"
                  >
                    {copiedSkill ? (
                      <Check className="w-3 h-3 text-[#59d499]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSkill ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 rounded-[8px] bg-[#111214] border border-[#2f3031]">
                  <div className="font-medium text-[#ffffff] mb-1">workflows-create</div>
                  <p className="text-[#6a6b6c] text-[12px]">
                    Create a durable Zapier workflow from natural language with tool contracts.
                  </p>
                </div>
                <div className="p-3 rounded-[8px] bg-[#111214] border border-[#2f3031]">
                  <div className="font-medium text-[#ffffff] mb-1">workflows-modify</div>
                  <p className="text-[#6a6b6c] text-[12px]">
                    Update, re-route triggers, and tune existing automated zaps.
                  </p>
                </div>
                <div className="p-3 rounded-[8px] bg-[#111214] border border-[#2f3031]">
                  <div className="font-medium text-[#ffffff] mb-1">workflows-doctor</div>
                  <p className="text-[#6a6b6c] text-[12px]">
                    Validate SDK CLI dependencies and run environment diagnostics.
                  </p>
                </div>
                <div className="p-3 rounded-[8px] bg-[#111214] border border-[#2f3031]">
                  <div className="font-medium text-[#ffffff] mb-1">workflows-history</div>
                  <p className="text-[#6a6b6c] text-[12px]">
                    Inspect live execution logs, error traces, and retry queues.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-4 rounded-[12px] bg-[#111214] border border-[#2f3031]">
                <h4 className="font-['Inter'] font-medium text-[15px] text-[#ffffff] mb-1">
                  Model Context Protocol (MCP) Configuration
                </h4>
                <p className="text-[#9c9c9d] text-[13px] mb-4">
                  Optionally paste your Zapier NLA API Key or Central MCP token. If left blank, the application uses high-fidelity simulated dispatch so you can demo seamlessly without credentials.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase mb-1">
                      Zapier NLA Key (e.g. sk-ak-...)
                    </label>
                    <input
                      type="password"
                      placeholder="sk-ak-xxxxxxxxxxxxxxxxxxxx"
                      value={mcpApiKey}
                      onChange={(e) => setMcpApiKey(e.target.value)}
                      className="w-full bg-[#07080a] border border-[#2f3031] focus:border-[#ff6363] rounded-[6px] px-3 py-2 text-[13px] text-[#ffffff] font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase mb-1">
                      MCP Server Command
                    </label>
                    <pre className="bg-[#040506] p-3 rounded-[6px] border border-[#1b1c1e] text-[12px] font-['GeistMono'] text-[#9c9c9d]">
                      npx -y @modelcontextprotocol/server-zapier
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#07080a] border-t border-[#1b1c1e] flex items-center justify-between text-[12px] font-['GeistMono'] text-[#6a6b6c]">
          <span>6,000+ app connectors ready</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-[6px] bg-[#111214] text-[#9c9c9d] hover:text-[#ffffff] border border-[#2f3031] cursor-pointer"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
