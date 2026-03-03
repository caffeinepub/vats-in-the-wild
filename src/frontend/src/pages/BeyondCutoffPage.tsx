import { useEffect } from "react";
import { Category } from "../backend.d";
import SectionListPage from "./SectionListPage";

export default function BeyondCutoffPage() {
  useEffect(() => {
    document.title = "Beyond Cutoff — UPSC Strategy — Vats in the Wild";
  }, []);

  return (
    <SectionListPage
      category={Category.beyond_cutoff}
      title="Beyond Cutoff"
      description="High-quality insights for civil services aspirants. Strategy articles, booklists, essay thoughts, discipline and mindset posts — from someone who has been through the fire."
      backgroundImage="/assets/generated/section-upsc.dim_800x500.jpg"
      label="UPSC Strategy"
    />
  );
}
