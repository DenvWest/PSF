"use client";

import type { ReactNode } from "react";
import { ALLE_CATEGORIEEN } from "@/data/blog/categorieen";
import type { ContentAudience } from "@/lib/content-audience";
import type { LibraryItem } from "@/lib/library/library-item";
import { leestijdInMinuten } from "@/lib/library/leestijd";
import BlogCategorieIcon from "@/components/blog/BlogCategorieIcon";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import type { AudienceContext } from "@/components/library/LibraryAudienceLens";

const AUDIENCE_CONTEXT: Record<ContentAudience, AudienceContext> = {
  alle: {
    toelichting:
      "Kies Mannen of Vrouwen om gerichte artikelen bovenaan te zetten.",
  },
  mannen: {
    toelichting: "Artikelen voor mannen 30+ staan nu bovenaan.",
    link: { label: "Naar de pijler Testosteron na 30", href: "/testosteron-na-40" },
  },
  vrouwen: {
    toelichting: "Artikelen over de overgang staan nu bovenaan.",
    link: { label: "Naar de pijler Overgang", href: "/overgang" },
  },
};

const CROSS_LINKS = [
  {
    label: "Kennisbank",
    hint: "Uitleg van begrippen, met bronnen.",
    href: "/kennisbank",
  },
  {
    label: "Supplementen vergelijken",
    hint: "Producten vergelijken op dezelfde criteria.",
    href: "/supplementen",
  },
  {
    label: "Gezondheidsgidsen",
    hint: "Gratis gidsen per thema.",
    href: "/gidsen",
  },
];

const SORTS = [
  { key: "nieuwste", label: "Nieuwste eerst" },
  { key: "bronnen", label: "Meeste bronnen" },
  { key: "alfabet", label: "Op titel" },
] as const;

type BlogLibraryProps = {
  items: LibraryItem[];
  initialAudience?: ContentAudience;
  initialGroup?: string;
  personalSlot?: ReactNode;
  footerSlot?: ReactNode;
};

export default function BlogLibrary({
  items,
  initialAudience,
  initialGroup,
  personalSlot,
  footerSlot,
}: BlogLibraryProps) {
  return (
    <LibraryBrowser
      surface="blog"
      items={items}
      groups={ALLE_CATEGORIEEN.map((categorie) => ({
        key: categorie.id,
        label: categorie.naam,
        icon: <BlogCategorieIcon categorie={categorie.id} className="h-4 w-4" />,
      }))}
      allesLabel="Alle onderwerpen"
      itemNoun={{ enkel: "artikel", meervoud: "artikelen" }}
      intro={{
        title: "Onderwerpen",
        body: "Kies een onderwerp of zoek op klacht.",
      }}
      audienceContext={AUDIENCE_CONTEXT}
      initialAudience={initialAudience}
      initialGroup={initialGroup}
      filters={[
        {
          key: "kort",
          label: "Kort (≤ 6 min)",
          predicate: (item: LibraryItem) =>
            leestijdInMinuten(item.metaLabel ?? "") <= 6,
        },
        {
          key: "onderbouwd",
          label: "8+ bronnen",
          predicate: (item: LibraryItem) => (item.sourceCount ?? 0) >= 8,
        },
      ]}
      sorts={SORTS}
      zoekPlaceholder="Zoek op klacht of stof"
      crossLinks={CROSS_LINKS}
      personalSlot={personalSlot}
      footerSlot={footerSlot}
    />
  );
}
