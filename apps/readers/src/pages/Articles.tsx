import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Post } from '@chronicle/shared';
import { readerApi } from '../lib/api';
import { ArticleCard } from '../components/ArticleCard';
import { CategorySlider } from '../components/CategorySlider';
import { Search } from 'lucide-react';

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const initialCat = searchParams.get('category') || 'all';
  const [category, setCategory] = useState(initialCat);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;
    readerApi.getPosts(category, search).then((data) => {
      if (!ignore) {
        setPosts(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [category, search]);

  const categories = [
    'all',
    'Architecture',
    'Future of Technology',
    'Editorial & Design',
    'Technology',
    'Culture',
    'Sustainability',
  ];

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    setLoading(true);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 space-y-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Chronicle Archives
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
          All Essays, Research &amp; Dispatches
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Browse our complete catalog of spatial criticism, architectural investigations, cognitive computing essays, and design theory.
        </p>
      </div>

      {/* Full-width Search Bar at the Top */}
      <div className="w-full">
        <div className="relative w-full">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complete archives, essays, authors, and topics..."
            className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-12 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-indigo-900 focus:outline-none focus:ring-4 focus:ring-indigo-900/10 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear search"
            >
              <span className="sr-only">Clear</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Slider */}
      <div>
        <CategorySlider
          categories={categories}
          selectedCategory={category}
          onSelectCategory={handleCategoryClick}
          autoSlideIntervalMs={5000}
        />
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-2">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-900 border-t-transparent" />
          <div className="text-xs text-slate-500">Querying Chronicle archives...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-12 text-center space-y-2">
          <p className="font-serif text-lg font-bold text-slate-800">No articles match your criteria</p>
          <p className="text-xs text-slate-500">Try adjusting your keyword search or clearing the category filter.</p>
          <button
            type="button"
            onClick={() => {
              handleCategoryClick('all');
              setSearch('');
            }}
            className="mt-2 inline-block rounded-xl bg-[#1e1b4b] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <motion.div
          key={category + search}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
