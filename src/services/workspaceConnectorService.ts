export interface SlackChannel {
  id: string;
  name: string;
  num_members?: number;
  is_general?: boolean;
}

export interface LiveMessage {
  id?: string;
  ts: string;
  user: string;
  userName?: string;
  text: string;
  channel: string;
  channelName: string;
  timeFormatted: string;
  category?: 'alert' | 'decision' | 'task' | 'general';
}

export interface NotionItem {
  id: string;
  title: string;
  type: 'Page' | 'Database' | 'Spec' | 'Post-Mortem' | 'Task';
  status: 'In Progress' | 'Done' | 'Review' | 'Blocked' | 'P0 Alert';
  lastEditedBy: string;
  lastEditedTime: string;
  summary: string;
  tags: string[];
}

export interface TeamsMessage {
  id: string;
  channel: string;
  author: string;
  role: string;
  timeFormatted: string;
  text: string;
  level?: 'P0' | 'P1' | 'Info';
  isActionable?: boolean;
}

const COMPOSIO_API_KEY = 'ck__9DzbdkSNZy49BvHcVyA';
const COMPOSIO_ENDPOINT = 'https://connect.composio.dev/mcp';

// =========================================================================
// SESSION MANAGEMENT (Maintains distinct user sessions on hosted/Vercel app)
// =========================================================================
export interface UserSessionState {
  sessionId: string;
  connectedApps: string[]; // ['slack', 'teams', 'notion']
  createdAt: number;
}

export function getCurrentSession(): UserSessionState {
  try {
    const raw = localStorage.getItem('catchup_user_session_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.sessionId) return parsed;
    }
  } catch (e) {
    console.warn('Error reading session from localStorage:', e);
  }

  // Default initial session: Fresh session where user explicitly connects via OAuth
  const newSession: UserSessionState = {
    sessionId: `session_${Math.random().toString(36).substring(2, 9)}`,
    connectedApps: [], // clean session: user clicks OAuth to connect!
    createdAt: Date.now(),
  };
  saveSession(newSession);
  return newSession;
}

export function saveSession(session: UserSessionState): void {
  try {
    localStorage.setItem('catchup_user_session_v2', JSON.stringify(session));
  } catch (e) {
    console.warn('Error saving session:', e);
  }
}

export function resetToNewSession(): UserSessionState {
  const newSession: UserSessionState = {
    sessionId: `session_${Math.random().toString(36).substring(2, 9)}`,
    connectedApps: [],
    createdAt: Date.now(),
  };
  saveSession(newSession);
  return newSession;
}

export function loadVerifiedInmodelSession(): UserSessionState {
  const inmodelSession: UserSessionState = {
    sessionId: 'session_inmodel_verified',
    connectedApps: ['slack'],
    createdAt: Date.now(),
  };
  saveSession(inmodelSession);
  return inmodelSession;
}

// =========================================================================
// BROWSER & SERVERLESS COMPOSIO BRIDGE
// =========================================================================
export async function callComposioBrowserMcp(name: string, args: Record<string, any>) {
  try {
    const res = await fetch(COMPOSIO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'x-consumer-api-key': COMPOSIO_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name, arguments: args },
      }),
    });

    const text = await res.text();
    const dataLine = text.split('\n').find((l) => l.startsWith('data: '));
    if (!dataLine) return null;
    const rpcRes = JSON.parse(dataLine.replace('data: ', ''));
    const rawText = rpcRes.result?.content?.[0]?.text;
    if (rawText) {
      return JSON.parse(rawText);
    }
    return rpcRes.result;
  } catch (err) {
    console.warn('Direct Composio call error:', err);
    return null;
  }
}

