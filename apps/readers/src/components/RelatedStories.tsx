import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@chronicle/shared';

interface RelatedStoriesProps {
  posts: Post[];
  currentPostId: string;
}

export function RelatedStories({ posts, currentPostId }: RelatedStoriesProps) {
  const filtered = posts.filter((p) => p.id !== currentPostId).slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-6 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold text-slate-900">
          Related Critical Essays
        </h3>
        <Link
          to="/articles"
          className="text-xs font-semibold text-indigo-900 hover:underline"
        >
          View Full Archive →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-slate-200"
          >
            <Link
              to={`/articles/${post.slug}`}
              className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-slate-100 block"
            >
              <img
                src={post.featuredImage}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                {post.category}
              </span>
            </Link>

            <div className="space-y-1.5 flex-1 flex flex-col justify-between">
              <div className="text-[11px] text-slate-400">
                {post.readingTimeMinutes} min read
              </div>
              <Link to={`/articles/${post.slug}`} className="block">
                <h4 className="font-serif text-base font-bold leading-snug text-slate-900 group-hover:text-indigo-950 transition-colors">
                  {post.title}
                </h4>
              </Link>
              <div className="text-xs text-slate-500 pt-2">{post.author.name}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
