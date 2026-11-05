import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FolderGit2,
  FileBox,
  CheckSquare,
  Trash2,
  AlertTriangle,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'projects' | 'resources'
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, projectsRes, resourcesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getProjects(),
        adminService.getResources(),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (usersRes.data?.success) setUsers(usersRes.data.data);
      if (projectsRes.data?.success) setProjects(projectsRes.data.data);
      if (resourcesRes.data?.success) setResources(resourcesRes.data.data);
    } catch (err) {
      toast.error('Failed to load administrative console data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Permanently remove student account "${name}" and all associated data?`)) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.data?.success) {
        toast.success(`User ${name} removed.`);
        setUsers(users.filter((u) => u._id !== userId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user.');
    }
  };

  const handleDeleteProject = async (projectId, title) => {
    if (!window.confirm(`Permanently remove project "${title}"?`)) return;
    try {
      const res = await adminService.deleteProject(projectId);
      if (res.data?.success) {
        toast.success('Project removed by admin.');
        setProjects(projects.filter((p) => p._id !== projectId));
      }
    } catch (err) {
      toast.error('Could not delete project.');
    }
  };

  const handleDeleteResource = async (resourceId, title) => {
    if (!window.confirm(`Permanently remove resource "${title}"?`)) return;
    try {
      const res = await adminService.deleteResource(resourceId);
      if (res.data?.success) {
        toast.success('Resource removed by admin.');
        setResources(resources.filter((r) => r._id !== resourceId));
      }
    } catch (err) {
      toast.error('Could not delete resource.');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading administrative controls...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-navy" />
            <h1 className="text-2xl font-bold text-navy">
              System Administration Console
            </h1>
          </div>
          <p className="text-xs text-charcoal-light mt-1">
            Global monitoring, academic moderation, user administration, and system health
          </p>
        </div>
        <span className="px-3 py-1 bg-navy text-white text-xs font-semibold rounded-lg shadow-xs">
          Role: Platform Administrator
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Registered Accounts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-charcoal">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.studentUsers || 0} Students • {stats?.adminUsers || 0} Admins
          </p>
        </div>

        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-charcoal">{stats?.totalProjects || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.publicProjects || 0} Public • {stats?.privateProjects || 0} Private
          </p>
        </div>

        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Academic Resources</span>
            <FileBox className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-charcoal">{stats?.totalResources || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Shared documents & code</p>
        </div>

        <div className="bg-white border border-subtle rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tasks Completed</span>
            <CheckSquare className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-charcoal">{stats?.completedTasks || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Out of {stats?.totalTasks || 0} total created tasks
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-subtle flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Category Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Project Moderation ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <FileBox className="w-4 h-4" />
          <span>Resource Auditing ({resources.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & BREAKDOWN */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy">Project Category Distribution</h3>
            <div className="space-y-3">
              {stats?.categoryStats?.map((cat) => (
                <div key={cat._id} className="text-xs">
                  <div className="flex justify-between font-semibold text-charcoal mb-1">
                    <span>{cat._id || 'Other'}</span>
                    <span>{cat.count} projects</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-navy h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((cat.count / (stats?.totalProjects || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy">Resource Category Distribution</h3>
            <div className="space-y-3">
              {stats?.resourceStats?.map((cat) => (
                <div key={cat._id} className="text-xs">
                  <div className="flex justify-between font-semibold text-charcoal mb-1">
                    <span>{cat._id || 'Other'}</span>
                    <span>{cat.count} files</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((cat.count / (stats?.totalResources || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white border border-subtle rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-subtle text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Projects</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{u.department}</div>
                      <div className="text-[11px] text-slate-400">{u.year}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.role === 'admin'
                            ? 'bg-navy text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.projectCount || 0} created
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u._id !== user._id ? (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS TABLE */}
      {activeTab === 'projects' && (
        <div className="bg-white border border-subtle rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-subtle text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.visibility}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 text-slate-600">{p.owner?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {(p.members?.length || 0) + 1} / {p.maxTeamSize}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/projects/${p._id}`}
                          className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteProject(p._id, p.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RESOURCES TABLE */}
      {activeTab === 'resources' && (
        <div className="bg-white border border-subtle rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-subtle text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Resource Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {resources.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal line-clamp-1">{r.title}</div>
                      <div className="text-[11px] text-slate-400">{r.fileType?.toUpperCase()}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.category}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">{r.fileName}</td>
                    <td className="py-3 px-4 text-slate-600">{r.uploader?.name || 'Contributor'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteResource(r._id, r.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
