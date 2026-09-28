import React from 'react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-1">Last revised: March 2026</p>
      </div>
      <div className="prose prose-slate max-w-none space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>At Chronicle, we prioritize the sovereign privacy of our readers. We do not participate in cross-site behavioral tracking networks, sell email lists to third-party data brokers, or employ invasive canvas fingerprinting.</p>
        <h3 className="font-serif text-lg font-bold text-slate-900 mt-6">Data We Collect</h3>
        <p>We collect only the essential information needed to deliver your chosen subscriptions, process commentary, and understand high-level readership analytics (such as page view aggregates and read-completion rates).</p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500 mt-1">Last revised: March 2026</p>
      </div>
      <div className="prose prose-slate max-w-none space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>By accessing or subscribing to Chronicle, you agree to adhere to respectful scholarly engagement and community dialogue standards.</p>
        <h3 className="font-serif text-lg font-bold text-slate-900 mt-6">Intellectual Property &amp; Archival Rights</h3>
        <p>All essays, architectural photography, typographic layouts, and proprietary analysis published by Chronicle are protected under international copyright treaties. Academic quotation and scholarly citation are welcome with proper attribution.</p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto py-32 text-center space-y-4 px-4">
      <div className="font-serif text-6xl font-extrabold text-slate-900">404</div>
      <h1 className="font-serif text-2xl font-bold text-slate-800">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-600">The requested page or publication piece could not be located.</p>
      <a href="/" className="inline-block rounded-xl bg-[#1e1b4b] px-5 py-2.5 text-xs font-semibold text-white">
        Return to Frontpage
      </a>
    </div>
  );
}
