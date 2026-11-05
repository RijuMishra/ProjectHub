import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  UserPlus,
  MessageSquare,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { notificationService } from '../services/api';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (e) {
      toast.error('Failed to mark all as read.');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'join_request':
      case 'request_accepted':
      case 'new_member':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'task_assigned':
      case 'task_status_changed':
        return <CheckSquare className="w-4 h-4 text-purple-600" />;
      case 'new_comment':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-navy" />;
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading notifications...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Notifications</h1>
          <p className="text-xs text-charcoal-light mt-0.5">
            Real-time updates regarding collaboration requests, tasks, and project discussions
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg text-charcoal hover:bg-slate-100 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-navy" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-subtle rounded-2xl shadow-xs divide-y divide-subtle overflow-hidden">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.read ? 'bg-white' : 'bg-slate-50/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1 text-xs">
                  <p className={`leading-relaxed ${notif.read ? 'text-charcoal' : 'text-charcoal font-semibold'}`}>
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>

                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                        className="text-accent hover:text-navy font-medium inline-flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="text-slate-400 hover:text-navy p-1 rounded hover:bg-slate-200/50 transition-colors shrink-0"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You do not have any notifications at this time."
          />
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
