import { Router, Request, Response } from 'express';
import { getProjectStore, IProjectStore } from './db';
import { githubService } from './github';
import { verifyGitHubSignature, processWebhookEvent } from './webhook';
import { requireAdminAuth, generateAdminToken, verifyAdminCredentials } from './auth';
import { config, isSupabaseConfigured, isWebhookConfigured, isGitHubTokenConfigured } from './config';
import { ApprovalStatus } from '../src/types';

function handleServerError(res: Response, status: number, publicMessage: string, error: unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown server error';
  console.error(publicMessage, { message });
  res.status(status).json({ error: publicMessage });
}

export function createApiRouter(store: IProjectStore = getProjectStore()): Router {
  const router = Router();

  // -------------------------------------------------------------------------
  // 1. PUBLIC ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * Health & Diagnostic Endpoint
   */
  router.get('/health', async (_req: Request, res: Response) => {
    try {
      const stats = await store.getStats(config.githubUsername);
      res.json({
        status: 'ok',
        version: '1.0.0',
        environment: config.isDev ? 'development' : 'production',
        backend: isSupabaseConfigured() ? 'supabase' : 'file-store',
        githubUsername: config.githubUsername,
        githubTokenConfigured: isGitHubTokenConfigured(),
        webhookConfigured: isWebhookConfigured(),
        stats,
      });
    } catch (err: any) {
      handleServerError(res, 500, 'Health check failed', err);
    }
  });

  /**
   * Public Projects Endpoint
   * STRICT SERVER-SIDE FILTER:
   * Returns ONLY approved, published, visible, non-private projects.
   * Strips administrative and private metadata.
   */
  router.get('/projects', async (_req: Request, res: Response) => {
    try {
      const projects = await store.getPublicProjects();
      res.json(projects);
    } catch (err: any) {
      handleServerError(res, 500, 'Failed to retrieve public portfolio projects', err);
    }
  });

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATION ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * Admin Login
   */
  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        res.status(400).json({ error: 'Username and password are required.' });
        return;
      }

      if (username !== config.adminUsername) {
        res.status(401).json({ error: 'Invalid username or password.' });
        return;
      }

      const isValid = await verifyAdminCredentials(password);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid username or password.' });
        return;
      }

      const token = generateAdminToken(username);
      res.json({
        token,
        user: {
          username,
          role: 'admin',
        },
      });
    } catch (err: any) {
      handleServerError(res, 500, 'Login failure', err);
    }
  });

  /**
   * Verify Session / Profile
   */
  router.get('/auth/me', requireAdminAuth, (req: Request, res: Response) => {
    res.json({
      authenticated: true,
      user: req.user,
    });
  });

  // -------------------------------------------------------------------------
  // 3. GITHUB WEBHOOK ENDPOINT
  // -------------------------------------------------------------------------

  /**
   * Secure GitHub Webhook Receiver
   * Verifies HMAC-SHA256 signature and processes repository events idempotently
   */
  router.post('/webhooks/github', async (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const deliveryId = req.headers['x-github-delivery'] as string | undefined;
    const event = req.headers['x-github-event'] as string | undefined;

    // Use rawBody attached by express.raw / custom verify buffer
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (!config.isTest && config.githubWebhookSecret) {
      const isValid = verifyGitHubSignature(rawBody, signature, config.githubWebhookSecret);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid webhook signature.' });
        return;
      }
    } else if (!config.isTest) {
      res.status(500).json({ error: 'Webhook secret is not configured on the server.' });
      return;
    }

    if (!deliveryId || !event) {
      res.status(400).json({ error: 'Missing GitHub delivery ID or event header.' });
      return;
    }

    try {
      const result = await processWebhookEvent(event, deliveryId, req.body, store);
      res.json(result);
    } catch (err: any) {
      console.error('Webhook processing error', {
        event,
        deliveryId,
        message: err.message,
      });
      handleServerError(res, 500, 'Webhook processing error', err);
    }
  });

  // -------------------------------------------------------------------------
  // 4. ADMIN DASHBOARD MANAGEMENT (ALL REQUIRE ADMIN AUTH)
  // -------------------------------------------------------------------------

  /**
   * List all managed projects (pending, approved, rejected, draft, published)
   */
  router.get('/admin/projects', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { status, published, visible, featured } = req.query;
      const projects = await store.getAll({
        status: status as ApprovalStatus | undefined,
        published: published !== undefined ? published === 'true' : undefined,
        visible: visible !== undefined ? visible === 'true' : undefined,
        featured: featured !== undefined ? featured === 'true' : undefined,
      });
      res.json(projects);
    } catch (err: any) {
      handleServerError(res, 500, 'Failed to fetch admin projects', err);
    }
  });

  /**
   * Get administrative metrics and overview
   */
  router.get('/admin/stats', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const stats = await store.getStats(config.githubUsername);
      res.json(stats);
    } catch (err: any) {
      handleServerError(res, 500, 'Failed to fetch stats', err);
    }
  });

  /**
   * Trigger Manual GitHub Synchronization
   */
  router.post('/admin/sync', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const result = await githubService.sync(store, {
        username: config.githubUsername,
        token: config.githubToken,
      });
      res.json({
        success: true,
        message: `Sync completed: ${result.newDiscovered} new discovered, ${result.updatedExisting} updated.`,
        result,
      });
    } catch (err: any) {
      handleServerError(res, 500, 'Synchronization failed', err);
    }
  });

  /**
   * Create Manually Curated Project (No GitHub repo required)
   */
  router.post('/admin/projects', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        full_description,
        category,
        project_type,
        technologies,
        highlights,
        programming_languages,
        frameworks,
        ai_tools,
        demo_url,
        github_url,
        website_url,
        documentation_url,
        screenshots,
        thumbnail_url,
        is_published,
        is_visible,
        is_featured,
        is_private,
      } = req.body;

      if (!title) {
        res.status(400).json({ error: 'Title is required for manual project.' });
        return;
      }
      const createUrls = [demo_url, github_url, website_url, documentation_url, thumbnail_url].filter(Boolean);
      if (createUrls.some((value: unknown) => typeof value !== 'string' || !/^https?:\/\//i.test(value))) {
        res.status(400).json({ error: 'Project links must use http or https URLs.' });
        return;
      }
      if (Array.isArray(screenshots) && screenshots.some((value: unknown) => typeof value !== 'string' || !/^https?:\/\//i.test(value))) {
        res.status(400).json({ error: 'Screenshot links must use http or https URLs.' });
        return;
      }
      if ((is_private && (is_published || is_visible)) || (is_published && !is_visible)) {
        res.status(400).json({ error: 'Private projects cannot be published, and published projects must be visible.' });
        return;
      }

      const now = new Date().toISOString();
      const project = await store.create({
        github_id: null,
        repo_name: title,
        repo_full_name: `manual/${title.toLowerCase().replace(/\s+/g, '-')}`,
        github_url: github_url || '',
        default_branch: 'main',
        stars_count: 0,
        forks_count: 0,
        open_issues_count: 0,
        language: technologies && technologies[0] ? technologies[0] : 'Engineering',
        topics: technologies || [],
        readme_content: null,
        is_private: Boolean(is_private),
        is_fork: false,
        is_archived: false,
        github_created_at: null,
        github_updated_at: null,
        github_pushed_at: null,

        custom_title: title,
        custom_description: description || '',
        full_description: full_description || null,
        custom_technologies: technologies || [],
        custom_highlights: highlights || [],
        category: category || null,
        project_type: project_type || null,
        programming_languages: programming_languages || [],
        frameworks: frameworks || [],
        ai_tools: ai_tools || [],
        demo_url: demo_url || null,
        website_url: website_url || null,
        documentation_url: documentation_url || null,
        screenshots: screenshots || [],
        thumbnail_url: thumbnail_url || null,

        approval_status: 'approved',
        is_published: Boolean(is_published),
        is_visible: Boolean(is_visible),
        is_featured: Boolean(is_featured),
        display_order: 50,

        last_synced_at: null,
        is_deleted_on_github: false,
      });

      res.status(201).json(project);
    } catch (err: any) {
      handleServerError(res, 500, 'Failed to create project', err);
    }
  });

  /**
   * Update Project Overrides and Controls
   */
  router.patch('/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const allowedFields = new Set([
        'custom_title',
        'custom_description',
        'full_description',
        'custom_technologies',
        'custom_highlights',
        'category',
        'project_type',
        'programming_languages',
        'frameworks',
        'ai_tools',
        'demo_url',
        'github_url',
        'website_url',
        'documentation_url',
        'screenshots',
        'thumbnail_url',
        'approval_status',
        'is_private',
        'is_published',
        'is_visible',
        'is_featured',
        'display_order',
      ]);

      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        res.status(400).json({ error: 'Request body must be an object.' });
        return;
      }

      const unexpectedFields = Object.keys(updates).filter(field => !allowedFields.has(field));
      if (unexpectedFields.length > 0) {
        res.status(400).json({ error: 'Request contains unsupported project fields.' });
        return;
      }

      const urlFields = ['demo_url', 'github_url', 'website_url', 'documentation_url', 'thumbnail_url'];
      for (const field of urlFields) {
        const value = updates[field];
        if (value !== null && value !== undefined) {
          if (typeof value !== 'string') {
            res.status(400).json({ error: `${field} must be a URL or null.` });
            return;
          }
          try {
            const parsed = new URL(value);
            if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
          } catch {
            res.status(400).json({ error: `Invalid ${field} format.` });
            return;
          }
        }
      }

      const arrayFields = ['custom_technologies', 'custom_highlights', 'programming_languages', 'frameworks', 'ai_tools', 'screenshots'];
      for (const field of arrayFields) {
        if (updates[field] !== undefined && (!Array.isArray(updates[field]) || updates[field].some((item: unknown) => typeof item !== 'string'))) {
          res.status(400).json({ error: `${field} must be an array of strings.` });
          return;
        }
        if (updates.screenshots?.some((value: string) => !/^https?:\/\//i.test(value))) {
          res.status(400).json({ error: 'Screenshot links must use http or https URLs.' });
          return;
        }
      }

      const existing = await store.getById(id);
      if (!existing) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      const next = { ...existing, ...updates };
      if (next.approval_status !== 'approved' && next.is_published) {
        res.status(400).json({ error: 'Only approved projects can be published.' });
        return;
      }
      if (!next.is_published && next.is_visible) {
        res.status(400).json({ error: 'A project must be published before it can be visible.' });
        return;
      }
      if (next.is_private && (next.is_published || next.is_visible)) {
        res.status(400).json({ error: 'Private projects cannot be published or visible.' });
        return;
      }
      if (next.approval_status === 'rejected') {
        updates.is_published = false;
        updates.is_visible = false;
      }

      const updated = await store.update(id, updates);

      res.json(updated);
    } catch (err: any) {
      handleServerError(res, 500, 'Failed to update project', err);
    }
  });

  /**
   * Approve a Pending Repository
   * Note: Approving does NOT automatically make it published or visible unless specified!
   */
  router.post('/admin/projects/:id/approve', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await store.update(id, { approval_status: 'approved' });
      if (!updated) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json({
        success: true,
        message: `Project '${updated.custom_title || updated.repo_name}' approved. Set publication and visibility to expose publicly.`,
        project: updated,
      });
    } catch (err: any) {
      handleServerError(res, 500, 'Approval failed', err);
    }
  });

  /**
   * Reject a Pending Repository
   */
  router.post('/admin/projects/:id/reject', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await store.update(id, {
        approval_status: 'rejected',
        is_published: false,
        is_visible: false,
      });
      if (!updated) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json({
        success: true,
        message: `Project '${updated.repo_name}' rejected.`,
        project: updated,
      });
    } catch (err: any) {
      handleServerError(res, 500, 'Rejection failed', err);
    }
  });

  /**
   * Publish Project to Live Portfolio
   */
  router.post('/admin/projects/:id/publish', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await store.getById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      if (project.approval_status !== 'approved') {
        res.status(400).json({
          error: 'Cannot publish unapproved project. Approve the project first.',
        });
        return;
      }

      const updated = await store.update(id, {
        is_published: true,
        is_visible: true,
      });

      res.json({
        success: true,
        message: `Project '${updated?.custom_title || updated?.repo_name}' published to live portfolio.`,
        project: updated,
      });
    } catch (err: any) {
      handleServerError(res, 500, 'Publish failed', err);
    }
  });

  /**
   * Unpublish Project from Live Portfolio
   */
  router.post('/admin/projects/:id/unpublish', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await store.update(id, { is_published: false, is_visible: false });
      if (!updated) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json({
        success: true,
        message: `Project '${updated.custom_title || updated.repo_name}' unpublished to draft status.`,
        project: updated,
      });
    } catch (err: any) {
      handleServerError(res, 500, 'Unpublish failed', err);
    }
  });

  /**
   * Reorder Projects
   */
  router.post('/admin/projects/reorder', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { orders } = req.body as { orders: { id: string; display_order: number }[] };
      if (!Array.isArray(orders)) {
        res.status(400).json({ error: 'orders array is required [{ id, display_order }]' });
        return;
      }

      for (const item of orders) {
        await store.update(item.id, { display_order: item.display_order });
      }

      res.json({ success: true, message: 'Projects reordered successfully.' });
    } catch (err: any) {
      handleServerError(res, 500, 'Reorder failed', err);
    }
  });

  /**
   * Delete Project
   */
  router.delete('/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await store.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json({ success: true, message: 'Project removed.' });
    } catch (err: any) {
      handleServerError(res, 500, 'Delete failed', err);
    }
  });

  return router;
}
