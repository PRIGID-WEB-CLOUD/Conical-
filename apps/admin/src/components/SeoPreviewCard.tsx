import React, { useState } from 'react';
import { Search, Globe, Smartphone, Monitor, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface SeoPreviewCardProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  featuredImage?: string;
  onAutoGenerate?: () => void;
}

export function SeoPreviewCard({
  title,
  metaTitle,
  metaDescription,
  slug,
  featuredImage,
  onAutoGenerate,
}: SeoPreviewCardProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [viewTab, setViewTab] = useState<'google' | 'social'>('google');

  const displayTitle = metaTitle || title || 'Untitled Article';
  const displayDesc =
    metaDescription ||
    'Read this comprehensive essay published by Chronicle Editorial Board covering modern spatial architecture, design systems, and digital culture.';
  const displaySlug = slug || 'untitled-article';

  // Real-time character counts
  const titleLength = displayTitle.length;
  const descLength = displayDesc.length;

  // Title validation (optimal 45-60)
  const titleStatus: 'optimal' | 'warning' | 'danger' =
    titleLength >= 40 && titleLength <= 60
      ? 'optimal'
      : titleLength > 60
      ? 'danger'
      : 'warning';

  // Description validation (optimal 120-160)
  const descStatus: 'optimal' | 'warning' | 'danger' =
    descLength >= 120 && descLength <= 160
      ? 'optimal'
      : descLength > 160
      ? 'danger'
      : 'warning';

  // Overall SEO Health Score calculation
  let seoScore = 60;
  if (titleLength >= 35 && titleLength <= 65) seoScore += 15;
  if (descLength >= 100 && descLength <= 165) seoScore += 15;
  if (slug && !slug.includes(' ')) seoScore += 10;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      {/* Header & Score */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-indigo-700" />
          <h3 className="font-serif text-sm font-bold text-slate-900">SEO Search Engine Preview</h3>
        </div>

        <div className="flex items-center gap-2">
          {onAutoGenerate && (
            <button
              type="button"
              onClick={onAutoGenerate}
              className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200/60"
              title="Auto optimize title and description"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Auto AI</span>
            </button>
          )}

          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getScoreColor(
              seoScore
            )}`}
          >
            <span>Score: {seoScore}/100</span>
          </div>
        </div>
      </div>

      {/* Real-time Character Counters & Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Title Length Indicator */}
        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700">Meta Title Length</span>
            <span
              className={`font-mono font-bold ${
                titleStatus === 'optimal'
                  ? 'text-emerald-600'
                  : titleStatus === 'danger'
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            >
              {titleLength} / 60 chars
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                titleStatus === 'optimal'
                  ? 'bg-emerald-500'
                  : titleStatus === 'danger'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400">
            {titleStatus === 'optimal'
              ? '✓ Optimal length for Google SERP display'
              : titleStatus === 'danger'
              ? '⚠️ Title may be truncated in search results'
              : 'Add more descriptive keywords (40-60 optimal)'}
          </p>
        </div>

        {/* Description Length Indicator */}
        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700">Meta Description</span>
            <span
              className={`font-mono font-bold ${
                descStatus === 'optimal'
                  ? 'text-emerald-600'
                  : descStatus === 'danger'
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            >
              {descLength} / 160 chars
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                descStatus === 'optimal'
                  ? 'bg-emerald-500'
                  : descStatus === 'danger'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400">
            {descStatus === 'optimal'
              ? '✓ Optimal length for search snippet click-through'
              : descStatus === 'danger'
              ? '⚠️ Exceeds 160 characters (will get clipped)'
              : 'Add more detail (120-160 optimal)'}
          </p>
        </div>
      </div>

      {/* Preview Simulator Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setViewTab('google')}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                viewTab === 'google' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Google SERP
            </button>
            <button
              type="button"
              onClick={() => setViewTab('social')}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                viewTab === 'social' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Social Card
            </button>
          </div>

          {viewTab === 'google' && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`rounded-lg p-1 text-slate-600 transition-colors cursor-pointer ${
                  deviceMode === 'desktop' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50'
                }`}
                title="Desktop View"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`rounded-lg p-1 text-slate-600 transition-colors cursor-pointer ${
                  deviceMode === 'mobile' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50'
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Live Snippet Box */}
        {viewTab === 'google' ? (
          <div
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-all ${
              deviceMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}
          >
            {/* Google SERP Header */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e1b4b] text-[10px] font-bold text-white shrink-0">
                C
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-slate-800 leading-none truncate">
                  Chronicle Magazine
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                  https://chronicle.press &rsaquo; articles &rsaquo; {displaySlug}
                </div>
              </div>
            </div>

            {/* Clickable SERP Headline */}
            <h4 className="text-sm sm:text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
              {displayTitle} | Chronicle Press
            </h4>

            {/* Snippet Description */}
            <p className="mt-1 text-xs text-[#4d5156] leading-relaxed line-clamp-2">
              <span className="text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —{' '}
              </span>
              {displayDesc}
            </p>
          </div>
        ) : (
          /* Social OpenGraph Preview Card */
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs max-w-md mx-auto">
            {featuredImage && (
              <div className="relative aspect-16/9 w-full bg-slate-100">
                <img src={featuredImage} alt="OG Card" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                chronicle.press
              </div>
              <h4 className="font-serif text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                {displayTitle}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{displayDesc}</p>
            </div>
          </div>
        )}
      </div>

      {/* SEO Optimization Checklist */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          {titleLength >= 35 && titleLength <= 65 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          )}
          <span>Header tags structured for organic indexability</span>
        </div>
        <div className="flex items-center gap-1.5">
          {descLength >= 100 && descLength <= 165 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          )}
          <span>Rich semantic snippet length optimized</span>
        </div>
      </div>
    </div>
  );
}
