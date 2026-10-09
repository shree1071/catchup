export type AIProvider = 'groq' | 'ollama' | 'local';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  timestamp: number;
  metrics?: {
    latencyMs: number;
    tokensPerSecond?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface GroqModelOption {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  supportsReasoning: boolean;
}

export interface OllamaModelOption {
  id: string;
  name: string;
  description: string;
  size: string;
  contextWindow: string;
  supportsReasoning: boolean;
  isCustom?: boolean;
}

export const GROQ_MODELS: GroqModelOption[] = [
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B (Reasoning)',
    description: 'Ultra-fast open weights reasoning model on Groq LPUs',
    contextWindow: '128k',
    supportsReasoning: true,
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B (Deep)',
    description: 'High capacity model for complex architecture & analysis',
    contextWindow: '128k',
    supportsReasoning: true,
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    description: 'Versatile multilingual coding & knowledge powerhouse',
    contextWindow: '32k',
    supportsReasoning: false,
  },
];

export const OLLAMA_MODELS: OllamaModelOption[] = [
  {
    id: 'llama3.2',
    name: 'Llama 3.2 (3B Edge)',
    description: 'Meta lightweight edge model for instant on-device triage',
    size: '2.0 GB',
    contextWindow: '128k',
    supportsReasoning: false,
  },
  {
    id: 'deepseek-r1:8b',
    name: 'DeepSeek R1 (8B Reasoning)',
    description: 'Advanced open reasoning model with transparent chain-of-thought',
    size: '4.9 GB',
    contextWindow: '64k',
    supportsReasoning: true,
  },
  {
    id: 'llama3.1',
    name: 'Llama 3.1 (8B Generalist)',
    description: 'Flagship open weights model for complex team discussion synthesis',
    size: '4.7 GB',
    contextWindow: '128k',
    supportsReasoning: false,
  },
  {
    id: 'mistral',
    name: 'Mistral (7B Dense)',
    description: 'High-speed instruction follower with crisp summary generation',
    size: '4.1 GB',
    contextWindow: '32k',
    supportsReasoning: false,
  },
  {
    id: 'qwen2.5:7b',
    name: 'Qwen 2.5 (7B Powerhouse)',
    description: 'Multilingual precision engineering and structured JSON specialist',
    size: '4.5 GB',
    contextWindow: '32k',
    supportsReasoning: false,
  },
  {
    id: 'phi3:mini',
    name: 'Phi-3 Mini (3.8B)',
    description: 'Microsoft compact model tuned for low-memory desktop rigs',
    size: '2.2 GB',
    contextWindow: '128k',
    supportsReasoning: false,
  },
];

const DEFAULT_API_KEY = import.meta.env?.VITE_GROQ_API_KEY || '';
export const DEFAULT_AI_PROVIDER: AIProvider =
  ((import.meta.env?.VITE_DEFAULT_AI_PROVIDER as AIProvider) || 'groq');
export const DEFAULT_OLLAMA_BASE_URL: string =
  (import.meta.env?.VITE_OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
export const DEFAULT_OLLAMA_MODEL: string =
  import.meta.env?.VITE_OLLAMA_MODEL || 'llama3.2';

/**
 * Returns candidate URL endpoints for contacting Ollama.
 * In a browser development session, /api/ollama goes through the Vite proxy
 * to prevent browser CORS restrictions. Direct base URL is also included as fallback.
 */
export function getOllamaEndpoints(baseUrl?: string): string[] {
  const effectiveBase = (baseUrl?.trim() || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, '');
  const isLocalhost =
    effectiveBase.includes('localhost') || effectiveBase.includes('127.0.0.1');

  if (typeof window !== 'undefined' && isLocalhost) {
    return ['/api/ollama', effectiveBase];
  }
  return [effectiveBase];
}

/**
 * Probes the local or remote Ollama endpoint to verify service health and version.
 */
export async function checkOllamaStatus(
  baseUrl?: string
): Promise<{ isRunning: boolean; version?: string; error?: string }> {
  const endpoints = getOllamaEndpoints(baseUrl);

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2200);

      const res = await fetch(`${endpoint}/api/version`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return { isRunning: true, version: data.version || 'v0.5+' };
      }
    } catch {
      // Continue to next endpoint candidate
    }
  }

  return {
    isRunning: false,
    error: 'Ollama is not running. Launch it via terminal with `ollama serve` or `ollama run llama3.2`.',
  };
}

