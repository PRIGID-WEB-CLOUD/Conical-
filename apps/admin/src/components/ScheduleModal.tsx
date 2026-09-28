import React, { useState } from 'react';
import { Clock, Calendar, X, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledAt?: string;
  onConfirmSchedule: (datetimeIso: string) => void;
  onUnschedule?: () => void;
  articleTitle?: string;
}

export function ScheduleModal({
  isOpen,
  onClose,
  scheduledAt,
  onConfirmSchedule,
  onUnschedule,
  articleTitle,
}: ScheduleModalProps) {
  // Format datetime-local helper
  const formatForPicker = (dateObj: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(
      dateObj.getHours()
    )}:${pad(dateObj.getMinutes())}`;
  };

  const getTomorrowDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return formatForPicker(d);
  };

  const [datetimeLocal, setDatetimeLocal] = useState<string>(() => {
    if (scheduledAt) {
      return formatForPicker(new Date(scheduledAt));
    }
    return getTomorrowDefault();
  });

  if (!isOpen) return null;

  const selectedDate = new Date(datetimeLocal);
  const now = new Date();
  const isFuture = selectedDate > now;

  // Calculate relative countdown string
  const getCountdownString = () => {
    if (!isFuture) return 'Selected time is in the past';
    const diffMs = selectedDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;

    if (diffDays > 0) {
      return `Will automatically publish in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}${
        remHours > 0 ? `, ${remHours} ${remHours === 1 ? 'hour' : 'hours'}` : ''
      }`;
    }
    if (diffHours > 0) {
      return `Will automatically publish in ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    }
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `Will automatically publish in ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'}`;
  };

  // Quick preset handlers
  const applyPreset = (daysOffset: number, hour: number = 9) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hour, 0, 0, 0);
    setDatetimeLocal(formatForPicker(d));
  };

  const handleSave = () => {
    if (!isFuture) return;
    const isoString = new Date(datetimeLocal).toISOString();
    onConfirmSchedule(isoString);
    onClose();
  };

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900">
                Schedule Article Publication
              </h3>
              <p className="text-[11px] text-slate-500">Set future release timestamp</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {articleTitle && (
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Manuscript
            </span>
            <p className="font-serif text-xs font-bold text-slate-900 truncate">
              {articleTitle}
            </p>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Quick Publication Presets
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => applyPreset(1, 9)}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2 font-semibold text-slate-700 transition-colors cursor-pointer text-center"
            >
              Tomorrow 9 AM
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2, 12)}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2 font-semibold text-slate-700 transition-colors cursor-pointer text-center"
            >
              In 2 Days 12 PM
            </button>
            <button
              type="button"
              onClick={() => applyPreset(7, 9)}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2 font-semibold text-slate-700 transition-colors cursor-pointer text-center"
            >
              Next Week
            </button>
          </div>
        </div>

        {/* Custom DateTime Picker */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Custom Release Date &amp; Time ({userTimezone})
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="datetime-local"
              value={datetimeLocal}
              onChange={(e) => setDatetimeLocal(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Live Countdown & Validation */}
        <div
          className={`rounded-2xl p-3 text-xs flex items-center gap-2 font-medium border ${
            isFuture
              ? 'bg-indigo-50/80 text-indigo-900 border-indigo-200/60'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {isFuture ? (
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{getCountdownString()}</span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {scheduledAt && onUnschedule ? (
            <button
              type="button"
              onClick={() => {
                onUnschedule();
                onClose();
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
            >
              Unschedule (Return to Draft)
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isFuture}
              className="flex items-center gap-1.5 rounded-xl bg-[#1e1b4b] hover:bg-indigo-950 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Confirm Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
