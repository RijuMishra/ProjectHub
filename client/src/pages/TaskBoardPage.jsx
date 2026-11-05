import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckSquare, Plus, Filter, Calendar } from 'lucide-react';
import { taskService, projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const TaskBoardPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(queryProjectId || 'all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    deadline: '',
  });

  const fetchUserProjects = async () => {
    try {
      const res = await projectService.getMyProjects();
      if (res.data?.success) {
        const all = [...res.data.data.owned, ...res.data.data.joined];
        setProjects(all);
        if (queryProjectId) {
          setSelectedProjectId(queryProjectId);
        } else if (all.length > 0 && selectedProjectId === 'all') {
          // keep all or set default
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      if (selectedProjectId !== 'all') {
        const res = await taskService.getTasksByProject(selectedProjectId);
        if (res.data?.success) setTasks(res.data.data);
      } else {
        // Fetch all assigned tasks for user
        const res = await taskService.getMyTasks();
        if (res.data?.success) setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedProjectId]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateTask(taskId, { status: newStatus });
      if (res.data?.success) {
        setTasks(tasks.map((t) => (t._id === taskId ? res.data.data : t)));
        toast.success(`Task status changed to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Could not update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success('Task removed.');
    } catch (err) {
      toast.error('Could not delete task.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) {
      toast.error('Please provide a title and select a project.');
      return;
    }
    try {
      const res = await taskService.createTask(newTask);
      if (res.data?.success) {
        toast.success('Task created successfully.');
        setTasks([res.data.data, ...tasks]);
        setModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          projectId: selectedProjectId !== 'all' ? selectedProjectId : '',
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

  const selectedProjectObj = projects.find((p) => p._id === selectedProjectId);

  const statuses = ['To Do', 'In Progress', 'Under Review', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Task Management Board</h1>
          <p className="text-xs text-charcoal-light mt-0.5">
            Organize engineering milestones, assign team deliverables, and monitor sprint progress
          </p>
        </div>

        <button
          onClick={() => {
            setNewTask((prev) => ({
              ...prev,
              projectId: selectedProjectId !== 'all' ? selectedProjectId : projects[0]?._id || '',
            }));
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white border border-subtle rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-charcoal">Select Project Scope:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSearchParams(e.target.value === 'all' ? {} : { projectId: e.target.value });
            }}
            className="px-3 py-1.5 border border-subtle rounded-lg bg-slate-50 font-medium text-slate-700 focus:outline-none focus:border-navy"
          >
            <option value="all">My Assigned Tasks (Across All Projects)</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                Project: {p.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400">
          Showing {tasks.length} total tasks
        </span>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statuses.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              className="bg-slate-50/70 border border-subtle rounded-2xl p-3 flex flex-col min-h-[420px]"
            >
              <div className="flex items-center justify-between px-2 py-1 mb-3 border-b border-subtle pb-2">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  {status}
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-charcoal text-[11px] font-semibold flex items-center justify-center">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    canManage={true}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No {status} tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Task */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Sprint Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Select Project *
            </label>
            <select
              value={newTask.projectId}
              onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-subtle rounded-lg bg-white focus:outline-none focus:border-navy"
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-charcoal mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Design relational database ER diagram"
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
              placeholder="Detailed specifications, references, or instructions..."
              className="w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="flex justify-end gap-2 pt-2 border-t border-subtle">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-subtle text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light font-semibold"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskBoardPage;
