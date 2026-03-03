import { useEffect } from "react";
import { Category } from "../backend.d";
import SectionListPage from "./SectionListPage";

const SUBCATEGORIES = [
  "India & Neighbourhood",
  "Indo-Pacific",
  "Climate Diplomacy",
  "Strategic Affairs",
  "Global Institutions",
];

export default function InternationalRelationsPage() {
  useEffect(() => {
    document.title =
      "International Relations & World Affairs — Vats in the Wild";
  }, []);

  return (
    <SectionListPage
      category={Category.international_relations}
      title="International Relations"
      description="Analytical essays on geopolitics, India's foreign policy, strategic affairs, and global power shifts. Written from the field, not from think-tank corridors."
      backgroundImage="/assets/generated/section-international-relations.dim_800x500.jpg"
      label="World Affairs"
      subcategories={SUBCATEGORIES}
    />
  );
}
