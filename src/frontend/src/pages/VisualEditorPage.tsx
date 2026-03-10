import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Monitor,
  Pencil,
  Save,
  Settings2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { FileMetadata, SiteSettings } from "../backend.d";
import { useAddMediaFile } from "../hooks/useAdminQueries";
import {
  useGetSiteSettings,
  useSetSiteSettings,
} from "../hooks/useAdminSiteSettings";
import { useLatestPosts } from "../hooks/useQueries";
import { DEFAULT_SETTINGS } from "../hooks/useSiteSettings";

// ─── Auth Gate ────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "vatswild2024";
const AUTH_KEY = "admin_auth";

function useEditorAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  });

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return { isAuthenticated, login };
}

// ─── Editor Context ───────────────────────────────────────────────────────────

const EditorSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

function useEditorSettings() {
  return useContext(EditorSettingsContext);
}

// ─── CSS Application ──────────────────────────────────────────────────────────

function applyDraftCSS(s: SiteSettings) {
  const root = document.documentElement;
  root.style.setProperty("--background", s.colorBackground);
  root.style.setProperty("--foreground", s.colorForeground);
  root.style.setProperty("--primary", s.colorPrimary);
  root.style.setProperty("--card", s.colorCard);
  root.style.setProperty("--card-foreground", s.colorForeground);
  root.style.setProperty("--muted", s.colorMuted);
  root.style.setProperty("--border", s.colorBorder);
  root.style.setProperty("--radius", `${s.borderRadius}rem`);
  root.style.fontSize = `${s.baseFontSize}px`;
  root.style.setProperty("--container-max-width", `${s.containerMaxWidth}px`);

  const headingStack =
    s.headingFont === "system-ui"
      ? "system-ui, sans-serif"
      : `'${s.headingFont}', Georgia, serif`;
  root.style.setProperty("--heading-font-family", headingStack);

  const bodyStack =
    s.bodyFont === "system-ui"
      ? "system-ui, sans-serif"
      : `'${s.bodyFont}', system-ui, sans-serif`;
  document.body.style.fontFamily = bodyStack;
}

// ─── Image Upload Field ────────────────────────────────────────────────────────

