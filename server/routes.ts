import { Router, Request, Response } from 'express';
import { getProjectStore, IProjectStore } from './db';
import { githubService } from './github';
import { verifyGitHubSignature, processWebhookEvent } from './webhook';
import { requireAdminAuth, generateAdminToken, verifyAdminCredentials } from './auth';
import { config, isSupabaseConfigured, isWebhookConfigured, isGitHubTokenConfigured } from './config';
import { ApprovalStatus } from '../src/types';

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
      res.status(500).json({ status: 'error', message: err.message });
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
      res.status(500).json({
        error: 'Failed to retrieve public portfolio projects',
        message: err.message,
      });
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

      if (!username || !password) {
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
      res.status(500).json({ error: 'Login failure', message: err.message });
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

    if (config.githubWebhookSecret) {
      const isValid = verifyGitHubSignature(rawBody, signature, config.githubWebhookSecret);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid webhook signature.' });
        return;
      }
    } else if (!config.isDev) {
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
      res.status(500).json({ error: 'Webhook processing error', message: err.message });
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
      res.status(500).json({ error: 'Failed to fetch admin projects', message: err.message });
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
      res.status(500).json({ error: 'Failed to fetch stats', message: err.message });
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
      res.status(500).json({ error: 'Synchronization failed', message: err.message });
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
        technologies,
        highlights,
        demo_url,
        github_url,
        thumbnail_url,
        is_published,
        is_visible,
        is_featured,
      } = req.body;

      if (!title) {
        res.status(400).json({ error: 'Title is required for manual project.' });
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
        is_private: false,
        is_fork: false,
        is_archived: false,
        github_created_at: null,
        github_updated_at: null,
        github_pushed_at: null,

        custom_title: title,
        custom_description: description || '',
        custom_technologies: technologies || [],
        custom_highlights: highlights || [],
        demo_url: demo_url || null,
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
      res.status(500).json({ error: 'Failed to create project', message: err.message });
    }
  });

  /**
   * Update Project Overrides and Controls
   */
  router.patch('/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate URL fields if provided
      if (updates.demo_url && typeof updates.demo_url === 'string') {
        try {
          new URL(updates.demo_url);
        } catch {
          res.status(400).json({ error: 'Invalid demo_url format. Must be a valid URL.' });
          return;
        }
      }

      const updated = await store.update(id, updates);
      if (!updated) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update project', message: err.message });
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
      res.status(500).json({ error: 'Approval failed', message: err.message });
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
      res.status(500).json({ error: 'Rejection failed', message: err.message });
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
      res.status(500).json({ error: 'Publish failed', message: err.message });
    }
  });

  /**
   * Unpublish Project from Live Portfolio
   */
  router.post('/admin/projects/:id/unpublish', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await store.update(id, { is_published: false });
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
      res.status(500).json({ error: 'Unpublish failed', message: err.message });
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
      res.status(500).json({ error: 'Reorder failed', message: err.message });
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
      res.status(500).json({ error: 'Delete failed', message: err.message });
    }
  });

  return router;
}
