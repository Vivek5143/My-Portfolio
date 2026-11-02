import { ManagedProject, SyncResult } from '../src/types';
import { IProjectStore } from './db';

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  private: boolean;
  archived: boolean;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export class GitHubService {
  private userAgent = 'Portfolio-Project-Manager/1.0';

  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': this.userAgent,
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    return headers;
  }

  /**
   * Fetches all repositories for the configured account handling pagination and rate limits
   */
  async fetchRepositories(username: string, token?: string): Promise<{ repos: GitHubRepoItem[]; rateLimitRemaining?: number; rateLimitReset?: number }> {
    const repos: GitHubRepoItem[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;
    let rateLimitRemaining: number | undefined;
    let rateLimitReset: number | undefined;

    // If a personal access token is provided, we can fetch authenticated repos (including private if authorized)
    const baseUrl = token
      ? 'https://api.github.com/user/repos'
      : `https://api.github.com/users/${encodeURIComponent(username)}/repos`;

    while (hasMore) {
      const url = `${baseUrl}?per_page=${perPage}&page=${page}&sort=updated`;
      const response = await fetch(url, {
        headers: this.getHeaders(token),
      });

      const remaining = response.headers.get('x-ratelimit-remaining');
      const reset = response.headers.get('x-ratelimit-reset');
      if (remaining) rateLimitRemaining = parseInt(remaining, 10);
      if (reset) rateLimitReset = parseInt(reset, 10);

      if (!response.ok) {
        if (response.status === 403 && rateLimitRemaining === 0) {
          const resetDate = rateLimitReset ? new Date(rateLimitReset * 1000).toLocaleTimeString() : 'soon';
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}. Provide a GITHUB_TOKEN to increase rate limits to 5,000/hr.`);
        }
        if (response.status === 404) {
          throw new Error(`GitHub user or organization '${username}' not found.`);
        }
        throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
      }

      const data = (await response.json()) as GitHubRepoItem[];
      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
        break;
      }

      // Filter to only repositories owned by this user
      for (const repo of data) {
        const ownerLogin = repo.full_name.split('/')[0];
        if (ownerLogin.toLowerCase() === username.toLowerCase()) {
          repos.push(repo);
        }
      }

      // Check pagination header or page length
      const linkHeader = response.headers.get('link');
      if (!linkHeader || !linkHeader.includes('rel="next"') || data.length < perPage) {
        hasMore = false;
      } else {
        page++;
        // Safety cap to avoid infinite loops
        if (page > 10) hasMore = false;
      }
    }

    return { repos, rateLimitRemaining, rateLimitReset };
  }

  /**
   * Safely fetches repository README content, stripping dangerous scripts and truncating
   */
  async fetchReadme(fullName: string, token?: string): Promise<string | null> {
    try {
      const url = `https://api.github.com/repos/${fullName}/readme`;
      const response = await fetch(url, {
        headers: {
          ...this.getHeaders(token),
          'Accept': 'application/vnd.github.v3.raw',
        },
      });

      if (!response.ok) return null;
      const text = await response.text();

      // Basic sanitization: strip script tags and limit to 4000 characters
      const clean = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .trim();

      return clean.length > 4000 ? clean.slice(0, 4000) + '...' : clean;
    } catch {
      return null;
    }
  }

  /**
   * Synchronize repositories from GitHub into the store
   * Detects new repos -> adds to pending approval queue
   * Updates existing metadata without destroying manual edits
   */
  async sync(store: IProjectStore, options: { username: string; token?: string }): Promise<SyncResult> {
    const errors: string[] = [];
    let totalFound = 0;
    let newDiscovered = 0;
    let updatedExisting = 0;
    let deletedDetected = 0;
    let rateLimitRemaining: number | undefined;
    let rateLimitReset: number | undefined;

    try {
      const result = await this.fetchRepositories(options.username, options.token);
      totalFound = result.repos.length;
      rateLimitRemaining = result.rateLimitRemaining;
      rateLimitReset = result.rateLimitReset;

      const discoveredGithubIds = new Set<number>();
      const now = new Date().toISOString();

      for (const repo of result.repos) {
        discoveredGithubIds.add(repo.id);

        // Check if repo already exists by github_id or repo_name
        let existing = await store.getByGithubId(repo.id);
        if (!existing) {
          existing = await store.getByRepoName(repo.name);
        }

        if (existing) {
          // Update GitHub metadata while strictly preserving manual overrides
          await store.update(existing.id, {
            github_id: repo.id,
            repo_name: repo.name,
            repo_full_name: repo.full_name,
            github_url: repo.html_url,
            default_branch: repo.default_branch,
            stars_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            open_issues_count: repo.open_issues_count,
            language: repo.language,
            topics: repo.topics && repo.topics.length > 0 ? repo.topics : existing.topics,
            is_private: repo.private,
            is_fork: repo.fork,
            is_archived: repo.archived,
            github_created_at: repo.created_at,
            github_updated_at: repo.updated_at,
            github_pushed_at: repo.pushed_at,
            last_synced_at: now,
            is_deleted_on_github: false,
            // Notice: custom_title, custom_description, custom_technologies,
            // custom_highlights, demo_url, approval_status, is_published,
            // is_visible, is_featured, display_order are PRESERVED!
          });
          updatedExisting++;
        } else {
          // Newly discovered repository:
          // 1. Add to pending-approval queue
          // 2. Keep unpublished and invisible until reviewed and approved
          let readme: string | null = null;
          try {
            readme = await this.fetchReadme(repo.full_name, options.token);
          } catch {
            // README fetch failure is non-fatal
          }

          const defaultTech = repo.topics && repo.topics.length > 0
            ? repo.topics
            : (repo.language ? [repo.language] : ['Python']);

          await store.create({
            github_id: repo.id,
            repo_name: repo.name,
            repo_full_name: repo.full_name,
            github_url: repo.html_url,
            default_branch: repo.default_branch,
            stars_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            open_issues_count: repo.open_issues_count,
            language: repo.language,
            topics: repo.topics || [],
            readme_content: readme,
            is_private: repo.private,
            is_fork: repo.fork,
            is_archived: repo.archived,
            github_created_at: repo.created_at,
            github_updated_at: repo.updated_at,
            github_pushed_at: repo.pushed_at,

            // Manual overrides start populated with repo defaults
            custom_title: repo.name,
            custom_description: repo.description || 'Newly discovered AI/Engineering repository on GitHub.',
            custom_technologies: defaultTech,
            custom_highlights: [
              `Repository discovered from GitHub (${repo.stargazers_count} stars, ${repo.default_branch} branch).`,
            ],
            demo_url: null,
            thumbnail_url: null,

            // CRITICAL WORKFLOW RULES:
            approval_status: 'pending', // PENDING APPROVAL QUEUE
            is_published: false,        // UNPUBLISHED DRAFT
            is_visible: false,          // NOT VISIBLE PUBLICLY
            is_featured: false,
            display_order: 100,

            last_synced_at: now,
            is_deleted_on_github: false,
          });

          newDiscovered++;
        }
      }

      // Check for deleted repositories in store
      const allProjects = await store.getAll();
      for (const p of allProjects) {
        if (p.github_id && !discoveredGithubIds.has(p.github_id)) {
          // Repository was not returned in GitHub user list
          await store.update(p.id, { is_deleted_on_github: true });
          deletedDetected++;
        }
      }

    } catch (err: any) {
      errors.push(err.message || 'Unknown GitHub synchronization error');
    }

    return {
      totalFound,
      newDiscovered,
      updatedExisting,
      deletedDetected,
      errors,
      rateLimitRemaining,
      rateLimitReset,
    };
  }
}

export const githubService = new GitHubService();
