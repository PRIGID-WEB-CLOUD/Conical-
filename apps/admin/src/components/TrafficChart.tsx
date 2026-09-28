import React, { useState } from 'react';

interface TrafficChartProps {
  trends?: {
    week: { label: string; views: number }[];
    month: { label: string; views: number }[];
    year: { label: string; views: number }[];
  };
}

export function TrafficChart({ trends }: TrafficChartProps) {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  const defaultWeek = [
    { label: 'Mon', views: 38200 },
    { label: 'Tue', views: 42100 },
    { label: 'Wed', views: 51200 },
    { label: 'Thu', views: 48900 },
    { label: 'Fri', views: 59400 },
    { label: 'Sat', views: 41200 },
    { label: 'Sun', views: 61800 },
  ];
  const data = trends?.[range] || defaultWeek;

  const maxVal = Math.max(...data.map((d) => d.views));
  const minVal = Math.min(...data.map((d) => d.views)) * 0.8;

  const width = 600;
  const height = 220;
  const paddingX = 35;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const normalized = (d.views - minVal) / (maxVal - minVal || 1);
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Traffic Trend Analysis</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {range === 'week'
              ? 'Hourly unique visitors over the last 7 days'
              : range === 'month'
              ? 'Weekly unique visitors over the past 30 days'
              : 'Quarterly readership metrics across publications'}
          </p>
        </div>

        <div className="flex items-center self-start sm:self-auto rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
          {(['week', 'month', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs capitalize transition-all cursor-pointer ${
                range === r
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4 sm:mt-6 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-44 sm:h-56 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4338ca" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e2e8f0"
          />

          <path d={areaD} fill="url(#chartGradient)" />

          <path
            d={pathD}
            fill="none"
            stroke="#4338ca"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {points.map((pt, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-white stroke-[#4338ca] stroke-3 transition-transform group-hover:r-6"
              />
              <title>{`${pt.label}: ${pt.views.toLocaleString()} visitors`}</title>
            </g>
          ))}
        </svg>

        <div className="flex justify-between px-2 sm:px-6 pt-2 text-[10px] sm:text-xs font-medium text-slate-400">
          {points.map((pt) => (
            <span key={pt.label}>{pt.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
