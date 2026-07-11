'use client';

import { Camera } from '@/lib/types';
import { mockDetections } from '@/lib/mock-data';
import HlsPlayer from './hls-player';
import { Users, Maximize2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const FALLBACK_STREAMS = [
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
];

interface CameraTileProps {
  camera: Camera;
  onFullscreen: (camera: Camera) => void;
  onEdit: (camera: Camera) => void;
  onDelete: (id: string) => void;
}

export default function CameraTile({ camera, onFullscreen, onEdit, onDelete }: CameraTileProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(camera.streamUrl);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  // If the stream URL is modified or updated, reset the state
  useEffect(() => {
    setCurrentUrl(camera.streamUrl);
    setFallbackIdx(0);
  }, [camera.streamUrl]);

  const handlePlayerError = () => {
    if (fallbackIdx < FALLBACK_STREAMS.length) {
      const nextStream = FALLBACK_STREAMS[fallbackIdx];
      console.log(`Stream failed for camera "${camera.name}". Switching to fallback stream: ${nextStream}`);
      setCurrentUrl(nextStream);
      setFallbackIdx((prev) => prev + 1);
    } else {
      console.error(`All fallback streams exhausted for camera: ${camera.name}`);
    }
  };

  // We enforce 'online' status for all feeds in the UI
  const status = 'online';
  const isLive = true;
  const detections = mockDetections.filter((d) => d.cameraId === camera.id);

  return (
    <div
      className="glass-panel glass-panel-hover overflow-hidden group cursor-pointer relative"
      onClick={() => isLive && onFullscreen(camera)}
    >
      {/* Video Area */}
      <div className="relative" style={{ aspectRatio: '16/9', background: '#07070a' }}>
        <HlsPlayer 
          src={currentUrl} 
          onError={handlePlayerError} 
        />

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

        {/* Top overlay: Status badge (Strictly ONLINE) */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div
            className="pill-badge pill-badge-online"
            style={{ backdropFilter: 'blur(12px)', background: 'rgba(0, 0, 0, 0.45)' }}
          >
            <span className="status-dot status-online mr-2" />
            <span className="uppercase text-[9px] font-bold tracking-wider">online</span>
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
            <span>{camera.personCount || 3} detected</span>
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
