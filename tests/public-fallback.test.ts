import { describe, it, expect } from 'vitest';
import { PROJECTS } from '../src/constants';
import { Project } from '../src/types';

describe('Public Portfolio Integrity & Fallback Robustness', () => {
  it('ensures static constants.ts fallback contains all 9 core portfolio projects with complete metadata', () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(9);

    const expectedTitles = [
      'AtlasAI',
      'AI Sports Quiz Agent',
      'CampusPal',
      'EduDiff',
      'TransactAI',
      'InstaClaim',
      'Multi-Agent Platform',
      'Interview Assistant',
      'Daily-Work-Logger',
    ];

    for (const title of expectedTitles) {
      const match = PROJECTS.find(p => p.title === title);
      expect(match).toBeDefined();
      expect(match?.description.length).toBeGreaterThan(20);
      expect(match?.technologies.length).toBeGreaterThan(0);
      expect(match?.highlights.length).toBeGreaterThan(0);
      expect(match?.link).toContain('github.com/Vivek5143');
    }
  });

  it('verifies demoLink property is correctly typed and populated where live demos exist', () => {
    const atlas = PROJECTS.find(p => p.title === 'AtlasAI');
    expect(atlas).toBeDefined();
    expect(atlas?.demoLink).toBe('https://atlas-ai-ashen.vercel.app/');

    // All projects with demoLink must have valid HTTPS URL
    PROJECTS.forEach((p: Project) => {
      if (p.demoLink) {
        expect(p.demoLink.startsWith('https://')).toBe(true);
      }
    });
  });

  it('guarantees no duplicate project titles exist in portfolio dataset', () => {
    const titles = PROJECTS.map(p => p.title);
    const uniqueTitles = new Set(titles);
    expect(titles.length).toBe(uniqueTitles.size);
  });
});
