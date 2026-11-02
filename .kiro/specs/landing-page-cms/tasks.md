# Implementation Plan: Landing Page CMS

## Overview

Convert the Renfit landing page from hardcoded TSX to a dynamic, admin-editable CMS. The implementation follows a bottom-up approach: backend data layer first, then frontend infrastructure, CMS editor components, admin integration, and finally the dynamic landing page refactor.

## Tasks

- [ ] 1. Backend foundation — Schema, service, and router
  - [ ] 1.1 Create MongoDB schema and collection accessor
    - Create `backend/src/schema/site_content.py` with all Pydantic models (SiteContentTree, SiteContentDocument, and all nested content group models)
    - Add `SITE_CONTENT = "SiteContent"` to `backend/src/schema/collections.py`
    - Add `site_content_collection()` accessor to `backend/src/db/mongo.py`
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [ ] 1.2 Create default content seed data
    - Create a module/function that produces the default `SiteContentTree` from current hardcoded landing page values
    - Ensure both `draft` and `published` are identical when seeded
    - Include all 10 content groups with their current hardcoded values from the existing landing page components
    - _Requirements: 1.3_

  - [ ] 1.3 Implement SiteContentService
    - Create `backend/src/services/site_content_service.py` with methods: `get_published()`, `get_draft()`, `save_draft(content, trainer_id)`, `publish(trainer_id)`, `upload_image(base64_data, format)`, `_seed_default()`, `_validate_content(content)`
    - `get_published()` / `get_draft()`: return respective version; auto-seed if document missing
    - `save_draft()`: validate required fields → return 422 with Vietnamese message if missing; save draft without touching published; record `draft_updated_at` and `draft_updated_by`
    - `publish()`: atomically copy `draft` → `published`; record `published_at` and `published_by`
    - `upload_image()`: validate format (JPEG/PNG/WebP), reject >2MB with 413, store/return base64 reference
    - _Requirements: 1.1, 1.3, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 14.1, 14.2, 14.3, 14.4_

  - [ ] 1.4 Create API router and register it
    - Create `backend/src/api/site_content.py` with endpoints:
      - `GET /api/v1/site-content` (public, no auth) → returns published content
      - `GET /api/v1/admin/site-content/draft` (trainer-only via `_require_admin`) → returns draft
      - `PUT /api/v1/admin/site-content/draft` (trainer-only) → saves draft, returns saved draft + timestamp
      - `POST /api/v1/admin/site-content/publish` (trainer-only) → copies draft to published, returns publish timestamp
      - `POST /api/v1/admin/site-content/upload-image` (trainer-only) → accepts base64 image, validates, stores
    - Register the router in `backend/src/main.py`
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 14.1, 14.2, 14.3, 14.4_

  - [ ]* 1.5 Write backend unit tests
    - Create `backend/test/test_site_content.py`
    - Test seeding logic produces correct default document with all 10 groups
    - Test validation catches missing required fields for each content group (Vietnamese error messages)
    - Test publish copies draft → published atomically
    - Test draft save does not modify published
    - Test image upload rejects >2MB with 413
    - Test image upload rejects unsupported formats with 422
    - Test public endpoint returns seeded defaults when no document exists
    - _Requirements: 1.2, 1.3, 1.4, 3.3, 3.5, 4.1, 14.3, 14.4_

  - [ ]* 1.6 Write backend property tests (Hypothesis)
    - **Property 1: Content Document schema completeness** — generated content trees always have all 10 groups
    - **Validates: Requirements 1.2, 1.4**
    - **Property 2: List ordering round-trip** — list items stored and retrieved in same order
    - **Validates: Requirements 1.5**
    - **Property 3: Draft validation rejects incomplete payloads** — remove random required fields → 422
    - **Validates: Requirements 3.3**
    - **Property 4: Draft/Published isolation** — saving draft never changes published
    - **Validates: Requirements 3.5**
    - **Property 5: Publish produces published === draft** — after publish, public endpoint returns draft content
    - **Validates: Requirements 4.1**

