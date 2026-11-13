import { Link } from './Link';
import { BrandMark } from '../shared/components/BrandMark';
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
          ? 'bg-[#0B0B0B] border-b border-line'
          : isScrolled
            ? 'bg-[#0B0B0B]/95 border-b border-line'
            : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 rounded-control" aria-label="Renfit — trang chủ">
            <BrandMark />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-7">
            <a
              href="#about"
              aria-current={activeId === 'about' ? 'true' : undefined}
              className={cn(
                'text-sm transition-colors duration-[var(--motion-fast)] leading-relaxed',
                activeId === 'about' ? 'text-white' : 'text-white/64 hover:text-white',
              )}
            >
              Về Renfit
            </a>
            <a
              href="#services"
              aria-current={activeId === 'services' ? 'true' : undefined}
              className={cn(
                'text-sm transition-colors duration-[var(--motion-fast)] leading-relaxed',
                activeId === 'services' ? 'text-white' : 'text-white/64 hover:text-white',
              )}
            >
              Dịch vụ
            </a>
            <a
              href="#trainers"
              aria-current={activeId === 'trainers' ? 'true' : undefined}
              className={cn(
                'text-sm transition-colors duration-[var(--motion-fast)] leading-relaxed',
                activeId === 'trainers' ? 'text-white' : 'text-white/64 hover:text-white',
              )}
            >
              Huấn luyện viên
            </a>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors active:scale-[0.97] flex items-center gap-2 leading-relaxed"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Trang của tôi
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.id}
                      className="w-9 h-9 rounded-full object-cover border border-white/20 group-hover:border-white/20 transition-colors" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-surface-2 border border-line group-hover:border-white/20 transition-colors flex items-center justify-center">
                      <User className="w-5 h-5 text-white/64" />
                    </div>
                  )}
                </Link>
                <button type="button" onClick={handleLogout} aria-label="Đăng xuất"
                  className="flex items-center justify-center w-10 h-10 rounded-control text-white/64 hover:text-error-text hover:bg-surface-2 transition-colors active:scale-[0.97]">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors active:scale-[0.97] leading-relaxed">
                  Đặt lịch ngay
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
                activeId === 'about' ? 'text-white' : 'text-white/64 hover:text-white',
              )}
              onClick={handleAnchorClick}
            >
              Về Renfit
            </a>
            <a
              href="#services"
              aria-current={activeId === 'services' ? 'true' : undefined}
              className={cn(
                'block transition-colors leading-relaxed',
                activeId === 'services' ? 'text-white' : 'text-white/64 hover:text-white',
              )}
              onClick={handleAnchorClick}
            >
              Dịch vụ
            </a>
            <a
              href="#trainers"
              aria-current={activeId === 'trainers' ? 'true' : undefined}
              className={cn(
                'block transition-colors leading-relaxed',
                activeId === 'trainers' ? 'text-white' : 'text-white/64 hover:text-white',
              )}
              onClick={handleAnchorClick}
            >
              Huấn luyện viên
            </a>
            {user ? (
              <>
                <Link to="/dashboard" onClick={handleAnchorClick}
                  className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full transition-all duration-[var(--motion-base)] text-center flex items-center justify-center gap-2 active:scale-[0.97] leading-relaxed">
                  <LayoutDashboard className="w-4 h-4" /> Trang của tôi
                </Link>
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" onClick={handleAnchorClick}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors leading-relaxed">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.id} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center">
                        <User className="w-4 h-4 text-white/64" />
                      </div>
                    )}
                    {user.id}
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-control border border-line-strong text-white/80 hover:text-error-text transition-colors active:scale-[0.97] leading-relaxed">
                    <LogOut className="w-5 h-5" /> Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={handleAnchorClick}
                  className="block w-full bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full transition-all duration-[var(--motion-base)] text-center active:scale-[0.97] leading-relaxed">
                  Đặt lịch ngay
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
