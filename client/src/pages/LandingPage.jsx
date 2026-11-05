import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Users2,
  FileBox,
  CheckSquare,
  ShieldCheck,
  ArrowRight,
  Code2,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { projectService } from '../services/api';
import ProjectCard from '../components/ProjectCard';

const LandingPage = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProjects();
        if (res.data?.success) {
          setFeaturedProjects(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <GraduationCap className="w-3.5 h-3.5 text-navy" />
          <span>Integrated College Collaboration & Resource Exchange</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight leading-tight">
          Where student engineering projects turn into reality.
        </h1>

        <p className="text-base sm:text-lg text-charcoal-light max-w-2xl mx-auto leading-relaxed">
          ProjectHub connects students across engineering departments to collaborate on capstone projects, exchange academic resources, manage sprint tasks, and build production-grade portfolios.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-navy text-white font-semibold text-sm hover:bg-navy-light transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/explore"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white border border-subtle text-charcoal font-semibold text-sm hover:bg-slate-50 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-accent" />
            <span>Explore Projects</span>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-subtle rounded-xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-navy mb-4">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-charcoal mb-2">Team Assembly</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Find collaborators with complementary skills in frontend, backend, AI/ML, or embedded systems. Send and review join requests.
            </p>
          </div>

          <div className="bg-white border border-subtle rounded-xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-navy mb-4">
              <FileBox className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-charcoal mb-2">Resource Exchange</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Upload and download project documentation, SRS templates, research papers, datasets, and firmware archives safely.
            </p>
          </div>

          <div className="bg-white border border-subtle rounded-xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-navy mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-charcoal mb-2">Task Management</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Keep milestones on schedule with project task tracking across To Do, In Progress, Under Review, and Completed columns.
            </p>
          </div>

          <div className="bg-white border border-subtle rounded-xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-navy mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-charcoal mb-2">Role-Based Access</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Authenticated workspace with owner controls, applicant vetting, and administrative auditing for university standards.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-navy">Featured Student Projects</h2>
            <p className="text-xs text-charcoal-light">Discover ongoing university initiatives open for collaboration</p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-accent hover:text-navy transition-colors flex items-center gap-1"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-navy text-white rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to bring your academic project to life?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Create an account in 30 seconds. Publish your project requirements or discover teams building real-world technologies today.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-navy font-semibold text-sm hover:bg-slate-100 transition-colors shadow-sm"
            >
              <span>Join ProjectHub Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
