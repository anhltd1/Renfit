import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  getPublishedContent,
  getDraftContent,
  type SiteContentTree,
  type HeroContent,
  type AboutContent,
  type ServicesContent,
  type AiCoachContent,
  type TrainersContent,
  type TestimonialsContent,
  type ClosingCtaContent,
  type ContactContent,
  type SocialContent,
  type FooterContent,
  type BrandContent,
} from '../../../lib/api/siteContent';
import { getAdminToken } from '../../../lib/adminAuth';

// ── Default content (matches backend's build_default_content) ───────────────

const DEFAULT_BRAND: BrandContent = {
  logo_url: '',
  name: 'Renfit',
  tagline: 'Phòng tập riêng. Mỗi khung giờ tối đa 4 người.',
};

const DEFAULT_HERO: HeroContent = {
  headline_line1: 'Phòng tập riêng.',
  headline_line2: '4 người',
  headline_line3: 'mỗi giờ.',
  description:
    'Tập cùng huấn luyện viên cá nhân trong một phòng tập không bao giờ đông, đo InBody để thấy tiến độ thật, và đặt lịch trên ứng dụng chỉ trong vài giây.',
  background_image:
    'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
  stats: [
    { icon: 'Users', value: '4', label: 'người tối đa mỗi khung giờ' },
    { icon: 'Dumbbell', value: '08–21', label: 'mở cửa Thứ 2 – Thứ 7' },
    { icon: 'Star', value: '12', label: 'ngày đặt lịch trước' },
  ],
};

const DEFAULT_ABOUT: AboutContent = {
  title: 'Về Renfit',
  subtitle:
    'Không gian tập luyện cao cấp với môi trường riêng tư, trang thiết bị hiện đại và đội ngũ huấn luyện viên chuyên nghiệp.',
  main_image:
    'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  main_image_title: 'Không gian tập luyện riêng',
  main_image_description:
    'Thiết bị cao cấp từ các thương hiệu hàng đầu thế giới, đáp ứng mọi nhu cầu tập luyện của bạn.',
  features: [
    {
      icon: 'Target',
      title: 'Mục tiêu cá nhân',
      description: 'Chương trình tập luyện được thiết kế riêng dựa trên mục tiêu và thể trạng của bạn.',
    },
    {
      icon: 'Award',
      title: 'Huấn luyện viên theo sát',
      description: 'Đội ngũ HLV được chứng nhận quốc tế với kinh nghiệm nhiều năm.',
    },
    {
      icon: 'Heart',
      title: 'Đo InBody định kỳ',
      description: 'Giám sát tiến trình và sức khỏe toàn diện với công nghệ hiện đại.',
    },
    {
      icon: 'Zap',
      title: 'Tiến độ đo được',
      description: 'Mỗi lần đo được so với lần trước, để bài tập được điều chỉnh theo số liệu thật.',
    },
  ],
};

const DEFAULT_SERVICES: ServicesContent = {
  title: 'Dịch vụ',
  subtitle: 'Giải pháp tập luyện toàn diện với sự kết hợp của công nghệ và chuyên môn.',
  items: [
    {
      icon: 'Dumbbell',
      title: 'Personal Training',
      description: 'Huấn luyện viên cá nhân 1-1 với chương trình được thiết kế riêng cho bạn.',
    },
    {
      icon: 'Bot',
      title: 'AI Fitness Coach',
      description: 'Trợ lý AI thông minh hỗ trợ bạn 24/7, trả lời mọi câu hỏi về tập luyện.',
    },
    {
      icon: 'Apple',
      title: 'Tư vấn dinh dưỡng',
      description: 'Chế độ ăn uống khoa học, cân đối dinh dưỡng phù hợp với mục tiêu.',
    },
    {
      icon: 'TrendingUp',
      title: 'Strength & Conditioning',
      description: 'Xây dựng sức mạnh và thể lực toàn diện với bài tập chuyên sâu.',
    },
    {
      icon: 'Scale',
      title: 'Giảm cân',
      description: 'Chương trình giảm cân khoa học, an toàn và hiệu quả lâu dài.',
    },
    {
      icon: 'Flame',
      title: 'Tăng cơ',
      description: 'Phát triển khối lượng cơ bắp với phương pháp tập luyện tối ưu.',
    },
  ],
};

const DEFAULT_AI_COACH: AiCoachContent = {
  badge_text: 'AI-Powered',
  title: 'AI Coach giữa các buổi tập',
  subtitle:
    'Chat với AI Coach thông minh để nhận tư vấn tập luyện, dinh dưỡng và đặt lịch hẹn mọi lúc, mọi nơi.',
  messages: [
    {
      type: 'user',
      message: 'Chào bạn! Tôi muốn tăng cơ. Bạn có thể tư vấn cho tôi không?',
    },
    {
      type: 'ai',
      message:
        'Chào bạn! Tất nhiên rồi. Để tư vấn chính xác, tôi cần biết thêm một số thông tin: Bạn đã tập gym được bao lâu? Mục tiêu cụ thể của bạn là tăng bao nhiêu kg cơ?',
    },
    {
      type: 'user',
      message: 'Tôi mới bắt đầu. Muốn tăng 5kg cơ trong 3 tháng.',
    },
    {
      type: 'ai',
      message:
        'Tuyệt vời! Đây là kế hoạch dành cho bạn:\n\n– Tập 4-5 buổi/tuần với trọng tâm compound exercises\n– Protein 2g/kg cân nặng mỗi ngày\n– Thặng dư calories 300-500 kcal\n\nBạn có muốn đặt lịch với HLV để hướng dẫn chi tiết không?',
    },
  ],
};

