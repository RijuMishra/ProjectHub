import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result?.success) {
      navigate(from, { replace: true });
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white border border-subtle rounded-2xl p-6 sm:p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-navy">Welcome back</h2>
          <p className="text-xs text-charcoal-light mt-1">
            Sign in to access your ProjectHub academic workspace
          </p>
        </div>

        {/* Demo Fast-Login helper buttons for examiners */}
        <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-accent" />
            <span>Examiner / Demo Quick Logins:</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('arjun.sharma@projecthub.edu', 'Student@123')}
              className="text-left px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:border-navy text-charcoal transition-colors truncate"
            >
              <span className="font-semibold block truncate">Arjun Sharma</span>
              <span className="text-[10px] text-slate-400">Student Account</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@projecthub.edu', 'Admin@123456')}
              className="text-left px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:border-navy text-charcoal transition-colors truncate"
            >
              <span className="font-semibold block truncate text-navy">Administrator</span>
              <span className="text-[10px] text-slate-400">Full System Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-charcoal">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? 'Verifying credentials...' : 'Sign In to Workspace'}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-charcoal-light border-t border-subtle pt-4">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-semibold text-navy hover:underline">
            Register Student Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