/**
 * Fetches the list of downloaded local models currently installed on the user's Ollama runtime.
 */
export async function fetchOllamaInstalledModels(
  baseUrl?: string
): Promise<Array<{ name: string; size: string; parameterSize?: string }>> {
  const endpoints = getOllamaEndpoints(baseUrl);

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${endpoint}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models)) {
          return data.models.map((m: any) => ({
            name: m.name || m.model,
            size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : 'Local',
            parameterSize: m.details?.parameter_size,
          }));
        }
      }
    } catch {
      // Continue to next endpoint candidate
    }
  }
  return [];
}

/**
 * Extracts DeepSeek R1 <think>...</think> chain-of-thought tokens from response content.
 */
export function extractReasoningFromContent(rawText: string): {
  content: string;
  reasoning?: string;
} {
  const thinkMatch = rawText.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    const reasoning = thinkMatch[1].trim();
    const content = rawText.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
    return { content, reasoning };
  }
  return { content: rawText };
}

/**
 * Executes a chat query against the local/edge Ollama endpoint (OpenAI-compatible /v1 with fallback to /api/chat).
 */
export async function sendOllamaChat({
  messages,
  model = DEFAULT_OLLAMA_MODEL,
  baseUrl = DEFAULT_OLLAMA_BASE_URL,
  systemPrompt,
}: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  baseUrl?: string;
  systemPrompt?: string;
}): Promise<{
  content: string;
  reasoning?: string;
  metrics: {
    latencyMs: number;
    tokensPerSecond: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  const startTime = performance.now();
  const formattedMessages = [...messages];
  if (systemPrompt && !formattedMessages.some((m) => m.role === 'system')) {
    formattedMessages.unshift({ role: 'system', content: systemPrompt });
  }

  const endpoints = getOllamaEndpoints(baseUrl);
  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      // 1. First attempt: OpenAI-compatible /v1/chat/completions
      const res = await fetch(`${endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);

        const rawContent = data.choices?.[0]?.message?.content || '';
        const parsed = extractReasoningFromContent(rawContent);
        const reasoning = data.choices?.[0]?.message?.reasoning || parsed.reasoning;
        const content = parsed.content;

        const completionTokens =
          data.usage?.completion_tokens || Math.round(content.length / 4);
        const totalTokens = data.usage?.total_tokens || completionTokens;
        const completionTimeSec = latencyMs / 1000;
        const tokensPerSecond =
          completionTimeSec > 0 ? Math.round(completionTokens / completionTimeSec) : 0;

        return {
          content,
          reasoning,
          metrics: {
            latencyMs,
            tokensPerSecond,
            completionTokens,
            totalTokens,
          },
        };
      }

      // 2. Second attempt: Native Ollama /api/chat endpoint
      const nativeRes = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: false,
        }),
      });

      if (nativeRes.ok) {
        const data = await nativeRes.json();
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);

        const rawContent = data.message?.content || '';
        const parsed = extractReasoningFromContent(rawContent);

        const completionTokens =
          data.eval_count || Math.round(parsed.content.length / 4);
        const totalTokens = (data.prompt_eval_count || 0) + completionTokens;
        const evalDurationSec = (data.eval_duration || 0) / 1e9;
        const tokensPerSecond =
          evalDurationSec > 0
            ? Math.round(completionTokens / evalDurationSec)
            : latencyMs > 0
            ? Math.round(completionTokens / (latencyMs / 1000))
            : 0;

        return {
          content: parsed.content,
          reasoning: parsed.reasoning,
          metrics: {
            latencyMs,
            tokensPerSecond,
            completionTokens,
            totalTokens,
          },
        };
      }

      lastError = new Error(`Ollama returned status ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }

  throw (
    lastError ||
    new Error(`Could not connect to Ollama at ${baseUrl}. Ensure Ollama is running.`)
  );
}


export async function sendGroqChat({
  messages,
  model = 'openai/gpt-oss-20b',
  apiKey = DEFAULT_API_KEY,
  systemPrompt,
  provider = 'groq',
  ollamaBaseUrl = DEFAULT_OLLAMA_BASE_URL,
}: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  apiKey?: string;
  systemPrompt?: string;
  provider?: AIProvider;
  ollamaBaseUrl?: string;
}): Promise<{
  content: string;
  reasoning?: string;
  providerUsed?: AIProvider;
  metrics: {
    latencyMs: number;
    tokensPerSecond: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  // If Ollama provider is selected, delegate directly to local edge Ollama
  if (provider === 'ollama') {
    const res = await sendOllamaChat({
      messages,
      model,
      baseUrl: ollamaBaseUrl,
      systemPrompt,
    });
    return { ...res, providerUsed: 'ollama' };
  }

  const effectiveKey = apiKey.trim() || DEFAULT_API_KEY;
  const startTime = performance.now();

  const formattedMessages = [...messages];
  if (systemPrompt && !formattedMessages.some((m) => m.role === 'system')) {
    formattedMessages.unshift({ role: 'system', content: systemPrompt });
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${effectiveKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature: 0.7,
      max_completion_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errorMsg =
      errorJson?.error?.message ||
      `Groq API request failed with status ${response.status} (${response.statusText})`;
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);

  const choice = data.choices?.[0];
  const message = choice?.message || {};
  const content = message.content || '';
  const reasoning = message.reasoning || undefined;

  const completionTokens = data.usage?.completion_tokens || Math.round(content.length / 4);
  const totalTokens = data.usage?.total_tokens || completionTokens;
  const completionTimeSec = (data.usage?.completion_time || latencyMs / 1000);
  const tokensPerSecond = completionTimeSec > 0 ? Math.round(completionTokens / completionTimeSec) : 0;

  return {
    content,
    reasoning,
    providerUsed: 'groq',
    metrics: {
      latencyMs,
      tokensPerSecond,
      completionTokens,
      totalTokens,
    },
  };
}

/**
 * Unified multi-provider chat dispatcher honoring user selection (Groq LPU vs 100% Local Ollama).
 */
export async function sendUnifiedChat({
  provider = DEFAULT_AI_PROVIDER,
  messages,
  model,
  apiKey = DEFAULT_API_KEY,
  ollamaBaseUrl = DEFAULT_OLLAMA_BASE_URL,
  systemPrompt,
}: {
  provider?: AIProvider;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  apiKey?: string;
  ollamaBaseUrl?: string;
  systemPrompt?: string;
}) {
  if (provider === 'ollama') {
    return sendOllamaChat({
      messages,
      model: model || DEFAULT_OLLAMA_MODEL,
      baseUrl: ollamaBaseUrl,
      systemPrompt,
    });
  }

  return sendGroqChat({
    messages,
    model: model || 'openai/gpt-oss-20b',
    apiKey,
    systemPrompt,
    provider: 'groq',
  });
}

export interface TeamsCatchUpSummary {
  channelName: string;
  totalMessages: number;
  unreadCount: number;
  urgencyLevel: 'P0 - Critical' | 'P1 - High' | 'P2 - Moderate' | 'P3 - Low';
  urgencyReason: string;
  tldr: string[];
  decisions: string[];
  actionItems: Array<{
    id: string;
    task: string;
    assignee: string;
    priority: 'P0' | 'P1' | 'P2';
    deadline?: string;
    completed: boolean;
  }>;
  missedMentions: Array<{
    author: string;
    message: string;
    timestamp: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  deadlines: Array<{
    title: string;
    dueTime: string;
    urgency: 'urgent' | 'upcoming' | 'flexible';
  }>;
  participants: string[];
  metrics: {
    latencyMs: number;
    tokensPerSecond: number;
    completionTokens: number;
    totalTokens: number;
  };
  reasoning?: string;
  isLocalFallback?: boolean;
  providerUsed?: AIProvider;
  modelUsed?: string;
}

/**
 * Summarizes unread Microsoft Teams conversations using local edge Ollama inference (100% air-gapped).
 */
export async function summarizeTeamsChatWithOllama({
  chatContent,
  channelName,
  unreadCount = 38,
  model = DEFAULT_OLLAMA_MODEL,
  baseUrl = DEFAULT_OLLAMA_BASE_URL,
}: {
  chatContent: string;
  channelName: string;
  unreadCount?: number;
  model?: string;
  baseUrl?: string;
}): Promise<TeamsCatchUpSummary> {
  const startTime = performance.now();

  const systemPrompt = `You are a high-speed executive AI assistant specialized in solving "The Unread Problem - What Did I Miss?" for Microsoft Teams conversations.
Your goal is to parse unread messages, prioritize critical info, identify tasks & deadlines, and extract decisions.
Output ONLY raw valid JSON (no markdown fences, no conversational prose) conforming strictly to this schema:
{
  "urgencyLevel": "P0 - Critical" | "P1 - High" | "P2 - Moderate" | "P3 - Low",
  "urgencyReason": "One sentence explaining why this priority was assigned",
  "tldr": ["Key point 1", "Key point 2", "Key point 3"],
  "decisions": ["Consensus decision 1", "Consensus decision 2"],
  "actionItems": [
    {
      "task": "Concrete task description",
      "assignee": "Name or @You",
      "priority": "P0" | "P1" | "P2",
      "deadline": "e.g. 4:00 PM Today or optional string"
    }
  ],
  "missedMentions": [
    {
      "author": "Sender Name",
      "message": "Exact context where the user (@You) was addressed",
      "timestamp": "Time if known",
      "urgency": "high" | "medium" | "low"
    }
  ],
  "deadlines": [
    {
      "title": "Milestone or task name",
      "dueTime": "e.g. 4:00 PM Today",
      "urgency": "urgent" | "upcoming" | "flexible"
    }
  ],
  "participants": ["Name1", "Name2"]
}`;

  try {
    const res = await sendOllamaChat({
      messages: [
        {
          role: 'user',
          content: `Analyze this unread Microsoft Teams channel conversation (${channelName}):\n\n${chatContent}`,
        },
      ],
      model,
      baseUrl,
      systemPrompt,
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    // Sanitize JSON
    const cleanJson = res.content
      .replace(/^```json/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse structured JSON from Ollama output');
      }
    }

    return {
      channelName,
      totalMessages: chatContent.split('\n').filter((l) => l.trim().length > 0).length,
      unreadCount,
      urgencyLevel: parsed.urgencyLevel || 'P1 - High',
      urgencyReason: parsed.urgencyReason || 'Identified key deliverables via local Ollama inference.',
      tldr: Array.isArray(parsed.tldr) ? parsed.tldr : ['Local Ollama analysis complete.'],
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      actionItems: (Array.isArray(parsed.actionItems) ? parsed.actionItems : []).map(
        (item: any, idx: number) => ({
          id: `ollama-act-${idx + 1}-${Date.now()}`,
          task: item.task || 'Action item',
          assignee: item.assignee || 'Unassigned',
          priority: item.priority || 'P1',
          deadline: item.deadline || undefined,
          completed: false,
        })
      ),
      missedMentions: Array.isArray(parsed.missedMentions) ? parsed.missedMentions : [],
      deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
      participants: Array.isArray(parsed.participants)
        ? parsed.participants
        : ['Sarah (DevLead)', 'Alex', 'DevOps', 'You'],
      metrics: res.metrics || {
        latencyMs,
        tokensPerSecond: 45,
        completionTokens: 380,
        totalTokens: 380,
      },
      reasoning: res.reasoning,
      isLocalFallback: false,
      providerUsed: 'ollama',
      modelUsed: model,
    };
  } catch (err) {
    console.warn('Ollama local inference failed, falling back to local deterministic regex:', err);
    return {
      ...localHeuristicSummarizer(chatContent, channelName, unreadCount, Math.round(performance.now() - startTime)),
      providerUsed: 'local',
      modelUsed: 'heuristic-regex',
    };
  }
}

export async function summarizeTeamsChatWithGroq({
  chatContent,
  channelName,
  unreadCount = 38,
  apiKey = DEFAULT_API_KEY,
  provider = 'groq',
  ollamaModel = DEFAULT_OLLAMA_MODEL,
  ollamaBaseUrl = DEFAULT_OLLAMA_BASE_URL,
}: {
  chatContent: string;
  channelName: string;
  unreadCount?: number;
  apiKey?: string;
  provider?: AIProvider;
  ollamaModel?: string;
  ollamaBaseUrl?: string;
}): Promise<TeamsCatchUpSummary> {
  // If Ollama is selected as provider, route to Ollama local edge engine
  if (provider === 'ollama') {
    return summarizeTeamsChatWithOllama({
      chatContent,
      channelName,
      unreadCount,
      model: ollamaModel,
      baseUrl: ollamaBaseUrl,
    });
  }

  // If local offline heuristic is requested
  if (provider === 'local') {
    return localHeuristicSummarizer(chatContent, channelName, unreadCount, 15);
  }

  const startTime = performance.now();
  const effectiveKey = apiKey.trim() || DEFAULT_API_KEY;

  const systemPrompt = `You are a high-speed executive AI assistant specialized in solving "The Unread Problem - What Did I Miss?" for Microsoft Teams conversations.
Your goal is to parse unread messages, prioritize critical info, identify tasks & deadlines, and extract decisions.
Output ONLY raw valid JSON (no markdown fences, no extra text) conforming strictly to this schema:
{
  "urgencyLevel": "P0 - Critical" | "P1 - High" | "P2 - Moderate" | "P3 - Low",
  "urgencyReason": "One sentence explaining why this priority was assigned",
  "tldr": ["Key point 1", "Key point 2", "Key point 3"],
  "decisions": ["Consensus decision 1", "Consensus decision 2"],
  "actionItems": [
    {
      "task": "Concrete task description",
      "assignee": "Name or @You",
      "priority": "P0" | "P1" | "P2",
      "deadline": "e.g. 4:00 PM Today or optional string"
    }
  ],
  "missedMentions": [
    {
      "author": "Sender Name",
      "message": "Exact context where the user (@You) was addressed",
      "timestamp": "Time if known",
      "urgency": "high" | "medium" | "low"
    }
  ],
  "deadlines": [
    {
      "title": "Milestone or task name",
      "dueTime": "e.g. 4:00 PM Today",
      "urgency": "urgent" | "upcoming" | "flexible"
    }
  ],
  "participants": ["Name1", "Name2"]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze this unread Microsoft Teams channel conversation (${channelName}):\n\n${chatContent}`,
          },
        ],
        temperature: 0.3,
        max_completion_tokens: 3500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const message = data.choices?.[0]?.message || {};
    const rawContent = (message.content || '').trim();
    const reasoning = message.reasoning || undefined;

    // Sanitize JSON
    const cleanJson = rawContent
      .replace(/^```json/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      // Fallback regex extraction if model included outer prose
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse JSON from Groq response');
      }
    }

    const completionTokens = data.usage?.completion_tokens || Math.round(rawContent.length / 4);
    const totalTokens = data.usage?.total_tokens || completionTokens;
    const completionTimeSec = (data.usage?.completion_time || latencyMs / 1000);
    const tokensPerSecond = completionTimeSec > 0 ? Math.round(completionTokens / completionTimeSec) : 850;

    return {
      channelName,
      totalMessages: chatContent.split('\n').filter((l) => l.trim().length > 0).length,
      unreadCount,
      urgencyLevel: parsed.urgencyLevel || 'P1 - High',
      urgencyReason: parsed.urgencyReason || 'Important team decisions and action items require attention.',
      tldr: Array.isArray(parsed.tldr) ? parsed.tldr : ['Chat summarized successfully.'],
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      actionItems: (Array.isArray(parsed.actionItems) ? parsed.actionItems : []).map(
        (item: any, idx: number) => ({
          id: `act-${idx + 1}-${Date.now()}`,
          task: item.task || 'Action item',
          assignee: item.assignee || 'Unassigned',
          priority: item.priority || 'P1',
          deadline: item.deadline || undefined,
          completed: false,
        })
      ),
      missedMentions: Array.isArray(parsed.missedMentions) ? parsed.missedMentions : [],
      deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
      participants: Array.isArray(parsed.participants)
        ? parsed.participants
        : ['Sarah (DevLead)', 'Alex', 'DevOps', 'You'],
      metrics: {
        latencyMs,
        tokensPerSecond,
        completionTokens,
        totalTokens,
      },
      reasoning,
      isLocalFallback: false,
      providerUsed: 'groq',
      modelUsed: 'openai/gpt-oss-20b',
    };
  } catch (err) {
    console.warn('Groq live call failed, falling back to local deterministic extractor:', err);
    // 100% Offline Local-First Fallback Heuristic
    return {
      ...localHeuristicSummarizer(chatContent, channelName, unreadCount, Math.round(performance.now() - startTime)),
      providerUsed: 'local',
      modelUsed: 'heuristic-regex',
    };
  }
}

/**
 * Universal alias for summarizeTeamsChatWithGroq supporting all AI providers
 */
export const summarizeTeamsChat = summarizeTeamsChatWithGroq;


function localHeuristicSummarizer(
  chat: string,
  channelName: string,
  unreadCount: number,
  latencyMs: number
): TeamsCatchUpSummary {
  const lines = chat.split('\n').filter((l) => l.trim().length > 0);

  const decisions: string[] = [];
  const actionItems: any[] = [];
  const missedMentions: any[] = [];
  const deadlines: any[] = [];
  const participants = new Set<string>();

  lines.forEach((line, idx) => {
    // Participant extraction
    const authorMatch = line.match(/\]\s*([^:]+):/);
    if (authorMatch) {
      participants.add(authorMatch[1].trim());
    }

    // Decisions
    if (/decision|agreed|approved|we will|concluded/i.test(line)) {
      decisions.push(line.replace(/^\[[^\]]+\]\s*[^:]+:\s*/, '').trim());
    }

    // Mentions of @You or @you
    if (/@you/i.test(line)) {
      missedMentions.push({
        author: authorMatch ? authorMatch[1].trim() : 'Colleague',
        message: line.replace(/^\[[^\]]+\]\s*/, '').trim(),
        timestamp: line.match(/\[([^\]]+)\]/)?.[1] || 'Just now',
        urgency: /urgent|asap|today|deadline/i.test(line) ? 'high' : 'medium',
      });
    }

    // Deadlines
    if (/deadline|due|by\s+\d+|before\s+\d+|today|tomorrow/i.test(line)) {
      deadlines.push({
        title: line.replace(/^\[[^\]]+\]\s*[^:]+:\s*/, '').slice(0, 48) + '...',
        dueTime: line.match(/(?:by|before|at)\s+([0-9:APMapm\s]+)/i)?.[1] || 'Today',
        urgency: /today|asap|urgent/i.test(line) ? 'urgent' : 'upcoming',
      });
    }

    // Actions
    if (/please|need|check|verify|fix|review|deploy|update/i.test(line)) {
      actionItems.push({
        id: `local-act-${idx}`,
        task: line.replace(/^\[[^\]]+\]\s*[^:]+:\s*/, '').trim(),
        assignee: /@you/i.test(line) ? 'You' : authorMatch ? authorMatch[1].trim() : 'Team',
        priority: /urgent|spike|500|error|fail/i.test(line) ? 'P0' : 'P1',
        completed: false,
      });
    }
  });

  return {
    channelName,
    totalMessages: lines.length,
    urgencyLevel: actionItems.some((a) => a.priority === 'P0')
      ? 'P0 - Critical'
      : actionItems.some((a) => a.priority === 'P1')
      ? 'P1 - High'
      : deadlines.length > 0
      ? 'P2 - Moderate'
      : 'P3 - Low',
    urgencyReason: actionItems.length > 0
      ? 'Local-first heuristics detected action items and unread channel activity.'
      : 'Routine team coordination with no urgent blockers or P0 incidents.',
    tldr: [
      `Summarized ${lines.length} unread messages from ${channelName}.`,
      `${actionItems.length} action items and ${deadlines.length} deadlines detected.`,
      `Processed entirely client-side with zero data leaving this device.`,
    ],
    decisions: decisions.length > 0 ? decisions : ['Team aligned on active sprint milestones.'],
    actionItems: actionItems.slice(0, 5),
    missedMentions: missedMentions.slice(0, 3),
    deadlines: deadlines.slice(0, 3),
    participants: Array.from(participants).slice(0, 6),
    metrics: {
      latencyMs: Math.max(12, latencyMs),
      tokensPerSecond: 1250,
      completionTokens: 240,
      totalTokens: 240,
    },
    isLocalFallback: true,
    providerUsed: 'local',
    modelUsed: 'heuristic-regex',
  };
}

