'use client';

import { useState } from 'react';
import { Settings as SettingsType } from '@/lib/types';
import {
  Save, Shield, Database, Bell, Eye, Trash2,
  Download, RotateCcw, Info,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType>({
    matchThreshold: 75,
    retentionDays: 30,
    soundAlerts: true,
    desktopNotifications: false,
    autoReconnect: true,
    overlayBboxes: true,
  });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const retentionOptions = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '180 days' },
    { value: 365, label: '1 year' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Control Panel
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Adjust detection sensitivity, data retention rules, and notification filters
        </p>
      </div>

      <div className="space-y-6">
        {/* Detection Settings */}
        <section className="glass-panel p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Eye size={16} style={{ color: 'var(--accent-lime)' }} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Detection & Recognition
            </h3>
          </div>

          {/* Match Threshold */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Face Match Threshold
              </label>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--accent-lime)' }}
              >
                {settings.matchThreshold}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={99}
              value={settings.matchThreshold}
              onChange={(e) => update('matchThreshold', parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-lime) 0%, var(--accent-lime) ${((settings.matchThreshold - 50) / 49) * 100}%, rgba(255,255,255,0.08) ${((settings.matchThreshold - 50) / 49) * 100}%, rgba(255,255,255,0.08) 100%)`,
                accentColor: 'var(--accent-lime)',
              }}
              id="match-threshold-slider"
            />
            <div className="flex justify-between text-[10px] mt-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <span>High Sensitivity (50%)</span>
              <span>High Precision (99%)</span>
            </div>
          </div>

          {/* BBox overlay */}
          <ToggleRow
            label="Bounding Box Overlays"
            description="Draw live identification labels on active camera feeds"
            checked={settings.overlayBboxes}
            onChange={(v) => update('overlayBboxes', v)}
            id="toggle-bbox"
          />

          {/* Auto reconnect */}
          <ToggleRow
            label="Auto-Reconnect Stream"
            description="Re-mux and reconnect to stream servers during frame loss"
            checked={settings.autoReconnect}
            onChange={(v) => update('autoReconnect', v)}
            id="toggle-reconnect"
          />
        </section>

        {/* Alert Settings */}
        <section className="glass-panel p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Bell size={16} style={{ color: 'var(--accent-orange)' }} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Alert Preferences
            </h3>
          </div>

          <ToggleRow
            label="Sound Notifications"
            description="Chime when an enrolled watchlist profile is identified"
            checked={settings.soundAlerts}
            onChange={(v) => update('soundAlerts', v)}
            id="toggle-sound"
          />

          <ToggleRow
            label="Push Alerts"
            description="Broadcast desktop warnings for unauthorized entrance matching"
            checked={settings.desktopNotifications}
            onChange={(v) => update('desktopNotifications', v)}
            id="toggle-desktop"
          />
        </section>

        {/* Data Management */}
        <section className="glass-panel p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Database size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Data Retention & Logs
            </h3>
          </div>

          {/* Retention */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Biometric Logs Lifespan
            </label>
            <div className="flex flex-wrap gap-2">
              {retentionOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update('retentionDays', opt.value)}
                  className="px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300"
                  style={{
                    background: settings.retentionDays === opt.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255,255,255,0.03)',
                    color: settings.retentionDays === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${settings.retentionDays === opt.value ? 'rgba(255, 255, 255, 0.12)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] mt-3 leading-relaxed text-[var(--text-muted)]">
              Biometric coordinates and matching timestamps older than {settings.retentionDays} days are purged automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button className="btn-pill-secondary" id="export-data-btn">
              <Download size={14} /> Export Biometric DB
            </button>
            <button className="btn-pill-danger" id="purge-data-btn">
              <Trash2 size={14} /> Purge Watchlist Database
            </button>
          </div>
        </section>

        {/* Privacy Notice */}
        <section className="glass-panel p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Shield size={16} style={{ color: 'var(--accent-lime)' }} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              DPDP Act 2023 Compliance Panel
            </h3>
          </div>

          <div
            className="p-4 rounded-[20px] text-xs leading-relaxed"
            style={{
              background: 'rgba(210, 255, 60, 0.02)',
              border: '1px solid rgba(210, 255, 60, 0.12)',
              color: 'var(--text-secondary)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} style={{ color: 'var(--accent-lime)' }} />
              <strong className="text-[var(--text-primary)]">Compliance Profile Checklist</strong>
            </div>
            <ul className="space-y-2.5 ml-5 list-disc text-[var(--text-secondary)]">
              <li>Facial maps constitute <strong>biometric data</strong>. You must obtain and document explicit consent before profile enrollment.</li>
              <li>Enrolled individuals hold the <strong>Right to Erasure</strong>. Use the purge options above to clear profiles on request.</li>
              <li>Logs are encrypted locally with AES-256 and only accessed by security roles.</li>
            </ul>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          {saved && (
            <span className="text-xs font-semibold text-[var(--accent-lime)] text-glow-lime">
              ✓ Settings synchronized
            </span>
          )}
          <button className="btn-pill-secondary" id="settings-reset-btn">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn-pill-primary" onClick={handleSave} id="settings-save-btn">
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Row Component ──────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  id,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
}) {
  return (
    <div
      className="flex items-center justify-between py-4"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="pr-4">
        <p className="text-xs font-semibold text-[var(--text-primary)]">
          {label}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-normal">
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative shrink-0 rounded-full transition-colors duration-300"
        style={{
          width: 42,
          height: 22,
          background: checked ? 'var(--accent-lime)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        id={id}
      >
        <div
          className="absolute top-1 rounded-full bg-white transition-transform duration-300"
          style={{
            width: 12,
            height: 12,
            background: checked ? '#000000' : '#ffffff',
            transform: checked ? 'translateX(24px)' : 'translateX(4px)',
          }}
        />
      </button>
    </div>
  );
}
