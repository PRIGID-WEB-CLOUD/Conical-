import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-slate-200 pb-8 space-y-4 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Editorial Inquiries
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Contact the Editors
        </h1>
        <p className="text-base text-slate-600 font-serif italic">
          Submit pitch proposals, corrections, scholarly responses, or press inquiries.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-900">Dispatch Received</h3>
          <p className="text-xs sm:text-sm text-slate-600">Thank you for your correspondence. A member of our editorial staff will review your note within 3 business days.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Your Name</label>
              <input required type="text" placeholder="Dr. Elena Vance" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-900 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Email Address</label>
              <input required type="email" placeholder="vance@institution.org" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-900 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Inquiry Department</label>
            <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-900 focus:outline-none">
              <option>Editorial Essay Pitch</option>
              <option>Scholarly Response &amp; Letters</option>
              <option>Rights, Licensing &amp; Citations</option>
              <option>Press &amp; Media Relations</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Message / Pitch</label>
            <textarea required rows={5} placeholder="Provide your abstract, background credentials, or inquiry details..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-900 focus:outline-none" />
          </div>

          <button type="submit" className="w-full rounded-2xl bg-[#1e1b4b] hover:bg-indigo-950 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer">
            Send Editorial Dispatch
          </button>
        </form>
      )}
    </div>
  );
}
