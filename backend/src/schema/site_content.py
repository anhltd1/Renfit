"""Pydantic models for the SiteContent singleton document (Landing Page CMS)."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Nested content models ──────────────────────────────────────────────────


class HeroStat(BaseModel):
    icon: str = ""
    value: str
    label: str


class AboutFeature(BaseModel):
    icon: str = ""
    title: str
    description: str


class ServiceItem(BaseModel):
    icon: str = ""
    title: str
    description: str


class AiChatMessage(BaseModel):
    type: str  # "user" | "ai"
    message: str


class TrainerItem(BaseModel):
    name: str
    specialty: str
    experience: str
    image: str = ""
    certifications: str = ""


class TestimonialItem(BaseModel):
    """One customer quote on the landing page ("Khách hàng ở Renfit nói gì")."""

    __test__ = False  # not a pytest test class despite the name

    name: str
    message: str
    image: str = ""  # URL or base64 data-URL (same convention as TrainerItem.image)
    detail: str = ""  # optional sub-line, e.g. "Hội viên 6 tháng · Giảm 8kg"


# ── Content group models ───────────────────────────────────────────────────


class BrandContent(BaseModel):
    logo_url: str = ""
    name: str = "Renfit"
    tagline: str = ""


class HeroContent(BaseModel):
    headline_line1: str
    headline_line2: str
    headline_line3: str
    description: str
    background_image: str = ""
    stats: list[HeroStat] = []


class AboutContent(BaseModel):
    title: str
    subtitle: str
    main_image: str = ""
    main_image_title: str = ""
    main_image_description: str = ""
    features: list[AboutFeature] = []


class ServicesContent(BaseModel):
    title: str
    subtitle: str
    items: list[ServiceItem] = []


class AiCoachContent(BaseModel):
    badge_text: str = ""
    title: str
    subtitle: str
    messages: list[AiChatMessage] = []


class TrainersContent(BaseModel):
    title: str
    subtitle: str
    items: list[TrainerItem] = []


class TestimonialsContent(BaseModel):
    __test__ = False

    title: str = "Khách hàng ở Renfit nói gì"
    subtitle: str = ""
    items: list[TestimonialItem] = []


class ClosingCtaContent(BaseModel):
    title: str
    subtitle: str
    primary_button_label: str
    secondary_button_label: str


class ContactContent(BaseModel):
    address: str
    phone: str
    email: str
    hours: str


class SocialContent(BaseModel):
    facebook_url: str = ""
    instagram_url: str = ""
    youtube_url: str = ""


class FooterContent(BaseModel):
    brand_description: str
    copyright: str
    nav_about_label: str = "Về Chúng Tôi"
    nav_services_label: str = "Dịch Vụ"
    nav_trainers_label: str = "Huấn Luyện Viên"
    nav_contact_label: str = "Liên Hệ"


# ── Top-level tree and document ────────────────────────────────────────────


class SiteContentTree(BaseModel):
    brand: BrandContent
    hero: HeroContent
    about: AboutContent
    services: ServicesContent
    ai_coach: AiCoachContent
    trainers: TrainersContent
    # Defaulted so documents saved before this group existed still validate.
    testimonials: TestimonialsContent = Field(default_factory=TestimonialsContent)
    closing_cta: ClosingCtaContent
    contact: ContactContent
    social: SocialContent
    footer: FooterContent


class SiteContentDocument(BaseModel):
    """Full MongoDB document shape."""

    id: str = Field(default="site_content", alias="_id")
    draft: SiteContentTree
    published: SiteContentTree
    draft_updated_at: Optional[datetime] = None
    draft_updated_by: Optional[str] = None
    published_at: Optional[datetime] = None
    published_by: Optional[str] = None

    model_config = {"populate_by_name": True}
