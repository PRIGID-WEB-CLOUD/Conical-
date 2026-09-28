import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Mail, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { readerApi } from '../lib/api';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await readerApi.subscribe(email);
      setSubscribed(true);
      setEmail('');
    } catch {
      setError('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-600 transition-all">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Footer Newsletter Subscription Box */}
        <div id="footer-newsletter" className="mb-12 rounded-3xl bg-slate-900 p-6 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                <Mail className="h-3 w-3 text-indigo-400" />
                <span>Weekly Sunday Edition</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Subscribe to The Chronicle Journal
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Receive curated spatial criticism, architectural longforms, and cognitive research directly in your inbox every Sunday morning.
              </p>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[380px]">
              {subscribed ? (
                <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 p-4 text-emerald-200 text-xs sm:text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>You&apos;re subscribed! Welcome to the Chronicle Sunday dispatch.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                        placeholder="your.email@institution.edu"
                        className="w-full rounded-2xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe Free</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                  {error && <p className="text-[11px] text-rose-400 font-medium pl-1">{error}</p>}
                  <p className="text-[10px] text-slate-400 pl-1">No spam ever. Unsubscribe in one click.</p>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand and Mission */}
          <div className="md:col-span-5 lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size={32} showText={true} />
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              Chronicle is an independent editorial journal publishing longform criticism, spatial research, and cultural commentary at the intersection of architecture, artificial intelligence, and urban philosophy.
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-2">
              ISSN 2984-1802 • Published Weekly in London &amp; San Francisco
            </div>
          </div>

          {/* Nav column 1: Editorial Sections */}
          <div className="md:col-span-2 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Sections
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/articles" className="hover:text-indigo-950 transition-colors">
                  All Essays
                </Link>
              </li>
              <li>
                <Link to="/articles?category=Architecture" className="hover:text-indigo-950 transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link to="/articles?category=Technology" className="hover:text-indigo-950 transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/articles?category=Design" className="hover:text-indigo-950 transition-colors">
                  Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav column 2: Publication */}
          <div className="md:col-span-2 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Journal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-indigo-950 transition-colors">
                  About Chronicle
                </Link>
              </li>
              <li>
                <Link to="/masthead" className="hover:text-indigo-950 transition-colors">
                  Masthead &amp; Editors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-950 transition-colors">
                  Letters &amp; Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav column 3: Transparency & Legal */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Legal &amp; Terms
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/privacy" className="hover:text-indigo-950 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-950 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/citations" className="hover:text-indigo-950 transition-colors">
                  Citation Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Chronicle Publishing Company. All rights reserved.
          </div>
          <div className="text-slate-400 text-right">
            Independent journalism &amp; spatial criticism
          </div>
        </div>
      </div>
    </footer>
  );
}
