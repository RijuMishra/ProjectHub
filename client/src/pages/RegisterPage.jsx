import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, User, BookOpen, Calendar, Code, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    skills: '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Computer Science & Engineering',
    'Artificial Intelligence & Data Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
  ];

  const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Postgraduate',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(formData);
    setSubmitting(false);
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 px-4">
      <div className="bg-white border border-subtle rounded-2xl p-6 sm:p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-navy">Student Registration</h2>
          <p className="text-xs text-charcoal-light mt-1">
            Create your university academic profile to collaborate on peer projects
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Arjun Sharma"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Institutional Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Password (min 6 chars) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Academic Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Key Skills & Tech Stack (comma-separated)
            </label>
            <div className="relative">
              <Code className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python, PyTorch, MongoDB"
                className="w-full pl-9 pr-3 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Brief Bio / Engineering Interests
            </label>
            <textarea
              name="bio"
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Undergraduate interested in full-stack web applications and machine learning..."
              className="w-full px-3 py-2 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 pt-2"
          >
            {submitting ? 'Creating student profile...' : 'Complete Registration'}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-charcoal-light border-t border-subtle pt-4">
          <span>Already registered? </span>
          <Link to="/login" className="font-semibold text-navy hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
