'use client';

import { useState } from 'react';
import { Person } from '@/lib/types';
import { mockPeople, getAvatarColor, getInitials } from '@/lib/mock-data';
import {
  Search, MoreVertical, Pencil, Trash2, VolumeX, Volume2,
  UserPlus, X, Upload, Shield, Info,
} from 'lucide-react';

export default function WatchlistPage() {
  const [people, setPeople] = useState<Person[]>(mockPeople);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredPeople = people.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleDelete = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setMenuOpenId(null);
  };

  const toggleMute = (id: string) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, alertsMuted: !p.alertsMuted } : p))
    );
    setMenuOpenId(null);
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'staff', label: 'Staff' },
    { value: 'student', label: 'Student' },
    { value: 'member', label: 'Member' },
    { value: 'watchlist', label: 'Watchlist' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            People & Watchlist
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {people.length} enrolled individuals · Biometric database for identity matching
          </p>
        </div>
        <button
          className="btn-pill-primary"
          onClick={() => setModalOpen(true)}
          id="enroll-person-btn"
        >
          <UserPlus size={16} /> Enroll Person
        </button>
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
            placeholder="Search by name or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 42 }}
            id="watchlist-search"
          />
        </div>
        <div className="flex items-center gap-1.5 p-0.5 glass-pill overflow-x-auto max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className="px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 whitespace-nowrap"
              style={{
                background: filterCategory === cat.value ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: filterCategory === cat.value ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                color: filterCategory === cat.value ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredPeople.map((person) => (
          <div key={person.id} className="glass-panel p-5 relative flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-4">
                {/* Avatar matching profile avatar style */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-inner"
                  style={{ background: getAvatarColor(person.name), color: 'white' }}
                >
                  {getInitials(person.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold truncate text-[var(--text-primary)]">
                      {person.name}
                    </h3>
                    {person.alertsMuted && (
                      <VolumeX size={12} className="text-[var(--text-muted)] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate mb-2.5">
                    {person.role}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`pill-badge pill-badge-${person.category}`}>
                      {person.category}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                      {person.matchCount} matches
                    </span>
                  </div>
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    className="btn-ghost p-1.5"
                    onClick={() => setMenuOpenId(menuOpenId === person.id ? null : person.id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpenId === person.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                      <div
                        className="absolute right-0 top-full mt-1 z-20 py-1 min-w-[160px]"
                        style={{
                          background: 'rgba(20, 20, 28, 0.95)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-elevated)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
                          style={{ color: 'var(--text-secondary)' }}
                          onClick={() => setMenuOpenId(null)}
                        >
                          <Pencil size={14} /> Edit profile
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
                          style={{ color: 'var(--text-secondary)' }}
                          onClick={() => toggleMute(person.id)}
                        >
                          {person.alertsMuted ? <Volume2 size={14} /> : <VolumeX size={14} />}
                          {person.alertsMuted ? 'Unmute alerts' : 'Mute alerts'}
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
                          style={{ color: 'var(--accent-rose)' }}
                          onClick={() => handleDelete(person.id)}
                        >
                          <Trash2 size={14} /> Delete record
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {person.notes && (
                <p className="text-xs text-[var(--text-muted)] mt-4 pt-3 leading-relaxed" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {person.notes}
                </p>
              )}
            </div>

            {/* Bottom meta */}
            <div className="flex items-center justify-between mt-4 pt-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span>Threshold: {Math.round(person.matchThreshold * 100)}%</span>
              <span>Enrolled {new Date(person.enrolledAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredPeople.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 glass-panel">
          <Shield size={36} className="text-[var(--text-muted)] mb-4" />
          <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)]">
            No enrolled records match
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Adjust your search query or select another category filter
          </p>
        </div>
      )}

      {/* Enroll Modal */}
      {modalOpen && (
        <EnrollModal
          onClose={() => setModalOpen(false)}
          onSave={(person) => {
            setPeople((prev) => [...prev, person]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Enroll Person Modal ─────────────────────────────
function EnrollModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (person: Person) => void;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<Person['category']>('staff');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: string[] = [];
    Array.from(files).slice(0, 3).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPhotos.push(reader.result as string);
        if (newPhotos.length === Math.min(files.length, 3)) {
          setPhotos((prev) => [...prev, ...newPhotos].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: `person-${Date.now()}`,
      name,
      role,
      category,
      notes,
      photos: photos.length > 0 ? photos : ['/avatars/default.jpg'],
      enrolledAt: new Date().toISOString(),
      matchCount: 0,
      alertsMuted: false,
      matchThreshold: 0.75,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Enroll Reference Profile
          </h2>
          <button className="btn-ghost p-1.5" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Reference Photos (Max 3)
            </label>
            <div className="flex gap-3">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-xl overflow-hidden relative"
                  style={{ border: '1px solid var(--border-default)' }}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X size={8} color="white" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label
                  className="w-16 h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{
                    border: '2px dashed var(--border-default)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Upload size={16} />
                  <span className="text-[10px] font-semibold mt-1">Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Full Name
            </label>
            <input className="input-pill" placeholder="e.g., Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required id="enroll-name" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Role / Designation
            </label>
            <input className="input-pill" placeholder="e.g., CS Dept Student" value={role} onChange={(e) => setRole(e.target.value)} required id="enroll-role" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Access Category
            </label>
            <select
              className="input-pill"
              value={category}
              onChange={(e) => setCategory(e.target.value as Person['category'])}
              id="enroll-category"
              style={{ appearance: 'none', backgroundPosition: 'right 16px center' }}
            >
              <option value="staff">Staff Member</option>
              <option value="student">Student</option>
              <option value="member">Registered Member</option>
              <option value="watchlist">Security Watchlist</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Biometric Authorization Notes
            </label>
            <textarea
              className="input-pill"
              rows={2}
              placeholder="Designated hours, zone clearance profiles..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'none', borderRadius: 16 }}
              id="enroll-notes"
            />
          </div>

          <div
            className="flex items-start gap-2.5 p-3 rounded-2xl text-xs leading-relaxed"
            style={{
              background: 'rgba(210, 255, 60, 0.04)',
              border: '1px solid rgba(210, 255, 60, 0.12)',
              color: 'var(--text-secondary)',
            }}
          >
            <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-lime)' }} />
            <span>
              By enrolling this reference profile, you certify that <strong>informed consent</strong> has been secured in compliance with the DPDP Act 2023.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-pill-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-pill-primary" id="enroll-save-btn">
              <UserPlus size={15} /> Enroll Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
