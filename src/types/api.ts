/**
 * API Response Types — Enforced across all serverless functions and service layers.
 * Provides compile-time safety for Composio MCP bridge, Groq inference, and workspace connectors.
 */

// ─── Base API Response ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: number;
}

// ─── Composio MCP Types ──────────────────────────────────────────────────────
export interface ComposioRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface ComposioRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: {
    content?: Array<{ type: string; text: string }>;
    data?: Record<string, unknown>;
  };
  error?: {
    code: number;
    message: string;
  };
}

export type ComposioToolkitSlug =
  | 'slack'
  | 'microsoft_teams'
  | 'notion'
  | 'github'
  | 'discord'
  | 'googlecalendar';

export interface ComposioConnectionRequest {
  action: 'add' | 'list' | 'remove';
  name: ComposioToolkitSlug;
}

export interface OAuthRedirectResponse {
  success: boolean;
  toolkit: ComposioToolkitSlug;
  redirectUrl: string;
}

// ─── Slack API Types ─────────────────────────────────────────────────────────
export interface SlackChannelResponse {
  id: string;
  name: string;
  num_members: number;
  is_general?: boolean;
  topic?: { value: string };
  purpose?: { value: string };
}

export interface SlackMessageResponse {
  type: string;
  ts: string;
  user: string;
  text: string;
  thread_ts?: string;
  reply_count?: number;
}

// ─── Groq Inference Types ────────────────────────────────────────────────────
export interface GroqChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_completion_tokens?: number;
  stream?: boolean;
}

export interface GroqChatResponse {
  id: string;
  object: 'chat.completion';
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
      reasoning?: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    completion_time?: number;
  };
}

// ─── Workspace Session Types ─────────────────────────────────────────────────
export interface WorkspaceAccount {
  team: string;
  teamId: string;
  user: string;
  userId: string;
  url: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

// ─── Error Types ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  constructor(
    message: string,
    statusCode: number,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  operation: string;
  severity: ErrorSeverity;
  retryable: boolean;
  details?: Record<string, unknown>;
}
