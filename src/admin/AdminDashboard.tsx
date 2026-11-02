import React, { useState, useEffect } from 'react';
import {
  Github,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
  Edit3,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  LogOut,
  ArrowLeft,
  Sparkles,
  Layers,
  Globe,
  Lock,
  Search,
  AlertCircle,
  Check,
  X,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ManagedProject, Project, ApprovalStatus, AdminStats, SyncResult } from '../types';
import { SpotlightCard } from '../components/SpotlightCard';
import { apiFetch } from '../lib/api';

interface AdminDashboardProps {
  onExit: () => void;
}

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('portfolio_admin_token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'published' | 'featured' | 'drafts' | 'private'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [syncSummary, setSyncSummary] = useState<SyncResult | null>(null);

  // Modals state
  const [editingProject, setEditingProject] = useState<ManagedProject | null>(null);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [previewProject, setPreviewProject] = useState<ManagedProject | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'reject' | 'delete' | 'unpublish';
    project: ManagedProject;
  } | null>(null);

  // Form State for Edit/Create
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formProjectType, setFormProjectType] = useState('');
  const [formTechnologies, setFormTechnologies] = useState('');
  const [formLanguages, setFormLanguages] = useState('');
  const [formFrameworks, setFormFrameworks] = useState('');
  const [formAiTools, setFormAiTools] = useState('');
  const [formHighlights, setFormHighlights] = useState<string[]>(['']);
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formDocumentationUrl, setFormDocumentationUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formScreenshots, setFormScreenshots] = useState('');
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formIsApproved, setFormIsApproved] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formOrder, setFormOrder] = useState(50);

  // Base API caller with auth headers
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await apiFetch(endpoint, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Token expired or invalid
      setToken(null);
      localStorage.removeItem('portfolio_admin_token');
      throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed (${res.status})`);
    }
    return data;
  };

  // Fetch projects and stats
  const loadData = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [projectsData, statsData] = await Promise.all([
        apiCall('/api/admin/projects'),
        apiCall('/api/admin/stats'),
      ]);
      setProjects(projectsData);
      setStats(statsData);

      // Default to pending tab if pending items exist, else all
      if (statsData.pendingApproval > 0) {
        setActiveTab('pending');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('portfolio_admin_token', data.token);
      setToken(data.token);
      setPassword('');
      setFeedback({ type: 'success', message: 'Logged in successfully.' });
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('portfolio_admin_token');
    setToken(null);
    setProjects([]);
    setStats(null);
    setFeedback({ type: 'info', message: 'Signed out of admin dashboard.' });
  };

  // Trigger GitHub Synchronization
  const handleSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    setSyncSummary(null);
    try {
      const res = await apiCall('/api/admin/sync', { method: 'POST' });
      setSyncSummary(res.result);
      setFeedback({
        type: 'success',
        message: `GitHub Sync Completed: ${res.result.newDiscovered} new repositories detected!`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Sync failed: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // Approve Project
  const handleApprove = async (project: ManagedProject) => {
    try {
      const res = await apiCall(`/api/admin/projects/${project.id}/approve`, { method: 'POST' });
      setFeedback({ type: 'success', message: res.message });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Reject Project
  const handleRejectConfirm = async () => {
    if (!confirmAction) return;
    try {
      const res = await apiCall(`/api/admin/projects/${confirmAction.project.id}/reject`, { method: 'POST' });
      setFeedback({ type: 'success', message: res.message });
      setConfirmAction(null);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (project: ManagedProject) => {
    try {
      const nextVisible = !project.is_visible;
      await apiCall(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_visible: nextVisible }),
      });
      setFeedback({
        type: 'success',
        message: `${project.custom_title || project.repo_name} is now ${nextVisible ? 'visible on' : 'hidden from'} portfolio.`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (project: ManagedProject) => {
    try {
      const nextFeatured = !project.is_featured;
      await apiCall(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_featured: nextFeatured }),
      });
      setFeedback({
        type: 'success',
        message: `${project.custom_title || project.repo_name} ${nextFeatured ? 'marked as Featured' : 'removed from Featured'}.`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Publish / Unpublish
  const handleTogglePublish = async (project: ManagedProject) => {
    try {
      if (!project.is_published) {
        const res = await apiCall(`/api/admin/projects/${project.id}/publish`, { method: 'POST' });
        setFeedback({ type: 'success', message: res.message });
      } else {
        const res = await apiCall(`/api/admin/projects/${project.id}/unpublish`, { method: 'POST' });
        setFeedback({ type: 'success', message: res.message });
      }
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Reorder Projects (Shift up/down)
  const handleReorder = async (project: ManagedProject, direction: 'up' | 'down') => {
    const list = [...projects].sort((a, b) => a.display_order - b.display_order);
    const index = list.findIndex(p => p.id === project.id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const currentItem = list[index];
    const targetItem = list[targetIndex];

    const currentOrder = currentItem.display_order;
    const targetOrder = targetItem.display_order;

    try {
      await apiCall('/api/admin/projects/reorder', {
        method: 'POST',
        body: JSON.stringify({
          orders: [
            { id: currentItem.id, display_order: targetOrder },
            { id: targetItem.id, display_order: currentOrder },
          ],
        }),
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Delete Project
  const handleDeleteConfirm = async () => {
    if (!confirmAction) return;
    try {
      await apiCall(`/api/admin/projects/${confirmAction.project.id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Project removed.' });
      setConfirmAction(null);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Open Edit Modal
  const openEditModal = (project: ManagedProject) => {
    setEditingProject(project);
    setFormTitle(project.custom_title || project.repo_name);
    setFormDescription(project.custom_description || '');
    setFormFullDescription(project.full_description || '');
    setFormCategory(project.category || '');
    setFormProjectType(project.project_type || '');
    setFormTechnologies((project.custom_technologies || project.topics || []).join(', '));
    setFormLanguages((project.programming_languages || []).join(', '));
    setFormFrameworks((project.frameworks || []).join(', '));
    setFormAiTools((project.ai_tools || []).join(', '));
    setFormHighlights(
      project.custom_highlights && project.custom_highlights.length > 0
        ? [...project.custom_highlights]
        : ['']
    );
    setFormDemoUrl(project.demo_url || '');
    setFormGithubUrl(project.github_url || '');
    setFormWebsiteUrl(project.website_url || '');
    setFormDocumentationUrl(project.documentation_url || '');
    setFormThumbnailUrl(project.thumbnail_url || '');
    setFormScreenshots((project.screenshots || []).join(', '));
    setFormIsVisible(project.is_visible);
    setFormIsPublished(project.is_published);
    setFormIsPrivate(project.is_private);
    setFormIsApproved(project.approval_status === 'approved');
    setFormIsFeatured(project.is_featured);
    setFormOrder(project.display_order);
  };

  // Open Create Manual Modal
  const openCreateModal = () => {
    setIsCreatingManual(true);
    setFormTitle('');
    setFormDescription('');
    setFormFullDescription('');
    setFormCategory('');
    setFormProjectType('');
    setFormTechnologies('React, TypeScript, FastAPI');
    setFormLanguages('TypeScript');
    setFormFrameworks('React');
    setFormAiTools('');
    setFormHighlights(['Production system architecture', 'Engineered custom RAG pipeline']);
    setFormDemoUrl('');
    setFormGithubUrl('');
    setFormWebsiteUrl('');
    setFormDocumentationUrl('');
    setFormThumbnailUrl('');
    setFormScreenshots('');
    setFormIsVisible(true);
    setFormIsPublished(true);
    setFormIsPrivate(false);
    setFormIsApproved(true);
    setFormIsFeatured(false);
    setFormOrder(50);
  };

  // Save Edit / Create Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const techArray = formTechnologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const highlightsArray = formHighlights
        .map(h => h.trim())
        .filter(Boolean);
      const list = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean);
      if (formIsPrivate && (formIsPublished || formIsVisible)) {
        throw new Error('Private projects cannot be published or visible.');
      }
      if (!formIsApproved && formIsPublished) {
        throw new Error('Only approved projects can be published.');
      }

      if (editingProject) {
        await apiCall(`/api/admin/projects/${editingProject.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            custom_title: formTitle,
            custom_description: formDescription,
            full_description: formFullDescription.trim() || null,
            category: formCategory.trim() || null,
            project_type: formProjectType.trim() || null,
            custom_technologies: techArray,
            custom_highlights: highlightsArray,
            programming_languages: list(formLanguages),
            frameworks: list(formFrameworks),
            ai_tools: list(formAiTools),
            demo_url: formDemoUrl.trim() || null,
            github_url: formGithubUrl.trim() || editingProject.github_url,
            website_url: formWebsiteUrl.trim() || null,
            documentation_url: formDocumentationUrl.trim() || null,
            thumbnail_url: formThumbnailUrl.trim() || null,
            screenshots: list(formScreenshots),
            approval_status: formIsApproved ? 'approved' : 'pending',
            is_private: formIsPrivate,
            is_visible: formIsVisible,
            is_published: formIsPublished,
            is_featured: formIsFeatured,
            display_order: Number(formOrder),
          }),
        });
        setFeedback({ type: 'success', message: `Saved changes to '${formTitle}'.` });
        setEditingProject(null);
      } else if (isCreatingManual) {
        await apiCall('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            full_description: formFullDescription.trim() || null,
            category: formCategory.trim() || null,
            project_type: formProjectType.trim() || null,
            technologies: techArray,
            highlights: highlightsArray,
            programming_languages: list(formLanguages),
            frameworks: list(formFrameworks),
            ai_tools: list(formAiTools),
            demo_url: formDemoUrl.trim() || null,
            github_url: formGithubUrl.trim() || '',
            website_url: formWebsiteUrl.trim() || null,
            documentation_url: formDocumentationUrl.trim() || null,
            thumbnail_url: formThumbnailUrl.trim() || null,
            screenshots: list(formScreenshots),
            is_visible: formIsVisible,
            is_published: formIsPublished,
            is_featured: formIsFeatured,
            is_private: formIsPrivate,
          }),
        });
        setFeedback({ type: 'success', message: `Created project '${formTitle}'.` });
        setIsCreatingManual(false);
      }
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Filter projects according to tab and search
  const filteredProjects = projects.filter(p => {
    // Search filter
    const matchesSearch =
      p.repo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.custom_title && p.custom_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.language && p.language.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'pending') {
      return p.approval_status === 'pending';
    }
    if (activeTab === 'published') {
      return p.approval_status === 'approved' && p.is_published && p.is_visible && !p.is_private;
    }
    if (activeTab === 'featured') {
      return p.is_featured;
    }
    if (activeTab === 'drafts') {
      return p.approval_status === 'rejected' || (!p.is_published && p.approval_status === 'approved');
    }
    if (activeTab === 'private') return p.is_private;
    return true; // 'all'
  });

  // Render Login Screen if not authenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-[#050816] text-[#e2e8f0] flex items-center justify-center p-6 relative font-sans">
        <div className="absolute top-0 left-0 w-full h-[400px] radial-glow pointer-events-none z-0" />

        <div className="w-full max-w-md bg-[#0a0f26]/90 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Portfolio
            </button>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7C3AED]/15 text-[#a78bfa] border border-[#7C3AED]/20 text-xs font-mono">
              <ShieldCheck size={12} />
              <span>Admin Access</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white shadow-lg mb-4">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Portfolio Command Center</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in with administrative credentials</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] transition-colors text-sm"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] transition-colors text-sm"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:from-[#6D28D9] hover:to-[#2563EB] text-white font-semibold shadow-lg shadow-[#7C3AED]/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <Lock size={16} /> Sign In to Command Center
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Protected with server-side JWT authentication & Row Level Security
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-[#e2e8f0] pb-24 font-sans selection:bg-[#7C3AED]/30 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050816]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-mono"
              title="Return to Public Portfolio"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Portfolio</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white font-mono font-bold text-sm">
                ⚡
              </span>
              <span className="font-bold text-white text-lg tracking-tight">VD.AI Admin</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono">
                {stats?.githubUsername || 'Vivek5143'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white text-xs font-mono font-semibold flex items-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Project</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : feedback.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' && <CheckCircle size={18} />}
              {feedback.type === 'error' && <AlertCircle size={18} />}
              {feedback.type === 'info' && <Sparkles size={18} />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Sync Summary Alert */}
        {syncSummary && (
          <div className="mb-8 p-4 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#c4b5fd] text-xs font-mono flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#a78bfa]" />
              <span>
                Synchronization Report: {syncSummary.totalFound} repositories checked •{' '}
                <strong className="text-emerald-400">{syncSummary.newDiscovered} new</strong> •{' '}
                {syncSummary.updatedExisting} updated •{' '}
                {syncSummary.deletedDetected} removed on GitHub.
              </span>
            </div>
            {syncSummary.rateLimitRemaining !== undefined && (
              <span className="text-gray-400">
                GitHub API Rate Limit: {syncSummary.rateLimitRemaining} remaining
              </span>
            )}
          </div>
        )}

        {/* Pending Repositories Alert Notification */}
        {stats && stats.pendingApproval > 0 && activeTab !== 'pending' && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span>
                <strong>{stats.pendingApproval} newly discovered repository</strong> awaiting your approval!
              </span>
            </div>
            <button
              onClick={() => setActiveTab('pending')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-mono font-semibold hover:bg-amber-500/30 transition-colors"
            >
              Review Pending Queue →
            </button>
          </div>
        )}

        {/* Metrics KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Total Repos</span>
              <div className="text-3xl font-extrabold text-white">{stats.totalProjects}</div>
            </div>

            <div
              onClick={() => setActiveTab('pending')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                stats.pendingApproval > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase tracking-wider">Pending Review</span>
                {stats.pendingApproval > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <div className="text-3xl font-extrabold">{stats.pendingApproval}</div>
            </div>

            <div
              onClick={() => setActiveTab('published')}
              className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
            >
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Live Published</span>
              <div className="text-3xl font-extrabold text-emerald-400">{stats.publishedCount}</div>
            </div>

            <div
              onClick={() => setActiveTab('featured')}
              className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#7C3AED]/30 transition-all cursor-pointer"
            >
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Featured Works</span>
              <div className="text-3xl font-extrabold text-[#a78bfa]">{stats.featuredCount}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 col-span-2 lg:col-span-1">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Last Synced</span>
              <div className="text-xs font-mono text-gray-300 mt-2 flex items-center gap-1.5">
                <Clock size={12} className="text-gray-400" />
                <span>
                  {stats.lastSyncedAt
                    ? new Date(stats.lastSyncedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not synced yet'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Navigation & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Pending Queue</span>
              {stats && stats.pendingApproval > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-bold text-[10px]">
                  {stats.pendingApproval}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#7C3AED]/20 text-[#a78bfa] border border-[#7C3AED]/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Projects ({projects.length})
            </button>

            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 ${
                activeTab === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Live ({projects.filter(p => p.approval_status === 'approved' && p.is_published && p.is_visible && !p.is_private).length})
            </button>

            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 ${
                activeTab === 'featured'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Featured Order
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 ${
                activeTab === 'drafts'
                  ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Drafts / Rejected
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 ${
                activeTab === 'private'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Private
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by repo or tech..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#7C3AED] transition-colors font-mono"
            />
          </div>
        </div>

        {/* Projects List / Table */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw size={28} className="animate-spin mx-auto text-[#7C3AED] mb-4" />
            <p className="text-gray-400 text-sm font-mono">Loading managed repositories...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-24 text-center bg-white/5 border border-white/5 rounded-3xl p-8">
            <div className="inline-flex p-3 rounded-2xl bg-white/5 text-gray-400 mb-4">
              <CheckCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No projects found in this section</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              {activeTab === 'pending'
                ? 'All discovered repositories have been reviewed! Click "Sync GitHub" to check for new repositories.'
                : 'No projects match your current filter or search criteria.'}
            </p>
            {activeTab === 'pending' && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white text-xs font-mono font-semibold inline-flex items-center gap-2"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>Check GitHub Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((p, idx) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left side details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {activeTab === 'featured' && (
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-xs font-mono text-gray-400">
                        <span>#{p.display_order}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={() => handleReorder(p, 'up')}
                            disabled={idx === 0}
                            className="hover:text-white disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            onClick={() => handleReorder(p, 'down')}
                            disabled={idx === filteredProjects.length - 1}
                            className="hover:text-white disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                      </div>
                    )}

                    <h3 className="text-lg font-extrabold text-white tracking-tight">
                      {p.custom_title || p.repo_name}
                    </h3>

                    {p.custom_title && p.custom_title !== p.repo_name && (
                      <span className="text-xs font-mono text-gray-500">({p.repo_name})</span>
                    )}

                    {/* Status Badges */}
                    {p.approval_status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-semibold uppercase tracking-wider">
                        Pending Approval
                      </span>
                    )}
                    {p.approval_status === 'approved' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold uppercase tracking-wider">
                        Approved
                      </span>
                    )}
                    {p.approval_status === 'rejected' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-semibold uppercase tracking-wider">
                        Rejected
                      </span>
                    )}

                    {p.approval_status === 'approved' && p.is_published && p.is_visible && !p.is_private ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 text-[10px] font-mono">
                        Draft
                      </span>
                    )}

                    {p.is_featured && (
                      <span className="px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#a78bfa] border border-[#7C3AED]/30 text-[10px] font-mono flex items-center gap-1">
                        <Star size={10} className="fill-[#a78bfa]" /> Featured
                      </span>
                    )}

                    {p.is_private && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-mono flex items-center gap-1">
                        <Lock size={10} /> Private
                      </span>
                    )}

                    {p.is_deleted_on_github && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                        Deleted on GitHub
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm max-w-3xl line-clamp-2 leading-relaxed">
                    {p.custom_description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-gray-400">
                    {p.language && (
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-300">
                        {p.language}
                      </span>
                    )}
                    {p.stars_count > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star size={12} className="fill-amber-400" /> {p.stars_count}
                      </span>
                    )}
                    {p.github_url && (
                      <a
                        href={p.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Github size={12} /> View Code
                      </a>
                    )}
                    {p.demo_url && (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                      >
                        <Globe size={12} /> Live Demo
                      </a>
                    )}
                    {p.last_synced_at && (
                      <span className="text-gray-500">
                        Synced {new Date(p.last_synced_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Approval Actions for Pending */}
                  {p.approval_status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(p)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Approve repository for portfolio curation"
                      >
                        <Check size={14} /> Approve
                      </button>

                      <button
                        onClick={() => setConfirmAction({ type: 'reject', project: p })}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Reject repository"
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => handleToggleVisibility(p)}
                    className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                      p.is_visible
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                    }`}
                    title={p.is_visible ? 'Visible on Public Portfolio' : 'Hidden from Public Portfolio'}
                  >
                    {p.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>

                  {/* Featured Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(p)}
                    className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                      p.is_featured
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED]/30 text-[#a78bfa] hover:bg-[#7C3AED]/30'
                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                    }`}
                    title={p.is_featured ? 'Featured on Portfolio' : 'Not Featured'}
                  >
                    <Star size={16} className={p.is_featured ? 'fill-[#a78bfa]' : ''} />
                  </button>

                  {/* Publish / Unpublish Toggle */}
                  <button
                    onClick={() => handleTogglePublish(p)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                      p.is_published
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                    title={p.is_published ? 'Unpublish to draft' : 'Publish to live portfolio'}
                  >
                    {p.is_published ? 'Live' : 'Draft'}
                  </button>

                  {/* Edit Action */}
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    title="Edit custom overrides, title, highlights, and demo URL"
                  >
                    <Edit3 size={16} />
                  </button>

                  {/* Preview Action */}
                  <button
                    onClick={() => setPreviewProject(p)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    title="Preview public presentation card"
                  >
                    <ExternalLink size={16} />
                  </button>

                  {/* Delete Action */}
                  <button
                    onClick={() => setConfirmAction({ type: 'delete', project: p })}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit / Create Project Modal */}
      {(editingProject || isCreatingManual) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0a0f26] border border-white/10 rounded-3xl p-8 shadow-2xl my-8 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingProject ? `Edit '${editingProject.repo_name}'` : 'Create Manual Portfolio Project'}
              </h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsCreatingManual(false);
                }}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                  Display Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                  placeholder="e.g. AtlasAI"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED] leading-relaxed"
                  placeholder="Provide an overview of the architecture and intelligent engineering..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Category', formCategory, setFormCategory],
                  ['Project type', formProjectType, setFormProjectType],
                  ['Programming languages', formLanguages, setFormLanguages],
                  ['Frameworks and libraries', formFrameworks, setFormFrameworks],
                  ['AI/ML models and tools', formAiTools, setFormAiTools],
                ].map(([label, value, setter]) => (
                  <div key={label as string}>
                    <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">{label as string}</label>
                    <input
                      type="text"
                      value={value as string}
                      onChange={e => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                      placeholder="Comma separated"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Full description</label>
                <textarea
                  value={formFullDescription}
                  onChange={e => setFormFullDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                    Technologies (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formTechnologies}
                    onChange={e => setFormTechnologies(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                    placeholder="FastAPI, Python, FAISS, Docker"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['Project website URL', formWebsiteUrl, setFormWebsiteUrl],
                    ['Documentation URL', formDocumentationUrl, setFormDocumentationUrl],
                    ['Thumbnail/image URL', formThumbnailUrl, setFormThumbnailUrl],
                    ['Screenshot URLs (comma separated)', formScreenshots, setFormScreenshots],
                  ].map(([label, value, setter]) => (
                    <div key={label as string}>
                      <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">{label as string}</label>
                      <input
                        type={label === 'Screenshot URLs (comma separated)' ? 'text' : 'url'}
                        value={value as string}
                        onChange={e => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                      />
                      {label === 'Thumbnail/image URL' && formThumbnailUrl && (
                        <img src={formThumbnailUrl} alt="Thumbnail preview" className="mt-2 h-16 w-28 rounded object-cover" />
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                    Live Demo Application URL
                  </label>
                  <input
                    type="url"
                    value={formDemoUrl}
                    onChange={e => setFormDemoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                    placeholder="https://my-app.vercel.app"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={formGithubUrl}
                  onChange={e => setFormGithubUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                  placeholder="https://github.com/Vivek5143/My-Repo"
                />
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Key Highlights & Architectural Features
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormHighlights([...formHighlights, ''])}
                    className="text-xs font-mono text-[#a78bfa] hover:text-white flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {formHighlights.map((hl, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={hl}
                        onChange={e => {
                          const updated = [...formHighlights];
                          updated[i] = e.target.value;
                          setFormHighlights(updated);
                        }}
                        placeholder={`Highlight #${i + 1}`}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
                      />
                      {formHighlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormHighlights(formHighlights.filter((_, idx) => idx !== i))}
                          className="p-2 text-gray-500 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles & Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-300">
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={e => setFormIsVisible(e.target.checked)}
                    className="accent-[#7C3AED]"
                  />
                  <span>Visible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-300">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={e => setFormIsPublished(e.target.checked)}
                    className="accent-[#7C3AED]"
                  />
                  <span>Published</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-300">
                  <input
                    type="checkbox"
                    checked={formIsApproved}
                    onChange={e => setFormIsApproved(e.target.checked)}
                    className="accent-[#7C3AED]"
                  />
                  <span>Approved</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-300">
                  <input
                    type="checkbox"
                    checked={formIsPrivate}
                    onChange={e => setFormIsPrivate(e.target.checked)}
                    className="accent-[#7C3AED]"
                  />
                  <span>Private</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-300">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={e => setFormIsFeatured(e.target.checked)}
                    className="accent-[#7C3AED]"
                  />
                  <span>Featured</span>
                </label>

                <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                  <span>Order:</span>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={e => setFormOrder(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setIsCreatingManual(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white text-xs font-mono font-semibold hover:brightness-110 shadow-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Public Presentation Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#050816] border border-white/15 rounded-3xl p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-[#7C3AED]/20 text-[#a78bfa] border border-[#7C3AED]/30">
                  <Eye size={18} />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Live Public Portfolio Card Preview</h2>
                  <p className="text-xs font-mono text-gray-400">
                    Exact representation of how this project renders on the live portfolio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewProject(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Public Layout Simulation */}
            <div className="grid lg:grid-cols-12 gap-8 items-start py-4">
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-3xl font-extrabold text-white leading-tight font-sans tracking-tight">
                    {previewProject.custom_title || previewProject.repo_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {previewProject.github_url && (
                      <a
                        href={previewProject.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono"
                      >
                        <Github size={14} />
                        <span>Code</span>
                      </a>
                    )}
                    {previewProject.demo_url && (
                      <a
                        href={previewProject.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-semibold"
                      >
                        <Globe size={14} />
                        <span>Live App</span>
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 mb-6 text-sm leading-relaxed font-sans">
                  {previewProject.custom_description || previewProject.repo_name}
                </p>

                <div className="space-y-3 mb-8">
                  {(previewProject.custom_highlights && previewProject.custom_highlights.length > 0
                    ? previewProject.custom_highlights
                    : ['Automated architecture and verified GitHub synchronization pipeline.']
                  ).map((highlight, hIdx) => (
                    <div key={hIdx} className="flex gap-3 text-xs text-gray-400 leading-relaxed">
                      <CheckCircle size={15} className="text-[#10B981] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {(previewProject.custom_technologies && previewProject.custom_technologies.length > 0
                    ? previewProject.custom_technologies
                    : previewProject.topics
                  ).map(tech => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono uppercase tracking-tighter px-2.5 py-1 bg-[#7C3AED]/10 text-[#a78bfa] border border-[#7C3AED]/20 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <SpotlightCard
                  className="h-[340px] p-5 shadow-2xl flex flex-col justify-between"
                  glowColor="rgba(124, 58, 237, 0.15)"
                  borderColor="rgba(124, 58, 237, 0.3)"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="font-mono text-xs text-gray-300 font-bold">
                        {previewProject.repo_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      branch:{previewProject.default_branch}
                    </span>
                  </div>

                  <div className="my-auto space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-mono text-gray-400 mb-1">STARS & ACTIVITY</div>
                      <div className="text-xl font-extrabold text-amber-400 flex items-center gap-1.5">
                        <Star size={16} className="fill-amber-400" />
                        <span>{previewProject.stars_count} GitHub Stars</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-mono text-gray-400 mb-1">PRIMARY LANGUAGE</div>
                      <div className="text-sm font-mono text-white">
                        {previewProject.language || 'Python / AI Stack'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-right">
                    <span className="text-[10px] font-mono text-[#a78bfa]">
                      Verified Operational Artifact
                    </span>
                  </div>
                </SpotlightCard>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
              <button
                onClick={() => setPreviewProject(null)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white text-xs font-mono hover:bg-white/15"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#0a0f26] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {confirmAction.type === 'reject' && 'Reject Repository?'}
              {confirmAction.type === 'delete' && 'Delete Project?'}
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              {confirmAction.type === 'reject' &&
                `Are you sure you want to reject '${confirmAction.project.repo_name}'? It will remain unpublished and will not be displayed on your portfolio.`}
              {confirmAction.type === 'delete' &&
                `Are you sure you want to permanently remove '${confirmAction.project.custom_title || confirmAction.project.repo_name}'?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'reject') handleRejectConfirm();
                  if (confirmAction.type === 'delete') handleDeleteConfirm();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-mono font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
