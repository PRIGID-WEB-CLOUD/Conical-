import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@chronicle/shared';

interface HeroStoryProps {
  post: Post;
}

export function HeroStory({ post }: HeroStoryProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-slate-50/60 p-6 md:p-10 lg:p-12 border border-slate-100 transition-all hover:border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left text column */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#3b49df] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-xs">
              Editor&apos;s Pick
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Published 2 hours ago • {post.readingTimeMinutes} min read
            </span>
          </div>

          <Link to={`/articles/${post.slug}`} className="group-hover:text-indigo-950 transition-colors">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              {post.title}
            </h1>
          </Link>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {post.subtitle || post.excerpt}
          </p>

          {/* Author metadata */}
          <Link
            to={`/authors/${post.author.slug || post.author.id || post.author.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex items-center gap-3.5 pt-2 group/author w-fit"
            title={`View ${post.author.name}'s profile`}
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-slate-100 group-hover/author:ring-indigo-300 transition-all">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 group-hover/author:text-indigo-950 transition-colors">
                {post.author.name}
              </div>
              <div className="text-xs text-slate-500">{post.author.role}</div>
            </div>
          </Link>
        </div>

        {/* Right image column */}
        <div className="lg:col-span-6">
          <Link to={`/articles/${post.slug}`} className="block relative aspect-4/3 sm:aspect-16/11 lg:aspect-4/3 w-full overflow-hidden rounded-2xl shadow-md transition-transform duration-500 group-hover:scale-[1.01]">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
          </Link>
        </div>
      </div>
    </article>
  );
}
