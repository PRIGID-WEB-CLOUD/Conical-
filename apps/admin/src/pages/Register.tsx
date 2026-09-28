import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuthCard } from '../components/AdminAuthCard';
import { useAdminAuth, ADMIN_INVITATION_CODE } from '../context/admin-auth-context';
import { AdminRole } from '@chronicle/shared';
import { User, Mail, Lock, Key, Loader2, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAdminAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('Senior Editor');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(ADMIN_INVITATION_CODE);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await register({
      name,
      email,
      role,
      pass: password,
      inviteCode,
    });

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Registration rejected.');
    }
  };

  return (
    <AdminAuthCard
      title="Staff Account Provisioning"
      subtitle="Register a verified staff editorial key using your institutional invitation voucher."
      badge="Staff Invitation Only"
      footerPrompt={{
        text: 'Already hold an active editorial seat?',
        linkText: 'Sign In to Console',
        href: '/login',
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
            Staff Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Clara Sterling"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
            Staff Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="c.sterling@chronicle.press"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Editorial Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Managing Editor">Managing Editor</option>
              <option value="Senior Editor">Senior Editor</option>
              <option value="Systems Administrator">Systems Administrator</option>
              <option value="Editorial Fellow">Editorial Fellow</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Staff Invite Code
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="CHRONICLE-STAFF-2025"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs font-mono text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
            Set Access Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Authorize &amp; Provision Seat</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AdminAuthCard>
  );
}
