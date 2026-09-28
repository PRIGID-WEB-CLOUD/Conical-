import React from 'react';
import {
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RichEditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  readingTimeMinutes: number;
  onOpenAi: () => void;
}

export function RichEditorToolbar({
  onFormat,
  readingTimeMinutes,
  onOpenAi,
}: RichEditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between border-y border-slate-200/80 bg-slate-50/80 px-4 py-2 text-slate-600">
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onFormat('bold')}
          title="Bold"
          className="rounded-lg p-2 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onFormat('italic')}
          title="Italic"
          className="rounded-lg p-2 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onFormat('heading')}
          title="Heading"
          className="rounded-lg p-2 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Heading className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => onFormat('unorderedList')}
          title="Bullet List"
          className="rounded-lg p-2 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onFormat('orderedList')}
          title="Numbered List"
          className="rounded-lg p-2 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onFormat('blockquote')}
          title="Blockquote"
          className="rounded-lg p-2 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => onFormat('link')}
          title="Insert Link"
          className="rounded-lg p-2 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{readingTimeMinutes} min read</span>
        </div>

        <button
          type="button"
          onClick={onOpenAi}
          className="flex items-center gap-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span>AI Assistant</span>
        </button>
      </div>
    </div>
  );
}
