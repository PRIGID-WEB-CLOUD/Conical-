import React, { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { Cpu, RefreshCw, Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

type CronStatusData = Awaited<ReturnType<typeof adminApi.getCronStatus>>;

export function CronWidget() {
  const [status, setStatus] = useState<CronStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCron = () => {
    adminApi.getCronStatus().then((data) => {
      setStatus(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCron();
    const interval = setInterval(fetchCron, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleManualTrigger = async () => {
    setTriggering(true);
    setMessage(null);
    const res = await adminApi.triggerCron();
    setTriggering(false);
    setMessage(res.message);
    fetchCron();
    setTimeout(() => setMessage(null), 4000);
  };

  if (loading || !status) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-8 w-48 bg-slate-100 rounded" />
      </div>
    );
  }

  const queuedCount = status.queuedScheduledCount || 0;
  const lastRunStr = status.stats?.lastRunAt
    ? new Date(status.stats.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Active';

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-900">
              Automated Schedule Publisher Cron Engine
            </h3>
            <p className="text-[10px] text-slate-500">
              Interval runner checking pipeline every {status.intervalSeconds || 5}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Engine Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Queued Dispatches</span>
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div className="font-serif text-xl font-bold text-slate-900">{queuedCount}</div>
          <p className="text-[10px] text-slate-500">Pending future release</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Total Auto-Published</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="font-serif text-xl font-bold text-slate-900">
            {status.stats?.totalAutoPublished || 0}
          </div>
          <p className="text-[10px] text-slate-500">Matured and released</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Last Cron Check</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 mt-1">{lastRunStr}</div>
          <p className="text-[10px] text-slate-500">Cycle execution ok</p>
        </div>
      </div>

      {/* Trigger & Message */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-600 font-medium truncate">
          {message ? (
            <span className="text-indigo-900 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>{message}</span>
            </span>
          ) : queuedCount > 0 ? (
            <span>Next post scheduled for auto-release as soon as timestamp matures.</span>
          ) : (
            <span className="text-slate-400">All scheduled publishing queues clear.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleManualTrigger}
          disabled={triggering}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-semibold text-indigo-950 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-indigo-700 ${triggering ? 'animate-spin' : ''}`} />
          <span>{triggering ? 'Running Cron...' : 'Trigger Cron Engine'}</span>
        </button>
      </div>
    </div>
  );
}
