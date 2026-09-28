import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, UserPlus, LogIn } from 'lucide-react';

interface AdminAuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  footerPrompt?: {
    text: string;
    linkText: string;
    href: string;
  };
}

export function AdminAuthCard({
  children,
  title,
  subtitle,
  badge = 'Staff & Admin Portal Only',
  footerPrompt,
}: AdminAuthCardProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar for standalone admin application */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-900 font-serif font-bold text-base shadow-xs">
            C
          </div>
          <span className="text-xs font-semibold text-slate-300 tracking-wide font-mono">
            CHRONICLE EDITORIAL CMS
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-[11px] text-slate-400">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono">ENCLAVE SECURED</span>
        </div>
      </header>

      {/* Main card container */}
      <main className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 px-3.5 py-1 text-xs font-semibold text-indigo-300 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{badge}</span>
            </span>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-slate-800 bg-[#12161f]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                {subtitle}
              </p>
            </div>

            {children}

            {footerPrompt && (
              <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
                {footerPrompt.text}{' '}
                <Link
                  to={footerPrompt.href}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  {footerPrompt.linkText}
                </Link>
              </div>
            )}
          </div>

          {/* Quick tab switcher between auth actions */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
            <Link
              to="/login"
              className={`hover:text-slate-300 transition-colors flex items-center gap-1.5 ${
                pathname === '/login' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <span>•</span>
            <Link
              to="/register"
              className={`hover:text-slate-300 transition-colors flex items-center gap-1.5 ${
                pathname === '/register' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Staff Register</span>
            </Link>
            <span>•</span>
            <Link
              to="/forgot-password"
              className={`hover:text-slate-300 transition-colors flex items-center gap-1.5 ${
                pathname === '/forgot-password' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Reset Key</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>Chronicle Publishing Company • Editorial Operations Enclave</div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Restricted Administrative Access Only</span>
        </div>
      </footer>
    </div>
  );
}
