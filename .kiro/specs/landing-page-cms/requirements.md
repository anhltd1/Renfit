# Requirements Document

## Introduction

This feature converts the Renfit landing page from hardcoded TSX content to a dynamic, admin-editable CMS. A new "Chỉnh sửa trang chủ" tab in the admin dashboard gives trainers a form-based editor for all landing page content — text, images, addresses, phone numbers, social links, icons, and list items. The system uses a draft/preview/publish workflow backed by a MongoDB singleton document, ensuring live visitors always see the last-published version while the admin freely edits a draft copy.

## Glossary

- **Landing_Page**: The public marketing page at `/`, composed of Hero, About, Services, AI Coach, Trainers, Closing CTA, and Footer sections.
- **Site_Content_API**: The set of backend REST endpoints under `/api/v1/site-content` (public) and `/api/v1/admin/site-content` (trainer-only) that serve and mutate the landing page content document.
- **Content_Document**: A singleton MongoDB document in the `SiteContent` collection that stores the complete landing page content tree.
- **Draft_Version**: The working copy of the Content_Document that the admin edits; not visible to public visitors until published.
- **Published_Version**: The live copy of the Content_Document served to the Landing_Page.
- **CMS_Editor**: The admin UI tab ("Chỉnh sửa trang chủ") that renders a form-based editor for all 10 content groups.
- **Icon_Picker**: A dropdown component that displays a curated allowlist of ~24 fitness-relevant lucide-react icons with visual preview, plus a "none" option.
- **Image_Input**: A dual-mode input component that supports both pasting a URL and uploading a file (compressed to base64), following the existing AvatarUpload pattern.
- **Content_Group**: One of the 10 logical groupings of landing page fields (Brand, Hero, About, Services, AI Coach, Trainers, Closing CTA, Contact Info, Social Media, Footer & Navigation).
- **Admin_Dashboard**: The trainer's authenticated management interface, accessible at `/admin/dashboard`, with a tab-based navigation system (desktop: header tabs; mobile: bottom tab bar).

## Requirements

### Requirement 1: Content Storage

**User Story:** As a trainer, I want landing page content stored in a database, so that I can edit it without code deployments.

#### Acceptance Criteria

1. THE Site_Content_API SHALL store the Content_Document as a singleton document in the `SiteContent` MongoDB collection with a fixed identifier.
2. THE Content_Document SHALL contain two top-level versions: `draft` and `published`, each holding the full content tree for all 10 Content_Groups.
3. WHEN no Content_Document exists in the database, THE Site_Content_API SHALL seed it from the current hardcoded values on first access, producing a document where `draft` and `published` are identical.
4. THE Content_Document SHALL define the following Content_Groups: Brand, Hero, About, Services, AI Coach (ai_coach), Trainers, Closing CTA (closing_cta), Contact Info (contact), Social Media (social), Footer & Navigation (footer).
5. WHEN a list field (services, trainers, stats, chat messages, about features) is stored, THE Content_Document SHALL preserve item ordering as an array.

### Requirement 2: Public Content Retrieval

**User Story:** As a visitor, I want the landing page to load dynamic content, so that I see the latest published information.

#### Acceptance Criteria

