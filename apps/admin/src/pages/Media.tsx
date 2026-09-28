import React, { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { MediaAsset } from '@chronicle/shared';
import {
  Upload,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  Plus,
  LayoutGrid,
  List,
  X,
  ExternalLink,
  Code,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Architecture',
  'Editorial',
  'Photography',
  'Technology',
  'Culture',
  'Design Systems',
];

export function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'url' | 'markdown' | null>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState<MediaAsset['category']>('Editorial');
  const [uploading, setUploading] = useState(false);

  const loadMedia = React.useCallback(() => {
    adminApi
      .getMedia({
        category: filterCategory,
        search: search.trim() || undefined,
      })
      .then((data) => {
        setMediaList(data);
        setLoading(false);
      });
  }, [filterCategory, search]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleCopy = (text: string, id: string, type: 'url' | 'markdown') => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2500);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this media asset?')) {
      await adminApi.deleteMedia(id);
      loadMedia();
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadName.trim()) return;

    setUploading(true);
    await adminApi.uploadMedia({
      name: uploadName.trim(),
      url: uploadUrl.trim(),
      alt: uploadAlt.trim() || uploadName.trim(),
      caption: uploadCaption.trim(),
      category: uploadCategory,
      dimensions: '1400x933',
      sizeFormatted: '450 KB',
      mimeType: 'image/jpeg',
    });

    setUploading(false);
    setUploadModalOpen(false);
    setUploadName('');
    setUploadUrl('');
    setUploadAlt('');
    setUploadCaption('');
    loadMedia();
  };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Digital Asset Management
          </div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5">
            Media &amp; Imagery Repository
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Organize high-fidelity architectural photography, editorial folios, and post artwork.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e1b4b] hover:bg-indigo-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Upload className="h-4 w-4" />
          <span>Upload New Asset</span>
        </button>
      </div>

      {/* Control Panel: Search, Category Filter, View Mode */}
      <div className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by name, alt text, caption, or tags..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Category Dropdown */}
            <div className="relative min-w-[160px] w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/80 pl-8 pr-8 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-xl p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-xl p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Count & Info Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Repository contains <strong className="text-slate-900 font-bold">{mediaList.length}</strong> media assets
          </div>
          <div className="hidden sm:block text-slate-400">Supported formats: JPG, PNG, WEBP, SVG</div>
        </div>
      </div>

      {/* Media Grid / List */}
      {loading ? (
        <div className="py-24 text-center space-y-2">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-900 border-t-transparent" />
          <div className="text-xs text-slate-500">Loading media library...</div>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ImageIcon className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload new imagery or clear your active search and category filters.
          </p>
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e1b4b] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Upload Image</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {mediaList.map((asset) => {
            const markdownSyntax = `![${asset.alt || asset.name}](${asset.url})`;
            const isCopiedUrl = copiedId === asset.id && copiedType === 'url';
            const isCopiedMarkdown = copiedId === asset.id && copiedType === 'markdown';

            return (
              <div
                key={asset.id}
                className="group rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Aspect Box */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                    <img
                      src={asset.url}
                      alt={asset.alt}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white">
                        {asset.category}
                      </span>
                    </div>
                    {asset.dimensions && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono text-white">
                          {asset.dimensions}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Asset Details */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-xs text-slate-900 truncate" title={asset.name}>
                        {asset.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {asset.sizeFormatted || '400 KB'}
                      </span>
                    </div>

                    {asset.caption && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">{asset.caption}</p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(markdownSyntax, asset.id, 'markdown')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                        isCopiedMarkdown
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Copy Markdown code"
                    >
                      {isCopiedMarkdown ? <Check className="h-3 w-3" /> : <Code className="h-3 w-3" />}
                      <span>{isCopiedMarkdown ? 'Copied' : 'Markdown'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(asset.url, asset.id, 'url')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                        isCopiedUrl
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Copy Image URL"
                    >
                      {isCopiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopiedUrl ? 'Copied' : 'URL'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Thumbnail &amp; Name</th>
                  <th className="py-3.5 px-4 sm:px-6">Category</th>
                  <th className="py-3.5 px-4 sm:px-6">Dimensions / Size</th>
                  <th className="py-3.5 px-4 sm:px-6">Uploaded</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mediaList.map((asset) => {
                  const markdownSyntax = `![${asset.alt || asset.name}](${asset.url})`;
                  const isCopiedUrl = copiedId === asset.id && copiedType === 'url';

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 flex items-center gap-3">
                        <img
                          src={asset.url}
                          alt={asset.alt}
                          className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-none">
                            {asset.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-none">
                            {asset.alt}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {asset.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px]">
                        {asset.dimensions} • {asset.sizeFormatted}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-400">
                        {new Date(asset.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(markdownSyntax, asset.id, 'markdown')}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            Markdown
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(asset.url, asset.id, 'url')}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            {isCopiedUrl ? 'Copied' : 'URL'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(asset.id)}
                            className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload New Asset Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Upload className="h-4 w-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Upload Media Asset</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Image Source URL *
                </label>
                <input
                  type="url"
                  required
                  value={uploadUrl}
                  onChange={(e) => {
                    setUploadUrl(e.target.value);
                    if (!uploadName && e.target.value) {
                      setUploadName(`asset-${Date.now()}.jpg`);
                    }
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                />
              </div>

              {uploadUrl && (
                <div className="aspect-16/9 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={uploadUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Filename *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="architectural-facade.jpg"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Alt Description (Accessibility &amp; SEO)
                </label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="e.g. Modernist exposed concrete ceiling with skylight"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Editorial Caption (Optional)
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. Architectural detail of the Kyoto Pavilion, 2026."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-[#1e1b4b] hover:bg-indigo-950 px-5 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  {uploading ? 'Adding Asset...' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
