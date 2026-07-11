'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Person } from '@/lib/types';
import { useDashboard } from '@/lib/dashboard-context';
import { Search, X, Video, User, ShieldAlert, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  onClose: () => void;
  onFullscreenCamera?: (camera: Camera) => void;
}

export default function SearchModal({ onClose, onFullscreenCamera }: SearchModalProps) {
  const { cameras, people } = useDashboard();
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Close on ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter active data
  const filteredCameras = query.trim() === '' ? [] : cameras.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.location.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPeople = query.trim() === '' ? [] : people.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.role.toLowerCase().includes(query.toLowerCase())
  );

  const handleCameraClick = (camera: Camera) => {
    router.push('/cameras');
    // Give a short delay to navigate before action if needed
    if (onFullscreenCamera) {
      setTimeout(() => {
        onFullscreenCamera(camera);
      }, 100);
    }
    onClose();
  };

  const handlePersonClick = () => {
    router.push('/watchlist');
    onClose();
  };

  const hasResults = filteredCameras.length > 0 || filteredPeople.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Search Container */}
      <div 
        className="modal-content max-w-xl p-2 bg-rgba(20,20,28,0.9) backdrop-blur-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        {/* Search Bar Input */}
        <div className="relative flex items-center p-2">
          <Search size={18} className="absolute left-5 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            className="input-pill w-full bg-white/5 border border-white/10 text-sm py-3"
            style={{ paddingLeft: 46, paddingRight: 46 }}
            placeholder="Search cameras, locations, or enrolled individuals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="global-search-input"
          />
          <button 
            onClick={onClose}
            className="absolute right-5 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-all"
            id="close-search-modal"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results Container */}
        {query.trim() !== '' && (
          <div className="p-4 max-h-[350px] overflow-y-auto space-y-5 border-t border-white/5 mt-2">
            {/* Cameras Section */}
            {filteredCameras.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 px-2">
                  <Video size={12} /> Cameras / Feeds
                </h4>
                <div className="space-y-1">
                  {filteredCameras.map((camera) => (
                    <button
                      key={camera.id}
                      onClick={() => handleCameraClick(camera)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`status-dot status-${camera.status}`} />
                          <span className="text-xs font-semibold text-[var(--text-primary)]">{camera.name}</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] pl-3.5">{camera.location}</span>
                      </div>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent-lime)]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enrolled People Section */}
            {filteredPeople.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 px-2">
                  <User size={12} /> Enrolled Watchlist
                </h4>
                <div className="space-y-1">
                  {filteredPeople.map((person) => (
                    <button
                      key={person.id}
                      onClick={handlePersonClick}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`pill-badge pill-badge-${person.category} scale-90 origin-left`}>
                            {person.category === 'staff' ? 'Employee' : person.category === 'student' ? 'Visitor' : person.category === 'member' ? 'Guest' : person.category}
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-primary)]">{person.name}</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] pl-2">{person.role}</span>
                      </div>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent-lime)]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!hasResults && (
              <div className="text-center py-6">
                <ShieldAlert size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
                <p className="text-xs text-[var(--text-muted)]">No matches found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        )}

        {/* Hotkey Hint */}
        <div className="p-3 text-[10px] font-semibold tracking-wide text-center text-[var(--text-muted)] border-t border-white/5">
          TIP: PRESS <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">ESC</kbd> TO CLOSE THE SEARCH PALETTE
        </div>
      </div>
    </div>
  );
}
