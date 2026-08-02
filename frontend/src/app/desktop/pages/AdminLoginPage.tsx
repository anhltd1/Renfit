/**
 * Desktop admin/trainer login page (U5 Trainer Desktop, AUTH-1).
 * Same visual structure (centered card, grid background) as the pre-rebuild
 * AdminLoginPage — rewired to useAdminAuth() (U2) instead of calling
 * lib/api/admin::adminLogin + setAdminToken directly.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../shared/hooks/useAdminAuth';

export function AdminLoginPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      {/* subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#0F6B3E 1px, transparent 1px), linear-gradient(90deg, #0F6B3E 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5 bg-[#0F6B3E]/10 border border-[#0F6B3E]/30 rounded-full px-5 py-2">
            <ShieldCheck className="w-4 h-4 text-[#0F6B3E]" />
            <span className="text-[#0F6B3E] text-sm font-semibold tracking-wide">
              RENFIT ADMIN
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(15,107,62,0.12)]">
          <h1 className="text-2xl font-bold text-white mb-1">Coach Dashboard</h1>
          <p className="text-white/40 text-sm mb-8">
            Đăng nhập để quản lý hội viên và lịch tập.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                data-testid="input-username"
                className="w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  data-testid="input-password"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none transition-colors text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5" data-testid="admin-login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit-button"
              className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(15,107,62,0.4)] mt-2"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Trang quản trị — không dành cho hội viên
        </p>
      </div>
    </div>
  );
}
