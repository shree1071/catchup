import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';

interface ChannelDemo {
  id: string;
  name: string;
  app: 'teams' | 'slack' | 'notion';
  unreadCount: number;
  readingTimeMinutes: number;
  p0Alert: string;
  executiveSummary: string;
  messages: Array<{
    sender: string;
    role: string;
    time: string;
    text: string;
    isMention?: boolean;
    isAlert?: boolean;
  }>;
  actionItems: Array<{
    task: string;
    owner: string;
    due: string;
    done: boolean;
  }>;
  decisions: string[];
}

const CHANNELS: ChannelDemo[] = [
  {
    id: 'war-room',
    name: 'Microsoft Teams: #hackathon-war-room',
    app: 'teams',
    unreadCount: 38,
    readingTimeMinutes: 18,
    p0Alert: 'P0 Incident Resolved: Redis connection pool exhaustion in PR #182 caused 3.2s auth spike.',
    executiveSummary: 'Production auth latency normalized to 45ms following rollback of PR #182. Staging demo locked for 3:00 PM EST.',
    messages: [
      {
        sender: 'Alex',
        role: 'Backend Lead',
        time: '11:02 AM',
        text: 'Production DB CPU spike at 98%! Queries to /api/auth are timing out for European cluster users.',
        isAlert: true,
      },
      {
        sender: 'Sarah',
        role: 'Dev Lead',
        time: '11:04 AM',
        text: '@Alex kill unindexed analytics query immediately. @You please check connection pool limit in staging.',
        isMention: true,
      },
      {
        sender: 'DevOps-Bot',
        role: 'Monitoring',
        time: '11:06 AM',
        text: 'Alert: 142 error 500 responses logged in last 5 min on /auth/verify.',
        isAlert: true,
      },
      {
        sender: 'Alex',
        role: 'Backend Lead',
        time: '11:08 AM',
        text: 'Killed query. Replicas scaled up. Auth latency back down to 45ms.',
      },
      {
        sender: 'Sarah',
        role: 'Dev Lead',
        time: '11:12 AM',
        text: '@You need your urgent PR review on #402 before 4:00 PM today so we can tag v2.4.1 release.',
        isMention: true,
      },
      {
        sender: 'Sarah',
        role: 'Dev Lead',
        time: '11:18 AM',
        text: 'Decision: Deployment window locked for 4:30 PM. No new commits after 4:00 PM.',
      },
    ],
    actionItems: [
      { task: 'Review urgent PR #402 before 4:00 PM release tag', owner: '@You', due: '4:00 PM today', done: false },
      { task: 'Audit Redis pooling keep-alive timeouts across services', owner: '@alex_lead', due: 'Friday', done: false },
      { task: 'Implement automated CI keep-alive linting rule', owner: '@dev_sarah', due: 'Monday', done: true },
    ],
    decisions: [
      'PR #182 reverted and Redis pool limits increased to 50.',
      'Deployment window hard-locked for 4:30 PM today.',
    ],
  },
  {
    id: 'product-launch',
    name: 'Slack: #product-launch-2026',
    app: 'slack',
    unreadCount: 46,
    readingTimeMinutes: 22,
    p0Alert: 'P1 Deadline: Keynote deck & backup video must be seeded by 1:30 PM.',
    executiveSummary: 'Presentation finalized with Raycast dark theme. Offline-first backup demo video required before 2:00 PM.',
    messages: [
      {
        sender: 'Priya',
        role: 'Product Lead',
        time: '09:15 AM',
        text: 'Good morning! Demo day is today. Presentation slides must be finalized by 1:30 PM sharp.',
      },
      {
        sender: 'Marcus',
        role: 'Lead Designer',
        time: '09:20 AM',
        text: 'Keynote deck updated with official Raycast coral ribbons and high-contrast typography.',
      },
      {
        sender: 'Priya',
        role: 'Product Lead',
        time: '09:42 AM',
        text: '@You please verify the Groq LPU API rate limit tier and prepare a 60-second backup demo video.',
        isMention: true,
      },
      {
        sender: 'Sam',
        role: 'DevOps',
        time: '10:05 AM',
        text: 'Zero-retention client encryption validated. Zero telemetry leaves device in local mode.',
      },
    ],
    actionItems: [
      { task: 'Record 60-second offline backup demo video', owner: '@You', due: '2:00 PM today', done: false },
      { task: 'Verify Groq LPU rate tier for live judging session', owner: '@You', due: '1:00 PM today', done: true },
      { task: 'Room check in Hall B Slot 4 at 3:15 PM', owner: '@marcus_design', due: '3:15 PM', done: false },
    ],
    decisions: [
      'What Did I Miss? local-first privacy engine selected as core differentiator.',
      'Demo scheduled for Hall B, Slot 4 at 3:15 PM.',
    ],
  },
];