- [ ] 2. Checkpoint — Backend foundation
  - Ensure all backend tests pass, ask the user if questions arise.

- [ ] 3. Frontend infrastructure — API client and icon system
  - [ ] 3.1 Create frontend API client
    - Create `frontend/src/lib/api/siteContent.ts` with typed fetch wrappers:
      - `getPublishedContent(): Promise<SiteContentTree>` → `GET /api/v1/site-content`
      - `getDraftContent(): Promise<SiteContentTree>` → `GET /api/v1/admin/site-content/draft`
      - `saveDraft(content: SiteContentTree): Promise<SaveDraftResponse>` → `PUT /api/v1/admin/site-content/draft`
      - `publishContent(): Promise<PublishResponse>` → `POST /api/v1/admin/site-content/publish`
      - `uploadImage(base64: string, format: string): Promise<UploadImageResponse>` → `POST /api/v1/admin/site-content/upload-image`
    - Define all TypeScript interfaces (SiteContentTree, BrandContent, HeroContent, etc.)
    - _Requirements: 2.1, 3.1, 3.2, 4.1, 14.1_

  - [ ] 3.2 Create icon allowlist and resolver
    - Create `frontend/src/lib/icons/iconAllowlist.ts` with:
      - `ICON_ALLOWLIST` array of 24 icons with `name`, `icon` (LucideIcon component), and `label` (Vietnamese)
      - `ICON_MAP` record for O(1) lookup by name
      - `resolveIcon(name)` function returning LucideIcon | null
    - Include all 24 icons specified in Requirement 9.5
    - _Requirements: 9.1, 9.3, 9.5, 13.7_

  - [ ]* 3.3 Write property test for icon resolver
    - **Property 7: Icon resolver correctness** — allowlist names → non-null component, non-allowlist strings → null
    - **Validates: Requirements 9.3, 13.7**

- [ ] 4. CMS building blocks — Reusable editor components
  - [ ] 4.1 Create ImageInput component
    - Create `frontend/src/app/shared/components/ImageInput.tsx`
    - Two modes: (a) paste/type URL, (b) select file from device
    - File mode: compress using existing `compressImageToBase64` utility (max 800px)
    - Display thumbnail preview below input (both base64 and URL)
    - Include clear button to reset value
    - Follow existing AvatarUpload pattern for file handling
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 4.2 Create IconPicker component
    - Create `frontend/src/app/shared/components/IconPicker.tsx`
    - Dropdown displaying ~24 curated icons as rendered previews with Vietnamese labels
    - First option: "Không có icon" (no icon / empty value)
    - Selection stores the icon string identifier (e.g. "Dumbbell")
    - Trigger button shows currently selected icon inline
    - Uses `ICON_ALLOWLIST` from the icon module
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 4.3 Create ListFieldEditor component
    - Create `frontend/src/app/shared/components/ListFieldEditor.tsx`
    - Generic ordered list editor (typed via generics for different item shapes)
    - "Thêm" button appends empty item at end
    - "Xoá" button with confirmation prompt removes item
    - Up/down arrow buttons (or drag handles) for reorder
    - Placeholder message + add button when list is empty
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 4.4 Create ContentGroupSection and CmsActionBar components
    - Create `frontend/src/app/shared/components/ContentGroupSection.tsx` — collapsible section wrapper for each content group with title/icon
    - Create `frontend/src/app/shared/components/CmsActionBar.tsx` — action bar with:
      - "Lưu nháp" (save draft) button
      - "Xem trước" (preview) button — opens landing page with `?preview=true` in new tab
      - "Xuất bản" (publish) button — with confirmation dialog (Vietnamese text)
      - Visual dirty indicator (badge/dot) when draft differs from published
    - _Requirements: 5.4, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 4.5 Write unit tests for CMS building blocks
    - `ImageInput.test.tsx` — URL mode stores URL, file mode triggers compression, clear works, preview renders
    - `IconPicker.test.tsx` — renders allowlist, selection stores name, "Không có icon" option works
    - `ListFieldEditor.test.tsx` — add/remove/reorder operations produce correct list states
    - _Requirements: 8.1–8.5, 9.1–9.4, 10.1–10.5_

  - [ ]* 4.6 Write property tests for list management
    - **Property 6: List management preserves data integrity** — add/remove/reorder sequences maintain all items without loss or duplication
    - **Validates: Requirements 10.2, 10.3, 10.4**

