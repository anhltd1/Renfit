import React from 'react';
import {
  Star, Sparkles, Info, Dumbbell, Bot, Users,
  Zap, MapPin, Globe, FileText, MessageSquareQuote,
} from 'lucide-react';
import { cn } from '../primitives/cn';
import { useCmsEditor } from '../hooks/useCmsEditor';
import { CmsActionBar } from './CmsActionBar';
import { ContentGroupSection } from './ContentGroupSection';
import { ImageInput } from './ImageInput';
import { IconPicker } from './IconPicker';
import { ListFieldEditor } from './ListFieldEditor';
import type {
  SiteContentTree,
  HeroStat,
  AboutFeature,
  ServiceItem,
  AiChatMessage,
  TrainerItem,
  TestimonialItem,
} from '../../../lib/api/siteContent';

const inputClass = cn(
  'w-full rounded-2xl bg-white/5 border border-white/10 text-white',
  'placeholder:text-white/30 py-3 px-4 leading-relaxed outline-none',
  'transition-colors duration-300 focus:border-[#0F6B3E]',
);

const textareaClass = cn(inputClass, 'min-h-[100px] resize-y');

function TextInput({
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-white/60 text-sm leading-relaxed">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(inputClass, 'disabled:opacity-60 disabled:cursor-not-allowed')}
      />
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  label,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-white/60 text-sm leading-relaxed">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(textareaClass, 'disabled:opacity-60 disabled:cursor-not-allowed')}
      />
    </div>
  );
}

