'use client';

import { Camera } from '@/lib/types';
import { mockDetections } from '@/lib/mock-data';
import HlsPlayer from './hls-player';
import { X, Users, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';

const FALLBACK_STREAMS = [
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
];

interface FullscreenViewProps {
  camera: Camera;
  onClose: () => void;
}

export default function FullscreenView({ camera, onClose }: FullscreenViewProps) {
  const [muted, setMuted] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(camera.streamUrl);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  useEffect(() => {
    setCurrentUrl(camera.streamUrl);
    setFallbackIdx(0);
  }, [camera.streamUrl]);

  const handlePlayerError = () => {
    if (fallbackIdx < FALLBACK_STREAMS.length) {
      const nextStream = FALLBACK_STREAMS[fallbackIdx];
      console.log(`Fullscreen stream failed for camera "${camera.name}". Switching to fallback: ${nextStream}`);
      setCurrentUrl(nextStream);
      setFallbackIdx((prev) => prev + 1);
    } else {
      console.warn(`All fallback streams exhausted in fullscreen for camera: ${camera.name}`);
    }
  };

  const detections = mockDetections.filter((d) => d.cameraId === camera.id);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#040406' }}>
      {/* Top Bar */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(8,8,10,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-white tracking-tight">{camera.name}</h2>
          <span className="text-xs text-[var(--text-muted)] hidden md:inline">
            {camera.location}
          </span>
          <div className="pill-badge pill-badge-online">
            <span className="status-dot status-online mr-2" />
            <span className="text-[9px] font-bold tracking-wider uppercase">online</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Person count */}
          <div
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--accent-cyan)',
            }}
          >
            <Users size={13} className="text-[var(--accent-cyan)]" />
            <span>{camera.personCount || 3} detected</span>
          </div>

          {/* Mute toggle */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Close */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
            onClick={onClose}
            id="fullscreen-close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 relative">
        <HlsPlayer 
          src={currentUrl} 
          muted={muted} 
          onError={handlePlayerError}
        />

        {/* Bounding Boxes */}
        <div className="absolute inset-0 pointer-events-none">
          {detections.map((det) => (
            <div
              key={det.id}
              className="absolute transition-all duration-300"
              style={{
                left: `${det.boundingBox.x * 100}%`,
                top: `${det.boundingBox.y * 100}%`,
                width: `${det.boundingBox.w * 100}%`,
                height: `${det.boundingBox.h * 100}%`,
                border: `2px solid ${det.type === 'face_match' ? 'var(--accent-lime)' : 'var(--accent-cyan)'}`,
                borderRadius: 6,
                boxShadow: det.type === 'face_match'
                  ? '0 0 12px rgba(210, 255, 60, 0.4)'
                  : '0 0 8px rgba(28, 240, 224, 0.3)',
              }}
            >
              {det.personName && (
                <div
                  className="absolute -top-7 left-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg"
                  style={{
                    background: 'var(--accent-lime)',
                    color: '#000000',
                  }}
                >
                  {det.personName} ({Math.round(det.confidence * 100)}%)
                </div>
              )}
              {!det.personName && (
                <div
                  className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    background: 'var(--accent-cyan)',
                    color: '#000000',
                  }}
                >
                  Unknown Person
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timestamp overlay */}
        <div
          className="absolute bottom-4 left-4 text-[10px] font-mono font-bold tracking-wider px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text-secondary)',
          }}
        >
          {new Date().toLocaleString()} · SYSTEM ONLINE
        </div>

        {/* Detection legend */}
        <div
          className="absolute bottom-4 right-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text-secondary)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent-lime)' }} />
            <span>Enrolled Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
            <span>Unknown Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
