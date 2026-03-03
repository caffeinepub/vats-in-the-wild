import { useEffect } from "react";
import { Category } from "../backend.d";
import SectionListPage from "./SectionListPage";

export default function ForestFieldNotesPage() {
  useEffect(() => {
    document.title = "Forest & Field Notes — Vats in the Wild";
  }, []);

  return (
    <SectionListPage
      category={Category.forest_field_notes}
      title="Forest & Field Notes"
      description="Field experiences, wildlife insights, conservation challenges, and policy reflections from India's forests. Grounded, experiential, observational."
      backgroundImage="/assets/generated/section-forest-notes.dim_800x500.jpg"
      label="Conservation"
    />
  );
}
