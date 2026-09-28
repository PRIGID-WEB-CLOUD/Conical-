import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Post } from '@chronicle/shared';
import { readerApi } from '../lib/api';
import { HeroStory } from '../components/HeroStory';
import { ArticleCard } from '../components/ArticleCard';
import { AuthorSpotlight } from '../components/AuthorSpotlight';
import { CategorySlider } from '../components/CategorySlider';
import { INITIAL_AUTHORS } from '@chronicle/shared';

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    readerApi.getPosts().then(setPosts);
  }, []);

  const heroPost = posts[0];
  const secondaryPosts = posts.slice(1);

  const categories = [
    'all',
    'Architecture',
    'Future of Technology',
    'Editorial & Design',
    'Technology',
    'Culture',
    'Sustainability',
  ];

  const filteredPosts =
    selectedCategory === 'all'
      ? secondaryPosts
      : secondaryPosts.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Top Magazine Masthead Headline */}
      <section className="text-center pt-8 sm:pt-12 pb-4 space-y-4 max-w-3xl mx-auto px-4">
        <div className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-slate-300 pb-1">
          Issue No. 42 • Spatial Architecture &amp; Intelligence
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
          Chronicle
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-serif italic max-w-xl mx-auto">
          &ldquo;Rigorous criticism, spatial essays, and investigative design journalism for a transforming century.&rdquo;
        </p>
      </section>

      {/* Hero Story */}
      {heroPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroStory post={heroPost} />
        </section>
      )}

      {/* Auto-Slidable Category Filter Bar & Recent Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Auto-slidable section transition bar (Selected Essays text removed) */}
        <CategorySlider
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          autoSlideIntervalMs={4500}
        />

        {/* Animated 3-column Articles Grid */}
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]"
        >
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-16 space-y-2 border border-dashed border-slate-200 rounded-3xl bg-slate-50">
              <p className="font-serif text-base font-bold text-slate-800">
                No dispatches currently listed under {selectedCategory}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-semibold text-indigo-900 underline cursor-pointer"
              >
                View all section dispatches
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => <ArticleCard key={post.id} post={post} />)
          )}
        </motion.div>

        <div className="text-center pt-4">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Explore Complete Archives ({posts.length} Pieces) &rarr;
          </Link>
        </div>
      </section>

      {/* Author Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AuthorSpotlight author={INITIAL_AUTHORS.elena} />
      </section>
    </div>
  );
}