export function CmsEditor() {
  const {
    content,
    loading,
    error,
    isDirty,
    saving,
    publishing,
    updateGroup,
    saveDraft,
    publish,
    saveAndPreview,
  } = useCmsEditor();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#0F6B3E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-red-400 text-sm leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      <CmsActionBar
        onSave={saveDraft}
        onPreview={saveAndPreview}
        onPublish={publish}
        isDirty={isDirty}
        saving={saving}
        publishing={publishing}
      />

      {error && (
        <p className="text-red-400 text-sm leading-relaxed bg-red-400/10 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      {/* Brand */}
      <ContentGroupSection title="Thương hiệu" icon={<Star className="w-5 h-5" />}>
        <TextInput
          label="Tên thương hiệu"
          value={content.brand.name}
          onChange={(val) => updateGroup('brand', { ...content.brand, name: val })}
          placeholder="Renfit"
        />
        <TextInput
          label="Tagline"
          value={content.brand.tagline}
          onChange={(val) => updateGroup('brand', { ...content.brand, tagline: val })}
          placeholder="Slogan ngắn"
        />
        <ImageInput
          label="Logo"
          value={content.brand.logo_url}
          onChange={(val) => updateGroup('brand', { ...content.brand, logo_url: val })}
        />
      </ContentGroupSection>

      {/* Hero */}
      <ContentGroupSection title="Hero" icon={<Sparkles className="w-5 h-5" />}>
        <TextInput
          label="Tiêu đề dòng 1"
          value={content.hero.headline_line1}
          onChange={(val) => updateGroup('hero', { ...content.hero, headline_line1: val })}
        />
        <TextInput
          label="Tiêu đề dòng 2"
          value={content.hero.headline_line2}
          onChange={(val) => updateGroup('hero', { ...content.hero, headline_line2: val })}
        />
        <TextInput
          label="Tiêu đề dòng 3"
          value={content.hero.headline_line3}
          onChange={(val) => updateGroup('hero', { ...content.hero, headline_line3: val })}
        />
        <TextArea
          label="Mô tả"
          value={content.hero.description}
          onChange={(val) => updateGroup('hero', { ...content.hero, description: val })}
        />
        <ImageInput
          label="Ảnh nền"
          value={content.hero.background_image}
          onChange={(val) => updateGroup('hero', { ...content.hero, background_image: val })}
        />
        <ListFieldEditor<HeroStat>
          label="Thống kê"
          addLabel="Thêm thống kê"
          items={content.hero.stats}
          onChange={(stats) => updateGroup('hero', { ...content.hero, stats })}
          createItem={() => ({ icon: '', value: '', label: '' })}
          renderItem={(item, _idx, onItemChange) => (
            <div className="space-y-3">
              <IconPicker
                label="Icon"
                value={item.icon}
                onChange={(val) => onItemChange({ ...item, icon: val })}
              />
              <TextInput
                label="Giá trị"
                value={item.value}
                onChange={(val) => onItemChange({ ...item, value: val })}
                placeholder="100+"
              />
              <TextInput
                label="Nhãn"
                value={item.label}
                onChange={(val) => onItemChange({ ...item, label: val })}
                placeholder="Hội viên"
              />
            </div>
          )}
        />
      </ContentGroupSection>

      {/* About */}
      <ContentGroupSection title="Giới thiệu" icon={<Info className="w-5 h-5" />}>
        <TextInput
          label="Tiêu đề"
          value={content.about.title}
          onChange={(val) => updateGroup('about', { ...content.about, title: val })}
        />
        <TextInput
          label="Phụ đề"
          value={content.about.subtitle}
          onChange={(val) => updateGroup('about', { ...content.about, subtitle: val })}
        />
        <ImageInput
          label="Ảnh chính"
          value={content.about.main_image}
          onChange={(val) => updateGroup('about', { ...content.about, main_image: val })}
        />
        <TextInput
          label="Tiêu đề ảnh chính"
          value={content.about.main_image_title}
          onChange={(val) => updateGroup('about', { ...content.about, main_image_title: val })}
        />
        <TextArea
          label="Mô tả ảnh chính"
          value={content.about.main_image_description}
          onChange={(val) => updateGroup('about', { ...content.about, main_image_description: val })}
        />
        <ListFieldEditor<AboutFeature>
          label="Tính năng"
          addLabel="Thêm tính năng"
          items={content.about.features}
          onChange={(features) => updateGroup('about', { ...content.about, features })}
          createItem={() => ({ icon: '', title: '', description: '' })}
          renderItem={(item, _idx, onItemChange) => (
            <div className="space-y-3">
              <IconPicker
                label="Icon"
                value={item.icon}
                onChange={(val) => onItemChange({ ...item, icon: val })}
              />
              <TextInput
                label="Tiêu đề"
                value={item.title}
                onChange={(val) => onItemChange({ ...item, title: val })}
              />
              <TextArea
                label="Mô tả"
                value={item.description}
                onChange={(val) => onItemChange({ ...item, description: val })}
              />
            </div>
          )}
        />
      </ContentGroupSection>

      {/* Services */}
      <ContentGroupSection title="Dịch vụ" icon={<Dumbbell className="w-5 h-5" />}>
        <TextInput
          label="Tiêu đề"
          value={content.services.title}
          onChange={(val) => updateGroup('services', { ...content.services, title: val })}
        />
        <TextInput
          label="Phụ đề"
          value={content.services.subtitle}
          onChange={(val) => updateGroup('services', { ...content.services, subtitle: val })}
        />
        <ListFieldEditor<ServiceItem>
          label="Danh sách dịch vụ"
          addLabel="Thêm dịch vụ"
          items={content.services.items}
          onChange={(items) => updateGroup('services', { ...content.services, items })}
          createItem={() => ({ icon: '', title: '', description: '' })}
          renderItem={(item, _idx, onItemChange) => (
            <div className="space-y-3">
              <IconPicker
                label="Icon"
                value={item.icon}
                onChange={(val) => onItemChange({ ...item, icon: val })}
              />
              <TextInput
                label="Tiêu đề"
                value={item.title}
                onChange={(val) => onItemChange({ ...item, title: val })}
              />
              <TextArea
                label="Mô tả"
                value={item.description}
                onChange={(val) => onItemChange({ ...item, description: val })}
              />
            </div>
          )}
        />
      </ContentGroupSection>

      {/* AI Coach */}
      <ContentGroupSection title="AI Coach" icon={<Bot className="w-5 h-5" />}>
        <TextInput
          label="Badge text"
          value={content.ai_coach.badge_text}
          onChange={(val) => updateGroup('ai_coach', { ...content.ai_coach, badge_text: val })}
        />
        <TextInput
          label="Tiêu đề"
          value={content.ai_coach.title}
          onChange={(val) => updateGroup('ai_coach', { ...content.ai_coach, title: val })}
        />
        <TextInput
          label="Phụ đề"
          value={content.ai_coach.subtitle}
          onChange={(val) => updateGroup('ai_coach', { ...content.ai_coach, subtitle: val })}
        />
        <ListFieldEditor<AiChatMessage>
          label="Tin nhắn mẫu"
          addLabel="Thêm tin nhắn"
          items={content.ai_coach.messages}
          onChange={(messages) => updateGroup('ai_coach', { ...content.ai_coach, messages })}
          createItem={() => ({ type: 'user', message: '' })}
          renderItem={(item, _idx, onItemChange) => (
            <div className="space-y-3">
              <div className="w-full space-y-1">
                <label className="block text-white/60 text-sm leading-relaxed">Loại</label>
                <select
                  value={item.type}
                  onChange={(e) => onItemChange({ ...item, type: e.target.value as 'user' | 'ai' })}
                  className={inputClass}
                >
                  <option value="user">Người dùng</option>
                  <option value="ai">AI</option>
                </select>
              </div>
              <TextArea
                label="Nội dung"
                value={item.message}
                onChange={(val) => onItemChange({ ...item, message: val })}
              />
            </div>
          )}
        />
      </ContentGroupSection>

      {/* Trainers */}
      <ContentGroupSection title="Huấn luyện viên" icon={<Users className="w-5 h-5" />}>
        <TextInput
          label="Tiêu đề"
          value={content.trainers.title}
          onChange={(val) => updateGroup('trainers', { ...content.trainers, title: val })}
        />
        <TextInput
          label="Phụ đề"
          value={content.trainers.subtitle}
          onChange={(val) => updateGroup('trainers', { ...content.trainers, subtitle: val })}
        />
        <ListFieldEditor<TrainerItem>
          label="Danh sách HLV"
          addLabel="Thêm HLV"
          items={content.trainers.items}
          onChange={(items) => updateGroup('trainers', { ...content.trainers, items })}
          createItem={() => ({ name: '', specialty: '', experience: '', image: '', certifications: '' })}
          renderItem={(item, _idx, onItemChange) => (
            <div className="space-y-3">
              <TextInput
                label="Tên"
                value={item.name}
                onChange={(val) => onItemChange({ ...item, name: val })}
              />
              <TextInput
                label="Chuyên môn"
                value={item.specialty}
                onChange={(val) => onItemChange({ ...item, specialty: val })}
              />
              <TextInput
                label="Kinh nghiệm"
                value={item.experience}
                onChange={(val) => onItemChange({ ...item, experience: val })}
              />
              <TextInput
                label="Chứng chỉ"
                value={item.certifications}
                onChange={(val) => onItemChange({ ...item, certifications: val })}
              />
              <ImageInput
                label="Ảnh"
                value={item.image}
                onChange={(val) => onItemChange({ ...item, image: val })}
              />
            </div>
          )}
        />
      </ContentGroupSection>

      {/* Testimonials */}
      <ContentGroupSection title="Khách hàng nói gì" icon={<MessageSquareQuote className="w-5 h-5" />}>
        <TextInput
          label="Tiêu đề"
          value={content.testimonials.title}
          onChange={(val) => updateGroup('testimonials', { ...content.testimonials, title: val })}
        />
        <TextInput
          label="Phụ đề"
          value={content.testimonials.subtitle}
          onChange={(val) => updateGroup('testimonials', { ...content.testimonials, subtitle: val })}
        />
        <ListFieldEditor<TestimonialItem>
          label="Danh sách cảm nhận"
          addLabel="Thêm cảm nhận"
          items={content.testimonials.items}
          onChange={(items) => updateGroup('testimonials', { ...content.testimonials, items })}
          createItem={() => ({ name: '', message: '', image: '', detail: '' })}
          renderItem={(item, _idx, onItemChange) => (
            <div className="space-y-3">
              <TextInput
                label="Tên khách hàng"
                value={item.name}
                onChange={(val) => onItemChange({ ...item, name: val })}
              />
              <TextInput
                label="Mô tả ngắn (không bắt buộc)"
                placeholder="Hội viên 6 tháng · Giảm 7kg"
                value={item.detail}
                onChange={(val) => onItemChange({ ...item, detail: val })}
              />
              <TextArea
                label="Cảm nhận"
                value={item.message}
                onChange={(val) => onItemChange({ ...item, message: val })}
              />
              <ImageInput
                label="Ảnh khách hàng (ảnh dọc, hiển thị lớn)"
                maxSize={1200}
                value={item.image}
                onChange={(val) => onItemChange({ ...item, image: val })}
              />
            </div>
          )}
        />
      </ContentGroupSection>

      {/* Closing CTA */}
      <ContentGroupSection title="CTA cuối trang" icon={<Zap className="w-5 h-5" />}>
        <TextInput
          label="Tiêu đề"
          value={content.closing_cta.title}
          onChange={(val) => updateGroup('closing_cta', { ...content.closing_cta, title: val })}
        />
        <TextInput
          label="Phụ đề"
          value={content.closing_cta.subtitle}
          onChange={(val) => updateGroup('closing_cta', { ...content.closing_cta, subtitle: val })}
        />
        <TextInput
          label="Nhãn nút chính"
          value={content.closing_cta.primary_button_label}
          onChange={(val) => updateGroup('closing_cta', { ...content.closing_cta, primary_button_label: val })}
        />
        <TextInput
          label="Nhãn nút phụ"
          value={content.closing_cta.secondary_button_label}
          onChange={(val) => updateGroup('closing_cta', { ...content.closing_cta, secondary_button_label: val })}
        />
      </ContentGroupSection>

      {/* Contact */}
      <ContentGroupSection title="Liên hệ" icon={<MapPin className="w-5 h-5" />}>
        <TextArea
          label="Địa chỉ"
          value={content.contact.address}
          onChange={(val) => updateGroup('contact', { ...content.contact, address: val })}
        />
        <TextInput
          label="Số điện thoại"
          type="tel"
          value={content.contact.phone}
          onChange={(val) => updateGroup('contact', { ...content.contact, phone: val })}
        />
        <TextInput
          label="Email"
          type="email"
          value={content.contact.email}
          onChange={(val) => updateGroup('contact', { ...content.contact, email: val })}
        />
        <TextArea
          label="Giờ mở cửa"
          value={content.contact.hours}
          onChange={(val) => updateGroup('contact', { ...content.contact, hours: val })}
        />
      </ContentGroupSection>

      {/* Social */}
      <ContentGroupSection title="Mạng xã hội" icon={<Globe className="w-5 h-5" />}>
        <TextInput
          label="Facebook"
          type="url"
          value={content.social.facebook_url}
          onChange={(val) => updateGroup('social', { ...content.social, facebook_url: val })}
          placeholder="https://facebook.com/..."
        />
        <TextInput
          label="Instagram"
          type="url"
          value={content.social.instagram_url}
          onChange={(val) => updateGroup('social', { ...content.social, instagram_url: val })}
          placeholder="https://instagram.com/..."
        />
        <TextInput
          label="Youtube"
          type="url"
          value={content.social.youtube_url}
          onChange={(val) => updateGroup('social', { ...content.social, youtube_url: val })}
          placeholder="https://youtube.com/..."
        />
      </ContentGroupSection>

      {/* Footer */}
      <ContentGroupSection title="Chân trang" icon={<FileText className="w-5 h-5" />}>
        <TextArea
          label="Mô tả thương hiệu"
          value={content.footer.brand_description}
          onChange={(val) => updateGroup('footer', { ...content.footer, brand_description: val })}
        />
        <TextInput
          label="Bản quyền"
          value={content.footer.copyright}
          onChange={(val) => updateGroup('footer', { ...content.footer, copyright: val })}
        />
        <TextInput
          label="Nhãn menu: Về chúng tôi"
          value={content.footer.nav_about_label}
          onChange={(val) => updateGroup('footer', { ...content.footer, nav_about_label: val })}
        />
        <TextInput
          label="Nhãn menu: Dịch vụ"
          value={content.footer.nav_services_label}
          onChange={(val) => updateGroup('footer', { ...content.footer, nav_services_label: val })}
        />
        <TextInput
          label="Nhãn menu: HLV"
          value={content.footer.nav_trainers_label}
          onChange={(val) => updateGroup('footer', { ...content.footer, nav_trainers_label: val })}
        />
        <TextInput
          label="Nhãn menu: Liên hệ"
          value={content.footer.nav_contact_label}
          onChange={(val) => updateGroup('footer', { ...content.footer, nav_contact_label: val })}
        />
      </ContentGroupSection>
    </div>
  );
}
