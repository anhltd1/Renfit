"""Business logic for the Landing Page CMS (SiteContent singleton document)."""

from datetime import datetime, timezone

from src.db.mongo import site_content_collection
from src.schema.site_content import (
    AboutContent,
    AboutFeature,
    AiChatMessage,
    AiCoachContent,
    BrandContent,
    ClosingCtaContent,
    ContactContent,
    FooterContent,
    HeroContent,
    HeroStat,
    ServiceItem,
    ServicesContent,
    SiteContentTree,
    SocialContent,
    TestimonialItem,
    TestimonialsContent,
    TrainerItem,
    TrainersContent,
)

DOCUMENT_ID = "site_content"


# ── Default content (mirrors current hardcoded landing page values) ────────


def build_default_content() -> SiteContentTree:
    """Produce the default SiteContentTree from the current hardcoded landing page values."""
    return SiteContentTree(
        brand=BrandContent(
            logo_url="",
            name="Renfit",
            tagline="Nâng Tầm Thể Chất. Kiến Tạo Phiên Bản Tốt Nhất Của Bạn.",
        ),
        hero=HeroContent(
            headline_line1="Nâng Tầm Thể Chất.",
            headline_line2="Kiến Tạo Phiên Bản",
            headline_line3="Tốt Nhất Của Bạn.",
            description=(
                "Phòng gym riêng tư cao cấp với huấn luyện viên cá nhân chuyên nghiệp, "
                "hỗ trợ AI thông minh và chương trình tập luyện được cá nhân hóa hoàn toàn."
            ),
            background_image=(
                "https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df"
                "?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            ),
            stats=[
                HeroStat(icon="Users", value="100+", label="Hội viên"),
                HeroStat(icon="Dumbbell", value="10+", label="Huấn luyện viên"),
                HeroStat(icon="Star", value="95%", label="Hài lòng"),
            ],
        ),
        about=AboutContent(
            title="Về Renfit",
            subtitle=(
                "Không gian tập luyện cao cấp với môi trường riêng tư, "
                "trang thiết bị hiện đại và đội ngũ huấn luyện viên chuyên nghiệp."
            ),
            main_image=(
                "https://images.unsplash.com/photo-1637430308606-86576d8fef3c"
                "?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            ),
            main_image_title="Không Gian Tập Luyện Đẳng Cấp",
            main_image_description=(
                "Thiết bị cao cấp từ các thương hiệu hàng đầu thế giới, "
                "đáp ứng mọi nhu cầu tập luyện của bạn."
            ),
            features=[
                AboutFeature(
                    icon="Target",
                    title="Mục Tiêu Cá Nhân",
                    description="Chương trình tập luyện được thiết kế riêng dựa trên mục tiêu và thể trạng của bạn.",
                ),
                AboutFeature(
                    icon="Award",
                    title="HLV Chuyên Nghiệp",
                    description="Đội ngũ HLV được chứng nhận quốc tế với kinh nghiệm nhiều năm.",
                ),
                AboutFeature(
                    icon="Heart",
                    title="Theo Dõi Sức Khỏe",
                    description="Giám sát tiến trình và sức khỏe toàn diện với công nghệ hiện đại.",
                ),
                AboutFeature(
                    icon="Zap",
                    title="Kết Quả Nhanh",
                    description="Phương pháp khoa học giúp bạn đạt mục tiêu trong thời gian ngắn nhất.",
                ),
            ],
        ),
        services=ServicesContent(
            title="Dịch Vụ Của Chúng Tôi",
            subtitle="Giải pháp tập luyện toàn diện với sự kết hợp của công nghệ và chuyên môn.",
            items=[
                ServiceItem(
                    icon="Dumbbell",
                    title="Personal Training",
                    description="Huấn luyện viên cá nhân 1-1 với chương trình được thiết kế riêng cho bạn.",
                ),
                ServiceItem(
                    icon="Bot",
                    title="AI Fitness Coach",
                    description="Trợ lý AI thông minh hỗ trợ bạn 24/7, trả lời mọi câu hỏi về tập luyện.",
                ),
                ServiceItem(
                    icon="Apple",
                    title="Tư Vấn Dinh Dưỡng",
                    description="Chế độ ăn uống khoa học, cân đối dinh dưỡng phù hợp với mục tiêu.",
                ),
                ServiceItem(
                    icon="TrendingUp",
                    title="Strength & Conditioning",
                    description="Xây dựng sức mạnh và thể lực toàn diện với bài tập chuyên sâu.",
                ),
                ServiceItem(
                    icon="Scale",
                    title="Giảm Cân",
                    description="Chương trình giảm cân khoa học, an toàn và hiệu quả lâu dài.",
                ),
                ServiceItem(
                    icon="Flame",
                    title="Tăng Cơ",
                    description="Phát triển khối lượng cơ bắp với phương pháp tập luyện tối ưu.",
                ),
            ],
        ),
        ai_coach=AiCoachContent(
            badge_text="AI-Powered",
            title="Trợ Lý AI Fitness Coach",
            subtitle=(
                "Chat với AI Coach thông minh để nhận tư vấn tập luyện, "
                "dinh dưỡng và đặt lịch hẹn mọi lúc, mọi nơi."
            ),
            messages=[
                AiChatMessage(
                    type="user",
                    message="Chào bạn! Tôi muốn tăng cơ. Bạn có thể tư vấn cho tôi không?",
                ),
                AiChatMessage(
                    type="ai",
                    message=(
                        "Chào bạn! Tất nhiên rồi. Để tư vấn chính xác, tôi cần biết thêm "
                        "một số thông tin: Bạn đã tập gym được bao lâu? Mục tiêu cụ thể "
                        "của bạn là tăng bao nhiêu kg cơ?"
                    ),
                ),
                AiChatMessage(
                    type="user",
                    message="Tôi mới bắt đầu. Muốn tăng 5kg cơ trong 3 tháng.",
                ),
                AiChatMessage(
                    type="ai",
                    message=(
                        "Tuyệt vời! Đây là kế hoạch dành cho bạn:\n\n"
                        "✓ Tập 4-5 buổi/tuần với trọng tâm compound exercises\n"
                        "✓ Protein 2g/kg cân nặng mỗi ngày\n"
                        "✓ Thặng dư calories 300-500 kcal\n\n"
                        "Bạn có muốn đặt lịch với HLV để hướng dẫn chi tiết không?"
                    ),
                ),
            ],
        ),
        trainers=TrainersContent(
            title="Đội Ngũ Huấn Luyện Viên",
            subtitle=(
                "Các chuyên gia được chứng nhận quốc tế, sẵn sàng đồng hành "
                "cùng bạn trên con đường chinh phục mục tiêu."
            ),
            items=[
                TrainerItem(
                    name="Trần Minh Quân",
                    specialty="Strength & Conditioning",
                    experience="8 năm kinh nghiệm",
                    image="https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400",
                    certifications="NASM-CPT, CSCS",
                ),
                TrainerItem(
                    name="Nguyễn Thị Hương",
                    specialty="Weight Loss & Nutrition",
                    experience="6 năm kinh nghiệm",
                    image="https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?w=400",
                    certifications="ACE-CPT, PN-1",
                ),
                TrainerItem(
                    name="Lê Văn Tuấn",
                    specialty="Bodybuilding & Hypertrophy",
                    experience="10 năm kinh nghiệm",
                    image="https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400",
                    certifications="ISSA-CPT, IFBB Pro",
                ),
                TrainerItem(
                    name="Phạm Thu Trang",
                    specialty="Functional Training",
                    experience="5 năm kinh nghiệm",
                    image="https://images.unsplash.com/photo-1548542031-0b26d8ba1e0a?w=400",
                    certifications="NASM-CPT, TRX",
                ),
            ],
        ),
        testimonials=TestimonialsContent(
            title="Khách hàng ở Renfit nói gì",
            subtitle="Những chia sẻ thật từ hội viên đang tập luyện cùng Renfit.",
            items=[
                TestimonialItem(
                    name="Chị Minh Anh",
                    detail="Hội viên 6 tháng · Giảm 7kg",
                    message=(
                        "HLV theo sát từng buổi, điều chỉnh bài tập theo chỉ số InBody nên "
                        "mình thấy rõ tiến bộ mỗi tháng. Không gian riêng tư nên tập rất thoải mái."
                    ),
                    image="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800",
                ),
                TestimonialItem(
                    name="Anh Hoàng Long",
                    detail="Hội viên 1 năm · Tăng 4kg cơ",
                    message=(
                        "Lịch tập linh hoạt, đặt lịch trên app chỉ mất vài giây. AI Coach trả lời "
                        "các câu hỏi dinh dưỡng rất nhanh, buổi tập với HLV thì luôn chất lượng."
                    ),
                    image="https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800",
                ),
                TestimonialItem(
                    name="Chị Thu Hà",
                    detail="Hội viên 3 tháng",
                    message=(
                        "Lần đầu đi tập nhưng không hề bị ngợp. HLV hướng dẫn kỹ thuật cẩn thận, "
                        "mình tự tin hơn hẳn và đã giảm được đau lưng."
                    ),
                    image="https://images.unsplash.com/photo-1609899537878-88d5ba429bdb?w=800",
                ),
            ],
        ),
        closing_cta=ClosingCtaContent(
            title="Sẵn Sàng Bắt Đầu?",
            subtitle=(
                "Tham gia cùng hơn 100 hội viên đã tin tưởng Renfit cho hành trình "
                "nâng tầm thể chất của họ. Đặt lịch hôm nay."
            ),
            primary_button_label="Bắt Đầu Hành Trình",
            secondary_button_label="Gặp Đội Ngũ HLV",
        ),
        contact=ContactContent(
            address="123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
            phone="+84 123 456 789",
            email="contact@renfit.vn",
            hours="Thứ 2 - Thứ 6: 6:00 - 22:00\nThứ 7 - Chủ Nhật: 7:00 - 21:00",
        ),
        social=SocialContent(
            facebook_url="https://facebook.com",
            instagram_url="https://instagram.com",
            youtube_url="https://youtube.com",
        ),
        footer=FooterContent(
            brand_description=(
                "Phòng gym riêng tư cao cấp, nơi bạn kiến tạo phiên bản tốt nhất của chính mình."
            ),
            copyright="© 2026 Renfit. Tất cả quyền được bảo lưu.",
            nav_about_label="Về Chúng Tôi",
            nav_services_label="Dịch Vụ",
            nav_trainers_label="Huấn Luyện Viên",
            nav_contact_label="Liên Hệ",
        ),
    )


# ── Required fields per content group (for validation) ─────────────────────

# Maps each top-level key to a list of required sub-field names.
_REQUIRED_FIELDS: dict[str, list[str]] = {
    "brand": ["name"],
    "hero": ["headline_line1", "headline_line2", "headline_line3", "description"],
    "about": ["title", "subtitle"],
    "services": ["title", "subtitle"],
    "ai_coach": ["title", "subtitle"],
    "trainers": ["title", "subtitle"],
    "testimonials": ["title"],
    "closing_cta": ["title", "subtitle", "primary_button_label", "secondary_button_label"],
    "contact": ["address", "phone", "email", "hours"],
    "social": [],
    "footer": ["brand_description", "copyright"],
}

_CONTENT_GROUPS = list(_REQUIRED_FIELDS.keys())


def _fill_missing_groups(content: dict) -> dict:
    """Add default values for groups introduced after the document was saved.

    Documents created before e.g. the `testimonials` group existed would
    otherwise reach the CMS editor without that key. Returns a new dict;
    the stored document is left untouched until the next save.
    """
    missing = [g for g in _CONTENT_GROUPS if g not in content]
    if not missing:
        return content
    defaults = build_default_content().model_dump()
    return {**content, **{g: defaults[g] for g in missing}}


# ── Service class ──────────────────────────────────────────────────────────


class SiteContentService:
    """Stateless service operating on the SiteContent singleton document."""

    @staticmethod
    def get_published() -> dict:
        """Return the published version of the content. Auto-seeds if missing."""
        doc = site_content_collection().find_one({"_id": DOCUMENT_ID})
        if doc is None:
            doc = SiteContentService._seed_default()
        return _fill_missing_groups(doc["published"])

    @staticmethod
    def get_draft() -> dict:
        """Return the draft version of the content. Auto-seeds if missing."""
        doc = site_content_collection().find_one({"_id": DOCUMENT_ID})
        if doc is None:
            doc = SiteContentService._seed_default()
        return _fill_missing_groups(doc["draft"])

    @staticmethod
    def save_draft(content: dict, trainer_id: str) -> dict:
        """Validate and save the draft. Returns {content, updated_at} or raises."""
        missing = SiteContentService._validate_content(content)
        if missing:
            raise ValueError(missing)

        now = datetime.now(timezone.utc)
        site_content_collection().update_one(
            {"_id": DOCUMENT_ID},
            {
                "$set": {
                    "draft": content,
                    "draft_updated_at": now,
                    "draft_updated_by": trainer_id,
                }
            },
            upsert=True,
        )
        return {"content": content, "updated_at": now}

    @staticmethod
    def publish(trainer_id: str) -> dict:
        """Copy current draft → published atomically. Returns {published_at}."""
        doc = site_content_collection().find_one({"_id": DOCUMENT_ID})
        if doc is None:
            doc = SiteContentService._seed_default()

        now = datetime.now(timezone.utc)
        site_content_collection().update_one(
            {"_id": DOCUMENT_ID},
            {
                "$set": {
                    "published": doc["draft"],
                    "published_at": now,
                    "published_by": trainer_id,
                }
            },
        )
        return {"published_at": now}

    @staticmethod
    def upload_image(base64_data: str, image_format: str) -> str:
        """Validate image format and size. Returns the base64 string as-is.

        Raises:
            ValueError: if format is unsupported.
            OverflowError: if size exceeds 2MB.
        """
        allowed_formats = {"jpeg", "png", "webp", "jpg"}
        if image_format.lower() not in allowed_formats:
            raise ValueError(
                "Định dạng ảnh không được hỗ trợ. Chấp nhận: JPEG, PNG, WebP."
            )

        # 2MB = 2 * 1024 * 1024 = 2_097_152 bytes
        if len(base64_data.encode("utf-8")) > 2_097_152:
            raise OverflowError("Ảnh vượt quá kích thước tối đa 2MB.")

        return base64_data

    @staticmethod
    def _seed_default() -> dict:
        """Create the initial document with identical draft and published."""
        default_tree = build_default_content().model_dump()
        doc = {
            "_id": DOCUMENT_ID,
            "draft": default_tree,
            "published": default_tree,
            "draft_updated_at": None,
            "draft_updated_by": None,
            "published_at": None,
            "published_by": None,
        }
        site_content_collection().replace_one(
            {"_id": DOCUMENT_ID}, doc, upsert=True
        )
        return doc

    @staticmethod
    def _validate_content(content: dict) -> list[str]:
        """Return list of missing required field names (Vietnamese-friendly)."""
        missing: list[str] = []

        # Check every content group exists
        for group in _CONTENT_GROUPS:
            if group not in content:
                missing.append(group)
                continue
            group_data = content[group]
            if not isinstance(group_data, dict):
                missing.append(group)
                continue
            for field in _REQUIRED_FIELDS[group]:
                value = group_data.get(field)
                if value is None or (isinstance(value, str) and value.strip() == ""):
                    missing.append(f"{group}.{field}")

        return missing
