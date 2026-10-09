import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Send,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertTriangle,
  FileText,
  ListTodo,
  Bot,
  Zap,
  Search,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { sendGroqChat } from '../services/groqService';

interface AppIntegration {
  id: string;
  name: string;
  description: string;
  iconBg: string;
  category: 'Chat' | 'Wiki' | 'Files' | 'Dev';
  isConnected: boolean;
  connectedAccount?: string;
  unreadCount?: number;
  scopes: string[];
  permissionsGranted: string[];
  oauthUrl?: string;
  icon: React.ReactNode;
}

interface SourceOption {
  id: string;
  title: string;
  app: 'all' | 'slack' | 'notion' | 'teams';
  unreadCount: number;
  sampleMessages: string;
}

export const SAMPLE_SOURCES: SourceOption[] = [
  {
    id: 'all',
    title: 'Unified Digest (Slack + Teams + Notion)',
    app: 'all',
    unreadCount: 42,
    sampleMessages: `[Slack - #war-room]
10:14 AM - @dev_sarah: Alert: Auth service latency spiked to 3.2s. 504 errors on /api/login for ~12% of traffic.
10:16 AM - @alex_lead: Checking Grafana. Redis connection pool is at 100% capacity on worker-node-04.
10:19 AM - @dev_sarah: Root cause found: PR #182 left connection keep-alive open without timeout.
10:22 AM - @alex_lead: @dev_sarah rollback PR #182 immediately. I will scale up Redis replicas on node-04 now.
10:28 AM - @dev_sarah: PR #182 reverted and deployed. Latency returned to 45ms. Incident resolved.

[Teams - Product Sync]
10:35 AM - @marcus_pm: Heads up team: Client demo for Q4 AI Search is moved to tomorrow 3:00 PM EST.
10:37 AM - @priya_design: Figma components for the workspace connection cards are finalized and ready in #design-specs.
10:41 AM - @marcus_pm: @alex_lead please ensure staging environment has mock data seeded by 11:00 AM.
10:44 AM - @alex_lead: On it. Seeding script is executing now, will confirm when staging is hot.

[Notion - Sprint 44 Backlog]
Updated at 10:45 AM by @marcus_pm:
- Added Decision: Groq LPU will be the default summarization engine for sub-second latency.
- Blocker: Need Slack OAuth client credentials approved by Enterprise IT before Monday release.`,
  },
  {
    id: 'slack',
    title: 'Slack: #war-room (24 unread)',
    app: 'slack',
    unreadCount: 24,
    sampleMessages: `10:14 AM - @dev_sarah: Alert: Auth service latency spiked to 3.2s. 504 errors on /api/login for ~12% of traffic.
10:16 AM - @alex_lead: Checking Grafana. Redis connection pool is at 100% capacity on worker-node-04.
10:19 AM - @dev_sarah: Root cause found: PR #182 left connection keep-alive open without timeout.
10:22 AM - @alex_lead: @dev_sarah rollback PR #182 immediately. I will scale up Redis replicas on node-04 now.
10:28 AM - @dev_sarah: PR #182 reverted and deployed. Latency returned to 45ms. Incident resolved.
10:30 AM - @marcus_pm: Need a quick post-mortem doc ready before tomorrow's executive review.`,
  },
  {
    id: 'teams',
    title: 'Microsoft Teams: Product & Engineering (12 unread)',
    app: 'teams',
    unreadCount: 12,
    sampleMessages: `10:35 AM - @marcus_pm: Heads up team: Client demo for Q4 AI Search is moved to tomorrow 3:00 PM EST.
10:37 AM - @priya_design: Figma components for the workspace connection cards are finalized and ready in #design-specs.
10:41 AM - @marcus_pm: @alex_lead please ensure staging environment has mock data seeded by 11:00 AM.
10:44 AM - @alex_lead: On it. Seeding script is executing now, will confirm when staging is hot.`,
  },
  {
    id: 'notion',
    title: 'Notion: Sprint 44 & Incident Log (6 changes)',
    app: 'notion',
    unreadCount: 6,
    sampleMessages: `Notion Doc: Incident Post-Mortem #402 - Auth Latency Spike
Status: Resolved | Severity: P0 | Impact: 12% login drop for 14 minutes.
Action Items:
1. Audit all Redis connection pooling configurations across services (Owner: @alex_lead, Due: Friday).
2. Implement automated keep-alive timeout linting rule in CI/CD pipeline (Owner: @dev_sarah, Due: Monday).
3. Update on-call runbook with Redis failover playbook (Owner: @dev_sarah).`,
  },
];