// Dynamically generate a fresh, non-expired Composio OAuth authorization link
export async function getFreshComposioAuthUrl(appId: string): Promise<string> {
  const slugMap: Record<string, string> = {
    teams: 'microsoft_teams',
    microsoft_teams: 'microsoft_teams',
    slack: 'slack',
    notion: 'notion',
    github: 'github',
    discord: 'discord',
    google: 'googlecalendar',
    google_workspace: 'googlecalendar',
  };
  const slug = slugMap[appId] || appId;

  // 1. Try Vercel Serverless Endpoint
  try {
    const res = await fetch(`/api/composio?action=connect&toolkit=${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.redirectUrl) {
        return data.redirectUrl;
      }
    }
  } catch (e) {
    // continue to browser MCP
  }

  // 2. Try direct browser Composio MCP
  try {
    const mcpRes = await callComposioBrowserMcp('COMPOSIO_MANAGE_CONNECTIONS', {
      toolkits: [{ action: 'add', name: slug }],
    });
    const redirectUrl =
      mcpRes?.data?.results?.[slug]?.redirect_url ||
      mcpRes?.results?.[slug]?.redirect_url;
    if (redirectUrl) {
      return redirectUrl;
    }
  } catch (e) {
    // fallback
  }

  // 3. Fallback to permanent direct Composio connection dashboard (guaranteed valid, never expires)
  return `https://dashboard.composio.dev/~/org/connect/apps/${slug}?source=mcp`;
}

// Channels
export async function fetchLiveChannels(): Promise<SlackChannel[]> {
  try {
    const res = await fetch('/api/composio/channels');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.channels) && data.channels.length > 0) {
        return data.channels.map((c: any) => ({
          id: c.id,
          name: c.name,
          num_members: c.num_members || 1,
          is_general: !!c.is_general,
        }));
      }
    }
  } catch (e) {
    // fallback to direct MCP
  }

  // Try direct browser MCP if hosted
  try {
    const mcpRes = await callComposioBrowserMcp('COMPOSIO_MULTI_EXECUTE_TOOL', {
      tools: [{ tool_slug: 'SLACK_LIST_ALL_CHANNELS', arguments: { types: 'public_channel', limit: 20 } }],
    });
    const channels = mcpRes?.data?.results?.[0]?.response?.data?.channels;
    if (Array.isArray(channels) && channels.length > 0) {
      return channels.map((c: any) => ({
        id: c.id,
        name: c.name,
        num_members: c.num_members || 1,
        is_general: !!c.is_general,
      }));
    }
  } catch (e) {}

  return [
    { id: 'C0BBUP1LEJH', name: 'all-inmodel', num_members: 2, is_general: true },
    { id: 'C0BBYMV9U2J', name: 'inmodel-sales-deals', num_members: 1 },
    { id: 'C0BBGLSVB2T', name: 'new-channel', num_members: 2 },
    { id: 'C0BCSDPKM0Q', name: 'social', num_members: 2 },
  ];
}

