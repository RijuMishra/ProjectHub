import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Code,
  Calendar,
  Globe,
  GitBranch,
  Edit,
  Trash2,
  UserPlus,
  Send,
  MessageSquare,
  CheckSquare,
  Layers,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import {
  projectService,
  joinRequestService,
  taskService,
  commentService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'discussions'

  // Join Request Modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [proposedRole, setProposedRole] = useState('Frontend Developer');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    deadline: '',
  });

  // Discussions state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await projectService.getProjectById(id);
      if (res.data?.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await taskService.getTasksByProject(id);
      if (res.data?.success) setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await commentService.getCommentsByProject(id);
      if (res.data?.success) setComments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
    fetchComments();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading project details...</div>;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The requested project does not exist or you lack permission to view it."
        actionLabel="Back to Explore"
        onAction={() => navigate('/explore')}
      />
    );
  }

  const isOwner = user && (project.owner?._id === user._id || project.owner === user._id);
  const isMember = user && project.members?.some(m => (m.user?._id || m.user) === user._id);
  const isAdmin = user?.role === 'admin';
  const canManageTeam = isOwner || isAdmin;
  const canManageTasks = isOwner || isMember || isAdmin;
  const teamCount = (project.members?.length || 0) + 1;
  const isFull = teamCount >= project.maxTeamSize;

  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${project.title}"?`)) return;
    try {
      await projectService.deleteProject(project._id);
      toast.success('Project and associated data removed.');
      navigate('/my-projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    setRequestSubmitting(true);
    try {
      const res = await joinRequestService.createJoinRequest({
        projectId: project._id,
        message: joinMessage,
        proposedRole,
      });
      if (res.data?.success) {
        toast.success('Collaboration request dispatched to project owner.');
        setJoinModalOpen(false);
        setJoinMessage('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const res = await taskService.createTask({
        ...newTask,
        projectId: project._id,
      });
      if (res.data?.success) {
        toast.success('Task created.');
        setTasks([res.data.data, ...tasks]);
        setTaskModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          assignedTo: '',
          priority: 'Medium',
          status: 'To Do',
          deadline: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateTask(taskId, { status: newStatus });
      if (res.data?.success) {
        setTasks(tasks.map(t => (t._id === taskId ? res.data.data : t)));
        toast.success(`Task moved to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted.');
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await commentService.createComment({
        projectId: project._id,
        content: newComment,
      });
      if (res.data?.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
        toast.success('Comment posted.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment removed.');
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to projects</span>
      </button>

      {/* Main Project Header Card */}
      <div className="bg-white border border-subtle rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
                {project.category}
              </span>
              <StatusBadge status={project.status} size="sm" />
              <span className="text-xs text-slate-400">
                • {project.visibility} Project
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">
              {project.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start">
            {canManageTeam && (
              <>
                <Link
                  to={`/projects/edit/${project._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Project</span>
                </Link>

                <button
                  onClick={handleDeleteProject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 bg-rose-50 border border-rose-200 text-xs font-medium rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}

            {!isOwner && !isMember && (
              <button
                onClick={() => setJoinModalOpen(true)}
                disabled={isFull}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors ${
                  isFull
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-navy hover:bg-navy-light'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isFull ? 'Team Full' : 'Request to Join'}</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-charcoal-light leading-relaxed mb-6 whitespace-pre-line">
          {project.description}
        </p>

        {/* Links & Repository */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-subtle text-xs text-slate-500">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-navy hover:underline"
            >
              <GitBranch className="w-4 h-4 text-slate-700" />
              <span>Source Repository</span>
            </a>
          )}

          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-navy hover:underline"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Live Deployment</span>
            </a>
          )}

          <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-subtle flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Overview & Team ({teamCount}/{project.maxTeamSize})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Task Board ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('discussions')}
          className={`pb-3 px-1 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'discussions'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-slate-500 hover:text-charcoal'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Project Discussions ({comments.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TEAM */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Technologies & Skills */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <h3 className="text-sm font-bold text-navy pt-2">Skills In Demand</h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Team Roster */}
          <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy">Team Roster</h3>
              <span className="text-xs text-slate-400">
                {teamCount} / {project.maxTeamSize} Members
              </span>
            </div>

            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                    {project.owner?.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal">
                      {project.owner?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {project.owner?.department}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-navy text-white">
                  Lead / Owner
                </span>
              </div>

              {/* Members */}
              {project.members?.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-slate-100 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-charcoal text-xs font-bold flex items-center justify-center">
                      {m.user?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal">
                        {m.user?.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {m.user?.department}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                    {m.role || 'Collaborator'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASK BOARD */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy">Project Task Board</h3>
              <p className="text-xs text-charcoal-light">Manage project sprints, assignments, and deliverables</p>
            </div>

            {canManageTasks && (
              <button
                onClick={() => setTaskModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs"
              >
                <span>Add Task</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['To Do', 'In Progress', 'Under Review', 'Completed'].map((status) => {
              const statusTasks = tasks.filter(t => t.status === status);
              return (
                <div key={status} className="bg-slate-50/70 border border-subtle rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      {status}
                    </h4>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-charcoal text-[11px] font-semibold flex items-center justify-center">
                      {statusTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {statusTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        canManage={canManageTasks}
                      />
                    ))}

                    {statusTasks.length === 0 && (
                      <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DISCUSSIONS */}
      {activeTab === 'discussions' && (
        <div className="max-w-3xl space-y-6">
          {/* Post Comment Input */}
          {user ? (
            <form onSubmit={handlePostComment} className="bg-white border border-subtle rounded-xl p-4 shadow-xs space-y-3">
              <label className="block text-xs font-semibold text-charcoal">
                Post in Project Discussion
              </label>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share technical thoughts, architecture questions, or project updates..."
                required
                className="w-full p-3 text-xs border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{commentSubmitting ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600">
              Please <Link to="/login" className="text-navy font-semibold underline">sign in</Link> to participate in project discussions.
            </div>
          )}

          {/* Comment Thread */}
          <div className="space-y-4">
            {comments.map((comment) => {
              const isCommentAuthor = user && (comment.author?._id === user._id || comment.author === user._id);
              return (
                <div
                  key={comment._id}
                  className="bg-white border border-subtle rounded-xl p-4 shadow-xs flex items-start gap-3 justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-charcoal text-xs font-bold flex items-center justify-center shrink-0">
                      {comment.author?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">
                          {comment.author?.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-light mt-1.5 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {(isCommentAuthor || isAdmin) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50"
                      title="Delete comment"
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
                title="No discussions yet"
                description="Be the first to post a question or comment on this project thread."
              />
            )}
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title={`Request to Join: ${project.title}`}
      >
        <form onSubmit={handleSendJoinRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Proposed Team Role
            </label>
            <input
              type="text"
              value={proposedRole}
              onChange={(e) => setProposedRole(e.target.value)}
              placeholder="e.g. Backend Lead, Frontend Architect, ML Researcher"
              required
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Why do you want to collaborate on this project?
            </label>
            <textarea
              rows={4}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Describe your background, skills, and how you will contribute..."
              required
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setJoinModalOpen(false)}
              className="px-4 py-2 border border-subtle text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestSubmitting}
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light font-semibold disabled:opacity-50"
            >
              {requestSubmitting ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title="Add Project Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-charcoal mb-1">Task Title *</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Set up JWT authentication middleware"
              required
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal mb-1">Description</label>
            <textarea
              rows={2}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task acceptance criteria and details..."
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Assignee</label>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                <option value="">Unassigned</option>
                {project.owner && (
                  <option value={project.owner._id}>{project.owner.name} (Lead)</option>
                )}
                {project.members?.map((m) => (
                  <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                    {m.user?.name || 'Member'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Initial Status</label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Deadline</label>
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTaskModalOpen(false)}
              className="px-4 py-2 border border-subtle text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light font-semibold"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
