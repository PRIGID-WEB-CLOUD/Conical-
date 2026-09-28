import React from 'react';
import { Link } from 'react-router-dom';
import { Author } from '@chronicle/shared';
import { FollowAuthorButton } from './FollowAuthorButton';
import { BookOpen } from 'lucide-react';

interface AuthorSpotlightProps {
  author: Author;
  variant?: 'spotlight' | 'inlineBio';
  featuredQuote?: string;
  readTime?: string;
  views?: string;
}

export function AuthorSpotlight({
  author,
  variant = 'spotlight',
  featuredQuote,
  readTime = '12 min read',
  views = '24.5k Views',
}: AuthorSpotlightProps) {
  if (variant === 'inlineBio') {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-6 sm:p-8">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-200">
          <img
            src={author.avatar}
            alt={author.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">About the Author</div>
            <FollowAuthorButton author={author} size="sm" showCount={true} />
          </div>
          <h4 className="font-serif text-lg font-bold text-slate-900">{author.name}</h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{author.bio}</p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              to={`/authors/${author.slug || author.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-900 hover:text-indigo-950 underline underline-offset-4"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>View Full Profile &amp; Archive ({author.archiveCount} articles) &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Author left */}
        <div className="md:col-span-4 flex flex-col items-start space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-indigo-50">
            <img
              src={author.avatar}
              alt={author.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Author Spotlight
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">{author.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{author.role}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 w-full">
            <FollowAuthorButton author={author} size="md" showCount={true} />
          </div>

          <Link
            to={`/authors/${author.slug || author.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-500" />
            <span>View Profile &amp; {author.archiveCount} Articles &rarr;</span>
          </Link>
        </div>

        {/* Featured Essay right */}
        <div className="md:col-span-8 space-y-4 md:pl-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Featured Essay
          </div>
          <h4 className="font-serif text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            The Archaeology of the Future: Preservation in an Era of Digital Ephemera
          </h4>
          <p className="italic text-sm text-slate-600 leading-relaxed font-serif">
            &ldquo;{featuredQuote || 'As physical artifacts give way to cloud-based streams, our collective memory is undergoing a profound mutation. We must ask ourselves what stories survive when the medium itself dissolves into code.'}&rdquo;
          </p>
          <div className="flex items-center gap-6 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>📖</span> {readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <span>👁</span> {views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
