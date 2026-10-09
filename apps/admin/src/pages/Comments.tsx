import React, { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { Comment, CommentReply } from '@chronicle/shared';
import { Trash2, CornerDownRight, Send, MessageSquare, ShieldCheck } from 'lucide-react';

export function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyTargetAuthor, setReplyTargetAuthor] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  const loadComments = () => {
    adminApi.getComments().then(setComments);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this comment and its discussion thread?')) {
      await adminApi.deleteComment(id);
      loadComments();
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (confirm('Delete this reader reply?')) {
      await adminApi.deleteReply(commentId, replyId);
      loadComments();
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    await adminApi.postReply(commentId, replyText.trim(), 'Managing Editor', replyTargetAuthor || undefined, true);
    setReplyingId(null);
    setReplyTargetAuthor('');
    setReplyText('');
    loadComments();
  };

  const totalAllReplies = comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
            Discussion Moderation
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            Review reader remarks, monitor reader-to-reader reply dialogues, and maintain high editorial standards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-900">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-700" />
            <span>{comments.length} Threads • {totalAllReplies} Reader Replies</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
        <div className="divide-y divide-slate-100">
          {comments.map((c) => (
            <div key={c.id} className="py-5 first:pt-0 last:pb-0 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#1e1b4b] text-xs font-bold text-white shrink-0">
                    {c.initials || 'RM'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{c.authorName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">Reader</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400">{c.relativeTime || 'Recent'} • {c.likes || 0} likes</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => {
                      if (replyingId === c.id) {
                        setReplyingId(null);
                        setReplyTargetAuthor('');
                      } else {
                        setReplyingId(c.id);
                        setReplyTargetAuthor(c.authorName);
                      }
                    }}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 sm:px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <CornerDownRight className="h-3.5 w-3.5 text-slate-500" />
                    <span>Editorial Reply</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Thread"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed sm:pl-12">
                {c.content}
              </p>

              {/* Staff Editorial Response */}
              {c.reply && (
                <div className="sm:ml-12 rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3 sm:p-3.5 space-y-1">
                  <div className="text-[10px] sm:text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-700" />
                    <span>Staff Editorial Response</span>
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed">{c.reply}</p>
                </div>
              )}

              {/* Threaded Reader Replies in Admin */}
              {c.replies && c.replies.length > 0 && (
                <div className="sm:ml-12 space-y-2.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CornerDownRight className="h-3 w-3 text-slate-400" />
                    <span>Thread Dialogue ({c.replies.length} replies)</span>
                  </div>

                  <div className="space-y-2 border-l-2 border-slate-200 pl-3 sm:pl-4">
                    {c.replies.map((reply: CommentReply) => (
                      <div
                        key={reply.id}
                        className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{reply.authorName}</span>
                            {reply.isStaff ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded">
                                Editorial
                              </span>
                            ) : (
                              <span className="text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                Reader
                              </span>
                            )}
                            {reply.replyToAuthor && (
                              <span className="text-[10px] text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                                to @{reply.replyToAuthor}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">{reply.relativeTime || 'Recent'}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{reply.content}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setReplyingId(c.id);
                              setReplyTargetAuthor(reply.authorName);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-900 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title={`Reply to ${reply.authorName}`}
                          >
                            <CornerDownRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReply(c.id, reply.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Reply"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {replyingId === c.id && (
                <div className="sm:ml-12 pt-2 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-900 font-medium">
                    <span>Editorial reply addressing:</span>
                    <span className="font-bold">@{replyTargetAuthor || c.authorName}</span>
                  </div>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write authoritative editorial response..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setReplyingId(null);
                        setReplyTargetAuthor('');
                      }}
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
