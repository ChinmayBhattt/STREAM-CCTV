'use client';

import { useState } from 'react';
import { getAvatarColor, getInitials } from '@/lib/mock-data';
import { Alert } from '@/lib/types';
import { useDashboard } from '@/lib/dashboard-context';
import {
  Search, Check, CheckCheck, Bell, BellOff,
  Camera, Clock, Shield,
} from 'lucide-react';

export default function AlertsPage() {
  const { alerts, markAlertRead, markAllAlertsRead, dismissAlert } = useDashboard();
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = alerts.filter((a) => {
    const matchSearch =
      a.personName.toLowerCase().includes(search.toLowerCase()) ||
      a.cameraName.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterRead === 'all' ||
      (filterRead === 'unread' && !a.read) ||
      (filterRead === 'read' && a.read);
    return matchSearch && matchFilter;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAsRead = (id: string) => {
    markAlertRead(id);
  };

  const markAllRead = () => {
    markAllAlertsRead();
  };

  const dismiss = (id: string) => {
    dismissAlert(id);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Watchlist Alerts
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {unreadCount} unread matched feeds requiring verification
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button className="btn-pill-secondary" onClick={markAllRead} id="mark-all-read">
              <CheckCheck size={14} /> Mark all verified
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            className="input-pill"
            placeholder="Search by profile name or gate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 42 }}
            id="alerts-search"
          />
        </div>
        <div className="flex items-center gap-1.5 p-0.5 glass-pill overflow-x-auto max-w-full no-scrollbar">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterRead(f)}
              className="px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 whitespace-nowrap capitalize"
              style={{
                background: filterRead === f ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: filterRead === f ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                color: filterRead === f ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {f}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-[var(--accent-rose)]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="glass-panel p-4 flex items-start gap-4 transition-all duration-300"
            style={{
              borderLeft: !alert.read ? '3px solid var(--accent-lime)' : '1px solid var(--border-default)',
              background: !alert.read ? 'rgba(210, 255, 60, 0.02)' : 'var(--bg-card)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: getAvatarColor(alert.personName), color: 'white' }}
            >
              {getInitials(alert.personName)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-[var(--text-primary)]">
                    <span className="font-semibold">{alert.personName}</span>
                    <span className="text-[var(--text-secondary)]"> matched at </span>
                    <span className="font-semibold text-glow-cyan text-[var(--accent-cyan)]">
                      {alert.cameraName}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatTime(alert.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera size={11} />
                      {alert.cameraName}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px]"
                      style={{
                        background: alert.confidence >= 0.9
                          ? 'rgba(28, 240, 224, 0.08)'
                          : 'rgba(255, 178, 36, 0.08)',
                        color: alert.confidence >= 0.9
                          ? 'var(--accent-cyan)'
                          : 'var(--accent-orange)',
                        border: alert.confidence >= 0.9
                          ? '1px solid rgba(28, 240, 224, 0.15)'
                          : '1px solid rgba(255, 178, 36, 0.15)',
                      }}
                    >
                      {Math.round(alert.confidence * 100)}% Match
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!alert.read && (
                    <button
                      className="btn-ghost p-1.5 hover:text-[var(--accent-lime)]"
                      onClick={() => markAsRead(alert.id)}
                      title="Verify identity"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    className="btn-ghost p-1.5 hover:text-[var(--accent-rose)]"
                    onClick={() => dismiss(alert.id)}
                    title="Dismiss alert"
                  >
                    <BellOff size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 glass-panel">
          <Bell size={36} className="text-[var(--text-muted)] mb-4" />
          <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)]">
            No notification matches
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Everything is calm. Match history logs will list here.
          </p>
        </div>
      )}
    </div>
  );
}
