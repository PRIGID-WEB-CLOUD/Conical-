import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, Send, Loader2, CornerDownRight, MessageSquare, X, Check } from 'lucide-react';
import { Comment, CommentReply } from '@chronicle/shared';
import { readerApi } from '../lib/api';

interface DiscussionSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function DiscussionSection({ postId, initialComments }: DiscussionSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('chronicle_reader_name') || 'Julian Drake';
  });
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});

  // Reply state
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    targetAuthor: string;
    targetReplyId?: string;
  } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replySuccessCommentId, setReplySuccessCommentId] = useState<string | null>(null);

  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    readerApi.getComments(postId).then((data) => {
      setComments(data);
    });
  }, [postId]);

  const handleNameChange = (val: string) => {
    setAuthorName(val);
    localStorage.setItem('chronicle_reader_name', val);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await readerApi.postComment(postId, content.trim(), authorName);
      setComments((prev) => [newComment, ...prev]);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartReply = (commentId: string, targetAuthor: string, targetReplyId?: string) => {
    setReplyingTo({ commentId, targetAuthor, targetReplyId });
    setReplyContent('');
    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyContent.trim() || !replyingTo) return;

    setSubmittingReply(true);
    try {
      const result = await readerApi.postReply(
        commentId,
        replyContent.trim(),
        authorName,
        replyingTo.targetAuthor
      );

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const existingReplies = c.replies || [];
            return {
              ...c,
              replies: [...existingReplies, result.reply],
            };
          }
          return c;
        })
      );

      setReplySuccessCommentId(commentId);
      setTimeout(() => setReplySuccessCommentId(null), 3000);
      setReplyingTo(null);
      setReplyContent('');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    const isAlreadyLiked = !!likedComments[commentId];
    setLikedComments((prev) => ({ ...prev, [commentId]: !isAlreadyLiked }));

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: Math.max(0, c.likes + (isAlreadyLiked ? -1 : 1)) }
          : c
      )
    );

    readerApi.toggleCommentLike(commentId, isAlreadyLiked);
  };

  const handleLikeReply = (commentId: string, replyId: string) => {
    const replyKey = `${commentId}-${replyId}`;
    const isAlreadyLiked = !!likedReplies[replyKey];

    setLikedReplies((prev) => ({ ...prev, [replyKey]: !isAlreadyLiked }));

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId && c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === replyId
                ? { ...r, likes: Math.max(0, r.likes + (isAlreadyLiked ? -1 : 1)) }
                : r
            ),
          };
        }
        return c;
      })
    );

    readerApi.toggleReplyLike(commentId, replyId, isAlreadyLiked);
  };

  // Compute total entries including reader-to-reader replies
  const totalDiscussionCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <section className="mt-16 pt-10 border-t border-slate-200">
      <div className="flex items-center justify-between pb-6 flex-wrap gap-2">
        <div className="flex items-baseline gap-2.5">
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            Discussion
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-100">
            {totalDiscussionCount} {totalDiscussionCount === 1 ? 'thought' : 'thoughts'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Reader-to-reader dialogue open</span>
        </div>
      </div>

      {/* Main Comment Input box */}
      <form onSubmit={handlePostComment} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
        <div className="flex items-center justify-between pb-3 text-xs text-slate-500 border-b border-slate-100 flex-wrap gap-2">
          <span className="font-medium">Leave a thoughtful perspective</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Posting as:</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="font-medium text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-900 text-xs"
              placeholder="Your Name"
            />
          </div>
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are your thoughts on ambient intelligence, typography, and modern editorial craft?"
          className="w-full mt-3 resize-none border-none p-0 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
          <span className="text-[11px] text-slate-400">
            Markdown formatting and respectful discourse welcome
          </span>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded-xl bg-[#1e1b4b] hover:bg-indigo-950 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Post Perspective</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="mt-8 space-y-6">
        {comments.map((comment) => {
          const hasReplies = (comment.replies && comment.replies.length > 0) || Boolean(comment.reply);
          const isReplyingThisComment = replyingTo?.commentId === comment.id;
          const isLiked = !!likedComments[comment.id];

          return (
            <div
              key={comment.id}
              className="rounded-2xl border border-slate-150 bg-slate-50/70 p-4 sm:p-5 transition-all shadow-3xs"
            >
              {/* Top-level Comment Header & Content */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e1b4b] text-xs font-bold text-white shadow-xs">
                  {comment.initials || comment.authorName.slice(0, 2).toUpperCase() || 'RM'}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{comment.authorName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Reader</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{comment.relativeTime || 'Recently'}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    {comment.content}
                  </p>

                  {/* Actions for Top-level Comment */}
                  <div className="flex items-center gap-4 pt-1.5 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer py-0.5 px-1.5 rounded-lg ${
                        isLiked
                          ? 'text-indigo-700 font-bold bg-indigo-50'
                          : 'hover:text-slate-800 hover:bg-slate-100/60'
                      }`}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartReply(comment.id, comment.authorName)}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-950 font-medium transition-colors cursor-pointer py-0.5 px-2 rounded-lg hover:bg-slate-100/60"
                    >
                      <CornerDownRight className="h-3.5 w-3.5 text-slate-400" />
                      <span>Reply</span>
                    </button>

                    {comment.replies && comment.replies.length > 0 && (
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-slate-400" />
                        <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Editorial Response (if exists) */}
              {comment.reply && (
                <div className="mt-3.5 ml-4 sm:ml-12 rounded-xl bg-indigo-50 border border-indigo-100 p-3.5 space-y-1">
                  <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    <span>Staff Editorial Response</span>
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed font-normal">{comment.reply}</p>
                </div>
              )}

              {/* Threaded Reader-to-Reader Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-3 sm:ml-8 pl-3.5 sm:pl-4 border-l-2 border-indigo-150 space-y-3.5">
                  {comment.replies.map((reply: CommentReply) => {
                    const replyLiked = !!likedReplies[`${comment.id}-${reply.id}`];

                    return (
                      <div
                        key={reply.id}
                        className="rounded-xl border border-slate-200/80 bg-white/95 p-3 sm:p-3.5 transition-all shadow-3xs hover:border-slate-300"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-3xs ${
                            reply.isStaff ? 'bg-indigo-900' : 'bg-slate-700'
                          }`}>
                            {reply.initials || reply.authorName.slice(0, 2).toUpperCase() || 'R'}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900">
                                  {reply.authorName}
                                </span>
                                {reply.isStaff && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded">
                                    Editorial Staff
                                  </span>
                                )}
                                {reply.replyToAuthor && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100/70 font-medium">
                                    <CornerDownRight className="h-2.5 w-2.5 text-indigo-500" />
                                    <span>replying to</span>
                                    <span className="font-semibold text-indigo-950">@{reply.replyToAuthor}</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {reply.relativeTime || 'Recently'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-sans pt-0.5">
                              {reply.content}
                            </p>

                            {/* Reply Action row */}
                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                              <button
                                type="button"
                                onClick={() => handleLikeReply(comment.id, reply.id)}
                                className={`flex items-center gap-1 cursor-pointer transition-colors py-0.5 px-1.5 rounded ${
                                  replyLiked
                                    ? 'text-indigo-700 font-bold bg-indigo-50'
                                    : 'hover:text-slate-800 hover:bg-slate-100/60'
                                }`}
                                title={replyLiked ? 'Unlike' : 'Like'}
                              >
                                <ThumbsUp className={`h-3 w-3 ${replyLiked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartReply(comment.id, reply.authorName, reply.id)}
                                className="flex items-center gap-1 text-slate-600 hover:text-indigo-950 font-medium transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-slate-100/60"
                              >
                                <CornerDownRight className="h-3 w-3 text-slate-400" />
                                <span>Reply to {reply.authorName.split(' ')[0]}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Success badge when reply was posted */}
              {replySuccessCommentId === comment.id && (
                <div className="mt-3 ml-3 sm:ml-8 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Your reply has been added to the discussion!</span>
                </div>
              )}

              {/* Inline Reply Box for this Comment */}
              {isReplyingThisComment && (
                <div className="mt-4 ml-3 sm:ml-8 rounded-2xl border border-indigo-200 bg-white p-3.5 sm:p-4 shadow-sm space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-indigo-50 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-indigo-950">Replying to</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/80">
                        @{replyingTo?.targetAuthor}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Posting as:</span>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="font-medium text-slate-800 bg-slate-50 px-2 py-0.5 rounded text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-900"
                        placeholder="Your Name"
                      />
                      <button
                        type="button"
                        onClick={handleCancelReply}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Cancel reply"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={replyInputRef}
                    rows={2}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Share your perspective with @${replyingTo?.targetAuthor}...`}
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submittingReply || !replyContent.trim()}
                      onClick={() => handlePostReply(comment.id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#1e1b4b] hover:bg-indigo-950 disabled:opacity-40 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      {submittingReply ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>Post Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

