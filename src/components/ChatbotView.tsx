import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Settings,
  Brain,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Plus,
  Mic,
  Share2,
  CheckCircle2,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  ArrowLeft,
  Hash,
  FileText,
  Users,
  Compass,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  sendGroqChat,
  GROQ_MODELS,
  OLLAMA_MODELS,
  checkOllamaStatus,
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_OLLAMA_BASE_URL,
  type ChatMessage as GroqChatMessage,
  type AIProvider,
} from '../services/groqService';
import {
  fetchLiveChannels,
  fetchLiveMessages,
  buildRealWorkspacePromptContext,
  format50ItemsPromptContext,
  type LiveMessage,
  type SlackChannel,
} from '../services/workspaceConnectorService';

interface ChatMessage extends GroqChatMessage {
  toolUsed?: 'Slack' | 'Microsoft Teams' | 'Notion' | 'Unified Workspace';
  toolDetails?: string;
}

interface ChatThread {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  activeIntegration: 'slack' | 'teams' | 'notion' | 'all';
}

interface ChatbotViewProps {
  onBackToLanding?: () => void;
  onOpenZapierModal?: () => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  onBackToLanding,
}) => {
  // Sidebar State (User friendly chat tools have collapsible history)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initial Threads
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'thread-1',
      title: 'Slack models connector check',
      timestamp: 'Today, 1:40 PM',
      activeIntegration: 'slack',
      messages: [
        {
          id: 'msg-u1',
          role: 'user',
          content: 'whats ahapenibng',
          timestamp: Date.now() - 40000,
        },
        {
          id: 'msg-a1',
          role: 'assistant',
          toolUsed: 'Slack',
          toolDetails: 'Checked inmodel channels (#all-inmodel, #inmodel-sales-deals, #new-channel, #social)',
          content: `Nothing new in inmodel. Both channels have no messages, replies, or reactions since the last check.

Still open:
• Northwind Traders has been silent for 9 days, and Rahul is following up.
• Initech has a discovery call Tuesday at 11 AM.
• Sales quota is at 78% with 3 weeks left.
• Security training is due by the end of next week.`,
          timestamp: Date.now() - 25000,
          metrics: {
            latencyMs: 412,
            tokensPerSecond: 380,
            totalTokens: 110,
          },
        },
      ],
    },
    {
      id: 'thread-2',
      title: 'Sprint 44 blockers review',
      timestamp: 'Yesterday',
      activeIntegration: 'notion',
      messages: [],
    },
    {
      id: 'thread-3',
      title: 'Auth incident post-mortem',
      timestamp: 'Oct 8',
      activeIntegration: 'teams',
      messages: [],
    },
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Active Model & Integrations
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-oss-20b');
  const [activeIntegration, setActiveIntegration] = useState<'slack' | 'teams' | 'notion' | 'all'>(
    activeThread.activeIntegration || 'slack'
  );
  const [showIntegrationMenu, setShowIntegrationMenu] = useState(false);

  // Input & State
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, 'up' | 'down'>>({});
  const [expandedToolMap, setExpandedToolMap] = useState<Record<string, boolean>>({});
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // AI Provider & Ollama State
  const [aiProvider, setAiProvider] = useState<AIProvider>('groq');
  const [ollamaModel, setOllamaModel] = useState<string>(DEFAULT_OLLAMA_MODEL);
  const [customOllamaModel, setCustomOllamaModel] = useState<string>('');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>(DEFAULT_OLLAMA_BASE_URL);
  const [ollamaStatus, setOllamaStatus] = useState<{ isRunning: boolean; version?: string } | null>(null);
  const [isCheckingOllama, setIsCheckingOllama] = useState<boolean>(false);

  // Real Workspace Feeds
  const [liveChannels, setLiveChannels] = useState<SlackChannel[]>([]);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchLiveChannels().then(setLiveChannels);
    fetchLiveMessages('C0BBUP1LEJH').then(setLiveMessages);
  }, []);

  // Probe Ollama status when user opens settings or selects Ollama provider
  useEffect(() => {
    if (aiProvider === 'ollama' || showSettings) {
      setIsCheckingOllama(true);
      checkOllamaStatus(ollamaBaseUrl)
        .then(setOllamaStatus)
        .catch(() => setOllamaStatus({ isRunning: false }))
        .finally(() => setIsCheckingOllama(false));
    }
  }, [aiProvider, ollamaBaseUrl, showSettings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread.messages, isLoading]);

  // Create New Chat (Just like Claude/ChatGPT)
  const handleNewChat = () => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      title: 'New conversation',
      timestamp: 'Just now',
      activeIntegration: 'slack',
      messages: [],
    };
    setThreads([newThread, ...threads]);
    setActiveThreadId(newThreadId);
    setActiveIntegration('slack');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Send Message
  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const currentMessages = activeThread.messages || [];
    const updatedMessages = [...currentMessages, userMessage];

    // Update thread title if first message
    const updatedTitle =
      activeThread.title === 'New conversation'
        ? prompt.length > 28
          ? `${prompt.slice(0, 28)}...`
          : prompt
        : activeThread.title;

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, title: updatedTitle, messages: updatedMessages }
          : t
      )
    );

    setInput('');
    setIsLoading(true);

    try {
      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Determine active integration tool
      let toolName: 'Slack' | 'Microsoft Teams' | 'Notion' | 'Unified Workspace' = 'Slack';
      let toolDetail = 'Checked inmodel channels (#all-inmodel, #inmodel-sales-deals, #new-channel, #social)';
      let contextText = '';

      const lower = prompt.toLowerCase();
      if (lower.includes('notion') || activeIntegration === 'notion') {
        toolName = 'Notion';
        toolDetail = 'Checked 50 recent Notion specs & Sprint 44 database items';
        contextText = format50ItemsPromptContext('notion');
      } else if (lower.includes('teams') || activeIntegration === 'teams') {
        toolName = 'Microsoft Teams';
        toolDetail = 'Checked 50 recent messages in #Product Sync & #Engineering Core';
        contextText = format50ItemsPromptContext('teams');
      } else {
        toolName = 'Slack';
        toolDetail = 'Checked inmodel channels (#all-inmodel, #inmodel-sales-deals, #new-channel, #social)';
        contextText = buildRealWorkspacePromptContext(liveMessages, liveChannels);
      }

      const effectiveModel =
        aiProvider === 'ollama'
          ? (ollamaModel === 'custom' ? customOllamaModel.trim() || 'llama3.2' : ollamaModel)
          : selectedModel;

      const result = await sendGroqChat({
        messages: history,
        model: effectiveModel,
        apiKey: apiKeyOverride,
        provider: aiProvider,
        ollamaBaseUrl: ollamaBaseUrl,
        systemPrompt: `You are CatchUp AI, an intelligent executive workspace copilot designed like Claude.
Live Workspace Context:
${contextText}

CRITICAL FORMATTING INSTRUCTIONS:
1. When user asks what is happening ("whats happening", "whats ahapenibng", "what happened", "summarize", etc.):
   - First state the direct status of the workspace (e.g. "Nothing new in inmodel. Both channels have no messages since the last check." or mention recent live activity).
   - Then provide a clean, readable section:
Still open:
• [Action item, discovery call, client demo, or pending task]
• [Next key priority with person/deadline]
• [Next key item]

2. Match the clean, direct, executive tone of Claude: helpful, concise, well-formatted, and completely factual based on the workspace context.`,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        toolUsed: toolName,
        toolDetails:
          aiProvider === 'ollama'
            ? `100% Local Edge (Ollama: ${effectiveModel}) • ${toolDetail}`
            : toolDetail,
        content: result.content,
        reasoning: result.reasoning,
        timestamp: Date.now(),
        metrics: result.metrics,
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages: [...updatedMessages, assistantMessage] }
            : t
        )
      );
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Unknown error occurred';
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        toolUsed: 'Slack',
        content:
          aiProvider === 'ollama'
            ? `⚠️ Ollama Local Inference Error: ${errorText}\n\nMake sure Ollama is running on ${ollamaBaseUrl} with \`ollama serve\` and you have pulled the model with \`ollama run ${ollamaModel === 'custom' ? customOllamaModel || 'llama3.2' : ollamaModel}\`.`
            : `⚠️ Groq Execution Error: ${errorText}\n\nPlease verify your network or check settings.`,
        timestamp: Date.now(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages: [...updatedMessages, errorMessage] }
            : t
        )
      );
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

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setLikedMap((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined! : type,
    }));
  };

  const handleRegenerate = () => {
    const msgs = activeThread.messages;
    if (msgs.length < 2) return;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast('Chat link copied to clipboard!');
    setTimeout(() => setShareToast(null), 2500);
  };

  const starterCards = [
    {
      title: 'whats ahapenibng',
      desc: 'Check live Slack channels & open items',
      icon: <Hash className="w-4 h-4 text-[#ff6363]" />,
    },
    {
      title: 'Summarize #all-inmodel',
      desc: 'Read latest updates from @shreeharshastark',
      icon: <Sparkles className="w-4 h-4 text-[#59d499]" />,
    },
    {
      title: 'Review open tasks & blockers',
      desc: 'Extract Still Open list across toolkits',
      icon: <FileText className="w-4 h-4 text-[#7B83EB]" />,
    },
    {
      title: 'Check Microsoft Teams sync',
      desc: 'Audit 50 recent messages in Product & Core',
      icon: <Users className="w-4 h-4 text-[#ffb86c]" />,
    },
  ];

  return (
    <div className="w-full h-screen bg-[#07080a] text-[#ffffff] font-['Inter'] flex overflow-hidden selection:bg-[#ff6363]/30">
      {/* Toast */}
      {shareToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#16181d] border border-[#2e313b] text-[#ffffff] px-3.5 py-2 rounded-[8px] text-[13px] shadow-2xl animate-fade-in flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#59d499]" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* =========================================================================
          LEFT SIDEBAR: CONVERSATION HISTORY & WORKSPACE INTEGRATIONS
          ========================================================================= */}
      <aside
        className={`h-full bg-[#0a0c0f] border-r border-[#1c1d22] flex flex-col justify-between transition-all duration-300 z-30 ${
          isSidebarOpen ? 'w-[260px]' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        <div className="p-3.5 flex flex-col h-full overflow-hidden">
          {/* Top Row: Brand & New Chat */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1c1d22]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[6px] bg-[#ff6363]/15 border border-[#ff6363]/30 flex items-center justify-center text-[#ff6363]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[14px] text-[#ffffff] tracking-tight">
                CatchUp AI
              </span>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-[6px] text-[#6a6b6c] hover:text-[#ffffff] hover:bg-[#14161b] transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 rounded-[8px] bg-[#14161b] hover:bg-[#1c1f26] border border-[#262830] text-[#ffffff] text-[13px] font-medium flex items-center justify-between transition-all cursor-pointer shadow-sm mb-4 group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#ff6363] group-hover:scale-110 transition-transform" />
              <span>New chat</span>
            </div>
            <kbd className="font-['GeistMono'] text-[10px] text-[#6a6b6c] bg-[#0c0d10] px-1.5 py-0.5 rounded border border-[#22242b]">
              ⌘N
            </kbd>
          </button>

          {/* Recent Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <span className="text-[11px] font-['GeistMono'] text-[#6a6b6c] uppercase tracking-wider px-2 block mb-1">
              Recent Chats
            </span>
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveThreadId(t.id);
                  setActiveIntegration(t.activeIntegration || 'slack');
                }}
                className={`w-full text-left px-2.5 py-2 rounded-[8px] text-[13px] flex items-center justify-between group transition-colors cursor-pointer ${
                  t.id === activeThreadId
                    ? 'bg-[#181a20] text-[#ffffff] font-medium border border-[#2a2d36]'
                    : 'text-[#9c9c9d] hover:bg-[#111317] hover:text-[#ffffff]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-[#6a6b6c] group-hover:text-[#ff6363] shrink-0" />
                  <span className="truncate">{t.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Sidebar Footer: Connected Toolkits Status */}
          <div className="pt-3 border-t border-[#1c1d22] space-y-2">
            <span className="text-[10px] font-['GeistMono'] text-[#6a6b6c] uppercase tracking-wider px-1 block">
              Connected Toolkits:
            </span>
            <div className="space-y-1.5 text-[12px] font-['GeistMono']">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-[#111317] border border-[#202228] text-[#cccccc]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] animate-pulse" />
                  <span>Slack (inmodel)</span>
                </div>
                <span className="text-[10px] text-[#59d499]">4 ch</span>
              </div>

              <div className="flex items-center justify-between px-2 py-1 rounded bg-[#111317] border border-[#202228] text-[#9c9c9d]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7B83EB]" />
                  <span>Teams (Product)</span>
                </div>
                <span className="text-[10px] text-[#7B83EB]">50 msgs</span>
              </div>

              <div className="flex items-center justify-between px-2 py-1 rounded bg-[#111317] border border-[#202228] text-[#9c9c9d]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb86c]" />
                  <span>Notion (Sprint 44)</span>
                </div>
                <span className="text-[10px] text-[#ffb86c]">50 items</span>
              </div>
            </div>

            {/* Back to Hub Button */}
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="w-full mt-2 py-1.5 px-2.5 rounded-[6px] text-[12px] text-[#9c9c9d] hover:text-[#ffffff] hover:bg-[#14161b] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Hub</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CHAT STAGE: FOCUSED, SPACIOUS, IDENTICAL TO CLAUDE SCREENSHOT
          ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#1c1d22] bg-[#07080a] z-20">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-[6px] text-[#9c9c9d] hover:text-[#ffffff] hover:bg-[#14161b] transition-colors cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Chat Title Dropdown */}
            <div className="flex items-center gap-1.5 cursor-pointer group">
              <span className="text-[14px] font-medium text-[#ffffff]">
                {activeThread.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6a6b6c] group-hover:text-[#ffffff]" />
            </div>
          </div>

          {/* Right Tools: Engine Badge, Free plan, Settings, Share */}
          <div className="flex items-center gap-2 text-[12px]">
            {/* Active Engine Badge */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-['GeistMono'] border transition-all cursor-pointer ${
                aiProvider === 'ollama'
                  ? 'bg-[#59d499]/15 text-[#59d499] border-[#59d499]/30 hover:bg-[#59d499]/20'
                  : 'bg-[#ff6363]/15 text-[#ff6363] border-[#ff6363]/30 hover:bg-[#ff6363]/20'
              }`}
              title="Toggle inference engine settings"
            >
              {aiProvider === 'ollama' ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-[#59d499]" />
                  <span>🦙 Ollama ({ollamaModel === 'custom' ? customOllamaModel || 'custom' : ollamaModel})</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-[#ff6363]" />
                  <span>⚡ Groq LPU</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                showSettings ? 'bg-[#1b1c1e] text-[#ffffff]' : 'text-[#9c9c9d] hover:text-[#ffffff] hover:bg-[#14161b]'
              }`}
              title="AI Provider Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#14161b] hover:bg-[#1c1f26] border border-[#272932] text-[#ffffff] font-medium transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#9c9c9d]" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Settings Drawer */}
        {showSettings && (
          <div className="w-full max-w-[800px] mx-auto mt-2 p-4 rounded-[12px] bg-[#0c0d10] border border-[#27282b] text-[12px] animate-fade-in z-20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1c1e]">
              <span className="font-semibold text-[#ffffff] text-[13px]">AI Inference Engine Configuration</span>
              <div className="flex items-center p-0.5 rounded-[6px] bg-[#111214] border border-[#27282b]">
                <button
                  onClick={() => setAiProvider('groq')}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-['GeistMono'] transition-all cursor-pointer ${
                    aiProvider === 'groq'
                      ? 'bg-[#ff6363]/20 text-[#ff6363] border border-[#ff6363]/40 font-medium'
                      : 'text-[#9c9c9d] hover:text-[#ffffff]'
                  }`}
                >
                  ⚡ Groq LPU (Cloud)
                </button>
                <button
                  onClick={() => setAiProvider('ollama')}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-['GeistMono'] transition-all cursor-pointer ${
                    aiProvider === 'ollama'
                      ? 'bg-[#59d499]/20 text-[#59d499] border border-[#59d499]/40 font-medium'
                      : 'text-[#9c9c9d] hover:text-[#ffffff]'
                  }`}
                >
                  🦙 Ollama (100% Local BYOM)
                </button>
              </div>
            </div>

            {/* Groq Form */}
            {aiProvider === 'groq' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[#9c9c9d] text-[11px] block mb-1">Select Reasoning Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-[#111214] border border-[#27282b] rounded-[6px] px-3 py-1.5 text-[#ffffff] font-['GeistMono'] focus:outline-none"
                    >
                      {GROQ_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contextWindow})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[#9c9c9d] text-[11px] block mb-1">API Key Override (Optional)</label>
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={apiKeyOverride}
                      onChange={(e) => setApiKeyOverride(e.target.value)}
                      className="w-full bg-[#111214] border border-[#27282b] rounded-[6px] px-3 py-1.5 text-[#ffffff] font-mono focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#6a6b6c] font-['GeistMono']">
                  Groq Language Processing Units deliver ultra-high tokens/sec inference across open-weights models.
                </p>
              </div>
            )}

            {/* Ollama Form */}
            {aiProvider === 'ollama' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#9c9c9d] text-[11px] block mb-1">Local Model (BYOM)</label>
                    <select
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      className="w-full bg-[#111214] border border-[#27282b] rounded-[6px] px-3 py-1.5 text-[#ffffff] font-['GeistMono'] focus:outline-none focus:border-[#59d499]"
                    >
                      {OLLAMA_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.size})
                        </option>
                      ))}
                      <option value="custom">+ Custom BYOM Model Tag...</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#9c9c9d] text-[11px] block mb-1">Ollama Host Endpoint</label>
                    <input
                      type="text"
                      value={ollamaBaseUrl}
                      onChange={(e) => setOllamaBaseUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="w-full bg-[#111214] border border-[#27282b] rounded-[6px] px-3 py-1.5 text-[#ffffff] font-['GeistMono'] focus:outline-none"
                    />
                  </div>
                </div>

                {ollamaModel === 'custom' && (
                  <div>
                    <label className="text-[#9c9c9d] text-[11px] block mb-1">Custom Model Name / Tag</label>
                    <input
                      type="text"
                      value={customOllamaModel}
                      onChange={(e) => setCustomOllamaModel(e.target.value)}
                      placeholder="e.g. deepseek-r1:1.5b, mistral:7b-instruct, qwen2.5-coder:7b"
                      className="w-full bg-[#111214] border border-[#27282b] rounded-[6px] px-3 py-1.5 text-[#59d499] font-['GeistMono'] focus:outline-none"
                    />
                  </div>
                )}

                {/* Status & Connection Check */}
                <div className="flex items-center justify-between pt-1 text-[11px] font-['GeistMono']">
                  <div className="flex items-center gap-2">
                    {isCheckingOllama ? (
                      <span className="text-[#9c9c9d] flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Verifying endpoint...
                      </span>
                    ) : ollamaStatus?.isRunning ? (
                      <span className="text-[#59d499] flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#59d499]/10 border border-[#59d499]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] animate-pulse" />
                        <span>Connected ({ollamaStatus.version || 'Edge'})</span>
                      </span>
                    ) : (
                      <span className="text-[#ffbd59] flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ffbd59]/10 border border-[#ffbd59]/30">
                        <span>● Unreachable (start with `ollama serve`)</span>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setIsCheckingOllama(true);
                        checkOllamaStatus(ollamaBaseUrl).then(setOllamaStatus).finally(() => setIsCheckingOllama(false));
                      }}
                      className="text-[#9c9c9d] hover:text-[#ffffff] underline cursor-pointer"
                    >
                      Test Ping
                    </button>
                  </div>
                  <span className="text-[#59d499] text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Local Edge Air-Gapped
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col items-center">
          <div className="w-full max-w-[760px] space-y-7">
            {/* If Thread has no messages: Friendly Claude-style Welcome & Starter Chips */}
            {activeThread.messages.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-12 h-12 rounded-[14px] bg-[#14161b] border border-[#272932] flex items-center justify-center text-[#ff6363] mb-4 shadow-md">
                  <Compass className="w-6 h-6" />
                </div>
                <h2 className="text-[24px] sm:text-[28px] font-bold text-[#ffffff] mb-2">
                  What would you like to catch up on?
                </h2>
                <p className="text-[14px] text-[#9c9c9d] max-w-[480px] mb-8 leading-relaxed">
                  Connected to your authenticated <strong className="text-[#ffffff]">inmodel Slack</strong>, Teams, and Notion. Ask what's happening or choose a topic below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[620px] text-left">
                  {starterCards.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(card.title)}
                      className="p-3.5 rounded-[12px] bg-[#0c0e12] hover:bg-[#13151b] border border-[#20222a] hover:border-[#ff6363]/40 transition-all cursor-pointer flex items-start gap-3 group text-left"
                    >
                      <div className="p-2 rounded-[8px] bg-[#181a22] border border-[#2b2d38] group-hover:scale-105 transition-transform shrink-0">
                        {card.icon}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#ffffff] group-hover:text-[#ff6363] transition-colors">
                          "{card.title}"
                        </div>
                        <div className="text-[11px] text-[#9c9c9d] mt-0.5 leading-snug">
                          {card.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Thread List */
              activeThread.messages.map((msg) => {
                const isUser = msg.role === 'user';

                if (isUser) {
                  return (
                    <div key={msg.id} className="flex justify-end animate-fade-in">
                      <div className="max-w-[78%] px-4 py-2.5 rounded-[18px] bg-[#1a1c22] border border-[#2c2e36] text-[#ffffff] text-[15px] leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex flex-col items-start text-left animate-fade-in group w-full">
                    {/* "Used Slack integration" Expandable Pill Header */}
                    {msg.toolUsed && (
                      <div className="mb-2">
                        <button
                          onClick={() =>
                            setExpandedToolMap((p) => ({ ...p, [msg.id]: !p[msg.id] }))
                          }
                          className="inline-flex items-center gap-1.5 text-[13px] text-[#9c9c9d] hover:text-[#cccccc] transition-colors cursor-pointer select-none"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#59d499]" />
                          <span>Used {msg.toolUsed} integration</span>
                          <ChevronDown
                            className={`w-3 h-3 text-[#6a6b6c] transition-transform ${
                              expandedToolMap[msg.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Tool Details Flyout */}
                        {expandedToolMap[msg.id] && (
                          <div className="mt-1.5 p-2.5 rounded-[8px] bg-[#0c0d10] border border-[#22242c] text-[11px] font-['GeistMono'] text-[#9c9c9d] animate-fade-in space-y-1">
                            <div className="flex items-center gap-1 text-[#59d499]">
                              <span>✓</span>
                              <span>{msg.toolDetails || 'Scanned channels for unread activity'}</span>
                            </div>
                            <div className="text-[#6a6b6c]">
                              Zero-retention local synthesis on Groq LPUs ({msg.metrics?.latencyMs || 412}ms)
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reasoning Drawer if available */}
                    {msg.reasoning && (
                      <div className="w-full mb-2 rounded-[8px] border border-[#22242c] bg-[#0c0d10] overflow-hidden text-[11px] font-['GeistMono'] text-[#6a6b6c]">
                        <button
                          onClick={() =>
                            setExpandedReasoning((p) => ({ ...p, [msg.id]: !p[msg.id] }))
                          }
                          className="w-full flex items-center justify-between p-2 cursor-pointer hover:text-[#9c9c9d]"
                        >
                          <span className="flex items-center gap-1.5 text-[#ff6363]">
                            <Brain className="w-3 h-3" />
                            <span>Reasoning Process</span>
                          </span>
                          {expandedReasoning[msg.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        {expandedReasoning[msg.id] && (
                          <div className="p-3 border-t border-[#1c1d22] bg-[#07080a] whitespace-pre-wrap text-[#9c9c9d]">
                            {msg.reasoning}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assistant Message Body (Clean typography like Claude) */}
                    <div className="w-full text-[15px] sm:text-[16px] text-[#ffffff] leading-[1.68] font-['Inter'] whitespace-pre-line selection:bg-[#ff6363]/30">
                      {msg.content}
                    </div>

                    {/* Action Strip: Copy, Audio, Thumbs, Regenerate */}
                    <div className="flex items-center gap-3 mt-3 pt-1 text-[#6a6b6c]">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="p-1 hover:text-[#ffffff] transition-colors cursor-pointer"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-[#59d499]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            const ut = new SpeechSynthesisUtterance(msg.content);
                            window.speechSynthesis.speak(ut);
                          }
                        }}
                        className="p-1 hover:text-[#ffffff] transition-colors cursor-pointer"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleFeedback(msg.id, 'up')}
                        className={`p-1 transition-colors cursor-pointer ${
                          likedMap[msg.id] === 'up' ? 'text-[#59d499]' : 'hover:text-[#ffffff]'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleFeedback(msg.id, 'down')}
                        className={`p-1 transition-colors cursor-pointer ${
                          likedMap[msg.id] === 'down' ? 'text-[#ff6363]' : 'hover:text-[#ffffff]'
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={handleRegenerate}
                        className="p-1 hover:text-[#ffffff] transition-colors cursor-pointer"
                        title="Regenerate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {msg.metrics && (
                        <span className="text-[10px] font-['GeistMono'] text-[#6a6b6c] ml-auto">
                          {msg.metrics.latencyMs}ms • Groq LPU
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start animate-fade-in text-left">
                <div className="flex items-center gap-1.5 text-[13px] text-[#9c9c9d] mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6363] animate-spin" />
                  <span>Checking {activeIntegration === 'slack' ? 'Slack' : activeIntegration === 'teams' ? 'Microsoft Teams' : 'Notion'} integration...</span>
                </div>
                <div className="flex items-center gap-2 text-[#9c9c9d] text-[14px]">
                  <span className="w-2 h-2 rounded-full bg-[#ff6363] animate-pulse" />
                  <span>Scanning channels and organizing open items...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* =========================================================================
            BOTTOM FLOATING INPUT BAR: MATCHES EXACT CLAUDE / CHATGPT PILL
            ========================================================================= */}
        <div className="w-full px-4 sm:px-6 pt-3 pb-3 bg-gradient-to-t from-[#07080a] via-[#07080a] to-transparent flex flex-col items-center">
          <div className="w-full max-w-[760px] rounded-[22px] bg-[#111317] border border-[#272932] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col gap-2 transition-all focus-within:border-[#ff6363]/60 focus-within:ring-1 focus-within:ring-[#ff6363]/20">
            {/* Textarea */}
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="Write a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-[#ffffff] text-[15px] placeholder-[#6a6b6c] resize-none focus:outline-none leading-relaxed"
            />

            {/* Controls Strip: [+] on left, [Integration tag + Model + Mic + Send] on right */}
            <div className="flex items-center justify-between pt-1">
              {/* Left Side: Plus Icon to switch active integration */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShowIntegrationMenu(!showIntegrationMenu)}
                  className="w-7 h-7 rounded-full bg-[#1a1c22] hover:bg-[#252830] text-[#9c9c9d] hover:text-[#ffffff] flex items-center justify-center transition-colors cursor-pointer"
                  title="Attach integration"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Active Tool Pill */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#181a20] border border-[#262832] text-[11px] font-['GeistMono'] text-[#cccccc]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]" />
                  <span>
                    {activeIntegration === 'slack'
                      ? 'Slack: inmodel'
                      : activeIntegration === 'teams'
                      ? 'Microsoft Teams'
                      : activeIntegration === 'notion'
                      ? 'Notion'
                      : 'All Workspaces'}
                  </span>
                </div>

                {/* Integration Picker Popover */}
                {showIntegrationMenu && (
                  <div className="absolute bottom-9 left-0 w-60 p-2 rounded-[10px] bg-[#14161c] border border-[#2a2d36] shadow-2xl text-[12px] z-50 animate-fade-in space-y-1">
                    <span className="text-[10px] font-['GeistMono'] text-[#6a6b6c] uppercase block px-2 py-0.5">
                      Focus Context:
                    </span>
                    {[
                      { id: 'slack', label: 'Slack (#all-inmodel)' },
                      { id: 'teams', label: 'Microsoft Teams (50 msgs)' },
                      { id: 'notion', label: 'Notion (50 specs)' },
                      { id: 'all', label: 'Unified All Workspaces' },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveIntegration(tool.id as any);
                          setShowIntegrationMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-[6px] transition-colors cursor-pointer flex items-center justify-between ${
                          activeIntegration === tool.id
                            ? 'bg-[#ff6363]/20 text-[#ff6363] font-medium'
                            : 'hover:bg-[#1b1e25] text-[#cccccc]'
                        }`}
                      >
                        <span>{tool.label}</span>
                        {activeIntegration === tool.id && <Check className="w-3.5 h-3.5 text-[#ff6363]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Model Badge, Mic, Send */}
              <div className="flex items-center gap-2">
                {/* Model Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a1c22] border border-[#2a2d36] text-[11px] text-[#9c9c9d]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]" />
                  <span className="font-['GeistMono'] text-[#ffffff]">Sonnet 5.5</span>
                  <span className="text-[#6a6b6c]">Groq</span>
                </div>

                {/* Mic Icon */}
                <button
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`p-1.5 transition-colors cursor-pointer ${
                    isVoiceActive ? 'text-[#ff6363]' : 'text-[#9c9c9d] hover:text-[#ffffff]'
                  }`}
                  title="Dictate with voice"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    input.trim() && !isLoading
                      ? 'bg-[#ff6363] hover:bg-[#ff7a7a] text-[#040506] shadow-[0_2px_12px_rgba(255,99,99,0.4)] active:scale-95'
                      : 'bg-[#1b1d22] text-[#6a6b6c] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtext */}
          <div className="text-center mt-2 text-[11px] text-[#6a6b6c] select-none">
            Claude is AI and can make mistakes. Connected to live workspace channels.
          </div>
        </div>
      </div>
    </div>
  );
};
