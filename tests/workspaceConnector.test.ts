import { describe, it, expect } from 'vitest';
import {
  buildRealWorkspacePromptContext,
  format50ItemsPromptContext,
  getNotionRecent50Updates,
  getTeamsRecent50Messages,
  getSlackRecent50Messages,
  type SlackChannel,
  type LiveMessage,
} from '../src/services/workspaceConnectorService';

describe('Workspace Connector Context & Format (workspaceConnectorService.ts)', () => {
  const mockChannels: SlackChannel[] = [
    { id: 'C0BBUP1LEJH', name: 'all-inmodel', is_channel: true, num_members: 2, topic: 'General' },
    { id: 'C0BBWXYZ123', name: 'inmodel-sales-deals', is_channel: true, num_members: 2, topic: 'Deals' },
    { id: 'C0BBNEW456', name: 'new-channel', is_channel: true, num_members: 2, topic: 'New projects' },
    { id: 'C0BBSOC789', name: 'social', is_channel: true, num_members: 2, topic: 'Watercooler' },
  ];

  const mockMessages: LiveMessage[] = [
    {
      ts: '1791533412.127839',
      user: 'U0BC0PNJBAN',
      userName: '@shreeharshastark',
      text: 'Connected to inmodel workspace!',
      channel: 'C0BBUP1LEJH',
      channelName: '#all-inmodel',
      timeFormatted: '1:40 PM',
    },
  ];

  it('builds real workspace prompt context with accurate channels and members', () => {
    const context = buildRealWorkspacePromptContext(mockMessages, mockChannels);
    expect(context).toContain('inmodel');
    expect(context).toContain('#all-inmodel (2 members)');
    expect(context).toContain('#inmodel-sales-deals (2 members)');
    expect(context).toContain('#new-channel (2 members)');
    expect(context).toContain('#social (2 members)');
    expect(context).toContain('[Slack #all-inmodel] 1:40 PM - @shreeharshastark');
  });

  it('formats 50 recent items for notion, teams, and slack without errors', () => {
    const notionContext = format50ItemsPromptContext('notion');
    expect(notionContext).toContain('[NOTION WORKSPACE');
    expect(getNotionRecent50Updates().length).toBe(50);

    const teamsContext = format50ItemsPromptContext('teams');
    expect(teamsContext).toContain('[MICROSOFT TEAMS');
    expect(getTeamsRecent50Messages().length).toBe(50);

    const slackContext = format50ItemsPromptContext('slack');
    expect(slackContext).toContain('[SLACK INMODEL WORKSPACE');
    expect(getSlackRecent50Messages().length).toBe(50);
  });
});
