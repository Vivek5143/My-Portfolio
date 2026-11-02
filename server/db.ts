import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ManagedProject, Project, ApprovalStatus, AdminStats } from '../src/types';
import { config, isSupabaseConfigured, isSupabaseServiceRoleKey } from './config';
import { getInitialSeedProjects } from './seed';

export interface ProjectFilter {
  status?: ApprovalStatus;
  published?: boolean;
  visible?: boolean;
  featured?: boolean;
}

export function isPubliclyVisible(project: Pick<ManagedProject, 'approval_status' | 'is_published' | 'is_visible' | 'is_private'>): boolean {
  return project.approval_status === 'approved'
    && project.is_published
    && project.is_visible
    && !project.is_private;
}

export interface IProjectStore {
  init(): Promise<void>;
  getAll(filter?: ProjectFilter): Promise<ManagedProject[]>;
  getPublicProjects(): Promise<Project[]>;
  getById(id: string): Promise<ManagedProject | null>;
  getByGithubId(githubId: number): Promise<ManagedProject | null>;
  getByRepoName(repoName: string): Promise<ManagedProject | null>;
  create(data: Omit<ManagedProject, 'id' | 'created_at' | 'updated_at'>): Promise<ManagedProject>;
  update(id: string, updates: Partial<ManagedProject>): Promise<ManagedProject | null>;
  delete(id: string): Promise<boolean>;
  recordWebhookDelivery(deliveryId: string, event: string): Promise<boolean>;
  isWebhookProcessed(deliveryId: string): Promise<boolean>;
  getStats(githubUsername: string): Promise<AdminStats>;
}

/**
 * FileProjectStore: Persistent file-based store with atomic JSON writes
 * Perfect for local dev and self-contained environments.
 */
export class FileProjectStore implements IProjectStore {
  private filePath: string;
  private deliveriesFilePath: string;
  private projects: Map<string, ManagedProject> = new Map();
  private deliveries: Set<string> = new Set();
  private initialized = false;

