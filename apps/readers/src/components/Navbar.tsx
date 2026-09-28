import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Menu, X, ArrowRight, BookOpen, Compass, Info, Mail, Users } from 'lucide-react';
import { useFollowAuthor } from '../context/follow-author-context';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { followedAuthorIds, openFollowedModal } = useFollowAuthor();

  const isHome = location.pathname === '/';
  const isArticles = location.pathname.startsWith('/articles');
  const isAbout = location.pathname.startsWith('/about');
  const isMasthead = location.pathname.startsWith('/masthead');

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();

    const scrollToNewsletter = () => {
      const el = document.getElementById('footer-newsletter') || document.querySelector('footer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the email input if available
        const input = el.querySelector('input[type="email"]') as HTMLInputElement | null;
        if (input) input.focus();
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollToNewsletter, 150);
    } else {
      scrollToNewsletter();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Logo size={28} showText={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isHome
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </Link>
          <Link
            to="/articles"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isArticles
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Archives
          </Link>
          <Link
            to="/about"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isAbout
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            About
          </Link>
          <Link
            to="/masthead"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isMasthead
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Masthead
          </Link>
        </nav>

        {/* Right Desktop CTA + Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Following Authors Drawer Trigger */}
          <button
            type="button"
            onClick={openFollowedModal}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            title="View and manage followed authors"
          >
            <Users className="h-3.5 w-3.5 text-indigo-700" />
            <span>Following</span>
            {followedAuthorIds.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-950 px-1 text-[10px] font-bold text-white">
                {followedAuthorIds.length}
              </span>
            )}
          </button>

          {/* Desktop Subscribe CTA */}
          <button
            type="button"
            onClick={handleSubscribeClick}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#1e1b4b] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-950 transition-colors cursor-pointer"
          >
            <span>Subscribe</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex md:hidden items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-900 transition-colors cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Primary Nav Links */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isHome
                    ? 'bg-[#1e1b4b] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Compass className="h-4 w-4 shrink-0" />
                <span>Home &amp; Highlights</span>
              </Link>
              <Link
                to="/articles"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isArticles
                    ? 'bg-[#1e1b4b] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Essays &amp; Archives</span>
              </Link>
              <Link
                to="/about"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isAbout
                    ? 'bg-[#1e1b4b] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Info className="h-4 w-4 shrink-0" />
                <span>About Chronicle</span>
              </Link>
              <Link
                to="/masthead"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isMasthead
                    ? 'bg-[#1e1b4b] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>Masthead &amp; Editors</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openFollowedModal();
                }}
                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-indigo-700 shrink-0" />
                  <span>Followed Authors</span>
                </div>
                {followedAuthorIds.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {followedAuthorIds.length}
                  </span>
                )}
              </button>
            </div>

            {/* Subscribe Action in Mobile Menu */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSubscribeClick}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-indigo-950 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-indigo-900 transition-colors cursor-pointer"
              >
                <span>Subscribe to Sunday Journal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Free weekly dispatch delivered every Sunday morning.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
