import { describe, it, expect } from 'vitest';
import { ZAPIER_AVAILABLE_ACTIONS, executeZapierMcpAction } from '../src/services/zapierMcpService';

describe('Zapier MCP Service & Tool Catalog (zapierMcpService.ts)', () => {
  it('should register available workspace actions', () => {
    expect(ZAPIER_AVAILABLE_ACTIONS.length).toBeGreaterThanOrEqual(4);

    const teamsAction = ZAPIER_AVAILABLE_ACTIONS.find((a) => a.id === 'teams_post_channel_message');
    expect(teamsAction).toBeDefined();
    expect(teamsAction?.app).toBe('Microsoft Teams');

    const notionAction = ZAPIER_AVAILABLE_ACTIONS.find((a) => a.id === 'notion_create_database_item');
    expect(notionAction).toBeDefined();
    expect(notionAction?.app).toBe('Notion');
  });

  it('should validate required parameters for catalog actions', () => {
    ZAPIER_AVAILABLE_ACTIONS.forEach((action) => {
      expect(action.id).toBeTruthy();
      expect(action.name).toBeTruthy();
      expect(action.parameters).toBeInstanceOf(Array);
      expect(action.description).toBeTruthy();
    });
  });

  it('should execute simulated Teams action successfully', async () => {
    const result = await executeZapierMcpAction({
      actionId: 'teams_post_channel_message',
      params: { channel: '#war-room', content: 'Incident resolved.' },
    });

    expect(result.success).toBe(true);
    expect(result.actionId).toBe('teams_post_channel_message');
    expect(result.app).toBe('Microsoft Teams');
    expect(result.output).toBeDefined();
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should throw an error when executing an uncataloged action', async () => {
    await expect(
      executeZapierMcpAction({
        actionId: 'non_existent_action_xyz',
        params: {},
      })
    ).rejects.toThrow(/not found in catalog/);
  });
});
