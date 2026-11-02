import { Link } from './Link';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import type { FooterContent, ContactContent, SocialContent, BrandContent } from '../../lib/api/siteContent';

interface FooterProps {
  content?: { footer: FooterContent; contact: ContactContent; social: SocialContent; brand: BrandContent };
}

const DEFAULT_FOOTER: FooterContent = {
  brand_description: 'Phòng gym riêng tư cao cấp, nơi bạn kiến tạo phiên bản tốt nhất của chính mình.',
  copyright: '© 2026 Renfit. Tất cả quyền được bảo lưu.',
  nav_about_label: 'Về Chúng Tôi',
  nav_services_label: 'Dịch Vụ',
  nav_trainers_label: 'Huấn Luyện Viên',
  nav_contact_label: 'Liên Hệ',
};

const DEFAULT_CONTACT: ContactContent = {
  address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
  phone: '+84 123 456 789',
  email: 'contact@renfit.vn',
  hours: 'Thứ 2 - Thứ 6: 6:00 - 22:00\nThứ 7 - Chủ Nhật: 7:00 - 21:00',
};

const DEFAULT_SOCIAL: SocialContent = {
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  youtube_url: 'https://youtube.com',
};

const DEFAULT_BRAND: BrandContent = {
  logo_url: '',
  name: 'Renfit',
  tagline: 'Nâng Tầm Thể Chất. Kiến Tạo Phiên Bản Tốt Nhất Của Bạn.',
};

export function Footer({ content }: FooterProps) {
  const footer = content?.footer ?? DEFAULT_FOOTER;
  const contact = content?.contact ?? DEFAULT_CONTACT;
  const social = content?.social ?? DEFAULT_SOCIAL;
  const _brand = content?.brand ?? DEFAULT_BRAND;

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div>
            <Link to="/">
              <ImageWithFallback
                src={logoImage}
                alt={`${_brand.name} Logo`}
                className="h-10 sm:h-12 w-auto mb-4"
              />
            </Link>
            <p className="text-white/60 leading-relaxed text-sm sm:text-base">
              {footer.brand_description}
            </p>
            <div className="flex gap-4 mt-4 sm:mt-6">
              {social.facebook_url && (
                <a
                  href={social.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0F6B3E] flex items-center justify-center transition-colors duration-[var(--motion-fast)] active:scale-[0.97]"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
              )}
              {social.instagram_url && (
                <a
                  href={social.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0F6B3E] flex items-center justify-center transition-colors duration-[var(--motion-fast)] active:scale-[0.97]"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
              {social.youtube_url && (
                <a
                  href={social.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Youtube"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0F6B3E] flex items-center justify-center transition-colors duration-[var(--motion-fast)] active:scale-[0.97]"
                >
                  <Youtube className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 leading-relaxed">Liên Kết Nhanh</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#about" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  {footer.nav_about_label}
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  {footer.nav_services_label}
                </a>
              </li>
              <li>
                <a href="#trainers" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  {footer.nav_trainers_label}
                </a>
              </li>
              <li>
                <Link to="/login" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  Đăng Nhập
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 leading-relaxed">{footer.nav_services_label}</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#services" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  Personal Training
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  AI Fitness Coach
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  Tư Vấn Dinh Dưỡng
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  Giảm Cân
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  Tăng Cơ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 leading-relaxed">{footer.nav_contact_label}</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0F6B3E] flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm sm:text-base leading-relaxed">
                  {contact.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#0F6B3E]" />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0F6B3E]" />
                <a href={`mailto:${contact.email}`} className="text-white/60 hover:text-[#0F6B3E] transition-colors text-sm sm:text-base leading-relaxed">
                  {contact.email}
                </a>
              </li>
            </ul>
            <div className="mt-4 sm:mt-6">
              <h4 className="text-white mb-2 text-sm sm:text-base leading-relaxed">Giờ Mở Cửa</h4>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {contact.hours}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
