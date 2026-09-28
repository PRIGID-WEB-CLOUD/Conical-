import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { Post } from '@chronicle/shared';
import {
  PenLine,
  Trash2,
  Edit3,
  Search,
  X,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Eye,
  Calendar,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Editorial & Design',
  'Architecture',
  'Future of Technology',
  'Technology',
  'Culture',
  'Sustainability',
  'Design Systems',
  'Engineering',
];

export function ArticlesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'title'>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const catQuery = filterCategory === 'All Categories' ? undefined : filterCategory;

    adminApi
      .getPosts({
        status: filterStatus,
        category: catQuery,
        search: search.trim() || undefined,
      })
      .then((data) => {
        if (!ignore) {
          setPosts(data);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [filterStatus, filterCategory, search]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete or archive this article?')) {
      await adminApi.deletePost(id);
      const catQuery = filterCategory === 'All Categories' ? undefined : filterCategory;
      const data = await adminApi.getPosts({
        status: filterStatus,
        category: catQuery,
        search: search.trim() || undefined,
      });
      setPosts(data);
    }
  };

  const handleResetFilters = () => {
    setLoading(true);
    setFilterStatus('all');
    setFilterCategory('All Categories');
    setSearch('');
    setSortBy('newest');
  };

  const isFiltered = filterStatus !== 'all' || filterCategory !== 'All Categories' || search.trim().length > 0;

  // Client-side sorting for instant UX
  const sortedPosts = useMemo(() => {
    const list = [...posts];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => {
          const tA = a.publishedAt || a.updatedAt || '';
          const tB = b.publishedAt || b.updatedAt || '';
          return tB.localeCompare(tA);
        });
      case 'oldest':
        return list.sort((a, b) => {
          const tA = a.publishedAt || a.updatedAt || '';
          const tB = b.publishedAt || b.updatedAt || '';
          return tA.localeCompare(tB);
        });
      case 'views':
        return list.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }, [posts, sortBy]);

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Editorial Manuscripts
            </span>
            {isFiltered && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-2.5 h-2.5" />
                Filtered View
              </span>
            )}
          </div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5">
            Articles &amp; Publications
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Manage published manuscripts, drafts, editorial taxonomy, and circulation archives.
          </p>
        </div>

        <Link
          to="/editor"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e1b4b] hover:bg-indigo-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors shrink-0"
        >
          <PenLine className="h-4 w-4" />
          <span>Compose New Post</span>
        </Link>
      </div>

      {/* Control Panel: Global Search + Category Filter + Status Filter + Sort */}
      <div className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        {/* Top Row: Global Search Input & Quick Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Global Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setLoading(true);
                setSearch(e.target.value);
              }}
              placeholder="Search by title, author, category, tags, or content keywords..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative min-w-[180px] w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  setLoading(true);
                  setFilterCategory(e.target.value);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/80 pl-8 pr-8 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[150px] w-full sm:w-auto">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/80 pl-8 pr-8 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Status Filter Tabs & Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'All Statuses' },
              { key: 'published', label: 'Published' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'draft', label: 'Drafts' },
              { key: 'archived', label: 'Archived' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => {
                  setLoading(true);
                  setFilterStatus(st.key);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === st.key
                    ? 'bg-[#1e1b4b] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Article Count Badge */}
          <div className="text-[11px] font-medium text-slate-500 shrink-0">
            Showing <strong className="text-slate-900 font-bold">{sortedPosts.length}</strong> {sortedPosts.length === 1 ? 'article' : 'articles'}
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {loading ? (
          <div className="py-24 text-center space-y-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-900 border-t-transparent" />
            <div className="text-xs text-slate-500">Retrieving articles...</div>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <div className="font-serif text-lg font-bold text-slate-800">No matching articles found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No manuscripts match your active search terms or category criteria. Try broadening your filter parameters.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3.5 sm:gap-4 hover:bg-slate-50/70 transition-colors group"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="h-16 w-20 sm:w-24 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs group-hover:opacity-90 transition-opacity"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {post.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : post.status === 'scheduled'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {post.status}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <span className="hidden md:inline text-[10px] text-slate-400">
                          #{post.tags.slice(0, 2).join(' #')}
                        </span>
                      )}
                    </div>

                    <Link to={`/editor?id=${post.id}`} className="block">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-950 transition-colors line-clamp-1 sm:line-clamp-none">
                        {post.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400 flex-wrap">
                      <span className="font-medium text-slate-600">{post.author.name}</span>
                      <span>•</span>
                      <span>{post.readingTimeMinutes} min read</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        {post.views?.toLocaleString() || 0} views
                      </span>
                      {post.publishedAt && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={`/editor?id=${post.id}`}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="rounded-xl border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
                    title="Archive / Delete article"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
