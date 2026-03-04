import { useEffect } from "react";
import { Category } from "../backend.d";
import { useSiteSettings } from "../hooks/useSiteSettings";
import SectionListPage from "./SectionListPage";

export default function ForestFieldNotesPage() {
  const settings = useSiteSettings();

  useEffect(() => {
    document.title = "Forest & Field Notes — Vats in the Wild";
  }, []);

  return (
    <SectionListPage
      category={Category.forest_field_notes}
      title={settings.forestTitle || "Forest & Field Notes"}
      description={
        settings.forestDescription ||
        "Field experiences, wildlife insights, conservation challenges, and policy reflections from India's forests. Grounded, experiential, observational."
      }
      backgroundImage={
        settings.forestPageBg ||
        "/assets/generated/section-forest-notes.dim_800x500.jpg"
      }
      label={settings.forestLabel || "Conservation"}
    />
  );
}
