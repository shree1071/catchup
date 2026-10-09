import { describe, it, expect } from 'vitest';
import { GROQ_MODELS } from '../src/services/groqService';

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
