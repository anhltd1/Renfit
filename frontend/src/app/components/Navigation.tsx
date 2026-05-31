import { Link } from './Link';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback
              src={logoImage}
              alt="Renfit Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-white/80 hover:text-[#0F6B3E] transition-colors">
              Về Chúng Tôi
            </a>
            <a href="#services" className="text-white/80 hover:text-[#0F6B3E] transition-colors">
              Dịch Vụ
            </a>
            <a href="#trainers" className="text-white/80 hover:text-[#0F6B3E] transition-colors">
              Huấn Luyện Viên
            </a>
            <a href="#pricing" className="text-white/80 hover:text-[#0F6B3E] transition-colors">
              Bảng Giá
            </a>
            <Link
              to="/booking"
              className="bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
            >
              Đặt Lịch Ngay
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a
              href="#about"
              className="block text-white/80 hover:text-[#0F6B3E] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Về Chúng Tôi
            </a>
            <a
              href="#services"
              className="block text-white/80 hover:text-[#0F6B3E] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dịch Vụ
            </a>
            <a
              href="#trainers"
              className="block text-white/80 hover:text-[#0F6B3E] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Huấn Luyện Viên
            </a>
            <a
              href="#pricing"
              className="block text-white/80 hover:text-[#0F6B3E] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Bảng Giá
            </a>
            <Link
              to="/booking"
              className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 text-center"
              onClick={() => setIsOpen(false)}
            >
              Đặt Lịch Ngay
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
