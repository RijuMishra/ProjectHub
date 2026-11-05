import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Completed':
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Planning':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'On Hold':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'To Do':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = size === 'xs' 
    ? 'text-[11px] px-2 py-0.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${sizeClasses} ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