  constructor(dataDir?: string) {
    const dir = dataDir || path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.filePath = path.join(dir, 'projects.json');
    this.deliveriesFilePath = path.join(dir, 'webhook_deliveries.json');
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    // Load projects from disk or seed
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const list: ManagedProject[] = JSON.parse(raw);
        for (const item of list) {
          this.projects.set(item.id, item);
        }
      } catch (err) {
        console.error('Failed to parse projects.json, seeding defaults:', err);
        this.seed();
      }
    } else {
      this.seed();
    }

    // Load webhook deliveries
    if (fs.existsSync(this.deliveriesFilePath)) {
      try {
        const raw = fs.readFileSync(this.deliveriesFilePath, 'utf-8');
        const list: string[] = JSON.parse(raw);
        for (const id of list) {
          this.deliveries.add(id);
        }
      } catch (err) {
        console.error('Failed to parse webhook_deliveries.json:', err);
      }
    }

    this.initialized = true;
  }

  private seed(): void {
    const seedProjects = getInitialSeedProjects(config.githubUsername);
    for (const p of seedProjects) {
      this.projects.set(p.id, p);
    }
    this.saveProjects();
  }

  private saveProjects(): void {
    const list = Array.from(this.projects.values());
    const tempPath = `${this.filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.filePath);
  }

  private saveDeliveries(): void {
    const list = Array.from(this.deliveries.values());
    const tempPath = `${this.deliveriesFilePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.deliveriesFilePath);
  }

  async getAll(filter?: ProjectFilter): Promise<ManagedProject[]> {
    await this.init();
    let list = Array.from(this.projects.values());

    if (filter) {
      if (filter.status !== undefined) {
        list = list.filter(p => p.approval_status === filter.status);
      }
      if (filter.published !== undefined) {
        list = list.filter(p => p.is_published === filter.published);
      }
      if (filter.visible !== undefined) {
        list = list.filter(p => p.is_visible === filter.visible);
      }
      if (filter.featured !== undefined) {
        list = list.filter(p => p.is_featured === filter.featured);
      }
    }

    // Sort by display_order ascending, then created_at descending
    return list.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  async getPublicProjects(): Promise<Project[]> {
    await this.init();
    const managed = await this.getAll({
      status: 'approved',
      published: true,
      visible: true,
    });

    // Strip private metadata, merge custom overrides with repo data
    return managed
      .filter(isPubliclyVisible)
      .map(p => ({
        title: p.custom_title || p.repo_name,
        description: p.full_description || p.custom_description || (p.readme_content ? p.readme_content.slice(0, 160) + '...' : `Intelligent engineering platform built with ${p.language || 'modern technology'}.`),
        technologies: (p.custom_technologies && p.custom_technologies.length > 0)
          ? p.custom_technologies
          : (p.topics && p.topics.length > 0 ? p.topics : [p.language || 'Python']),
        highlights: (p.custom_highlights && p.custom_highlights.length > 0)
          ? p.custom_highlights
          : [`Automated architecture on branch ${p.default_branch} with ${p.stars_count} GitHub stars.`],
        link: p.github_url,
        demoLink: p.demo_url || undefined,
        websiteUrl: p.website_url || undefined,
        documentationUrl: p.documentation_url || undefined,
        imageUrl: p.thumbnail_url || undefined,
        screenshots: p.screenshots || [],
        category: p.category,
        projectType: p.project_type,
        id: p.id,
        githubId: p.github_id,
        repoName: p.repo_name,
        starsCount: p.stars_count,
        forksCount: p.forks_count,
        language: p.language,
        approvalStatus: p.approval_status,
        isPublished: p.is_published,
        isVisible: p.is_visible,
        isFeatured: p.is_featured,
        displayOrder: p.display_order,
        lastSyncedAt: p.last_synced_at,
        updatedAt: p.updated_at,
      }));
  }

  async getById(id: string): Promise<ManagedProject | null> {
    await this.init();
    return this.projects.get(id) || null;
  }

  async getByGithubId(githubId: number): Promise<ManagedProject | null> {
    await this.init();
    for (const p of this.projects.values()) {
      if (p.github_id === githubId) return p;
    }
    return null;
  }

  async getByRepoName(repoName: string): Promise<ManagedProject | null> {
    await this.init();
    const lower = repoName.toLowerCase();
    for (const p of this.projects.values()) {
      if (p.repo_name.toLowerCase() === lower) return p;
    }
    return null;
  }

  async create(data: Omit<ManagedProject, 'id' | 'created_at' | 'updated_at'>): Promise<ManagedProject> {
    await this.init();
    const now = new Date().toISOString();
    const id = `proj-${crypto.randomUUID()}`;
    const project: ManagedProject = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    this.projects.set(id, project);
    this.saveProjects();
    return project;
  }

  async update(id: string, updates: Partial<ManagedProject>): Promise<ManagedProject | null> {
    await this.init();
    const existing = this.projects.get(id);
    if (!existing) return null;

    const updated: ManagedProject = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID mutation
      updated_at: new Date().toISOString(),
    };

    this.projects.set(id, updated);
    this.saveProjects();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.init();
    const existed = this.projects.delete(id);
    if (existed) {
      this.saveProjects();
    }
    return existed;
  }

  async recordWebhookDelivery(deliveryId: string, event: string): Promise<boolean> {
    await this.init();
    if (this.deliveries.has(deliveryId)) {
      return false; // Already processed
    }
    this.deliveries.add(deliveryId);
    this.saveDeliveries();
    return true;
  }

  async isWebhookProcessed(deliveryId: string): Promise<boolean> {
    await this.init();
    return this.deliveries.has(deliveryId);
  }

  async getStats(githubUsername: string): Promise<AdminStats> {
    await this.init();
    const all = Array.from(this.projects.values());
    let lastSyncedAt: string | null = null;

    for (const p of all) {
      if (p.last_synced_at) {
        if (!lastSyncedAt || new Date(p.last_synced_at) > new Date(lastSyncedAt)) {
          lastSyncedAt = p.last_synced_at;
        }
      }
    }

    return {
      totalProjects: all.length,
      pendingApproval: all.filter(p => p.approval_status === 'pending').length,
      approvedCount: all.filter(p => p.approval_status === 'approved').length,
      rejectedCount: all.filter(p => p.approval_status === 'rejected').length,
      publishedCount: all.filter(p => p.is_published).length,
      visibleCount: all.filter(p => p.is_visible).length,
      featuredCount: all.filter(p => p.is_featured).length,
      lastSyncedAt,
      githubUsername,
    };
  }
}

/**
 * SupabaseProjectStore: Managed production PostgreSQL backend via Supabase
 */
