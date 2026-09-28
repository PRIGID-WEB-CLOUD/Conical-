import React from 'react';
import { Link } from 'react-router-dom';
import { useFollowAuthor } from '../context/follow-author-context';
import { INITIAL_AUTHORS } from '@chronicle/shared';
import { X, Users, BookOpen, ArrowRight } from 'lucide-react';
import { FollowAuthorButton } from './FollowAuthorButton';

export function FollowedAuthorsModal() {
  const { isFollowedModalOpen, closeFollowedModal, followedAuthorIds, isFollowing } = useFollowAuthor();

  if (!isFollowedModalOpen) return null;

  const allStaff = Object.values(INITIAL_AUTHORS);
  const followedList = allStaff.filter((a) => isFollowing(a.id || a.name));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="followed-authors-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-950">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 id="followed-authors-modal-title" className="font-serif text-lg font-bold text-slate-900">
                Authors You Follow
              </h3>
              <p className="text-xs text-slate-500">
                {followedList.length} editorial {followedList.length === 1 ? 'voice' : 'voices'} in your personalized dispatch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeFollowedModal}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {followedList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-base font-bold text-slate-800">No followed authors yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore essays and follow authors to receive personalized updates on new publications.
              </p>
              <Link
                to="/masthead"
                onClick={closeFollowedModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1e1b4b] px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-950 transition-colors mt-2"
              >
                <span>Browse Masthead</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            followedList.map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Link
                    to={`/authors/${author.slug || author.id}`}
                    onClick={closeFollowedModal}
                    className="shrink-0"
                  >
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-200 hover:ring-indigo-300 transition-all shrink-0"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/authors/${author.slug || author.id}`}
                      onClick={closeFollowedModal}
                      className="hover:underline"
                    >
                      <h4 className="font-serif text-sm font-bold text-slate-900 truncate">
                        {author.name}
                      </h4>
                    </Link>
                    <p className="text-[11px] text-slate-500 truncate">{author.role}</p>
                    <Link
                      to={`/authors/${author.slug || author.id}`}
                      onClick={closeFollowedModal}
                      className="text-[10px] text-indigo-700 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <BookOpen className="h-2.5 w-2.5" />
                      <span>{author.archiveCount} Articles &rarr;</span>
                    </Link>
                  </div>
                </div>

                <FollowAuthorButton author={author} size="sm" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Following updates are saved to your browser</span>
          <button
            type="button"
            onClick={closeFollowedModal}
            className="font-semibold text-indigo-950 hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
