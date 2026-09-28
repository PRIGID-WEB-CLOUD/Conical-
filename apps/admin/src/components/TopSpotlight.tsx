import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@chronicle/shared';
import { Edit3 } from 'lucide-react';

interface TopSpotlightProps {
  post?: Post;
}

export function TopSpotlight({ post }: TopSpotlightProps) {
  if (!post) return null;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4">
          <span className="text-sm font-bold text-slate-900">Top Spotlight</span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            Trending
          </span>
        </div>

        {/* Thumbnail with overlay title */}
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-900 block">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h4 className="font-serif text-sm sm:text-base font-bold leading-snug line-clamp-2">
              {post.title}
            </h4>
          </div>
        </div>

        {/* Performance numbers */}
        <div className="mt-5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Views</span>
            <span className="font-semibold text-slate-900">{post.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Read completion</span>
            <span className="font-semibold text-slate-900">{post.readCompletionRate || 84}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Shares</span>
            <span className="font-semibold text-slate-900">{post.shares.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Link
          to={`/editor?id=${post.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-semibold text-slate-800 transition-colors"
        >
          <Edit3 className="h-3.5 w-3.5 text-slate-600" />
          <span>Edit Article</span>
        </Link>
      </div>
    </div>
  );
}
