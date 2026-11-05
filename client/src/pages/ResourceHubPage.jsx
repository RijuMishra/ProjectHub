import React, { useState, useEffect } from 'react';
import {
  FileBox,
  Upload,
  Search,
  Filter,
  Plus,
  FileText,
  Archive,
  Code,
  Tag,
} from 'lucide-react';
import { resourceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const categories = [
  'All',
  'Notes',
  'Research Paper',
  'Code Repository',
  'Project Report',
  'Presentation',
  'Dataset',
  'Cheatsheet',
  'Other',
];

const ResourceHubPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'Notes',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceService.getResources({
        search,
        category: selectedCategory,
      });
      if (res.data?.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!uploadData.title) {
      toast.error('Resource title is required.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('tags', uploadData.tags);
      formData.append('file', selectedFile);

      const res = await resourceService.uploadResource(formData);
      if (res.data?.success) {
        toast.success('Resource uploaded successfully!');
        setUploadModalOpen(false);
        setUploadData({ title: '', description: '', category: 'Notes', tags: '' });
        setSelectedFile(null);
        fetchResources();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSuccess = (id) => {
    setResources(resources.filter((r) => r._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Resource Exchange Hub</h1>
          <p className="text-xs text-charcoal-light mt-0.5">
            Peer repository for IEEE research papers, project reports, source code archives, and SRS templates
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Academic Resource</span>
        </button>
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
              placeholder="Search resources by title, category, tags, or file name..."
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

        {/* Categories */}
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
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              currentUser={user}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileBox}
          title="No resources found"
          description="Be the first student or researcher to upload study material, documentation, or code libraries!"
          actionLabel="Upload Resource"
          onAction={() => setUploadModalOpen(true)}
        />
      )}

      {/* Upload Resource Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Academic Resource"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Resource Title *
            </label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              placeholder="e.g. Full Stack Development Project SRS & System Architecture"
              required
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Category *</label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={uploadData.tags}
                onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                placeholder="FSD, React, Guide, Template"
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal mb-1">Description</label>
            <textarea
              rows={2}
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              placeholder="Brief overview of contents, citation details, or lab manual notes..."
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Select Document or Archive File (PDF, PPT, DOC, ZIP, CODE up to 25MB) *
            </label>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-white hover:file:bg-navy-light cursor-pointer"
              />
              {selectedFile && (
                <p className="mt-2 text-[11px] font-semibold text-emerald-700">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-subtle">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 border border-subtle text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light font-semibold disabled:opacity-50"
            >
              {uploading ? 'Uploading File...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResourceHubPage;
