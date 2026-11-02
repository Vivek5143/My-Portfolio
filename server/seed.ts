import { PROJECTS } from '../src/constants';
import { ManagedProject } from '../src/types';

/**
 * Seed initial projects from constants.ts so existing portfolio projects are never lost
 * and remain approved, published, visible, and featured with all their curated highlights.
 */
export function getInitialSeedProjects(githubUsername: string = 'Vivek5143'): ManagedProject[] {
  const now = new Date().toISOString();

  return PROJECTS.map((p, index) => {
    // Extract repository name from link if it belongs to this GitHub account
    let repoName = p.title.replace(/\s+/g, '-');
    let repoFullName = `${githubUsername}/${repoName}`;
    let githubUrl = p.link || `https://github.com/${githubUsername}/${repoName}`;

    if (p.link && p.link.includes('github.com')) {
      const parts = p.link.replace(/\/$/, '').split('/');
      if (parts.length >= 2) {
        repoName = parts[parts.length - 1];
        repoFullName = `${parts[parts.length - 2]}/${repoName}`;
      }
    }

    return {
      id: `seed-${repoName.toLowerCase()}`,
      github_id: null, // Will be linked when GitHub sync executes
      repo_name: repoName,
      repo_full_name: repoFullName,
      github_url: githubUrl,
      default_branch: 'main',
      stars_count: 0,
      forks_count: 0,
      open_issues_count: 0,
      language: p.technologies[0] || 'Python',
      topics: p.technologies.slice(0, 5),
      readme_content: null,
      is_private: false,
      is_fork: false,
      is_archived: false,
      github_created_at: null,
      github_updated_at: null,
      github_pushed_at: null,

      // Curated overrides from existing portfolio
      custom_title: p.title,
      custom_description: p.description,
      custom_technologies: p.technologies,
      custom_highlights: p.highlights,
      demo_url: p.demoLink || null,
      thumbnail_url: null,

      // Workflow & publication flags
      approval_status: 'approved',
      is_published: true,
      is_visible: true,
      is_featured: true,
      display_order: index + 1,

      last_synced_at: null,
      created_at: now,
      updated_at: now,
      is_deleted_on_github: false,
    };
  });
}
