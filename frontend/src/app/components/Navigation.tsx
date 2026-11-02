import { Link } from './Link';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getAuthUser, clearAuthUser } from '../../lib/auth';
import { useScrollSpy } from './landing/useScrollSpy';
import { cn } from '../shared/primitives/cn';

const SECTION_IDS = ['about', 'services', 'trainers'];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = getAuthUser();
  const { activeId, isScrolled } = useScrollSpy(SECTION_IDS);

  const handleLogout = () => {
    clearAuthUser();
    navigate('/');
    setIsOpen(false);
  };

  const handleAnchorClick = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-[var(--motion-base)]',
        isOpen
          ? 'bg-[#0B0B0B] border-b border-white/10'
          : isScrolled
            ? 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[20px] border-b border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback
              src={logoImage}
              alt="Renfit Logo"
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#about"
              aria-current={activeId === 'about' ? 'true' : undefined}
              className={cn(
                'transition-colors duration-[var(--motion-fast)] leading-relaxed',
                activeId === 'about' ? 'text-[#0F6B3E]' : 'text-white/70 hover:text-[#0F6B3E]',
              )}
            >
              Về Chúng Tôi
            </a>
            <a
              href="#services"
              aria-current={activeId === 'services' ? 'true' : undefined}
              className={cn(
                'transition-colors duration-[var(--motion-fast)] leading-relaxed',
                activeId === 'services' ? 'text-[#0F6B3E]' : 'text-white/70 hover:text-[#0F6B3E]',
              )}
            >
              Dịch Vụ
            </a>
            <a
              href="#trainers"
              aria-current={activeId === 'trainers' ? 'true' : undefined}
              className={cn(
                'transition-colors duration-[var(--motion-fast)] leading-relaxed',
                activeId === 'trainers' ? 'text-[#0F6B3E]' : 'text-white/70 hover:text-[#0F6B3E]',
              )}
            >
              Huấn Luyện Viên
            </a>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-5 py-2 rounded-full transition-all duration-[var(--motion-base)] hover:scale-105 active:scale-[0.97] flex items-center gap-2 leading-relaxed"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Vào trang chủ
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.id}
                      className="w-[42px] h-[42px] rounded-full object-cover border border-white/20 group-hover:border-[#0F6B3E] transition-colors" />
                  ) : (
                    <div className="w-[42px] h-[42px] rounded-full bg-white/10 border border-white/20 group-hover:border-[#0F6B3E] transition-colors flex items-center justify-center">
                      <User className="w-5 h-5 text-white/50" />
                    </div>
                  )}
                </Link>
                <button type="button" onClick={handleLogout} aria-label="Đăng xuất"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all duration-[var(--motion-fast)] active:scale-[0.97]">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-[var(--motion-base)] hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)] active:scale-[0.97] leading-relaxed">
                  Đặt Lịch Ngay
                </Link>
                <Link to="/login"
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm leading-relaxed">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isOpen}
            className="md:hidden text-white active:scale-[0.97] transition-transform duration-[var(--motion-fast)]"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-up">
            <a
              href="#about"
              aria-current={activeId === 'about' ? 'true' : undefined}
              className={cn(
                'block transition-colors leading-relaxed',
                activeId === 'about' ? 'text-[#0F6B3E]' : 'text-white/70 hover:text-[#0F6B3E]',
              )}
              onClick={handleAnchorClick}
            >
              Về Chúng Tôi
            </a>
            <a
              href="#services"
              aria-current={activeId === 'services' ? 'true' : undefined}
              className={cn(
                'block transition-colors leading-relaxed',
                activeId === 'services' ? 'text-[#0F6B3E]' : 'text-white/70 hover:text-[#0F6B3E]',
              )}
              onClick={handleAnchorClick}
            >
              Dịch Vụ
            </a>
            <a
              href="#trainers"
              aria-current={activeId === 'trainers' ? 'true' : undefined}
              className={cn(
                'block transition-colors leading-relaxed',
                activeId === 'trainers' ? 'text-[#0F6B3E]' : 'text-white/70 hover:text-[#0F6B3E]',
              )}
              onClick={handleAnchorClick}
            >
              Huấn Luyện Viên
            </a>
            {user ? (
              <>
                <Link to="/dashboard" onClick={handleAnchorClick}
                  className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-[var(--motion-base)] text-center flex items-center justify-center gap-2 active:scale-[0.97] leading-relaxed">
                  <LayoutDashboard className="w-4 h-4" /> Vào trang chủ
                </Link>
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" onClick={handleAnchorClick}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors leading-relaxed">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.id} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-white/50" />
                      </div>
                    )}
                    {user.id}
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all duration-[var(--motion-fast)] active:scale-[0.97] leading-relaxed">
                    <LogOut className="w-5 h-5" /> Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={handleAnchorClick}
                  className="block w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-[var(--motion-base)] text-center active:scale-[0.97] leading-relaxed">
                  Đặt Lịch Ngay
                </Link>
                <Link to="/login" onClick={handleAnchorClick}
                  className="block text-white/70 hover:text-white transition-colors leading-relaxed">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
