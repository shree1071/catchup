const COMPOSIO_API_KEY = process.env.VITE_COMPOSIO_API_KEY || process.env.COMPOSIO_API_KEY || 'ck__9DzbdkSNZy49BvHcVyA';
const COMPOSIO_ENDPOINT = 'https://connect.composio.dev/mcp';

async function callComposioMcpTool(name, args) {
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
  if (!dataLine) return { ok: false, error: 'No data line', raw: text };

  const rpcRes = JSON.parse(dataLine.replace('data: ', ''));
  const rawText = rpcRes.result?.content?.[0]?.text;
  if (rawText) {
    return { ok: true, data: JSON.parse(rawText) };
  }
  return { ok: true, data: rpcRes.result };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = searchParams.get('action');

  try {
    // Generate fresh non-expired OAuth / App connection link
    if (action === 'connect' || req.url.includes('/connect')) {
      const toolkit = searchParams.get('toolkit') || (req.body && req.body.toolkit) || 'slack';
      const slugMap = {
        teams: 'microsoft_teams',
        microsoft_teams: 'microsoft_teams',
        slack: 'slack',
        notion: 'notion',
        github: 'github',
        discord: 'discord',
        google: 'googlecalendar',
        google_workspace: 'googlecalendar',
        googlecalendar: 'googlecalendar',
      };
      const targetSlug = slugMap[toolkit] || toolkit;

      const mcpRes = await callComposioMcpTool('COMPOSIO_MANAGE_CONNECTIONS', {
        toolkits: [{ action: 'add', name: targetSlug }],
      });

      const redirectUrl =
        mcpRes.data?.data?.results?.[targetSlug]?.redirect_url ||
        mcpRes.data?.results?.[targetSlug]?.redirect_url ||
        `https://dashboard.composio.dev/~/org/connect/apps/${targetSlug}?source=mcp`;

      return res.status(200).json({
        success: true,
        toolkit: targetSlug,
        redirectUrl,
      });
    }

    if (action === 'channels' || req.url.includes('/channels')) {
      const mcpRes = await callComposioMcpTool('COMPOSIO_MULTI_EXECUTE_TOOL', {
        tools: [
          {
            tool_slug: 'SLACK_LIST_ALL_CHANNELS',
            arguments: { types: 'public_channel', limit: 20 },
          },
        ],
      });
      const channels =
        mcpRes.data?.data?.results?.[0]?.response?.data?.channels || [
          { id: 'C0BBUP1LEJH', name: 'all-inmodel', num_members: 2 },
          { id: 'C0BBYMV9U2J', name: 'inmodel-sales-deals', num_members: 1 },
          { id: 'C0BBGLSVB2T', name: 'new-channel', num_members: 2 },
          { id: 'C0BCSDPKM0Q', name: 'social', num_members: 2 },
        ];
      return res.status(200).json({ success: true, channels });
    }

    if (action === 'messages' || req.url.includes('/messages')) {
      const channelId = searchParams.get('channel') || 'C0BBUP1LEJH';
      const mcpRes = await callComposioMcpTool('COMPOSIO_MULTI_EXECUTE_TOOL', {
        tools: [
          {
            tool_slug: 'SLACK_FETCH_CONVERSATION_HISTORY',
            arguments: { channel: channelId, limit: 20 },
          },
        ],
      });
      const messages = mcpRes.data?.data?.results?.[0]?.response?.data?.messages || [];
      return res.status(200).json({ success: true, channelId, messages });
    }

    if (req.method === 'POST') {
      const { channel = 'C0BBUP1LEJH', text } = req.body || {};
      if (!text) {
        return res.status(400).json({ success: false, error: 'Text required' });
      }
      const mcpRes = await callComposioMcpTool('COMPOSIO_MULTI_EXECUTE_TOOL', {
        tools: [
          {
            tool_slug: 'SLACK_SEND_MESSAGE',
            arguments: { channel, markdown_text: text },
          },
        ],
      });
      return res.status(200).json({
        success: true,
        result: mcpRes.data?.data?.results?.[0]?.response?.data,
      });
    }

    return res.status(200).json({
      success: true,
      activeAccount: {
        team: 'inmodel',
        teamId: 'T0BBUNZSRL5',
        user: 'shreeharshastark',
        userId: 'U0BC0PNJBAN',
        url: 'https://inmodel.slack.com/',
        status: 'ACTIVE',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
