import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users2,
  Check,
  X,
  Clock,
  Send,
  AlertCircle,
  ExternalLink,
  Shield,
  Trash2,
} from 'lucide-react';
import { joinRequestService, projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const MyTeamsPage = () => {
  const { user } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [receivedRes, sentRes, projectsRes] = await Promise.all([
        joinRequestService.getReceivedRequests(),
        joinRequestService.getSentRequests(),
        projectService.getMyProjects(),
      ]);

      if (receivedRes.data?.success) setReceivedRequests(receivedRes.data.data);
      if (sentRes.data?.success) setSentRequests(sentRes.data.data);
      if (projectsRes.data?.success) {
        // All projects where user is owner or member
        const all = [
          ...projectsRes.data.data.owned,
          ...projectsRes.data.data.joined,
        ];
        setMyProjects(all);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (requestId, status) => {
    setActionLoading(true);
    try {
      const res = await joinRequestService.respondToJoinRequest(requestId, { status });
      if (res.data?.success) {
        toast.success(`Collaboration request ${status}.`);
        setReceivedRequests(receivedRequests.filter(r => r._id !== requestId));
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (projectId, memberId) => {
    if (!window.confirm('Remove this collaborator from the team roster?')) return;
    try {
      const res = await projectService.updateOrRemoveMember(projectId, memberId, { remove: true });
      if (res.data?.success) {
        toast.success('Member removed from team.');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading team rosters and requests...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Teams & Collaborations</h1>
        <p className="text-xs text-charcoal-light mt-0.5">
          Review incoming join applications, track sent requests, and oversee team rosters
        </p>
      </div>

      {/* SECTION 1: RECEIVED REQUESTS (Actionable for project owners) */}
      <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-navy">
              Pending Collaboration Requests Received ({receivedRequests.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Applications to your projects</span>
        </div>

        {receivedRequests.length > 0 ? (
          <div className="space-y-3">
            {receivedRequests.map((req) => (
              <div
                key={req._id}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal">
                      {req.applicant?.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({req.applicant?.department} • {req.applicant?.year})
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                      Applied as: {req.proposedRole || 'Collaborator'}
                    </span>
                  </div>

                  <p className="text-xs text-navy font-medium">
                    Project: <Link to={`/projects/${req.project?._id}`} className="underline hover:text-accent">{req.project?.title}</Link>
                  </p>

                  <p className="text-xs text-charcoal-light italic">
                    "{req.message}"
                  </p>

                  {req.applicant?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {req.applicant.skills.map((s, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accept / Reject actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRespond(req._id, 'accepted')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Member</span>
                  </button>

                  <button
                    onClick={() => handleRespond(req._id, 'rejected')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-rose-600 text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No pending collaboration requests from peer students right now.
          </div>
        )}
      </div>

      {/* SECTION 2: SENT REQUESTS */}
      <div className="bg-white border border-subtle rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-accent" />
            <h2 className="text-base font-bold text-navy">
              Applications Sent by You ({sentRequests.length})
            </h2>
          </div>
        </div>

        {sentRequests.length > 0 ? (
          <div className="divide-y divide-subtle">
            {sentRequests.map((req) => (
              <div key={req._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <Link
                    to={`/projects/${req.project?._id}`}
                    className="font-semibold text-charcoal hover:text-navy"
                  >
                    {req.project?.title || 'Project'}
                  </Link>
                  <p className="text-[11px] text-slate-400">
                    Applied as: {req.proposedRole || 'Collaborator'} • Submitted {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={req.status} size="xs" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            You haven't sent any pending join requests.
          </div>
        )}
      </div>

      {/* SECTION 3: ACTIVE TEAMS ROSTER */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-navy">Your Active Project Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myProjects.map((p) => {
            const isOwner = user && (p.owner?._id === user._id || p.owner === user._id);
            return (
              <div key={p._id} className="bg-white border border-subtle rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                      {p.category}
                    </span>
                    <h3 className="text-sm font-bold text-navy line-clamp-1">
                      {p.title}
                    </h3>
                  </div>
                  <Link
                    to={`/projects/${p._id}`}
                    className="text-xs text-accent hover:text-navy font-semibold flex items-center gap-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Team roster */}
                <div className="space-y-2 pt-2 border-t border-subtle">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Team Capacity: {(p.members?.length || 0) + 1} / {p.maxTeamSize}
                    </span>
                    <StatusBadge status={p.status} size="xs" />
                  </div>

                  {/* Owner */}
                  <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center">
                        {p.owner?.name?.charAt(0) || 'L'}
                      </div>
                      <span className="font-medium text-charcoal">{p.owner?.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-navy">Project Lead</span>
                  </div>

                  {/* Members */}
                  {p.members?.map((m) => (
                    <div
                      key={m.user?._id || m.user}
                      className="p-2 border border-slate-100 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-charcoal text-[10px] font-bold flex items-center justify-center">
                          {m.user?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{m.user?.name}</p>
                          <p className="text-[10px] text-slate-400">{m.role || 'Collaborator'}</p>
                        </div>
                      </div>

                      {isOwner && (
                        <button
                          onClick={() => handleRemoveMember(p._id, m.user?._id || m.user)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Remove from team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyTeamsPage;