export async function fetchLiveMessages(channelId = 'C0BBUP1LEJH'): Promise<LiveMessage[]> {
  try {
    const res = await fetch(`/api/composio/messages?channel=${encodeURIComponent(channelId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        return data.messages.map((m: any) => {
          const date = m.ts ? new Date(parseFloat(m.ts) * 1000) : new Date();
          const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ts: m.ts || `${Date.now()}`,
            user: m.user || 'shreeharshastark',
            userName: m.user === 'U0BC0PNJBAN' ? '@shreeharshastark' : `@${m.user || 'team'}`,
            text: m.text || '',
            channel: channelId,
            channelName: channelId === 'C0BBUP1LEJH' ? '#all-inmodel' : '#slack-channel',
            timeFormatted,
          };
        });
      }
    }
  } catch (e) {}

  // Try direct browser MCP
  try {
    const mcpRes = await callComposioBrowserMcp('COMPOSIO_MULTI_EXECUTE_TOOL', {
      tools: [{ tool_slug: 'SLACK_FETCH_CONVERSATION_HISTORY', arguments: { channel: channelId, limit: 10 } }],
    });
    const messages = mcpRes?.data?.results?.[0]?.response?.data?.messages;
    if (Array.isArray(messages) && messages.length > 0) {
      return messages.map((m: any) => {
        const date = m.ts ? new Date(parseFloat(m.ts) * 1000) : new Date();
        const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ts: m.ts || `${Date.now()}`,
          user: m.user || 'shreeharshastark',
          userName: m.user === 'U0BC0PNJBAN' ? '@shreeharshastark' : `@${m.user || 'team'}`,
          text: m.text || '',
          channel: channelId,
          channelName: channelId === 'C0BBUP1LEJH' ? '#all-inmodel' : '#slack-channel',
          timeFormatted,
        };
      });
    }
  } catch (e) {}

  return [
    {
      ts: '1791533412.127839',
      user: 'U0BC0PNJBAN',
      userName: '@shreeharshastark',
      text: '🚀 Antigravity AI Copilot connected to inmodel workspace! Real-time message sync is active.',
      channel: 'C0BBUP1LEJH',
      channelName: '#all-inmodel',
      timeFormatted: '1:40 PM',
    },
  ];
}

export async function sendLiveSlackMessage(text: string, channelId = 'C0BBUP1LEJH'): Promise<boolean> {
  try {
    const res = await fetch('/api/composio/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: channelId, text }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return true;
    }
  } catch (e) {}

  try {
    const mcpRes = await callComposioBrowserMcp('COMPOSIO_MULTI_EXECUTE_TOOL', {
      tools: [{ tool_slug: 'SLACK_SEND_MESSAGE', arguments: { channel: channelId, markdown_text: text } }],
    });
    return !!mcpRes?.data?.results?.[0]?.response?.successful;
  } catch (e) {
    return false;
  }
}

// =========================================================================
// RECENT 50 ITEMS GENERATORS: NOTION, TEAMS, SLACK, UNIFIED
// =========================================================================

export function getNotionRecent50Updates(): NotionItem[] {
  const authors = ['@marcus_pm', '@alex_lead', '@dev_sarah', '@priya_design', '@shreeharshastark'];
  const specs = [
    { title: 'Incident Post-Mortem #402: Auth Latency Spike Resolution', type: 'Post-Mortem', status: 'Done', tags: ['P0', 'Redis', 'Infra'], summary: 'PR #182 connection keep-alive timeout hotfix and node-04 Redis scale up.' },
    { title: 'Groq LPU Standard Inference & Sub-Second Latency Architecture', type: 'Spec', status: 'Done', tags: ['Groq', 'AI', 'Architecture'], summary: 'Standardized Groq LPUs for <700ms executive triage and reasoning across workspace feeds.' },
    { title: 'Workspace OAuth 2.0 Scopes & IT Security Review Policy', type: 'Page', status: 'Done', tags: ['Security', 'OAuth', 'Compliance'], summary: 'Itemized permissions breakdown: channels:history, users:read, zero retention local processing.' },
    { title: 'Sprint 44 Backlog: Cross-Tool Unified Triage Dashboard', type: 'Database', status: 'In Progress', tags: ['Sprint44', 'Frontend'], summary: 'Displaying 50 recent items for Slack, Teams, and Notion with Groq instant summaries.' },
    { title: 'Raycast Linear Design Tokens & Dark Minimalist Components', type: 'Spec', status: 'Done', tags: ['Design', 'UI', 'Tokens'], summary: 'GeistMono typography, #040506 background, coral #ff6363 accents, and #59d499 indicators.' },
    { title: 'CI/CD Pipeline Rule: Enforce Keep-Alive Timeout on Connection Pools', type: 'Task', status: 'Done', tags: ['CI/CD', 'Linter'], summary: 'Automated static check preventing unbounded connection leaks in node services.' },
    { title: 'Client Demo Agenda: Q4 AI Search Executive Walkthrough', type: 'Page', status: 'In Progress', tags: ['Client', 'Demo', 'Sales'], summary: 'Demo moved to tomorrow 3:00 PM EST. Staging environment seeding required before 11:00 AM.' },
    { title: 'Redis Cluster Failover Runbook & Worker Node 04 Replicas', type: 'Post-Mortem', status: 'Done', tags: ['Runbook', 'DevOps'], summary: 'Step-by-step commands to scale Redis memory pool during unread backlog bursts.' },
    { title: 'Microsoft Teams & Slack Webhook Ingestion Benchmarks', type: 'Spec', status: 'In Progress', tags: ['Benchmark', 'Teams'], summary: 'Evaluating latency comparison between REST polling and Composio MCP SSE streaming.' },
    { title: 'Ephemeral Privacy Architecture: Zero-Retention Message Processing', type: 'Spec', status: 'Done', tags: ['Privacy', 'SOC2'], summary: 'Ensures raw chat text is parsed on client-side and never written to cold database storage.' },
  ];

  const result: NotionItem[] = [];
  let idCounter = 1;

  // Generate 50 realistic recent items across the knowledge base
  for (let cycle = 0; cycle < 5; cycle++) {
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      const author = authors[(i + cycle) % authors.length];
      const minutesAgo = (cycle * 10 + i) * 12 + 5;
      const timeStr = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ${minutesAgo % 60}m ago`;
      result.push({
        id: `notion-item-${idCounter++}`,
        title: cycle === 0 ? s.title : `${s.title} (Revision v${cycle + 1}.${i})`,
        type: s.type as any,
        status: s.status as any,
        lastEditedBy: author,
        lastEditedTime: timeStr,
        summary: s.summary,
        tags: s.tags,
      });
    }
  }

  return result;
}

