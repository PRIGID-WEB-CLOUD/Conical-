import React, { createContext, useContext, useState, useEffect } from 'react';
import { Author } from '@chronicle/shared';
import { CheckCircle2, UserCheck, UserPlus, X } from 'lucide-react';

interface ToastNotification {
  id: number;
  authorName: string;
  authorAvatar: string;
  isFollowing: boolean;
}

interface FollowAuthorContextType {
  followedAuthorIds: string[];
  isFollowing: (authorIdOrName: string) => boolean;
  toggleFollow: (author: Author) => void;
  getFollowerCount: (author: Author) => number;
  openFollowedModal: () => void;
  closeFollowedModal: () => void;
  isFollowedModalOpen: boolean;
}

const FollowAuthorContext = createContext<FollowAuthorContextType | undefined>(undefined);

const BASE_FOLLOWER_COUNTS: Record<string, number> = {
  'elena-vance': 2840,
  'julian-thorne': 1920,
  'marcus-vance': 3410,
  'siddharth-rao': 1650,
  'aaliyah-chen': 2130,
};

export function FollowAuthorProvider({ children }: { children: React.ReactNode }) {
  const [followedAuthorIds, setFollowedAuthorIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_followed_authors');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default: follow Elena Vance by default for lively first-time experience
    return ['elena-vance'];
  });

  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [isFollowedModalOpen, setIsFollowedModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('chronicle_followed_authors', JSON.stringify(followedAuthorIds));
    } catch {
      // ignore
    }
  }, [followedAuthorIds]);

  const isFollowing = (authorIdOrName: string) => {
    const key = authorIdOrName.toLowerCase().replace(/\s+/g, '-');
    return followedAuthorIds.includes(authorIdOrName) || followedAuthorIds.includes(key);
  };

  const toggleFollow = (author: Author) => {
    const key = (author.id || author.name).toLowerCase().replace(/\s+/g, '-');
    const currentlyFollowing = isFollowing(key);

    if (currentlyFollowing) {
      setFollowedAuthorIds((prev) => prev.filter((id) => id !== key && id !== author.id));
      setToast({
        id: Date.now(),
        authorName: author.name,
        authorAvatar: author.avatar,
        isFollowing: false,
      });
    } else {
      setFollowedAuthorIds((prev) => [...prev, key]);
      setToast({
        id: Date.now(),
        authorName: author.name,
        authorAvatar: author.avatar,
        isFollowing: true,
      });
    }

    setTimeout(() => {
      setToast((cur) => (cur && Date.now() - cur.id >= 3800 ? null : cur));
    }, 4000);
  };

  const getFollowerCount = (author: Author) => {
    const key = (author.id || author.name).toLowerCase().replace(/\s+/g, '-');
    const base = BASE_FOLLOWER_COUNTS[key] || 1200 + ((author.archiveCount || 3) * 180);
    return isFollowing(key) ? base + 1 : base;
  };

  return (
    <FollowAuthorContext.Provider
      value={{
        followedAuthorIds,
        isFollowing,
        toggleFollow,
        getFollowerCount,
        openFollowedModal: () => setIsFollowedModalOpen(true),
        closeFollowedModal: () => setIsFollowedModalOpen(false),
        isFollowedModalOpen,
      }}
    >
      {children}

      {/* Floating Follow Toast Alert */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl bg-slate-900/95 text-white p-4 shadow-2xl backdrop-blur-md border border-slate-700/60 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <img
            src={toast.authorAvatar}
            alt={toast.authorName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-400 shrink-0"
          />
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              {toast.isFollowing ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Following {toast.authorName}</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Unfollowed {toast.authorName}</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              {toast.isFollowing
                ? `You'll be notified when ${toast.authorName} publishes a new dispatch.`
                : `Removed ${toast.authorName} from your followed editorial list.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </aside>
      )}
    </FollowAuthorContext.Provider>
  );
}

export function useFollowAuthor() {
  const context = useContext(FollowAuthorContext);
  if (!context) {
    throw new Error('useFollowAuthor must be used within a FollowAuthorProvider');
  }
  return context;
}