- [ ] 5. Checkpoint — CMS components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. CMS assembly and admin integration
  - [ ] 6.1 Create useCmsEditor hook
    - Create `frontend/src/app/shared/hooks/useCmsEditor.ts`
    - Load draft on mount, expose form state for all 10 content groups
    - `saveDraft()` — persists form state via PUT endpoint, shows success/error toast
    - `publish()` — calls POST endpoint, shows success/error toast
    - `isDirty` — computed by comparing current form state to last-published content
    - Error handling: error toast with API message or fallback Vietnamese message
    - _Requirements: 3.1, 3.2, 5.3, 11.1, 11.3, 11.5, 11.6, 11.7_

  - [ ] 6.2 Create CmsEditor main component
    - Create `frontend/src/app/shared/components/CmsEditor.tsx`
    - Renders 10 collapsible `ContentGroupSection`s, each containing appropriate field editors:
      - Brand: text inputs (name, tagline), ImageInput (logo)
      - Hero: text inputs (headline lines, description), ImageInput (background), ListFieldEditor (stats with IconPicker)
      - About: text inputs (title, subtitle), ImageInput (main image), text inputs (image title/desc), ListFieldEditor (features with IconPicker)
      - Services: text inputs (title, subtitle), ListFieldEditor (items with IconPicker)
      - AI Coach: text inputs (badge, title, subtitle), ListFieldEditor (messages with type selector)
      - Trainers: text inputs (title, subtitle), ListFieldEditor (items with ImageInput)
      - Closing CTA: text inputs (title, subtitle, button labels)
      - Contact: text input (address), tel input (phone), email input, textarea (hours)
      - Social: URL inputs (facebook, instagram, youtube)
      - Footer: textarea (brand description), text inputs (copyright, nav labels)
    - Integrates `CmsActionBar` at top/bottom
    - Uses `useCmsEditor` hook for all state management
    - _Requirements: 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [ ] 6.3 Integrate CMS tab into desktop admin dashboard
    - Modify `frontend/src/app/desktop/components/DesktopAdminHeader.tsx`: add `'cms'` to the view type union, add "Trang chủ" tab button with Layout icon
    - Modify `frontend/src/app/desktop/pages/AdminDashboardPage.tsx`: add `view === 'cms'` branch that renders `<CmsEditor />`
    - _Requirements: 5.1, 5.2_

  - [ ] 6.4 Integrate CMS tab into mobile admin dashboard
    - Modify `frontend/src/app/mobile/shell/AdminBottomTabBar.tsx`: add `'cms'` to `AdminMobileTabKey`, add tab entry with Layout icon and "Trang chủ" label
    - Modify `frontend/src/app/mobile/pages/AdminDashboardPage.tsx`: add `activeTab === 'cms'` branch that renders `<CmsEditor />`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 6.5 Write CMS editor tests
    - `CmsEditor.test.tsx` — loads draft on mount, renders 10 collapsible sections, save calls API, publish calls API with confirmation
    - `useCmsEditor.test.ts` — draft loading, save/publish success/error flows, dirty state detection
    - _Requirements: 5.2, 5.3, 5.4, 11.1–11.7_

  - [ ]* 6.6 Write property test for dirty state detection
    - **Property 10: Dirty state detection** — differs iff at least one primitive field differs; deeply equal trees → false
    - **Validates: Requirements 11.5**

