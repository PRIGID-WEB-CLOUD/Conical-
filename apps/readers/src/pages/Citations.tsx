import React from 'react';
import { BookOpen, CheckCircle, Shield } from 'lucide-react';

export function CitationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-slate-200 pb-8 space-y-4 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Scholarly Standards
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Citation &amp; Academic Guidelines
        </h1>
        <p className="text-base text-slate-600 font-serif italic max-w-2xl mx-auto">
          Standards for citing Chronicle essays in peer-reviewed journals, university syllabi, and architectural monographs.
        </p>
      </div>

      <div className="prose prose-slate lg:prose-lg max-w-none space-y-6 text-slate-700 leading-relaxed">
        <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-900" />
          General Citation Policy
        </h2>
        <p>
          Chronicle assigns permanent DOIs and canonical URLs to all published pieces. When referencing our work in scholarly publications, please adhere to standard APA 7th Edition, MLA 9th Edition, or Chicago Manual of Style (17th ed.) guidelines.
        </p>

        <h3 className="text-xl font-serif font-bold text-slate-800 mt-6">Example APA Citation:</h3>
        <div className="bg-slate-100 p-4 rounded-xl font-mono text-xs text-slate-800">
          Vance, E. (2026). The Architecture of Silence: How Modern Urban Design is Reclaiming Quiet Spaces. <em>Chronicle Journal</em>, 42(1), 14–22.
        </div>

        <h3 className="text-xl font-serif font-bold text-slate-800 mt-6">Peer Review &amp; Fact Checking</h3>
        <p>
          All major research essays undergo dual blind peer-review by subject-matter fellows and technical verification by our editorial laboratory prior to publication.
        </p>
      </div>
    </div>
  );
}