interface TriageComparisonSectionProps {
  onOpenCatchUpModal?: () => void;
  onOpenZapierModal?: () => void;
}

export const TriageComparisonSection: React.FC<TriageComparisonSectionProps> = ({
  onOpenCatchUpModal,
  onOpenZapierModal,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('war-room');
  const [itemsStatus, setItemsStatus] = useState<Record<string, boolean>>({});

  const activeChannel = CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0];

  const toggleTask = (taskName: string) => {
    setItemsStatus((prev) => ({
      ...prev,
      [taskName]: !prev[taskName],
    }));
  };

  return (
    <section id="triage-demo" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-[#1b1c1e]">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6363]/10 border border-[#ff6363]/30 mb-4 shadow-[0_0_20px_rgba(255,99,99,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-[#ff6363]" />
          <span className="font-['GeistMono'] text-[11px] font-medium tracking-[0.06em] uppercase text-[#ff6363]">
            INTERACTIVE LIVE DEMO • PROBLEM SOLVED
          </span>
        </div>

        <h2 className="font-['Inter'] font-semibold text-[32px] sm:text-[42px] text-[#ffffff] tracking-tight max-w-[800px] leading-[1.15]">
          From 120 Unread Messages to 10 Seconds of Clarity.
        </h2>

        <p className="mt-4 font-['Inter'] font-normal text-[15px] sm:text-[17px] text-[#9c9c9d] max-w-[680px] leading-[1.5]">
          See how CatchUp AI reads through chaotic war-room chatter, isolates emergencies, extracts @mentions, and presents an actionable executive briefing powered by Groq LPU.
        </p>

        {/* Channel Switcher Tabs */}
        <div className="flex items-center gap-2 mt-8 p-1.5 rounded-[10px] bg-[#0c0d10] border border-[#27282b]">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannelId(ch.id)}
              className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-2 ${
                selectedChannelId === ch.id
                  ? 'bg-[#1b1c1e] text-[#ffffff] shadow-sm border border-[#363739]'
                  : 'text-[#9c9c9d] hover:text-[#ffffff] hover:bg-[#141518]'
              }`}
            >
              <span>{ch.name}</span>
              <span className={`text-[10px] font-['GeistMono'] px-1.5 py-0.2 rounded ${
                selectedChannelId === ch.id
                  ? 'bg-[#ff6363]/20 text-[#ff6363]'
                  : 'bg-[#27282b] text-[#6a6b6c]'
              }`}>
                {ch.unreadCount} unread
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Split Comparison View: Left (Raw Noise) vs Right (AI Clarity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: THE UNREAD NOISE (5 Cols) */}
        <div className="lg:col-span-5 rounded-[16px] bg-[#07080a] border border-[#27282b] p-5 sm:p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c1e] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <h3 className="font-['Inter'] font-semibold text-[15px] text-[#ffffff]">
                  The Raw Unread Stream
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-['GeistMono'] text-[#ff6363] bg-[#ff6363]/10 px-2 py-0.5 rounded border border-[#ff6363]/20">
                <Clock className="w-3 h-3" />
                <span>~{activeChannel.readingTimeMinutes} min reading time</span>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {activeChannel.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-[10px] text-[13px] border transition-all ${
                    m.isAlert
                      ? 'bg-[#ff6363]/10 border-[#ff6363]/30 text-[#ffffff]'
                      : m.isMention
                      ? 'bg-[#f7b731]/10 border-[#f7b731]/30 text-[#ffffff]'
                      : 'bg-[#111214] border-[#1f2023] text-[#cccccc]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#ffffff]">{m.sender}</span>
                      <span className="text-[#6a6b6c]">({m.role})</span>
                    </div>
                    <span className="font-['GeistMono'] text-[#6a6b6c]">{m.time}</span>
                  </div>
                  <p className="leading-relaxed">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Noise Footer */}
          <div className="mt-4 pt-3 border-t border-[#1b1c1e] flex items-center justify-between text-[11px] font-['GeistMono'] text-[#6a6b6c]">
            <span>{activeChannel.unreadCount} unread messages in queue</span>
            <span className="text-[#ff6363]">High Cognitive Drain</span>
          </div>
        </div>

        {/* CENTER DIVIDER ICON / ARROW (Hidden on small, 2 Cols on lg) */}
        <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#111214] border border-[#ff6363]/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,99,99,0.3)]">
            <Zap className="w-5 h-5 text-[#ff6363] animate-pulse" />
          </div>
          <span className="font-['GeistMono'] text-[10px] text-[#ff6363] uppercase tracking-wider text-center">
            0.8s LPU
          </span>
          <ArrowRight className="w-4 h-4 text-[#9c9c9d]" />
        </div>

        {/* RIGHT COLUMN: CATCHUP AI EXECUTIVE CLARITY (6 Cols) */}
        <div className="lg:col-span-6 rounded-[16px] bg-[#07080a] border border-[#59d499]/30 p-5 sm:p-6 flex flex-col justify-between shadow-[0_8px_32px_rgba(89,212,153,0.08)]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c1e] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#59d499] animate-pulse" />
                <h3 className="font-['Inter'] font-semibold text-[15px] text-[#ffffff] flex items-center gap-2">
                  <span>CatchUp AI Synthesis</span>
                  <span className="text-[10px] font-['GeistMono'] text-[#59d499] bg-[#59d499]/15 px-2 py-0.5 rounded border border-[#59d499]/30">
                    Groq LPU (640ms)
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-['GeistMono'] text-[#59d499]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Data Retained</span>
              </div>
            </div>

            {/* 1-Line TL;DR Highlight */}
            <div className="p-3.5 rounded-[10px] bg-[#111214] border border-[#27282b] mb-4">
              <div className="text-[11px] font-['GeistMono'] text-[#9c9c9d] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#ff6363]" />
                <span>Executive TL;DR</span>
              </div>
              <p className="text-[14px] text-[#ffffff] font-medium leading-relaxed">
                {activeChannel.executiveSummary}
              </p>
            </div>

            {/* P0 Urgency Alert Card */}
            <div className="p-3 rounded-[10px] bg-[#ff6363]/10 border border-[#ff6363]/30 mb-4 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#ff6363] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-['GeistMono'] font-bold text-[#ff6363] uppercase tracking-wider block">
                  Critical Priority Alert
                </span>
                <span className="text-[13px] text-[#ffffff] leading-snug">
                  {activeChannel.p0Alert}
                </span>
              </div>
            </div>

            {/* Actionable Checklist */}
            <div className="mb-4">
              <span className="text-[11px] font-['GeistMono'] text-[#9c9c9d] uppercase tracking-wide block mb-2">
                Action Items & Assigned Owners
              </span>
              <div className="space-y-2">
                {activeChannel.actionItems.map((item, idx) => {
                  const isChecked = itemsStatus[item.task] !== undefined ? itemsStatus[item.task] : item.done;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTask(item.task)}
                      className={`flex items-center justify-between p-2.5 rounded-[8px] border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#111214]/60 border-[#27282b] opacity-60 line-through'
                          : 'bg-[#111214] border-[#27282b] hover:border-[#363739]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[#59d499] border-[#59d499]' : 'border-[#363739]'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 text-[#040506]" />}
                        </div>
                        <span className="text-[13px] text-[#ffffff] truncate">
                          {item.task}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-['GeistMono'] text-[#ff6363] bg-[#ff6363]/10 px-1.5 py-0.5 rounded border border-[#ff6363]/20">
                          {item.owner}
                        </span>
                        <span className="text-[10px] font-['GeistMono'] text-[#6a6b6c] hidden sm:inline">
                          {item.due}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons for Judges & Users */}
          <div className="pt-4 border-t border-[#1c1d20] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenZapierModal}
                className="px-3 py-1.5 rounded-[8px] bg-[#111214] hover:bg-[#1a1b1e] border border-[#363739] text-[#9c9c9d] hover:text-[#ffffff] text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5"
                title="Sync directly to Notion"
              >
                <span>Export to Notion</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={onOpenCatchUpModal}
              className="flex items-center gap-2 px-4 py-1.5 rounded-[8px] bg-[#ff6363] hover:bg-[#ff7a7a] text-[#040506] font-semibold text-[12px] transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,99,99,0.3)] active:scale-95"
            >
              <span>Launch Live CatchUp Modal (⌘U)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
