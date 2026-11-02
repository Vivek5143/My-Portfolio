import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

export interface AppConfig {
  port: number;
  githubUsername: string;
  githubToken?: string;
  githubWebhookSecret?: string;
  corsOrigin?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  adminUsername: string;
  adminPasswordHash: string;
  jwtSecret: string;
  isDev: boolean;
  isTest: boolean;
}

// Default dev password is "admin123" (bcrypt hash with salt rounds 10)
const DEFAULT_DEV_ADMIN_HASH = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1q3fW40hZ18Z3p88Zq0e5qC8yYjB.S';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test'
  || process.env.VITEST === 'true'
  || Boolean(process.env.VITEST_WORKER_ID);

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  githubUsername: process.env.GITHUB_USERNAME || 'Vivek5143',
  githubToken: process.env.GITHUB_TOKEN || undefined,
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || undefined,
  corsOrigin: process.env.CORS_ORIGIN || undefined,
  supabaseUrl: process.env.SUPABASE_URL || undefined,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  adminUsername: process.env.ADMIN_USERNAME || (isProduction ? '' : 'admin'),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || (isProduction ? '' : DEFAULT_DEV_ADMIN_HASH),
  jwtSecret: process.env.JWT_SECRET || (isProduction ? '' : 'dev_portfolio_jwt_secret_change_in_production_928374'),
  isDev: !isProduction && !isTest,
  isTest,
};

export function validateProductionConfig(appConfig: AppConfig = config): void {
  if (!appConfig.isTest && !appConfig.githubWebhookSecret) {
    throw new Error('GITHUB_WEBHOOK_SECRET must be configured outside test environments');
  }

  if (appConfig.isDev) return;

  if (!appConfig.adminUsername || !appConfig.adminPasswordHash) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD_HASH must be configured in production');
  }

  if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(appConfig.adminPasswordHash)) {
    throw new Error('ADMIN_PASSWORD_HASH must be a valid bcrypt hash in production');
  }

  if (!appConfig.jwtSecret || appConfig.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}

validateProductionConfig();

export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
}

export function isSupabaseServiceRoleKey(key: string | undefined = config.supabaseServiceRoleKey): boolean {
  if (!key) return false;
  if (key.startsWith('sb_secret_')) return true;

  const parts = key.split('.');
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { role?: unknown };
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

export function isGitHubTokenConfigured(): boolean {
  return Boolean(config.githubToken);
}

export function isWebhookConfigured(): boolean {
  return Boolean(config.githubWebhookSecret);
}
