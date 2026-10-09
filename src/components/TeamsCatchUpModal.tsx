import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  AlertTriangle,
  Clock,
  AtSign,
  CheckCircle2,
  ListTodo,
  Share2,
  FileText,
  ShieldCheck,
  RefreshCw,
  Copy,
} from 'lucide-react';
import {
  summarizeTeamsChatWithGroq,
  OLLAMA_MODELS,
  checkOllamaStatus,
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_OLLAMA_BASE_URL,
  type TeamsCatchUpSummary,
  type AIProvider,
} from '../services/groqService';
import { executeZapierMcpAction } from '../services/zapierMcpService';

interface TeamsCatchUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (message: string) => void;
  defaultChannel?: string;
}

// Pre-loaded realistic Microsoft Teams channel chat transcripts
const TEAMS_CHANNELS = [
  {
    id: 'war-room',
    name: 'Microsoft Teams: #hackathon-war-room',
    unreadCount: 38,
    category: 'Production & Incident',
    icon: 'AlertTriangle',
    badge: 'P0 Outage',
    chat: `[11:02 AM] Alex (Backend): Production database CPU spike at 98%! Queries to /api/auth are timing out for European users.
[11:04 AM] Sarah (DevLead): @Alex kill long-running analytics queries immediately. @You please check the connection pool limit in staging and compare with prod.
[11:06 AM] DevOps-Bot: Alert: 142 error 500 HTTP responses logged in last 5 minutes on /auth/verify.
[11:08 AM] Alex: Killed the unindexed analytics query. CPU dropped back to 34%. Latency normalizing.
[11:10 AM] Sarah: Decision: We will increase connection pool size to 50 and disable the heavy analytics endpoint during peak traffic hours.
[11:12 AM] Sarah: @You need your urgent PR review on #402 before 4:00 PM today so we can tag v2.4.1 release.
[11:14 AM] Alex: I am preparing the rollback script just in case we need to revert.
[11:15 AM] Michael (QA): Smoke tests for auth passed on staging. Ready for prod push once @You approves PR #402.
[11:18 AM] Sarah: Decision: Deployment window locked for 4:30 PM today. No new commits after 4:00 PM.`,
  },
  {
    id: 'product-launch',
    name: 'Microsoft Teams: #product-launch-2026',
    unreadCount: 64,
    category: 'Release & Marketing',
    icon: 'Zap',
    badge: 'Launch Prep',
    chat: `[09:15 AM] Priya (Product): Good morning team! Today is demo day. We need all presentation slides finalized by 1:30 PM.
[09:20 AM] Marcus (Design): Updated the keynote deck with the dark Raycast theme. Link in general channel.
[09:35 AM] Sarah (DevLead): @You make sure the Groq API key has sufficient rate limit tier before the live judging round.
[09:42 AM] Priya: Decision: We are highlighting the "What Did I Miss?" local-first privacy engine as our primary differentiator.
[10:05 AM] DevOps (Sam): Zero-knowledge client encryption module is verified. Zero customer telemetry leaves the device in local mode.
[10:15 AM] Priya: @You please prepare a 60-second backup demo video in case venue Wi-Fi is unstable. Deadline: 2:00 PM today.
[10:30 AM] Marcus: Presentation room assigned: Hall B, Slot 4 (starts at 3:15 PM sharp).`,
  },
  {
    id: 'general-eng',
    name: 'Microsoft Teams: General (Engineering)',
    unreadCount: 52,
    category: 'Architecture',
    icon: 'MessageSquare',
    badge: 'Sprint Cycle',
    chat: `[Yesterday 04:30 PM] David: RFC for vector database migration is up for discussion. Chroma vs Qdrant.
[Yesterday 05:00 PM] Sarah: Decision: Sticking with client-side WebAssembly SQLite and local vector index for zero latency and complete offline privacy.
[Yesterday 05:15 PM] Alex: Benchmarked SQLite-vec in browser: 4.2ms search on 10,000 chat messages. Insanely fast.
[Yesterday 05:45 AM] @You: Great, that matches the local-first requirement from the BMSIT hackathon problem statement.
[Today 08:30 AM] David: Code freeze for Sprint 14 begins at 5:00 PM today. Please merge open branches.`,
  },
];