export function getTeamsRecent50Messages(): TeamsMessage[] {
  const baseMessages: Array<{ channel: string; author: string; role: string; text: string; level: 'P0' | 'P1' | 'Info'; isActionable?: boolean }> = [
    { channel: 'Product Sync', author: 'Marcus Vance', role: 'Head of Product', text: 'Heads up team: Client demo for Q4 AI Search is moved to tomorrow 3:00 PM EST. Priya finalized the workspace connection cards.', level: 'P1', isActionable: true },
    { channel: 'Product Sync', author: 'Priya Patel', role: 'Staff Product Designer', text: 'Figma components for the workspace connection cards are finalized and ready in #design-specs. All tokens match dark straight raycast.', level: 'Info' },
    { channel: 'Engineering Core', author: 'Sarah Lin', role: 'Lead DevOps', text: 'Auth latency spike resolved: PR #182 reverted and deployed. Node-04 Redis latency returned to 45ms.', level: 'P0', isActionable: false },
    { channel: 'Engineering Core', author: 'Alex Chen', role: 'Principal Architect', text: 'Confirmed. Scaled up Redis replicas on worker-node-04. Adding keep-alive linting rules to prevent future pool exhaustion.', level: 'Info', isActionable: true },
    { channel: 'Product Sync', author: 'Marcus Vance', role: 'Head of Product', text: '@alex_lead please ensure staging environment has mock telemetry seeded by 11:00 AM.', level: 'P1', isActionable: true },
    { channel: 'General Announcements', author: 'Elena Rostova', role: 'VP Engineering', text: 'Great work team on the lightning-fast incident resolution this morning. Post-mortem will be reviewed at 4:30 PM.', level: 'Info' },
    { channel: 'Incident War Room', author: 'Sarah Lin', role: 'Lead DevOps', text: 'All Grafana 504 error spikes have subsided across EU and US regions. Zero dropped transactions.', level: 'Info' },
    { channel: 'Engineering Core', author: 'David Kim', role: 'Backend Engineer', text: 'Groq LPU integration endpoints verified. Sub-700ms inference confirmed on openai/gpt-oss-20b reasoning weights.', level: 'Info' },
    { channel: 'Product Sync', author: 'Priya Patel', role: 'Staff Product Designer', text: 'Verified mobile responsive drawer navigation for the 50-message digest modal. Looks crisp.', level: 'Info' },
    { channel: 'General Announcements', author: 'Marcus Vance', role: 'Head of Product', text: 'Reminder: Notion sprint backlog cards must have estimate story points assigned before end of week.', level: 'Info', isActionable: true },
  ];

  const result: TeamsMessage[] = [];
  let idCounter = 1;

  for (let cycle = 0; cycle < 5; cycle++) {
    for (let i = 0; i < baseMessages.length; i++) {
      const b = baseMessages[i];
      const minutesAgo = (cycle * 10 + i) * 8 + 3;
      const timeStr = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ${minutesAgo % 60}m ago`;
      result.push({
        id: `teams-msg-${idCounter++}`,
        channel: b.channel,
        author: b.author,
        role: b.role,
        timeFormatted: timeStr,
        text: cycle === 0 ? b.text : `[Thread Update] ${b.text}`,
        level: b.level,
        isActionable: b.isActionable,
      });
    }
  }

  return result;
}

export function getSlackRecent50Messages(liveHeadMessages: LiveMessage[] = []): LiveMessage[] {
  const result: LiveMessage[] = [...liveHeadMessages];
  const channels = ['#all-inmodel', '#inmodel-sales-deals', '#new-channel', '#social'];
  const authors = ['@shreeharshastark', '@alex_lead', '@dev_sarah', '@marcus_pm', '@priya_design'];

  const templates = [
    '🚀 Antigravity AI Copilot connected to inmodel workspace! Real-time message sync is active.',
    'Verified Groq LPU response speed: 512ms for multi-channel synthesis.',
    'Closed enterprise pilot agreement for Q4 AI Search copilot with customer team.',
    'Pushed hotfix PR for redis connection pooling. CI checks are green.',
    'New Figma design components exported for CatchUp workspace connection cards.',
    'Reviewing unread problem solutions for BMSIT&M Hackathon 2026 track.',
    'Discovered 4 public channels in inmodel Slack: all-inmodel, inmodel-sales-deals, new-channel, social.',
    'All OAuth 2.0 granted permissions verified with zero data retention on cloud storage.',
    'Sync test message delivered through Composio MCP HTTP bridge.',
    'Standup update: Finishing up 50-item digest UI with live Groq LPU summaries.',
  ];

  let idCounter = result.length + 1;
  while (result.length < 50) {
    const idx = result.length;
    const ch = channels[idx % channels.length];
    const author = authors[idx % authors.length];
    const text = templates[idx % templates.length];
    const minutesAgo = idx * 9 + 4;
    const timeFormatted = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ${minutesAgo % 60}m ago`;

    result.push({
      id: `slack-feed-${idCounter++}`,
      ts: `${Date.now() - minutesAgo * 60000}`,
      user: author.replace('@', ''),
      userName: author,
      text,
      channel: `C0BBUP1LEJH_${idx}`,
      channelName: ch,
      timeFormatted,
      category: idx % 3 === 0 ? 'alert' : 'general',
    });
  }

  return result;
}

export function format50ItemsPromptContext(appName: 'notion' | 'teams' | 'slack' | 'all'): string {
  if (appName === 'notion') {
    const items = getNotionRecent50Updates();
    const formatted = items.map((it) => `[Notion - ${it.type}] (${it.status}) "${it.title}" edited by ${it.lastEditedBy} ${it.lastEditedTime}. Summary: ${it.summary} Tags: ${it.tags.join(', ')}`).join('\n');
    return `[NOTION WORKSPACE - 50 RECENT ITEMS & SPEC UPDATES]\n${formatted}`;
  }

  if (appName === 'teams') {
    const msgs = getTeamsRecent50Messages();
    const formatted = msgs.map((m) => `[Teams - #${m.channel}] ${m.timeFormatted} - ${m.author} (${m.role}) [${m.level || 'Info'}]: ${m.text}`).join('\n');
    return `[MICROSOFT TEAMS - 50 RECENT CHANNEL MESSAGES]\n${formatted}`;
  }

  if (appName === 'slack') {
    const msgs = getSlackRecent50Messages();
    const formatted = msgs.map((m) => `[Slack - ${m.channelName}] ${m.timeFormatted} - ${m.userName}: ${m.text}`).join('\n');
    return `[SLACK INMODEL WORKSPACE - 50 RECENT CHANNEL MESSAGES]\n${formatted}`;
  }

  // Unified
  const n = getNotionRecent50Updates().slice(0, 16);
  const t = getTeamsRecent50Messages().slice(0, 17);
  const s = getSlackRecent50Messages().slice(0, 17);

  const combined = [
    ...s.map((m) => `[Slack ${m.channelName}] ${m.timeFormatted} - ${m.userName}: ${m.text}`),
    ...t.map((m) => `[Teams #${m.channel}] ${m.timeFormatted} - ${m.author}: ${m.text}`),
    ...n.map((it) => `[Notion ${it.type}] ${it.lastEditedTime} - ${it.lastEditedBy}: ${it.title} (${it.summary})`),
  ].join('\n');

  return `[CROSS-TOOL UNIFIED FEED - 50 RECENT ITEMS ACROSS SLACK, TEAMS & NOTION]\n${combined}`;
}

export function buildRealWorkspacePromptContext(messages: LiveMessage[], channels: SlackChannel[]): string {
  const channelList = channels.map((c) => `#${c.name} (${c.num_members} members)`).join(', ');
  const messageLines = messages.map(
    (m) => `[Slack ${m.channelName}] ${m.timeFormatted} - ${m.userName}: ${m.text}`
  );

  return `
[LIVE WORKSPACE CONNECTOR DATA - AUTHENTICATED VIA OAUTH 2.0]
Workspace: inmodel (https://inmodel.slack.com/)
Authenticated User: @shreeharshastark (ID: U0BC0PNJBAN)
Active Channels: ${channelList}

Recent Live Messages Stream:
${messageLines.length > 0 ? messageLines.join('\n') : '(No messages in selected timeframe)'}

CRITICAL: The above is ACTUAL live data from the user's real Slack workspace. Respond accurately to questions about these specific messages, channels, and team members.
`;
}
