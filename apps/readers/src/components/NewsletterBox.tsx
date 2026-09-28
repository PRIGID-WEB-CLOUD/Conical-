import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { readerApi } from '../lib/api';

export function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      await readerApi.subscribe(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="overflow-hidden rounded-3xl bg-[#1e1b4b] p-8 sm:p-12 lg:p-16 text-white relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-200 backdrop-blur-xs">
          <Mail className="h-3.5 w-3.5" />
          <span>The Chronicle Dispatch</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          Thoughtful Essays, Delivered Every Sunday Morning.
        </h2>

        <p className="text-sm sm:text-base text-indigo-100/80 leading-relaxed max-w-xl mx-auto font-normal">
          Join over 28,000 architects, designers, urbanists, and researchers. Zero algorithmic fluff, sponsored clutter, or noise.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 px-6 py-4 text-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold">
              Thank you for subscribing! Please check your inbox for the welcome edition.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your institutional or work email..."
              className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white placeholder:text-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 backdrop-blur-xs"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto shrink-0 rounded-2xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-md hover:bg-indigo-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Joining...' : 'Subscribe Free'}
            </button>
          </form>
        )}

        <div className="text-[11px] text-indigo-200/50">
          Strict privacy adherence. One-click unsubscribe at any time.
        </div>
      </div>
    </section>
  );
}
