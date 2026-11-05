import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Layers, Filter } from 'lucide-react';
import { projectService, commentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const DiscussionsPage = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProjects();
        if (res.data?.success && res.data.data.length > 0) {
          setProjects(res.data.data);
          setSelectedProjectId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load projects for discussions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const fetchComments = async (projectId) => {
    if (!projectId) return;
    try {
      const res = await commentService.getCommentsByProject(projectId);
      if (res.data?.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchComments(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedProjectId) return;
    setSubmitting(true);
    try {
      const res = await commentService.createComment({
        projectId: selectedProjectId,
        content: newComment,
      });
      if (res.data?.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
        toast.success('Comment posted to project thread.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await commentService.deleteComment(id);
      setComments(comments.filter((c) => c._id !== id));
      toast.success('Comment removed.');
    } catch (err) {
      toast.error('Could not delete comment.');
    }
  };

  const activeProject = projects.find((p) => p._id === selectedProjectId);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading discussions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Project Discussions & Q&A</h1>
        <p className="text-xs text-charcoal-light mt-0.5">
          Participate in engineering discussions, architecture critiques, and peer design reviews
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Project selector */}
        <div className="bg-white border border-subtle rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-subtle">
            <Layers className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
              Discussion Threads ({projects.length})
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {projects.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelectedProjectId(p._id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-colors border ${
                  selectedProjectId === p._id
                    ? 'bg-slate-100 border-navy/40 font-semibold text-navy'
                    : 'bg-white border-transparent hover:bg-slate-50 text-charcoal'
                }`}
              >
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                  {p.category}
                </span>
                <span className="line-clamp-1">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Comments Thread */}
        <div className="lg:col-span-2 space-y-4">
          {activeProject ? (
            <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-subtle pb-4">
                <span className="text-[10px] font-semibold uppercase text-accent tracking-wider">
                  Active Thread • {activeProject.category}
                </span>
                <h2 className="text-lg font-bold text-navy mt-0.5">
                  {activeProject.title}
                </h2>
                <p className="text-xs text-charcoal-light mt-1 line-clamp-2">
                  {activeProject.description}
                </p>
              </div>

              {/* Post comment */}
              <form onSubmit={handlePostComment} className="space-y-3">
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Join the discussion or ask an engineering question..."
                  required
                  className="w-full p-3 text-xs border border-subtle rounded-xl focus:outline-none focus:border-navy"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Posting...' : 'Post Message'}</span>
                  </button>
                </div>
              </form>

              {/* Thread list */}
              <div className="space-y-4 pt-2">
                {comments.map((comment) => {
                  const isAuthor = user && (comment.author?._id === user._id || comment.author === user._id);
                  return (
                    <div
                      key={comment._id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-charcoal font-bold flex items-center justify-center shrink-0 text-xs">
                          {comment.author?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-charcoal">
                              {comment.author?.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-charcoal-light mt-1.5 leading-relaxed whitespace-pre-line">
                            {comment.content}
                          </p>
                        </div>
                      </div>

                      {(isAuthor || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {comments.length === 0 && (
                  <EmptyState
                    icon={MessageSquare}
                    title="No messages in this thread"
                    description="Start the conversation by posting an architectural note or query above."
                  />
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No project selected"
              description="Choose a project discussion thread from the left menu."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionsPage;
