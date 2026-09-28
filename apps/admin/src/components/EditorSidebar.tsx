import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Tag,
  Settings,
  X,
  Sparkles,
  Clock,
  Calendar,
  CheckCircle2,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Globe,
  Send,
  Cpu,
  Radio,
} from 'lucide-react';
import { SeoPreviewCard } from './SeoPreviewCard';

export interface BroadcastChannelItem {
  id: string;
  name: string;
  type: string;
  icon: React.ElementType;
  color: string;
}

export const BROADCAST_CHANNELS: BroadcastChannelItem[] = [
  { id: 'x-twitter', name: 'X (Twitter)', type: 'API v2', icon: Twitter, color: 'text-sky-600 bg-sky-50' },
  { id: 'linkedin', name: 'LinkedIn', type: 'Share API', icon: Linkedin, color: 'text-blue-700 bg-blue-50' },
  { id: 'telegram', name: 'Telegram', type: 'Bot API', icon: Send, color: 'text-sky-500 bg-sky-50' },
  { id: 'instagram', name: 'Instagram', type: 'Graph API', icon: Instagram, color: 'text-pink-600 bg-pink-50' },
  { id: 'facebook', name: 'Facebook', type: 'Pages API', icon: Facebook, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'wordpress', name: 'WordPress', type: 'REST API', icon: Globe, color: 'text-cyan-700 bg-cyan-50' },
  { id: 'ghost', name: 'Ghost CMS', type: 'Admin API', icon: Cpu, color: 'text-slate-800 bg-slate-100' },
  { id: 'substack', name: 'Substack', type: 'RSS/Webhook', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
];

interface EditorSidebarProps {
  featuredImage: string;
  onFeaturedImageChange: (url: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (val: string) => void;
  slug: string;
  onSlugChange: (val: string) => void;
  onGenerateAiSeo?: () => void;
  onOpenMediaPanel?: () => void;
  articleTitle?: string;
  scheduledAt?: string;
  onOpenScheduleModal?: () => void;
  onUnschedule?: () => void;
  status?: string;
  selectedChannels?: Record<string, boolean>;
  onChannelToggle?: (channelId: string) => void;
  onSelectAllChannels?: (selected: boolean) => void;
}

const CATEGORIES = [
  'Editorial & Design',
  'Architecture',
  'Future of Technology',
  'Technology',
  'Culture',
  'Sustainability',
  'Design Systems',
  'Engineering',
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1400&q=80',
];

export function EditorSidebar({
  featuredImage = '',
  onFeaturedImageChange,
  category = 'Editorial & Design',
  onCategoryChange,
  tags = [],
  onTagsChange,
  seoTitle = '',
  onSeoTitleChange,
  seoDescription = '',
  onSeoDescriptionChange,
  slug = '',
  onSlugChange,
  onGenerateAiSeo,
  onOpenMediaPanel,
  articleTitle = '',
  scheduledAt,
  onOpenScheduleModal,
  onUnschedule,
  status = 'draft',
  selectedChannels = {},
  onChannelToggle,
  onSelectAllChannels,
}: EditorSidebarProps) {
  const [newTagInput, setNewTagInput] = useState('');
  const [seoOpen, setSeoOpen] = useState(true);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = newTagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        onTagsChange([...tags, trimmed]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  const isScheduled = status === 'scheduled' && scheduledAt;
  const activeChannelsCount = Object.values(selectedChannels).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Scheduling & Embargo Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-700" />
            <h3 className="font-serif text-sm font-bold text-slate-900">Publishing Timing</h3>
          </div>
          {isScheduled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
              <Calendar className="w-3 h-3 text-indigo-600" />
              Scheduled
            </span>
          )}
        </div>

        {isScheduled ? (
          <div className="rounded-2xl bg-indigo-50/60 p-3.5 border border-indigo-100 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
              Scheduled Auto-Release
            </div>
            <div className="font-mono text-xs font-bold text-slate-900">
              {new Date(scheduledAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(scheduledAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-indigo-100">
              <button
                type="button"
                onClick={onOpenScheduleModal}
                className="text-[11px] font-semibold text-indigo-900 hover:underline cursor-pointer"
              >
                Change Date &amp; Time
              </button>
              {onUnschedule && (
                <button
                  type="button"
                  onClick={onUnschedule}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                >
                  Unschedule
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              Publish immediately or schedule an automated future dispatch for readers.
            </p>
            <button
              type="button"
              onClick={onOpenScheduleModal}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 py-2.5 text-xs font-semibold text-indigo-900 transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-indigo-700" />
              <span>Schedule Future Release</span>
            </button>
          </div>
        )}
      </div>

      {/* Social Media & Channel Broadcast Syndication Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-indigo-700" />
            <h3 className="font-serif text-sm font-bold text-slate-900">Broadcast Channels</h3>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
            activeChannelsCount > 0 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${activeChannelsCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{activeChannelsCount} Active</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Select channels to dispatch on publish:</span>
          {onSelectAllChannels && (
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => onSelectAllChannels(true)}
                className="text-indigo-900 hover:underline cursor-pointer"
              >
                All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => onSelectAllChannels(false)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                None
              </button>
            </div>
          )}
        </div>

        {/* Channels List with Toggle Switches */}
        <div className="space-y-2 pt-1">
          {BROADCAST_CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isEnabled = Boolean(selectedChannels[ch.id]);

            return (
              <div
                key={ch.id}
                onClick={() => onChannelToggle && onChannelToggle(ch.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isEnabled
                    ? 'border-indigo-200 bg-indigo-50/40 shadow-2xs'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${ch.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {ch.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {ch.type}
                    </div>
                  </div>
                </div>

                {/* Animated Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onChannelToggle) onChannelToggle(ch.id);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isEnabled ? 'bg-indigo-950' : 'bg-slate-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 leading-normal">
            Articles will be automatically syndicated and formatted for each enabled channel via their configured API credentials.
          </p>
        </div>
      </div>

      {/* Featured Artwork & Media Assets Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-indigo-700" />
            <h3 className="font-serif text-sm font-bold text-slate-900">Featured Cover Imagery</h3>
          </div>
          {onOpenMediaPanel && (
            <button
              type="button"
              onClick={onOpenMediaPanel}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-100"
            >
              <span>Browse Media</span>
            </button>
          )}
        </div>

        {/* Current Image Preview */}
        {featuredImage ? (
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 group">
            <img src={featuredImage} alt="Featured cover preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {onOpenMediaPanel && (
                <button
                  type="button"
                  onClick={onOpenMediaPanel}
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 shadow-md cursor-pointer"
                >
                  Change Imagery
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={onOpenMediaPanel}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <ImageIcon className="h-8 w-8 text-slate-300" />
            <span className="text-xs font-semibold text-slate-600">Select or upload cover photo</span>
          </div>
        )}

        {/* Custom URL Input */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Image Direct Web URL
          </label>
          <input
            type="text"
            value={featuredImage}
            onChange={(e) => onFeaturedImageChange(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
          />
        </div>

        {/* Quick Presets */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Quick Curated Presets
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_IMAGES.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFeaturedImageChange(img)}
                className={`relative aspect-square overflow-hidden rounded-xl border transition-all cursor-pointer ${
                  featuredImage === img ? 'ring-2 ring-indigo-900 scale-102' : 'hover:opacity-80'
                }`}
              >
                <img src={img} alt={`Preset ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Taxonomy, Category & Tags Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Tag className="h-4 w-4 text-indigo-700" />
          <h3 className="font-serif text-sm font-bold text-slate-900">Taxonomy &amp; Metadata</h3>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Section / Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Keywords &amp; Hashtags
          </label>
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type tag and hit Enter..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
          />

          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                <span>#{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            URL Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="the-architecture-of-silence"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
          />
        </div>
      </div>

      {/* SEO Engine Card with Live SERP Preview and Character Counter */}
      <div className="space-y-4">
        {/* Accordion toggle for inputs */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-700" />
              <h3 className="font-serif text-sm font-bold text-slate-900">Search Engine Settings</h3>
            </div>
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              {seoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {seoOpen && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Meta Title
                  </label>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      seoTitle.length >= 40 && seoTitle.length <= 60
                        ? 'text-emerald-600'
                        : seoTitle.length > 60
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {seoTitle.length} / 60
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => onSeoTitleChange(e.target.value)}
                  placeholder="Custom search headline..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Meta Description
                  </label>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      seoDescription.length >= 120 && seoDescription.length <= 160
                        ? 'text-emerald-600'
                        : seoDescription.length > 160
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {seoDescription.length} / 160
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => onSeoDescriptionChange(e.target.value)}
                  placeholder="Rich snippet search description..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                />
              </div>

              {onGenerateAiSeo && (
                <button
                  type="button"
                  onClick={onGenerateAiSeo}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 py-2 text-xs font-semibold text-purple-800 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span>Auto-Generate SEO from Draft</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live SEO Preview Card with SERP & Social Cards */}
        <SeoPreviewCard
          title={articleTitle}
          metaTitle={seoTitle}
          metaDescription={seoDescription}
          slug={slug}
          featuredImage={featuredImage}
          onAutoGenerate={onGenerateAiSeo}
        />
      </div>
    </div>
  );
}
