import React from 'react';
import { Link } from 'react-router-dom';
import { ActivityItem } from '@chronicle/shared';

interface ActivityLogProps {
  activities: ActivityItem[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const getBadgeStyle = (type: ActivityItem['statusType']) => {
    switch (type) {
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'moderated':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'system':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Activity Log</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Real-time actions across your editorial team</p>
        </div>
        <Link
          to="/articles"
          className="text-xs font-semibold text-[#1e1b4b] hover:underline shrink-0"
        >
          View All
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((act) => (
          <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 sm:py-4 gap-2.5 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 mt-0.5 sm:mt-0">
                {act.initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-800 leading-snug">
                  <span className="font-semibold text-slate-900">{act.actorName}</span>{' '}
                  <span className="text-slate-500">{act.action}</span>{' '}
                  <span className="font-medium text-slate-900 break-words">{act.targetTitle}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-1">
                  <span>{act.timeAgo}</span>
                  {act.categoryBadge && (
                    <>
                      <span>•</span>
                      <span>Category: {act.categoryBadge}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="self-start sm:self-center pl-11 sm:pl-0 shrink-0">
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium capitalize ${getBadgeStyle(
                  act.statusType
                )}`}
              >
                {act.statusBadge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
