import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AdminAuthCard } from '../components/AdminAuthCard';
import { useAdminAuth } from '../context/admin-auth-context';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAdminAuth();

  const [email, setEmail] = useState('admin@chronicle.press');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      const rawFrom = searchParams.get('from') || '/';
      const redirect = rawFrom.replace(/^\/admin/, '') || '/';
      navigate(redirect);
    } else {
      setError(res.error || 'Authentication rejected. Verify credentials.');
    }
  };

  const handleQuickDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <AdminAuthCard
      title="Staff Console Sign In"
      subtitle="Access Chronicle editorial publishing, drafts curation, and publication metrics."
      badge="Editorial Staff & Admin Only"
      footerPrompt={{
        text: 'Invited new staff member?',
        linkText: 'Register Staff Account',
        href: '/register',
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Email */}
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
              placeholder="editor@chronicle.press"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Access Key / Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
            >
              Reset Key?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
            <input
              type="checkbox"
              checked={rememberTerminal}
              onChange={(e) => setRememberTerminal(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span>Remember workstation credentials</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Authenticate &amp; Enter CMS</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Autofill Buttons for Testing */}
      <div className="pt-4 border-t border-slate-800/60 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
          One-Click Demo Seats
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoFill('admin@chronicle.press')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Elena (Managing)</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoFill('tech@chronicle.press')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">Julian (SysAdmin)</span>
          </button>
        </div>
      </div>
    </AdminAuthCard>
  );
}
