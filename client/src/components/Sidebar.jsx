import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  FolderGit2,
  Users2,
  FileBox,
  CheckSquare,
  MessageSquare,
  Bell,
  User,
  Shield,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Projects', path: '/explore', icon: Compass },
    { name: 'My Projects', path: '/my-projects', icon: FolderGit2 },
    { name: 'My Teams', path: '/teams', icon: Users2 },
    { name: 'Resource Hub', path: '/resources', icon: FileBox },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Discussions', path: '/discussions', icon: MessageSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-subtle flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Quick Create Project Button */}
          <NavLink
            to="/projects/create"
            onClick={closeSidebar}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-4 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Project</span>
          </NavLink>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Workspace
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-navy font-semibold border-l-2 border-navy'
                        : 'text-slate-600 hover:text-charcoal hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {isAdmin && (
              <>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 pt-4 mb-2">
                  Administration
                </div>
                <NavLink
                  to="/admin"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-navy/10 text-navy font-semibold border-l-2 border-navy'
                        : 'text-slate-600 hover:text-charcoal hover:bg-slate-50'
                    }`
                  }
                >
                  <Shield className="w-4 h-4 text-navy" />
                  <span>Admin Dashboard</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Profile Info and Sign Out */}
        <div className="p-4 border-t border-subtle bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-charcoal font-semibold text-xs flex items-center justify-center shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-charcoal truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.department?.split(' ')[0] || 'Student'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
