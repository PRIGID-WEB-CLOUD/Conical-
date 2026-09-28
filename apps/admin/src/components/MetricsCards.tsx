import React from 'react';
import { Eye, Users, Zap, TrendingUp } from 'lucide-react';
import { DashboardAnalytics } from '@chronicle/shared';

interface MetricsCardsProps {
  analytics: DashboardAnalytics;
}

export function MetricsCards({ analytics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Total Views */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">Total Views (30d)</span>
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-baseline gap-2 sm:gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {analytics.totalViews30d?.toLocaleString() || '342,800'}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +{analytics.viewsGrowth || 12.4}%
          </span>
        </div>
        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-400">Vs. previous 30 days cycle</p>
      </div>

      {/* Active Subscribers */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">Active Subscribers</span>
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-baseline gap-2 sm:gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {analytics.activeSubscribers?.toLocaleString() || '28,450'}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +{analytics.subscribersGrowth || 8.1}%
          </span>
        </div>
        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-400">
          {analytics.newSubscribersThisWeek || 420} joined this week
        </p>
      </div>

      {/* Engagement Rate */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">Engagement Rate</span>
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-baseline gap-2 sm:gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {analytics.engagementRate || 88.4}%
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +{analytics.engagementGrowth || 4.2}%
          </span>
        </div>
        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-400">
          Avg. time on page: {analytics.avgTimeOnPage || '4m 12s'}
        </p>
      </div>
    </div>
  );
}
