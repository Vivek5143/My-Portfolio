import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileProjectStore } from '../server/db';
import { GitHubService, GitHubRepoItem } from '../server/github';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('GitHub Repository Synchronization & Metadata Safety', () => {
  let store: FileProjectStore;
  let testDataDir: string;

  beforeEach(async () => {
    testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-sync-'));
    store = new FileProjectStore(testDataDir);
    await store.init();
  });

  afterEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  it('correctly discovers newly created repositories and places them in the pending-approval queue', async () => {
    const service = new GitHubService();

    // Mock fetchRepositories
    const mockRepo: GitHubRepoItem = {
      id: 9991234,
      name: 'Agentic-Cognition-Engine',
      full_name: 'Vivek5143/Agentic-Cognition-Engine',
      html_url: 'https://github.com/Vivek5143/Agentic-Cognition-Engine',
      description: 'An autonomous multi-agent cognitive architecture with dynamic tool routing.',
      fork: false,
      private: false,
      archived: false,
      default_branch: 'main',
      stargazers_count: 42,
      forks_count: 5,
      open_issues_count: 1,
      language: 'Python',
      topics: ['agentic-ai', 'langchain', 'autonomous-agents'],
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-03-02T12:00:00Z',
      pushed_at: '2026-03-02T12:00:00Z',
    };

    service.fetchRepositories = async () => ({
      repos: [mockRepo],
      rateLimitRemaining: 4999,
      rateLimitReset: Math.floor(Date.now() / 1000) + 3600,
    });
    service.fetchReadme = async () => 'Mock README content';

    const result = await service.sync(store, { username: 'Vivek5143' });

    expect(result.newDiscovered).toBe(1);
    expect(result.errors).toHaveLength(0);

    const created = await store.getByGithubId(9991234);
    expect(created).not.toBeNull();
    expect(created?.repo_name).toBe('Agentic-Cognition-Engine');

    // CRITICAL WORKFLOW RULES VERIFICATION:
    expect(created?.approval_status).toBe('pending'); // Must be in pending queue
    expect(created?.is_published).toBe(false);       // Must NOT be published
    expect(created?.is_visible).toBe(false);         // Must NOT be visible publicly
    expect(created?.is_featured).toBe(false);

    // Verify it is NOT returned in public portfolio API!
    const publicProjects = await store.getPublicProjects();
    const publicMatch = publicProjects.find(p => p.repoName === 'Agentic-Cognition-Engine');
    expect(publicMatch).toBeUndefined();
  });

  it('updates GitHub metadata WITHOUT overwriting manual edits, highlights, or custom descriptions', async () => {
    const service = new GitHubService();

    // 1. First sync or manual creation
    const initial = await store.create({
      github_id: 888123,
      repo_name: 'AtlasAI',
      repo_full_name: 'Vivek5143/AtlasAI',
      github_url: 'https://github.com/Vivek5143/AtlasAI',
      default_branch: 'main',
      stars_count: 10,
      forks_count: 2,
      open_issues_count: 0,
      language: 'Python',
      topics: ['fastapi', 'rag'],
      readme_content: null,
      is_private: false,
      is_fork: false,
      is_archived: false,
      custom_title: 'AtlasAI - Enterprise Intelligence Platform',
      custom_description: 'Hand-crafted executive description for portfolio visitors.',
      custom_technologies: ['FastAPI', 'Custom RAG', 'PostgreSQL'],
      custom_highlights: [
        'Built full RAG pipeline with FAISS vector store and BAAI embeddings.',
        'Designed scalable Clean Architecture REST API in FastAPI.',
      ],
      demo_url: 'https://atlas-ai.demo.app',
      thumbnail_url: null,
      approval_status: 'approved',
      is_published: true,
      is_visible: true,
      is_featured: true,
      display_order: 1,
      last_synced_at: null,
      is_deleted_on_github: false,
    });

    // 2. Mock GitHub sync returning updated GitHub stats
    const updatedGitHubRepo: GitHubRepoItem = {
      id: 888123,
      name: 'AtlasAI',
      full_name: 'Vivek5143/AtlasAI',
      html_url: 'https://github.com/Vivek5143/AtlasAI',
      description: 'Auto-generated GitHub description that should not overwrite custom one',
      fork: false,
      private: false,
      archived: false,
      default_branch: 'main',
      stargazers_count: 150, // Stars increased!
      forks_count: 25,       // Forks increased!
      open_issues_count: 3,
      language: 'Python',
      topics: ['fastapi', 'rag', 'production'],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
      pushed_at: '2026-03-01T00:00:00Z',
    };

    service.fetchRepositories = async () => ({
      repos: [updatedGitHubRepo],
    });

    const result = await service.sync(store, { username: 'Vivek5143' });
    expect(result.updatedExisting).toBe(1);

    // 3. Verify that manual curation was PRESERVED while GitHub telemetry was updated
    const afterSync = await store.getById(initial.id);
    expect(afterSync).not.toBeNull();
    expect(afterSync?.stars_count).toBe(150); // Updated from GitHub
    expect(afterSync?.forks_count).toBe(25);  // Updated from GitHub

    // MANUAL OVERRIDES MUST REMAIN INTACT:
    expect(afterSync?.custom_title).toBe('AtlasAI - Enterprise Intelligence Platform');
    expect(afterSync?.custom_description).toBe('Hand-crafted executive description for portfolio visitors.');
    expect(afterSync?.custom_highlights).toEqual([
      'Built full RAG pipeline with FAISS vector store and BAAI embeddings.',
      'Designed scalable Clean Architecture REST API in FastAPI.',
    ]);
    expect(afterSync?.demo_url).toBe('https://atlas-ai.demo.app');
    expect(afterSync?.approval_status).toBe('approved');
    expect(afterSync?.is_published).toBe(true);
    expect(afterSync?.is_visible).toBe(true);
    expect(afterSync?.is_featured).toBe(true);
    expect(afterSync?.display_order).toBe(1);
  });

  it('detects duplicate repositories and avoids creating duplicate entries', async () => {
    const service = new GitHubService();

    const mockRepo: GitHubRepoItem = {
      id: 555666,
      name: 'Duplicate-Test-Repo',
      full_name: 'Vivek5143/Duplicate-Test-Repo',
      html_url: 'https://github.com/Vivek5143/Duplicate-Test-Repo',
      description: 'Testing duplicate avoidance',
      fork: false,
      private: false,
      archived: false,
      default_branch: 'main',
      stargazers_count: 5,
      forks_count: 0,
      open_issues_count: 0,
      language: 'TypeScript',
      topics: [],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      pushed_at: '2026-01-01T00:00:00Z',
    };

    service.fetchRepositories = async () => ({
      repos: [mockRepo],
    });

    // Run first sync
    const res1 = await service.sync(store, { username: 'Vivek5143' });
    expect(res1.newDiscovered).toBe(1);

    // Run second sync with identical data
    const res2 = await service.sync(store, { username: 'Vivek5143' });
    expect(res2.newDiscovered).toBe(0);
    expect(res2.updatedExisting).toBe(1);

    // Verify only 1 project with this github_id exists
    const all = await store.getAll();
    const matching = all.filter(p => p.github_id === 555666);
    expect(matching).toHaveLength(1);
  });
});
