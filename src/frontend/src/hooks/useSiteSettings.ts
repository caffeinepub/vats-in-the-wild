import { useEffect, useState } from "react";
import type { SiteSettings } from "../backend.d";
import { useActor } from "./useActor";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Vats in the Wild",
  siteSubtitle: "Where Forest Meets Statecraft.",
  heroTitle: "Vats in the Wild",
  heroTagline: "From Forest Lines to Fault Lines.",
  heroEyebrow: "Notes from the Frontier",
  heroCtaPrimary: "Read the Journal",
  heroCtaSecondary: "Explore Sections",
  heroOverlayOpacity: "0.6",
  aboutPreviewText1:
    "Indian Forest Service Officer. Observer of power, policy, and wilderness. Writing at the intersection of ecology, geopolitics, and personal evolution.",
  aboutPreviewText2:
    "From the forest floor to the diplomatic frontier — this is a space for sustained thought, field-tested insight, and the kind of writing that takes time to arrive at.",
  aboutPreviewName: "Shubham Vats",
  aboutPreviewSubtitle: "Indian Forest Service Officer",
  aboutPortraitUrl: "",
  footerTagline: "Where Forest Meets Statecraft.",
  footerDescription:
    "An Indian Forest Service Officer's platform for writing on ecology, geopolitics, and personal evolution.",
  footerEmail: "contact@vatsinthewild.in",
  footerLinkedin: "https://linkedin.com",
  footerTwitter: "https://x.com",
  footerInstagram: "https://instagram.com",
  footerQuoteText:
    "In every walk with nature, one receives far more than he seeks.",
  footerQuoteAuthor: "John Muir",
  footerCopyright: "Vats in the Wild. All rights reserved.",
  colorBackground: "0.13 0.01 70",
  colorForeground: "0.93 0.01 80",
  colorPrimary: "0.50 0.10 150",
  colorCard: "0.17 0.012 68",
  colorMuted: "0.20 0.012 70",
  colorBorder: "0.25 0.015 70",
  headingFont: "Playfair Display",
  bodyFont: "system-ui",
  baseFontSize: "16",
  containerMaxWidth: "1280",
  sectionPadding: "normal",
  borderRadius: "0.25",
  section1Title: "International Relations",
  section1Description:
    "Analytical essays on geopolitics, India's foreign policy, and global power shifts.",
  section1Label: "World Affairs",
  section2Title: "Forest & Field Notes",
  section2Description:
    "Field experiences, wildlife insights, conservation challenges, and policy reflections.",
  section2Label: "Conservation",
  section3Title: "Beyond Cutoff",
  section3Description:
    "High-quality insights for civil services aspirants: strategy, mindset, and discipline.",
  section3Label: "UPSC Strategy",
  section4Title: "The Wild Within",
  section4Description:
    "Travel, trekking, fitness, photography, and reflections on the human experience.",
  section4Label: "Explorations",
  section5Title: "Personal Essays",
  section5Description:
    "Long-form reflections on leadership, public service, growth, and solitude.",
  section5Label: "Reflections",
  // Dynamic sections
  sectionCount: "5",
  section6Title: "",
  section6Description: "",
  section6Label: "",
  section7Title: "",
  section7Description: "",
  section7Label: "",
  section8Title: "",
  section8Description: "",
  section8Label: "",
  // Background images
  heroBackgroundImage: "",
  section1Image: "",
  section2Image: "",
  section3Image: "",
  section4Image: "",
  section5Image: "",
  section6Image: "",
  section7Image: "",
  section8Image: "",
  irPageBg: "",
  forestPageBg: "",
  upscPageBg: "",
  wildPageBg: "",
  essaysPageBg: "",
  aboutPageBg: "",
  // Per-page hero text
  irTitle: "International Relations",
  irDescription:
    "Analytical essays on geopolitics, India's foreign policy, strategic affairs, and global power shifts. Written from the field, not from think-tank corridors.",
  irLabel: "World Affairs",
  forestTitle: "Forest & Field Notes",
  forestDescription:
    "Field experiences, wildlife insights, conservation challenges, and policy reflections from the forest floor.",
  forestLabel: "Conservation",
  upscTitle: "Beyond Cutoff",
  upscDescription:
    "High-quality insights for civil services aspirants: strategy, mindset, books, and discipline.",
  upscLabel: "UPSC Strategy",
  wildTitle: "The Wild Within",
  wildDescription:
    "Travel, trekking, fitness, photography, terrarium making, and reflections on the human experience.",
  wildLabel: "Explorations",
  essaysTitle: "Personal Essays",
  essaysDescription:
    "Long-form reflections on leadership, public service, growth, and solitude.",
  essaysLabel: "Reflections",
  aboutPageTitle: "About",
  aboutPageSubtitle: "Indian Forest Service Officer",
  // Newsletter
  newsletterLabel: "Dispatches",
  newsletterTitle: "Stay in the Field",
  newsletterSubtitle:
    "Occasional dispatches — essays, insights, field notes. No noise.",
  newsletterPlaceholder: "Your email address",
  // Latest articles
  latestArticlesLabel: "Recent Writing",
  latestArticlesTitle: "From the Journal",
};

