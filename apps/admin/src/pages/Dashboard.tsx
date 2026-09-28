import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MetricsCards } from '../components/MetricsCards';
import { TrafficChart } from '../components/TrafficChart';
import { TopSpotlight } from '../components/TopSpotlight';
import { ActivityLog } from '../components/ActivityLog';
import { CronWidget } from '../components/CronWidget';
import { adminApi } from '../lib/api';
import { DashboardAnalytics, ActivityItem, Post } from '@chronicle/shared';
import { INITIAL_ANALYTICS, INITIAL_ACTIVITIES } from '@chronicle/shared';
import { PenLine, MessageSquare } from 'lucide-react';

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>(INITIAL_ANALYTICS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [topPost, setTopPost] = useState<Post | undefined>(undefined);
  const [totalComments, setTotalComments] = useState(12);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      if (res.analytics) setAnalytics(res.analytics);
      if (res.activities) setActivities(res.activities);
    });

    adminApi.getPosts().then((posts) => {
      setTopPost(posts[0]);
    });

    adminApi.getComments().then((comments) => {
      setTotalComments(comments.length);
    });
  }, []);

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Editorial Console
          </div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5 sm:mt-1">
            Publication Performance Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to="/editor"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e1b4b] hover:bg-indigo-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <PenLine className="h-4 w-4" />
            <span>Compose Draft</span>
          </Link>

          <Link
            to="/comments"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-slate-500" />
            <span>Moderate ({totalComments})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards analytics={analytics} />

      {/* Cron Automated Scheduler Widget */}
      <CronWidget />

      {/* Traffic Trends & Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8">
          <TrafficChart trends={analytics.trafficTrends} />
        </div>
        <div className="lg:col-span-4">
          <TopSpotlight post={topPost} />
        </div>
      </div>

      {/* Recent Activity */}
      <ActivityLog activities={activities} />
    </main>
  );
}
