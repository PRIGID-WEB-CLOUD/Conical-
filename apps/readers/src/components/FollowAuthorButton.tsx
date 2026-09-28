import React from 'react';
import { Author } from '@chronicle/shared';
import { useFollowAuthor } from '../context/follow-author-context';
import { UserCheck, UserPlus, Check } from 'lucide-react';

interface FollowAuthorButtonProps {
  author: Author;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function FollowAuthorButton({
  author,
  size = 'md',
  showCount = false,
  className = '',
}: FollowAuthorButtonProps) {
  const { isFollowing, toggleFollow, getFollowerCount } = useFollowAuthor();
  const following = isFollowing(author.id || author.name);
  const followerCount = getFollowerCount(author);

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[11px] gap-1',
    md: 'px-3.5 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-xs sm:text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFollow(author);
        }}
        className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 cursor-pointer select-none group shadow-2xs ${sizeClasses} ${
          following
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
            : 'bg-[#1e1b4b] text-white hover:bg-indigo-950 active:scale-98'
        }`}
        title={following ? 'Click to unfollow this author' : 'Follow author for new essays'}
      >
        {following ? (
          <>
            <Check className={`${iconSizes} text-emerald-600 group-hover:hidden`} />
            <span className="group-hover:hidden">Following</span>
            <span className="hidden group-hover:inline">Unfollow</span>
          </>
        ) : (
          <>
            <UserPlus className={`${iconSizes} text-indigo-300`} />
            <span>Follow</span>
          </>
        )}
      </button>

      {showCount && (
        <span className="text-[11px] text-slate-500 font-medium">
          {followerCount.toLocaleString()} {followerCount === 1 ? 'follower' : 'followers'}
        </span>
      )}
    </div>
  );
}
