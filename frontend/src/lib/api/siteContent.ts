import { getAdminToken } from '../adminAuth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function url(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

function adminHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAdminToken() ?? ''}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: unknown };
    if (typeof err.detail === 'string') throw new Error(err.detail);
    throw new Error('Lỗi server. Vui lòng thử lại.');
  }
  return res.json();
}

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface HeroStat {
  icon: string;
  value: string;
  label: string;
}

export interface AboutFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface AiChatMessage {
  type: 'user' | 'ai';
  message: string;
}

export interface TrainerItem {
  name: string;
  specialty: string;
  experience: string;
  image: string;
  certifications: string;
}

export interface BrandContent {
  logo_url: string;
  name: string;
  tagline: string;
}

export interface HeroContent {
  headline_line1: string;
  headline_line2: string;
  headline_line3: string;
  description: string;
  background_image: string;
  stats: HeroStat[];
}

export interface AboutContent {
  title: string;
  subtitle: string;
  main_image: string;
  main_image_title: string;
  main_image_description: string;
  features: AboutFeature[];
}

export interface ServicesContent {
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

export interface AiCoachContent {
  badge_text: string;
  title: string;
  subtitle: string;
  messages: AiChatMessage[];
}

export interface TrainersContent {
  title: string;
  subtitle: string;
  items: TrainerItem[];
}

export interface TestimonialItem {
  name: string;
  message: string;
  image: string;
  /** Optional sub-line, e.g. "Hội viên 6 tháng · Giảm 8kg". */
  detail: string;
}

export interface TestimonialsContent {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface ClosingCtaContent {
  title: string;
  subtitle: string;
  primary_button_label: string;
  secondary_button_label: string;
}

export interface ContactContent {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export interface SocialContent {
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
}

export interface FooterContent {
  brand_description: string;
  copyright: string;
  nav_about_label: string;
  nav_services_label: string;
  nav_trainers_label: string;
  nav_contact_label: string;
}

export interface SiteContentTree {
  brand: BrandContent;
  hero: HeroContent;
  about: AboutContent;
  services: ServicesContent;
  ai_coach: AiCoachContent;
  trainers: TrainersContent;
  testimonials: TestimonialsContent;
  closing_cta: ClosingCtaContent;
  contact: ContactContent;
  social: SocialContent;
  footer: FooterContent;
}

// ── Response types ──────────────────────────────────────────────────────────

export interface SaveDraftResponse {
  content: SiteContentTree;
  updated_at: string;
}

export interface PublishResponse {
  published_at: string;
}

export interface UploadImageResponse {
  url: string;
}

// ── Public endpoint ─────────────────────────────────────────────────────────

export async function getPublishedContent(): Promise<SiteContentTree> {
  const res = await fetch(url('/api/v1/site-content'));
  return handleResponse<SiteContentTree>(res);
}

// ── Admin endpoints ─────────────────────────────────────────────────────────

export async function getDraftContent(): Promise<SiteContentTree> {
  const res = await fetch(url('/api/v1/admin/site-content/draft'), {
    headers: adminHeaders(),
  });
  return handleResponse<SiteContentTree>(res);
}

export async function saveDraft(content: SiteContentTree): Promise<SaveDraftResponse> {
  const res = await fetch(url('/api/v1/admin/site-content/draft'), {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(content),
  });
  return handleResponse<SaveDraftResponse>(res);
}

export async function publishContent(): Promise<PublishResponse> {
  const res = await fetch(url('/api/v1/admin/site-content/publish'), {
    method: 'POST',
    headers: adminHeaders(),
  });
  return handleResponse<PublishResponse>(res);
}

export async function uploadImage(
  base64Data: string,
  format: string,
): Promise<UploadImageResponse> {
  const res = await fetch(url('/api/v1/admin/site-content/upload-image'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ base64_data: base64Data, format }),
  });
  return handleResponse<UploadImageResponse>(res);
}
