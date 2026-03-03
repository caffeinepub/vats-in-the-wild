# Vats in the Wild

## Current State
Full personal website with 6 section pages (International Relations, Forest & Field Notes, Beyond Cutoff, Wild Within, Personal Essays, About), article detail view, reading list, newsletter signup, homepage with hero/featured sections. Backend has full CRUD for posts, quotes, reading recommendations, and newsletter subscribers. No authentication or admin panel exists — content can only be changed via the backend directly.

## Requested Changes (Diff)

### Add
- `/admin` route — password-protected admin panel (simple hardcoded password gate, no external auth)
- Admin Dashboard: stats overview (total posts, drafts, categories breakdown, subscriber count)
- Article Manager: list all posts with status (draft/published), create new post, edit existing post, delete post, toggle draft/featured
- Post Editor: form with fields for title, slug (auto-generated from title), excerpt, body (textarea), category dropdown, subcategory, tags (comma-separated input), featured image URL, reading time, meta description, draft toggle, featured toggle
- Quote Manager: view current active quote, set a new active quote (text + author)
- Reading Recommendations Manager: list, add, edit, delete recommendations
- Subscriber List: read-only view of newsletter subscribers
- Admin nav sidebar/tabs to switch between sections
- Simple password gate component (hardcoded password stored in frontend config, no backend auth required)

### Modify
- `App.tsx`: add `/admin` route pointing to AdminPage, layout for admin should NOT include Navbar/Footer (standalone layout)

### Remove
- Nothing removed

## Implementation Plan
1. Create `AdminPage.tsx` as a standalone page (no Navbar/Footer wrapper)
2. Create `AdminPasswordGate.tsx` — simple password form, stores auth state in sessionStorage
3. Create `AdminDashboard.tsx` — stats cards (post count, draft count, subscriber count)
4. Create `AdminArticles.tsx` — table of all posts with actions (edit, delete, toggle draft, toggle featured), plus "New Post" button
5. Create `AdminPostEditor.tsx` — full post create/edit form with all fields, auto-slug from title
6. Create `AdminQuotes.tsx` — show active quote, form to set new quote
7. Create `AdminRecommendations.tsx` — list + add/edit/delete recommendations form
8. Create `AdminSubscribers.tsx` — read-only subscriber list
9. Wire admin route in `App.tsx` with a separate root layout (no Navbar/Footer)
10. Admin password: "vatswild2024" stored as a constant in the admin component
