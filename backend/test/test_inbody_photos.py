"""Unit tests for InBody progress photos (validation, storage, URL mapping)."""

import base64
from unittest.mock import MagicMock, patch

import pytest

from src.services.inbody_photo_service import (
    MAX_PHOTO_BYTES,
    MAX_PHOTOS_PER_RECORD,
    InvalidPhotoError,
    get_photo,
    parse_data_url,
    photo_urls,
    save_photos,
    validate_photos,
)

JPEG_BYTES = b"\xff\xd8\xff\xe0fake-jpeg-body"


def _data_url(raw: bytes = JPEG_BYTES, mime: str = "image/jpeg") -> str:
    return f"data:{mime};base64,{base64.b64encode(raw).decode()}"


class TestParseDataUrl:
    def test_decodes_valid_jpeg(self):
        content_type, raw = parse_data_url(_data_url())
        assert content_type == "image/jpeg"
        assert raw == JPEG_BYTES

    def test_normalises_jpg_alias(self):
        content_type, _ = parse_data_url(_data_url(mime="image/jpg"))
        assert content_type == "image/jpeg"

    @pytest.mark.parametrize("mime", ["image/png", "image/webp"])
    def test_accepts_png_and_webp(self, mime):
        assert parse_data_url(_data_url(mime=mime))[0] == mime

    @pytest.mark.parametrize(
        "value",
        ["", "not-a-data-url", "https://example.com/a.jpg", "data:image/jpeg;base64,!!!notb64"],
    )
    def test_rejects_malformed(self, value):
        with pytest.raises(InvalidPhotoError):
            parse_data_url(value)

    def test_rejects_unsupported_type(self):
        with pytest.raises(InvalidPhotoError, match="Định dạng"):
            parse_data_url(_data_url(mime="image/gif"))

    def test_rejects_oversized(self):
        with pytest.raises(InvalidPhotoError, match="2MB"):
            parse_data_url(_data_url(raw=b"x" * (MAX_PHOTO_BYTES + 1)))


class TestValidatePhotos:
    def test_empty_list_is_fine(self):
        assert validate_photos([]) == []

    def test_rejects_too_many(self):
        with pytest.raises(InvalidPhotoError, match=str(MAX_PHOTOS_PER_RECORD)):
            validate_photos([_data_url()] * (MAX_PHOTOS_PER_RECORD + 1))

    def test_one_bad_photo_rejects_whole_batch(self):
        with pytest.raises(InvalidPhotoError):
            validate_photos([_data_url(), "garbage"])


class TestSaveAndGet:
    @patch("src.services.inbody_photo_service.inbody_photos_collection")
    def test_save_inserts_in_order_and_returns_ids(self, mock_coll):
        coll = MagicMock()
        mock_coll.return_value = coll
        photos = [("image/jpeg", b"a"), ("image/png", b"b")]

        ids = save_photos(inbody_id="ib-1", customer_id="Nguyen Van A", photos=photos)

        assert len(ids) == 2 and len(set(ids)) == 2
        docs = coll.insert_many.call_args[0][0]
        assert [d["id"] for d in docs] == ids
        assert [d["content_type"] for d in docs] == ["image/jpeg", "image/png"]
        assert all(d["inbody_id"] == "ib-1" and d["customer_id"] == "Nguyen Van A" for d in docs)
        assert bytes(docs[1]["data"]) == b"b"

    @patch("src.services.inbody_photo_service.inbody_photos_collection")
    def test_save_nothing_skips_db(self, mock_coll):
        assert save_photos(inbody_id="ib-1", customer_id="A", photos=[]) == []
        mock_coll.assert_not_called()

    @patch("src.services.inbody_photo_service.inbody_photos_collection")
    def test_get_photo_returns_bytes_or_none(self, mock_coll):
        coll = MagicMock()
        mock_coll.return_value = coll
        coll.find_one.return_value = {"content_type": "image/webp", "data": b"img"}
        assert get_photo("p1") == ("image/webp", b"img")

        coll.find_one.return_value = None
        assert get_photo("missing") is None


class TestPhotoUrls:
    def test_maps_ids_to_urls(self):
        assert photo_urls(["a", "b"]) == ["/api/v1/inbody/photos/a", "/api/v1/inbody/photos/b"]

    def test_handles_missing_field_on_legacy_records(self):
        assert photo_urls(None) == []
        assert photo_urls(["", "x"]) == ["/api/v1/inbody/photos/x"]
