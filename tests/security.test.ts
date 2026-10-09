import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Verification & Credential Hygiene', () => {
  it('should verify .gitignore includes .env and local secret patterns', () => {
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, 'utf8');
    expect(content).toContain('.env');
    expect(content).toContain('scratch_*');
  });

  it('should verify .env.example exists without containing active private keys', () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const content = fs.readFileSync(envExamplePath, 'utf8');
    expect(content).toContain('VITE_GROQ_API_KEY');
    expect(content).not.toMatch(/gsk_[a-zA-Z0-9]{20,}/);
  });

  it('should verify source code files do not contain hardcoded Groq API keys', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    
    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          expect(fileContent).not.toMatch(/gsk_[a-zA-Z0-9]{20,}/);
        }
      }
    }

    checkDir(srcDir);
  });

  it('should verify source code files do not contain hardcoded Composio keys', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    
    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          expect(fileContent).not.toMatch(/ck__[a-zA-Z0-9]{15,}/);
        }
      }
    }

    checkDir(srcDir);
  });

  it('should verify vercel.json defines enterprise security headers', () => {
    const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
    expect(fs.existsSync(vercelConfigPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    expect(config.headers).toBeDefined();

    const globalHeaders = config.headers.find((h: any) => h.source === '/(.*)');
    expect(globalHeaders).toBeDefined();

    const headerKeys = globalHeaders.headers.map((h: any) => h.key);
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('Content-Security-Policy');
  });

  it('should verify serverless API handlers enforce rate limiting and size limits', () => {
    const composioApiPath = path.resolve(process.cwd(), 'api/composio.js');
    const chatApiPath = path.resolve(process.cwd(), 'api/chat.js');

    expect(fs.existsSync(composioApiPath)).toBe(true);
    expect(fs.existsSync(chatApiPath)).toBe(true);

    const composioContent = fs.readFileSync(composioApiPath, 'utf8');
    const chatContent = fs.readFileSync(chatApiPath, 'utf8');

    // Rate limiting check
    expect(composioContent).toContain('checkRateLimit');
    expect(composioContent).toContain('X-RateLimit-Limit');
    expect(chatContent).toContain('checkChatRateLimit');
    expect(chatContent).toContain('X-RateLimit-Limit');

    // Body size guard check
    expect(composioContent).toContain('10240');
    expect(chatContent).toContain('65536');
  });
});
