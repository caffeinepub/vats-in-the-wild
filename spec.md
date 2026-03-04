# Vats in the Wild

## Current State
- Full personal website with 6 section pages (International Relations, Forest & Field Notes, Beyond Cutoff, Wild Within, Personal Essays, About)
- Admin panel at `/admin` with: Articles CRUD, Quotes, Reading List, About Page editor, Media Library, Subscribers
- Backend stores: posts, quotes, subscribers, recommendations, aboutContent, files
- Design uses OKLCH color tokens, Playfair Display serif font, dark forest theme
- CSS custom properties define all colors in `index.css` (light + dark mode)
- Tailwind config extends with font-display, font-body classes

## Requested Changes (Diff)

### Add
- New "Site Customizer" tab in the admin sidebar — comprehensive visual editor for every aspect of the public site
- **Typography Section**: heading font (Playfair Display, Lora, EB Garamond, Cormorant Garamond, Merriweather), body font (system-ui, Inter, Source Serif Pro, Nunito), base font size slider, heading weight selector, line height slider, letter spacing
- **Color Palette Section**: live color pickers (using OKLCH) for background, foreground, primary (accent), card, muted, border. Preset palette swatches: "Forest Dark" (default), "Midnight Ink", "Warm Parchment", "Stone Grey", "Moss Green"
- **Layout Section**: container max-width slider, section padding (compact/normal/spacious), border radius (sharp/subtle/rounded), navbar height toggle
- **Hero Section Editor**: edit hero title ("Vats in the Wild"), subtitle tagline ("From Forest Lines to Fault Lines."), eyebrow text ("Notes from the Frontier"), hero background overlay opacity slider, CTA button labels
- **Sections Grid Editor**: edit title, description, label for each of the 5 section cards shown on homepage
- **About Preview Editor**: edit the short bio text shown on the homepage about preview, portrait URL, name display, subtitle
- **Footer Editor**: edit footer tagline text, contact email, social links (LinkedIn, Twitter, Instagram), copyright text, footer quote text and attribution
- **Navbar Editor**: edit site title, site subtitle shown in navbar
- All settings stored in backend as a JSON SiteSettings object
- On the public site, all pages/components read from a `useSiteSettings()` hook that loads settings from backend (with localStorage cache + fallback defaults)
- Live preview panel in admin showing approximate rendering of changes

### Modify
- Backend: add `SiteSettings` type and `getSiteSettings` / `setSiteSettings` methods
- `Navbar.tsx`: consume site title and subtitle from `useSiteSettings()`
- `Footer.tsx`: consume footer settings from `useSiteSettings()`
- `HomePage.tsx`: consume hero settings, about preview text, sections grid data, from `useSiteSettings()`
- `index.css`: CSS variables remain as baseline defaults; runtime overrides applied via JS to `document.documentElement.style.setProperty`
- `AdminPage.tsx`: add "Customizer" tab to sidebar, load/save SiteSettings

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add `SiteSettings` type with all customizable fields, add `getSiteSettings` and `setSiteSettings` methods
2. Create `src/hooks/useSiteSettings.ts`: hook that fetches from backend, caches in localStorage, applies CSS variable overrides to `:root`, provides defaults
3. Create `src/hooks/useAdminSiteSettings.ts`: admin-specific mutation hook for saving settings
4. Update `Navbar.tsx` to use `useSiteSettings()` for site title/subtitle
5. Update `Footer.tsx` to use `useSiteSettings()` for footer content
6. Update `HomePage.tsx` to use `useSiteSettings()` for hero, about preview, sections
7. Create `src/pages/AdminCustomizerSection.tsx`: full customizer UI with tabs for Typography, Colors, Layout, Hero, Sections, About Preview, Footer, Navbar
8. Update `AdminPage.tsx`: add "Customizer" tab with Palette icon, render `AdminCustomizerSection`
