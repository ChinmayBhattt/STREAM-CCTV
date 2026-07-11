'use client';

import { Camera } from '@/lib/types';
import { mockDetections } from '@/lib/mock-data';
import HlsPlayer from './hls-player';
import { Users, Maximize2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CameraTileProps {
  camera: Camera;
  onFullscreen: (camera: Camera) => void;
  onEdit: (camera: Camera) => void;
  onDelete: (id: string) => void;
}

export default function CameraTile({ camera, onFullscreen, onEdit, onDelete }: CameraTileProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const detections = mockDetections.filter((d) => d.cameraId === camera.id);
  const isLive = camera.status === 'online';

  return (
    <div
      className="glass-panel glass-panel-hover overflow-hidden group cursor-pointer relative"
      onClick={() => isLive && onFullscreen(camera)}
    >
      {/* Video Area */}
      <div className="relative" style={{ aspectRatio: '16/9', background: '#07070a' }}>
        {isLive ? (
          <HlsPlayer src={camera.streamUrl} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#07070a' }}>
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
                  <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                {camera.status === 'offline' ? 'Feed Offline' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}

        {/* Bounding Box Overlay */}
        {isLive && detections.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {detections.map((det) => (
              <div
                key={det.id}
                className="absolute"
                style={{
                  left: `${det.boundingBox.x * 100}%`,
                  top: `${det.boundingBox.y * 100}%`,
                  width: `${det.boundingBox.w * 100}%`,
                  height: `${det.boundingBox.h * 100}%`,
                  border: `2px solid ${det.type === 'face_match' ? 'var(--accent-lime)' : 'var(--accent-cyan)'}`,
                  borderRadius: 6,
                  boxShadow: det.type === 'face_match' ? '0 0 8px rgba(210, 255, 60, 0.4)' : '0 0 8px rgba(28, 240, 224, 0.4)',
                }}
              >
                {det.personName && (
                  <div
                    className="absolute -top-6 left-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap shadow-md"
                    style={{
                      background: 'var(--accent-lime)',
                      color: '#000000',
                    }}
                  >
                    {det.personName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Top overlay: Status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div
            className={`pill-badge pill-badge-${camera.status}`}
            style={{ backdropFilter: 'blur(12px)', background: 'rgba(0, 0, 0, 0.45)' }}
          >
            <span className={`status-dot status-${camera.status} mr-2`} />
            <span className="uppercase text-[9px] font-bold tracking-wider">{camera.status}</span>
          </div>
        </div>

        {/* Top overlay: Live person count */}
        {isLive && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--accent-cyan)',
            }}
          >
            <Users size={12} className="text-[var(--accent-cyan)]" />
            <span>{camera.personCount} detected</span>
          </div>
        )}

        {/* Hover overlay: fullscreen button */}
        {isLive && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-300 scale-90 group-hover:scale-100"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <Maximize2 size={16} color="white" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="px-4 py-3.5 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate text-[var(--text-primary)]">
            {camera.name}
          </h3>
          <p className="text-xs truncate text-[var(--text-muted)] mt-0.5">
            {camera.location}
          </p>
        </div>

        {/* Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-ghost p-1.5 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            id={`cam-menu-${camera.id}`}
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 bottom-full mb-1 z-20 py-1 min-w-[130px]"
                style={{
                  background: 'rgba(20, 20, 28, 0.95)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-elevated)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => { onEdit(camera); setMenuOpen(false); }}
                >
                  <Pencil size={13} /> Edit settings
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left"
                  style={{ color: 'var(--accent-rose)' }}
                  onClick={() => { onDelete(camera.id); setMenuOpen(false); }}
                >
                  <Trash2 size={13} /> Delete feed
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
