import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Post } from '@chronicle/shared';
import { readerApi } from '../lib/api';
import { DiscussionSection } from '../components/DiscussionSection';
import { RelatedStories } from '../components/RelatedStories';
import { TableOfContents } from '../components/TableOfContents';
import { AuthorSpotlight } from '../components/AuthorSpotlight';
import { FollowAuthorButton } from '../components/FollowAuthorButton';
import { CitationCopyHelper } from '../components/CitationCopyHelper';
import { Clock, Share2, ArrowLeft, Check, Eye } from 'lucide-react';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (slug) {
      readerApi.getPostBySlug(slug).then(setPost);
      readerApi.getPosts().then(setAllPosts);
    }
  }, [slug]);

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    } catch {
      // ignore
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleShare = async () => {
    if (!post) return;
    const shareData = {
      title: post.title,
      text: post.subtitle || post.excerpt,
      url: window.location.href,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err && err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  if (post === undefined) {
    return <div className="py-32 text-center text-sm text-slate-400">Loading publication piece...</div>;
  }

  if (post === null) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-4 px-4">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Article Not Found</h1>
        <p className="text-sm text-slate-600">The essay you are looking for does not exist or has been archived.</p>
        <Link to="/articles" className="inline-block rounded-xl bg-[#1e1b4b] px-5 py-2.5 text-xs font-semibold text-white">
          Return to Archives
        </Link>
      </div>
    );
  }

  // Parse Headings for TOC
  const lines = post.content.split('\n');
  const tocItems = lines
    .filter((l) => l.startsWith('## ') || l.startsWith('### '))
    .map((l, i) => ({
      id: `heading-${i}`,
      title: l.replace(/^#+\s*/, ''),
      level: l.startsWith('### ') ? 3 : 2,
    }));

  return (
    <article className="pb-24">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-200/80 bg-slate-50/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <Link to="/articles" className="flex items-center gap-1.5 hover:text-indigo-950 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Articles</span>
          </Link>
          <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            {post.category}
          </span>
        </div>
      </div>

      {/* Main Story Hero Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 space-y-6 text-center">
        {(() => {
          const realReadingTime = post.readingTimeMinutes || Math.max(1, Math.ceil(post.content.split(/\s+/).filter(Boolean).length / 200));
          return (
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              <span>{post.category}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {realReadingTime} min read
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500 font-medium" title="Verified reader views">
                <Eye className="h-3.5 w-3.5 text-indigo-600" />
                {(post.views || 0).toLocaleString()} views
              </span>
            </div>
          );
        })()}

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.12] tracking-tight">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="text-base sm:text-xl text-slate-600 font-serif italic max-w-2xl mx-auto leading-relaxed">
            &ldquo;{post.subtitle}&rdquo;
          </p>
        )}

        {/* Author metadata bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 max-w-lg mx-auto">
          <Link
            to={`/authors/${post.author.slug || post.author.id || post.author.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex items-center gap-3 group text-left"
            title={`View ${post.author.name}'s profile and full essay archive`}
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-300 transition-all"
            />
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-950 transition-colors">
                {post.author.name}
              </div>
              <div className="text-xs text-slate-500">{post.author.role}</div>
            </div>
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <FollowAuthorButton author={post.author} size="sm" showCount={true} />
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative aspect-16/9 w-full overflow-hidden rounded-3xl shadow-lg bg-slate-100">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
        {post.imageCaption && (
          <p className="text-center text-xs text-slate-400 italic mt-3">
            {post.imageCaption}
          </p>
        )}
      </div>

      {/* Article Body & Sidebar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-blockquote:border-l-indigo-900 prose-blockquote:font-serif prose-blockquote:italic">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="font-serif text-xl sm:text-2xl font-bold text-slate-800 mt-6 mb-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote key={index} className="border-l-4 border-indigo-900 pl-4 py-1 italic font-serif text-slate-800 my-6">
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              return (
                <p key={index} className="text-slate-700 leading-relaxed text-base sm:text-lg mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Academic Citation Helper */}
          <div className="pt-8">
            <CitationCopyHelper
              title={post.title}
              author={post.author.name}
              date={post.publishedAt ? new Date(post.publishedAt).getFullYear().toString() : '2026'}
            />
          </div>

          {/* Inline Author Bio */}
          <div className="pt-6">
            <AuthorSpotlight author={post.author} variant="inlineBio" />
          </div>

          {/* Discussion Thread */}
          <DiscussionSection postId={post.id} />
        </div>

        {/* Right Sticky Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {tocItems.length > 0 && <TableOfContents items={tocItems} />}

            {/* Share and Save card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Share &amp; Syndicate
              </h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copiedShare ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-200 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 text-slate-300" />
                      <span>Share Essay (Native / Copy)</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Share on X (Twitter)"
                  >
                    <span>X</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Share on LinkedIn"
                  >
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Share on Facebook"
                  >
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Stories Footer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <RelatedStories posts={allPosts} currentPostId={post.id} />
      </div>
    </article>
  );
}
