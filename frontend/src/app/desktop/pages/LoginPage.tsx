/**
 * Desktop login page (U3 Trainee Desktop, TS-10).
 * Same visual structure as the pre-rebuild LoginPage (already DESIGN.md
 * conformant) — rewired to useAuth() (U2) instead of calling
 * lib/api/auth + setAuthUser directly.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Bot, Eye, EyeOff, Lock, Phone } from 'lucide-react';
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0F6B3E]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <ImageWithFallback src={logoImage} alt="Renfit" className="h-14 w-auto mb-4" />
          </Link>
          <div className="flex items-center gap-2 bg-[#0F6B3E]/20 px-4 py-2 rounded-full border border-[#0F6B3E]/30">
            <Bot className="w-4 h-4 text-[#0F6B3E]" />
            <span className="text-[#0F6B3E] text-sm font-medium">AI Fitness Coach</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(15,107,62,0.15)]">
          <h1 className="text-2xl font-bold text-white mb-1">Đăng nhập</h1>
          <p className="text-white/50 text-sm mb-8">Đăng nhập để trò chuyện với AI Coach</p>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div>
              <label className="block text-white/70 text-sm mb-2">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  autoComplete="tel"
                  data-testid="input-phone"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  data-testid="input-password"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-2xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/30 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5" data-testid="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(15,107,62,0.4)] mt-2"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link
              to={`/signup${redirect !== '/dashboard' ? `?redirect=${redirect}` : ''}`}
              className="text-[#0F6B3E] hover:text-[#0F6B3E]/80 font-medium transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          <Link to="/" className="hover:text-white/40 transition-colors">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
