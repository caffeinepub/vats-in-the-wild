# Vats in the Wild

## Current State
The Visual Editor at `/edit` has an edit mode where large `EditZone` sections are highlighted on hover. Clicking a zone opens a right-side panel with controls for that zone (hero, about, sections, footer, global). It is a panel-based system - you click a zone, the panel slides in, you edit fields there.

## Requested Changes (Diff)

### Add
- `InlineEditTarget` component that wraps individual editable elements (headings, taglines, body text, background areas, CTA buttons)
- When edit mode is ON, hovering an `InlineEditTarget` shows a thin colored outline and a tiny floating badge ("Edit")
- Clicking an `InlineEditTarget` opens a compact floating `Popover` anchored to that element with context-specific controls:
  - **Text elements**: multi-line text input + font-size selector (sm/md/lg/xl/2xl) + color picker (predefined swatches from site palette) + font family selector (heading/body font toggle)
  - **Background areas**: background image upload (with URL field) + overlay opacity slider + background color fallback
  - **CTA / button text**: single-line text input only
- Popover auto-saves to draft on close (no separate save button inside popover)
- Each `InlineEditTarget` has a `type` prop: `"text"` | `"background"` | `"button"`
- Each target maps to specific `SiteSettings` keys via a `settingsKey` (or multiple keys)
- Apply inline edit targets to all major elements in `HomepagePreview`: hero heading, hero tagline, hero subtext, hero background, hero CTA button, about section heading, about body text, about background, each section card title, each section card description, footer tagline, footer social links area, newsletter section heading

### Modify
- `HomepagePreview` component: wrap individual elements with `InlineEditTarget` instead of (or in addition to) the big `EditZone` blocks; `EditZone` blocks can remain as a fallback
- `VisualEditor`: pass `onChange` handler down to `HomepagePreview` so inline changes update draft directly
- Edit Mode banner text: update to say "Click any element to edit it directly"

### Remove
- Nothing removed; existing right-side panels remain as a complementary option

## Implementation Plan
1. Create `InlineEditTarget` component in VisualEditorPage with popover showing text/background/button controls based on `type` prop
2. Add `settingsKey` prop (string | string[]) to map to `SiteSettings` fields
3. Thread `draft`, `onChange`, `isEditMode` into `HomepagePreview` as props
4. Wrap hero heading, tagline, subtext, CTA, hero background, about heading, about body, about background, section card titles (1-8), section card descriptions (1-8), footer tagline, newsletter heading with `InlineEditTarget`
5. Ensure popovers don't block page scrolling and are clipped/positioned correctly
6. Update banner text
