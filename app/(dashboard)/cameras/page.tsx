'use client';

import { useState } from 'react';
import { Camera } from '@/lib/types';
import { mockCameras } from '@/lib/mock-data';
import CameraTile from '@/components/camera-tile';
import CameraModal from '@/components/camera-modal';
import FullscreenView from '@/components/fullscreen-view';
import { Plus, Grid3X3, LayoutGrid } from 'lucide-react';

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCamera, setEditCamera] = useState<Camera | null>(null);
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);
  const [gridCols, setGridCols] = useState<2 | 3>(3);

  const handleSave = (data: Partial<Camera>) => {
    if (editCamera) {
      setCameras((prev) =>
        prev.map((c) => (c.id === editCamera.id ? { ...c, ...data } : c))
      );
    } else {
      const newCam: Camera = {
        id: `cam-${Date.now()}`,
        name: data.name ?? 'New Camera',
        location: data.location ?? '',
        streamUrl: data.streamUrl ?? '',
        status: 'online',
        personCount: 0,
        order: cameras.length,
      };
      setCameras((prev) => [...prev, newCam]);
    }
    setEditCamera(null);
  };

  const handleDelete = (id: string) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
  };

  const onlineCams = cameras.filter((c) => c.status === 'online').length;
  const offlineCams = cameras.filter((c) => c.status === 'offline').length;
  const totalPeople = cameras.reduce((s, c) => s + c.personCount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Camera Feeds
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--accent-cyan)]">{onlineCams}</span> online
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--accent-rose)]">{offlineCams}</span> offline
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--accent-lime)]">{totalPeople}</span> people detected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid toggle */}
          <div className="flex items-center p-0.5 glass-pill">
            <button
              className="p-2 rounded-full transition-all duration-300"
              style={{
                background: gridCols === 2 ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: gridCols === 2 ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              onClick={() => setGridCols(2)}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className="p-2 rounded-full transition-all duration-300"
              style={{
                background: gridCols === 3 ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: gridCols === 3 ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              onClick={() => setGridCols(3)}
            >
              <Grid3X3 size={15} />
            </button>
          </div>

          <button
            className="btn-pill-primary"
            onClick={() => { setEditCamera(null); setModalOpen(true); }}
            id="add-camera-btn"
          >
            <Plus size={16} /> Add Camera
          </button>
        </div>
      </div>

      {/* Camera Grid */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridCols === 2 ? '420px' : '300px'}, 1fr))`,
        }}
      >
        {cameras.map((cam) => (
          <CameraTile
            key={cam.id}
            camera={cam}
            onFullscreen={setFullscreenCamera}
            onEdit={(c) => { setEditCamera(c); setModalOpen(true); }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Empty state */}
      {cameras.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 glass-panel">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Plus size={24} style={{ color: 'var(--accent-lime)' }} />
          </div>
          <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)]">
            No cameras connected
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            Connect an RTSP, RTMP or HLS video stream to begin monitoring
          </p>
          <button className="btn-pill-primary" onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Add Camera
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CameraModal
          camera={editCamera}
          onClose={() => { setModalOpen(false); setEditCamera(null); }}
          onSave={handleSave}
        />
      )}

      {/* Fullscreen */}
      {fullscreenCamera && (
        <FullscreenView
          camera={fullscreenCamera}
          onClose={() => setFullscreenCamera(null)}
        />
      )}
    </div>
  );
}
