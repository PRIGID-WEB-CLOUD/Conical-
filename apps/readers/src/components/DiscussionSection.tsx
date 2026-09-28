import React, { useState, useEffect } from 'react';
import { ThumbsUp, Send, Loader2 } from 'lucide-react';
import { Comment } from '@chronicle/shared';
import { readerApi } from '../lib/api';

interface DiscussionSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function DiscussionSection({ postId, initialComments }: DiscussionSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('Julian Drake');
  const [submitting, setSubmitting] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    readerApi.getComments(postId).then(setComments);
  }, [postId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await readerApi.postComment(postId, content, authorName);
      setComments((prev) => [newComment, ...prev]);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    if (likedMap[commentId]) return;
    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  return (
    <section className="mt-16 pt-10 border-t border-slate-200">
      <div className="flex items-center justify-between pb-6">
        <h3 className="font-serif text-2xl font-bold text-slate-900">
          Discussion ({comments.length})
        </h3>
        <span className="text-xs text-slate-400">Community Guidelines apply</span>
      </div>

      {/* Input box */}
      <form onSubmit={handlePostComment} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 text-xs text-slate-500 border-b border-slate-100">
          <span>Leave a thoughtful response</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Posting as:</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="font-medium text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 focus:outline-none"
              placeholder="Your Name"
            />
          </div>
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are your thoughts on ambient intelligence and modern editorial craft?"
          className="w-full mt-3 resize-none border-none p-0 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
        />

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded-xl bg-[#1e1b4b] hover:bg-indigo-950 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Post Comment</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="mt-8 space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e1b4b] text-xs font-bold text-white">
                {comment.initials || 'JD'}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{comment.authorName}</span>
                  <span className="text-[11px] text-slate-400">{comment.relativeTime || 'Recently'}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {comment.content}
                </p>

                <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      likedMap[comment.id] ? 'text-indigo-600 font-bold' : 'hover:text-slate-800'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="hover:text-slate-800 transition-colors cursor-pointer">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
