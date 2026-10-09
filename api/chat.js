/**
 * Serverless Chat Completion API — Backend Inference Layer
 * Relays Groq LPU inference securely without exposing API keys to browser clients.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Lightweight rate limiting: 30 requests per minute per IP for LLM inference
const chatRateLimitMap = new Map();
function checkChatRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 30;
  const record = chatRateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    chatRateLimitMap.set(ip, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }

  record.count++;
  chatRateLimitMap.set(ip, record);
  return { allowed: true, remaining: maxRequests - record.count };
}

export default async function handler(req, res) {
  // Origin-validated CORS
  const origin = req.headers.origin || '';
  const isAllowedOrigin =
    !origin ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('.vercel.app');

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? (origin || '*') : 'null');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // Rate Limiting
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  const rateLimit = checkChatRateLimit(clientIp);
  res.setHeader('X-RateLimit-Limit', '30');
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfter));
    return res.status(429).json({ success: false, error: 'Inference rate limit exceeded. Please wait a moment.' });
  }

  // Body size validation (max 64 KB for chat context)
  if (req.headers['content-length'] && parseInt(req.headers['content-length'], 10) > 65536) {
    return res.status(413).json({ success: false, error: 'Chat payload exceeds maximum size limit (64 KB).' });
  }

  const { messages, model = 'openai/gpt-oss-20b', systemPrompt, apiKeyOverride } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: 'Messages array is required and must not be empty.' });
  }

  const effectiveKey = (apiKeyOverride && typeof apiKeyOverride === 'string' && apiKeyOverride.trim())
    ? apiKeyOverride.trim()
    : GROQ_API_KEY;

  if (!effectiveKey) {
    return res.status(503).json({
      success: false,
      error: 'Groq API key not configured on server. Provide an API key or configure GROQ_API_KEY environment variable.'
    });
  }

  try {
    const startTime = performance.now();
    const formattedMessages = [...messages];
    if (systemPrompt && typeof systemPrompt === 'string' && !formattedMessages.some((m) => m.role === 'system')) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }

    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_completion_tokens: 4096,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => null);
      const errMsg = errBody?.error?.message || `Groq API responded with status ${groqRes.status}`;
      return res.status(groqRes.status).json({ success: false, error: errMsg });
    }

    const data = await groqRes.json();
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const choice = data.choices?.[0];
    const message = choice?.message || {};
    const content = message.content || '';
    const reasoning = message.reasoning || undefined;

    const completionTokens = data.usage?.completion_tokens || Math.round(content.length / 4);
    const totalTokens = data.usage?.total_tokens || completionTokens;
    const completionTimeSec = (data.usage?.completion_time || latencyMs / 1000);
    const tokensPerSecond = completionTimeSec > 0 ? Math.round(completionTokens / completionTimeSec) : 0;

    return res.status(200).json({
      success: true,
      content,
      reasoning,
      providerUsed: 'groq',
      metrics: {
        latencyMs,
        tokensPerSecond,
        completionTokens,
        totalTokens,
      },
    });
  } catch (err) {
    console.error('[Chat API Error]', err.message);
    return res.status(500).json({ success: false, error: 'Internal inference error. Please try again.' });
  }
}
