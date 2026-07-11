'use client';

import { useState } from 'react';
import { Camera } from '@/lib/types';
import { X, Plus, Save } from 'lucide-react';

interface CameraModalProps {
  camera?: Camera | null;
  onClose: () => void;
  onSave: (data: Partial<Camera>) => void;
}

export default function CameraModal({ camera, onClose, onSave }: CameraModalProps) {
  const isEditing = !!camera;
  const [name, setName] = useState(camera?.name ?? '');
  const [location, setLocation] = useState(camera?.location ?? '');
  const [streamUrl, setStreamUrl] = useState(camera?.streamUrl ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(camera ?? {}),
      name,
      location,
      streamUrl,
      status: 'online',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            {isEditing ? 'Configure Stream' : 'Connect Camera Stream'}
          </h2>
          <button className="btn-ghost p-1.5" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Friendly Name
            </label>
            <input
              className="input-pill"
              placeholder="e.g., Main Gate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              id="camera-name-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Location / Placement
            </label>
            <input
              className="input-pill"
              placeholder="e.g., Building A - Entrance"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              id="camera-location-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Stream Ingestion URL
            </label>
            <input
              className="input-pill"
              placeholder="rtsp://... or http://...m3u8"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              required
              id="camera-stream-input"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
              Accepts RTSP, RTMP or HTTP-MJPEG stream endpoints. The system will automatically re-mux it for HLS browsers.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-pill-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-pill-primary" id="camera-save-btn">
              {isEditing ? <><Save size={15} /> Save Changes</> : <><Plus size={15} /> Connect Stream</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
