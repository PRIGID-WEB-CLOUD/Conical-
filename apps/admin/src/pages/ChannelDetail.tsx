import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function ChannelDetailPage() {
  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Top Navigation */}
      <div>
        <Link
          to="/channels"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-900 transition-colors bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Channels</span>
        </Link>
      </div>

      {/* Empty State / Placeholder */}
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
          <ArrowLeft className="h-5 w-5 rotate-45" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-lg font-bold text-slate-900">Channel details empty for now</h2>
          <p className="text-xs text-slate-500 font-normal">
            API configurations are fully handled through environment variables.
          </p>
        </div>
      </div>
    </main>
  );
}
