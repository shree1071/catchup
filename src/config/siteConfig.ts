export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Commands' | 'AI Tools' | 'Extensions' | 'Navigation';
  icon: string;
  shortcut?: string;
  actionText?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  metric?: string;
  metricLabel?: string;
}

export interface ExtensionTile {
  id: string;
  name: string;
  category: string;
  icon: string;
  author: string;
  installs: string;
}

export interface SiteConfig {
  hackathonName: string;
  projectName: string;
  tagline: string;
  subheadline: string;
  version: string;
  platform: string;
  installCommand: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  heroBadgeText: string;
  features: FeatureItem[];
  extensions: ExtensionTile[];
  commands: CommandItem[];
}

export const defaultSiteConfig: SiteConfig = {
  hackathonName: "BMSIT&M HACKATHON 2026",
  projectName: "CatchUp",
  tagline: "The Unread Problem — \"What Did I Miss?\"",
  subheadline: "A lightning-fast AI micro-app that prioritizes overwhelming chat conversations, extracts decisions & action items, surfaces missed @mentions, and keeps data 100% private with local-first processing.",
  version: "v2.6.0-local",
  platform: "Local-First Edge • Groq LPU",
  installCommand: "npx catchup-ai --channel teams-war-room",
  primaryCtaText: "Catch Up on Chats (⌘U)",
  secondaryCtaText: "Explore Architecture",
  heroBadgeText: "BMSIT&M HACKATHON 2026 • THE UNREAD PROBLEM",

  features: [
    {
      id: "unread-summarization",
      title: "Summarize Long & Unread Conversations",
      description: "Transforms 50+ message walls into 3 executive bullet points in <1.2s powered by Groq LPU (openai/gpt-oss-20b), saving 45 minutes of manual scrolling.",
      icon: "MessageSquare",
      badge: "Core Engine",
      metric: "<1.2s",
      metricLabel: "Groq LPU synthesis",
    },
    {
      id: "decisions-action-items",
      title: "Decisions & Action Items Extraction",
      description: "Automatically isolates team consensus, architectural approvals, and generates interactive checklists with assigned owners and priority tags.",
      icon: "Check",
      badge: "Intelligence",
      metric: "100%",
      metricLabel: "actionable triage",
    },
    {
      id: "urgency-matrix",
      title: "Urgency & Relevance Prioritization",
      description: "Multi-tier priority classification (P0 Critical outages, P1 High deadlines, P2 Moderate changes, P3 Low banter) so you resolve emergencies first.",
      icon: "AlertTriangle",
      badge: "Triage Matrix",
      metric: "P0 to P3",
      metricLabel: "incident classification",
    },
    {
      id: "mentions-deadlines",
      title: "Missed @Mentions & Deadline Radar",
      description: "Highlights direct tags addressed to @You and flags strict countdowns (e.g. 'PR review before 4:00 PM') so critical deliverables never slip.",
      icon: "Clock",
      badge: "Radar",
      metric: "Zero Missed",
      metricLabel: "mentions & due dates",
    },
    {
      id: "local-first-edge",
      title: "Local-First Edge Processing",
      description: "Zero cloud retention. On-device deterministic heuristic fallback ensures your private enterprise chat logs and credentials never leave your machine.",
      icon: "ShieldCheck",
      badge: "Privacy First",
      metric: "0 Bytes",
      metricLabel: "cloud data leaked",
    },
    {
      id: "sync-integrations",
      title: "1-Click Sync to Notion & Teams",
      description: "Push prioritized action items directly into your Notion workspace database or broadcast the AI digest back to Microsoft Teams via Zapier MCP.",
      icon: "Zap",
      badge: "Integrations",
      metric: "1-Click",
      metricLabel: "Zapier MCP bridge",
    },
  ],

  extensions: [
    {
      id: "ext-teams-catchup",
      name: "Microsoft Teams: Live Unread Channels",
      category: "Chat Feeds",
      icon: "MessageSquare",
      author: "Microsoft Teams x Groq LPU",
      installs: "188.5k",
    },
    {
      id: "ext-zapier-mcp",
      name: "Zapier MCP: Notion & Teams Bridge",
      category: "Workflow Integrations",
      icon: "Zap",
      author: "Zapier",
      installs: "142.8k",
    },
    {
      id: "ext-groq-lpu",
      name: "Groq LPU Fast Inference (gpt-oss-20b)",
      category: "AI Engine",
      icon: "Sparkles",
      author: "Groq Inc.",
      installs: "96.4k",
    },
    {
      id: "ext-local-edge",
      name: "Local-First Zero-Retention Engine",
      category: "Privacy & Edge",
      icon: "ShieldCheck",
      author: "Local ONNX / Heuristic",
      installs: "64.2k",
    },
    {
      id: "ext-slack-discord",
      name: "Slack & Discord Channel Parser",
      category: "Data Ingestion",
      icon: "Layers",
      author: "Community",
      installs: "41.8k",
    },
    {
      id: "ext-notion-database",
      name: "Notion Action Items Database",
      category: "Productivity & Docs",
      icon: "FileText",
      author: "Notion Lab",
      installs: "87.3k",
    },
  ],

  commands: [
    {
      id: "cmd-teams-catchup",
      title: "Teams CatchUp: #hackathon-war-room (38 unread)",
      subtitle: "P0 Outage Triage: CPU spike, auth timeouts & pending PR review",
      category: "AI Tools",
      icon: "AlertTriangle",
      shortcut: "⌘U",
      actionText: "Catch Up",
    },
    {
      id: "cmd-teams-product",
      title: "Teams CatchUp: #product-launch-2026 (64 unread)",
      subtitle: "Launch Prep: Slide deck review, 1:30 PM lock & demo schedule",
      category: "AI Tools",
      icon: "Zap",
      shortcut: "⌘P",
      actionText: "Catch Up",
    },
    {
      id: "cmd-teams-mentions",
      title: "Missed @Mentions Radar (@You)",
      subtitle: "Sarah requested urgent PR review on #402 before 4:00 PM today",
      category: "AI Tools",
      icon: "AtSign",
      shortcut: "⌘M",
      actionText: "View Tags",
    },
    {
      id: "cmd-toggle-privacy",
      title: "Toggle Local-First Edge Privacy Mode",
      subtitle: "Ensure conversations and summaries never leave device (Zero Retention)",
      category: "Commands",
      icon: "ShieldCheck",
      shortcut: "⌥L",
      actionText: "Local Edge",
    },
    {
      id: "cmd-notion-sync",
      title: "Notion: Sync Action Items to Workspace",
      subtitle: "Export verified checklist and decisions to Notion via Zapier MCP",
      category: "Commands",
      icon: "FileText",
      shortcut: "⌥N",
      actionText: "Sync Notion",
    },
    {
      id: "cmd-teams-message",
      title: "Microsoft Teams: Post AI Digest to Channel",
      subtitle: "Broadcast executive summary and action items back to #hackathon-war-room",
      category: "Commands",
      icon: "MessageSquare",
      shortcut: "⌘T",
      actionText: "Post Teams",
    },
    {
      id: "cmd-groq-chat",
      title: "Ask AI Copilot: Unread Context Q&A",
      subtitle: "Query chat history with Groq LPU hardware acceleration",
      category: "AI Tools",
      icon: "Sparkles",
      shortcut: "⌘J",
      actionText: "Copilot",
    },
    {
      id: "cmd-zapier-mcp",
      title: "Zapier MCP: App Integration Hub",
      subtitle: "Manage connections to Microsoft Teams, Notion, and Slack",
      category: "AI Tools",
      icon: "Zap",
      shortcut: "⌘Z",
      actionText: "Open Hub",
    },
    {
      id: "cmd-new-agent",
      title: "Spawn Problem Statement Agent",
      subtitle: "Initialize dynamic worker configured for hackathon prompt",
      category: "AI Tools",
      icon: "Bot",
      shortcut: "⌘N",
      actionText: "Spawn Agent",
    },
    {
      id: "cmd-search-knowledge",
      title: "Query Hybrid Knowledge Base",
      subtitle: "Semantic vector search with BM25 re-ranking",
      category: "AI Tools",
      icon: "Search",
      shortcut: "⌘F",
      actionText: "Search",
    },
    {
      id: "cmd-eval",
      title: "Run Hackathon Benchmark Suite",
      subtitle: "Execute automated verification & accuracy scoring tests",
      category: "Commands",
      icon: "Play",
      shortcut: "⌘R",
      actionText: "Run Suite",
    },
    {
      id: "cmd-deploy",
      title: "Deploy Instant Demo Endpoint",
      subtitle: "Ship edge deployment to public URL for hackathon judges",
      category: "Commands",
      icon: "UploadCloud",
      shortcut: "⌘D",
      actionText: "Deploy",
    },
    {
      id: "cmd-api-keys",
      title: "Manage API Keys & Environment",
      subtitle: "Configure OpenAI, Anthropic, Gemini, or local Ollama endpoints",
      category: "Navigation",
      icon: "Key",
      shortcut: "⌘,",
      actionText: "Configure",
    },
    {
      id: "cmd-docs",
      title: "Generate Hackathon Submission PDF",
      subtitle: "Compile project architecture, problem solution & demo links",
      category: "Commands",
      icon: "FileText",
      shortcut: "⌘P",
      actionText: "Export",
    },
  ],
};
