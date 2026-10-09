import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_CATCHUP_SYSTEM_PROMPT } from '../src/services/groqService';

describe('Prompt & Architecture Blueprint Verification (PROMPT.MD)', () => {
  const promptMdPath = path.resolve(process.cwd(), 'PROMPT.MD');

  it('PROMPT.MD file exists and has comprehensive blueprint content', () => {
    expect(fs.existsSync(promptMdPath)).toBe(true);

    const content = fs.readFileSync(promptMdPath, 'utf-8');
    expect(content.length).toBeGreaterThan(1500);

    // Verify key architecture components are documented
    expect(content).toContain('Master System Prompt');
    expect(content).toContain('Autonomous Workspace Ingestion');
    expect(content).toContain('Composio Hub');
    expect(content).toContain('Groq LPU');
    expect(content).toContain('Ollama Edge Runtime');
    expect(content).toContain('MarkdownMessage Engine');
    expect(content).toContain('Raycast Midnight');
  });

  it('DEFAULT_CATCHUP_SYSTEM_PROMPT contains formatting standards', () => {
    expect(DEFAULT_CATCHUP_SYSTEM_PROMPT).toBeDefined();
    expect(DEFAULT_CATCHUP_SYSTEM_PROMPT).toContain('CatchUp AI');
    expect(DEFAULT_CATCHUP_SYSTEM_PROMPT).toContain('GitHub-Flavored Markdown table');
    expect(DEFAULT_CATCHUP_SYSTEM_PROMPT).toContain('#all-inmodel');
    expect(DEFAULT_CATCHUP_SYSTEM_PROMPT).toContain('@username');
  });
});
