import { describe, it, expect } from 'vitest';
import {
  GROQ_MODELS,
  OLLAMA_MODELS,
  extractReasoningFromContent,
  getOllamaEndpoints,
  checkOllamaStatus,
  summarizeTeamsChat,
} from '../src/services/groqService';

describe('Groq Service Models & Schema (groqService.ts)', () => {
  it('should register high-speed LPU models', () => {
    expect(GROQ_MODELS.length).toBeGreaterThanOrEqual(3);

    const gptOss20b = GROQ_MODELS.find((m) => m.id === 'openai/gpt-oss-20b');
    expect(gptOss20b).toBeDefined();
    expect(gptOss20b?.supportsReasoning).toBe(true);

    const qwen = GROQ_MODELS.find((m) => m.id === 'qwen/qwen3.8-27b');
    expect(qwen).toBeDefined();
  });

  it('each model should have valid context window and descriptions', () => {
    GROQ_MODELS.forEach((model) => {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.contextWindow).toMatch(/\d+k/);
      expect(typeof model.supportsReasoning).toBe('boolean');
    });
  });
});

describe('Ollama Edge & Local-First AI Layer (groqService.ts)', () => {
  it('should register popular local edge models for BYOM', () => {
    expect(OLLAMA_MODELS.length).toBeGreaterThanOrEqual(5);

    const llama32 = OLLAMA_MODELS.find((m) => m.id === 'llama3.2');
    expect(llama32).toBeDefined();
    expect(llama32?.size).toContain('GB');

    const deepseek = OLLAMA_MODELS.find((m) => m.id === 'deepseek-r1:8b');
    expect(deepseek).toBeDefined();
    expect(deepseek?.supportsReasoning).toBe(true);
  });

  it('should parse DeepSeek-R1 chain-of-thought <think> tags', () => {
    const rawOllamaOutput = `<think>
Analyzing the incident timeline. CPU spiked at 11:02 due to analytics query.
Sarah instructed to kill the query.
</think>
The incident was mitigated when Alex terminated the unindexed query.`;

    const parsed = extractReasoningFromContent(rawOllamaOutput);
    expect(parsed.reasoning).toBeDefined();
    expect(parsed.reasoning).toContain('Analyzing the incident timeline');
    expect(parsed.content).toBe('The incident was mitigated when Alex terminated the unindexed query.');
  });

  it('should resolve proxy and localhost endpoints for zero-CORS browser access', () => {
    const endpoints = getOllamaEndpoints('http://localhost:11434');
    expect(endpoints.length).toBeGreaterThanOrEqual(1);
    expect(endpoints.some((e) => e.includes('11434') || e.includes('ollama'))).toBe(true);
  });

  it('should check Ollama status safely and handle unreachable server gracefully', async () => {
    // When testing in CI without a live Ollama daemon running, it should return graceful status
    const status = await checkOllamaStatus('http://localhost:99999');
    expect(status).toBeDefined();
    expect(typeof status.isRunning).toBe('boolean');
  });

  it('should support universal summarizeTeamsChat function with provider routing', async () => {
    const chat = '[10:00 AM] Alex: @You please review PR 101 today before 4 PM.';
    const result = await summarizeTeamsChat({
      chatContent: chat,
      channelName: '#dev',
      provider: 'local',
    });

    expect(result).toBeDefined();
    expect(result.channelName).toBe('#dev');
    expect(result.actionItems.length).toBeGreaterThanOrEqual(1);
    expect(result.providerUsed).toBe('local');
  });
});

