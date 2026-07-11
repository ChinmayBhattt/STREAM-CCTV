'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    if (login(username, password)) {
      router.push('/cameras');
    } else {
      setError('Invalid credentials. Try admin / admin');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background Ambient Glows */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-1" style={{ opacity: 0.8 }} />
        <div className="ambient-glow-2" style={{ opacity: 0.6 }} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-sm z-10" style={{ animation: 'slide-up 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--accent-lime) 0%, var(--accent-cyan) 100%)',
              boxShadow: '0 0 20px rgba(210, 255, 60, 0.2)',
            }}
          >
            <Shield size={26} color="black" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            SentinelView
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Biometric CCTV System
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Authorized Personnel Only
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Sign in to access live feeds and logs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                Operator ID
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter operator username"
                  className="input-pill"
                  style={{ paddingLeft: 42 }}
                  required
                  id="login-username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                Access Token
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="input-pill"
                  style={{ paddingLeft: 42, paddingRight: 46 }}
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 text-xs p-3 rounded-2xl"
                style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--accent-rose)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary w-full justify-center py-3"
              style={{ opacity: loading ? 0.7 : 1 }}
              id="login-submit"
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'black', borderTopColor: 'transparent' }}
                  />
                  Verifying Token...
                </>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="pt-4 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Console Demo: <span className="text-[var(--text-secondary)]">admin</span> /{' '}
              <span className="text-[var(--text-secondary)]">admin</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          DPDP Act 2023 Compliant · Sentinel Systems
        </p>
      </div>
    </div>
  );
}
