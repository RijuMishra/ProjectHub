import React from 'react';
import { Calendar, User, Clock, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

const TaskCard = ({ task, onStatusChange, onDelete, canManage }) => {
  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== 'Completed';

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const statuses = ['To Do', 'In Progress', 'Under Review', 'Completed'];

  return (
    <div className="bg-white border border-subtle rounded-xl p-4 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getPriorityStyle(
              task.priority
            )}`}
          >
            {task.priority} Priority
          </span>

          {canManage && onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <h4 className="text-sm font-semibold text-charcoal mb-1 leading-snug">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-charcoal-light line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {task.project && (
          <p className="text-[11px] font-medium text-accent truncate mb-3">
            {task.project.title || task.project}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-subtle space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          {/* Assignee */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-charcoal flex items-center justify-center text-[10px] font-semibold">
              {task.assignedTo?.name?.charAt(0) || '?'}
            </div>
            <span className="truncate max-w-[90px] text-[11px]">
              {task.assignedTo?.name || 'Unassigned'}
            </span>
          </div>

          {/* Deadline */}
          {task.deadline && (
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Status selector */}
        {canManage ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="w-full text-xs py-1 px-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-navy focus:bg-white"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-right">
            <StatusBadge status={task.status} size="xs" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
