import { describe, it, expect } from 'vitest';
import { defaultSiteConfig, FeatureItem, CommandItem } from '../src/config/siteConfig';

describe('Site Configuration & Presets (siteConfig.ts)', () => {
  it('should have valid default metadata for CatchUp', () => {
    expect(defaultSiteConfig.projectName).toBe('CatchUp');
    expect(defaultSiteConfig.hackathonName).toContain('HACKATHON 2026');
    expect(defaultSiteConfig.tagline).toBeDefined();
    expect(defaultSiteConfig.subheadline).toBeDefined();
    expect(defaultSiteConfig.installCommand).toBeDefined();
  });

  it('should define structured features with valid icons and metrics', () => {
    expect(defaultSiteConfig.features.length).toBeGreaterThanOrEqual(4);

    defaultSiteConfig.features.forEach((feature: FeatureItem) => {
      expect(feature.id).toBeTruthy();
      expect(feature.title).toBeTruthy();
      expect(feature.description).toBeTruthy();
      expect(feature.icon).toBeTruthy();
      if (feature.metric) {
        expect(feature.metricLabel).toBeTruthy();
      }
    });
  });

  it('should define accessible command palette items with valid shortcuts', () => {
    expect(defaultSiteConfig.commands.length).toBeGreaterThanOrEqual(4);

    defaultSiteConfig.commands.forEach((cmd: CommandItem) => {
      expect(cmd.id).toBeTruthy();
      expect(cmd.title).toBeTruthy();
      expect(cmd.category).toMatch(/Commands|AI Tools|Extensions|Navigation/);
      expect(cmd.icon).toBeTruthy();
    });

    const catchUpCommand = defaultSiteConfig.commands.find((c) => c.id === 'cmd-teams-catchup');
    expect(catchUpCommand).toBeDefined();
    expect(catchUpCommand?.shortcut).toBe('⌘U');
  });

  it('should define extension tiles with install counts and categories', () => {
    expect(defaultSiteConfig.extensions.length).toBeGreaterThanOrEqual(4);

    defaultSiteConfig.extensions.forEach((ext) => {
      expect(ext.name).toBeTruthy();
      expect(ext.category).toBeTruthy();
      expect(ext.author).toBeTruthy();
      expect(ext.installs).toBeTruthy();
    });
  });
});
