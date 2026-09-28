import React, { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { MediaAsset } from '@chronicle/shared';
import {
  Image as ImageIcon,
  Search,
  Upload,
  Plus,
  Check,
  X,
  FilePlus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface MediaSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoContent: (markdown: string) => void;
  onSetFeaturedImage: (url: string) => void;
  currentFeaturedImage?: string;
}

export function MediaSidePanel({
  isOpen,
  onClose,
  onInsertIntoContent,
  onSetFeaturedImage,
  currentFeaturedImage,
}: MediaSidePanelProps) {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);

  // Quick upload fields
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [newCategory, setNewCategory] = useState<MediaAsset['category']>('Architecture');
  const [uploading, setUploading] = useState(false);

  const categories = [
    'All',
    'Architecture',
    'Editorial',
    'Photography',
    'Technology',
    'Culture',
    'Design Systems',
  ];

  const loadMedia = React.useCallback(() => {
    adminApi
      .getMedia({
        category: filterCategory === 'All' ? undefined : filterCategory,
        search: search.trim() || undefined,
      })
      .then((data) => {
        setMediaList(data);
        setLoading(false);
      });
  }, [filterCategory, search]);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, loadMedia]);

  const handleInsert = (asset: MediaAsset) => {
    const captionText = asset.caption ? `\n\n*${asset.caption}*` : '';
    const markdown = `\n\n![${asset.alt || asset.name}](${asset.url})${captionText}\n\n`;
    onInsertIntoContent(markdown);
    setInsertedId(asset.id);
    setTimeout(() => setInsertedId(null), 2000);
  };

  const handleQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setUploading(true);
    const fileName = newName.trim() || `asset-${Date.now()}.jpg`;
    await adminApi.uploadMedia({
      name: fileName,
      url: newUrl.trim(),
      alt: newAlt.trim() || fileName,
      category: newCategory,
      dimensions: '1400x933',
      sizeFormatted: '450 KB',
      mimeType: 'image/jpeg',
    });

    setUploading(false);
    setUploadMode(false);
    setNewUrl('');
    setNewName('');
    setNewAlt('');
    loadMedia();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-900">Media &amp; Imagery Asset Browser</h3>
            <p className="text-[10px] text-slate-500">Insert artwork directly into draft or set cover</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Search & Categories */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search imagery..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold text-slate-600">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#1e1b4b] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toggle Quick Upload Button */}
        <button
          type="button"
          onClick={() => setUploadMode(!uploadMode)}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          {uploadMode ? <X className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
          <span>{uploadMode ? 'Cancel Upload' : 'Upload / Add Image from URL'}</span>
        </button>

        {/* Upload inline form */}
        {uploadMode && (
          <form onSubmit={handleQuickUpload} className="rounded-2xl border border-slate-200 p-3 space-y-2.5 bg-slate-50">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Image Web URL *
              </label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="facade.jpg"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-900"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-[#1e1b4b] hover:bg-indigo-950 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {uploading ? 'Adding...' : 'Save & Make Available'}
            </button>
          </form>
        )}
      </div>

      {/* Media Asset List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading imagery...</div>
        ) : mediaList.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <ImageIcon className="mx-auto h-8 w-8 text-slate-300" />
            <div className="text-xs font-semibold text-slate-700">No images match your search</div>
            <p className="text-[11px] text-slate-400">Try changing your filters or add a new URL.</p>
          </div>
        ) : (
          mediaList.map((asset) => {
            const isFeatured = currentFeaturedImage === asset.url;
            const isRecentlyInserted = insertedId === asset.id;

            return (
              <div
                key={asset.id}
                className="group rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex gap-3">
                  <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img src={asset.url} alt={asset.alt} className="h-full w-full object-cover" />
                    {isFeatured && (
                      <div className="absolute top-1 left-1">
                        <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                          Cover
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                        {asset.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {asset.sizeFormatted || '420 KB'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                      {asset.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      {asset.caption || asset.alt}
                    </p>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleInsert(asset)}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      isRecentlyInserted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-950 hover:bg-indigo-100'
                    }`}
                  >
                    {isRecentlyInserted ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Inserted!</span>
                      </>
                    ) : (
                      <>
                        <FilePlus className="h-3.5 w-3.5 text-indigo-700" />
                        <span>Insert in Draft</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetFeaturedImage(asset.url)}
                    disabled={isFeatured}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer border ${
                      isFeatured
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-80 cursor-default'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isFeatured ? 'Is Cover' : 'Set as Cover'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link to full media manager */}
      <div className="border-t border-slate-200 p-3 bg-slate-50 text-center">
        <a
          href="/admin/media"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-900 hover:underline"
        >
          <span>Open Full Media Library Manager</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
