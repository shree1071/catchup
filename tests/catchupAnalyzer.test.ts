import { describe, it, expect } from 'vitest';
import { summarizeTeamsChatWithGroq } from '../src/services/groqService';

describe('CatchUp Teams Chat Analyzer (summarizeTeamsChatWithGroq)', () => {
  const sampleWarRoomChat = `
[10:14 AM] Alex (SRE): 🚨 Production Redis latency spiked to 450ms. Connection pool exhausted on node 4.
[10:16 AM] Sarah (DevLead): @Alex kill long-running queries now. @You please check the connection pool limit in staging.
[10:18 AM] DevOps-Bot: Alert: 142 error 500 responses in last 5m.
[10:20 AM] Alex: Killed the bad query. CPU back down to 34%.
[10:22 AM] Sarah: Decision: We will increase pool size to 50 and disable analytics endpoint during peak hours.
[10:24 AM] Sarah: @You need your PR review on #402 before 4:00 PM today so we can tag v2.4.
  `.trim();

  it('should analyze chat and extract urgency, action items, and missed mentions', async () => {
    // When called with no live key or offline, it deterministically runs local heuristic
    const summary = await summarizeTeamsChatWithGroq({
      chatContent: sampleWarRoomChat,
      channelName: 'Incident War Room',
      unreadCount: 6,
      apiKey: '',
    });

    expect(summary).toBeDefined();
    expect(summary.channelName).toBe('Incident War Room');
    expect(summary.unreadCount).toBe(6);

    // Urgency level should be identified
    expect(summary.urgencyLevel).toMatch(/P0 - Critical|P1 - High|P2 - Moderate/);
    expect(summary.urgencyReason).toBeTruthy();

    // Missed mentions of @You should be captured
    expect(summary.missedMentions.length).toBeGreaterThan(0);
    const userMention = summary.missedMentions.find((m) => /@you/i.test(m.message) || /you/i.test(m.message));
    expect(userMention).toBeDefined();

    // Decisions should be detected
    expect(summary.decisions.length).toBeGreaterThan(0);
    expect(summary.decisions.some((d) => d.toLowerCase().includes('pool'))).toBe(true);

    // Action items should be parsed
    expect(summary.actionItems.length).toBeGreaterThan(0);

    // Metrics should be present
    expect(summary.metrics).toBeDefined();
    expect(summary.metrics.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle peaceful conversations with moderate/low urgency', async () => {
    const casualChat = `
[02:00 PM] Jordan: Hey team, lunch was great!
[02:05 PM] Maya: Agreed! Don't forget our weekly sync tomorrow morning at 10 AM.
[02:08 PM] Leo: Sounds good, see everyone tomorrow.
    `.trim();

    const summary = await summarizeTeamsChatWithGroq({
      chatContent: casualChat,
      channelName: 'Random / Watercooler',
      unreadCount: 3,
      apiKey: '',
    });

    expect(summary.channelName).toBe('Random / Watercooler');
    expect(summary.urgencyLevel).toMatch(/P2 - Moderate|P3 - Low/);
  });
});