export const TeamsCatchUpModal: React.FC<TeamsCatchUpModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  defaultChannel = 'war-room',
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(defaultChannel);
  const [customChatText, setCustomChatText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<TeamsCatchUpSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'custom'>('summary');
  const [actionItemsStatus, setActionItemsStatus] = useState<Record<string, boolean>>({});
  const [syncingApp, setSyncingApp] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<AIProvider>('groq');
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>(DEFAULT_OLLAMA_MODEL);
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>(DEFAULT_OLLAMA_BASE_URL);
  const [ollamaStatus, setOllamaStatus] = useState<{ isRunning: boolean; version?: string } | null>(null);
  const [isCheckingOllama, setIsCheckingOllama] = useState<boolean>(false);

  const activeChannel =
    TEAMS_CHANNELS.find((c) => c.id === selectedChannelId) || TEAMS_CHANNELS[0];

  // Auto-check Ollama status whenever user selects ollama provider
  useEffect(() => {
    if (isOpen && aiProvider === 'ollama') {
      setIsCheckingOllama(true);
      checkOllamaStatus(ollamaBaseUrl)
        .then((st) => setOllamaStatus(st))
        .catch(() => setOllamaStatus({ isRunning: false }))
        .finally(() => setIsCheckingOllama(false));
    }
  }, [isOpen, aiProvider, ollamaBaseUrl]);

  // Auto-summarize when modal opens or channel changes
  useEffect(() => {
    if (isOpen && !summaryData && !isProcessing) {
      handleRunSummary();
    }
  }, [isOpen, selectedChannelId]);

  // Keyboard shortcut: Esc to close, ⌘⏎ to re-summarize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunSummary();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedChannelId, isCustomMode, customChatText, aiProvider, selectedOllamaModel, customModelInput]);

  const handleRunSummary = async () => {
    setIsProcessing(true);
    const contentToAnalyze = isCustomMode ? customChatText : activeChannel.chat;
    const channelName = isCustomMode ? 'Custom Teams Chat' : activeChannel.name;
    const unreadCount = isCustomMode ? 20 : activeChannel.unreadCount;
    const effectiveOllamaModel =
      selectedOllamaModel === 'custom'
        ? customModelInput.trim() || 'llama3.2'
        : selectedOllamaModel;

    try {
      const result = await summarizeTeamsChatWithGroq({
        chatContent: contentToAnalyze,
        channelName,
        unreadCount,
        provider: aiProvider,
        ollamaModel: effectiveOllamaModel,
        ollamaBaseUrl: ollamaBaseUrl,
      });
      setSummaryData(result);
      if (result.providerUsed === 'ollama') {
        onNotify?.(`Summarized 100% locally with Ollama edge (${effectiveOllamaModel}) in ${result.metrics.latencyMs}ms`);
      } else if (result.providerUsed === 'local') {
        onNotify?.(`Summarized ${unreadCount} unread messages with zero-dependency local heuristics`);
      } else {
        onNotify?.(`Summarized ${unreadCount} unread Teams messages via Groq LPU (${result.metrics.latencyMs}ms)`);
      }
    } catch (e: any) {
      onNotify?.(`Summarization failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setActionItemsStatus((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleSyncToNotion = async () => {
    if (!summaryData) return;
    setSyncingApp('Notion');
    try {
      const taskBody = summaryData.actionItems
        .map((a) => `- [${actionItemsStatus[a.id] ? 'x' : ' '}] **${a.task}** (@${a.assignee}) - ${a.priority}`)
        .join('\n');

      await executeZapierMcpAction({
        actionId: 'notion_create_database_item',
        params: {
          database: 'Hackathon War Room Tasks',
          title: `[Teams CatchUp] ${summaryData.channelName} Action Items`,
          body: `## Summary\n${summaryData.tldr.join('\n')}\n\n## Action Items\n${taskBody}\n\n## Decisions\n${summaryData.decisions.join('\n')}`,
        },
      });

      onNotify?.('Synced action items to Notion via Zapier MCP!');
    } catch {
      onNotify?.('Notion sync failed');
    } finally {
      setSyncingApp(null);
    }
  };

  const handlePostBackToTeams = async () => {
    if (!summaryData) return;
    setSyncingApp('Teams');
    try {
      const text = `**[CatchUp AI Digest]**\n${summaryData.tldr.map((t) => `• ${t}`).join('\n')}\n\n**Decisions:**\n${summaryData.decisions.map((d) => `• ${d}`).join('\n')}`;
      await executeZapierMcpAction({
        actionId: 'teams_post_channel_message',
        params: {
          channel: summaryData.channelName,
          content: text,
        },
      });
      onNotify?.(`Posted digest back to ${summaryData.channelName} via Zapier MCP!`);
    } catch {
      onNotify?.('Teams post failed');
    } finally {
      setSyncingApp(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#040506]/85 backdrop-blur-[24px] animate-fade-in select-none">
      <div
        className="relative w-full max-w-[960px] max-h-[92vh] flex flex-col bg-[#07080a] border border-[#2f3031] rounded-[14px] shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden text-left"
        style={{
          boxShadow:
            'rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset, rgba(255, 99, 99, 0.15) 0px 0px 32px 0px, rgba(0, 0, 0, 0.8) 0px 20px 60px 0px',
        }}
      >
        {/* Top Header Chrome */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0a0b0e] border-b border-[#1b1c1e] shrink-0">
          <div className="flex items-center gap-3">
            {/* Microsoft Teams Brand SVG */}
            <div className="w-7 h-7 rounded-[7px] bg-[#464eb8]/20 border border-[#464eb8]/50 flex items-center justify-center text-[#7b83eb]">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19.5 7.5a2 2 0 100-4 2 2 0 000 4zM16 6a3 3 0 11-6 0 3 3 0 016 0zM17 11.5c-.7 0-1.35.15-1.95.4A4.5 4.5 0 0013 10H7a4 4 0 00-4 4v2.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V14a2.5 2.5 0 012.5-2.5h.5a.5.5 0 00.5-.5V12a.5.5 0 00-.5-.5h-.5zM19 14.5a1.5 1.5 0 01-1.5 1.5h-.5v.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V16a1.5 1.5 0 00-1.5-1.5h-.5z" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Inter'] font-semibold text-[14px] text-[#ffffff] tracking-tight">
                  Microsoft Teams // "What Did I Miss?"
                </span>
                <span className="px-1.5 py-0.5 rounded-[4px] bg-[#ff6363]/15 text-[#ff6363] border border-[#ff6363]/30 text-[10px] font-['GeistMono']">
                  AI Triage
                </span>
              </div>
              <p className="text-[11px] text-[#9c9c9d] font-['Inter']">
                {aiProvider === 'ollama'
                  ? 'Local-First Edge • 100% on-device Ollama inference (Zero cloud telemetry)'
                  : aiProvider === 'local'
                  ? 'Deterministic Regex Engine • Zero-dependency offline analysis'
                  : 'Connected via Zapier MCP • Summarizing unread conversations with Groq LPU'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 3-Way AI Provider Selector */}
            <div className="flex items-center p-0.5 rounded-[7px] bg-[#101114] border border-[#232427]">
              <button
                onClick={() => {
                  setAiProvider('groq');
                  setSummaryData(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-['GeistMono'] transition-all cursor-pointer ${
                  aiProvider === 'groq'
                    ? 'bg-[#ff6363]/15 text-[#ff6363] border border-[#ff6363]/40 shadow-[0_0_8px_rgba(255,99,99,0.2)] font-medium'
                    : 'text-[#9c9c9d] hover:text-[#ffffff] border border-transparent'
                }`}
                title="Groq LPU: Cloud acceleration with ultra-fast inference"
              >
                <Sparkles className="w-3 h-3" />
                <span>⚡ Groq LPU</span>
              </button>

              <button
                onClick={() => {
                  setAiProvider('ollama');
                  setSummaryData(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-['GeistMono'] transition-all cursor-pointer ${
                  aiProvider === 'ollama'
                    ? 'bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/40 shadow-[0_0_8px_rgba(89,212,153,0.2)] font-medium'
                    : 'text-[#9c9c9d] hover:text-[#ffffff] border border-transparent'
                }`}
                title="100% Local Ollama: Bring Your Own Model, air-gapped on-device execution"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>🦙 Ollama (BYOM)</span>
              </button>

              <button
                onClick={() => {
                  setAiProvider('local');
                  setSummaryData(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-['GeistMono'] transition-all cursor-pointer ${
                  aiProvider === 'local'
                    ? 'bg-[#7b83eb]/15 text-[#7b83eb] border border-[#7b83eb]/40 font-medium'
                    : 'text-[#9c9c9d] hover:text-[#ffffff] border border-transparent'
                }`}
                title="Offline Regex: Deterministic heuristic parser without neural network"
              >
                <span>🔒 Heuristic</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-[6px] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ollama Local Edge Configuration Strip (when Ollama is active) */}
        {aiProvider === 'ollama' && (
          <div className="px-4 sm:px-6 py-2 bg-[#08090c] border-b border-[#1b1c1e] flex flex-wrap items-center justify-between gap-3 text-[11px] font-['GeistMono']">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[#59d499] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Local Model (BYOM):</span>
              </span>

              {/* Model Dropdown */}
              <select
                value={selectedOllamaModel}
                onChange={(e) => {
                  setSelectedOllamaModel(e.target.value);
                  setSummaryData(null);
                }}
                className="bg-[#111214] border border-[#27282b] text-[#ffffff] px-2.5 py-0.5 rounded-[5px] focus:outline-none focus:border-[#59d499] cursor-pointer"
              >
                {OLLAMA_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.size})
                  </option>
                ))}
                <option value="custom">+ Custom BYOM Model Tag...</option>
              </select>

              {/* Custom Model Input */}
              {selectedOllamaModel === 'custom' && (
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => setCustomModelInput(e.target.value)}
                  placeholder="e.g. deepseek-r1:1.5b, mistral, custom-rag"
                  className="bg-[#111214] border border-[#27282b] text-[#59d499] px-2.5 py-0.5 rounded-[5px] focus:outline-none focus:border-[#59d499] w-48"
                />
              )}

              <div className="flex items-center gap-1.5 hidden md:flex">
                <span className="text-[#6a6b6c]">Host:</span>
                <input
                  type="text"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="bg-[#111214] border border-[#27282b] text-[#9c9c9d] hover:text-[#ffffff] focus:text-[#ffffff] px-2 py-0.5 rounded-[4px] w-40 font-['GeistMono'] text-[11px] focus:outline-none focus:border-[#59d499]"
                />
              </div>
            </div>

            {/* Probe Status */}
            <div className="flex items-center gap-2">
              {isCheckingOllama ? (
                <span className="text-[#9c9c9d] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Probing Ollama...
                </span>
              ) : ollamaStatus?.isRunning ? (
                <span className="text-[#59d499] flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#59d499]/10 border border-[#59d499]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] animate-pulse" />
                  <span>Ollama Running ({ollamaStatus.version || 'Edge'})</span>
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#ffbd59] flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#ffbd59]/10 border border-[#ffbd59]/20">
                    <span>● Ollama Inactive</span>
                  </span>
                  <button
                    onClick={() => {
                      setIsCheckingOllama(true);
                      checkOllamaStatus(ollamaBaseUrl).then(setOllamaStatus).finally(() => setIsCheckingOllama(false));
                    }}
                    className="text-[#9c9c9d] hover:text-[#ffffff] underline text-[10px] cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Channel Selector Bar & Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0b0c0f] border-b border-[#1b1c1e] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase tracking-wider">
              Channel:
            </span>
            {TEAMS_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChannelId(ch.id);
                  setIsCustomMode(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-['Inter'] font-medium transition-all cursor-pointer shrink-0 ${
                  !isCustomMode && selectedChannelId === ch.id
                    ? 'bg-[#1b1c1e] text-[#ffffff] border border-[#ff6363]/50 shadow-[0_0_12px_rgba(255,99,99,0.2)]'
                    : 'text-[#9c9c9d] hover:text-[#ffffff] border border-transparent hover:bg-[#111214]'
                }`}
              >
                <span>{ch.name.replace('Microsoft Teams: ', '')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#ff6363]/20 text-[#ff6363] text-[10px] font-bold">
                  {ch.unreadCount}
                </span>
              </button>
            ))}

            <button
              onClick={() => {
                setIsCustomMode(true);
                setActiveTab('custom');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-['Inter'] font-medium transition-all cursor-pointer shrink-0 ${
                isCustomMode
                  ? 'bg-[#1b1c1e] text-[#ffffff] border border-[#ff6363]/50 shadow-[0_0_12px_rgba(255,99,99,0.2)]'
                  : 'text-[#9c9c9d] hover:text-[#ffffff] border border-transparent hover:bg-[#111214]'
              }`}
            >
              <span>+ Paste Custom Chat</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#111214] p-0.5 rounded-[6px] border border-[#2f3031]">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-['Inter'] font-medium transition-colors cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-[#1b1c1e] text-[#ffffff]'
                    : 'text-[#9c9c9d] hover:text-[#ffffff]'
                }`}
              >
                AI Triage
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-['Inter'] font-medium transition-colors cursor-pointer ${
                  activeTab === 'transcript'
                    ? 'bg-[#1b1c1e] text-[#ffffff]'
                    : 'text-[#9c9c9d] hover:text-[#ffffff]'
                }`}
              >
                Raw Feed ({isCustomMode ? 'Custom' : activeChannel.unreadCount})
              </button>
            </div>

            <button
              onClick={handleRunSummary}
              disabled={isProcessing}
              className="flex items-center gap-1.5 bg-[#ffffff] hover:bg-[#e6e6e6] text-[#040506] px-3 py-1 rounded-[6px] text-[12px] font-['Inter'] font-semibold transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>
                {isProcessing
                  ? aiProvider === 'ollama'
                    ? 'Running Local Ollama...'
                    : aiProvider === 'local'
                    ? 'Extracting Regex...'
                    : 'Reasoning on Groq...'
                  : 'Re-summarize (⌘⏎)'}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: AI TRIAGE DASHBOARD */}
          {activeTab === 'summary' && (
            <>
              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className={`w-10 h-10 rounded-full border-2 border-t-transparent animate-spin ${
                    aiProvider === 'ollama' ? 'border-[#59d499]' : 'border-[#ff6363]'
                  }`} />
                  <span className="font-['Inter'] text-[14px] text-[#ffffff] font-medium">
                    {aiProvider === 'ollama'
                      ? `Local Ollama is analyzing ${activeChannel.unreadCount} unread Teams messages...`
                      : aiProvider === 'local'
                      ? `Deterministic heuristic parser analyzing ${activeChannel.unreadCount} messages...`
                      : `Groq LPU is analyzing ${activeChannel.unreadCount} unread Teams messages...`}
                  </span>
                  <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c]">
                    {aiProvider === 'ollama'
                      ? `Model: ${selectedOllamaModel === 'custom' ? customModelInput || 'custom' : selectedOllamaModel} • 100% Air-gapped on-device execution`
                      : aiProvider === 'local'
                      ? 'Local Heuristic Engine • Zero API dependencies'
                      : 'Model: openai/gpt-oss-20b • Zero-retention client memory'}
                  </span>
                </div>
              )}

              {!isProcessing && summaryData && (
                <div className="space-y-5 animate-fade-in">
                  {/* Urgency Matrix Banner */}
                  <div
                    className={`p-3.5 rounded-[10px] border flex items-start justify-between gap-4 ${
                      summaryData.urgencyLevel.includes('P0')
                        ? 'bg-[#ff5f56]/10 border-[#ff5f56]/40 text-[#ff8f8a]'
                        : summaryData.urgencyLevel.includes('P1')
                        ? 'bg-[#ff9f1a]/10 border-[#ff9f1a]/40 text-[#ffbd59]'
                        : 'bg-[#59d499]/10 border-[#59d499]/40 text-[#59d499]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-['Inter'] font-bold text-[13px] tracking-wide">
                            PRIORITY TRIAGE: {summaryData.urgencyLevel}
                          </span>
                          <span className="font-['GeistMono'] text-[10px] opacity-80">
                            • {summaryData.unreadCount} unread messages
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-['GeistMono'] font-medium ${
                              summaryData.providerUsed === 'ollama'
                                ? 'bg-[#59d499]/20 text-[#59d499] border border-[#59d499]/40'
                                : summaryData.providerUsed === 'local'
                                ? 'bg-[#7b83eb]/20 text-[#7b83eb] border border-[#7b83eb]/40'
                                : 'bg-[#ff6363]/20 text-[#ff6363] border border-[#ff6363]/40'
                            }`}
                          >
                            {summaryData.providerUsed === 'ollama'
                              ? `🦙 100% Local Ollama (${summaryData.modelUsed || selectedOllamaModel})`
                              : summaryData.providerUsed === 'local'
                              ? '🔒 Local Offline Regex'
                              : `⚡ Groq Cloud LPU (${summaryData.modelUsed || 'gpt-oss-20b'})`}
                          </span>
                        </div>
                        <p className="font-['Inter'] text-[12px] opacity-90 mt-1">
                          {summaryData.urgencyReason}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 hidden sm:block">
                      <span className="font-['GeistMono'] text-[11px] opacity-80 block">
                        Latency: {summaryData.metrics.latencyMs}ms
                      </span>
                      <span className="font-['GeistMono'] text-[10px] opacity-60">
                        {summaryData.metrics.tokensPerSecond} tokens/sec
                      </span>
                    </div>
                  </div>

                  {/* 1. Executive TL;DR & Decisions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Executive TL;DR Card */}
                    <div className="p-4 rounded-[10px] bg-[#0c0d11] border border-[#232427] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-[#1b1c1e]">
                          <FileText className="w-4 h-4 text-[#ff6363]" />
                          <h3 className="font-['Inter'] text-[13px] font-semibold text-[#ffffff]">
                            Executive TL;DR (What Happened)
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {summaryData.tldr.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[12px] text-[#cccccc] font-['Inter'] leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6363] mt-1.5 shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#1b1c1e] flex items-center justify-between text-[11px] font-['GeistMono'] text-[#6a6b6c]">
                        <span>Participants: {summaryData.participants.join(', ')}</span>
                      </div>
                    </div>

                    {/* Key Decisions Made Card */}
                    <div className="p-4 rounded-[10px] bg-[#0c0d11] border border-[#232427] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-[#1b1c1e]">
                          <CheckCircle2 className="w-4 h-4 text-[#59d499]" />
                          <h3 className="font-['Inter'] text-[13px] font-semibold text-[#ffffff]">
                            Decisions Agreed Upon
                          </h3>
                        </div>
                        {summaryData.decisions.length === 0 ? (
                          <p className="text-[12px] text-[#6a6b6c] italic">No final architectural decisions logged in this thread.</p>
                        ) : (
                          <ul className="space-y-2">
                            {summaryData.decisions.map((dec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-[12px] text-[#e0e0e0] font-['Inter'] leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] mt-1.5 shrink-0" />
                                <span>{dec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#1b1c1e] flex items-center justify-between">
                        <span className="text-[11px] font-['GeistMono'] text-[#6a6b6c]">
                          Consensus verified by Groq LPU
                        </span>
                        <button
                          onClick={handlePostBackToTeams}
                          disabled={syncingApp === 'Teams'}
                          className="flex items-center gap-1 text-[11px] text-[#7b83eb] hover:text-[#ffffff] transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>{syncingApp === 'Teams' ? 'Posting...' : 'Post to Teams'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Missed @Mentions & Upcoming Deadlines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Missed @Mentions Card */}
                    <div className="p-4 rounded-[10px] bg-[#0c0d11] border border-[#232427]">
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1b1c1e]">
                        <div className="flex items-center gap-2">
                          <AtSign className="w-4 h-4 text-[#ff6363]" />
                          <h3 className="font-['Inter'] text-[13px] font-semibold text-[#ffffff]">
                            Missed @Mentions For You
                          </h3>
                        </div>
                        <span className="text-[10px] font-['GeistMono'] text-[#ff6363] px-1.5 py-0.5 rounded bg-[#ff6363]/10">
                          {summaryData.missedMentions.length} direct tags
                        </span>
                      </div>

                      {summaryData.missedMentions.length === 0 ? (
                        <p className="text-[12px] text-[#6a6b6c] italic">No direct mentions addressed to you in this thread.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {summaryData.missedMentions.map((m, idx) => (
                            <div key={idx} className="p-2.5 rounded-[8px] bg-[#111215] border border-[#1e1f23] text-[12px]">
                              <div className="flex items-center justify-between text-[11px] text-[#9c9c9d] mb-1">
                                <span className="font-semibold text-[#ffffff]">From: {m.author}</span>
                                <span className="font-['GeistMono'] text-[10px]">{m.timestamp}</span>
                              </div>
                              <p className="text-[#dddddd] font-['Inter'] italic">"{m.message}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Upcoming Deadlines Card */}
                    <div className="p-4 rounded-[10px] bg-[#0c0d11] border border-[#232427]">
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1b1c1e]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#ff9f1a]" />
                          <h3 className="font-['Inter'] text-[13px] font-semibold text-[#ffffff]">
                            Deadlines & Milestones
                          </h3>
                        </div>
                        <span className="text-[10px] font-['GeistMono'] text-[#ff9f1a] px-1.5 py-0.5 rounded bg-[#ff9f1a]/10">
                          {summaryData.deadlines.length} scheduled
                        </span>
                      </div>

                      {summaryData.deadlines.length === 0 ? (
                        <p className="text-[12px] text-[#6a6b6c] italic">No explicit deadlines declared in this thread.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {summaryData.deadlines.map((d, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-[8px] bg-[#111215] border border-[#1e1f23]">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ff9f1a]" />
                                <span className="font-['Inter'] text-[12px] text-[#ffffff] font-medium">{d.title}</span>
                              </div>
                              <span className="font-['GeistMono'] text-[11px] text-[#ff9f1a] font-bold px-2 py-0.5 rounded bg-[#ff9f1a]/10">
                                {d.dueTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Action Items Checklist with 1-Click Notion Sync */}
                  <div className="p-4 rounded-[10px] bg-[#0c0d11] border border-[#232427]">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1b1c1e]">
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-[#ff6363]" />
                        <h3 className="font-['Inter'] text-[13px] font-semibold text-[#ffffff]">
                          Action Items & Assigned Tasks ({summaryData.actionItems.length})
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSyncToNotion}
                          disabled={syncingApp === 'Notion'}
                          className="flex items-center gap-1.5 bg-[#1b1c1e] hover:bg-[#25262a] text-[#ffffff] border border-[#363739] px-2.5 py-1 rounded-[6px] text-[11px] font-['Inter'] font-medium transition-all cursor-pointer disabled:opacity-50"
                        >
                          <FileText className="w-3 h-3 text-[#59d499]" />
                          <span>{syncingApp === 'Notion' ? 'Syncing...' : 'Sync to Notion (Zapier MCP)'}</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              summaryData.actionItems.map((a) => `- [ ] ${a.task} (@${a.assignee})`).join('\n')
                            );
                            onNotify?.('Action items copied to clipboard!');
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-[6px] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] text-[11px] transition-colors cursor-pointer"
                          title="Copy Tasks as Markdown"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {summaryData.actionItems.map((item) => {
                        const isDone = !!actionItemsStatus[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleTask(item.id)}
                            className={`flex items-center justify-between p-2.5 rounded-[8px] border transition-all cursor-pointer ${
                              isDone
                                ? 'bg-[#111215]/50 border-[#1f2024] opacity-60'
                                : 'bg-[#111215] border-[#202126] hover:border-[#33343a]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                  isDone
                                    ? 'bg-[#59d499] border-[#59d499] text-[#040506]'
                                    : 'border-[#4a4b4e] hover:border-[#ffffff]'
                                }`}
                              >
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>

                              <span
                                className={`font-['Inter'] text-[13px] ${
                                  isDone ? 'line-through text-[#6a6b6c]' : 'text-[#ffffff]'
                                }`}
                              >
                                {item.task}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-[4px] text-[10px] font-['GeistMono'] font-bold ${
                                  item.priority === 'P0'
                                    ? 'bg-[#ff5f56]/15 text-[#ff8f8a] border border-[#ff5f56]/30'
                                    : item.priority === 'P1'
                                    ? 'bg-[#ff9f1a]/15 text-[#ffbd59] border border-[#ff9f1a]/30'
                                    : 'bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/30'
                                }`}
                              >
                                {item.priority}
                              </span>

                              <span className="px-2 py-0.5 rounded-[4px] bg-[#1c1d22] border border-[#2b2c33] text-[#9c9c9d] text-[11px] font-['Inter']">
                                @{item.assignee}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: RAW TEAMS TRANSCRIPT FEED */}
          {activeTab === 'transcript' && (
            <div className="p-4 rounded-[10px] bg-[#0c0d11] border border-[#232427] space-y-3 font-['GeistMono'] text-[12px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b1c1e] text-[#9c9c9d]">
                <span>Channel: {activeChannel.name}</span>
                <span>{activeChannel.unreadCount} unread messages</span>
              </div>

              <div className="space-y-3 text-[#dddddd] font-['Inter']">
                {activeChannel.chat.split('\n').map((line, idx) => {
                  const isMention = /@you/i.test(line);
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-[8px] border ${
                        isMention
                          ? 'bg-[#ff6363]/10 border-[#ff6363]/40 text-[#ffffff]'
                          : 'bg-[#111215] border-[#1e1f23]'
                      }`}
                    >
                      <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c] block mb-0.5">
                        {line.match(/\[[^\]]+\]/)?.[0] || '[11:00 AM]'}
                      </span>
                      <span>{line.replace(/\[[^\]]+\]\s*/, '')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CHAT DUMP */}
          {activeTab === 'custom' && (
            <div className="p-4 rounded-[10px] bg-[#0c0d11] border border-[#232427] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b1c1e]">
                <h3 className="font-['Inter'] text-[13px] font-semibold text-[#ffffff]">
                  Paste Any Chat Transcript (Teams, Slack, WhatsApp, Discord)
                </h3>
                <span className="text-[11px] text-[#6a6b6c] font-['GeistMono']">
                  Judges Test Dropzone
                </span>
              </div>

              <textarea
                value={customChatText}
                onChange={(e) => setCustomChatText(e.target.value)}
                placeholder="Paste unread chat logs here... Example:
[10:00 AM] Boss: We need the security audit done before Friday.
[10:02 AM] Alex: @You please push the patch today.
[10:05 AM] Team: Agreed to deploy v2."
                rows={10}
                className="w-full bg-[#111215] border border-[#2b2c33] rounded-[8px] p-3 text-[12px] font-['GeistMono'] text-[#ffffff] focus:outline-none focus:border-[#ff6363] resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleRunSummary}
                  disabled={isProcessing || !customChatText.trim()}
                  className="flex items-center gap-2 bg-[#ffffff] hover:bg-[#e6e6e6] text-[#040506] px-4 py-2 rounded-[6px] text-[12px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Custom Chat on Groq LPU</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#0a0b0e] border-t border-[#1b1c1e] flex flex-wrap items-center justify-between text-[11px] font-['GeistMono'] text-[#6a6b6c] shrink-0">
          <div className="flex items-center gap-3">
            <span>⚡ Groq Hardware: openai/gpt-oss-20b</span>
            <span>•</span>
            <span className="text-[#59d499]">🔒 Local-First Privacy (Zero Retention)</span>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-[#111214] border border-[#2b2c33] text-[#9c9c9d]">
              ⌘⏎ Re-run
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#111214] border border-[#2b2c33] text-[#9c9c9d]">
              Esc Close
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
