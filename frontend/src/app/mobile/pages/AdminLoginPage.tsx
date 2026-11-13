/**
 * Trainer mobile login page (U6 Trainer Mobile, RETIRE-1).
 * REPLACES the U5 temporary bridge (a centered desktop-style card) with a
 * full-bleed layout that feels native on a phone, using useAdminAuth() (U2)
 * — mirrors U4's LoginPage.tsx mobile treatment of the trainee login screen.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../shared/hooks/useAdminAuth';
import { SessionExpiredNotice } from '../../shared/components/SessionExpiredNotice';
import { BrandMark } from '../../shared/components/BrandMark';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expiredDismissed, setExpiredDismissed] = useState(false);
  const showExpired = searchParams.get('expired') === '1' && !expiredDismissed;
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) return setError('Vui lòng nhập đầy đủ thông tin.');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] w-full bg-[#0B0B0B] flex flex-col px-5 py-8"
      style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-center mb-8 mt-6">
        <BrandMark scope="Huấn luyện viên" />
      </div>

      <h1 className="text-2xl font-semibold text-white text-center mb-8">Đăng nhập</h1>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1" data-testid="admin-login-form">
        <div>
          <label className="text-white/64 text-sm mb-2 block">Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setExpiredDismissed(true); }}
            placeholder="admin"
            autoComplete="username"
            data-testid="input-username"
            className="w-full bg-surface-2 border border-line-strong focus:border-primary-text focus:ring-2 focus:ring-primary-text/30 rounded-control px-4 py-3 text-white placeholder:text-white/40 outline-none transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-white/64 text-sm mb-2 block">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setExpiredDismissed(true); }}
              placeholder="••••••"
              autoComplete="current-password"
              data-testid="input-password"
              className="w-full bg-surface-2 border border-line-strong focus:border-primary-text focus:ring-2 focus:ring-primary-text/30 rounded-control px-4 py-3 text-white placeholder:text-white/40 outline-none transition-colors text-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 tap-target inline-flex items-center justify-center text-white/64 hover:text-white transition-colors"
              aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showExpired && <SessionExpiredNotice />}

        {error && (
          <p className="text-error-text text-sm bg-[#f87171]/[0.06] border border-error-text/30 rounded-control px-4 py-2.5" data-testid="admin-login-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="admin-login-submit-button"
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3.5 rounded-full transition-colors"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

    </div>
  );
}
