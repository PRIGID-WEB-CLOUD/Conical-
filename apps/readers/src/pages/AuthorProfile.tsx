import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Author, Post } from '@chronicle/shared';
import { readerApi } from '../lib/api';
import { FollowAuthorButton } from '../components/FollowAuthorButton';
import { ArticleCard } from '../components/ArticleCard';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  GraduationCap,
  Globe,
  Share2,
  Check,
  Search,
  BookOpen,
  Eye,
  SlidersHorizontal,
  Mail,
  Quote
} from 'lucide-react';

export function AuthorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<Author | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [otherAuthors, setOtherAuthors] = useState<Author[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'readTime'>('latest');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    readerApi.getAuthor(id).then((res) => {
      if (res) {
        setAuthor(res.author);
        setPosts(res.posts);
      } else {
        setAuthor(null);
      }
    });

    readerApi.getAuthors().then((list) => {
      setOtherAuthors(list.filter((a) => a.id !== id && a.slug !== id));
    });
  }, [id]);

  const handleShare = async () => {
    if (!author) return;
    const shareData = {
      title: `${author.name} — Editorial Profile | The Chronicle`,
      text: author.bio,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  if (author === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-28 text-center text-sm text-slate-400">
        Loading author profile...
      </div>
    );
  }

  if (author === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Author Not Found</h1>
        <p className="text-sm text-slate-600">
          The editorial author profile you are looking for does not exist or has departed our staff.
        </p>
        <Link
          to="/masthead"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1e1b4b] px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Masthead</span>
        </Link>
      </div>
    );
  }

  // Filter & sort author's articles
  const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts
    .filter((p) => {
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === 'readTime') {
        return (b.readingTimeMinutes || 0) - (a.readingTimeMinutes || 0);
      }
      // default: latest
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });

  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="pb-24">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="border-b border-slate-200/80 bg-slate-50/60 py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <Link
            to="/masthead"
            className="flex items-center gap-1.5 hover:text-indigo-950 font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Masthead &amp; Editorial Staff</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Share author profile"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3 text-slate-500" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Author Bio & Header Section */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Avatar Column */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start space-y-4">
            <div className="relative group">
              <div className="h-44 w-44 sm:h-52 sm:w-52 rounded-3xl overflow-hidden ring-4 ring-slate-100 shadow-xl bg-slate-100">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
              </div>
            </div>

            {/* Follow Button & Action Group */}
            <div className="w-full pt-1 space-y-2.5">
              <div className="flex items-center justify-between gap-3 w-full">
                <FollowAuthorButton author={author} size="lg" showCount={true} className="w-full justify-between" />
              </div>

              {/* Social / External Links */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-indigo-950 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span>Personal Site</span>
                  </a>
                )}
                {author.website && (author.twitter || author.linkedin) && <span>·</span>}
                {author.twitter && (
                  <a
                    href={author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-950 hover:underline"
                  >
                    Twitter / X
                  </a>
                )}
                {author.twitter && author.linkedin && <span>·</span>}
                {author.linkedin && (
                  <a
                    href={author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-950 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Author &amp; Research Fellow
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                {author.name}
              </h1>
              <p className="text-sm sm:text-base font-medium text-slate-600 leading-snug">
                {author.role}
              </p>
            </div>

            {/* Unboxed Meta Indicators (No pills) */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 border-y border-slate-100 py-3.5">
              {author.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{author.location}</span>
                </div>
              )}
              {author.location && <span className="text-slate-300">·</span>}

              {author.joinedYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Contributing since {author.joinedYear}</span>
                </div>
              )}
              {author.joinedYear && <span className="text-slate-300">·</span>}

              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                <span>{posts.length || author.archiveCount} Published Pieces</span>
              </div>

              {totalViews > 0 && (
                <>
                  <span className="text-slate-300">·</span>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>{totalViews.toLocaleString()} Reader Views</span>
                  </div>
                </>
              )}
            </div>

            {/* Bio Narrative */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {author.bio}
            </p>

            {/* Academic / Background if present */}
            {author.education && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <GraduationCap className="h-4 w-4 text-indigo-700 shrink-0" />
                <span>Academic Foundation: {author.education}</span>
              </div>
            )}

            {/* Author Specialties */}
            {author.specialties && author.specialties.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Focus Areas &amp; Inquiries
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {author.specialties.map((s, idx) => (
                    <span
                      key={s}
                      className="text-xs font-semibold text-slate-700 bg-slate-100/90 rounded-md px-2.5 py-1 border border-slate-200/70"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Quote / Axiom */}
            {author.featuredQuote && (
              <div className="relative rounded-2xl bg-indigo-50/70 border border-indigo-100/80 p-5 sm:p-6 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                  <Quote className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Author Perspective</span>
                </div>
                <p className="font-serif italic text-sm sm:text-base text-indigo-950 leading-relaxed">
                  &ldquo;{author.featuredQuote}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Published Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200/80 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Editorial Portfolio
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Essays &amp; Critical Inquiries by {author.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing {filteredPosts.length} of {posts.length} published dispatches
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search author's essays..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
        </div>

        {/* Filter and Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#1e1b4b] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Sections' : cat}
                </button>
              );
            })}
          </div>

          {/* Sorting Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-900 cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="views">Most Read (Views)</option>
              <option value="readTime">Longest Read Time</option>
            </select>
          </div>
        </div>

        {/* Articles List / Grid */}
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-slate-50/60 rounded-3xl border border-slate-200/60 p-8">
            <BookOpen className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-slate-800">
              No matching articles found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No essays matching "${searchQuery}" in this category.`
                : 'This author has not published any essays in this category yet.'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-950 underline underline-offset-4 cursor-pointer pt-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Staff Colleagues Section */}
      {otherAuthors.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 border-t border-slate-200/80 mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Editorial Board
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Other Editorial Voices on the Masthead
              </h3>
            </div>
            <Link
              to="/masthead"
              className="text-xs font-semibold text-indigo-950 hover:underline hidden sm:inline"
            >
              View Complete Masthead &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherAuthors.slice(0, 4).map((colleague) => (
              <Link
                key={colleague.id}
                to={`/authors/${colleague.slug || colleague.id}`}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition-all"
              >
                <img
                  src={colleague.avatar}
                  alt={colleague.name}
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-300 transition-all shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-bold text-slate-900 group-hover:text-indigo-950 transition-colors truncate">
                    {colleague.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{colleague.role}</p>
                  <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">
                    {colleague.archiveCount} Articles &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
