import type { ReactNode } from "react";

export type FoodMotif =
  | "groenten"
  | "fruit"
  | "granen"
  | "brood"
  | "pasta"
  | "peulvruchten"
  | "noten"
  | "zaden"
  | "vlees"
  | "vis"
  | "eieren"
  | "zuivel"
  | "kaas"
  | "plantaardig"
  | "vetten"
  | "sauzen"
  | "ontbijt"
  | "snacks"
  | "soepen"
  | "maaltijden"
  | "dranken"
  | "aardappel"
  | "snoep"
  | "verpakt";

const MOTIEVEN: Record<FoodMotif, ReactNode> = {
  groenten: (
    <>
      <rect x="21" y="26" width="6" height="14" rx="3" fill="#8DBF9B" />
      <circle cx="16" cy="22" r="8" fill="#5A8F6A" />
      <circle cx="32" cy="22" r="8" fill="#5A8F6A" />
      <circle cx="24" cy="14" r="9" fill="#6FA17C" />
    </>
  ),
  fruit: (
    <>
      <circle cx="18" cy="27" r="9" fill="#D95C4F" />
      <circle cx="30" cy="27" r="9" fill="#D95C4F" />
      <path d="M24 18c0-4 1-6 3-8" stroke="#7A4E2A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M26 12c3-3 7-2 8 0-3 2-6 2-8 0z" fill="#5A8F6A" />
    </>
  ),
  granen: (
    <>
      <path d="M24 42V12" stroke="#A9743F" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="9" rx="3" ry="5" fill="#E8B54E" />
      <ellipse cx="19" cy="18" rx="3" ry="5" transform="rotate(-30 19 18)" fill="#E8B54E" />
      <ellipse cx="29" cy="18" rx="3" ry="5" transform="rotate(30 29 18)" fill="#E8B54E" />
      <ellipse cx="19" cy="27" rx="3" ry="5" transform="rotate(-30 19 27)" fill="#E8B54E" />
      <ellipse cx="29" cy="27" rx="3" ry="5" transform="rotate(30 29 27)" fill="#E8B54E" />
      <ellipse cx="19" cy="36" rx="3" ry="5" transform="rotate(-30 19 36)" fill="#E8B54E" />
      <ellipse cx="29" cy="36" rx="3" ry="5" transform="rotate(30 29 36)" fill="#E8B54E" />
    </>
  ),
  brood: (
    <>
      <path d="M8 28c0-9 7-14 16-14s16 5 16 14v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill="#D9A25A" />
      <path d="M17 21l4 7M24 19l4 8M31 21l3 6" stroke="#F5E6C8" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  pasta: (
    <>
      <path d="M7 24h34a17 17 0 0 1-34 0z" fill="#F4F1EA" />
      <path
        d="M11 23c2-7 4-7 6 0s4 7 6 0 4-7 6 0 4 7 6 0"
        stroke="#E8B54E"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  peulvruchten: (
    <>
      <path d="M8 34c0-16 14-26 32-24-1 18-12 28-32 24z" fill="#6FA17C" />
      <circle cx="17" cy="29" r="4" fill="#B9DDA8" />
      <circle cx="25" cy="23" r="4" fill="#B9DDA8" />
      <circle cx="32" cy="16" r="3.5" fill="#B9DDA8" />
    </>
  ),
  noten: (
    <>
      <ellipse cx="24" cy="25" rx="14" ry="12" fill="#B07A45" />
      <path d="M24 13v24" stroke="#7A4E2A" strokeWidth="2" />
      <path d="M16 20c3 2 3 8 0 10M32 20c-3 2-3 8 0 10" stroke="#7A4E2A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  zaden: (
    <>
      <ellipse cx="16" cy="26" rx="3.5" ry="6" transform="rotate(-25 16 26)" fill="#C9A25A" />
      <ellipse cx="26" cy="21" rx="3.5" ry="6" transform="rotate(10 26 21)" fill="#B58B43" />
      <ellipse cx="32" cy="32" rx="3.5" ry="6" transform="rotate(40 32 32)" fill="#C9A25A" />
    </>
  ),
  vlees: (
    <>
      <path d="M10 26c0-9 8-14 18-13 8 1 12 7 10 14-2 8-10 11-18 9-6-1-10-5-10-10z" fill="#C8574F" />
      <path d="M17 26c0-5 5-8 11-7 5 1 7 5 5 9-2 5-8 6-12 4-3-1-4-3-4-6z" fill="#E58F8F" />
    </>
  ),
  vis: (
    <>
      <path d="M6 24c6-9 16-11 24-6l8-6v24l-8-6c-8 5-18 3-24-6z" fill="#6FA8C7" />
      <circle cx="14" cy="22" r="1.8" fill="#1F3A4D" />
      <path d="M20 18c2 4 2 8 0 12" stroke="#9CCDE4" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  eieren: (
    <>
      <path d="M10 26c-2-8 6-14 14-13 9-1 16 5 14 13-1 8-9 10-15 9-7 1-12-2-13-9z" fill="#F4F1EA" />
      <circle cx="24" cy="25" r="7" fill="#F2B03E" />
    </>
  ),
  zuivel: (
    <>
      <path d="M14 18l6-8h8l6 8v22a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z" fill="#F4F1EA" />
      <path d="M14 18h20" stroke="#CFCAB8" strokeWidth="2" />
      <rect x="14" y="26" width="20" height="9" fill="#6FA8C7" />
    </>
  ),
  kaas: (
    <>
      <path d="M6 32l34-14v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="#F2C14E" />
      <path d="M6 32L30 12l10 6z" fill="#F7D879" />
      <circle cx="16" cy="34" r="2.5" fill="#D9A93A" />
      <circle cx="27" cy="31" r="2" fill="#D9A93A" />
      <circle cx="34" cy="26" r="2.2" fill="#D9A93A" />
    </>
  ),
  plantaardig: (
    <>
      <path d="M24 40V24" stroke="#5A8F6A" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 26c-9 1-13-5-13-11 8 0 13 3 13 11z" fill="#8DBF9B" />
      <path d="M24 22c0-8 5-12 13-12 0 8-5 12-13 12z" fill="#5A8F6A" />
    </>
  ),
  vetten: (
    <>
      <rect x="20" y="8" width="8" height="8" rx="2" fill="#7A8F3F" />
      <path d="M16 20c0-3 4-4 4-4h8s4 1 4 4v18a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="#B7C75A" />
      <rect x="19" y="26" width="10" height="8" rx="1.5" fill="#F4F1EA" />
    </>
  ),
  sauzen: (
    <>
      <rect x="14" y="10" width="20" height="6" rx="2" fill="#D95C4F" />
      <rect x="12" y="16" width="24" height="24" rx="5" fill="#E8943A" />
      <rect x="16" y="23" width="16" height="10" rx="1.5" fill="#F4F1EA" />
    </>
  ),
  ontbijt: (
    <>
      <path d="M8 24h32a16 16 0 0 1-32 0z" fill="#F4F1EA" />
      <path d="M10 24c2-5 6-6 8-4 2-4 8-4 9 0 3-3 8-1 11 4z" fill="#E8B54E" />
      <path d="M33 8l-8 13" stroke="#CFCAB8" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  snacks: (
    <>
      <circle cx="24" cy="24" r="15" fill="#D9A25A" />
      <circle cx="18" cy="19" r="2.5" fill="#7A4E2A" />
      <circle cx="30" cy="21" r="2.5" fill="#7A4E2A" />
      <circle cx="22" cy="30" r="2.5" fill="#7A4E2A" />
      <circle cx="32" cy="31" r="2" fill="#7A4E2A" />
      <circle cx="15" cy="28" r="2" fill="#7A4E2A" />
    </>
  ),
  soepen: (
    <>
      <path d="M8 26h32a16 16 0 0 1-32 0z" fill="#F4F1EA" />
      <ellipse cx="24" cy="26" rx="16" ry="3.5" fill="#E8943A" />
      <path
        d="M18 19c-2-3 2-4 0-8M26 19c-2-3 2-4 0-8M34 19c-2-3 2-4 0-8"
        stroke="#CFCAB8"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  maaltijden: (
    <>
      <circle cx="24" cy="24" r="16" fill="#F4F1EA" />
      <circle cx="24" cy="24" r="10" fill="#E3DDCB" />
      <circle cx="21" cy="22" r="4" fill="#8DBF9B" />
      <circle cx="28" cy="24" r="4" fill="#E8943A" />
      <circle cx="23" cy="29" r="3.5" fill="#D9A25A" />
    </>
  ),
  dranken: (
    <>
      <path d="M14 14h20l-3 24a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2z" fill="#9CCDE4" />
      <path d="M16 22h16l-1.5 16a2 2 0 0 1-2 2H19.5a2 2 0 0 1-2-2z" fill="#6FA8C7" />
      <path d="M28 18l5-10" stroke="#D95C4F" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  aardappel: (
    <>
      <path d="M8 26c0-9 8-14 17-14s15 6 15 14-8 12-16 12S8 34 8 26z" fill="#C99A5B" />
      <circle cx="18" cy="24" r="1.6" fill="#8A6232" />
      <circle cx="28" cy="20" r="1.6" fill="#8A6232" />
      <circle cx="30" cy="30" r="1.6" fill="#8A6232" />
      <circle cx="20" cy="32" r="1.6" fill="#8A6232" />
    </>
  ),
  snoep: (
    <>
      <rect x="10" y="10" width="28" height="30" rx="3" fill="#7A4E2A" />
      <path d="M10 20h28M10 30h28M24 10v30" stroke="#5A3719" strokeWidth="1.5" />
      <rect x="10" y="10" width="28" height="7" rx="3" fill="#D95C4F" />
    </>
  ),
  verpakt: (
    <>
      <path d="M8 16l16-8 16 8v18l-16 8-16-8z" fill="#C9A77A" />
      <path d="M8 16l16 8 16-8" stroke="#E7D3AE" strokeWidth="2" fill="none" />
      <path d="M24 24v18" stroke="#A07F4F" strokeWidth="2" />
    </>
  ),
};

/** Vlakke illustratie van een voedingsmiddelgroep of -categorie. Decoratief. */
export default function FoodIllustration({
  motief,
  className,
}: {
  motief: FoodMotif;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {MOTIEVEN[motief]}
    </svg>
  );
}
