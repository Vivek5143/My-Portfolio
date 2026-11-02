import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import { createApiRouter } from '../server/routes';
import { FileProjectStore } from '../server/db';
import { processWebhookEvent, verifyGitHubSignature } from '../server/webhook';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('GitHub Webhook Signature Verification & Idempotent Processing', () => {
  let app: express.Express;
  let store: FileProjectStore;
  const webhookSecret = 'test_webhook_secret_key_12345';
  let testDataDir: string;

  beforeEach(async () => {
    testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-webhook-'));
    store = new FileProjectStore(testDataDir);
    await store.init();

    app = express();
    app.use(express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }));
    app.use('/api', createApiRouter(store));
  });

  afterEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  function computeSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  it('validates correct HMAC-SHA256 signatures and rejects forged or invalid signatures', () => {
    const payload = JSON.stringify({ action: 'created' });
    const validSig = computeSignature(payload, webhookSecret);
    const invalidSig = 'sha256=1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff';

    expect(verifyGitHubSignature(payload, validSig, webhookSecret)).toBe(true);
    expect(verifyGitHubSignature(payload, invalidSig, webhookSecret)).toBe(false);
    expect(verifyGitHubSignature(payload, validSig, 'wrong_secret')).toBe(false);
    expect(verifyGitHubSignature(payload, undefined, webhookSecret)).toBe(false);
  });

  it('propagates delivery persistence failures instead of processing an untracked webhook', async () => {
    const failingStore = {
      isWebhookProcessed: async () => false,
      recordWebhookDelivery: async () => {
        throw new Error('row violates row-level security policy');
      },
    } as unknown as FileProjectStore;

    await expect(
      processWebhookEvent('ping', 'delivery-rsl-failure', {}, failingStore)
    ).rejects.toThrow('row violates row-level security policy');
  });

  it('processes incoming repository.created webhook and adds to pending queue idempotently', async () => {
    const payload = {
      action: 'created',
      repository: {
        id: 4443322,
        name: 'Webhook-Discovered-Agent',
        full_name: 'Vivek5143/Webhook-Discovered-Agent',
        html_url: 'https://github.com/Vivek5143/Webhook-Discovered-Agent',
        description: 'Auto detected repository via GitHub Webhook',
        default_branch: 'main',
        stargazers_count: 12,
        forks_count: 2,
        open_issues_count: 0,
        language: 'Python',
        topics: ['webhook', 'agent'],
        private: false,
        fork: false,
        archived: false,
        created_at: '2026-03-01T00:00:00Z',
        updated_at: '2026-03-01T00:00:00Z',
        pushed_at: '2026-03-01T00:00:00Z',
      },
    };

    const deliveryId = 'delivery-uuid-test-1234';

    // First webhook delivery
    const res1 = await request(app)
      .post('/api/webhooks/github')
      .set('x-github-delivery', deliveryId)
      .set('x-github-event', 'repository')
      .send(payload);

    expect(res1.status).toBe(200);
    expect(res1.body.handled).toBe(true);
    expect(res1.body.action).toBe('created');

    const created = await store.getByGithubId(4443322);
    expect(created).not.toBeNull();
    expect(created?.approval_status).toBe('pending');
    expect(created?.is_published).toBe(false);
    expect(created?.is_visible).toBe(false);

    // Second webhook delivery with the exact same x-github-delivery header (Idempotent test)
    const res2 = await request(app)
      .post('/api/webhooks/github')
      .set('x-github-delivery', deliveryId)
      .set('x-github-event', 'repository')
      .send(payload);

    expect(res2.status).toBe(200);
    expect(res2.body.message).toContain('already processed');

    // Confirm that no duplicate was created
    const all = await store.getAll();
    const matching = all.filter(p => p.github_id === 4443322);
    expect(matching).toHaveLength(1);
  });

  it('processes repository.deleted webhook and marks project as deleted on GitHub', async () => {
    // First create a project in store
    await store.create({
      github_id: 998877,
      repo_name: 'Repo-To-Delete',
      repo_full_name: 'Vivek5143/Repo-To-Delete',
      github_url: 'https://github.com/Vivek5143/Repo-To-Delete',
      default_branch: 'main',
      stars_count: 0,
      forks_count: 0,
      open_issues_count: 0,
      language: 'Python',
      topics: [],
      readme_content: null,
      is_private: false,
      is_fork: false,
      is_archived: false,
      approval_status: 'approved',
      is_published: true,
      is_visible: true,
      is_featured: false,
      display_order: 10,
      last_synced_at: null,
    });

    const payload = {
      action: 'deleted',
      repository: {
        id: 998877,
        full_name: 'Vivek5143/Repo-To-Delete',
      },
    };

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('x-github-delivery', 'delivery-delete-999')
      .set('x-github-event', 'repository')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.handled).toBe(true);

    const updated = await store.getByGithubId(998877);
    expect(updated?.is_deleted_on_github).toBe(true);
  });
});
