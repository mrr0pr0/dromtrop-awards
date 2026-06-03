export type CategoryLayout =
  | "medie"
  | "itProduct"
  | "concept"
  | "shortFilm"
  | "originalIdea"
  | "interactive"
  | "animation"
  | "storytelling"
  | "default";

export type NomineeFieldKey =
  | "description"
  | "site_url"
  | "video_url"
  | "what_we_made";

function normalizeCategory(name: string): string {
  return name.trim().toLowerCase();
}

export function getCategoryLayout(categoryName: string): CategoryLayout {
  const n = normalizeCategory(categoryName);

  if (
    n.includes("medieprodukt") ||
    n.includes("medieproduksjon") ||
    n.includes("medieprudukt")
  ) {
    return "medie";
  }
  if (
    n.includes("beste it-produkt") ||
    n.includes("beste app") ||
    n.includes("beste nettside")
  ) {
    return "itProduct";
  }
  if (n.includes("beste konsept")) return "concept";
  if (n.includes("beste kortfilm")) return "shortFilm";
  if (n.includes("mest originale idé") || n.includes("mest originale ide"))
    return "originalIdea";
  if (n.includes("beste interaktiv") || n.includes("beste spill"))
    return "interactive";
  if (n.includes("beste animasjon")) return "animation";
  if (n.includes("beste historiefortelling")) return "storytelling";

  return "default";
}

const LAYOUT_FIELDS: Record<CategoryLayout, NomineeFieldKey[]> = {
  medie: ["description"],
  itProduct: ["description", "site_url"],
  concept: ["description"],
  shortFilm: ["description", "video_url"],
  originalIdea: ["description", "what_we_made"],
  interactive: ["description", "site_url"],
  animation: [],
  storytelling: ["description"],
  default: [],
};

export function getVisibleNomineeFields(categoryName: string): NomineeFieldKey[] {
  return LAYOUT_FIELDS[getCategoryLayout(categoryName)];
}

export function categorySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
