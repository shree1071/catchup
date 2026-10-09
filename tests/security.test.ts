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
});
