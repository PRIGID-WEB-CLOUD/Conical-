import React, { useState } from 'react';
import { Sparkles, X, Loader2, Copy, Check } from 'lucide-react';
import { adminApi } from '../lib/api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  onApplyText?: (text: string) => void;
}

export function AiAssistantModal({
  isOpen,
  onClose,
  title,
  content,
  onApplyText,
}: AiAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'headline' | 'summary' | 'citations' | 'readability'>('headline');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (task: 'headline' | 'summary' | 'citations' | 'readability') => {
    setActiveTab(task);
    setLoading(true);
    try {
      const res = await adminApi.aiEditorialAssist(task, title, content);
      setResult(res);
    } catch {
      setResult('Failed to connect to AI server. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Chronicle Editorial Copilot</h3>
              <p className="text-xs text-slate-400">Powered by server-side Gemini 2.5 Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'headline', label: 'Suggest Headlines' },
            { id: 'summary', label: 'Draft Excerpt' },
            { id: 'citations', label: 'Extract Citations' },
            { id: 'readability', label: 'Cadence Critique' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleGenerate(tab.id as any)}
              className={`rounded-xl py-2.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Result Area */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 min-h-[160px] flex flex-col justify-between">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              <span className="text-xs">Analyzing spatial prose and structure...</span>
            </div>
          ) : result ? (
            <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              Select an editorial operation above to generate suggestions based on your draft.
            </div>
          )}

          {result && !loading && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/80 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {onApplyText && activeTab === 'summary' && (
                <button
                  onClick={() => {
                    onApplyText(result);
                    onClose();
                  }}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Apply to Excerpt
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
