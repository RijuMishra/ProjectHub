import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';

const categories = [
  'All',
  'Web Development',
  'AI/ML',
  'Data Science',
  'App Development',
  'IoT',
  'Cybersecurity',
  'Other',
];

const statuses = ['All', 'Planning', 'In Progress', 'Completed', 'On Hold'];

const ExploreProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects({
        search,
        category: selectedCategory,
        status: selectedStatus,
      });
      if (res.data?.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Explore Projects</h1>
          <p className="text-xs text-charcoal-light mt-0.5">
            Discover peer academic projects, join teams, and collaborate across disciplines
          </p>
        </div>

        <Link
          to="/projects/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Project</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-subtle rounded-xl p-4 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project title, keywords, tech stack, or required skills..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-charcoal text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-navy text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 pt-2 border-t border-subtle text-xs">
          <span className="font-medium text-slate-500">Filter by status:</span>
          <div className="flex gap-1.5">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedStatus === st
                    ? 'bg-slate-200 text-charcoal font-semibold'
                    : 'text-slate-500 hover:text-charcoal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects match your filter"
          description="Try adjusting your search keywords, clearing status filters, or publish your own project!"
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
            setSelectedStatus('All');
          }}
        />
      )}
    </div>
  );
};

export default ExploreProjectsPage;