export class SupabaseProjectStore implements IProjectStore {
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    if (!isSupabaseServiceRoleKey(serviceRoleKey)) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY must be a Supabase service_role JWT');
    }

    this.client = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    });
    console.log('Supabase admin client initialized with service_role credential');
  }

  async init(): Promise<void> {
    // Verify connection
    const { error } = await this.client.from('projects').select('id').limit(1);
    if (error) {
      throw new Error(`Supabase initialization failed (make sure schema.sql has run): ${error.message}`);
    }
  }

  async getAll(filter?: ProjectFilter): Promise<ManagedProject[]> {
    let query = this.client.from('projects').select('*');

    if (filter) {
      if (filter.status !== undefined) {
        query = query.eq('approval_status', filter.status);
      }
      if (filter.published !== undefined) {
        query = query.eq('is_published', filter.published);
      }
      if (filter.visible !== undefined) {
        query = query.eq('is_visible', filter.visible);
      }
      if (filter.featured !== undefined) {
        query = query.eq('is_featured', filter.featured);
      }
    }

    query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`Supabase getAll error: ${error.message}`);
    return (data || []) as ManagedProject[];
  }

  async getPublicProjects(): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('approval_status', 'approved')
      .eq('is_published', true)
      .eq('is_visible', true)
      .eq('is_private', false)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Supabase getPublicProjects error: ${error.message}`);

    const managed = (data || []) as ManagedProject[];
    return managed.map(p => ({
      title: p.custom_title || p.repo_name,
      description: p.full_description || p.custom_description || (p.readme_content ? p.readme_content.slice(0, 160) + '...' : `Intelligent engineering platform built with ${p.language || 'modern technology'}.`),
      technologies: (p.custom_technologies && p.custom_technologies.length > 0)
        ? p.custom_technologies
        : (p.topics && p.topics.length > 0 ? p.topics : [p.language || 'Python']),
      highlights: (p.custom_highlights && p.custom_highlights.length > 0)
        ? p.custom_highlights
        : [`Automated architecture on branch ${p.default_branch} with ${p.stars_count} GitHub stars.`],
      link: p.github_url,
      demoLink: p.demo_url || undefined,
      websiteUrl: p.website_url || undefined,
      documentationUrl: p.documentation_url || undefined,
      imageUrl: p.thumbnail_url || undefined,
      screenshots: p.screenshots || [],
      category: p.category,
      projectType: p.project_type,
      id: p.id,
      githubId: p.github_id,
      repoName: p.repo_name,
      starsCount: p.stars_count,
      forksCount: p.forks_count,
      language: p.language,
      approvalStatus: p.approval_status,
      isPublished: p.is_published,
      isVisible: p.is_visible,
      isFeatured: p.is_featured,
      displayOrder: p.display_order,
      lastSyncedAt: p.last_synced_at,
      updatedAt: p.updated_at,
    }));
  }

  async getById(id: string): Promise<ManagedProject | null> {
    const { data, error } = await this.client.from('projects').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Supabase getById error: ${error.message}`);
    return data as ManagedProject | null;
  }

  async getByGithubId(githubId: number): Promise<ManagedProject | null> {
    const { data, error } = await this.client.from('projects').select('*').eq('github_id', githubId).maybeSingle();
    if (error) throw new Error(`Supabase getByGithubId error: ${error.message}`);
    return data as ManagedProject | null;
  }

  async getByRepoName(repoName: string): Promise<ManagedProject | null> {
    const { data, error } = await this.client.from('projects').select('*').ilike('repo_name', repoName).maybeSingle();
    if (error) throw new Error(`Supabase getByRepoName error: ${error.message}`);
    return data as ManagedProject | null;
  }

  async create(data: Omit<ManagedProject, 'id' | 'created_at' | 'updated_at'>): Promise<ManagedProject> {
    const { data: created, error } = await this.client.from('projects').insert(data).select().single();
    if (error) throw new Error(`Supabase create error: ${error.message}`);
    return created as ManagedProject;
  }

  async update(id: string, updates: Partial<ManagedProject>): Promise<ManagedProject | null> {
    const { data, error } = await this.client.from('projects').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw new Error(`Supabase update error: ${error.message}`);
    return data as ManagedProject | null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client.from('projects').delete().eq('id', id);
    if (error) throw new Error(`Supabase delete error: ${error.message}`);
    return true;
  }

  async recordWebhookDelivery(deliveryId: string, event: string): Promise<boolean> {
    const { error } = await this.client.from('webhook_deliveries').insert({ delivery_id: deliveryId, event });
    if (error) {
      console.error('Supabase webhook delivery persistence failed', {
        code: error.code,
        message: error.message,
      });
      if (error.code === '23505') return false; // Unique violation -> already processed
      throw new Error(`Supabase recordWebhookDelivery error: ${error.message}`);
    }
    return true;
  }

  async isWebhookProcessed(deliveryId: string): Promise<boolean> {
    const { data } = await this.client.from('webhook_deliveries').select('delivery_id').eq('delivery_id', deliveryId).maybeSingle();
    return Boolean(data);
  }

  async getStats(githubUsername: string): Promise<AdminStats> {
    const all = await this.getAll();
    let lastSyncedAt: string | null = null;
    for (const p of all) {
      if (p.last_synced_at) {
        if (!lastSyncedAt || new Date(p.last_synced_at) > new Date(lastSyncedAt)) {
          lastSyncedAt = p.last_synced_at;
        }
      }
    }
    return {
      totalProjects: all.length,
      pendingApproval: all.filter(p => p.approval_status === 'pending').length,
      approvedCount: all.filter(p => p.approval_status === 'approved').length,
      rejectedCount: all.filter(p => p.approval_status === 'rejected').length,
      publishedCount: all.filter(p => p.is_published).length,
      visibleCount: all.filter(p => p.is_visible).length,
      featuredCount: all.filter(p => p.is_featured).length,
      lastSyncedAt,
      githubUsername,
    };
  }
}

// Global singleton store factory
let globalStore: IProjectStore | null = null;

export function getProjectStore(): IProjectStore {
  if (!globalStore) {
    if (isSupabaseConfigured() && config.supabaseUrl && config.supabaseServiceRoleKey) {
      console.log('⚡ Initializing SupabaseProjectStore with configured credentials');
      globalStore = new SupabaseProjectStore(config.supabaseUrl, config.supabaseServiceRoleKey);
    } else if (!config.isDev) {
      throw new Error('Supabase must be configured in production; refusing to use ephemeral file storage');
    } else {
      console.log('📁 Initializing FileProjectStore (zero-config local persistent store)');
      globalStore = new FileProjectStore();
    }
  }
  return globalStore;
}
