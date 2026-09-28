import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuthCard } from '../components/AdminAuthCard';
import { useAdminAuth } from '../context/admin-auth-context';
import { Mail, Key, Lock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAdminAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('admin@chronicle.press');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    if (res.success) {
      setResetCode(res.resetCode || '748-291');
      setStep(2);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const valid = await verifyResetCode(email, resetCode);
    setLoading(false);
    if (valid) {
      setStep(3);
    } else {
      setMessage('Invalid verification code.');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await resetPassword(email, newPassword);
    setLoading(false);
    navigate('/login');
  };

  return (
    <AdminAuthCard
      title="Reset Staff Access Key"
      subtitle="Recover your administrative credentials via staff verification dispatch."
      badge="Key Recovery Protocol"
      footerPrompt={{
        text: 'Remember your access key?',
        linkText: 'Return to Sign In',
        href: '/login',
      }}
    >
      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter your registered staff email address to receive a secure 6-digit recovery code.
          </p>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@chronicle.press"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Dispatch Verification Code</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-3.5 text-xs text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Demo code auto-dispatched: <strong>748-291</strong></span>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              6-Digit Staff Code
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="748-291"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-xs font-mono text-center text-lg tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {message && <div className="text-xs text-rose-400">{message}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify Code</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleCompleteReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Enter New Access Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Update Access Key &amp; Sign In</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}
    </AdminAuthCard>
  );
}
