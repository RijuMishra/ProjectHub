import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-between">
      {/* Public Header */}
      <header className="bg-white/90 backdrop-blur-xs border-b border-subtle sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-navy">
                ProjectHub
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
                Academic Collaboration
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6 text-xs font-medium">
            <Link
              to="/explore"
              className="text-slate-600 hover:text-navy transition-colors hidden sm:block"
            >
              Explore Projects
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-light transition-colors font-semibold shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-slate-700 hover:text-navy hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-light transition-colors font-semibold shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-subtle py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-navy flex items-center justify-center text-white text-[10px] font-bold">
              P
            </div>
            <span className="font-semibold text-charcoal">ProjectHub Platform</span>
            <span>• Full Stack Academic Development Project</span>
          </div>
          <p>© {new Date().getFullYear()} ProjectHub. Designed for peer-to-peer research & engineering collaboration.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
