import { CATEGORIE_CONFIG } from "@/data/blog/categorieen";
import type { BlogArtikel, BlogCategorie } from "@/types/blog";

export interface BlogCover {
  src: string;
  alt: string;
}

/**
 * Categorie-fallbackbeelden (hubs / nieuwe artikelen zonder eigen cover).
 * Artikelen hebben normaal een eigen `coverImage` — zie `blogCover()`.
 */
const CATEGORIE_COVER: Record<BlogCategorie, BlogCover> = {
  stress: {
    src: "/images/blog/categorie-stress.jpg",
    alt: "Persoon in rustige houding bij natuurlijk licht, gericht op herstel van stress",
  },
  slaap: {
    src: "/images/blog/categorie-slaap.jpg",
    alt: "Netjes opgemaakt bed in een rustige slaapkamer",
  },
  energie: {
    src: "/images/blog/categorie-energie.jpg",
    alt: "Persoon die een pad oploopt in de buitenlucht",
  },
  supplementen: {
    src: "/images/blog/categorie-supplementen.jpg",
    alt: "Supplementen en capsules op een licht werkblad",
  },
};

export function categorieCover(categorie: BlogCategorie): BlogCover {
  return CATEGORIE_COVER[categorie];
}

/** Artikeleigen beeld wint; anders valt het terug op het categoriebeeld. */
export function blogCover(
  artikel: Pick<BlogArtikel, "categorie" | "coverImage" | "coverImageAlt">,
): BlogCover {
  if (artikel.coverImage) {
    return {
      src: artikel.coverImage,
      alt: artikel.coverImageAlt || categorieCover(artikel.categorie).alt,
    };
  }
  return categorieCover(artikel.categorie);
}

export const ALLE_CATEGORIE_COVERS = Object.entries(CATEGORIE_COVER).map(
  ([id, cover]) => ({
    categorie: id as BlogCategorie,
    naam: CATEGORIE_CONFIG[id as BlogCategorie].naam,
    ...cover,
  }),
);