const DEFAULT_TRAINERS: TrainersContent = {
  title: 'Đội ngũ huấn luyện viên',
  subtitle:
    'Các chuyên gia được chứng nhận quốc tế, sẵn sàng đồng hành cùng bạn trên con đường chinh phục mục tiêu.',
  items: [
    {
      name: 'Trần Minh Quân',
      specialty: 'Strength & Conditioning',
      experience: '8 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400',
      certifications: 'NASM-CPT, CSCS',
    },
    {
      name: 'Nguyễn Thị Hương',
      specialty: 'Weight Loss & Nutrition',
      experience: '6 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?w=400',
      certifications: 'ACE-CPT, PN-1',
    },
    {
      name: 'Lê Văn Tuấn',
      specialty: 'Bodybuilding & Hypertrophy',
      experience: '10 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400',
      certifications: 'ISSA-CPT, IFBB Pro',
    },
    {
      name: 'Phạm Thu Trang',
      specialty: 'Functional Training',
      experience: '5 năm kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      certifications: 'NASM-CPT, TRX',
    },
  ],
};

const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  title: 'Khách hàng ở Renfit nói gì',
  subtitle: 'Những chia sẻ thật từ hội viên đang tập luyện cùng Renfit.',
  items: [
    {
      name: 'Chị Minh Anh',
      detail: 'Hội viên 6 tháng · Giảm 7kg',
      message:
        'HLV theo sát từng buổi, điều chỉnh bài tập theo chỉ số InBody nên mình thấy rõ tiến bộ mỗi tháng. Không gian riêng tư nên tập rất thoải mái.',
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800',
    },
    {
      name: 'Anh Hoàng Long',
      detail: 'Hội viên 1 năm · Tăng 4kg cơ',
      message:
        'Lịch tập linh hoạt, đặt lịch trên app chỉ mất vài giây. AI Coach trả lời các câu hỏi dinh dưỡng rất nhanh, buổi tập với HLV thì luôn chất lượng.',
      image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800',
    },
    {
      name: 'Chị Thu Hà',
      detail: 'Hội viên 3 tháng',
      message:
        'Lần đầu đi tập nhưng không hề bị ngợp. HLV hướng dẫn kỹ thuật cẩn thận, mình tự tin hơn hẳn và đã giảm được đau lưng.',
      image: 'https://images.unsplash.com/photo-1609899537878-88d5ba429bdb?w=800',
    },
  ],
};

const DEFAULT_CLOSING_CTA: ClosingCtaContent = {
  title: 'Đặt buổi tập đầu tiên',
  subtitle:
    'Chọn một khung giờ còn chỗ — huấn luyện viên sẽ xác nhận và liên hệ với bạn trước buổi tập.',
  primary_button_label: 'Đặt lịch tập',
  secondary_button_label: 'Gặp huấn luyện viên',
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

const DEFAULT_FOOTER: FooterContent = {
  brand_description: 'Phòng tập riêng với huấn luyện viên cá nhân. Mỗi khung giờ tối đa 4 người.',
  copyright: '© 2026 Renfit. Tất cả quyền được bảo lưu.',
  nav_about_label: 'Về Renfit',
  nav_services_label: 'Dịch vụ',
  nav_trainers_label: 'Huấn luyện viên',
  nav_contact_label: 'Liên hệ',
};

export const DEFAULT_CONTENT: SiteContentTree = {
  brand: DEFAULT_BRAND,
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  services: DEFAULT_SERVICES,
  ai_coach: DEFAULT_AI_COACH,
  trainers: DEFAULT_TRAINERS,
  testimonials: DEFAULT_TESTIMONIALS,
  closing_cta: DEFAULT_CLOSING_CTA,
  contact: DEFAULT_CONTACT,
  social: DEFAULT_SOCIAL,
  footer: DEFAULT_FOOTER,
};

// ── Deep merge helper ───────────────────────────────────────────────────────

/**
 * Merges `source` into `defaults` at field level.
 * - If a field in source is null/undefined, the default is used.
 * - If a field is an array (even empty), the source array is kept (admin intentionally set it).
 * - Objects are recursively merged.
 * - Primitive values from source override defaults.
 */
function deepMerge<T extends Record<string, unknown>>(defaults: T, source: Partial<T> | null | undefined): T {
  if (!source) return defaults;

  const result = { ...defaults };

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const sourceVal = source[key];

    // If source doesn't have the key or it's null/undefined, keep default
    if (sourceVal === undefined || sourceVal === null) {
      continue;
    }

    // If it's an array, use source array directly (even if empty)
    if (Array.isArray(sourceVal)) {
      (result as Record<string, unknown>)[key as string] = sourceVal;
      continue;
    }

    // If it's a nested object, recurse
    if (typeof sourceVal === 'object' && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      (result as Record<string, unknown>)[key as string] = deepMerge(
        defaults[key] as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
      continue;
    }

    // Primitive: use source value
    (result as Record<string, unknown>)[key as string] = sourceVal;
  }

  return result;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export interface UseSiteContentReturn {
  content: SiteContentTree;
  isPreview: boolean;
}

export function useSiteContent(): UseSiteContentReturn {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [content, setContent] = useState<SiteContentTree>(DEFAULT_CONTENT);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    async function fetchContent() {
      try {
        let data: SiteContentTree;

        if (isPreview && getAdminToken()) {
          data = await getDraftContent();
        } else {
          data = await getPublishedContent();
        }

        // Deep-merge with defaults so any missing fields fall back
        const merged = deepMerge(DEFAULT_CONTENT, data);
        setContent(merged);
      } catch {
        // On error/timeout: keep defaults — no error UI for visitors
      } finally {
        clearTimeout(timeout);
      }
    }

    fetchContent();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [isPreview]);

  return { content, isPreview };
}
