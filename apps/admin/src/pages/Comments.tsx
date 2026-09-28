import React, { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { Comment } from '@chronicle/shared';
import { Trash2, CornerDownRight, Send } from 'lucide-react';

export function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadComments = () => {
    adminApi.getComments().then(setComments);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this comment?')) {
      await adminApi.deleteComment(id);
      loadComments();
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    await adminApi.replyToComment(id, replyText);
    setReplyingId(null);
    setReplyText('');
    loadComments();
  };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
          Discussion Moderation
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
          Review reader remarks, reply with editorial perspective, and maintain community standards.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
        <div className="divide-y divide-slate-100">
          {comments.map((c) => (
            <div key={c.id} className="py-4 sm:py-5 first:pt-0 last:pb-0 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#1e1b4b] text-xs font-bold text-white shrink-0">
                    {c.initials || 'RM'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{c.authorName}</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400">{c.relativeTime || 'Recent'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setReplyingId(replyingId === c.id ? null : c.id)}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 sm:px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <CornerDownRight className="h-3.5 w-3.5 text-slate-500" />
                    <span>{c.reply ? 'Edit Reply' : 'Reply'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed sm:pl-12">
                {c.content}
              </p>

              {c.reply && (
                <div className="sm:ml-12 rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3 sm:p-3.5 space-y-1">
                  <div className="text-[10px] sm:text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                    Staff Editorial Response
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed">{c.reply}</p>
                </div>
              )}

              {replyingId === c.id && (
                <div className="sm:ml-12 pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your authoritative editorial response..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendReply(c.id)}
                      className="flex items-center gap-1 rounded-xl bg-[#1e1b4b] px-4 py-1 text-xs font-semibold text-white hover:bg-indigo-950 cursor-pointer"
                    >
                      <Send className="h-3 w-3" />
                      <span>Publish</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
