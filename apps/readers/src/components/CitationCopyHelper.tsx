import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CitationCopyHelperProps {
  title: string;
  author: string;
  date?: string;
  url?: string;
}

export function CitationCopyHelper({
  title,
  author,
  date = '2026',
  url = 'https://chronicle.press',
}: CitationCopyHelperProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const formats = {
    APA: `${author}. (${date}). ${title}. Chronicle Journal. ${url}`,
    MLA: `${author}. "${title}." Chronicle Journal, ${date}, ${url}.`,
    Chicago: `${author}. "${title}." Chronicle Journal (${date}). ${url}.`,
    BibTeX: `@article{chronicle_${date},\n  author = {${author}},\n  title = {${title}},\n  journal = {Chronicle Journal},\n  year = {${date}},\n  url = {${url}}\n}`,
  };

  const handleCopy = (formatName: keyof typeof formats) => {
    navigator.clipboard.writeText(formats[formatName]);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Academic Citation Formats
        </h4>
        <span className="text-[11px] text-slate-400">Click format to copy</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(formats) as Array<keyof typeof formats>).map((fmt) => (
          <button
            key={fmt}
            onClick={() => handleCopy(fmt)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 transition-colors shadow-2xs cursor-pointer"
          >
            {copiedFormat === fmt ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>{fmt}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
