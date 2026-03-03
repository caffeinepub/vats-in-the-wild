import { useEffect } from "react";
import { Category } from "../backend.d";
import SectionListPage from "./SectionListPage";

export default function PersonalEssaysPage() {
  useEffect(() => {
    document.title = "Personal Essays — Vats in the Wild";
  }, []);

  return (
    <SectionListPage
      category={Category.personal_essays}
      title="Personal Essays"
      description="Long-form reflections on leadership, public service, growth, discipline, solitude, and responsibility. Honest writing in the tradition of the personal essay."
      backgroundImage="/assets/generated/section-personal-essays.dim_800x500.jpg"
      label="Reflections"
    />
  );
}
