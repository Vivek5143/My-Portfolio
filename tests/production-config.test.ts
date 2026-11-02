import { describe, expect, it } from 'vitest';
import { AppConfig, validateProductionConfig } from '../server/config';

const baseConfig: AppConfig = {
  port: 3001,
  githubUsername: 'Vivek5143',
  githubWebhookSecret: 'test-webhook-secret',
  adminUsername: 'admin',
  adminPasswordHash: '$2b$10$' + 'A'.repeat(53),
  jwtSecret: 'a-production-secret-that-is-at-least-32-chars',
  isDev: false,
  isTest: false,
};

describe('Production configuration validation', () => {
  it('accepts explicit bcrypt admin credentials and a strong JWT secret', () => {
    expect(() => validateProductionConfig(baseConfig)).not.toThrow();
  });

  it('rejects missing production credentials and weak JWT secrets', () => {
    expect(() => validateProductionConfig({
      ...baseConfig,
      adminUsername: '',
    })).toThrow('ADMIN_USERNAME');

    expect(() => validateProductionConfig({
      ...baseConfig,
      jwtSecret: 'too-short',
    })).toThrow('JWT_SECRET');
  });
});
