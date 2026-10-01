"use client";

import Image from "next/image";
import { useState } from "react";
import { supplementImageSrc, type SupplementCatalogEntry } from "@/data/nutrition/supplement-catalog";

/**
 * Kleine productfoto bij een zoekresultaat of dagboekregel — zelfde foto's
 * als op `/beste/*`. Niet elk catalogusitem heeft een `imageFile`; dan (en
 * bij een 404) toont dit een letter-placeholder, analoog aan `FoodThumbnail`.
 */
const BOX: Record<24 | 40 | 48, string> = {
  24: "h-6 w-6 text-[11px] rounded-full",
  40: "h-10 w-10 text-[17px] rounded-lg",
  48: "h-12 w-12 text-[20px] rounded-lg",
};

export default function SupplementThumbnail({
  entry,
  size = 40,
}: {
  entry: SupplementCatalogEntry;
  size?: 24 | 40 | 48;
}) {
  const [failed, setFailed] = useState(false);
  const src = supplementImageSrc(entry);
  const letter = entry.labelNl.trim().charAt(0).toUpperCase() || "?";
  const box = BOX[size];

  if (failed || !src) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center bg-[rgb(var(--vd-accent-2-rgb)/20%)] font-medium text-[var(--vd-accent-2)] ${box}`}
      >
        {letter}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={entry.labelNl}
      width={size}
      height={size}
      className={`shrink-0 object-cover ${box}`}
      onError={() => setFailed(true)}
    />
  );
}
