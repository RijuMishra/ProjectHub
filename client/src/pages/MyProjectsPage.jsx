import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Plus, Users2 } from 'lucide-react';
import { projectService } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';

const MyProjectsPage = () => {
  const [data, setData] = useState({ owned: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('owned'); // 'owned' | 'joined'

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const res = await projectService.getMyProjects();
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load my projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, []);

  const activeProjects = activeTab === 'owned' ? data.owned : data.joined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Projects</h1>
          <p className="text-xs text-charcoal-light mt-0.5">
            Manage projects you have established or joined as an active contributor
          </p>
        </div>

        <Link
          to="/projects/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-subtle flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('owned')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'owned'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Created by Me ({data.owned.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'joined'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Joined Projects ({data.joined.length})</span>
        </button>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderGit2}
          title={activeTab === 'owned' ? 'You have not created any projects' : 'You have not joined any project teams'}
          description={
            activeTab === 'owned'
              ? 'Publish an academic project to assemble collaborators and coordinate tasks.'
              : 'Explore open projects across university departments and submit a collaboration request.'
          }
          actionLabel={activeTab === 'owned' ? 'Publish a Project' : 'Explore Projects'}
          onAction={() => (activeTab === 'owned' ? window.location.assign('/projects/create') : window.location.assign('/explore'))}
        />
      )}
    </div>
  );
};

export default MyProjectsPage;
