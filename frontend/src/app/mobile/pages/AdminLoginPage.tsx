/**
 * Trainer mobile login page (U6 Trainer Mobile, RETIRE-1).
 * REPLACES the U5 temporary bridge (a centered desktop-style card) with a
 * full-bleed layout that feels native on a phone, using useAdminAuth() (U2)
 * — mirrors U4's LoginPage.tsx mobile treatment of the trainee login screen.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../shared/hooks/useAdminAuth';
import { SessionExpiredNotice } from '../../shared/components/SessionExpiredNotice';

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
        <div className="flex items-center gap-2.5 bg-[#0F6B3E]/10 border border-[#0F6B3E]/30 rounded-full px-5 py-2">
          <ShieldCheck className="w-4 h-4 text-primary-text" />
          <span className="text-primary-text text-sm font-semibold tracking-wide">RENFIT ADMIN</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">Coach Dashboard</h1>
      <p className="text-white/60 text-sm mb-8">Đăng nhập để quản lý hội viên và lịch tập.</p>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1" data-testid="admin-login-form">
        <div>
          <label className="text-white/60 text-sm mb-2 block">Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setExpiredDismissed(true); }}
            placeholder="admin"
            autoComplete="username"
            data-testid="input-username"
            className="w-full bg-white/5 border border-white/10 focus:border-primary-text rounded-2xl px-4 py-3 text-white placeholder:text-white/40 outline-none transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-2 block">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setExpiredDismissed(true); }}
              placeholder="••••••"
              autoComplete="current-password"
              data-testid="input-password"
              className="w-full bg-white/5 border border-white/10 focus:border-primary-text rounded-2xl px-4 py-3 text-white placeholder:text-white/40 outline-none transition-colors text-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 tap-target inline-flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showExpired && <SessionExpiredNotice />}

        {error && (
          <p className="text-error-text text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5" data-testid="admin-login-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="admin-login-submit-button"
          className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

    </div>
  );
}
