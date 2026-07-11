'use client';

import { mockFootfallData, mockAnalyticsSummary, mockCameras } from '@/lib/mock-data';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Camera, Bell, Clock } from 'lucide-react';

const chartColors = ['var(--accent-lime)', 'var(--accent-cyan)', 'var(--accent-orange)', 'var(--accent-purple)'];

export default function AnalyticsPage() {
  const summary = mockAnalyticsSummary;
  const onlineCameras = mockCameras.filter((c) => c.status === 'online');

  // Peak hours data for bar chart
  const peakData = onlineCameras.map((cam) => {
    const camData = mockFootfallData.reduce(
      (max, dp) => {
        const val = (dp[cam.name] as number) ?? 0;
        return val > max.count ? { hour: dp.hour, count: val } : max;
      },
      { hour: '00:00', count: 0 }
    );
    return { name: cam.name, peak: camData.count, peakHour: camData.hour };
  });

  const statCards = [
    {
      label: 'Total Footfall Today',
      value: summary.totalFootfall.toLocaleString(),
      change: summary.footfallChange,
      icon: Users,
      color: 'var(--accent-lime)',
    },
    {
      label: 'Peak Hour',
      value: summary.peakHour,
      change: null,
      icon: Clock,
      color: 'var(--accent-cyan)',
    },
    {
      label: 'Active Cameras',
      value: `${summary.activeCameras} / ${mockCameras.length}`,
      change: null,
      icon: Camera,
      color: 'var(--accent-orange)',
    },
    {
      label: 'Watchlist Alerts',
      value: summary.totalAlerts.toString(),
      change: summary.alertsChange,
      icon: Bell,
      color: 'var(--accent-rose)',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Analytics & Insights
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Footfall monitoring and detection metrics across active cameras
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass-panel p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {card.label}
              </span>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `rgba(255, 255, 255, 0.04)`, border: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <card.icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {card.value}
            </p>
            {card.change !== null && (
              <div className="flex items-center gap-1 mt-2">
                {card.change >= 0 ? (
                  <TrendingUp size={14} style={{ color: 'var(--accent-lime)' }} />
                ) : (
                  <TrendingDown size={14} style={{ color: 'var(--accent-rose)' }} />
                )}
                <span
                  className="text-xs font-semibold"
                  style={{ color: card.change >= 0 ? 'var(--accent-lime)' : 'var(--accent-rose)' }}
                >
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">vs yesterday</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Footfall Over Time */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Footfall Distribution
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            Hourly analytics of monitored zones (HLS streams)
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={mockFootfallData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  {onlineCameras.map((cam, i) => (
                    <linearGradient key={cam.id} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(18, 18, 24, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    boxShadow: 'var(--shadow-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 15 }}
                />
                {onlineCameras.map((cam, i) => (
                  <Area
                    key={cam.id}
                    type="monotone"
                    dataKey={cam.name}
                    stroke={chartColors[i % chartColors.length]}
                    strokeWidth={2}
                    fill={`url(#grad-${i})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Activity by Camera */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Zone Peak Footfall
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            Maximum recorded detections per camera (24-hour cycle)
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={peakData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(18, 18, 24, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    boxShadow: 'var(--shadow-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    backdropFilter: 'blur(10px)',
                  }}
                  formatter={(value: any) => [`${value} people`, 'Peak Detections']}
                />
                {/* 
                  To match the screenshot's super rounded "pill" bars, 
                  we use radius={[20, 20, 0, 0]} or radius={20} and fill 
                */}
                <Bar
                  dataKey="peak"
                  fill="var(--accent-lime)"
                  radius={[20, 20, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Person Count Cards */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Live Connection Status & Counts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockCameras.map((cam) => (
            <div
              key={cam.id}
              className="glass-panel p-4 text-center glass-panel-hover"
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className={`status-dot status-${cam.status}`} />
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] truncate max-w-[80px]">
                  {cam.name}
                </span>
              </div>
              <p
                className="text-3xl font-bold tracking-tight text-glow-cyan"
                style={{ color: cam.status === 'online' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
              >
                {cam.status === 'online' ? cam.personCount : '—'}
              </p>
              <p className="text-[10px] uppercase font-bold mt-1 text-[var(--text-muted)]">
                people
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
