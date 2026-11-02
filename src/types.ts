export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  highlights: string[];
  link?: string;
  demoLink?: string;
  // Extended fields for synced & managed projects
  id?: string;
  githubId?: number | null;
  repoName?: string;
  starsCount?: number;
  forksCount?: number;
  language?: string | null;
  approvalStatus?: ApprovalStatus;
  isPublished?: boolean;
  isVisible?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  lastSyncedAt?: string | null;
  updatedAt?: string;
}

export interface ManagedProject {
  id: string; // Unique persistent ID
  github_id: number | null; // GitHub repository ID (null if manually curated)
  repo_name: string; // e.g. "AtlasAI"
  repo_full_name: string; // e.g. "Vivek5143/AtlasAI"
  github_url: string; // e.g. "https://github.com/Vivek5143/AtlasAI"
  default_branch: string; // e.g. "main"
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  readme_content?: string | null;
  is_private: boolean;
  is_fork: boolean;
  is_archived: boolean;
  github_created_at?: string | null;
  github_updated_at?: string | null;
  github_pushed_at?: string | null;

  // Curated / Manual overrides
  custom_title?: string | null;
  custom_description?: string | null;
  custom_technologies?: string[] | null;
  custom_highlights?: string[] | null;
  demo_url?: string | null;
  thumbnail_url?: string | null;

  // Management controls
  approval_status: ApprovalStatus;
  is_published: boolean;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;

  // Sync and lifecycle timestamps
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted_on_github?: boolean;
}

export interface SyncResult {
  totalFound: number;
  newDiscovered: number;
  updatedExisting: number;
  deletedDetected: number;
  errors: string[];
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}

export interface AdminStats {
  totalProjects: number;
  pendingApproval: number;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
  visibleCount: number;
  featuredCount: number;
  lastSyncedAt: string | null;
  githubUsername: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

