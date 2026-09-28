import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RichEditorToolbar } from '../components/RichEditorToolbar';
import { EditorSidebar } from '../components/EditorSidebar';
import { MediaSidePanel } from '../components/MediaSidePanel';
import { ScheduleModal } from '../components/ScheduleModal';
import { AiAssistantModal } from '../components/AiAssistantModal';
import { adminApi } from '../lib/api';
import { Post } from '@chronicle/shared';
import { Save, Check, Loader2, Send, Clock, CheckCircle2, Image as ImageIcon, Calendar, Share2 } from 'lucide-react';

export function EditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const postId = searchParams.get('id');

  const [currentId, setCurrentId] = useState<string | null>(postId);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Editorial & Design');
  const [tags, setTags] = useState<string[]>(['CMS Design', 'Typography']);
  const [featuredImage, setFeaturedImage] = useState(
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80'
  );
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [scheduledAt, setScheduledAt] = useState<string | undefined>(undefined);
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Social Broadcast Channels State
  const [broadcastChannels, setBroadcastChannels] = useState<Record<string, boolean>>({
    'x-twitter': true,
    linkedin: true,
    telegram: true,
    instagram: false,
    facebook: false,
    wordpress: false,
    ghost: false,
    substack: false,
  });
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);

  // Save & Auto-Save States
  const [saving, setSaving] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'dirty' | 'saving' | 'saved'>('idle');
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals & Panels
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [mediaPanelOpen, setMediaPanelOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const isInitialLoad = useRef(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing post if id provided
  useEffect(() => {
    let ignore = false;
    if (postId) {
      adminApi.getPostById(postId).then((p) => {
        if (!ignore && p) {
          setCurrentId(postId);
          setTitle(p.title);
          setSubtitle(p.subtitle || '');
          setContent(p.content);
          setCategory(p.category);
          setTags(p.tags || []);
          setFeaturedImage(p.featuredImage);
          setStatus(p.status === 'published' ? 'published' : p.status === 'scheduled' ? 'scheduled' : 'draft');
          setScheduledAt(p.scheduledAt);
          setSlug(p.slug);
          setSeoTitle(p.seo?.metaTitle || p.title);
          setSeoDescription(p.seo?.metaDescription || p.excerpt || '');
          isInitialLoad.current = false;
        }
      });
    } else {
      isInitialLoad.current = false;
    }
    return () => {
      ignore = true;
    };
  }, [postId]);

  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));

  // Perform save action
  const performSave = useCallback(
    async (targetStatus?: 'draft' | 'published' | 'scheduled', isAutoSave: boolean = false, targetScheduledAt?: string) => {
      // Don't auto-save completely empty documents
      if (isAutoSave && !title.trim() && !content.trim()) {
        return;
      }

      if (isAutoSave) {
        setAutoSaveState('saving');
      } else {
        setSaving(true);
      }

      const postStatus = targetStatus || status;
      const finalScheduledAt = targetScheduledAt !== undefined ? targetScheduledAt : scheduledAt;

      const postData: Partial<Post> & { title: string; content: string } = {
        id: currentId || undefined,
        title: title.trim() || 'Untitled Publication Piece',
        subtitle: subtitle.trim(),
        content,
        category,
        tags,
        featuredImage,
        status: postStatus,
        scheduledAt: postStatus === 'scheduled' ? finalScheduledAt : undefined,
        slug:
          slug ||
          (title.trim()
            ? title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            : `draft-${Date.now()}`),
        seo: {
          metaTitle: seoTitle || title,
          metaDescription: seoDescription || subtitle || content.slice(0, 160),
          slug: slug || '',
        },
      };

      try {
        // Instant local resilience backup
        localStorage.setItem(
          'chronicle_editor_draft_backup',
          JSON.stringify({ ...postData, backupAt: new Date().toISOString() })
        );

        const saved = await adminApi.savePost(postData);

        if (saved && saved.id) {
          if (!currentId) {
            setCurrentId(saved.id);
            setSearchParams({ id: saved.id }, { replace: true });
          }
        }

        const nowStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastAutoSavedAt(nowStr);
        setStatus(postStatus);

        if (isAutoSave) {
          setAutoSaveState('saved');
        } else {
          setSaving(false);
          setSavedSuccess(true);
          setAutoSaveState('saved');
          setTimeout(() => setSavedSuccess(false), 3000);

          if (postStatus === 'published') {
            const activeChannels = Object.entries(broadcastChannels)
              .filter(([, active]) => active)
              .map(([id]) => id);
            if (activeChannels.length > 0) {
              setBroadcastAlert(
                `Article published & dispatched across ${activeChannels.length} broadcast channel${
                  activeChannels.length > 1 ? 's' : ''
                } (${activeChannels.join(', ')})!`
              );
              setTimeout(() => setBroadcastAlert(null), 6000);
            }
          }
        }
      } catch (err) {
        console.error('Save failed', err);
        if (isAutoSave) {
          setAutoSaveState('dirty');
        } else {
          setSaving(false);
        }
      }
    },
    [
      currentId,
      title,
      subtitle,
      content,
      category,
      tags,
      featuredImage,
      status,
      scheduledAt,
      slug,
      seoTitle,
      seoDescription,
      broadcastChannels,
      setSearchParams,
    ]
  );

  // Auto-Save Debounce Effect
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!title.trim() && !content.trim()) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      // Don't change status on auto-save
      performSave(status, true);
    }, 2500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    title,
    subtitle,
    content,
    category,
    tags,
    featuredImage,
    slug,
    seoTitle,
    seoDescription,
    performSave,
    status,
  ]);

  // Periodic fallback auto-save interval every 25s if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSaveState === 'dirty' && (title.trim() || content.trim())) {
        performSave(status, true);
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [autoSaveState, title, content, performSave, status]);

  const handleFormat = (command: string) => {
    setAutoSaveState('dirty');
    switch (command) {
      case 'bold':
        setContent((prev) => prev + ' **bold text** ');
        break;
      case 'italic':
        setContent((prev) => prev + ' *italic text* ');
        break;
      case 'heading':
        setContent((prev) => prev + '\n\n## Section Heading\n\n');
        break;
      case 'unorderedList':
        setContent((prev) => prev + '\n- Item one\n- Item two\n');
        break;
      case 'orderedList':
        setContent((prev) => prev + '\n1. First step\n2. Second step\n');
        break;
      case 'blockquote':
        setContent((prev) => prev + '\n\n> "Notable architectural quote or assertion."\n\n');
        break;
      case 'link':
        setContent((prev) => prev + ' [link text](https://example.com) ');
        break;
    }
  };

  const handleConfirmSchedule = (iso: string) => {
    setScheduledAt(iso);
    performSave('scheduled', false, iso);
  };

  const handleUnschedule = () => {
    setScheduledAt(undefined);
    performSave('draft', false, undefined);
  };

  const handleChannelToggle = (channelId: string) => {
    setAutoSaveState('dirty');
    setBroadcastChannels((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  const handleSelectAllChannels = (selectAll: boolean) => {
    setAutoSaveState('dirty');
    setBroadcastChannels((prev) => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach((k) => {
        next[k] = selectAll;
      });
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Broadcast syndication success alert */}
      {broadcastAlert && (
        <div className="bg-indigo-950 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <Share2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{broadcastAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setBroadcastAlert(null)}
            className="text-indigo-300 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor top sticky action & auto-save status bar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3.5 py-2.5 sm:px-6 lg:px-8 backdrop-blur-xs">
        {/* Left Status & Auto-Save Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span
            className={`rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold capitalize ${
              status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : status === 'scheduled'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {status === 'scheduled' ? 'Scheduled' : status}
          </span>

          {status === 'scheduled' && scheduledAt && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-indigo-800 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {new Date(scheduledAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          )}

          {/* Dynamic Auto-Save Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 border-l border-slate-200 pl-2 sm:pl-3">
            {autoSaveState === 'saving' ? (
              <span className="flex items-center gap-1 text-indigo-600 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auto-saving draft...</span>
              </span>
            ) : autoSaveState === 'saved' && lastAutoSavedAt ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Auto-saved at {lastAutoSavedAt}</span>
              </span>
            ) : autoSaveState === 'dirty' ? (
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Auto-save active</span>
              </span>
            )}
          </div>

          {savedSuccess && (
            <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Check className="h-3.5 w-3.5" />
              <span>Saved successfully</span>
            </span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Media Assets Side-Panel Trigger */}
          <button
            type="button"
            onClick={() => setMediaPanelOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-indigo-900 transition-colors cursor-pointer shadow-2xs"
            title="Browse uploaded imagery and insert into draft"
          >
            <ImageIcon className="h-3.5 w-3.5 text-indigo-700" />
            <span className="hidden xs:inline">Media</span>
          </button>

          {/* Schedule Release Button */}
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
              status === 'scheduled'
                ? 'border-indigo-300 bg-indigo-100/70 text-indigo-950 font-bold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Schedule automatic future publishing"
          >
            <Clock className="h-3.5 w-3.5 text-indigo-700" />
            <span>{status === 'scheduled' ? 'Scheduled' : 'Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={() => performSave('draft', false)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-slate-500" />}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => performSave('published', false)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-[#1e1b4b] hover:bg-indigo-950 px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{status === 'published' ? 'Update & Republish' : 'Publish Now'}</span>
          </button>
        </div>
      </div>

      {/* Main composer canvas */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Editor central column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setAutoSaveState('dirty');
                  setTitle(e.target.value);
                  if (!slug) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '')
                    );
                  }
                }}
                placeholder="Article Headline..."
                className="w-full font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
              />

              {/* Subtitle input */}
              <input
                type="text"
                value={subtitle}
                onChange={(e) => {
                  setAutoSaveState('dirty');
                  setSubtitle(e.target.value);
                }}
                placeholder="Lead deck / Subtitle exposition..."
                className="w-full text-sm sm:text-lg text-slate-600 font-serif italic placeholder:text-slate-300 focus:outline-none"
              />

              {/* Rich Editor Toolbar */}
              <RichEditorToolbar
                onFormat={handleFormat}
                readingTimeMinutes={readingTime}
                onOpenAi={() => setAiModalOpen(true)}
              />

              {/* Markdown Content Area */}
              <textarea
                rows={16}
                value={content}
                onChange={(e) => {
                  setAutoSaveState('dirty');
                  setContent(e.target.value);
                }}
                placeholder="Compose your spatial criticism or editorial essay in markdown..."
                className="w-full resize-y font-mono text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0 border-none p-0 min-h-[280px]"
              />
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="lg:col-span-4">
            <EditorSidebar
              featuredImage={featuredImage}
              onFeaturedImageChange={(val) => {
                setAutoSaveState('dirty');
                setFeaturedImage(val);
              }}
              category={category}
              onCategoryChange={(val) => {
                setAutoSaveState('dirty');
                setCategory(val);
              }}
              tags={tags}
              onTagsChange={(val) => {
                setAutoSaveState('dirty');
                setTags(val);
              }}
              seoTitle={seoTitle}
              onSeoTitleChange={(val) => {
                setAutoSaveState('dirty');
                setSeoTitle(val);
              }}
              seoDescription={seoDescription}
              onSeoDescriptionChange={(val) => {
                setAutoSaveState('dirty');
                setSeoDescription(val);
              }}
              slug={slug}
              onSlugChange={(val) => {
                setAutoSaveState('dirty');
                setSlug(val);
              }}
              onGenerateAiSeo={() => {
                setAutoSaveState('dirty');
                setSeoTitle(title);
                setSeoDescription(subtitle || content.slice(0, 150));
              }}
              onOpenMediaPanel={() => setMediaPanelOpen(true)}
              articleTitle={title}
              scheduledAt={scheduledAt}
              onOpenScheduleModal={() => setScheduleModalOpen(true)}
              onUnschedule={handleUnschedule}
              status={status}
              selectedChannels={broadcastChannels}
              onChannelToggle={handleChannelToggle}
              onSelectAllChannels={handleSelectAllChannels}
            />
          </div>
        </div>
      </main>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={title}
        content={content}
        onApplyText={(txt) => {
          setAutoSaveState('dirty');
          setSubtitle(txt);
        }}
      />

      {/* Media Side-Panel Drawer */}
      <MediaSidePanel
        isOpen={mediaPanelOpen}
        onClose={() => setMediaPanelOpen(false)}
        onInsertIntoContent={(markdown) => {
          setAutoSaveState('dirty');
          setContent((prev) => prev + markdown);
        }}
        onSetFeaturedImage={(url) => {
          setAutoSaveState('dirty');
          setFeaturedImage(url);
        }}
        currentFeaturedImage={featuredImage}
      />

      {/* Schedule Release Modal */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        scheduledAt={scheduledAt}
        onConfirmSchedule={handleConfirmSchedule}
        onUnschedule={handleUnschedule}
        articleTitle={title}
      />
    </div>
  );
}
