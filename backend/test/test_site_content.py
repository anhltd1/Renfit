"""Unit tests for the Site Content CMS (Landing Page) — schema, validation,
and image upload logic. Only pure-logic tests that don't require MongoDB."""

import pytest

from src.schema.site_content import SiteContentTree
from src.services.site_content_service import (
    SiteContentService,
    build_default_content,
    _REQUIRED_FIELDS,
)


# ── Seeding / build_default_content ────────────────────────────────────────


class TestBuildDefaultContent:
    def test_returns_site_content_tree_instance(self):
        tree = build_default_content()
        assert isinstance(tree, SiteContentTree)

    def test_all_content_groups_are_populated(self):
        tree = build_default_content()
        expected_groups = [
            "brand", "hero", "about", "services", "ai_coach",
            "trainers", "testimonials", "closing_cta", "contact", "social", "footer",
        ]
        tree_dict = tree.model_dump()
        for group in expected_groups:
            assert group in tree_dict, f"Missing content group: {group}"
            assert tree_dict[group], f"Content group '{group}' is empty"

    def test_testimonials_are_populated(self):
        tree = build_default_content()
        assert tree.testimonials.title == "Khách hàng ở Renfit nói gì"
        assert len(tree.testimonials.items) >= 1
        for item in tree.testimonials.items:
            assert item.name and item.message

    def test_tree_without_testimonials_still_validates(self):
        """Documents saved before the testimonials group existed must still parse."""
        legacy = build_default_content().model_dump()
        del legacy["testimonials"]
        tree = SiteContentTree.model_validate(legacy)
        assert tree.testimonials.items == []
        assert tree.testimonials.title

    def test_fill_missing_groups_adds_testimonials_to_legacy_documents(self):
        from src.services.site_content_service import _fill_missing_groups

        legacy = build_default_content().model_dump()
        del legacy["testimonials"]
        legacy["hero"]["headline_line1"] = "Custom"

        filled = _fill_missing_groups(legacy)

        assert filled["testimonials"]["title"] == "Khách hàng ở Renfit nói gì"
        assert filled["hero"]["headline_line1"] == "Custom"  # existing groups untouched
        assert "testimonials" not in legacy  # input not mutated

    def test_hero_stats_are_populated(self):
        tree = build_default_content()
        assert len(tree.hero.stats) == 3

    def test_about_features_are_populated(self):
        tree = build_default_content()
        assert len(tree.about.features) == 4

    def test_services_items_are_populated(self):
        tree = build_default_content()
        assert len(tree.services.items) == 6

    def test_trainers_items_are_populated(self):
        tree = build_default_content()
        assert len(tree.trainers.items) == 4

    def test_ai_coach_messages_are_populated(self):
        tree = build_default_content()
        assert len(tree.ai_coach.messages) == 4

    def test_default_content_passes_validation(self):
        """The default content should pass the service's own validation."""
        tree_dict = build_default_content().model_dump()
        missing = SiteContentService._validate_content(tree_dict)
        assert missing == []


# ── Validation (_validate_content) ─────────────────────────────────────────


class TestValidateContent:
    @pytest.fixture
    def valid_content(self) -> dict:
        """A complete valid content dict from the default seeder."""
        return build_default_content().model_dump()

    def test_returns_empty_list_for_complete_content(self, valid_content):
        result = SiteContentService._validate_content(valid_content)
        assert result == []

    def test_catches_missing_top_level_group(self, valid_content):
        del valid_content["hero"]
        result = SiteContentService._validate_content(valid_content)
        assert "hero" in result

    def test_catches_multiple_missing_top_level_groups(self, valid_content):
        del valid_content["hero"]
        del valid_content["brand"]
        result = SiteContentService._validate_content(valid_content)
        assert "hero" in result
        assert "brand" in result

    def test_catches_non_dict_group_value(self, valid_content):
        valid_content["services"] = "not a dict"
        result = SiteContentService._validate_content(valid_content)
        assert "services" in result

    def test_catches_missing_required_field_within_group(self, valid_content):
        valid_content["hero"]["headline_line1"] = ""
        result = SiteContentService._validate_content(valid_content)
        assert "hero.headline_line1" in result

    def test_catches_none_required_field(self, valid_content):
        valid_content["contact"]["phone"] = None
        result = SiteContentService._validate_content(valid_content)
        assert "contact.phone" in result

    def test_catches_whitespace_only_required_field(self, valid_content):
        valid_content["footer"]["copyright"] = "   "
        result = SiteContentService._validate_content(valid_content)
        assert "footer.copyright" in result

    def test_social_group_has_no_required_fields(self, valid_content):
        """Social links are all optional — clearing them should still pass."""
        valid_content["social"] = {"facebook_url": "", "instagram_url": "", "youtube_url": ""}
        result = SiteContentService._validate_content(valid_content)
        # No social-related entries in missing
        social_issues = [m for m in result if m.startswith("social")]
        assert social_issues == []

    def test_all_required_fields_are_checked_per_group(self, valid_content):
        """Every field listed in _REQUIRED_FIELDS is actually enforced."""
        for group, fields in _REQUIRED_FIELDS.items():
            for field in fields:
                content_copy = build_default_content().model_dump()
                content_copy[group][field] = ""
                result = SiteContentService._validate_content(content_copy)
                assert f"{group}.{field}" in result, (
                    f"Validation missed required field: {group}.{field}"
                )


# ── Image upload validation ────────────────────────────────────────────────


class TestUploadImage:
    def test_valid_jpeg_returns_data(self):
        data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQ"
        result = SiteContentService.upload_image(data, "jpeg")
        assert result == data

    def test_valid_png_returns_data(self):
        data = "smallbase64data"
        result = SiteContentService.upload_image(data, "png")
        assert result == data

    def test_valid_webp_returns_data(self):
        data = "smallbase64data"
        result = SiteContentService.upload_image(data, "webp")
        assert result == data

    def test_valid_jpg_returns_data(self):
        data = "smallbase64data"
        result = SiteContentService.upload_image(data, "jpg")
        assert result == data

    def test_format_is_case_insensitive(self):
        data = "smallbase64data"
        assert SiteContentService.upload_image(data, "JPEG") == data
        assert SiteContentService.upload_image(data, "PNG") == data
        assert SiteContentService.upload_image(data, "WebP") == data

    def test_rejects_unsupported_format_with_value_error(self):
        with pytest.raises(ValueError) as exc_info:
            SiteContentService.upload_image("data", "gif")
        assert "Định dạng ảnh không được hỗ trợ" in str(exc_info.value)

    def test_rejects_bmp_format(self):
        with pytest.raises(ValueError):
            SiteContentService.upload_image("data", "bmp")

    def test_rejects_oversized_image_with_overflow_error(self):
        # 2MB = 2_097_152 bytes; create base64 data slightly larger
        oversized_data = "A" * 2_097_153
        with pytest.raises(OverflowError) as exc_info:
            SiteContentService.upload_image(oversized_data, "jpeg")
        assert "2MB" in str(exc_info.value)

    def test_accepts_image_exactly_at_2mb_limit(self):
        # Exactly 2MB of UTF-8 data (single-byte ASCII chars)
        exact_data = "A" * 2_097_152
        result = SiteContentService.upload_image(exact_data, "jpeg")
        assert result == exact_data
