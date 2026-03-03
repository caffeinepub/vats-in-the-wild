# Vats in the Wild

## Current State

- Full-stack personal website with Motoko backend and React frontend
- Admin panel at `/admin` with password `vatswild2024`
- Admin panel manages: articles (CRUD), quotes, reading list, subscribers
- About page (`AboutPage.tsx`) has hardcoded portrait image, bio text, values, and contact info
- Articles support a `featuredImage` field that only accepts a URL string (no upload)
- No file upload capability anywhere in the app
- No blob storage component selected

## Requested Changes (Diff)

### Add
- **About Section Editor in Admin**: A new "About" tab in the admin sidebar where admin can edit:
  - Portrait photo (upload an image directly, stored via blob-storage)
  - Bio paragraphs (Forest Service & Career, Academic Background, Geopolitics & Strategy, Personal Philosophy) — editable rich text areas
  - Contact email
  - Social links (LinkedIn, Twitter/X, Instagram)
- **Media Library in Admin**: A new "Media" tab in the admin sidebar where admin can:
  - Upload images (JPG, PNG, WebP, GIF) and PDFs
  - See a grid/list of all uploaded files with thumbnail preview, filename, type, size
  - Copy the file URL to clipboard
  - Delete uploaded files
- **Image/PDF Upload in Article Form**: Replace the plain "Featured Image URL" text input with an upload button that allows picking an image file; also add an "Attachments" section in the article form to upload PDFs or additional images that get embedded as links in content
- **File upload in Section pages**: Public section pages (Forest & Field Notes, Wild Within, etc.) display uploaded images and PDFs linked from articles

### Modify
- Backend (`main.mo`): Add `AboutContent` type and storage; add `getAboutContent` query and `setAboutContent` update; add `MediaFile` type with id, url, filename, mimeType, size, uploadedAt fields; add `addMediaFile`, `deleteMediaFile`, `listMediaFiles` operations
- `backend.d.ts`: Add corresponding TypeScript types and interface methods
- `AdminPage.tsx`: Add "About" and "Media" tabs to sidebar nav; add `AboutSection` component; add `MediaSection` component; update `PostForm` to include image upload button for featuredImage field and attachments list
- `AboutPage.tsx`: Fetch `aboutContent` from backend and render dynamically; fall back to hardcoded defaults if not set
- `useAdminQueries.ts`: Add hooks for about content and media files
- Sidebar type: extend `AdminTab` union to include `"about"` and `"media"`

### Remove
- Nothing removed

## Implementation Plan

1. Select `blob-storage` component
2. Generate updated Motoko backend with `AboutContent` and `MediaFile` types and their CRUD operations
3. Update `backend.d.ts` with new types and interface methods
4. Add hooks in `useAdminQueries.ts`: `useAboutContent`, `useSetAboutContent`, `useMediaFiles`, `useAddMediaFile`, `useDeleteMediaFile`
5. Update `AdminPage.tsx`:
   - Add `"about"` and `"media"` to `AdminTab` type and `navItems` array
   - Add `AboutSection` component: portrait upload (blob-storage), editable bio fields (textarea per section), contact/social fields, save button
   - Add `MediaSection` component: drag-and-drop or click-to-upload for images/PDFs, file grid with preview thumbnail, copy URL, delete
   - Update `PostForm`: replace featuredImage URL input with "Upload Image" button using blob-storage; add "Attachments" section for additional PDF/image uploads
6. Update `AboutPage.tsx` to fetch and render dynamic about content from backend, falling back to static defaults
7. Build and validate
