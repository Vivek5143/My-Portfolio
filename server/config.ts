import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

export interface AppConfig {
  port: number;
  githubUsername: string;
  githubToken?: string;
  githubWebhookSecret?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  adminUsername: string;
  adminPasswordHash: string;
  jwtSecret: string;
  isDev: boolean;
}

// Default dev password is "admin123" (bcrypt hash with salt rounds 10)
const DEFAULT_DEV_ADMIN_HASH = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1q3fW40hZ18Z3p88Zq0e5qC8yYjB.S';

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  githubUsername: process.env.GITHUB_USERNAME || 'Vivek5143',
  githubToken: process.env.GITHUB_TOKEN || undefined,
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || undefined,
  supabaseUrl: process.env.SUPABASE_URL || undefined,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || DEFAULT_DEV_ADMIN_HASH,
  jwtSecret: process.env.JWT_SECRET || 'dev_portfolio_jwt_secret_change_in_production_928374',
  isDev: process.env.NODE_ENV !== 'production',
};

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
