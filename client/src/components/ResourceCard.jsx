import React from 'react';
import {
  FileText,
  FileCode,
  Archive,
  Download,
  Trash2,
  Tag,
  User,
  Calendar,
} from 'lucide-react';
import { resourceService } from '../services/api';
import toast from 'react-hot-toast';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx'].includes(t)) {
    return <FileText className="w-5 h-5 text-red-600" />;
  }
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css'].includes(t)) {
    return <FileCode className="w-5 h-5 text-blue-600" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(t)) {
    return <Archive className="w-5 h-5 text-amber-600" />;
  }
  return <FileText className="w-5 h-5 text-slate-600" />;
};

const ResourceCard = ({ resource, currentUser, onDeleteSuccess }) => {
  const isOwner = currentUser && (resource.uploader?._id === currentUser._id || resource.uploader === currentUser._id);
  const isAdmin = currentUser?.role === 'admin';

  const handleDownload = () => {
    const downloadUrl = resourceService.getDownloadUrl(resource._id);
    window.open(downloadUrl, '_blank');
    toast.success(`Starting download for ${resource.fileName}...`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${resource.title}"?`)) return;
    try {
      await resourceService.deleteResource(resource._id);
      toast.success('Resource deleted successfully.');
      if (onDeleteSuccess) onDeleteSuccess(resource._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resource.');
    }
  };

  return (
    <div className="bg-white border border-subtle rounded-xl p-5 hover:border-slate-300 transition-all duration-150 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            {getFileIcon(resource.fileType)}
          </div>
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
            {resource.category}
          </span>
        </div>

        <h3 className="text-base font-semibold text-charcoal line-clamp-1 mb-1">
          {resource.title}
        </h3>

        <p className="text-xs text-charcoal-light line-clamp-2 mb-3 leading-relaxed">
          {resource.description || 'Shared academic resource and learning material.'}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-subtle flex items-center justify-between text-xs text-slate-400">
        <div>
          <p className="font-medium text-charcoal truncate max-w-[130px]">
            {resource.uploader?.name || 'Academic Contributor'}
          </p>
          <p className="text-[11px] text-slate-400">
            {resource.fileType?.toUpperCase()} • {formatFileSize(resource.fileSize)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(isOwner || isAdmin) && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Resource"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy-light transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
