import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { FileMetadata, SiteSettings } from "../backend.d";
import { useAddMediaFile } from "../hooks/useAdminQueries";
import {
  useGetSiteSettings,
  useSetSiteSettings,
} from "../hooks/useAdminSiteSettings";
import { DEFAULT_SETTINGS } from "../hooks/useSiteSettings";

// ─── Color Presets ────────────────────────────────────────────────────────────

type ColorPreset = {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  card: string;
  muted: string;
  border: string;
};

const COLOR_PRESETS: ColorPreset[] = [
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function oklchSwatch(values: string) {
  return `oklch(${values})`;
}

// ─── Section Form Helpers ──────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
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

// Compress image using canvas before upload (makes uploads 10-20x faster)
async function compressImage(file: File): Promise<Uint8Array<ArrayBuffer>> {
  // Only compress JPEG/WebP/AVIF — keep PNG as-is for transparency
  if (file.type === "image/png") {
    return fileToUint8Array(file);
  }

  const MAX_DIM = 1600;
  const QUALITY = 0.82;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }
          blob
            .arrayBuffer()
            .then((buf) => resolve(new Uint8Array(buf)))
            .catch(reject);
        },
        "image/jpeg",
        QUALITY,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  uploadOcid?: string;
  inputOcid?: string;
}

function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  uploadOcid,
  inputOcid,
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
      const bytes = await compressImage(file);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setProgress(pct),
      );
      const metadata: FileMetadata = {
        id: crypto.randomUUID(),
        blob,
        mimeType: file.type === "image/png" ? file.type : "image/jpeg",
        filename: file.name,
        sizeBytes: BigInt(bytes.byteLength),
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
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {/* Thumbnail preview */}
      {value && (
        <div className="relative w-24 h-14 rounded overflow-hidden border border-border/60 flex-shrink-0">
          <img
            src={value}
            alt="Background preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* Hidden file input */}
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

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={progress !== null}
        className="border-border/60 gap-2 text-xs"
        data-ocid={uploadOcid}
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

      {/* URL input */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Or paste URL</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /assets/..."
          className="bg-input border-border/60 text-xs"
          data-ocid={inputOcid}
        />
      </div>
    </div>
  );
}

// ─── Save Button Helper ────────────────────────────────────────────────────────

interface SaveButtonProps {
  isPending: boolean;
  onClick: () => void;
  ocid?: string;
}

function SaveButton({ isPending, onClick, ocid }: SaveButtonProps) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-border/30">
      <Button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        data-ocid={ocid ?? "admin.customizer.save_button"}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" /> Save Changes
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Live Color Swatch ────────────────────────────────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border border-border/60 flex-shrink-0"
          style={{ background: oklchSwatch(value) }}
          title={`oklch(${value})`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="L C H  e.g. 0.13 0.01 70"
          className="bg-input border-border/60 font-mono text-xs flex-1"
        />
      </div>
    </div>
  );
}

// ─── Typography Tab ────────────────────────────────────────────────────────────

function TypographyTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const radiusValue = Number.parseFloat(settings.borderRadius) || 0.25;
  const fontSizeValue = Number.parseInt(settings.baseFontSize) || 16;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Heading Font">
          <Select
            value={settings.headingFont}
            onValueChange={(v) => onChange({ headingFont: v })}
          >
            <SelectTrigger
              className="bg-input border-border/60"
              data-ocid="admin.customizer.heading_font_select"
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
        </FormField>

        <FormField label="Body Font">
          <Select
            value={settings.bodyFont}
            onValueChange={(v) => onChange({ bodyFont: v })}
          >
            <SelectTrigger
              className="bg-input border-border/60"
              data-ocid="admin.customizer.body_font_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system-ui">system-ui (Default)</SelectItem>
              <SelectItem value="Inter">Inter</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        label={`Base Font Size: ${fontSizeValue}px`}
        hint="Adjusts the root font size across the entire site."
      >
        <Slider
          min={14}
          max={20}
          step={1}
          value={[fontSizeValue]}
          onValueChange={([v]) => onChange({ baseFontSize: String(v) })}
          className="mt-2"
          data-ocid="admin.customizer.font_size_input"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>14px (compact)</span>
          <span>20px (large)</span>
        </div>
      </FormField>

      <FormField label={`Border Radius: ${radiusValue}rem`}>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={[radiusValue]}
          onValueChange={([v]) => onChange({ borderRadius: v.toFixed(2) })}
          className="mt-2"
          data-ocid="admin.customizer.border_radius_input"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 (sharp)</span>
          <span>0.5 (rounded)</span>
          <span>1rem (pill)</span>
        </div>
        {/* Visual examples */}
        <div className="flex gap-3 mt-3">
          {[0, 0.25, 0.5, 1].map((r) => (
            <div
              key={r}
              className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] text-muted-foreground"
              style={{ borderRadius: `${r}rem` }}
            >
              {r}
            </div>
          ))}
        </div>
      </FormField>

      {/* Font preview */}
      <Card className="bg-background/30 border-border/30">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Preview
          </p>
          <p
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: `'${settings.headingFont}', Georgia, serif` }}
          >
            The Forest and the Frontier
          </p>
          <p
            className="text-sm text-muted-foreground leading-relaxed"
            style={{
              fontFamily:
                settings.bodyFont === "system-ui"
                  ? "system-ui, sans-serif"
                  : `'${settings.bodyFont}', system-ui, sans-serif`,
            }}
          >
            An officer's field notes from the edge of wilderness and power. Each
            word chosen carefully, each paragraph earned through experience.
          </p>
        </CardContent>
      </Card>

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── Colors Tab ────────────────────────────────────────────────────────────────

function ColorsTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const applyPreset = (preset: ColorPreset) => {
    onChange({
      colorBackground: preset.background,
      colorForeground: preset.foreground,
      colorPrimary: preset.primary,
      colorCard: preset.card,
      colorMuted: preset.muted,
      colorBorder: preset.border,
    });
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Color Presets</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
              data-ocid="admin.customizer.color_preset_button"
            >
              <div className="flex gap-0.5">
                {[preset.background, preset.primary, preset.card].map(
                  (c, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: static list
                      key={i}
                      className="w-3 h-3 rounded-full border border-white/10"
                      style={{ background: `oklch(${c})` }}
                    />
                  ),
                )}
              </div>
              <span className="text-muted-foreground">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual color fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ColorField
          label="Background"
          value={settings.colorBackground}
          onChange={(v) => onChange({ colorBackground: v })}
        />
        <ColorField
          label="Foreground (Text)"
          value={settings.colorForeground}
          onChange={(v) => onChange({ colorForeground: v })}
        />
        <ColorField
          label="Primary / Accent"
          value={settings.colorPrimary}
          onChange={(v) => onChange({ colorPrimary: v })}
        />
        <ColorField
          label="Card Surface"
          value={settings.colorCard}
          onChange={(v) => onChange({ colorCard: v })}
        />
        <ColorField
          label="Muted"
          value={settings.colorMuted}
          onChange={(v) => onChange({ colorMuted: v })}
        />
        <ColorField
          label="Border"
          value={settings.colorBorder}
          onChange={(v) => onChange({ colorBorder: v })}
        />
      </div>

      {/* Live mini preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Live Preview</Label>
        <div
          className="rounded border overflow-hidden"
          style={{ borderColor: `oklch(${settings.colorBorder})` }}
        >
          <div
            className="p-4 space-y-3"
            style={{ background: `oklch(${settings.colorBackground})` }}
          >
            <p
              className="text-lg font-bold"
              style={{ color: `oklch(${settings.colorForeground})` }}
            >
              Heading Text
            </p>
            <p
              className="text-sm"
              style={{ color: `oklch(${settings.colorMuted})` }}
            >
              Body / muted text preview
            </p>
            <div className="flex gap-2">
              <div
                className="px-3 py-1 text-xs rounded"
                style={{
                  background: `oklch(${settings.colorPrimary})`,
                  color: `oklch(${settings.colorBackground})`,
                }}
              >
                Primary Button
              </div>
              <div
                className="px-3 py-1 text-xs rounded border"
                style={{
                  borderColor: `oklch(${settings.colorBorder})`,
                  color: `oklch(${settings.colorForeground})`,
                  background: `oklch(${settings.colorCard})`,
                }}
              >
                Card
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── Layout Tab ────────────────────────────────────────────────────────────────

function LayoutTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const maxWidth = Number.parseInt(settings.containerMaxWidth) || 1280;

  return (
    <div className="space-y-6">
      <FormField
        label={`Container Max Width: ${maxWidth}px`}
        hint="Controls the maximum width of content containers across all pages."
      >
        <Slider
          min={960}
          max={1600}
          step={80}
          value={[maxWidth]}
          onValueChange={([v]) => onChange({ containerMaxWidth: String(v) })}
          className="mt-2"
          data-ocid="admin.customizer.container_width_input"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>960px (narrow)</span>
          <span>1280px (standard)</span>
          <span>1600px (wide)</span>
        </div>
      </FormField>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Section Padding</Label>
        <p className="text-xs text-muted-foreground">
          Controls vertical spacing between sections. Spacious adds breathing
          room; compact tightens the layout.
        </p>
        <div className="flex gap-2 mt-2">
          {(["compact", "normal", "spacious"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ sectionPadding: opt })}
              className={`px-4 py-2 text-sm rounded border transition-all capitalize ${
                settings.sectionPadding === opt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
              data-ocid="admin.customizer.padding_toggle"
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">Compact:</strong> py-12 / py-16
            — denser, more content visible
          </p>
          <p>
            <strong className="text-foreground">Normal:</strong> py-20 / py-28 —
            balanced editorial rhythm
          </p>
          <p>
            <strong className="text-foreground">Spacious:</strong> py-28 / py-36
            — generous breathing room
          </p>
        </div>
      </div>

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── Hero Section Tab ──────────────────────────────────────────────────────────

function HeroTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const opacity = Number.parseFloat(settings.heroOverlayOpacity) || 0.6;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Site Name">
          <Input
            value={settings.siteName}
            onChange={(e) => onChange({ siteName: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.sitename_input"
          />
        </FormField>

        <FormField label="Site Subtitle (Tagline)">
          <Input
            value={settings.siteSubtitle}
            onChange={(e) => onChange({ siteSubtitle: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.site_subtitle_input"
          />
        </FormField>

        <FormField
          label="Hero Title"
          hint="Large heading displayed in the hero section"
        >
          <Input
            value={settings.heroTitle}
            onChange={(e) => onChange({ heroTitle: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.hero_title_input"
          />
        </FormField>

        <FormField label="Eyebrow Text" hint="Small uppercase text above title">
          <Input
            value={settings.heroEyebrow}
            onChange={(e) => onChange({ heroEyebrow: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.hero_eyebrow_input"
          />
        </FormField>
      </div>

      <FormField
        label="Hero Tagline"
        hint="Italic line displayed below the hero title"
      >
        <Input
          value={settings.heroTagline}
          onChange={(e) => onChange({ heroTagline: e.target.value })}
          className="bg-input border-border/60"
          data-ocid="admin.customizer.hero_tagline_input"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Primary CTA Button">
          <Input
            value={settings.heroCtaPrimary}
            onChange={(e) => onChange({ heroCtaPrimary: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.hero_cta_primary_input"
          />
        </FormField>

        <FormField label="Secondary CTA Button">
          <Input
            value={settings.heroCtaSecondary}
            onChange={(e) => onChange({ heroCtaSecondary: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.hero_cta_secondary_input"
          />
        </FormField>
      </div>

      <FormField
        label={`Hero Overlay Opacity: ${opacity.toFixed(2)}`}
        hint="Controls how dark the overlay on the hero background image appears."
      >
        <Slider
          min={0}
          max={0.9}
          step={0.05}
          value={[opacity]}
          onValueChange={([v]) =>
            onChange({ heroOverlayOpacity: v.toFixed(2) })
          }
          className="mt-2"
          data-ocid="admin.customizer.hero_opacity_input"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 (transparent)</span>
          <span>0.6 (default)</span>
          <span>0.9 (very dark)</span>
        </div>
      </FormField>

      {/* Newsletter Section */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Newsletter Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Newsletter Label">
              <Input
                value={settings.newsletterLabel}
                onChange={(e) => onChange({ newsletterLabel: e.target.value })}
                className="bg-input border-border/60"
                data-ocid="admin.customizer.newsletter_label_input"
              />
            </FormField>
            <FormField label="Newsletter Placeholder">
              <Input
                value={settings.newsletterPlaceholder}
                onChange={(e) =>
                  onChange({ newsletterPlaceholder: e.target.value })
                }
                className="bg-input border-border/60"
                data-ocid="admin.customizer.newsletter_placeholder_input"
              />
            </FormField>
          </div>
          <FormField label="Newsletter Title">
            <Input
              value={settings.newsletterTitle}
              onChange={(e) => onChange({ newsletterTitle: e.target.value })}
              className="bg-input border-border/60"
              data-ocid="admin.customizer.newsletter_title_input"
            />
          </FormField>
          <FormField label="Newsletter Subtitle">
            <Textarea
              value={settings.newsletterSubtitle}
              onChange={(e) => onChange({ newsletterSubtitle: e.target.value })}
              rows={2}
              className="bg-input border-border/60 resize-none"
              data-ocid="admin.customizer.newsletter_subtitle_textarea"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Latest Articles Section Heading */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Latest Articles Section Heading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Label (eyebrow text)">
              <Input
                value={settings.latestArticlesLabel}
                onChange={(e) =>
                  onChange({ latestArticlesLabel: e.target.value })
                }
                className="bg-input border-border/60"
                data-ocid="admin.customizer.latest_label_input"
              />
            </FormField>
            <FormField label="Section Title">
              <Input
                value={settings.latestArticlesTitle}
                onChange={(e) =>
                  onChange({ latestArticlesTitle: e.target.value })
                }
                className="bg-input border-border/60"
                data-ocid="admin.customizer.latest_title_input"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── Sections Grid Tab ─────────────────────────────────────────────────────────

const SECTION_KEYS: {
  n: number;
  titleKey: keyof SiteSettings;
  labelKey: keyof SiteSettings;
  descKey: keyof SiteSettings;
}[] = [
  {
    n: 1,
    titleKey: "section1Title",
    labelKey: "section1Label",
    descKey: "section1Description",
  },
  {
    n: 2,
    titleKey: "section2Title",
    labelKey: "section2Label",
    descKey: "section2Description",
  },
  {
    n: 3,
    titleKey: "section3Title",
    labelKey: "section3Label",
    descKey: "section3Description",
  },
  {
    n: 4,
    titleKey: "section4Title",
    labelKey: "section4Label",
    descKey: "section4Description",
  },
  {
    n: 5,
    titleKey: "section5Title",
    labelKey: "section5Label",
    descKey: "section5Description",
  },
  {
    n: 6,
    titleKey: "section6Title",
    labelKey: "section6Label",
    descKey: "section6Description",
  },
  {
    n: 7,
    titleKey: "section7Title",
    labelKey: "section7Label",
    descKey: "section7Description",
  },
  {
    n: 8,
    titleKey: "section8Title",
    labelKey: "section8Label",
    descKey: "section8Description",
  },
];

// Per-page hero text keys
const PAGE_HERO_KEYS: {
  page: string;
  titleKey: keyof SiteSettings;
  labelKey: keyof SiteSettings;
  descKey: keyof SiteSettings;
}[] = [
  {
    page: "International Relations",
    titleKey: "irTitle",
    labelKey: "irLabel",
    descKey: "irDescription",
  },
  {
    page: "Forest & Field Notes",
    titleKey: "forestTitle",
    labelKey: "forestLabel",
    descKey: "forestDescription",
  },
  {
    page: "Beyond Cutoff (UPSC)",
    titleKey: "upscTitle",
    labelKey: "upscLabel",
    descKey: "upscDescription",
  },
  {
    page: "The Wild Within",
    titleKey: "wildTitle",
    labelKey: "wildLabel",
    descKey: "wildDescription",
  },
  {
    page: "Personal Essays",
    titleKey: "essaysTitle",
    labelKey: "essaysLabel",
    descKey: "essaysDescription",
  },
];

function SectionsTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const currentCount = Math.min(
    8,
    Math.max(5, Number.parseInt(settings.sectionCount) || 5),
  );

  const handleAddSection = () => {
    if (currentCount < 8) {
      onChange({ sectionCount: String(currentCount + 1) });
    }
  };

  const handleRemoveSection = () => {
    if (currentCount > 5) {
      onChange({ sectionCount: String(currentCount - 1) });
    }
  };

  return (
    <div className="space-y-5">
      {/* Active Sections Control */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Active Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveSection}
                disabled={currentCount <= 5}
                className="border-border/60 gap-1.5 text-xs"
                data-ocid="admin.customizer.sections.remove_button"
              >
                <Minus className="w-3 h-3" /> Remove Section
              </Button>
              <span className="text-sm font-medium text-foreground px-3 py-1.5 bg-primary/10 border border-primary/20 rounded text-center min-w-[2.5rem]">
                {currentCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSection}
                disabled={currentCount >= 8}
                className="border-border/60 gap-1.5 text-xs"
                data-ocid="admin.customizer.sections.add_button"
              >
                <Plus className="w-3 h-3" /> Add Section
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Min 5, Max 8 sections shown on homepage
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section Cards */}
      {SECTION_KEYS.filter((sk) => sk.n <= currentCount).map((sk) => (
        <Card
          key={sk.n}
          className="bg-background/30 border-border/40"
          data-ocid={`admin.customizer.sections.item.${sk.n}`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              Section {sk.n}
              {sk.n > 5 && (
                <span className="text-xs font-normal text-muted-foreground px-1.5 py-0.5 bg-muted/60 rounded">
                  Custom
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Title">
                <Input
                  value={settings[sk.titleKey] as string}
                  onChange={(e) => onChange({ [sk.titleKey]: e.target.value })}
                  className="bg-input border-border/60"
                />
              </FormField>
              <FormField label="Label / Tag">
                <Input
                  value={settings[sk.labelKey] as string}
                  onChange={(e) => onChange({ [sk.labelKey]: e.target.value })}
                  className="bg-input border-border/60"
                  placeholder="e.g. World Affairs"
                />
              </FormField>
            </div>
            <FormField label="Description">
              <Textarea
                value={settings[sk.descKey] as string}
                onChange={(e) => onChange({ [sk.descKey]: e.target.value })}
                rows={2}
                className="bg-input border-border/60 resize-none"
              />
            </FormField>
          </CardContent>
        </Card>
      ))}

      {/* Per-Page Hero Text */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Per-Page Hero Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Customize the title, label, and description shown at the top of each
            section page.
          </p>
          {PAGE_HERO_KEYS.map((pk) => (
            <div
              key={pk.page}
              className="border border-border/30 rounded p-4 space-y-3"
            >
              <p className="text-sm font-semibold text-foreground">{pk.page}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Page Title">
                  <Input
                    value={settings[pk.titleKey] as string}
                    onChange={(e) =>
                      onChange({ [pk.titleKey]: e.target.value })
                    }
                    className="bg-input border-border/60"
                  />
                </FormField>
                <FormField label="Label / Eyebrow">
                  <Input
                    value={settings[pk.labelKey] as string}
                    onChange={(e) =>
                      onChange({ [pk.labelKey]: e.target.value })
                    }
                    className="bg-input border-border/60"
                  />
                </FormField>
              </div>
              <FormField label="Description">
                <Textarea
                  value={settings[pk.descKey] as string}
                  onChange={(e) => onChange({ [pk.descKey]: e.target.value })}
                  rows={2}
                  className="bg-input border-border/60 resize-none"
                />
              </FormField>
            </div>
          ))}

          {/* About Page Title/Subtitle */}
          <div className="border border-border/30 rounded p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">About Page</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Page Title">
                <Input
                  value={settings.aboutPageTitle}
                  onChange={(e) => onChange({ aboutPageTitle: e.target.value })}
                  className="bg-input border-border/60"
                />
              </FormField>
              <FormField label="Page Subtitle">
                <Input
                  value={settings.aboutPageSubtitle}
                  onChange={(e) =>
                    onChange({ aboutPageSubtitle: e.target.value })
                  }
                  className="bg-input border-border/60"
                />
              </FormField>
            </div>
          </div>
        </CardContent>
      </Card>

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── Backgrounds Tab ───────────────────────────────────────────────────────────

function BackgroundsTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Page Backgrounds */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Page Backgrounds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground">
            Upload or paste a URL for each page's background image. Leave empty
            to use the default image.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField
              label="Homepage Hero"
              value={settings.heroBackgroundImage}
              onChange={(url) => onChange({ heroBackgroundImage: url })}
              hint="Main hero background image on the homepage"
              uploadOcid="admin.customizer.bg.hero_upload_button"
              inputOcid="admin.customizer.bg.hero_url_input"
            />
            <ImageUploadField
              label="International Relations Page"
              value={settings.irPageBg}
              onChange={(url) => onChange({ irPageBg: url })}
              uploadOcid="admin.customizer.bg.ir_upload_button"
              inputOcid="admin.customizer.bg.ir_url_input"
            />
            <ImageUploadField
              label="Forest & Field Notes Page"
              value={settings.forestPageBg}
              onChange={(url) => onChange({ forestPageBg: url })}
              uploadOcid="admin.customizer.bg.forest_upload_button"
              inputOcid="admin.customizer.bg.forest_url_input"
            />
            <ImageUploadField
              label="Beyond Cutoff (UPSC) Page"
              value={settings.upscPageBg}
              onChange={(url) => onChange({ upscPageBg: url })}
              uploadOcid="admin.customizer.bg.upsc_upload_button"
              inputOcid="admin.customizer.bg.upsc_url_input"
            />
            <ImageUploadField
              label="The Wild Within Page"
              value={settings.wildPageBg}
              onChange={(url) => onChange({ wildPageBg: url })}
              uploadOcid="admin.customizer.bg.wild_upload_button"
              inputOcid="admin.customizer.bg.wild_url_input"
            />
            <ImageUploadField
              label="Personal Essays Page"
              value={settings.essaysPageBg}
              onChange={(url) => onChange({ essaysPageBg: url })}
              uploadOcid="admin.customizer.bg.essays_upload_button"
              inputOcid="admin.customizer.bg.essays_url_input"
            />
            <ImageUploadField
              label="About Page"
              value={settings.aboutPageBg}
              onChange={(url) => onChange({ aboutPageBg: url })}
              uploadOcid="admin.customizer.bg.about_upload_button"
              inputOcid="admin.customizer.bg.about_url_input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Card Images */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Section Card Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground">
            Override the image displayed on each section card on the homepage.
            Leave empty to use the default.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
              const imageKey = `section${n}Image` as keyof SiteSettings;
              return (
                <ImageUploadField
                  key={n}
                  label={`Section ${n} Card Image`}
                  value={settings[imageKey] as string}
                  onChange={(url) => onChange({ [imageKey]: url })}
                  uploadOcid={`admin.customizer.bg.section${n}_upload_button`}
                  inputOcid={`admin.customizer.bg.section${n}_url_input`}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Homepage Inner Section Backgrounds */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Homepage Inner Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground">
            Set a background image for each section on the homepage. A dark
            overlay is applied automatically so text stays readable.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField
              label="About Preview Section"
              value={settings.homepageAboutBg}
              onChange={(url) => onChange({ homepageAboutBg: url })}
              uploadOcid="admin.customizer.bg.homepage_about_upload_button"
              inputOcid="admin.customizer.bg.homepage_about_url_input"
            />
            <ImageUploadField
              label="Featured Sections Grid"
              value={settings.homepageSectionsBg}
              onChange={(url) => onChange({ homepageSectionsBg: url })}
              uploadOcid="admin.customizer.bg.homepage_sections_upload_button"
              inputOcid="admin.customizer.bg.homepage_sections_url_input"
            />
            <ImageUploadField
              label="Latest Articles Section"
              value={settings.homepageLatestBg}
              onChange={(url) => onChange({ homepageLatestBg: url })}
              uploadOcid="admin.customizer.bg.homepage_latest_upload_button"
              inputOcid="admin.customizer.bg.homepage_latest_url_input"
            />
            <ImageUploadField
              label="Newsletter Section"
              value={settings.homepageNewsletterBg}
              onChange={(url) => onChange({ homepageNewsletterBg: url })}
              uploadOcid="admin.customizer.bg.homepage_newsletter_upload_button"
              inputOcid="admin.customizer.bg.homepage_newsletter_url_input"
            />
            <ImageUploadField
              label="Quote Section"
              value={settings.homepageQuoteBg}
              onChange={(url) => onChange({ homepageQuoteBg: url })}
              uploadOcid="admin.customizer.bg.homepage_quote_upload_button"
              inputOcid="admin.customizer.bg.homepage_quote_url_input"
            />
          </div>
        </CardContent>
      </Card>

      {/* About Page Inner Section Backgrounds */}
      <Card className="bg-background/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            About Page Inner Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground">
            Set a background image for each section on the About page. A dark
            overlay is applied automatically so text stays readable.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField
              label="Bio Section"
              value={settings.aboutBioBg}
              onChange={(url) => onChange({ aboutBioBg: url })}
              uploadOcid="admin.customizer.bg.about_bio_upload_button"
              inputOcid="admin.customizer.bg.about_bio_url_input"
            />
            <ImageUploadField
              label="Principles / Values Section"
              value={settings.aboutValuesBg}
              onChange={(url) => onChange({ aboutValuesBg: url })}
              uploadOcid="admin.customizer.bg.about_values_upload_button"
              inputOcid="admin.customizer.bg.about_values_url_input"
            />
            <ImageUploadField
              label="What I Write About Section"
              value={settings.aboutWritingBg}
              onChange={(url) => onChange({ aboutWritingBg: url })}
              uploadOcid="admin.customizer.bg.about_writing_upload_button"
              inputOcid="admin.customizer.bg.about_writing_url_input"
            />
            <ImageUploadField
              label="Contact Section"
              value={settings.aboutContactBg}
              onChange={(url) => onChange({ aboutContactBg: url })}
              uploadOcid="admin.customizer.bg.about_contact_upload_button"
              inputOcid="admin.customizer.bg.about_contact_url_input"
            />
          </div>
        </CardContent>
      </Card>

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── About Preview Tab ─────────────────────────────────────────────────────────

function AboutTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Display Name">
          <Input
            value={settings.aboutPreviewName}
            onChange={(e) => onChange({ aboutPreviewName: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.about_name_input"
          />
        </FormField>

        <FormField label="Subtitle / Role">
          <Input
            value={settings.aboutPreviewSubtitle}
            onChange={(e) => onChange({ aboutPreviewSubtitle: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.about_subtitle_input"
          />
        </FormField>
      </div>

      <FormField label="Bio Paragraph 1">
        <Textarea
          value={settings.aboutPreviewText1}
          onChange={(e) => onChange({ aboutPreviewText1: e.target.value })}
          rows={3}
          className="bg-input border-border/60 resize-y"
          data-ocid="admin.customizer.about_bio1_textarea"
        />
      </FormField>

      <FormField label="Bio Paragraph 2">
        <Textarea
          value={settings.aboutPreviewText2}
          onChange={(e) => onChange({ aboutPreviewText2: e.target.value })}
          rows={3}
          className="bg-input border-border/60 resize-y"
          data-ocid="admin.customizer.about_bio2_textarea"
        />
      </FormField>

      <ImageUploadField
        label="Portrait Photo (Homepage)"
        value={settings.aboutPortraitUrl}
        onChange={(url) => onChange({ aboutPortraitUrl: url })}
        hint="Shown in the about preview on the homepage."
        uploadOcid="admin.customizer.about_portrait_upload_button"
        inputOcid="admin.customizer.about_portrait_input"
      />

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── Footer & Navbar Tab ──────────────────────────────────────────────────────

function FooterTab({
  settings,
  onChange,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  onChange: (partial: Partial<SiteSettings>) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="p-3 bg-primary/5 border border-primary/20 rounded text-xs text-muted-foreground">
        Navbar title and subtitle are shared with the Hero Section tab (Site
        Name & Site Subtitle fields).
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Navbar Title (= Site Name)">
          <Input
            value={settings.siteName}
            onChange={(e) => onChange({ siteName: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.footer_sitename_input"
          />
        </FormField>

        <FormField label="Navbar Subtitle (= Site Subtitle)">
          <Input
            value={settings.siteSubtitle}
            onChange={(e) => onChange({ siteSubtitle: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.footer_sitesubtitle_input"
          />
        </FormField>

        <FormField label="Footer Tagline">
          <Input
            value={settings.footerTagline}
            onChange={(e) => onChange({ footerTagline: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.footer_tagline_input"
          />
        </FormField>

        <FormField label="Contact Email">
          <Input
            type="email"
            value={settings.footerEmail}
            onChange={(e) => onChange({ footerEmail: e.target.value })}
            className="bg-input border-border/60"
            data-ocid="admin.customizer.footer_email_input"
          />
        </FormField>
      </div>

      <FormField label="Footer Description">
        <Textarea
          value={settings.footerDescription}
          onChange={(e) => onChange({ footerDescription: e.target.value })}
          rows={2}
          className="bg-input border-border/60 resize-none"
          data-ocid="admin.customizer.footer_description_textarea"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="LinkedIn URL">
          <Input
            value={settings.footerLinkedin}
            onChange={(e) => onChange({ footerLinkedin: e.target.value })}
            placeholder="https://linkedin.com/in/..."
            className="bg-input border-border/60"
            data-ocid="admin.customizer.footer_linkedin_input"
          />
        </FormField>
        <FormField label="Twitter / X URL">
          <Input
            value={settings.footerTwitter}
            onChange={(e) => onChange({ footerTwitter: e.target.value })}
            placeholder="https://x.com/..."
            className="bg-input border-border/60"
            data-ocid="admin.customizer.footer_twitter_input"
          />
        </FormField>
        <FormField label="Instagram URL">
          <Input
            value={settings.footerInstagram}
            onChange={(e) => onChange({ footerInstagram: e.target.value })}
            placeholder="https://instagram.com/..."
            className="bg-input border-border/60"
            data-ocid="admin.customizer.footer_instagram_input"
          />
        </FormField>
      </div>

      <FormField label="Footer Quote Text">
        <Textarea
          value={settings.footerQuoteText}
          onChange={(e) => onChange({ footerQuoteText: e.target.value })}
          rows={2}
          className="bg-input border-border/60 resize-none"
          data-ocid="admin.customizer.footer_quote_textarea"
        />
      </FormField>

      <FormField label="Footer Quote Author">
        <Input
          value={settings.footerQuoteAuthor}
          onChange={(e) => onChange({ footerQuoteAuthor: e.target.value })}
          placeholder="e.g. John Muir"
          className="bg-input border-border/60"
          data-ocid="admin.customizer.footer_quote_author_input"
        />
      </FormField>

      <FormField label="Copyright Text">
        <Input
          value={settings.footerCopyright}
          onChange={(e) => onChange({ footerCopyright: e.target.value })}
          placeholder="Vats in the Wild. All rights reserved."
          className="bg-input border-border/60"
          data-ocid="admin.customizer.footer_copyright_input"
        />
      </FormField>

      <SaveButton isPending={isPending} onClick={onSave} />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminCustomizerSection() {
  const { data: remoteSettings, isLoading } = useGetSiteSettings();
  const setSiteSettings = useSetSiteSettings();

  // Local draft state
  const [draft, setDraft] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Sync local draft when backend data loads
  useEffect(() => {
    if (remoteSettings) {
      setDraft(remoteSettings);
    }
  }, [remoteSettings]);

  const handleChange = (partial: Partial<SiteSettings>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    try {
      await setSiteSettings.mutateAsync(draft);
      toast.success("Site settings saved successfully.");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    }
  };

  const handleReset = async () => {
    try {
      await setSiteSettings.mutateAsync(DEFAULT_SETTINGS);
      setDraft(DEFAULT_SETTINGS);
      localStorage.setItem("site_settings", JSON.stringify(DEFAULT_SETTINGS));
      setResetDialogOpen(false);
      toast.success("Settings reset to defaults.");
    } catch {
      toast.error("Failed to reset settings.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="admin.customizer.loading_state">
        {["r1", "r2", "r3"].map((k) => (
          <div key={k} className="h-20 rounded bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Site Customizer
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Edit every visual aspect of your site — fonts, colors, layout, text,
            and more.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setResetDialogOpen(true)}
          className="border-border/60 gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/40"
          data-ocid="admin.customizer.reset_button"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Defaults
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded text-sm text-foreground/80">
        <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
        Changes take effect immediately across all pages after saving.
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-card/60 border border-border/40 p-1">
          <TabsTrigger
            value="typography"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.typography_tab"
          >
            Typography
          </TabsTrigger>
          <TabsTrigger
            value="colors"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.colors_tab"
          >
            Colors
          </TabsTrigger>
          <TabsTrigger
            value="layout"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.layout_tab"
          >
            Layout
          </TabsTrigger>
          <TabsTrigger
            value="hero"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.hero_tab"
          >
            Hero Section
          </TabsTrigger>
          <TabsTrigger
            value="sections"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.sections_tab"
          >
            Sections Grid
          </TabsTrigger>
          <TabsTrigger
            value="backgrounds"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.backgrounds_tab"
          >
            Backgrounds
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.about_tab"
          >
            About Preview
          </TabsTrigger>
          <TabsTrigger
            value="footer"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.customizer.footer_tab"
          >
            Footer & Navbar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="typography" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <TypographyTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <ColorsTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <LayoutTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <HeroTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <SectionsTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backgrounds" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <BackgroundsTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <AboutTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="mt-0">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6">
              <FooterTab
                settings={draft}
                onChange={handleChange}
                onSave={handleSave}
                isPending={setSiteSettings.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onOpenChange={(open) => setResetDialogOpen(open)}
      >
        <DialogContent
          className="bg-card border-border/40"
          data-ocid="admin.customizer.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Reset to Defaults?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              All customizations — colors, fonts, layout, text — will be
              reverted to the original Forest Dark theme. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              className="border-border/60"
              data-ocid="admin.customizer.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={setSiteSettings.isPending}
              data-ocid="admin.customizer.confirm_button"
            >
              {setSiteSettings.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...
                </>
              ) : (
                "Reset Everything"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
