import { Link } from './Link';
import { BrandMark } from '../shared/components/BrandMark';
import type { FooterContent, ContactContent, SocialContent, BrandContent } from '../../lib/api/siteContent';

interface FooterProps {
  content?: { footer: FooterContent; contact: ContactContent; social: SocialContent; brand: BrandContent };
}

const DEFAULT_FOOTER: FooterContent = {
  brand_description: 'Phòng tập riêng với huấn luyện viên cá nhân. Mỗi khung giờ tối đa 4 người.',
  copyright: '© 2026 Renfit. Tất cả quyền được bảo lưu.',
  nav_about_label: 'Về Renfit',
  nav_services_label: 'Dịch vụ',
  nav_trainers_label: 'Huấn luyện viên',
  nav_contact_label: 'Liên hệ',
};

const DEFAULT_CONTACT: ContactContent = {
  address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
  phone: '+84 123 456 789',
  email: 'contact@renfit.vn',
  hours: 'Thứ 2 – Thứ 7: 08:00 – 21:00\nChủ nhật: nghỉ',
};

const DEFAULT_SOCIAL: SocialContent = {
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  youtube_url: 'https://youtube.com',
};

/**
 * Landing footer (DESIGN.md v2): what Renfit is, how to reach it and when
 * it's open — set as plain type on the ground. No icon circles, no duplicated
 * service list; social links are words.
 */
export function Footer({ content }: FooterProps) {
  const footer = content?.footer ?? DEFAULT_FOOTER;
  const contact = content?.contact ?? DEFAULT_CONTACT;
  const social = content?.social ?? DEFAULT_SOCIAL;

  const socials = [
    ['Facebook', social.facebook_url],
    ['Instagram', social.instagram_url],
    ['YouTube', social.youtube_url],
  ].filter(([, href]) => href);
  const linkCls = 'text-white hover:text-primary-text transition-colors';

  return (
    <footer className="px-4 sm:px-6 lg:px-10 pt-20 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block rounded-control" aria-label="Renfit — trang chủ">
              <BrandMark />
            </Link>
            <p className="mt-4 text-white/64 text-sm leading-relaxed max-w-[36ch]">{footer.brand_description}</p>
          </div>

          <div className="lg:col-span-3 lg:col-start-6">
            <h3 className="text-white/64 text-sm font-medium mb-3">{footer.nav_contact_label}</h3>
            <address className="not-italic space-y-1.5 text-sm leading-relaxed">
              <p className="text-white">{contact.address}</p>
              <p>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className={linkCls}>{contact.phone}</a>
              </p>
              <p>
                <a href={`mailto:${contact.email}`} className={linkCls}>{contact.email}</a>
              </p>
            </address>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-white/64 text-sm font-medium mb-3">Giờ mở cửa</h3>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line tabular-nums">{contact.hours}</p>
          </div>

          <nav className="lg:col-span-2" aria-label="Liên kết cuối trang">
            <h3 className="text-white/64 text-sm font-medium mb-3">Renfit</h3>
            <ul className="space-y-1.5 text-sm leading-relaxed">
              <li><a href="#about" className={linkCls}>{footer.nav_about_label}</a></li>
              <li><a href="#services" className={linkCls}>{footer.nav_services_label}</a></li>
              <li><a href="#trainers" className={linkCls}>{footer.nav_trainers_label}</a></li>
              <li><Link to="/login" className={linkCls}>Đăng nhập</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <p className="text-white/64">{footer.copyright}</p>
          {socials.length > 0 && (
            <ul className="flex gap-6">
              {socials.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>{label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
