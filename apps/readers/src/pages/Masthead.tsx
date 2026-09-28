import React from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_AUTHORS } from '@chronicle/shared';
import { FollowAuthorButton } from '../components/FollowAuthorButton';
import { useFollowAuthor } from '../context/follow-author-context';
import { BookOpen, Users, CheckCircle2 } from 'lucide-react';

export function MastheadPage() {
  const staff = Object.values(INITIAL_AUTHORS);
  const { followedAuthorIds, isFollowing, openFollowedModal } = useFollowAuthor();
  const followedCount = staff.filter((m) => isFollowing(m.id || m.name)).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-slate-200 pb-8 space-y-4 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Editorial Governance
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Masthead &amp; Staff
        </h1>
        <p className="text-base text-slate-600 font-serif italic max-w-xl mx-auto">
          The editors, essayists, and architectural researchers shaping Chronicle Journal.
        </p>

        {followedCount > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={openFollowedModal}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Users className="h-3.5 w-3.5 text-indigo-700" />
              <span>You follow {followedCount} of {staff.length} staff editors</span>
              <span className="text-[10px] text-indigo-600 underline">Manage</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {staff.map((member) => (
          <div
            key={member.id}
            className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-4 group"
          >
            <div className="flex gap-4 items-start">
              <Link
                to={`/authors/${member.slug || member.id}`}
                className="shrink-0 block"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-2xs group-hover:ring-indigo-300 transition-all"
                />
              </Link>
              <div className="space-y-1 min-w-0 flex-1">
                <Link
                  to={`/authors/${member.slug || member.id}`}
                  className="inline-block"
                >
                  <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-indigo-950 transition-colors">
                    {member.name}
                  </h3>
                </Link>
                <div className="text-xs font-semibold text-indigo-700">{member.role}</div>
                <p className="text-xs text-slate-500 leading-relaxed pt-1 line-clamp-3">{member.bio}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <Link
                to={`/authors/${member.slug || member.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-950 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                <span>{member.archiveCount} Articles</span>
                <span className="text-[11px] text-indigo-700 font-semibold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>

              <FollowAuthorButton author={member} size="sm" showCount={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
