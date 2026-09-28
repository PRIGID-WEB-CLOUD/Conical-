import React from 'react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-slate-200 pb-8 space-y-4 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Publication Mission
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          About Chronicle
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-serif italic max-w-2xl mx-auto">
          &ldquo;An independent forum dedicated to longform spatial analysis, architectural theory, and humane technology design.&rdquo;
        </p>
      </div>

      <div className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-serif space-y-6 text-slate-700 leading-relaxed">
        <h2 className="text-2xl font-serif font-bold text-slate-900">Our Editorial Philosophy</h2>
        <p>
          Founded in London and San Francisco, Chronicle was established to counter the accelerating fragmentation of contemporary internet discourse. We believe deep comprehension demands deliberate pacing, spacious visual typography, and meticulous factual verification.
        </p>
        <p>
          We publish comprehensive essays that treat architecture, artificial intelligence, city planning, and cultural history not as isolated silos, but as deeply intertwined forces shaping human consciousness.
        </p>

        <h2 className="text-2xl font-serif font-bold text-slate-900 mt-8">Editorial Independence &amp; Funding</h2>
        <p>
          Chronicle accepts zero corporate underwriting, automated programmatic ad exchanges, or undisclosed sponsored articles. Our journalism is supported directly by reader subscriptions, print monographs, and institutional archival licensing.
        </p>
      </div>

      <div className="pt-8 border-t border-slate-200 flex flex-wrap gap-4 justify-center">
        <Link to="/articles" className="rounded-2xl bg-[#1e1b4b] px-6 py-3 text-xs font-semibold text-white hover:bg-indigo-950 transition-colors">
          Browse All Essays
        </Link>
        <Link to="/masthead" className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          View Editorial Masthead
        </Link>
      </div>
    </div>
  );
}
