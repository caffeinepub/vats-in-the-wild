# Vats in the Wild

## Current State

The site has a full admin panel at `/admin` with the following sections:
- Dashboard (stats)
- Customizer (typography, colors, layout, hero text, sections grid text, about preview text, footer/navbar text)
- Articles (full CRUD)
- Quotes
- Reading List
- About Page (bio sections, portrait URL, social links)
- Media Library (file upload/management)
- Subscribers

The Customizer already allows editing fonts, colors, layout, hero text, section card titles/descriptions, about preview text, footer text, and social links. These settings are stored in `SiteSettings` on the backend.

**What is NOT yet supported:**
- Per-page background images (homepage, each section page header, about page, etc.) — currently hardcoded image paths
- Per-section card images in the homepage sections grid — hardcoded to static generated files
- Adding new custom sections (the section grid is fixed to exactly 5 sections)
- Section page hero backgrounds are hardcoded in each page component

## Requested Changes (Diff)

### Add

1. **Background Images tab in Customizer** — a new tab "Backgrounds" inside the Customizer that lets admin:
   - Upload or paste a URL for the hero/background image of each page: Homepage Hero, International Relations page header, Forest & Field Notes header, Beyond Cutoff header, Wild Within header, Personal Essays header, About page header
   - Upload or paste URL for each of the 5 section card images in the homepage sections grid
   - Each image field has: file upload button (reusing the existing blob storage upload pattern), URL input field, and a thumbnail preview
   - All stored in `SiteSettings` as new string fields (e.g. `heroBackgroundImage`, `section1Image`, `section2Image` ... `section5Image`, `irPageBg`, `forestPageBg`, `upscPageBg`, `wildPageBg`, `essaysPageBg`, `aboutPageBg`)

2. **Dynamic sections management** — expand SiteSettings to support up to 8 sections (add `section6*`, `section7*`, `section8*` fields). In the admin Sections Grid tab, add "Add Section" / "Remove Section" buttons to toggle sections 6-8 on/off with a `sectionCount` field (default 5, max 8). The homepage sections grid renders only the active sections.

3. **Section page title/description/subcategories editable from admin** — add fields for each section page's hero title, subtitle/description, and label to the Sections Grid tab (these are currently hardcoded in the individual page components). Store as `irTitle`, `irDescription`, `irLabel`, `forestTitle`, `forestDescription`, `forestLabel`, etc. in SiteSettings.

4. **Newsletter section text editable** — add "Newsletter" to the Customizer with fields for the newsletter section title, subtitle, and placeholder text. Store as `newsletterTitle`, `newsletterSubtitle`, `newsletterPlaceholder` in SiteSettings.

5. **Latest Articles section heading editable** — add fields `latestArticlesLabel` and `latestArticlesTitle` to SiteSettings and a small field group in the Hero/Content tab.

### Modify

1. **SiteSettings type** — add new fields in both `main.mo` (Motoko backend) and `backend.d.ts`:
   - Background image fields: `heroBackgroundImage`, `section1Image` through `section8Image`, `irPageBg`, `forestPageBg`, `upscPageBg`, `wildPageBg`, `essaysPageBg`, `aboutPageBg`
   - Dynamic section count: `sectionCount` (stored as string, parsed to number)
   - Section 6-8 fields: `section6Title/Description/Label`, `section7Title/Description/Label`, `section8Title/Description/Label`
   - Per-page hero fields: `irTitle`, `irDescription`, `irLabel`, `forestTitle`, `forestDescription`, `forestLabel`, `upscTitle`, `upscDescription`, `upscLabel`, `wildTitle`, `wildDescription`, `wildLabel`, `essaysTitle`, `essaysDescription`, `essaysLabel`, `aboutPageTitle`, `aboutPageSubtitle`
   - Newsletter text: `newsletterTitle`, `newsletterSubtitle`, `newsletterPlaceholder`
   - Latest articles text: `latestArticlesLabel`, `latestArticlesTitle`

2. **AdminCustomizerSection.tsx** — add a new "Backgrounds" tab, expand the Sections Grid tab with Add/Remove section controls and page-hero fields, add a Newsletter tab, add latest articles fields to the Hero tab.

3. **useSiteSettings.ts `DEFAULT_SETTINGS`** — add defaults for all new fields.

4. **HomePage.tsx** — read `heroBackgroundImage` from settings instead of hardcoded path; read section card images from settings (`section1Image`...`section8Image`); render `sectionCount` sections instead of fixed 5; read newsletter and latest articles text from settings.

5. **SectionListPage.tsx** — accept optional `backgroundImage` override from settings, so section pages can use admin-set backgrounds.

6. **InternationalRelationsPage, ForestFieldNotesPage, BeyondCutoffPage, WildWithinPage, PersonalEssaysPage** — read their page title/description/label/backgroundImage from `useSiteSettings()` instead of hardcoded values.

7. **AboutPage.tsx** — read background image from settings.

### Remove

- Nothing removed; all existing functionality preserved.

## Implementation Plan

1. Update `main.mo` — add all new fields to the `SiteSettings` type.
2. Update `backend.d.ts` — mirror all new fields.
3. Update `useSiteSettings.ts` — add defaults for all new fields and ensure they get applied where needed (backgrounds via inline style, not CSS vars).
4. Update `AdminCustomizerSection.tsx`:
   - Add image upload helper component (reuse pattern from AdminPage PostImageUpload)
   - Add "Backgrounds" tab with image pickers for hero + all section pages + section card images
   - Expand "Sections Grid" tab with Add/Remove section toggle (6-8) and per-page hero text fields
   - Add "Newsletter" tab with editable text fields
   - Add latest articles text fields to Hero tab
5. Update `HomePage.tsx` — consume new settings fields for background image, dynamic section count, newsletter text, latest articles text.
6. Update each section page (`InternationalRelationsPage`, etc.) — read title/description/label/bg from settings.
7. Update `AboutPage.tsx` — read background from settings.
