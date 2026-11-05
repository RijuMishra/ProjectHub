import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Save, Plus } from 'lucide-react';
import { projectService } from '../services/api';
import toast from 'react-hot-toast';

const categories = [
  'Web Development',
  'AI/ML',
  'Data Science',
  'App Development',
  'IoT',
  'Cybersecurity',
  'Other',
];

const statuses = ['Planning', 'In Progress', 'Completed', 'On Hold'];

const CreateEditProjectPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    technologies: '',
    requiredSkills: '',
    maxTeamSize: 4,
    status: 'Planning',
    visibility: 'Public',
    repoUrl: '',
    liveDemoUrl: '',
  });

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchProject = async () => {
        try {
          const res = await projectService.getProjectById(id);
          if (res.data?.success) {
            const p = res.data.data;
            setFormData({
              title: p.title || '',
              category: p.category || 'Web Development',
              description: p.description || '',
              technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
              requiredSkills: Array.isArray(p.requiredSkills) ? p.requiredSkills.join(', ') : '',
              maxTeamSize: p.maxTeamSize || 4,
              status: p.status || 'Planning',
              visibility: p.visibility || 'Public',
              repoUrl: p.repoUrl || '',
              liveDemoUrl: p.liveDemoUrl || '',
            });
          }
        } catch (err) {
          toast.error('Failed to load project details for editing.');
          navigate('/my-projects');
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await projectService.updateProject(id, formData);
        if (res.data?.success) {
          toast.success('Project updated successfully.');
          navigate(`/projects/${id}`);
        }
      } else {
        const res = await projectService.createProject(formData);
        if (res.data?.success) {
          toast.success('Project published successfully.');
          navigate(`/projects/${res.data.data._id}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading project configuration...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <div className="bg-white border border-subtle rounded-2xl p-6 sm:p-8 shadow-card">
        <div className="border-b border-subtle pb-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-navy">
            {isEditing ? 'Edit Academic Project' : 'Publish New Academic Project'}
          </h1>
          <p className="text-xs text-charcoal-light mt-1">
            Provide comprehensive details regarding your project scope, requirements, and required skills
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Distributed Consensus Engine on Microcontrollers"
              required
              className="w-full px-3 py-2 border border-subtle rounded-lg text-xs focus:outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Domain Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Maximum Team Size (1 - 10) *
              </label>
              <input
                type="number"
                name="maxTeamSize"
                min={1}
                max={10}
                value={formData.maxTeamSize}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Project Description & Architecture Scope *
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain the background problem statement, system architecture, core engineering challenges, and expected project outcomes..."
              required
              className="w-full p-3 border border-subtle rounded-lg focus:outline-none focus:border-navy text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Technologies Used (comma-separated)
              </label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                placeholder="React, Node.js, Docker, PyTorch"
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Required Collaborator Skills (comma-separated)
              </label>
              <input
                type="text"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                placeholder="Deep Learning, API Design, Circuit CAD"
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Project Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                <option value="Public">Public (Visible in Explore)</option>
                <option value="Private">Private (Team Members Only)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                GitHub / Git Repository URL (optional)
              </label>
              <input
                type="url"
                name="repoUrl"
                value={formData.repoUrl}
                onChange={handleChange}
                placeholder="https://github.com/organization/repo"
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Live Deployment URL (optional)
              </label>
              <input
                type="url"
                name="liveDemoUrl"
                value={formData.liveDemoUrl}
                onChange={handleChange}
                placeholder="https://project.university.edu"
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-subtle">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-subtle text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving project...' : isEditing ? 'Save Changes' : 'Publish Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditProjectPage;
