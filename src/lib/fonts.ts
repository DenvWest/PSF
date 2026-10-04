import localFont from "next/font/local";

/**
 * DM Sans en DM Serif Display, zelf gehost (OFL, licenties in `src/app/fonts/`).
 *
 * Niet via `next/font/google`: die haalt de bestanden bij elke build op bij
 * Google Fonts, en een mislukte fetch laat `next build` falen (CI en
 * `deploy.sh`, okt 2026). Bestanden: Google Fonts v17, subset latin — dezelfde
 * subset die eerder werd gebruikt. DM Sans is variabel (300–700).
 *
 * Elke plek houdt zijn eigen CSS-variabele; de bestanden worden gedeeld.
 */

export const siteSerif = localFont({
  src: "../app/fonts/DMSerifDisplay-latin-400.woff2",
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

export const siteSans = localFont({
  src: "../app/fonts/DMSans-latin-variable.woff2",
  weight: "300 700",
  variable: "--font-body",
  display: "swap",
});

export const intakeSans = localFont({
  src: "../app/fonts/DMSans-latin-variable.woff2",
  weight: "300 700",
  variable: "--font-intake-body",
  display: "swap",
});

export const intakeSerif = localFont({
  src: [
    { path: "../app/fonts/DMSerifDisplay-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/DMSerifDisplay-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-intake-heading",
  display: "swap",
});

export const adminSans = localFont({
  src: "../app/fonts/DMSans-latin-variable.woff2",
  weight: "300 700",
  variable: "--font-dm-sans",
});

export const adminSerif = localFont({
  src: "../app/fonts/DMSerifDisplay-latin-400.woff2",
  weight: "400",
  variable: "--font-dm-serif",
});