// Map font names to Google Fonts query params
const FONT_PARAMS: Record<string, string | null> = {
  "Playfair Display": "family=Playfair+Display:wght@400;600;700",
  Lora: "family=Lora:wght@400;600;700",
  "EB Garamond": "family=EB+Garamond:wght@400;600;700",
  "Cormorant Garamond": "family=Cormorant+Garamond:wght@400;600;700",
  Merriweather: "family=Merriweather:wght@400;700",
  Inter: "family=Inter:wght@400;500;600",
  "system-ui": null,
};

function injectGoogleFont(fontName: string) {
  const param = FONT_PARAMS[fontName];
  // Remove any existing injected font links
  const existing = document.querySelectorAll("link[data-caffeine-font]");
  for (const el of existing) el.remove();

  if (!param) return; // system-ui needs no injection

  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  preconnect1.setAttribute("data-caffeine-font", "true");

  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "anonymous";
  preconnect2.setAttribute("data-caffeine-font", "true");

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${param}&display=swap`;
  link.setAttribute("data-caffeine-font", "true");

  document.head.appendChild(preconnect1);
  document.head.appendChild(preconnect2);
  document.head.appendChild(link);
}

function applyCSS(s: SiteSettings) {
  const root = document.documentElement;

  // Apply color CSS variables
  root.style.setProperty("--background", s.colorBackground);
  root.style.setProperty("--foreground", s.colorForeground);
  root.style.setProperty("--primary", s.colorPrimary);
  root.style.setProperty("--card", s.colorCard);
  root.style.setProperty("--card-foreground", s.colorForeground);
  root.style.setProperty("--muted", s.colorMuted);
  root.style.setProperty("--border", s.colorBorder);
  root.style.setProperty("--radius", `${s.borderRadius}rem`);

  // Apply font size
  root.style.fontSize = `${s.baseFontSize}px`;

  // Apply container max width as a CSS var
  root.style.setProperty("--container-max-width", `${s.containerMaxWidth}px`);

  // Heading font
  const headingStack =
    s.headingFont === "system-ui"
      ? "system-ui, sans-serif"
      : `'${s.headingFont}', Georgia, serif`;
  root.style.setProperty("--heading-font-family", headingStack);

  // Body font
  const bodyStack =
    s.bodyFont === "system-ui"
      ? "system-ui, sans-serif"
      : `'${s.bodyFont}', system-ui, sans-serif`;
  document.body.style.fontFamily = bodyStack;

  // Inject Google Fonts for heading
  injectGoogleFont(s.headingFont);
}

export function useSiteSettings(): SiteSettings {
  const { actor } = useActor();
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem("site_settings");
      return cached ? (JSON.parse(cached) as SiteSettings) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply CSS whenever settings change (covers cached initial load too)
  useEffect(() => {
    applyCSS(settings);
  }, [settings]);

  // Fetch from backend
  useEffect(() => {
    if (!actor) return;
    actor
      .getSiteSettings()
      .then((s) => {
        setSettings(s);
        localStorage.setItem("site_settings", JSON.stringify(s));
        applyCSS(s);
      })
      .catch(() => {
        // Silently fall back to cached/default
      });
  }, [actor]);

  return settings;
}
