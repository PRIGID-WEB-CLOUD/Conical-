import React, { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { SubscriberItem } from '@chronicle/shared';
import { Mail, Download, CheckCircle2 } from 'lucide-react';

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);

  useEffect(() => {
    adminApi.getSubscribers().then(setSubscribers);
  }, []);

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Tier,Status,Joined Date', ...subscribers.map((s) => `${s.email},${s.tier},${s.status},${s.joinedAt}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'chronicle_subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
            Readership Circulation
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            Active email dispatches, institutional patron lists, and digest circulation.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Subscriber</th>
                <th className="py-3.5 px-4 sm:px-6">Dispatch Tier</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 sm:py-4 px-4 sm:px-6 font-medium text-slate-900 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{s.email}</span>
                  </td>
                  <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                      {s.tier}
                    </span>
                  </td>
                  <td className="py-3.5 sm:py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-slate-400 whitespace-nowrap">{s.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
