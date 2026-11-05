import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (isMounted && res.data?.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (e) {
        // Silent catch for polling
      }
    };

    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-subtle h-16 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-charcoal hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-navy">
              ProjectHub
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
              Academic Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Explore Link */}
        <Link
          to="/explore"
          className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search projects, skills...</span>
        </Link>

        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-charcoal hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-navy text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-charcoal font-semibold text-xs flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-charcoal leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white border border-subtle rounded-xl shadow-panel py-1 z-50 text-xs"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-subtle">
                <p className="font-semibold text-charcoal truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-navy"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-navy"
                >
                  <Shield className="w-4 h-4 text-navy" />
                  <span>Admin Console</span>
                </Link>
              )}

              <div className="border-t border-subtle my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
