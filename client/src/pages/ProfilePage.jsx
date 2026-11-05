import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  BookOpen,
  Calendar,
  Code,
  Edit,
  Save,
  FolderGit2,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, projectService } from '../services/api';
import Modal from '../components/Modal';
import ProjectCard from '../components/ProjectCard';
import toast from 'react-hot-toast';

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

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Faculty / Mentor'];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [projectsData, setProjectsData] = useState({ owned: [], joined: [] });
  const [loading, setLoading] = useState(true);

  // Edit profile modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    skills: '',
    bio: '',
    github: '',
    linkedin: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || 'Computer Science & Engineering',
        year: user.year || '3rd Year',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        bio: user.bio || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
      });
    }

    const fetchProjects = async () => {
      try {
        const res = await projectService.getMyProjects();
        if (res.data?.success) {
          setProjectsData(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile(formData);
      if (res.data?.success) {
        updateUser(res.data.user);
        toast.success('Academic profile updated successfully.');
        setEditModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white border border-subtle rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-navy text-white text-xl font-bold flex items-center justify-center shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-navy">
                  {user?.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-charcoal-light mt-0.5">
                {user?.department} • {user?.year}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-slate-50 text-charcoal text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-subtle space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              About / Engineering Bio
            </h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              {user?.bio || 'No bio provided yet. Add your technical background and research interests!'}
            </p>
          </div>

          {/* Technical Skills */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Verified Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {user?.skills?.length > 0 ? (
                user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No skills added yet.</span>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(user?.github || user?.linkedin) && (
            <div className="flex items-center gap-4 pt-2 text-xs">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-navy font-semibold hover:underline"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>GitHub Profile</span>
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-navy font-semibold hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Projects Authored / Joined */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-navy">
          Academic Project Portfolio ({projectsData.owned.length + projectsData.joined.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...projectsData.owned, ...projectsData.joined].map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Academic Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-charcoal mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Year of Study</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
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
            <label className="block font-semibold text-charcoal mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, Node.js, Python, MongoDB"
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Bio / Research Focus
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Share your technical interests and engineering background..."
              className="w-full p-2.5 border border-subtle rounded-lg focus:outline-none focus:border-navy leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-charcoal mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-subtle">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-subtle text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light font-semibold disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
