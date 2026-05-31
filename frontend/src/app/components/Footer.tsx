import { Link } from './Link';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/">
              <ImageWithFallback
                src={logoImage}
                alt="Renfit Logo"
                className="h-12 w-auto mb-4"
              />
            </Link>
            <p className="text-white/60 leading-relaxed">
              Phòng gym riêng tư cao cấp, nơi bạn kiến tạo phiên bản tốt nhất của chính mình.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0F6B3E] flex items-center justify-center transition-colors duration-300"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0F6B3E] flex items-center justify-center transition-colors duration-300"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0F6B3E] flex items-center justify-center transition-colors duration-300"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Về Chúng Tôi
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Dịch Vụ
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Huấn Luyện Viên
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Gói Thành Viên
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-4">Dịch Vụ</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Personal Training
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  AI Fitness Coach
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Tư Vấn Dinh Dưỡng
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Giảm Cân
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  Tăng Cơ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Liên Hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0F6B3E] flex-shrink-0 mt-1" />
                <span className="text-white/60">
                  123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#0F6B3E]" />
                <a href="tel:+84123456789" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0F6B3E]" />
                <a href="mailto:contact@renfit.vn" className="text-white/60 hover:text-[#0F6B3E] transition-colors">
                  contact@renfit.vn
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-white mb-2">Giờ Mở Cửa</h5>
              <p className="text-white/60 text-sm">
                Thứ 2 - Thứ 6: 6:00 - 22:00<br />
                Thứ 7 - Chủ Nhật: 7:00 - 21:00
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © 2026 Renfit. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/60 hover:text-[#0F6B3E] text-sm transition-colors">
              Chính Sách Bảo Mật
            </a>
            <a href="#" className="text-white/60 hover:text-[#0F6B3E] text-sm transition-colors">
              Điều Khoản Sử Dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
