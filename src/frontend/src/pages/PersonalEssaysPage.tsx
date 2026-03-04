import { useEffect } from "react";
import { Category } from "../backend.d";
import { useSiteSettings } from "../hooks/useSiteSettings";
import SectionListPage from "./SectionListPage";

export default function PersonalEssaysPage() {
  const settings = useSiteSettings();

  useEffect(() => {
    document.title = "Personal Essays — Vats in the Wild";
  }, []);

  return (
    <SectionListPage
      category={Category.personal_essays}
      title={settings.essaysTitle || "Personal Essays"}
      description={
        settings.essaysDescription ||
        "Long-form reflections on leadership, public service, growth, discipline, solitude, and responsibility. Honest writing in the tradition of the personal essay."
      }
      backgroundImage={
        settings.essaysPageBg ||
        "/assets/generated/section-personal-essays.dim_800x500.jpg"
      }
      label={settings.essaysLabel || "Reflections"}
    />
  );
}
