import { useEffect } from "react";
import { Category } from "../backend.d";
import { useSiteSettings } from "../hooks/useSiteSettings";
import SectionListPage from "./SectionListPage";

export default function BeyondCutoffPage() {
  const settings = useSiteSettings();

  useEffect(() => {
    document.title = "Beyond Cutoff — UPSC Strategy — Vats in the Wild";
  }, []);

  return (
    <SectionListPage
      category={Category.beyond_cutoff}
      title={settings.upscTitle || "Beyond Cutoff"}
      description={
        settings.upscDescription ||
        "High-quality insights for civil services aspirants. Strategy articles, booklists, essay thoughts, discipline and mindset posts — from someone who has been through the fire."
      }
      backgroundImage={
        settings.upscPageBg || "/assets/generated/section-upsc.dim_800x500.jpg"
      }
      label={settings.upscLabel || "UPSC Strategy"}
    />
  );
}