async function fileToUint8Array(file: File): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) =>
      resolve(new Uint8Array(e.target!.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: ImageUploadFieldProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const addMediaFile = useAddMediaFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    try {
      setProgress(0);
      const bytes = await fileToUint8Array(file);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setProgress(pct),
      );
      const metadata: FileMetadata = {
        id: crypto.randomUUID(),
        blob,
        mimeType: file.type,
        filename: file.name,
        sizeBytes: BigInt(file.size),
        uploadTimestamp: BigInt(Date.now()),
      };
      await addMediaFile.mutateAsync(metadata);
      onChange(metadata.blob.getDirectURL());
      toast.success("Image uploaded.");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {value && (
        <div className="relative w-full h-20 rounded overflow-hidden border border-border/60">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={progress !== null}
        className="w-full border-border/60 gap-2 text-xs"
        data-ocid="editor.image_upload_button"
      >
        {progress !== null ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <Upload className="w-3 h-3" /> Upload Image
          </>
        )}
      </Button>

      {progress !== null && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Or paste URL</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /assets/..."
          className="bg-input border-border/60 text-xs h-8"
          data-ocid="editor.image_url_input"
        />
      </div>
    </div>
  );
}

// ─── Form Field Helper ─────────────────────────────────────────────────────────

function FF({
  label,
  children,
  hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

// ─── Color Field ──────────────────────────────────────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded border border-border/60 flex-shrink-0"
          style={{ background: `oklch(${value})` }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="L C H e.g. 0.13 0.01 70"
          className="bg-input border-border/60 font-mono text-xs flex-1 h-7"
        />
      </div>
    </div>
  );
}

// ─── Color Presets ────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  {
    name: "Forest Dark",
    background: "0.13 0.01 70",
    foreground: "0.93 0.01 80",
    primary: "0.50 0.10 150",
    card: "0.17 0.012 68",
    muted: "0.20 0.012 70",
    border: "0.25 0.015 70",
  },
  {
    name: "Midnight Ink",
    background: "0.08 0.01 265",
    foreground: "0.92 0.01 260",
    primary: "0.55 0.15 260",
    card: "0.12 0.015 265",
    muted: "0.18 0.012 265",
    border: "0.22 0.015 265",
  },
  {
    name: "Stone Grey",
    background: "0.14 0.005 240",
    foreground: "0.90 0.005 230",
    primary: "0.45 0.08 220",
    card: "0.18 0.006 240",
    muted: "0.22 0.005 240",
    border: "0.28 0.006 240",
  },
  {
    name: "Warm Parchment",
    background: "0.97 0.008 85",
    foreground: "0.18 0.015 60",
    primary: "0.38 0.09 148",
    card: "0.94 0.012 80",
    muted: "0.90 0.015 78",
    border: "0.82 0.025 75",
  },
  {
    name: "Moss Green",
    background: "0.12 0.02 145",
    foreground: "0.90 0.015 140",
    primary: "0.55 0.12 148",
    card: "0.16 0.022 145",
    muted: "0.20 0.018 145",
    border: "0.26 0.020 145",
  },
];

// ─── Edit Zone ─────────────────────────────────────────────────────────────────

interface EditZoneProps {
  id: string;
  label: string;
  isEditMode: boolean;
  onEdit: (zoneId: string) => void;
  children: React.ReactNode;
  className?: string;
}

function EditZone({
  id,
  label,
  isEditMode,
  onEdit,
  children,
  className = "",
}: EditZoneProps) {
  const [hovered, setHovered] = useState(false);

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={`editor.${id}.section`}
    >
      {/* Highlight ring - pointer-events-none so clicks pass through to InlineEditTargets */}
      <div
        className={`absolute inset-0 pointer-events-none z-20 transition-all duration-150 ${
          hovered ? "ring-2 ring-primary/70 ring-inset" : "ring-0"
        }`}
      />

      {/* Corner "Edit Section" button - only appears on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            onClick={() => onEdit(id)}
            aria-label={`Edit ${label} settings`}
            className="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold shadow-lg cursor-pointer"
            data-ocid={`editor.${id}.edit_button`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit {label}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

// ─── Inline Edit Target ────────────────────────────────────────────────────────

interface InlineEditTargetProps {
  type: "text" | "background" | "button";
  settingsKeys: (keyof SiteSettings)[];
  labels: string[];
  isEditMode: boolean;
  draft: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  children: React.ReactNode;
  className?: string;
}

function InlineEditTarget({
  type,
  settingsKeys,
  labels,
  isEditMode,
  draft,
  onChange,
  children,
  className = "",
}: InlineEditTargetProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className={`relative inline-block cursor-pointer ${className}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              setOpen(true);
            }
          }}
          // biome-ignore lint/a11y/useSemanticElements: edit overlay wrapper needs to be span
          role="button"
          tabIndex={isEditMode ? 0 : -1}
        >
          {/* Hover outline */}
          {hovered && (
            <div className="absolute inset-0 ring-2 ring-primary/60 ring-inset pointer-events-none rounded-sm z-10" />
          )}
          {/* Edit badge */}
          {hovered && (
            <div
              className="absolute -top-5 right-0 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow whitespace-nowrap pointer-events-none"
              data-ocid="editor.inline_target.button"
            >
              <Pencil className="w-2.5 h-2.5" />
              Edit
            </div>
          )}
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3 space-y-3 z-[9990]"
        side="bottom"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        {type === "text" &&
          settingsKeys.map((key, i) => (
            <div key={String(key)} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {labels[i] || String(key)}
              </p>
              {((draft[key] as string) || "").length > 80 ? (
                <Textarea
                  value={(draft[key] as string) || ""}
                  onChange={(e) =>
                    onChange({ [key]: e.target.value } as Partial<SiteSettings>)
                  }
                  className="text-xs min-h-[80px] bg-input border-border/60 focus-visible:ring-primary/40 resize-none"
                  data-ocid="editor.inline_edit.textarea"
                />
              ) : (
                <Input
                  value={(draft[key] as string) || ""}
                  onChange={(e) =>
                    onChange({ [key]: e.target.value } as Partial<SiteSettings>)
                  }
                  className="text-xs bg-input border-border/60 focus-visible:ring-primary/40"
                  data-ocid="editor.inline_edit.input"
                />
              )}
            </div>
          ))}

        {type === "button" &&
          settingsKeys.map((key, i) => (
            <div key={String(key)} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {labels[i] || "Button Text"}
              </p>
              <Input
                value={(draft[key] as string) || ""}
                onChange={(e) =>
                  onChange({ [key]: e.target.value } as Partial<SiteSettings>)
                }
                className="text-xs bg-input border-border/60 focus-visible:ring-primary/40"
                data-ocid="editor.inline_edit.input"
              />
            </div>
          ))}

        {type === "background" &&
          settingsKeys.map((key, i) => (
            <div key={String(key)} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {labels[i] || "Image URL"}
              </p>
              <ImageUploadField
                label=""
                value={(draft[key] as string) || ""}
                onChange={(url) =>
                  onChange({ [key]: url } as Partial<SiteSettings>)
                }
              />
            </div>
          ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Homepage Preview ─────────────────────────────────────────────────────────

const SECTION_DEFAULT_IMAGES = [
  "/assets/generated/section-international-relations.dim_800x500.jpg",
  "/assets/generated/section-forest-notes.dim_800x500.jpg",
  "/assets/generated/section-upsc.dim_800x500.jpg",
  "/assets/generated/section-wild-within.dim_800x500.jpg",
  "/assets/generated/section-personal-essays.dim_800x500.jpg",
  "",
  "",
  "",
];

const SECTION_ROUTES = [
  "/international-relations",
  "/forest-field-notes",
  "/beyond-cutoff",
  "/wild-within",
  "/personal-essays",
  "#",
  "#",
  "#",
];

const DEFAULT_POSTS = [
  {
    title: "India's Neighbourhood Policy: Between Strategy and Sentiment",
    excerpt:
      "A field officer's view of how India's neighbourhood first doctrine plays out beyond diplomatic cables.",
    slug: "india-neighbourhood-policy",
    category: "international_relations" as const,
    tags: ["India", "Foreign Policy"],
    publishedAt: BigInt(Date.now() * 1_000_000),
    readingTimeMinutes: BigInt(8),
    isDraft: false,
    isFeatured: true,
    body: "",
    featuredImage:
      "/assets/generated/section-international-relations.dim_800x500.jpg",
  },
  {
    title: "A Night with Elephants in the Nilgiris",
    excerpt:
      "Solitary and immense, the matriarch paused at the treeline. In that moment, everything I had read became irrelevant.",
    slug: "nilgiris-elephants",
    category: "forest_field_notes" as const,
    tags: ["Wildlife", "Elephants"],
    publishedAt: BigInt((Date.now() - 7 * 24 * 60 * 60 * 1000) * 1_000_000),
    readingTimeMinutes: BigInt(6),
    isDraft: false,
    isFeatured: false,
    body: "",
    featuredImage: "/assets/generated/section-forest-notes.dim_800x500.jpg",
  },
  {
    title: "The Essay Question: How I Think About Long-Form UPSC Writing",
    excerpt:
      "An essay is not a summary. It is an argument. Most aspirants miss this distinction entirely.",
    slug: "upsc-essay-strategy",
    category: "beyond_cutoff" as const,
    tags: ["UPSC", "Essay"],
    publishedAt: BigInt((Date.now() - 14 * 24 * 60 * 60 * 1000) * 1_000_000),
    readingTimeMinutes: BigInt(10),
    isDraft: false,
    isFeatured: false,
    body: "",
    featuredImage: "/assets/generated/section-upsc.dim_800x500.jpg",
  },
];

function formatDate(publishedAt: bigint): string {
  const ms = Number(publishedAt) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface HomepagePreviewProps {
  isEditMode: boolean;
  onEdit: (zoneId: string) => void;
  draft: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
}

function HomepagePreview({
  isEditMode,
  onEdit,
  draft,
  onChange,
}: HomepagePreviewProps) {
  const settings = useEditorSettings();
  const { data: latestPosts } = useLatestPosts(3n);

  const sectionCount = Math.min(
    8,
    Math.max(5, Number.parseInt(settings.sectionCount) || 5),
  );

  const allSectionData = [
    {
      title: settings.section1Title,
      description: settings.section1Description,
      label: settings.section1Label,
      image: settings.section1Image || SECTION_DEFAULT_IMAGES[0],
      to: SECTION_ROUTES[0],
    },
    {
      title: settings.section2Title,
      description: settings.section2Description,
      label: settings.section2Label,
      image: settings.section2Image || SECTION_DEFAULT_IMAGES[1],
      to: SECTION_ROUTES[1],
    },
    {
      title: settings.section3Title,
      description: settings.section3Description,
      label: settings.section3Label,
      image: settings.section3Image || SECTION_DEFAULT_IMAGES[2],
      to: SECTION_ROUTES[2],
    },
    {
      title: settings.section4Title,
      description: settings.section4Description,
      label: settings.section4Label,
      image: settings.section4Image || SECTION_DEFAULT_IMAGES[3],
      to: SECTION_ROUTES[3],
    },
    {
      title: settings.section5Title,
      description: settings.section5Description,
      label: settings.section5Label,
      image: settings.section5Image || SECTION_DEFAULT_IMAGES[4],
      to: SECTION_ROUTES[4],
    },
    {
      title: settings.section6Title || "Section 6",
      description: settings.section6Description,
      label: settings.section6Label,
      image: settings.section6Image || SECTION_DEFAULT_IMAGES[5],
      to: SECTION_ROUTES[5],
    },
    {
      title: settings.section7Title || "Section 7",
      description: settings.section7Description,
      label: settings.section7Label,
      image: settings.section7Image || SECTION_DEFAULT_IMAGES[6],
      to: SECTION_ROUTES[6],
    },
    {
      title: settings.section8Title || "Section 8",
      description: settings.section8Description,
      label: settings.section8Label,
      image: settings.section8Image || SECTION_DEFAULT_IMAGES[7],
      to: SECTION_ROUTES[7],
    },
  ];

  const sectionCards = allSectionData.slice(0, sectionCount);
  const displayPosts =
    latestPosts && latestPosts.length > 0 ? latestPosts : DEFAULT_POSTS;

  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAVBAR ── */}
      <EditZone
        id="navbar"
        label="Navbar"
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <header className="sticky top-12 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex flex-col">
                <span className="font-display text-xl lg:text-2xl font-semibold tracking-tight text-foreground">
                  {settings.siteName}
                </span>
                <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                  {settings.siteSubtitle}
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1">
                {[
                  { label: "IR", to: "/international-relations" },
                  { label: "Forest", to: "/forest-field-notes" },
                  { label: "UPSC", to: "/beyond-cutoff" },
                  { label: "Wild Within", to: "/wild-within" },
                  { label: "Essays", to: "/personal-essays" },
                  { label: "About", to: "/about" },
                ].map((link) => (
                  <span
                    key={link.to}
                    className="px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground rounded-sm"
                  >
                    {link.label}
                  </span>
                ))}
              </div>
            </div>
          </nav>
        </header>
      </EditZone>

      {/* ── HERO ── */}
      <EditZone
        id="hero"
        label="Hero Section"
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <InlineEditTarget
            type="background"
            settingsKeys={["heroBackgroundImage"]}
            labels={["Hero Background Image"]}
            isEditMode={isEditMode}
            draft={draft}
            onChange={onChange}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: settings.heroBackgroundImage
                  ? `url(${settings.heroBackgroundImage})`
                  : "url(/assets/generated/hero-forest-dawn.dim_1600x900.jpg)",
              }}
            />
          </InlineEditTarget>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,${settings.heroOverlayOpacity}) 0%, rgba(0,0,0,${Math.max(0, Number.parseFloat(settings.heroOverlayOpacity) - 0.2).toFixed(2)}) 50%, rgba(0,0,0,${settings.heroOverlayOpacity}) 100%)`,
            }}
          />
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
            <InlineEditTarget
              type="text"
              settingsKeys={["heroEyebrow"]}
              labels={["Eyebrow Text"]}
              isEditMode={isEditMode}
              draft={draft}
              onChange={onChange}
              className="block mb-6"
            >
              <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-white/60">
                {settings.heroEyebrow}
              </p>
            </InlineEditTarget>
            <InlineEditTarget
              type="text"
              settingsKeys={["heroTitle"]}
              labels={["Hero Title"]}
              isEditMode={isEditMode}
              draft={draft}
              onChange={onChange}
              className="block mb-6"
            >
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight">
                {settings.heroTitle}
              </h1>
            </InlineEditTarget>
            <InlineEditTarget
              type="text"
              settingsKeys={["heroTagline"]}
              labels={["Tagline"]}
              isEditMode={isEditMode}
              draft={draft}
              onChange={onChange}
              className="block mb-10"
            >
              <p className="font-display text-lg sm:text-xl text-white/70 italic max-w-2xl mx-auto">
                {settings.heroTagline}
              </p>
            </InlineEditTarget>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <InlineEditTarget
                type="button"
                settingsKeys={["heroCtaPrimary"]}
                labels={["Primary Button"]}
                isEditMode={isEditMode}
                draft={draft}
                onChange={onChange}
              >
                <button
                  type="button"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide px-8 py-3 rounded-[var(--radius)] text-sm"
                >
                  {settings.heroCtaPrimary}
                </button>
              </InlineEditTarget>
              <InlineEditTarget
                type="button"
                settingsKeys={["heroCtaSecondary"]}
                labels={["Secondary Button"]}
                isEditMode={isEditMode}
                draft={draft}
                onChange={onChange}
              >
                <button
                  type="button"
                  className="border border-white/40 text-white hover:bg-white/10 font-semibold tracking-wide px-8 py-3 rounded-[var(--radius)] text-sm"
                >
                  {settings.heroCtaSecondary}
                </button>
              </InlineEditTarget>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40">
            <ChevronDown size={24} />
          </div>
        </section>
      </EditZone>

      {/* ── ABOUT PREVIEW ── */}
      <EditZone
        id="about"
        label="About Preview"
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="relative max-w-sm mx-auto lg:mx-0">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm">
                    <img
                      src={
                        settings.aboutPortraitUrl ||
                        "/assets/generated/portrait-placeholder.dim_600x750.jpg"
                      }
                      alt={settings.aboutPreviewName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 rounded-sm -z-10" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                    About
                  </p>
                  <InlineEditTarget
                    type="text"
                    settingsKeys={["aboutPreviewName"]}
                    labels={["Name"]}
                    isEditMode={isEditMode}
                    draft={draft}
                    onChange={onChange}
                    className="block mb-2"
                  >
                    <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                      {settings.aboutPreviewName}
                    </h2>
                  </InlineEditTarget>
                  <InlineEditTarget
                    type="text"
                    settingsKeys={["aboutPreviewSubtitle"]}
                    labels={["Subtitle"]}
                    isEditMode={isEditMode}
                    draft={draft}
                    onChange={onChange}
                    className="block mb-6"
                  >
                    <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                      {settings.aboutPreviewSubtitle}
                    </p>
                  </InlineEditTarget>
                </div>
                <InlineEditTarget
                  type="text"
                  settingsKeys={["aboutPreviewText1"]}
                  labels={["Paragraph 1"]}
                  isEditMode={isEditMode}
                  draft={draft}
                  onChange={onChange}
                  className="block"
                >
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {settings.aboutPreviewText1}
                  </p>
                </InlineEditTarget>
                <InlineEditTarget
                  type="text"
                  settingsKeys={["aboutPreviewText2"]}
                  labels={["Paragraph 2"]}
                  isEditMode={isEditMode}
                  draft={draft}
                  onChange={onChange}
                  className="block"
                >
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {settings.aboutPreviewText2}
                  </p>
                </InlineEditTarget>
                <button
                  type="button"
                  className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium tracking-wide px-5 py-2 rounded-[var(--radius)] text-sm transition-colors"
                >
                  Read Full Bio
                </button>
              </div>
            </div>
          </div>
        </section>
      </EditZone>

      {/* ── SECTIONS GRID ── */}
      <EditZone
        id="sections"
        label="Sections Grid"
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <section className="py-20 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                Explore
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Sections
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionCards.map((section, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static layout
                  key={i}
                  className="group block bg-background border border-border overflow-hidden"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    {section.image ? (
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/40 flex items-center justify-center">
                        <span className="text-muted-foreground/40 text-sm">
                          No image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
                      {section.label}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditZone>

      {/* ── LATEST ARTICLES ── */}
      <EditZone
        id="articles"
        label="Latest Articles"
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                  {settings.latestArticlesLabel}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  {settings.latestArticlesTitle}
                </h2>
              </div>
              <span className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide cursor-pointer">
                View All →
              </span>
            </div>
            <div className="space-y-4">
              {displayPosts.map((post, i) => {
                const imageSrc =
                  post.featuredImage ||
                  `/assets/generated/section-${post.category.replace("_", "-")}.dim_800x500.jpg`;
                const catLabel =
                  {
                    international_relations: "International Relations",
                    forest_field_notes: "Forest & Field Notes",
                    beyond_cutoff: "Beyond Cutoff",
                    wild_within: "The Wild Within",
                    personal_essays: "Personal Essays",
                  }[post.category] || post.category;
                return (
                  <article
                    key={post.slug}
                    className="group bg-card border border-border overflow-hidden flex flex-col sm:flex-row"
                    data-ocid={`editor.articles.item.${i + 1}`}
                  >
                    <div className="sm:w-1/3 aspect-[4/3] sm:aspect-auto overflow-hidden flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-6 sm:p-8 flex-1">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                            {catLabel}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </EditZone>

      {/* ── QUOTE OF THE MONTH (static, no edit zone needed) ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-card" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="font-display text-[8rem] leading-none text-primary/20 select-none -mb-8">
            "
          </div>
          <blockquote className="font-display text-xl sm:text-2xl lg:text-3xl font-medium italic text-foreground leading-relaxed mb-6">
            The forest is not a resource to be exploited but a world to be
            understood — a living archive of evolutionary time.
          </blockquote>
          <cite className="text-sm font-semibold tracking-widest uppercase text-muted-foreground not-italic">
            — Shubham Vats
          </cite>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <EditZone
        id="newsletter"
        label="Newsletter"
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <section className="py-20 bg-background border-y border-border">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                {settings.newsletterLabel}
              </p>
              <InlineEditTarget
                type="text"
                settingsKeys={["newsletterTitle"]}
                labels={["Newsletter Title"]}
                isEditMode={isEditMode}
                draft={draft}
                onChange={onChange}
                className="block mb-3"
              >
                <h2 className="font-display text-3xl font-bold text-foreground">
                  {settings.newsletterTitle}
                </h2>
              </InlineEditTarget>
              <InlineEditTarget
                type="text"
                settingsKeys={["newsletterSubtitle"]}
                labels={["Newsletter Subtitle"]}
                isEditMode={isEditMode}
                draft={draft}
                onChange={onChange}
                className="block"
              >
                <p className="text-muted-foreground leading-relaxed">
                  {settings.newsletterSubtitle}
                </p>
              </InlineEditTarget>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={settings.newsletterPlaceholder}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-border bg-input text-foreground text-sm"
              />
              <button
                type="button"
                className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-[var(--radius)] text-sm"
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </EditZone>

      {/* ── FOOTER ── */}
      <EditZone
        id="footer"
        label="Footer"
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="space-y-4">
                <div className="font-display text-2xl font-semibold text-foreground">
                  {settings.siteName}
                </div>
                <InlineEditTarget
                  type="text"
                  settingsKeys={["footerTagline"]}
                  labels={["Footer Tagline"]}
                  isEditMode={isEditMode}
                  draft={draft}
                  onChange={onChange}
                  className="block"
                >
                  <p className="text-xs tracking-widest uppercase text-muted-foreground">
                    {settings.footerTagline}
                  </p>
                </InlineEditTarget>
                <InlineEditTarget
                  type="text"
                  settingsKeys={["footerDescription"]}
                  labels={["Footer Description"]}
                  isEditMode={isEditMode}
                  draft={draft}
                  onChange={onChange}
                  className="block"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {settings.footerDescription}
                  </p>
                </InlineEditTarget>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Sections
                </h3>
                <nav className="space-y-2">
                  {[
                    "International Relations",
                    "Forest & Field Notes",
                    "Beyond Cutoff (UPSC)",
                    "The Wild Within",
                    "Personal Essays",
                    "Reading List",
                  ].map((s) => (
                    <div
                      key={s}
                      className="block text-sm text-muted-foreground"
                    >
                      {s}
                    </div>
                  ))}
                </nav>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Connect
                </h3>
                {settings.footerEmail && (
                  <div className="text-sm text-muted-foreground">
                    {settings.footerEmail}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  {settings.footerLinkedin && (
                    <SiLinkedin size={18} className="text-muted-foreground" />
                  )}
                  {settings.footerTwitter && (
                    <SiX size={18} className="text-muted-foreground" />
                  )}
                  {settings.footerInstagram && (
                    <SiInstagram size={18} className="text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {settings.footerQuoteText && (
              <div className="border-t border-border pt-8 mb-8">
                <blockquote className="text-center text-sm text-muted-foreground italic max-w-2xl mx-auto">
                  "{settings.footerQuoteText}"
                  {settings.footerQuoteAuthor && (
                    <>
                      <br />
                      <span className="not-italic text-xs tracking-wider uppercase mt-1 block">
                        — {settings.footerQuoteAuthor}
                      </span>
                    </>
                  )}
                </blockquote>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <p>
                © {currentYear} {settings.footerCopyright}
              </p>
              <p>
                Built with ♥ using{" "}
                <a href={caffeineUrl} className="hover:text-foreground">
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </EditZone>
    </div>
  );
}

// ─── Right Edit Panel ─────────────────────────────────────────────────────────

interface EditPanelProps {
  zoneId: string | null;
  draft: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

function EditPanel({
  zoneId,
  draft,
  onChange,
  onClose,
  onSave,
  isSaving,
}: EditPanelProps) {
  const isOpen = zoneId !== null;

  const getZoneLabel = (id: string) => {
    const labels: Record<string, string> = {
      hero: "Hero Section",
      about: "About Preview",
      sections: "Sections Grid",
      articles: "Latest Articles",
      newsletter: "Newsletter",
      footer: "Footer & Navbar",
      navbar: "Navbar",
    };
    return labels[id] ?? id;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="edit-panel"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 z-[9998] w-[380px] max-w-[100vw] bg-card border-l border-border shadow-2xl flex flex-col"
          style={{ top: "48px", bottom: 0 }}
          data-ocid="editor.panel"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <Pencil className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-sm text-foreground">
                {zoneId ? getZoneLabel(zoneId) : "Edit"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              data-ocid="editor.panel.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {zoneId === "hero" && (
              <HeroPanel draft={draft} onChange={onChange} />
            )}
            {zoneId === "about" && (
              <AboutPanel draft={draft} onChange={onChange} />
            )}
            {zoneId === "sections" && (
              <SectionsPanel draft={draft} onChange={onChange} />
            )}
            {zoneId === "articles" && (
              <ArticlesPanel draft={draft} onChange={onChange} />
            )}
            {zoneId === "newsletter" && (
              <NewsletterPanel draft={draft} onChange={onChange} />
            )}
            {(zoneId === "footer" || zoneId === "navbar") && (
              <FooterPanel draft={draft} onChange={onChange} />
            )}
          </div>

          {/* Panel footer */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card/95 flex-shrink-0">
            <Button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs"
              data-ocid="editor.panel.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border/60 text-xs"
              data-ocid="editor.panel.cancel_button"
            >
              Close
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── Zone-specific Panels ─────────────────────────────────────────────────────

function HeroPanel({
  draft,
  onChange,
}: { draft: SiteSettings; onChange: (p: Partial<SiteSettings>) => void }) {
  const opacity = Number.parseFloat(draft.heroOverlayOpacity) || 0.6;
  return (
    <div className="space-y-4">
      <FF label="Site Name">
        <Input
          value={draft.siteName}
          onChange={(e) => onChange({ siteName: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.hero.sitename_input"
        />
      </FF>
      <FF label="Site Subtitle / Tagline">
        <Input
          value={draft.siteSubtitle}
          onChange={(e) => onChange({ siteSubtitle: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.hero.subtitle_input"
        />
      </FF>
      <FF label="Hero Title">
        <Input
          value={draft.heroTitle}
          onChange={(e) => onChange({ heroTitle: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.hero.title_input"
        />
      </FF>
      <FF label="Eyebrow (small text above title)">
        <Input
          value={draft.heroEyebrow}
          onChange={(e) => onChange({ heroEyebrow: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.hero.eyebrow_input"
        />
      </FF>
      <FF label="Hero Tagline (italic line below title)">
        <Input
          value={draft.heroTagline}
          onChange={(e) => onChange({ heroTagline: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.hero.tagline_input"
        />
      </FF>
      <FF label="Primary CTA Button">
        <Input
          value={draft.heroCtaPrimary}
          onChange={(e) => onChange({ heroCtaPrimary: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.hero.cta_primary_input"
        />
      </FF>
      <FF label="Secondary CTA Button">
        <Input
          value={draft.heroCtaSecondary}
          onChange={(e) => onChange({ heroCtaSecondary: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.hero.cta_secondary_input"
        />
      </FF>
      <FF label={`Hero Overlay Opacity: ${opacity.toFixed(2)}`}>
        <Slider
          min={0}
          max={0.9}
          step={0.05}
          value={[opacity]}
          onValueChange={([v]) =>
            onChange({ heroOverlayOpacity: v.toFixed(2) })
          }
          className="mt-2"
          data-ocid="editor.hero.opacity_input"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 (clear)</span>
          <span>0.9 (dark)</span>
        </div>
      </FF>
      <ImageUploadField
        label="Hero Background Image"
        value={draft.heroBackgroundImage}
        onChange={(url) => onChange({ heroBackgroundImage: url })}
        hint="Main cinematic background image"
      />
    </div>
  );
}

function AboutPanel({
  draft,
  onChange,
}: { draft: SiteSettings; onChange: (p: Partial<SiteSettings>) => void }) {
  return (
    <div className="space-y-4">
      <FF label="Display Name">
        <Input
          value={draft.aboutPreviewName}
          onChange={(e) => onChange({ aboutPreviewName: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.about.name_input"
        />
      </FF>
      <FF label="Subtitle / Role">
        <Input
          value={draft.aboutPreviewSubtitle}
          onChange={(e) => onChange({ aboutPreviewSubtitle: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.about.subtitle_input"
        />
      </FF>
      <FF label="Bio Paragraph 1">
        <Textarea
          value={draft.aboutPreviewText1}
          onChange={(e) => onChange({ aboutPreviewText1: e.target.value })}
          rows={3}
          className="bg-input border-border/60 resize-none text-sm"
          data-ocid="editor.about.bio1_textarea"
        />
      </FF>
      <FF label="Bio Paragraph 2">
        <Textarea
          value={draft.aboutPreviewText2}
          onChange={(e) => onChange({ aboutPreviewText2: e.target.value })}
          rows={3}
          className="bg-input border-border/60 resize-none text-sm"
          data-ocid="editor.about.bio2_textarea"
        />
      </FF>
      <ImageUploadField
        label="Portrait Image"
        value={draft.aboutPortraitUrl}
        onChange={(url) => onChange({ aboutPortraitUrl: url })}
        hint="Your profile portrait"
      />
    </div>
  );
}

const SECTION_KEYS_PANEL: {
  n: number;
  titleKey: keyof SiteSettings;
  labelKey: keyof SiteSettings;
  descKey: keyof SiteSettings;
  imageKey: keyof SiteSettings;
}[] = [
  {
    n: 1,
    titleKey: "section1Title",
    labelKey: "section1Label",
    descKey: "section1Description",
    imageKey: "section1Image",
  },
  {
    n: 2,
    titleKey: "section2Title",
    labelKey: "section2Label",
    descKey: "section2Description",
    imageKey: "section2Image",
  },
  {
    n: 3,
    titleKey: "section3Title",
    labelKey: "section3Label",
    descKey: "section3Description",
    imageKey: "section3Image",
  },
  {
    n: 4,
    titleKey: "section4Title",
    labelKey: "section4Label",
    descKey: "section4Description",
    imageKey: "section4Image",
  },
  {
    n: 5,
    titleKey: "section5Title",
    labelKey: "section5Label",
    descKey: "section5Description",
    imageKey: "section5Image",
  },
  {
    n: 6,
    titleKey: "section6Title",
    labelKey: "section6Label",
    descKey: "section6Description",
    imageKey: "section6Image",
  },
  {
    n: 7,
    titleKey: "section7Title",
    labelKey: "section7Label",
    descKey: "section7Description",
    imageKey: "section7Image",
  },
  {
    n: 8,
    titleKey: "section8Title",
    labelKey: "section8Label",
    descKey: "section8Description",
    imageKey: "section8Image",
  },
];

function SectionsPanel({
  draft,
  onChange,
}: { draft: SiteSettings; onChange: (p: Partial<SiteSettings>) => void }) {
  const currentCount = Math.min(
    8,
    Math.max(5, Number.parseInt(draft.sectionCount) || 5),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          Active Sections:
        </Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({
                sectionCount: String(Math.max(5, currentCount - 1)),
              })
            }
            disabled={currentCount <= 5}
            className="w-7 h-7 flex items-center justify-center rounded border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-40 text-sm"
            data-ocid="editor.sections.remove_button"
          >
            −
          </button>
          <span className="text-sm font-semibold text-primary min-w-[1.5rem] text-center">
            {currentCount}
          </span>
          <button
            type="button"
            onClick={() =>
              onChange({
                sectionCount: String(Math.min(8, currentCount + 1)),
              })
            }
            disabled={currentCount >= 8}
            className="w-7 h-7 flex items-center justify-center rounded border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-40 text-sm"
            data-ocid="editor.sections.add_button"
          >
            +
          </button>
        </div>
      </div>

      {SECTION_KEYS_PANEL.filter((sk) => sk.n <= currentCount).map((sk) => (
        <div
          key={sk.n}
          className="border border-border/40 rounded p-3 space-y-3 bg-background/30"
          data-ocid={`editor.sections.item.${sk.n}`}
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            Section {sk.n}
          </p>
          <FF label="Title">
            <Input
              value={draft[sk.titleKey] as string}
              onChange={(e) => onChange({ [sk.titleKey]: e.target.value })}
              className="bg-input border-border/60 h-8 text-sm"
            />
          </FF>
          <FF label="Label / Tag">
            <Input
              value={draft[sk.labelKey] as string}
              onChange={(e) => onChange({ [sk.labelKey]: e.target.value })}
              className="bg-input border-border/60 h-8 text-sm"
            />
          </FF>
          <FF label="Description">
            <Textarea
              value={draft[sk.descKey] as string}
              onChange={(e) => onChange({ [sk.descKey]: e.target.value })}
              rows={2}
              className="bg-input border-border/60 resize-none text-sm"
            />
          </FF>
          <ImageUploadField
            label="Card Image"
            value={draft[sk.imageKey] as string}
            onChange={(url) => onChange({ [sk.imageKey]: url })}
          />
        </div>
      ))}
    </div>
  );
}

function ArticlesPanel({
  draft,
  onChange,
}: { draft: SiteSettings; onChange: (p: Partial<SiteSettings>) => void }) {
  return (
    <div className="space-y-4">
      <FF label="Label Eyebrow">
        <Input
          value={draft.latestArticlesLabel}
          onChange={(e) => onChange({ latestArticlesLabel: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.articles.label_input"
        />
      </FF>
      <FF label="Section Title">
        <Input
          value={draft.latestArticlesTitle}
          onChange={(e) => onChange({ latestArticlesTitle: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.articles.title_input"
        />
      </FF>
    </div>
  );
}

function NewsletterPanel({
  draft,
  onChange,
}: { draft: SiteSettings; onChange: (p: Partial<SiteSettings>) => void }) {
  return (
    <div className="space-y-4">
      <FF label="Label (eyebrow)">
        <Input
          value={draft.newsletterLabel}
          onChange={(e) => onChange({ newsletterLabel: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.newsletter.label_input"
        />
      </FF>
      <FF label="Title">
        <Input
          value={draft.newsletterTitle}
          onChange={(e) => onChange({ newsletterTitle: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.newsletter.title_input"
        />
      </FF>
      <FF label="Subtitle">
        <Textarea
          value={draft.newsletterSubtitle}
          onChange={(e) => onChange({ newsletterSubtitle: e.target.value })}
          rows={2}
          className="bg-input border-border/60 resize-none text-sm"
          data-ocid="editor.newsletter.subtitle_textarea"
        />
      </FF>
      <FF label="Email Placeholder">
        <Input
          value={draft.newsletterPlaceholder}
          onChange={(e) => onChange({ newsletterPlaceholder: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.newsletter.placeholder_input"
        />
      </FF>
    </div>
  );
}

function FooterPanel({
  draft,
  onChange,
}: { draft: SiteSettings; onChange: (p: Partial<SiteSettings>) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground/70 bg-muted/30 rounded p-2">
        Navbar title and subtitle come from Site Name & Site Subtitle.
      </div>
      <FF label="Navbar Title (Site Name)">
        <Input
          value={draft.siteName}
          onChange={(e) => onChange({ siteName: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.sitename_input"
        />
      </FF>
      <FF label="Navbar Subtitle (Site Subtitle)">
        <Input
          value={draft.siteSubtitle}
          onChange={(e) => onChange({ siteSubtitle: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.sitesubtitle_input"
        />
      </FF>
      <FF label="Footer Tagline">
        <Input
          value={draft.footerTagline}
          onChange={(e) => onChange({ footerTagline: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.tagline_input"
        />
      </FF>
      <FF label="Contact Email">
        <Input
          value={draft.footerEmail}
          onChange={(e) => onChange({ footerEmail: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.email_input"
        />
      </FF>
      <FF label="Footer Description">
        <Textarea
          value={draft.footerDescription}
          onChange={(e) => onChange({ footerDescription: e.target.value })}
          rows={2}
          className="bg-input border-border/60 resize-none text-sm"
          data-ocid="editor.footer.description_textarea"
        />
      </FF>
      <FF label="LinkedIn URL">
        <Input
          value={draft.footerLinkedin}
          onChange={(e) => onChange({ footerLinkedin: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.linkedin_input"
        />
      </FF>
      <FF label="Twitter / X URL">
        <Input
          value={draft.footerTwitter}
          onChange={(e) => onChange({ footerTwitter: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.twitter_input"
        />
      </FF>
      <FF label="Instagram URL">
        <Input
          value={draft.footerInstagram}
          onChange={(e) => onChange({ footerInstagram: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.instagram_input"
        />
      </FF>
      <FF label="Footer Quote Text">
        <Textarea
          value={draft.footerQuoteText}
          onChange={(e) => onChange({ footerQuoteText: e.target.value })}
          rows={2}
          className="bg-input border-border/60 resize-none text-sm"
          data-ocid="editor.footer.quote_textarea"
        />
      </FF>
      <FF label="Footer Quote Author">
        <Input
          value={draft.footerQuoteAuthor}
          onChange={(e) => onChange({ footerQuoteAuthor: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.quote_author_input"
        />
      </FF>
      <FF label="Copyright Text">
        <Input
          value={draft.footerCopyright}
          onChange={(e) => onChange({ footerCopyright: e.target.value })}
          className="bg-input border-border/60 h-8 text-sm"
          data-ocid="editor.footer.copyright_input"
        />
      </FF>
    </div>
  );
}

// ─── Global Settings Panel ────────────────────────────────────────────────────

interface GlobalPanelProps {
  isOpen: boolean;
  draft: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

function GlobalPanel({
  isOpen,
  draft,
  onChange,
  onClose,
  onSave,
  isSaving,
}: GlobalPanelProps) {
  const radiusValue = Number.parseFloat(draft.borderRadius) || 0.25;
  const fontSizeValue = Number.parseInt(draft.baseFontSize) || 16;
  const maxWidth = Number.parseInt(draft.containerMaxWidth) || 1280;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="global-panel"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 z-[9997] w-[380px] max-w-[100vw] bg-card border-l border-border shadow-2xl flex flex-col"
          style={{ top: "48px", bottom: 0 }}
          data-ocid="editor.global_panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-sm text-foreground">
                Global Settings
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              data-ocid="editor.global_panel.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border bg-transparent px-4 pt-2 justify-start gap-1 h-auto pb-0">
                <TabsTrigger
                  value="colors"
                  className="text-xs pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  data-ocid="editor.global.colors.tab"
                >
                  Colors
                </TabsTrigger>
                <TabsTrigger
                  value="typography"
                  className="text-xs pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  data-ocid="editor.global.typography.tab"
                >
                  Typography
                </TabsTrigger>
                <TabsTrigger
                  value="layout"
                  className="text-xs pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  data-ocid="editor.global.layout.tab"
                >
                  Layout
                </TabsTrigger>
                <TabsTrigger
                  value="backgrounds"
                  className="text-xs pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  data-ocid="editor.global.backgrounds.tab"
                >
                  Backgrounds
                </TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="p-4 space-y-5 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Presets
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          onChange({
                            colorBackground: preset.background,
                            colorForeground: preset.foreground,
                            colorPrimary: preset.primary,
                            colorCard: preset.card,
                            colorMuted: preset.muted,
                            colorBorder: preset.border,
                          })
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border/50 bg-background hover:border-primary/50 transition-all text-xs"
                        data-ocid="editor.global.color_preset_button"
                      >
                        <div className="flex gap-0.5">
                          {[preset.background, preset.primary, preset.card].map(
                            (c, i) => (
                              <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                                key={i}
                                className="w-2.5 h-2.5 rounded-full border border-white/10"
                                style={{ background: `oklch(${c})` }}
                              />
                            ),
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ColorField
                    label="Background"
                    value={draft.colorBackground}
                    onChange={(v) => onChange({ colorBackground: v })}
                  />
                  <ColorField
                    label="Foreground (Text)"
                    value={draft.colorForeground}
                    onChange={(v) => onChange({ colorForeground: v })}
                  />
                  <ColorField
                    label="Primary / Accent"
                    value={draft.colorPrimary}
                    onChange={(v) => onChange({ colorPrimary: v })}
                  />
                  <ColorField
                    label="Card Surface"
                    value={draft.colorCard}
                    onChange={(v) => onChange({ colorCard: v })}
                  />
                  <ColorField
                    label="Muted"
                    value={draft.colorMuted}
                    onChange={(v) => onChange({ colorMuted: v })}
                  />
                  <ColorField
                    label="Border"
                    value={draft.colorBorder}
                    onChange={(v) => onChange({ colorBorder: v })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="typography" className="p-4 space-y-5 mt-0">
                <FF label="Heading Font">
                  <Select
                    value={draft.headingFont}
                    onValueChange={(v) => onChange({ headingFont: v })}
                  >
                    <SelectTrigger
                      className="bg-input border-border/60 h-8 text-sm"
                      data-ocid="editor.global.heading_font_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Playfair Display",
                        "Lora",
                        "EB Garamond",
                        "Cormorant Garamond",
                        "Merriweather",
                      ].map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FF>

                <FF label="Body Font">
                  <Select
                    value={draft.bodyFont}
                    onValueChange={(v) => onChange({ bodyFont: v })}
                  >
                    <SelectTrigger
                      className="bg-input border-border/60 h-8 text-sm"
                      data-ocid="editor.global.body_font_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system-ui">system-ui</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                    </SelectContent>
                  </Select>
                </FF>

                <FF label={`Base Font Size: ${fontSizeValue}px`}>
                  <Slider
                    min={14}
                    max={20}
                    step={1}
                    value={[fontSizeValue]}
                    onValueChange={([v]) =>
                      onChange({ baseFontSize: String(v) })
                    }
                    className="mt-2"
                    data-ocid="editor.global.font_size_input"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>14px</span>
                    <span>20px</span>
                  </div>
                </FF>

                <FF label={`Border Radius: ${radiusValue}rem`}>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[radiusValue]}
                    onValueChange={([v]) =>
                      onChange({ borderRadius: v.toFixed(2) })
                    }
                    className="mt-2"
                    data-ocid="editor.global.border_radius_input"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 (sharp)</span>
                    <span>1rem (pill)</span>
                  </div>
                </FF>

                {/* Font preview */}
                <div className="rounded border border-border/40 p-4 bg-background/40 space-y-2">
                  <p
                    className="text-lg font-bold text-foreground"
                    style={{
                      fontFamily: `'${draft.headingFont}', Georgia, serif`,
                    }}
                  >
                    The Forest and the Frontier
                  </p>
                  <p
                    className="text-xs text-muted-foreground leading-relaxed"
                    style={{
                      fontFamily:
                        draft.bodyFont === "system-ui"
                          ? "system-ui, sans-serif"
                          : `'${draft.bodyFont}', system-ui, sans-serif`,
                    }}
                  >
                    Notes from the edge of wilderness and power.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="p-4 space-y-5 mt-0">
                <FF label={`Container Max Width: ${maxWidth}px`}>
                  <Slider
                    min={960}
                    max={1600}
                    step={80}
                    value={[maxWidth]}
                    onValueChange={([v]) =>
                      onChange({ containerMaxWidth: String(v) })
                    }
                    className="mt-2"
                    data-ocid="editor.global.container_width_input"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>960px</span>
                    <span>1600px</span>
                  </div>
                </FF>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Section Padding
                  </Label>
                  <div className="flex gap-2">
                    {(["compact", "normal", "spacious"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => onChange({ sectionPadding: opt })}
                        className={`flex-1 px-3 py-2 text-xs rounded border transition-all capitalize ${
                          draft.sectionPadding === opt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                        }`}
                        data-ocid="editor.global.padding_toggle"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="backgrounds" className="p-4 space-y-4 mt-0">
                <p className="text-xs text-muted-foreground">
                  Set background images for each page header. Leave empty to use
                  defaults.
                </p>

                <ImageUploadField
                  label="Homepage Hero"
                  value={draft.heroBackgroundImage}
                  onChange={(url) => onChange({ heroBackgroundImage: url })}
                />
                <ImageUploadField
                  label="International Relations Page"
                  value={draft.irPageBg}
                  onChange={(url) => onChange({ irPageBg: url })}
                />
                <ImageUploadField
                  label="Forest & Field Notes Page"
                  value={draft.forestPageBg}
                  onChange={(url) => onChange({ forestPageBg: url })}
                />
                <ImageUploadField
                  label="Beyond Cutoff (UPSC) Page"
                  value={draft.upscPageBg}
                  onChange={(url) => onChange({ upscPageBg: url })}
                />
                <ImageUploadField
                  label="The Wild Within Page"
                  value={draft.wildPageBg}
                  onChange={(url) => onChange({ wildPageBg: url })}
                />
                <ImageUploadField
                  label="Personal Essays Page"
                  value={draft.essaysPageBg}
                  onChange={(url) => onChange({ essaysPageBg: url })}
                />
                <ImageUploadField
                  label="About Page"
                  value={draft.aboutPageBg}
                  onChange={(url) => onChange({ aboutPageBg: url })}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card/95 flex-shrink-0">
            <Button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs"
              data-ocid="editor.global_panel.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save All Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border/60 text-xs"
              data-ocid="editor.global_panel.close_button"
            >
              Close
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function EditorLoginScreen({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(password);
    if (!ok) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 35%, oklch(0.50 0.10 150) 0%, transparent 50%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Visual Editor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your admin password to continue
          </p>
        </div>

        <div className="border border-border/40 bg-card rounded-lg p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10 bg-input border-border/60 focus-visible:ring-primary/40"
                  autoComplete="current-password"
                  data-ocid="editor.password_input"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-destructive"
                  data-ocid="editor.login.error_state"
                >
                  Incorrect password. Try again.
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="editor.login_button"
            >
              Enter Visual Editor
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          <a href="/admin" className="hover:text-muted-foreground">
            ← Back to Admin Panel
          </a>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Visual Editor ────────────────────────────────────────────────────────────

function VisualEditor() {
  const { data: remoteSettings } = useGetSiteSettings();
  const setSiteSettings = useSetSiteSettings();

  const [draft, setDraft] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem("site_settings");
      return cached ? (JSON.parse(cached) as SiteSettings) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [globalPanelOpen, setGlobalPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync draft when remote loads
  useEffect(() => {
    if (remoteSettings) {
      setDraft(remoteSettings);
    }
  }, [remoteSettings]);

  // Apply CSS whenever draft changes
  useEffect(() => {
    applyDraftCSS(draft);
  }, [draft]);

  const handleChange = (partial: Partial<SiteSettings>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setSiteSettings.mutateAsync(draft);
      localStorage.setItem("site_settings", JSON.stringify(draft));
      toast.success("Site settings saved successfully.");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleZoneEdit = (zoneId: string) => {
    setGlobalPanelOpen(false);
    setActiveZone(zoneId);
  };

  const handleGlobalOpen = () => {
    setActiveZone(null);
    setGlobalPanelOpen(true);
  };

  return (
    <EditorSettingsContext.Provider value={draft}>
      <div className="min-h-screen bg-background">
        {/* ── Fixed Toolbar ── */}
        <header
          className="fixed top-0 left-0 right-0 z-[9999] h-12 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-3 gap-2"
          data-ocid="editor.toolbar"
        >
          {/* Left side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/admin"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded transition-colors"
              data-ocid="editor.back_to_admin_link"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </a>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded transition-colors"
              data-ocid="editor.view_site_link"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Site ↗</span>
            </a>
          </div>

          {/* Center title */}
          <div className="flex-1 text-center">
            <span className="font-display text-xs font-semibold tracking-widest uppercase text-muted-foreground hidden md:inline">
              Visual Editor
            </span>
            <span className="font-display text-xs font-semibold text-muted-foreground md:hidden">
              <Monitor className="w-3.5 h-3.5 inline" />
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit mode toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {isEditMode ? "Edit Mode" : "Preview"}
              </span>
              <Switch
                checked={isEditMode}
                onCheckedChange={(checked) => {
                  setIsEditMode(checked);
                  if (!checked) {
                    setActiveZone(null);
                    setGlobalPanelOpen(false);
                  }
                }}
                data-ocid="editor.edit_mode_toggle"
              />
              <span className="hidden sm:inline text-xs font-medium text-foreground">
                {isEditMode ? (
                  <span className="text-primary">ON</span>
                ) : (
                  <span className="text-muted-foreground">OFF</span>
                )}
              </span>
            </div>

            {/* Global settings */}
            <button
              type="button"
              onClick={handleGlobalOpen}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition-colors ${
                globalPanelOpen
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              title="Global Settings (Colors, Fonts, Layout)"
              data-ocid="editor.global_settings_button"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Global</span>
            </button>

            {/* Save button */}
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 px-3 text-xs gap-1.5"
              data-ocid="editor.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Edit Mode Banner */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-12 left-0 right-0 z-[9990] bg-primary/10 border-b border-primary/20 px-4 py-1.5 text-center"
            >
              <p className="text-xs text-primary font-medium">
                ✏ Edit Mode is ON — click any text or background directly to
                edit, or use the corner ⚙ button for section settings
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content with top padding for toolbar */}
        <div
          style={{ paddingTop: isEditMode ? "72px" : "48px" }}
          className="transition-all duration-200"
        >
          <HomepagePreview
            isEditMode={isEditMode}
            onEdit={handleZoneEdit}
            draft={draft}
            onChange={handleChange}
          />
        </div>

        {/* Right panels */}
        <EditPanel
          zoneId={activeZone}
          draft={draft}
          onChange={handleChange}
          onClose={() => setActiveZone(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <GlobalPanel
          isOpen={globalPanelOpen}
          draft={draft}
          onChange={handleChange}
          onClose={() => setGlobalPanelOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </EditorSettingsContext.Provider>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function VisualEditorPage() {
  const { isAuthenticated, login } = useEditorAuth();

  if (!isAuthenticated) {
    return <EditorLoginScreen onLogin={login} />;
  }

  return <VisualEditor />;
}
