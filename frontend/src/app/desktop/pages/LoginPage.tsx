/**
 * Desktop login page (U3 Trainee Desktop, TS-10).
 * Same visual structure as the pre-rebuild LoginPage (already DESIGN.md
 * conformant) — rewired to useAuth() (U2) instead of calling
 * lib/api/auth + setAuthUser directly.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { Link } from '../../components/Link';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import logoImage from '../../../imports/image.png';
import { useAuth } from '../../shared/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login({ phone_number: phone.trim(), password });
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4 py-12">

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <ImageWithFallback src={logoImage} alt="Renfit" className="h-14 w-auto mb-4" />
          </Link>
        </div>

        <div className="bg-surface rounded-panel border border-line p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-white text-center mb-8">Đăng nhập</h1>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div>
              <label className="block text-white/64 text-[13px] font-medium mb-1.5">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/64" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  autoComplete="tel"
                  data-testid="input-phone"
                  className="w-full bg-surface-2 border border-line-strong focus:border-primary-text focus:ring-2 focus:ring-primary-text/30 rounded-control pl-11 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/64 text-[13px] font-medium mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/64" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  data-testid="input-password"
                  className="w-full bg-surface-2 border border-line-strong focus:border-primary-text focus:ring-2 focus:ring-primary-text/30 rounded-control pl-11 pr-12 py-3.5 text-white placeholder:text-white/40 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/64 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-error-text text-sm bg-[#f87171]/[0.06] border border-error-text/30 rounded-control px-4 py-2.5" data-testid="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3.5 rounded-full transition-colors mt-2"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-white/64 text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link
              to={`/signup${redirect !== '/dashboard' ? `?redirect=${redirect}` : ''}`}
              className="text-primary-text hover:text-white font-medium transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <p className="text-center text-white/64 text-sm mt-6">
          <Link to="/" className="hover:text-white transition-colors">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
