import crypto from 'crypto';
import { IProjectStore } from './db';

export interface WebhookResult {
  handled: boolean;
  action?: string;
  repo?: string;
  message: string;
}

/**
 * Verify GitHub webhook HMAC-SHA256 signature
 */
export function verifyGitHubSignature(
  rawBody: Buffer | string,
  signatureHeader?: string,
  secret?: string
): boolean {
  if (!secret) {
    // If webhook secret is not configured on server, reject to be safe
    return false;
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expectedSignature = signatureHeader.slice(7); // Remove 'sha256='
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const computedSignature = hmac.digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const computedBuffer = Buffer.from(computedSignature, 'hex');

  if (expectedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, computedBuffer);
}

/**
 * Handle incoming GitHub webhook event idempotently
 */
export async function processWebhookEvent(
  event: string,
  deliveryId: string,
  payload: any,
  store: IProjectStore
): Promise<WebhookResult> {
  // Idempotency check
  const isDuplicate = await store.isWebhookProcessed(deliveryId);
  if (isDuplicate) {
    return {
      handled: true,
      message: `Delivery ${deliveryId} was already processed (idempotent skip).`,
    };
  }

  // Record delivery
  await store.recordWebhookDelivery(deliveryId, event);

  if (event === 'ping') {
    return {
      handled: true,
      message: 'Ping acknowledged successfully.',
    };
  }

  if (event === 'repository') {
    const action = payload.action;
    const repo = payload.repository;

    if (!repo) {
      return { handled: false, message: 'Missing repository payload' };
    }

    if (action === 'created') {
      // Check if already in database
      const existing = await store.getByGithubId(repo.id);
      if (!existing) {
        const now = new Date().toISOString();
        await store.create({
          github_id: repo.id,
          repo_name: repo.name,
          repo_full_name: repo.full_name,
          github_url: repo.html_url,
          default_branch: repo.default_branch || 'main',
          stars_count: repo.stargazers_count || 0,
          forks_count: repo.forks_count || 0,
          open_issues_count: repo.open_issues_count || 0,
          language: repo.language || null,
          topics: repo.topics || [],
          readme_content: null,
          is_private: repo.private || false,
          is_fork: repo.fork || false,
          is_archived: repo.archived || false,
          github_created_at: repo.created_at,
          github_updated_at: repo.updated_at,
          github_pushed_at: repo.pushed_at,

          // Safe defaults for newly discovered repo
          custom_title: repo.name,
          custom_description: repo.description || 'Newly created GitHub repository.',
          custom_technologies: repo.topics && repo.topics.length > 0 ? repo.topics : (repo.language ? [repo.language] : []),
          custom_highlights: [`Automated webhook discovery: Created on GitHub.`],
          demo_url: null,
          thumbnail_url: null,

          // STRICT SECURITY AND WORKFLOW:
          approval_status: 'pending',
          is_published: false,
          is_visible: false,
          is_featured: false,
          display_order: 100,

          last_synced_at: now,
          is_deleted_on_github: false,
        });

        return {
          handled: true,
          action: 'created',
          repo: repo.full_name,
          message: `Repository '${repo.full_name}' received via webhook and added to pending approval queue.`,
        };
      }
    } else if (action === 'deleted') {
      const existing = await store.getByGithubId(repo.id);
      if (existing) {
        await store.update(existing.id, { is_deleted_on_github: true });
        return {
          handled: true,
          action: 'deleted',
          repo: repo.full_name,
          message: `Repository '${repo.full_name}' marked as deleted.`,
        };
      }
    } else if (action === 'publicized' || action === 'privatized') {
      const existing = await store.getByGithubId(repo.id);
      if (existing) {
        await store.update(existing.id, { is_private: action === 'privatized' });
        return {
          handled: true,
          action,
          repo: repo.full_name,
          message: `Repository '${repo.full_name}' privacy updated to ${action}.`,
        };
      }
    } else if (action === 'renamed') {
      const existing = await store.getByGithubId(repo.id);
      if (existing) {
        await store.update(existing.id, {
          repo_name: repo.name,
          repo_full_name: repo.full_name,
          github_url: repo.html_url,
        });
        return {
          handled: true,
          action: 'renamed',
          repo: repo.full_name,
          message: `Repository '${repo.full_name}' renamed.`,
        };
      }
    }
  }

  if (event === 'push') {
    const repo = payload.repository;
    if (repo && repo.id) {
      const existing = await store.getByGithubId(repo.id);
      if (existing) {
        await store.update(existing.id, {
          github_pushed_at: repo.pushed_at || new Date().toISOString(),
          stars_count: repo.stargazers_count !== undefined ? repo.stargazers_count : existing.stars_count,
        });
        return {
          handled: true,
          action: 'push',
          repo: repo.full_name,
          message: `Push event recorded for '${repo.full_name}'.`,
        };
      }
    }
  }

  return {
    handled: true,
    message: `Event '${event}' processed.`,
  };
}
