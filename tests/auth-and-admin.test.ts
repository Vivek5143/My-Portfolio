import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createApiRouter } from '../server/routes';
import { FileProjectStore } from '../server/db';
import { generateAdminToken } from '../server/auth';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('Admin Authentication, Authorization & Lifecycle Workflow', () => {
  let app: express.Express;
  let store: FileProjectStore;
  let adminToken: string;
  let testDataDir: string;

  beforeEach(async () => {
    testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-admin-'));
    store = new FileProjectStore(testDataDir);
    await store.init();

    app = express();
    app.use(express.json());
    app.use('/api', createApiRouter(store));

    adminToken = generateAdminToken('admin');
  });

  afterEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  it('rejects unauthenticated requests to protected admin endpoints with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/projects');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('rejects invalid or tampered authorization tokens with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', 'Bearer invalid_tampered_token_xyz');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('allows access to admin endpoints with a valid JWT token', async () => {
    const res = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('executes the full approval, publish, and public visibility lifecycle', async () => {
    // 1. Create a newly discovered repo in pending status
    const pending = await store.create({
      github_id: 123456,
      repo_name: 'SuperAgent-RAG',
      repo_full_name: 'Vivek5143/SuperAgent-RAG',
      github_url: 'https://github.com/Vivek5143/SuperAgent-RAG',
      default_branch: 'main',
      stars_count: 50,
      forks_count: 8,
      open_issues_count: 0,
      language: 'Python',
      topics: ['ai'],
      readme_content: null,
      is_private: false,
      is_fork: false,
      is_archived: false,
      approval_status: 'pending',
      is_published: false,
      is_visible: false,
      is_featured: false,
      display_order: 100,
      last_synced_at: new Date().toISOString(),
    });

    // 2. Verify it is NOT returned in public portfolio
    let publicRes = await request(app).get('/api/projects');
    expect(publicRes.body.some((p: any) => p.repoName === 'SuperAgent-RAG')).toBe(false);

    // 3. Attempt to publish before approving -> Must be rejected with 400!
    const earlyPublishRes = await request(app)
      .post(`/api/admin/projects/${pending.id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(earlyPublishRes.status).toBe(400);
    expect(earlyPublishRes.body.error).toContain('Cannot publish unapproved project');

    // 4. Admin approves the project
    const approveRes = await request(app)
      .post(`/api/admin/projects/${pending.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.project.approval_status).toBe('approved');

    // Even though approved, it is NOT yet published or visible!
    expect(approveRes.body.project.is_published).toBe(false);
    expect(approveRes.body.project.is_visible).toBe(false);

    publicRes = await request(app).get('/api/projects');
    expect(publicRes.body.some((p: any) => p.repoName === 'SuperAgent-RAG')).toBe(false);

    // 5. Admin publishes the project
    const publishRes = await request(app)
      .post(`/api/admin/projects/${pending.id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.project.is_published).toBe(true);
    expect(publishRes.body.project.is_visible).toBe(true);

    // 6. Now it appears in the public portfolio!
    publicRes = await request(app).get('/api/projects');
    expect(publicRes.status).toBe(200);
    const publishedItem = publicRes.body.find((p: any) => p.repoName === 'SuperAgent-RAG');
    expect(publishedItem).toBeDefined();
    expect(publishedItem.title).toBe('SuperAgent-RAG');

    // 7. Admin unpublishes the project
    const unpublishRes = await request(app)
      .post(`/api/admin/projects/${pending.id}/unpublish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(unpublishRes.status).toBe(200);
    expect(unpublishRes.body.project.is_published).toBe(false);

    // 8. Public portfolio no longer includes it
    publicRes = await request(app).get('/api/projects');
    expect(publicRes.body.some((p: any) => p.repoName === 'SuperAgent-RAG')).toBe(false);
  });

  it('rejecting a project sets approval_status to rejected and disables publication', async () => {
    const item = await store.create({
      github_id: 777888,
      repo_name: 'Deprecated-Prototype',
      repo_full_name: 'Vivek5143/Deprecated-Prototype',
      github_url: 'https://github.com/Vivek5143/Deprecated-Prototype',
      default_branch: 'main',
      stars_count: 1,
      forks_count: 0,
      open_issues_count: 0,
      language: 'Python',
      topics: [],
      readme_content: null,
      is_private: false,
      is_fork: false,
      is_archived: false,
      approval_status: 'pending',
      is_published: false,
      is_visible: false,
      is_featured: false,
      display_order: 100,
      last_synced_at: null,
    });

    const res = await request(app)
      .post(`/api/admin/projects/${item.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.project.approval_status).toBe('rejected');
    expect(res.body.project.is_published).toBe(false);
    expect(res.body.project.is_visible).toBe(false);
  });

  it('persists complete project edits and keeps private projects out of public results', async () => {
    const project = await store.create({
      github_id: 998877,
      repo_name: 'Editable-Project',
      repo_full_name: 'Vivek5143/Editable-Project',
      github_url: 'https://github.com/Vivek5143/Editable-Project',
      default_branch: 'main',
      stars_count: 0,
      forks_count: 0,
      open_issues_count: 0,
      language: 'TypeScript',
      topics: [],
      readme_content: null,
      is_private: false,
      is_fork: false,
      is_archived: false,
      approval_status: 'approved',
      is_published: false,
      is_visible: false,
      is_featured: false,
      display_order: 1,
      last_synced_at: null,
    });

    const edit = await request(app)
      .patch(`/api/admin/projects/${project.id}`)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({
        custom_title: 'Edited Project',
        custom_description: 'Updated short description',
        full_description: 'Updated full description',
        custom_technologies: ['React', 'Supabase'],
        website_url: 'https://example.com',
        screenshots: ['https://example.com/screenshot.png'],
        is_featured: true,
        is_published: true,
        is_visible: true,
      });

    expect(edit.status).toBe(200);
    expect(edit.body.custom_title).toBe('Edited Project');
    expect(edit.body.is_featured).toBe(true);

    let publicRes = await request(app).get('/api/projects');
    expect(publicRes.body.some((item: any) => item.title === 'Edited Project')).toBe(true);

    const makePrivate = await request(app)
      .patch(`/api/admin/projects/${project.id}`)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ is_private: true, is_published: false, is_visible: false });

    expect(makePrivate.status).toBe(200);
    publicRes = await request(app).get('/api/projects');
    expect(publicRes.body.some((item: any) => item.title === 'Edited Project')).toBe(false);
  });
});
