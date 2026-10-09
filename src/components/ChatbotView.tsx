import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  User,
  Zap,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Settings,
  Brain,
  MessageSquare,
  FileText,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import {
  sendGroqChat,
  GROQ_MODELS,
  type ChatMessage,
} from '../services/groqService';
import {
  executeZapierMcpAction,
} from '../services/zapierMcpService';
import {
  fetchLiveChannels,
  fetchLiveMessages,
  buildRealWorkspacePromptContext,
  sendLiveSlackMessage,
  type LiveMessage,
  type SlackChannel,
} from '../services/workspaceConnectorService';

interface ChatbotViewProps {
  onBackToLanding?: () => void;
  onOpenZapierModal?: () => void;
}

interface ZapierMessageStatus {
  app: string;
  status: 'sending' | 'success' | 'error';
  details: string;
  durationMs: number;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  onBackToLanding,
  onOpenZapierModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Welcome to CatchUp AI Copilot! Connected to Groq LPU (sub-second inference) with live read access to your authenticated inmodel Slack workspace (#all-inmodel, #inmodel-sales-deals, #new-channel, #social). Ask me what messages have been posted, who is active, or to summarize your channel activity!',
      timestamp: Date.now(),
      metrics: {
        latencyMs: 120,
        tokensPerSecond: 950,
        completionTokens: 42,
        totalTokens: 42,
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-oss-20b');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [zapierStatus, setZapierStatus] = useState<Record<string, ZapierMessageStatus>>({});

  // Real Workspace Connector State
  const [liveChannels, setLiveChannels] = useState<SlackChannel[]>([]);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [showSlackPostBox, setShowSlackPostBox] = useState(false);
  const [quickPostText, setQuickPostText] = useState('');
  const [isPostingSlack, setIsPostingSlack] = useState(false);
  const [postFeedback, setPostFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const syncLiveWorkspace = async () => {
    setIsSyncingLive(true);
    try {
      const [channels, msgs] = await Promise.all([
        fetchLiveChannels(),
        fetchLiveMessages('C0BBUP1LEJH'),
      ]);
      setLiveChannels(channels);
      setLiveMessages(msgs);
    } catch (err) {
      console.error('Error syncing live workspace:', err);
    } finally {
      setIsSyncingLive(false);
    }
  };

  useEffect(() => {
    syncLiveWorkspace();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, zapierStatus]);

  const quickPrompts = [
    'What was the latest message in #all-inmodel?',
    'Summarize all active channels in the inmodel workspace',
    'What did @shreeharshastark post to the channel?',
    'Draft a project status update to post to #all-inmodel',
  ];

  const handlePostToSlack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostText.trim() || isPostingSlack) return;

    setIsPostingSlack(true);
    setPostFeedback(null);
    try {
      const ok = await sendLiveSlackMessage(quickPostText.trim(), 'C0BBUP1LEJH');
      if (ok) {
        setPostFeedback('✓ Message posted to Slack #all-inmodel!');
        setQuickPostText('');
        await syncLiveWorkspace();
        setTimeout(() => setPostFeedback(null), 3000);
      } else {
        setPostFeedback('⚠️ Failed to post message to Slack');
      }
    } catch {
      setPostFeedback('⚠️ Error sending message');
    } finally {
      setIsPostingSlack(false);
    }
  };

  const handleDispatchToTeams = async (messageId: string, content: string) => {
    setZapierStatus((prev) => ({
      ...prev,
      [messageId]: {
        app: 'Microsoft Teams',
        status: 'sending',
        details: 'Sending to #hackathon-war-room...',
        durationMs: 0,
      },
    }));

    try {
      const res = await executeZapierMcpAction({
        actionId: 'teams_post_channel_message',
        params: {
          channel: '#hackathon-war-room',
          content: content.slice(0, 400),
        },
      });

      setZapierStatus((prev) => ({
        ...prev,
        [messageId]: {
          app: 'Microsoft Teams',
          status: 'success',
          details: 'Posted to #hackathon-war-room',
          durationMs: res.durationMs,
        },
      }));
    } catch {
      setZapierStatus((prev) => ({
        ...prev,
        [messageId]: {
          app: 'Microsoft Teams',
          status: 'error',
          details: 'Failed to post message',
          durationMs: 0,
        },
      }));
    }
  };

  const handleDispatchToNotion = async (messageId: string, content: string) => {
    setZapierStatus((prev) => ({
      ...prev,
      [messageId]: {
        app: 'Notion',
        status: 'sending',
        details: 'Syncing to Notion Workspace...',
        durationMs: 0,
      },
    }));

    try {
      const res = await executeZapierMcpAction({
        actionId: 'notion_create_database_item',
        params: {
          database: 'Hackathon Architecture',
          title: `Architecture Spec: ${content.slice(0, 32)}...`,
          body: content,
        },
      });

      setZapierStatus((prev) => ({
        ...prev,
        [messageId]: {
          app: 'Notion',
          status: 'success',
          details: 'Saved to Hackathon Architecture DB',
          durationMs: res.durationMs,
        },
      }));
    } catch {
      setZapierStatus((prev) => ({
        ...prev,
        [messageId]: {
          app: 'Notion',
          status: 'error',
          details: 'Failed to create Notion page',
          durationMs: 0,
        },
      }));
    }
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const workspaceContext = buildRealWorkspacePromptContext(liveMessages, liveChannels);

      const result = await sendGroqChat({
        messages: history,
        model: selectedModel,
        apiKey: apiKeyOverride,
        systemPrompt: `You are CatchUp AI Copilot powered by Groq LPUs.
You have direct real-time read access to the user's authentic connected workspace:
${workspaceContext}

Instructions:
1. Reference exact facts, real channels (#all-inmodel, #inmodel-sales-deals, #new-channel, #social), real usernames (@shreeharshastark), and exact message timestamps.
2. Provide concise, clear, and actionable summaries or answers.
3. If asked what messages exist, what channel is active, or what was posted, give authentic, accurate answers based on the real messages stream above. Do not invent fake users or mock incidents.`,
      });

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: result.content,
        reasoning: result.reasoning,
        timestamp: Date.now(),
        metrics: result.metrics,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('teams')) {
        setTimeout(() => {
          handleDispatchToTeams(assistantMsgId, result.content);
        }, 500);
      } else if (lowerPrompt.includes('notion')) {
        setTimeout(() => {
          handleDispatchToNotion(assistantMsgId, result.content);
        }, 500);
      }
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Unknown error occurred';
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Groq Execution Error: ${errorText}\n\nPlease check your network or verify your Groq API key in Settings.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: 'Chat session reset. Real-time workspace bus ready on Groq LPUs.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <section className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-8 flex flex-col h-[calc(100vh-100px)] min-h-[640px]">
      {/* Top Cockpit Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1b1c1e]">
        {/* Brand & Model Info */}
        <div className="flex items-center gap-3">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-2.5 py-1 rounded-[6px] bg-[#111214] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] text-[12px] font-['GeistMono'] border border-[#2f3031] transition-colors cursor-pointer"
            >
              ← Frontpage
            </button>
          )}

          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255, 99, 99, 0.5))' }}
            >
              <polygon points="12,2 22,12 12,22 2,12" fill="#ff6363" />
            </svg>
            <span className="font-['Inter'] text-[15px] font-medium text-[#ffffff]">
              Groq LPU Copilot
            </span>
            <span className="text-[#363739]">/</span>
            <span className="font-['GeistMono'] text-[12px] text-[#59d499] bg-[#59d499]/10 px-2 py-0.5 rounded-[4px] border border-[#59d499]/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] animate-pulse" />
              LIVE SLACK FEED
            </span>
          </div>
        </div>

        {/* Model Selector & Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenZapierModal && (
            <button
              onClick={onOpenZapierModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#111214] hover:bg-[#1b1c1e] text-[#ffffff] border border-[#2f3031] hover:border-[#ff6363]/40 text-[12px] font-['GeistMono'] transition-colors cursor-pointer"
              title="Open Zapier MCP & Agent Skills Hub (Teams, Notion, Slack)"
            >
              <Zap className="w-3.5 h-3.5 text-[#ff6363]" />
              <span className="hidden sm:inline">Zapier MCP</span>
              <span className="font-['GeistMono'] text-[9px] text-[#ff6363] bg-[#ff6363]/10 px-1 py-0.2 rounded border border-[#ff6363]/20">
                TEAMS / NOTION
              </span>
            </button>
          )}

          {/* Model Selector */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-[#111214] hover:bg-[#1b1c1e] border border-[#2f3031] text-[#ffffff] text-[12px] font-['GeistMono'] rounded-[8px] pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#ff6363]/50 cursor-pointer"
            >
              {GROQ_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#07080a] text-[#ffffff]">
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6a6b6c] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Settings Trigger */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-[8px] border transition-colors cursor-pointer ${
              showSettings
                ? 'bg-[#1b1c1e] text-[#ffffff] border-[#363739]'
                : 'bg-[#111214] text-[#9c9c9d] hover:text-[#ffffff] border-[#2f3031]'
            }`}
            title="Configure Groq API Key"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear Session */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-[8px] bg-[#111214] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] border border-[#2f3031] transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Drawer / Flyout */}
      {showSettings && (
        <div className="mb-4 p-4 rounded-[12px] bg-[#07080a] border border-[#2f3031] text-[13px] animate-fade-in key-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Inter'] font-medium text-[#ffffff]">
              Groq Engine Configuration
            </span>
            <span className="font-['GeistMono'] text-[11px] text-[#59d499] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#59d499]" />
              Status: Connected (Groq LPUs)
            </span>
          </div>
          <p className="text-[#9c9c9d] text-[12px] mb-3">
            Your Groq API key is active. Real Slack workspace data is streamed directly into prompt context.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Custom Groq API Key (defaults to project key)"
              value={apiKeyOverride}
              onChange={(e) => setApiKeyOverride(e.target.value)}
              className="flex-1 bg-[#111214] border border-[#2f3031] focus:border-[#ff6363] text-[#ffffff] text-[12px] font-mono rounded-[6px] px-3 py-1.5 focus:outline-none"
            />
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 rounded-[6px] bg-[#e6e6e6] text-[#454647] font-medium text-[12px] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Live Workspace Feeds Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-[10px] bg-[#0c0d10] border border-[#27282b] mb-3 text-[12px] font-['GeistMono'] animate-fade-in">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
          <span className="text-[#ffffff] font-medium">
            Live Connector: <span className="text-[#59d499]">inmodel</span> Slack
          </span>
          <span className="text-[#9c9c9d] text-[11px]">
            ({liveChannels.length || 4} channels • {liveMessages.length} message synced)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncLiveWorkspace}
            disabled={isSyncingLive}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#111214] hover:bg-[#1a1b1e] border border-[#2f3031] text-[#9c9c9d] hover:text-[#ffffff] text-[11px] transition-colors cursor-pointer"
            title="Refresh messages directly from Slack"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingLive ? 'animate-spin text-[#59d499]' : ''}`} />
            <span>{isSyncingLive ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          <button
            onClick={() => setShowSlackPostBox(!showSlackPostBox)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#59d499]/15 hover:bg-[#59d499]/25 border border-[#59d499]/40 text-[#59d499] text-[11px] font-medium transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3 h-3" />
            <span>Post to #all-inmodel</span>
          </button>
        </div>
      </div>

      {/* Quick Post To Slack Flyout */}
      {showSlackPostBox && (
        <form
          onSubmit={handlePostToSlack}
          className="mb-3 p-3.5 rounded-[10px] bg-[#090b0e] border border-[#59d499]/30 flex flex-col sm:flex-row items-center gap-2 animate-fade-in"
        >
          <input
            type="text"
            placeholder="Type a real message to post into Slack #all-inmodel..."
            value={quickPostText}
            onChange={(e) => setQuickPostText(e.target.value)}
            className="flex-1 w-full bg-[#111214] border border-[#27282b] focus:border-[#59d499] text-[#ffffff] text-[12px] font-['Inter'] rounded-[6px] px-3 py-1.5 focus:outline-none"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={!quickPostText.trim() || isPostingSlack}
              className="px-3 py-1.5 rounded-[6px] bg-[#59d499] hover:bg-[#6ae0a6] text-[#040506] font-semibold text-[12px] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <span>{isPostingSlack ? 'Posting...' : 'Send to Slack'}</span>
              <Send className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setShowSlackPostBox(false)}
              className="px-2.5 py-1.5 text-[12px] text-[#9c9c9d] hover:text-[#ffffff] cursor-pointer"
            >
              Cancel
            </button>
          </div>
          {postFeedback && (
            <span className="text-[11px] font-['GeistMono'] text-[#59d499] w-full mt-1">
              {postFeedback}
            </span>
          )}
        </form>
      )}

      {/* Main Messages Feed */}
      <div
        className="flex-1 overflow-y-auto space-y-4 p-4 rounded-[16px] bg-[#07080a] border border-[#2f3031]/80 mb-4"
        style={{
          boxShadow:
            'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.22) 0px 0px 0px 1px, rgba(0, 0, 0, 0.3) 0px 8px 30px 0px, rgba(0, 0, 0, 0.4) 0px -1px 0px 0px inset',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 text-[14px] leading-relaxed group relative animate-fade-in ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-[8px] bg-[#111214] border border-[#2f3031] flex items-center justify-center text-[#ff6363] shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <polygon points="12,2 22,12 12,22 2,12" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-[12px] p-3.5 border transition-all ${
                  isUser
                    ? 'bg-[#1b1c1e] border-[#363739] text-[#ffffff]'
                    : 'bg-[#111214] border-[#27282b] text-[#cccccc]'
                }`}
              >
                {/* Message Header info */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c] flex items-center gap-1.5">
                    {isUser ? (
                      <>
                        <User className="w-3 h-3 text-[#9c9c9d]" />
                        <span>You (shreeharshastark)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]" />
                        <span>Groq AI Copilot (inmodel connector)</span>
                      </>
                    )}
                  </span>

                  {msg.metrics && (
                    <div className="flex items-center gap-2 text-[10px] font-['GeistMono'] text-[#59d499]">
                      <span>{msg.metrics.latencyMs}ms</span>
                      {msg.metrics.tokensPerSecond && (
                        <span>• {Math.round(msg.metrics.tokensPerSecond)} T/s</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional Reasoning Collapse for Reasoning Models */}
                {msg.reasoning && (
                  <div className="mb-3 rounded-[8px] border border-[#2f3031] bg-[#07080a] overflow-hidden">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[11px] font-['GeistMono'] text-[#9c9c9d] hover:text-[#ffffff] bg-[#07080a] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-[#ff6363]">
                        <Brain className="w-3 h-3" />
                        <span>Thinking / Reasoning Process</span>
                      </span>
                      {expandedReasoning[msg.id] ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#6a6b6c]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#6a6b6c]" />
                      )}
                    </button>

                    {expandedReasoning[msg.id] && (
                      <div className="p-3 border-t border-[#1b1c1e] font-['GeistMono'] text-[12px] text-[#6a6b6c] whitespace-pre-wrap leading-normal bg-[#040506]">
                        {msg.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content Body */}
                <div className="whitespace-pre-wrap font-['Inter'] font-normal text-[#ffffff]/95">
                  {msg.content}
                </div>

                {/* Zapier Execution Status Badge (if triggered) */}
                {zapierStatus[msg.id] && (
                  <div className="mt-3 p-2.5 rounded-[8px] bg-[#07080a] border border-[#2f3031] flex items-center justify-between text-[11px] font-['GeistMono'] animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          zapierStatus[msg.id].status === 'sending'
                            ? 'bg-[#ff6363]/15 border border-[#ff6363]/40 text-[#ff6363] animate-spin'
                            : zapierStatus[msg.id].status === 'success'
                            ? 'bg-[#59d499]/15 border border-[#59d499]/40 text-[#59d499]'
                            : 'bg-[#ff6363]/15 border border-[#ff6363]/40 text-[#ff6363]'
                        }`}
                      >
                        {zapierStatus[msg.id].status === 'sending' ? (
                          <Sparkles className="w-2.5 h-2.5" />
                        ) : zapierStatus[msg.id].status === 'success' ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : (
                          <span>!</span>
                        )}
                      </div>
                      <span className="text-[#ffffff] font-medium">
                        {zapierStatus[msg.id].app}:
                      </span>
                      <span className="text-[#9c9c9d]">
                        {zapierStatus[msg.id].details}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {zapierStatus[msg.id].durationMs > 0 && (
                        <span className="text-[#59d499]">
                          {zapierStatus[msg.id].durationMs}ms
                        </span>
                      )}
                      <span className="text-[#ff6363] bg-[#ff6363]/10 px-1 py-0.2 rounded border border-[#ff6363]/20">
                        ZAPIER MCP
                      </span>
                    </div>
                  </div>
                )}

                {/* Zapier Action Strip (for assistant messages) */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-[#1b1c1e] flex flex-wrap items-center gap-2">
                    <span className="font-['GeistMono'] text-[10px] text-[#6a6b6c] uppercase tracking-wider">
                      Zapier MCP:
                    </span>

                    <button
                      onClick={() => handleDispatchToTeams(msg.id, msg.content)}
                      disabled={zapierStatus[msg.id]?.status === 'sending'}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-[#07080a] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] border border-[#2f3031] text-[11px] font-['Inter'] transition-colors cursor-pointer"
                      title="Post this response directly to Microsoft Teams"
                    >
                      <MessageSquare className="w-3 h-3 text-[#56c2ff]" />
                      <span>Post to Teams</span>
                    </button>

                    <button
                      onClick={() => handleDispatchToNotion(msg.id, msg.content)}
                      disabled={zapierStatus[msg.id]?.status === 'sending'}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-[#07080a] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] border border-[#2f3031] text-[11px] font-['Inter'] transition-colors cursor-pointer"
                      title="Save this response directly to Notion workspace"
                    >
                      <FileText className="w-3 h-3 text-[#ff6363]" />
                      <span>Save to Notion</span>
                    </button>

                    {onOpenZapierModal && (
                      <button
                        onClick={onOpenZapierModal}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-['GeistMono'] text-[#6a6b6c] hover:text-[#ff6363] transition-colors cursor-pointer ml-auto"
                        title="Configure Zapier Agent Skills & MCP Hub"
                      >
                        <Zap className="w-2.5 h-2.5 text-[#ff6363]" />
                        <span>MCP Hub</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Message Action Bar (Copy) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="p-1 rounded bg-[#07080a]/80 hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] border border-[#2f3031] transition-all cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-[#59d499]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] font-['GeistMono'] text-[#ff6363]">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>Streaming through Groq LPUs...</span>
            </div>
            <div className="rounded-[12px] bg-[#111214] border border-[#2f3031] p-4 flex items-center gap-2 text-[13px] text-[#9c9c9d]">
              <span className="w-2 h-2 rounded-full bg-[#ff6363] animate-ping" />
              <span className="font-['GeistMono'] text-[12px]">Synthesizing reasoning tokens...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestion Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
        <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c] shrink-0 uppercase">
          Live queries:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="shrink-0 px-2.5 py-1 rounded-[6px] bg-[#111214] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-[#ffffff] border border-[#2f3031] text-[12px] font-['Inter'] transition-colors cursor-pointer"
          >
            "{qp}"
          </button>
        ))}
      </div>

      {/* Recessed Input Well (#111214) with keyboard key styling */}
      <div
        className="rounded-[12px] bg-[#111214] border border-[#2f3031] p-2 flex items-end gap-2 transition-all focus-within:border-[#ff6363]/60 focus-within:ring-1 focus-within:ring-[#ff6363]/30"
        style={{
          boxShadow: 'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset',
        }}
      >
        <textarea
          ref={inputRef}
          rows={2}
          placeholder="Ask Groq about your Slack messages... (e.g. 'What was posted in #all-inmodel?') [Press ↵ to send]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-[#ffffff] text-[14px] sm:text-[15px] placeholder-[#6a6b6c] resize-none focus:outline-none p-2 leading-relaxed"
        />

        <div className="flex items-center gap-2 shrink-0 pb-1 pr-1">
          <kbd className="hidden sm:inline-block font-['GeistMono'] text-[10px] text-[#6a6b6c] bg-[#07080a] px-1.5 py-0.5 rounded border border-[#2f3031]">
            ↵ Send
          </kbd>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-[8px] transition-all cursor-pointer ${
              input.trim() && !isLoading
                ? 'bg-[#e6e6e6] hover:bg-[#ffffff] text-[#454647] btn-mist-shadow active:scale-95'
                : 'bg-[#1b1c1e] text-[#6a6b6c] cursor-not-allowed border border-[#2f3031]'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
