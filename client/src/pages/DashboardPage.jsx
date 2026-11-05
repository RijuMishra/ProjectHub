import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users2,
  Clock,
  CheckSquare,
  Plus,
  Compass,
  Upload,
  ArrowRight,
  TrendingUp,
  FileBox,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ResourceCard from '../components/ResourceCard';
import StatusBadge from '../components/StatusBadge';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await projectService.getDashboardStats();
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Academic Workspace Overview
          </span>
          <h1 className="text-2xl font-bold text-navy mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-charcoal-light mt-1">
            {user?.department} • {user?.year}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </Link>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-charcoal border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>Explore Projects</span>
          </Link>

          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-charcoal border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-accent" />
            <span>Upload Resource</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards (Real DB values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Projects Created</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal">
            {loading ? '...' : stats?.totalProjectsCreated || 0}
          </div>
          <Link
            to="/my-projects"
            className="text-[11px] text-accent hover:text-navy font-medium mt-2 inline-flex items-center gap-1"
          >
            <span>View your projects</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Teams Joined</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal">
            {loading ? '...' : stats?.totalProjectsJoined || 0}
          </div>
          <Link
            to="/teams"
            className="text-[11px] text-accent hover:text-navy font-medium mt-2 inline-flex items-center gap-1"
          >
            <span>Manage active teams</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal">
            {loading ? '...' : stats?.pendingCollaborationRequests || 0}
          </div>
          <Link
            to="/teams"
            className="text-[11px] text-accent hover:text-navy font-medium mt-2 inline-flex items-center gap-1"
          >
            <span>Review join requests</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Assigned Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-charcoal">
              {loading ? '...' : `${stats?.completedTasksCount || 0}/${stats?.assignedTasksCount || 0}`}
            </span>
            <span className="text-xs font-medium text-slate-400">
              ({stats?.taskCompletionPercentage || 0}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-navy h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${stats?.taskCompletionPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Section: Assigned Tasks & Recent Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Public Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy">Recently Published Projects</h2>
            <Link
              to="/explore"
              className="text-xs font-semibold text-accent hover:text-navy flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats?.recentProjects?.slice(0, 4).map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Assigned Tasks Mini Board */}
        <div className="bg-white border border-subtle rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy">My Upcoming Tasks</h3>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-accent hover:text-navy"
            >
              Task Board
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.assignedTasksList?.length > 0 ? (
              stats.assignedTasksList.map((task) => (
                <div
                  key={task._id}
                  className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {task.project?.title || 'Project'}
                    </span>
                    <StatusBadge status={task.status} size="xs" />
                  </div>
                  <h4 className="text-xs font-semibold text-charcoal line-clamp-1">
                    {task.title}
                  </h4>
                  {task.deadline && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No pending tasks assigned to you.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Resources Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Latest Academic Resources</h2>
            <p className="text-xs text-charcoal-light">Recent lecture notes, SRS documents, and code snippets</p>
          </div>
          <Link
            to="/resources"
            className="text-xs font-semibold text-accent hover:text-navy flex items-center gap-1"
          >
            <span>Resource Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.recentResources?.map((res) => (
            <ResourceCard key={res._id} resource={res} currentUser={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