1. THE Site_Content_API SHALL expose `GET /api/v1/site-content` as a public endpoint (no authentication required) that returns the Published_Version of the Content_Document.
2. WHEN the `GET /api/v1/site-content` endpoint is called and no Content_Document exists, THE Site_Content_API SHALL return the seeded default content (equivalent to today's hardcoded values).
3. THE Landing_Page SHALL fetch content from `GET /api/v1/site-content` on mount and render all sections using the returned data.
4. IF the `GET /api/v1/site-content` request fails or returns an empty response, THEN THE Landing_Page SHALL fall back to rendering the current hardcoded default values.

### Requirement 3: Draft Management

**User Story:** As a trainer, I want to edit a draft copy of the content without affecting the live page, so that I can prepare changes before making them public.

#### Acceptance Criteria

1. THE Site_Content_API SHALL expose `GET /api/v1/admin/site-content/draft` (trainer-only) that returns the Draft_Version of the Content_Document.
2. THE Site_Content_API SHALL expose `PUT /api/v1/admin/site-content/draft` (trainer-only) that replaces the Draft_Version with the provided content payload.
3. WHEN `PUT /api/v1/admin/site-content/draft` is called, THE Site_Content_API SHALL validate that all required fields are present and return a 422 error with a Vietnamese message for any missing required field.
4. WHEN `PUT /api/v1/admin/site-content/draft` succeeds, THE Site_Content_API SHALL return the saved Draft_Version and a timestamp of the save.
5. THE Site_Content_API SHALL NOT modify the Published_Version when the Draft_Version is saved.

### Requirement 4: Publishing

**User Story:** As a trainer, I want to explicitly publish my draft to make it live, so that I control exactly when changes become visible to visitors.

#### Acceptance Criteria

1. THE Site_Content_API SHALL expose `POST /api/v1/admin/site-content/publish` (trainer-only) that copies the current Draft_Version into the Published_Version.
2. WHEN the publish endpoint succeeds, THE Site_Content_API SHALL return a success response with the publish timestamp.
3. WHEN the publish endpoint is called, THE Site_Content_API SHALL record the `published_at` timestamp and the `published_by` trainer ID on the Content_Document.

### Requirement 5: Admin Editor Tab — Desktop

**User Story:** As a trainer using the desktop dashboard, I want a "Chỉnh sửa trang chủ" tab, so that I can access the landing page editor from my management interface.

#### Acceptance Criteria

1. THE Admin_Dashboard (desktop) SHALL include a new tab labeled "Trang chủ" with a layout icon in the header tab group, alongside the existing "Hôm nay", "Hội viên", and "Lịch đặt" tabs.
2. WHEN the "Trang chủ" tab is active, THE Admin_Dashboard SHALL render the CMS_Editor component in the main content area.
3. THE CMS_Editor SHALL load the Draft_Version on mount and populate all form fields with the draft data.
4. THE CMS_Editor SHALL organize fields into collapsible sections corresponding to the 10 Content_Groups.

### Requirement 6: Admin Editor Tab — Mobile

**User Story:** As a trainer using the mobile dashboard, I want a "Trang chủ" tab in the bottom tab bar, so that I can edit landing page content from my phone.

#### Acceptance Criteria

1. THE Admin_Dashboard (mobile) SHALL include a new tab labeled "Trang chủ" with a layout icon in the bottom tab bar, alongside the existing "Hôm nay", "Hội viên", and "Lịch đặt" tabs.
2. WHEN the "Trang chủ" tab is active, THE Admin_Dashboard SHALL render the CMS_Editor component adapted to the mobile viewport (full-width, vertically scrollable form groups).
3. THE CMS_Editor on mobile SHALL present the same Content_Groups as the desktop version with identical data and behavior.

### Requirement 7: Text and URL Field Editing

**User Story:** As a trainer, I want appropriate input types for each field, so that editing content is intuitive and errors are minimized.

#### Acceptance Criteria

1. THE CMS_Editor SHALL render single-line text inputs for short fields (titles, labels, names, specialties, certifications, badge text, button labels).
2. THE CMS_Editor SHALL render multi-line textarea inputs for long fields (descriptions, subtitles, opening hours).
3. THE CMS_Editor SHALL render URL-typed inputs for link fields (social media URLs) with placeholder examples.
4. THE CMS_Editor SHALL render tel-typed inputs for phone number fields.
5. THE CMS_Editor SHALL render email-typed inputs for email address fields.

### Requirement 8: Image Editing

**User Story:** As a trainer, I want to change images by uploading a file or pasting a URL, so that I have flexibility in how I provide new imagery.

#### Acceptance Criteria

1. THE Image_Input SHALL provide two modes: (a) paste/type a URL, and (b) select a file from the device.
2. WHEN a file is selected, THE Image_Input SHALL compress the image to base64 (using the existing `compressImageToBase64` utility with a maximum dimension of 800px for content images) and store the result as the field value.
3. WHEN a URL is provided, THE Image_Input SHALL store the URL string directly as the field value.
4. THE Image_Input SHALL display a thumbnail preview of the current image (whether base64 or URL) below the input.
5. THE Image_Input SHALL allow clearing the current image value.

### Requirement 9: Icon Selection

**User Story:** As a trainer, I want to pick icons from a visual dropdown, so that I can assign recognizable icons to services and features without knowing icon names.

#### Acceptance Criteria

1. THE Icon_Picker SHALL display a dropdown containing ~24 curated fitness-relevant lucide-react icons shown as rendered icon previews with their Vietnamese display names.
2. THE Icon_Picker SHALL include a "Không có icon" (no icon) option as the first item.
3. WHEN an icon is selected, THE Icon_Picker SHALL store the icon's string identifier (the lucide-react export name, e.g. "Dumbbell", "Bot", "Apple").
4. THE Icon_Picker SHALL show the currently selected icon inline in the trigger button.
5. THE curated icon allowlist SHALL include at minimum: Dumbbell, Bot, Apple, TrendingUp, Scale, Flame, Heart, Target, Zap, Award, Users, Star, Activity, Bike, Timer, Mountain, Salad, Footprints, Brain, Shield, Gauge, Waves, Sunrise, Leaf.

### Requirement 10: List Field Management

**User Story:** As a trainer, I want to add, remove, and reorder list items (services, trainers, chat messages, stats, about features), so that I can customize the quantity and order of repeating content.

#### Acceptance Criteria

1. THE CMS_Editor SHALL render list fields (services, trainers, stat cards, sample chat messages, about feature cards) as an ordered list of item editors.
2. WHEN the "Thêm" (add) button is clicked on a list field, THE CMS_Editor SHALL append a new empty item at the end of the list.
3. WHEN the "Xoá" (remove) button is clicked on a list item, THE CMS_Editor SHALL remove that item from the list after a confirmation prompt.
4. THE CMS_Editor SHALL provide drag handles or up/down arrow buttons to reorder list items.
5. WHILE a list field has zero items, THE CMS_Editor SHALL display a placeholder message and the add button.

### Requirement 11: Draft/Preview/Publish Workflow

**User Story:** As a trainer, I want to save drafts, preview changes, and explicitly publish, so that I can review my edits before they go live.

#### Acceptance Criteria

1. THE CMS_Editor SHALL provide a "Lưu nháp" (save draft) button that persists the current form state to the Draft_Version via `PUT /api/v1/admin/site-content/draft`.
2. THE CMS_Editor SHALL provide a "Xem trước" (preview) button that opens the landing page rendered with the current draft content in a new browser tab.
3. THE CMS_Editor SHALL provide a "Xuất bản" (publish) button that triggers `POST /api/v1/admin/site-content/publish`.
4. WHEN the "Xuất bản" button is clicked, THE CMS_Editor SHALL display a confirmation dialog (Vietnamese text) before executing the publish action.
5. THE CMS_Editor SHALL display a visual indicator (badge or dot) when the Draft_Version differs from the Published_Version (unsaved/unpublished changes exist).
6. WHEN a save or publish action succeeds, THE CMS_Editor SHALL display a success toast notification.
7. IF a save or publish action fails, THEN THE CMS_Editor SHALL display an error toast notification with the error message.

### Requirement 12: Preview Rendering

**User Story:** As a trainer, I want to see exactly how my draft content will look on the live landing page, so that I can verify the appearance before publishing.

#### Acceptance Criteria

1. WHEN the preview is opened, THE Landing_Page SHALL accept a `?preview=true` query parameter that causes it to fetch from `GET /api/v1/admin/site-content/draft` instead of the public endpoint.
2. WHILE in preview mode, THE Landing_Page SHALL display a fixed banner at the top indicating "Bản xem trước — chưa xuất bản" (Preview — not yet published).
3. THE preview mode SHALL require trainer authentication (same as other admin endpoints) to prevent unauthorized access to draft content.

### Requirement 13: Landing Page Dynamic Rendering

**User Story:** As a visitor, I want the landing page to display the latest published content dynamically, so that I see up-to-date information without page redeployment.

#### Acceptance Criteria

1. THE Landing_Page Hero section SHALL render the headline, description, background image, and stat cards from the Published_Version content.
2. THE Landing_Page Services section SHALL render the list of services (icon, title, description) from the Published_Version content, supporting a variable number of items.
3. THE Landing_Page Trainers section SHALL render the list of trainers (image, name, specialty, experience, certifications) from the Published_Version content, supporting a variable number of items.
4. THE Landing_Page AI Coach section SHALL render the badge text, titles, and sample chat messages from the Published_Version content.
5. THE Landing_Page Footer section SHALL render contact info (address, phone, email, hours), social media links, brand description, copyright, and navigation labels from the Published_Version content.
6. THE Landing_Page Closing CTA section SHALL render titles, subtitle, and button labels from the Published_Version content.
7. WHEN an icon field references a lucide-react icon name, THE Landing_Page SHALL resolve and render the corresponding icon component from the curated allowlist; IF the name is unrecognized or empty, THEN THE Landing_Page SHALL render no icon.

### Requirement 14: Image Upload API

**User Story:** As a trainer, I want to upload images through the admin interface, so that I can use my own photos for the landing page.

#### Acceptance Criteria

1. THE Site_Content_API SHALL expose `POST /api/v1/admin/site-content/upload-image` (trainer-only) that accepts a base64-encoded image in the request body.
2. WHEN an image is uploaded, THE Site_Content_API SHALL store the base64 string in the Content_Document or return a reference path usable in image fields.
3. IF the uploaded image exceeds 2MB after base64 encoding, THEN THE Site_Content_API SHALL return a 413 error with a Vietnamese message.
4. THE Site_Content_API SHALL accept image formats: JPEG, PNG, and WebP.

### Requirement 15: Graceful Degradation

**User Story:** As a visitor, I want the landing page to always render correctly even if the backend is unreachable, so that I never see a broken page.

#### Acceptance Criteria

1. IF the `GET /api/v1/site-content` request times out after 5 seconds, THEN THE Landing_Page SHALL render using the hardcoded default values.
2. IF the `GET /api/v1/site-content` response has an unexpected shape or missing fields, THEN THE Landing_Page SHALL merge the response with hardcoded defaults, using defaults for any missing field.
3. THE Landing_Page SHALL render the initial HTML with hardcoded defaults immediately (no loading spinner visible to the user) and update in place once dynamic content loads.
