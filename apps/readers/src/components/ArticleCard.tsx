import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@chronicle/shared';

interface ArticleCardProps {
  post: Post;
  variant?: 'grid' | 'compact';
}

export function ArticleCard({ post }: ArticleCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white transition-all hover:-translate-y-1">
      {/* Featured Thumbnail with Category badge */}
      <Link
        to={`/articles/${post.slug}`}
        className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-100 block"
      >
        <img
          src={post.featuredImage}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 z-10">
          <span className="rounded-md bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-xs">
            {post.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between pt-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'March 28, 2026'} • {post.readingTimeMinutes} min read
          </div>

          <Link to={`/articles/${post.slug}`} className="block">
            <h3 className="font-serif text-lg font-bold leading-snug text-slate-900 group-hover:text-indigo-900 transition-colors">
              {post.title}
            </h3>
          </Link>

          <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed font-normal">
            {post.excerpt || post.subtitle}
          </p>
        </div>

        {/* Author info */}
        <div className="mt-4 flex items-center justify-between gap-2.5 pt-2">
          <Link
            to={`/authors/${post.author.slug || post.author.id || post.author.name.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 group/author hover:text-indigo-950 transition-colors"
            title={`View ${post.author.name}'s profile`}
          >
            <div className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-slate-200">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-slate-700 group-hover/author:text-indigo-950 group-hover/author:underline">
              {post.author.name}
            </span>
          </Link>

          {post.views ? (
            <span className="text-[11px] text-slate-400 font-medium">
              {post.views.toLocaleString()} views
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
