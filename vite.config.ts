import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

const COMPOSIO_API_KEY = 'ck__9DzbdkSNZy49BvHcVyA';
const COMPOSIO_ENDPOINT = 'https://connect.composio.dev/mcp';

async function callComposioMcpTool(name: string, args: Record<string, any>) {
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
        params: {
          name,
          arguments: args,
        },
      }),
    });

    const text = await res.text();
    const dataLine = text.split('\n').find((l) => l.startsWith('data: '));
    if (!dataLine) {
      return { ok: false, error: 'No data line returned from Composio MCP', raw: text };
    }

    const rpcRes = JSON.parse(dataLine.replace('data: ', ''));
    const rawText = rpcRes.result?.content?.[0]?.text;
    if (rawText) {
      return { ok: true, data: JSON.parse(rawText) };
    }
    return { ok: true, data: rpcRes.result };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Composio MCP request failed' };
  }
}

function composioBridgePlugin(): Plugin {
  return {
    name: 'vite-composio-bridge',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);

        if (!url.pathname.startsWith('/api/composio')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        // Endpoint: GET /api/composio/connections
        if (url.pathname === '/api/composio/connections' && req.method === 'GET') {
          try {
            const mcpRes = await callComposioMcpTool('COMPOSIO_MANAGE_CONNECTIONS', {
              toolkits: [
                { name: 'slack', action: 'list' },
                { name: 'microsoft_teams', action: 'list' },
                { name: 'notion', action: 'list' },
              ],
            });

            return res.end(
              JSON.stringify({
                success: true,
                raw: mcpRes.data,
                activeAccount: {
                  team: 'inmodel',
                  teamId: 'T0BBUNZSRL5',
                  user: 'shreeharshastark',
                  userId: 'U0BC0PNJBAN',
                  url: 'https://inmodel.slack.com/',
                  status: 'ACTIVE',
                },
              })
            );
          } catch (e: any) {
            return res.end(JSON.stringify({ success: false, error: e.message }));
          }
        }

        // Endpoint: GET /api/composio/channels
        if (url.pathname === '/api/composio/channels' && req.method === 'GET') {
          try {
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

            return res.end(JSON.stringify({ success: true, channels }));
          } catch (e: any) {
            return res.end(JSON.stringify({ success: false, error: e.message }));
          }
        }

        // Endpoint: GET /api/composio/messages?channel=C0BBUP1LEJH
        if (url.pathname === '/api/composio/messages' && req.method === 'GET') {
          const channelId = url.searchParams.get('channel') || 'C0BBUP1LEJH';
          try {
            const mcpRes = await callComposioMcpTool('COMPOSIO_MULTI_EXECUTE_TOOL', {
              tools: [
                {
                  tool_slug: 'SLACK_FETCH_CONVERSATION_HISTORY',
                  arguments: { channel: channelId, limit: 10 },
                },
              ],
            });

            const messages =
              mcpRes.data?.data?.results?.[0]?.response?.data?.messages || [];

            return res.end(JSON.stringify({ success: true, channelId, messages }));
          } catch (e: any) {
            return res.end(JSON.stringify({ success: false, error: e.message }));
          }
        }

        // Endpoint: POST /api/composio/send
        if (url.pathname === '/api/composio/send' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { channel = 'C0BBUP1LEJH', text } = JSON.parse(body || '{}');
              if (!text) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, error: 'Text required' }));
              }

              const mcpRes = await callComposioMcpTool('COMPOSIO_MULTI_EXECUTE_TOOL', {
                tools: [
                  {
                    tool_slug: 'SLACK_SEND_MESSAGE',
                    arguments: { channel, markdown_text: text },
                  },
                ],
              });

              return res.end(
                JSON.stringify({
                  success: true,
                  result: mcpRes.data?.data?.results?.[0]?.response?.data,
                })
              );
            } catch (e: any) {
              return res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), composioBridgePlugin()],
})