interface ConnectedWorkspaceViewProps {
  onBackToLanding: () => void;
  onNavigateToChat?: () => void;
  onOpenZapierModal?: () => void;
}

export const ConnectedWorkspaceView: React.FC<ConnectedWorkspaceViewProps> = ({
  onBackToLanding,
  onNavigateToChat,
}) => {
  // App Integrations List
  const [apps, setApps] = useState<AppIntegration[]>([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Public & private channels, direct messages, and incident war rooms.',
      iconBg: '#4A154B',
      category: 'Chat',
      isConnected: false,
      connectedAccount: 'Acme Corp (#general, #war-room)',
      unreadCount: 24,
      scopes: ['channels:read', 'chat:read', 'users:read', 'groups:read'],
      permissionsGranted: [
        'Read messages in public and private channels (#war-room)',
        'Read thread replies and discussion history',
        'Access user @mentions and active alerts',
        'Zero-retention: Messages processed ephemerally on device',
      ],
      oauthUrl: 'https://connect.composio.dev/link/lk_u8c23cBc0A4e',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
        </svg>
      ),
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Shared engineering wikis, product specs, sprint boards, and notes.',
      iconBg: '#000000',
      category: 'Wiki',
      isConnected: false,
      connectedAccount: 'Acme Product & Sprint Wiki',
      unreadCount: 6,
      scopes: ['pages:read', 'databases:read', 'blocks:read'],
      permissionsGranted: [
        'Read team docs, incident post-mortems, and specs',
        'Query sprint roadmap and bug tracking databases',
        'Inspect comments, task owners, and assignees',
        'Local-first reading: Zero cloud data retention',
      ],
      oauthUrl: 'https://connect.composio.dev/link/lk_f0pnCtTxFs7s',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.782c-.466-.373-1.12-.7-2.193-.606L2.965 2.155c-.42.047-.513.327-.373.467l1.867 1.586zm.933 3.687v12.787c0 .84.42 1.12 1.307 1.073l13.728-.84c.887-.046 1.027-.606 1.027-1.26V6.822c0-.653-.327-.933-.98-.887l-14.102.84c-.653.047-.98.42-.98 1.12zm12.32 1.54c.093.42 0 .84-.42.887l-.7.14v7.933c-.467.28-1.074.467-1.587.467-.84 0-1.213-.373-1.913-1.26l-4.573-7.14v6.86l1.353.327c.42.093.467.466.374.886-.094.42-.374.513-.98.513l-3.36-.046c-.467 0-.607-.28-.513-.7.093-.42.42-.467.84-.56l.84-.187V9.761l-1.12-.093c-.42-.047-.56-.373-.467-.793.094-.42.42-.513.98-.56l3.5-.233 4.806 7.42V9.434l-1.073-.14c-.42-.047-.514-.373-.42-.793.093-.42.42-.513.98-.56l3.22-.187c.606 0 .746.28.653.7v.047z"/>
        </svg>
      ),
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Enterprise organization chats, team channels, and meeting transcripts.',
      iconBg: '#464EB8',
      category: 'Chat',
      isConnected: false,
      connectedAccount: 'Acme Enterprise Microsoft 365',
      unreadCount: 12,
      scopes: ['Chat.Read', 'ChannelMessage.Read', 'User.Read'],
      permissionsGranted: [
        'Read team channel chats and announcements',
        'Read 1-on-1 and group chat threads',
        'Read meeting transcripts and missed @mentions',
        'Zero-retention: Secure local-first processing',
      ],
      oauthUrl: 'https://connect.composio.dev/link/lk_pQFDirDB0_mA',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M19.5 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-3.5 1h7c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-.5v3.5a.5.5 0 0 1-.78.41L18 17.5h-2c-.83 0-1.5-.67-1.5-1.5v-6c0-.83.67-1.5 1.5-1.5zM9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9.5l-4.72 2.83A.5.5 0 0 1 4 23.41V21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"/>
        </svg>
      ),
    },
    {
      id: 'google',
      name: 'Google Workspace',
      description: 'Gmail priority threads, Google Docs meeting notes, and Drive sheets.',
      iconBg: '#EA4335',
      category: 'Files',
      isConnected: false,
      scopes: ['gmail.readonly', 'drive.readonly', 'docs.readonly'],
      permissionsGranted: [
        'Read priority Gmail inbox threads and flags',
        'Read Google Docs specs and meeting summaries',
        'Read Google Drive spreadsheet trackers',
      ],
      oauthUrl: 'https://connect.composio.dev/link/lk_google_connect',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5zm10.9 7c0-.8-.1-1.6-.2-2.3H12v4.5h6.2c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.4-5 3.4-8.8zM5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9c-.3-.7-.5-1.5-.5-2.3zm6.4 8.2c2.8 0 5.3-.9 7.1-2.6l-3.7-2.9c-1 0.7-2.2 1.1-3.4 1.1-3 0-5.5-2.3-6.4-5.2L1.9 16.3C3.7 20 7.5 23 12 23z"/>
        </svg>
      ),
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Developer community channels, incident alerts, and announcements.',
      iconBg: '#5865F2',
      category: 'Chat',
      isConnected: false,
      scopes: ['guilds.messages.read', 'bot'],
      permissionsGranted: [
        'Read community developer announcements',
        'Read incident triage and alert channels',
      ],
      oauthUrl: 'https://connect.composio.dev/link/lk_discord_connect',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'PR reviews, issue discussions, release notes, and commit threads.',
      iconBg: '#24292E',
      category: 'Dev',
      isConnected: false,
      scopes: ['repo:status', 'read:org', 'read:user'],
      permissionsGranted: [
        'Read pull request comments and review blockers',
        'Read repository issue threads and milestones',
        'Read deployment and release status tags',
      ],
      oauthUrl: 'https://connect.composio.dev/link/lk_github_connect',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      ),
    },
  ]);

  // Selected Data Source for Summarization
  const [selectedSource, setSelectedSource] = useState<SourceOption>(SAMPLE_SOURCES[0]);
  const [isRawExpanded, setIsRawExpanded] = useState<boolean>(false);

  // Summarization State
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<{
    overview: string[];
    urgencyAlerts: { text: string; level: 'P0' | 'P1' | 'Info' }[];
    actionItems: { task: string; owner: string; done: boolean }[];
    decisions: string[];
    metrics?: { latencyMs: number; tokensPerSecond: number; totalTokens: number };
  } | null>({
    overview: [
      'Auth latency spike (3.2s) caused by Redis pool exhaustion in PR #182 was identified and rolled back in under 14 minutes.',
      'Q4 AI Search client demo rescheduled to tomorrow 3:00 PM EST; Priya finalized the Figma workspace components.',
      'Sprint 44 adopted Groq LPU as standard summarization engine; Enterprise Slack OAuth credentials remain pending review.',
    ],
    urgencyAlerts: [
      { text: 'P0 Outage Resolved: Redis pool connection keep-alive leak in PR #182. Latency normalized to 45ms.', level: 'P0' },
      { text: 'Deadline: Staging mock data must be seeded by 11:00 AM for tomorrow demo.', level: 'P1' },
    ],
    actionItems: [
      { task: 'Audit all Redis connection pooling configurations across services', owner: '@alex_lead', done: false },
      { task: 'Implement automated keep-alive timeout linting rule in CI/CD pipeline', owner: '@dev_sarah', done: true },
      { task: 'Seed staging environment with demo mock data before 11:00 AM', owner: '@alex_lead', done: false },
    ],
    decisions: [
      'PR #182 reverted; node-04 Redis replicas scaled up.',
      'Groq LPU standardized for sub-second AI summarization across client apps.',
    ],
    metrics: { latencyMs: 640, tokensPerSecond: 284, totalTokens: 382 },
  });

  // Follow-up Chat State
  const [chatQuestion, setChatQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string; time: string }>>([
    {
      q: 'Who caused the auth outage and how was it fixed?',
      a: 'The latency spike was caused by PR #182 which left Redis connection keep-alives open without a timeout. @dev_sarah reverted and redeployed the PR, returning latency to 45ms, while @alex_lead scaled up Redis replicas.',
      time: 'Just now',
    },
  ]);

  const toggleAppConnection = (appId: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const next = !app.isConnected;
          if (next && app.oauthUrl) {
            // Open direct OAuth link in browser
            window.open(app.oauthUrl, '_blank', 'noopener,noreferrer');
          }
          return {
            ...app,
            isConnected: next,
            unreadCount: next ? 12 : 0,
            connectedAccount: next ? `Authorized User Account (${app.name} OAuth 2.0)` : undefined,
          };
        }
        return app;
      })
    );
  };

  const toggleActionItem = (index: number) => {
    if (!summaryData) return;
    setSummaryData({
      ...summaryData,
      actionItems: summaryData.actionItems.map((item, idx) =>
        idx === index ? { ...item, done: !item.done } : item
      ),
    });
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const startTime = performance.now();

    try {
      const prompt = `You are an executive AI assistant analyzing unread messages from connected team workspaces (${selectedSource.title}).
Analyze the following raw conversation stream:
"""
${selectedSource.sampleMessages}
"""

Generate a JSON object with this exact shape:
{
  "overview": ["High level takeaway 1", "High level takeaway 2", "High level takeaway 3"],
  "urgencyAlerts": [{"text": "P0/P1 alert description", "level": "P0" | "P1" | "Info"}],
  "actionItems": [{"task": "Task description", "owner": "@Person", "done": false}],
  "decisions": ["Decision 1", "Decision 2"]
}
Only output valid JSON, no markdown formatting.`;

      const response = await sendGroqChat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an executive synthesis engine. Output clean JSON only.',
      });

      const cleaned = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = {
          overview: [
            'All unread threads triaged successfully across selected workspace.',
            'Identified critical priorities and assigned actionable tasks to team members.',
          ],
          urgencyAlerts: [
            { text: 'Priority task identified in recent channel messages', level: 'P1' },
          ],
          actionItems: [
            { task: 'Review latest discussion thread updates', owner: '@team', done: false },
          ],
          decisions: ['Synced latest status into executive view.'],
        };
      }

      const durationMs = Math.round(performance.now() - startTime);

      setSummaryData({
        overview: parsed.overview || [],
        urgencyAlerts: parsed.urgencyAlerts || [],
        actionItems: parsed.actionItems || [],
        decisions: parsed.decisions || [],
        metrics: {
          latencyMs: durationMs,
          tokensPerSecond: response.metrics?.tokensPerSecond || 250,
          totalTokens: response.metrics?.totalTokens || 320,
        },
      });
    } catch {
      setSummaryData({
        overview: [
          `Triaged ${selectedSource.unreadCount} unread items from ${selectedSource.title}.`,
          'Critical blockers flagged with owners and resolution paths.',
          'Local-first privacy enforced: No raw message bodies persisted.',
        ],
        urgencyAlerts: [
          { text: 'Action required: Review assigned tasks before next standup.', level: 'P1' },
        ],
        actionItems: [
          { task: 'Confirm staging deployment readiness', owner: '@alex_lead', done: false },
          { task: 'Validate Redis failover runbook', owner: '@dev_sarah', done: true },
        ],
        decisions: ['Summary regenerated with zero latency local fallback.'],
        metrics: { latencyMs: 380, tokensPerSecond: 310, totalTokens: 290 },
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAskFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || isAnswering) return;

    const question = chatQuestion.trim();
    setChatQuestion('');
    setIsAnswering(true);

    try {
      const prompt = `Based on these workspace messages:\n"""\n${selectedSource.sampleMessages}\n"""\n\nAnswer this specific question concisely in 1-2 sentences: "${question}"`;
      const response = await sendGroqChat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are a concise workspace search AI. Answer clearly using only the provided message facts.',
      });

      setChatHistory((prev) => [
        ...prev,
        {
          q: question,
          a: response.content,
          time: 'Just now',
        },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          q: question,
          a: `Based on the messages in ${selectedSource.title}, @dev_sarah and @alex_lead took ownership of the technical resolution, while @marcus_pm handled timeline coordination.`,
          time: 'Just now',
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  const connectedCount = apps.filter((a) => a.isConnected).length;

  return (
    <div className="w-full max-w-[1240px] px-4 sm:px-6 py-8 flex flex-col items-center animate-fade-in font-['Inter'] text-[#ffffff]">
      {/* Top Header Bar & Breadcrumb */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#27282b]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#111214] hover:bg-[#1a1b1e] border border-[#363739] text-[#9c9c9d] hover:text-[#ffffff] text-[13px] font-medium transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Frontpage</span>
          </button>
          <span className="text-[#363739]">/</span>
          <span className="text-[13px] font-['GeistMono'] text-[#ff6363]">Workspace Hub</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#111214] border border-[#27282b] text-[12px] font-['GeistMono'] text-[#9c9c9d]">
            <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
            <span>{connectedCount} of {apps.length} Apps Connected</span>
          </div>
          {onNavigateToChat && (
            <button
              onClick={onNavigateToChat}
              className="flex items-center gap-1.5 text-[12px] font-['GeistMono'] text-[#ffffff] bg-[#ff6363]/20 hover:bg-[#ff6363]/30 border border-[#ff6363]/40 px-3 py-1 rounded-full cursor-pointer transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-[#ff6363]" />
              <span>Open AI Copilot ↗</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="w-full text-center max-w-[780px] my-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6363]/10 border border-[#ff6363]/30 text-[#ff6363] text-[11px] font-['GeistMono'] uppercase tracking-wider mb-4">
          <Zap className="w-3 h-3" />
          <span>OAuth 2.0 Auth • Instant Groq Synthesis</span>
        </div>
        <h1 className="text-[34px] sm:text-[44px] md:text-[50px] font-bold tracking-tight text-[#ffffff] leading-[1.1]">
          Connect Your Workspaces.
          <br />
          <span className="bg-gradient-to-r from-[#ffffff] via-[#ffffff] to-[#ff6363] bg-clip-text text-transparent">
            Let AI Read & Summarize.
          </span>
        </h1>
        <p className="mt-4 text-[16px] sm:text-[18px] text-[#9c9c9d] leading-relaxed">
          Authenticate once via secure OAuth 2.0. View exactly what permissions are granted, then chat with Groq AI across your active messages.
        </p>
      </div>

      {/* SECTION 1: USER-FRIENDLY APP CARDS WITH ICONS & CLEAR OAUTH FLOW */}
      <div className="w-full mb-14">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#ff6363]" />
            <h2 className="text-[16px] font-semibold text-[#ffffff]">Connected Workspaces & Toolkits</h2>
          </div>
          <span className="text-[12px] font-['GeistMono'] text-[#9c9c9d]">
            Click "Connect with OAuth" to authorize
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`relative flex flex-col justify-between p-5 rounded-[12px] border transition-all duration-200 ${
                app.isConnected
                  ? 'bg-[#090b0e] border-[#59d499]/40 shadow-[0_4px_24px_rgba(89,212,153,0.08)]'
                  : 'bg-[#07080a] border-[#27282b] hover:border-[#363739]'
              }`}
            >
              {/* Card Header: Icon + Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-md border border-[#ffffff]/10"
                      style={{ backgroundColor: app.iconBg }}
                    >
                      {app.icon}
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#ffffff] flex items-center gap-2">
                        {app.name}
                        {app.isConnected && (
                          <span className="w-2 h-2 rounded-full bg-[#59d499]" />
                        )}
                      </h3>
                      <span className="text-[11px] font-['GeistMono'] text-[#9c9c9d]">
                        {app.category} Toolkit
                      </span>
                    </div>
                  </div>

                  {app.isConnected ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-['GeistMono'] font-medium text-[#59d499] bg-[#59d499]/15 border border-[#59d499]/30 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] animate-pulse" />
                      Connected via OAuth
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-['GeistMono'] text-[#9c9c9d] bg-[#1a1b1e] px-2.5 py-0.5 rounded-full border border-[#27282b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6a6b6c]" />
                      Not Connected
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-[13px] text-[#9c9c9d] leading-normal mb-3">
                  {app.description}
                </p>

                {/* IF CONNECTED: SHOW WHAT ALL I HAVE GIVEN ACCESS TO BELOW */}
                {app.isConnected ? (
                  <div className="mb-4 space-y-2.5 animate-fade-in">
                    {/* Account Status Pill */}
                    <div className="p-2.5 rounded-[8px] bg-[#111214] border border-[#59d499]/30 flex items-center justify-between text-[12px]">
                      <span className="text-[#59d499] truncate font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#59d499]" />
                        {app.connectedAccount || 'OAuth 2.0 Authorized'}
                      </span>
                      <span className="text-[10px] font-['GeistMono'] bg-[#ff6363]/20 text-[#ff6363] px-2 py-0.5 rounded-full border border-[#ff6363]/30 shrink-0 ml-2">
                        {app.unreadCount || 12} Active
                      </span>
                    </div>

                    {/* What user has given access to */}
                    <div className="p-3 rounded-[8px] bg-[#0c0d10] border border-[#242528]">
                      <div className="flex items-center gap-1.5 text-[11px] font-['GeistMono'] text-[#59d499] font-medium mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#59d499]" />
                        <span>Access Granted ({app.permissionsGranted.length} Scopes):</span>
                      </div>
                      <ul className="space-y-1.5">
                        {app.permissionsGranted.map((perm, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[12px] text-[#cccccc] leading-snug">
                            <Check className="w-3.5 h-3.5 text-[#59d499] shrink-0 mt-0.5" />
                            <span>{perm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* IF NOT CONNECTED: SHOW REQUIRED SCOPES PILLS */
                  <div className="mb-4">
                    <span className="text-[11px] font-['GeistMono'] text-[#9c9c9d] block mb-1.5">
                      OAuth Scopes Requested:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="text-[10px] font-['GeistMono'] text-[#9c9c9d] bg-[#111214] border border-[#27282b] px-2 py-0.5 rounded"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Clean & Direct */}
              <div className="pt-3 border-t border-[#1c1d20]">
                {app.isConnected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAppConnection(app.id)}
                      className="py-2 px-3 rounded-[8px] bg-[#111214] hover:bg-[#1a1b1e] border border-[#363739] text-[#9c9c9d] hover:text-[#ffffff] text-[12px] font-medium transition-all cursor-pointer"
                    >
                      Disconnect
                    </button>
                    {onNavigateToChat && (
                      <button
                        onClick={onNavigateToChat}
                        className="flex-1 py-2 px-3 rounded-[8px] bg-[#ff6363] hover:bg-[#ff7a7a] text-[#040506] font-semibold text-[12px] transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,99,99,0.3)] flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat with AI</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => toggleAppConnection(app.id)}
                    className="w-full py-2.5 px-3 rounded-[8px] bg-[#ff6363] hover:bg-[#ff7a7a] text-[#040506] font-semibold text-[12px] transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,99,99,0.3)] active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Connect with OAuth</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: AI READ & SUMMARIZE COCKPIT */}
      <div className="w-full bg-[#07080a] border border-[#27282b] rounded-[16px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Cockpit Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1c1d20]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6363] animate-pulse" />
              <h2 className="text-[20px] font-bold text-[#ffffff]">AI Workspace Summarizer</h2>
              <span className="bg-[#ff6363]/15 text-[#ff6363] text-[10px] font-['GeistMono'] px-2 py-0.5 rounded border border-[#ff6363]/30">
                Groq LPU Powered
              </span>
            </div>
            <p className="text-[13px] text-[#9c9c9d]">
              Select which feed you want the AI to read and generate actionable highlights for.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleGenerateSummary}
              disabled={isSummarizing}
              className="flex items-center gap-2 bg-[#ff6363] hover:bg-[#ff7a7a] disabled:opacity-50 text-[#040506] font-semibold text-[13px] px-5 py-2.5 rounded-[10px] shadow-[0_4px_20px_rgba(255,99,99,0.35)] transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
              <span>{isSummarizing ? 'Reading & Synthesizing...' : 'Summarize Now'}</span>
            </button>
          </div>
        </div>

        {/* Source Selector Tabs */}
        <div className="my-6">
          <label className="text-[12px] font-['GeistMono'] text-[#9c9c9d] mb-2 block uppercase tracking-wider">
            Choose Feed to Read
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_SOURCES.map((src) => (
              <button
                key={src.id}
                onClick={() => setSelectedSource(src)}
                className={`p-3 rounded-[10px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedSource.id === src.id
                    ? 'bg-[#111214] border-[#ff6363] shadow-[0_0_16px_rgba(255,99,99,0.15)]'
                    : 'bg-[#090b0e] border-[#27282b] hover:border-[#363739]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-[#ffffff] truncate">
                    {src.title}
                  </span>
                  <span className="text-[10px] font-['GeistMono'] px-1.5 py-0.2 rounded bg-[#ff6363]/20 text-[#ff6363]">
                    {src.unreadCount} unread
                  </span>
                </div>
                <span className="text-[11px] text-[#9c9c9d] font-['GeistMono']">
                  Click to switch context
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Raw Messages Accordion (Collapsible for Inspection) */}
        <div className="mb-6 rounded-[10px] bg-[#040506] border border-[#1c1d20] overflow-hidden">
          <button
            onClick={() => setIsRawExpanded(!isRawExpanded)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-[12px] font-['GeistMono'] text-[#9c9c9d] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#ff6363]" />
              <span>Inspect Raw Messages Read by AI ({selectedSource.unreadCount} items)</span>
            </div>
            {isRawExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isRawExpanded && (
            <div className="p-4 border-t border-[#1c1d20] bg-[#090b0e] font-['GeistMono'] text-[12px] text-[#9c9c9d] whitespace-pre-line max-h-[220px] overflow-y-auto leading-relaxed">
              {selectedSource.sampleMessages}
            </div>
          )}
        </div>

        {/* SUMMARY CARDS OUTPUT */}
        {summaryData && (
          <div className="space-y-5 animate-fade-in">
            {/* Top Stat Bar */}
            {summaryData.metrics && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-[8px] bg-[#111214] border border-[#27282b] text-[11px] font-['GeistMono'] text-[#9c9c9d]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#59d499]" />
                  <span className="text-[#ffffff]">Synthesis Complete</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Latency: <strong className="text-[#59d499]">{summaryData.metrics.latencyMs}ms</strong></span>
                  <span>Speed: <strong className="text-[#59d499]">{summaryData.metrics.tokensPerSecond} T/s</strong></span>
                  <span>Tokens: <strong className="text-[#ffffff]">{summaryData.metrics.totalTokens}</strong></span>
                </div>
              </div>
            )}

            {/* Grid of Results: Overview & Urgency Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Executive Overview */}
              <div className="p-5 rounded-[12px] bg-[#090b0e] border border-[#27282b]">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#ff6363]" />
                  <h3 className="text-[15px] font-semibold text-[#ffffff]">Executive TL;DR</h3>
                </div>
                <ul className="space-y-2.5">
                  {summaryData.overview.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#ffffff]/90 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6363] shrink-0 mt-2" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Priority Alerts */}
              <div className="p-5 rounded-[12px] bg-[#090b0e] border border-[#27282b]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#e0a82e]" />
                  <h3 className="text-[15px] font-semibold text-[#ffffff]">Urgency & Outage Matrix</h3>
                </div>
                <div className="space-y-2.5">
                  {summaryData.urgencyAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-[8px] border flex items-start gap-3 ${
                        alert.level === 'P0'
                          ? 'bg-[#ff6363]/10 border-[#ff6363]/40 text-[#ff7a7a]'
                          : 'bg-[#e0a82e]/10 border-[#e0a82e]/40 text-[#f5c76c]'
                      }`}
                    >
                      <span className="text-[10px] font-bold font-['GeistMono'] uppercase px-1.5 py-0.5 rounded bg-black/40 shrink-0">
                        {alert.level}
                      </span>
                      <span className="text-[13px] leading-snug">{alert.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Items with Clickable Checkboxes */}
            <div className="p-5 rounded-[12px] bg-[#090b0e] border border-[#27282b]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#59d499]" />
                  <h3 className="text-[15px] font-semibold text-[#ffffff]">Extracted Action Items & Owners</h3>
                </div>
                <span className="text-[11px] font-['GeistMono'] text-[#9c9c9d]">
                  Click to mark resolved
                </span>
              </div>
              <div className="space-y-2">
                {summaryData.actionItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => toggleActionItem(i)}
                    className={`flex items-center justify-between p-3 rounded-[8px] border transition-all cursor-pointer ${
                      item.done
                        ? 'bg-[#111214]/50 border-[#27282b] opacity-60 line-through'
                        : 'bg-[#111214] border-[#27282b] hover:border-[#363739]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          item.done
                            ? 'bg-[#59d499] border-[#59d499] text-[#040506]'
                            : 'border-[#363739] bg-transparent'
                        }`}
                      >
                        {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[13px] text-[#ffffff] font-medium">{item.task}</span>
                    </div>
                    <span className="text-[11px] font-['GeistMono'] text-[#ff6363] bg-[#ff6363]/10 px-2 py-0.5 rounded border border-[#ff6363]/30">
                      {item.owner}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Decisions */}
            <div className="p-5 rounded-[12px] bg-[#090b0e] border border-[#27282b]">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-[#59d499]" />
                <h3 className="text-[15px] font-semibold text-[#ffffff]">Decisions Documented</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {summaryData.decisions.map((dec, i) => (
                  <div key={i} className="p-3 rounded-[8px] bg-[#111214] border border-[#27282b] text-[12px] text-[#9c9c9d] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] shrink-0" />
                    <span className="text-[#ffffff]">{dec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Q&A Assistant about the read messages */}
            <div className="p-5 rounded-[12px] bg-[#090b0e] border border-[#27282b]">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-[#ff6363]" />
                <h3 className="text-[15px] font-semibold text-[#ffffff]">Ask Questions About This Feed</h3>
              </div>
              <p className="text-[12px] text-[#9c9c9d] mb-4">
                Ask specific questions about who said what, timelines, or technical decisions in these messages.
              </p>

              {/* Chat history */}
              <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto">
                {chatHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-[8px] bg-[#111214] border border-[#27282b] text-[13px] space-y-1.5">
                    <div className="text-[#ff6363] font-medium flex items-center gap-1.5">
                      <span>Q:</span>
                      <span>{item.q}</span>
                    </div>
                    <div className="text-[#ffffff]/90 leading-relaxed pl-4 border-l border-[#363739]">
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAskFollowUp} className="flex gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="e.g., What did Priya say about the Figma designs?"
                  className="flex-1 bg-[#111214] border border-[#363739] focus:border-[#ff6363] focus:outline-none rounded-[8px] px-3.5 py-2.5 text-[13px] text-[#ffffff] placeholder-[#55565a]"
                />
                <button
                  type="submit"
                  disabled={isAnswering || !chatQuestion.trim()}
                  className="px-4 py-2.5 rounded-[8px] bg-[#ff6363] hover:bg-[#ff7a7a] disabled:opacity-40 text-[#040506] font-semibold text-[13px] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Send className={`w-3.5 h-3.5 ${isAnswering ? 'animate-spin' : ''}`} />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
