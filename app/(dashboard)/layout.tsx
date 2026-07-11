'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  Camera as CameraIcon,
  Users,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Shield,
  Search,
} from 'lucide-react';
import { mockAlerts } from '@/lib/mock-data';
import SearchModal from '@/components/search-modal';

const navItems = [
  { href: '/cameras', label: 'Cameras', icon: CameraIcon },
  { href: '/watchlist', label: 'Watchlist', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadAlerts = mockAlerts.filter((a) => !a.read).length;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Command palette hotkey (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Background Ambient Glows */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <div className="ambient-glow-3" />
      </div>

      {/* Main Container Wrapper - highly rounded outer frame like the screenshot */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden z-10">
        {/* Floating Top Navbar matching the screenshot */}
        <header className="flex items-center justify-between gap-4 mb-6 shrink-0">
          {/* Left Side: Search Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-12 h-12 flex items-center justify-center glass-pill hover:bg-white/10 transition-all text-white duration-300"
              title="Search System (Cmd+K)"
              id="topbar-search"
            >
              <Search size={18} />
            </button>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 glass-pill text-xs font-mono text-[var(--text-muted)] animate-pulse">
              <span className="status-dot status-online" />
              <span>Sentinel Live</span>
            </div>
          </div>


          {/* Center: Main Navigation Pill */}
          <nav className="flex items-center gap-1 p-1.5 glass-pill max-w-full overflow-x-auto no-scrollbar">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 relative whitespace-nowrap text-xs md:text-sm`}
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  id={`nav-${label.toLowerCase()}`}
                >
                  <Icon size={16} className={isActive ? 'text-[var(--accent-lime)]' : 'text-[var(--text-secondary)]'} />
                  <span className="hidden sm:inline">{label}</span>
                  {label === 'Alerts' && unreadAlerts > 0 && (
                    <span
                      className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: 'var(--accent-rose)', color: 'white' }}
                    >
                      {unreadAlerts}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Profile Pill & Logout */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2.5 p-1.5 pr-4 glass-pill"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                {user?.username?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-[var(--text-primary)]">
                {user?.username === 'admin' ? 'Hammad' : user?.username}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center glass-pill hover:bg-white/10 text-[var(--accent-rose)] transition-all duration-300"
              title="Sign out"
              id="btn-logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content Panel - matches the main card look in the screenshot */}
        <main className="flex-1 overflow-y-auto no-scrollbar rounded-[32px] p-6 glass-panel border border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,24,0.45)] backdrop-blur-3xl relative">
          <div className="page-enter h-full w-full">{children}</div>
        </main>
      </div>

      {/* Global Search Modal overlay */}
      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}