- [ ] 7. Checkpoint — CMS integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Dynamic landing page
  - [ ] 8.1 Create useSiteContent hook with defaults merge
    - Create `frontend/src/app/shared/hooks/useSiteContent.ts`
    - Fetch from `GET /api/v1/site-content` on mount (or from draft endpoint if `?preview=true` and authenticated)
    - 5-second timeout; on timeout/error → use hardcoded defaults
    - Deep-merge partial response with hardcoded defaults (field-level granularity)
    - Return merged content immediately (render defaults first, update when data arrives — no spinner)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 12.1, 15.1, 15.2, 15.3_

  - [ ] 8.2 Refactor landing page sections to accept content props
    - Modify `Hero.tsx` — accept `HeroContent` + `BrandContent` props, render from props instead of hardcoded data
    - Modify `About.tsx` — accept `AboutContent` props
    - Modify `Services.tsx` — accept `ServicesContent` props, render variable number of items, resolve icons via `resolveIcon()`
    - Modify `AIChat.tsx` — accept `AiCoachContent` props
    - Modify `Trainers.tsx` — accept `TrainersContent` props, render variable number of items
    - Modify `landing/ClosingCTA.tsx` — accept `ClosingCtaContent` props
    - Modify `Footer.tsx` — accept `FooterContent` + `ContactContent` + `SocialContent` + `BrandContent` props
    - All sections use `resolveIcon()` for any icon fields; unrecognized/empty → render no icon
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ] 8.3 Wire LandingPage to useSiteContent hook
    - Modify `frontend/src/app/pages/LandingPage.tsx` to call `useSiteContent()` and pass content props to all section components
    - Ensure initial render uses hardcoded defaults (no loading spinner visible)
    - Seamlessly update when dynamic data arrives
    - _Requirements: 2.3, 2.4, 15.3_

  - [ ] 8.4 Implement preview mode with PreviewBanner
    - Create `frontend/src/app/shared/components/PreviewBanner.tsx` — fixed banner showing "Bản xem trước — chưa xuất bản"
    - In `useSiteContent`: detect `?preview=true` query param → fetch from draft endpoint instead (requires trainer auth)
    - In `LandingPage`: render `PreviewBanner` when in preview mode
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 8.5 Write landing page and hook tests
    - `useSiteContent.test.ts` — fetch success, fallback on error/timeout, merge partial response with defaults
    - `PreviewBanner.test.tsx` — renders in preview mode, hidden otherwise
    - Landing page section tests — verify props-based rendering replaces hardcoded data
    - _Requirements: 2.3, 2.4, 12.1, 12.2, 15.1, 15.2, 15.3_

  - [ ]* 8.6 Write property tests for content merge and rendering
    - **Property 9: Content merge with defaults** — any partial/missing API response merged with defaults produces a complete SiteContentTree
    - **Validates: Requirements 2.4, 15.2**
    - **Property 12: Dynamic landing page renders content fields** — rendering with any valid SiteContentTree produces DOM with expected text values
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6**

- [ ] 9. Final checkpoint — Full integration
  - Ensure all backend and frontend tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `compressImageToBase64` utility is reused for image handling (no new image library needed)
- All Vietnamese text is specified inline in the task descriptions — no localization layer needed
- Backend follows existing pattern: thin router → service → PyMongo
- Frontend follows existing pattern: shared components, device-split shell, hooks for data

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "3.2"] },
    { "id": 2, "tasks": ["1.3", "3.1", "3.3"] },
    { "id": 3, "tasks": ["1.4", "4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["1.5", "1.6", "4.4"] },
    { "id": 5, "tasks": ["4.5", "4.6", "6.1"] },
    { "id": 6, "tasks": ["6.2"] },
    { "id": 7, "tasks": ["6.3", "6.4"] },
    { "id": 8, "tasks": ["6.5", "6.6", "8.1"] },
    { "id": 9, "tasks": ["8.2"] },
    { "id": 10, "tasks": ["8.3", "8.4"] },
    { "id": 11, "tasks": ["8.5", "8.6"] }
  ]
}
```
