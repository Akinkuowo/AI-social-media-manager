'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  User, 
  MoreVertical, 
  Trash2, 
  History,
  Clock,
  CheckCircle2,
  Mail,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER';

interface Member {
  id: string;
  role: Role;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    name: string | null;
  } | null;
}

const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Content Manager',
  VIEWER: 'Viewer'
};

const ROLE_ICONS: Record<Role, any> = {
  OWNER: ShieldCheck,
  ADMIN: Shield,
  MANAGER: User,
  VIEWER: User
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('VIEWER');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [teamRes, logsRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/team/logs')
      ]);

      if (teamRes.ok) {
        const { members, invitations } = await teamRes.json();
        setMembers(members);
        setInvitations(invitations);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.error("FAILED_TO_FETCH_TEAM:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInvite(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
        setInviteEmail('');
        setIsInviteModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Failed to send invitation' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("FAILED_TO_UPDATE_ROLE:", err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("FAILED_TO_REMOVE_MEMBER:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full mx-auto pb-12">
      <header className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Collaboration</h1>
          <p className="text-sm text-muted mt-1">Manage members, roles, and track workspace activity.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus size={18} className="mr-2" /> Invite Member
        </Button>
      </header>

      {message.text && (
        <div className={clsx(
          "p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2",
          message.type === 'error' ? 'bg-error/10 text-error border-error/20' : 'bg-success/10 text-success border-success/20'
        )}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-8 max-xl:grid-cols-1">
        <div className="flex flex-col gap-8">
          {/* Members Table */}
          <Card variant="glass" padding="none">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Users size={20} className="text-primary" /> Active Members
              </h3>
              <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">{members.length} Members</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-muted font-semibold border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {members.map((member) => {
                    const RoleIcon = ROLE_ICONS[member.role];
                    return (
                      <tr key={member.id} className="hover:bg-surface-hover transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden">
                              {member.user.image ? <img src={member.user.image} alt="Avatar" className="w-full h-full object-cover" /> : (member.user.name?.charAt(0) || 'U')}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{member.user.name || 'Anonymous'}</p>
                              <p className="text-xs text-muted">{member.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 w-fit">
                            <select 
                              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-foreground hover:text-primary transition-colors pr-8 appearance-none"
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.id, e.target.value as Role)}
                              disabled={member.role === 'OWNER'}
                            >
                              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                <option key={val} value={val} className="bg-surface">{label}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase tracking-wider font-bold">
                              <RoleIcon size={12} className={clsx(member.role === 'OWNER' ? 'text-warning' : 'text-primary')} />
                              {ROLE_LABELS[member.role]}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                            disabled={member.role === 'OWNER'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Card variant="glass" padding="none">
              <div className="p-6 border-b border-border">
                <h3 className="font-bold flex items-center gap-2">
                  <Mail size={20} className="text-warning" /> Pending Invitations
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-border/50">
                    {invitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{invite.email}</p>
                          <p className="text-xs text-muted">Sent {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted">{ROLE_LABELS[invite.role]}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-semibold text-warning bg-warning/10 px-3 py-1 rounded-full">Pending</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Activity Feed Sidebar */}
        <div className="flex flex-col gap-6 sticky top-8 h-fit">
          <Card variant="glass" padding="lg">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <History size={20} className="text-primary" /> Activity Logs
            </h3>
            <div className="flex flex-col gap-6">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className="w-2 h-2 rounded-full bg-primary/40 mt-1.5 flex-shrink-0 relative z-10"></div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold text-foreground">{log.user?.name || 'System'}</span>{" "}
                        {log.details || log.action.toLowerCase().replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted">No recent activity</div>
              )}
            </div>
          </Card>

          <Card variant="glass" padding="lg" className="bg-primary/5 border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Role Permissions</h4>
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Guide</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <p><strong className="text-foreground">Owner:</strong> Full access + billing control.</p>
              <p><strong className="text-foreground">Admin:</strong> Manage team & content.</p>
              <p><strong className="text-foreground">Content Manager:</strong> Create & schedule posts.</p>
              <p><strong className="text-foreground">Viewer:</strong> View analytics & posts only.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInvite} className="flex flex-col gap-6 py-4">
          <Input 
            label="Email Address" 
            placeholder="colleague@example.com" 
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Assign Role</label>
            <div className="grid grid-cols-2 gap-3">
              {(['ADMIN', 'MANAGER', 'VIEWER'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setInviteRole(r)}
                  className={clsx(
                    "px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                    inviteRole === r 
                      ? "bg-primary/10 border-primary text-primary shadow-sm" 
                      : "bg-surface border-border text-muted hover:border-primary/50"
                  )}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" type="submit" isLoading={isSubmittingInvite}>Send Invitation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
