#!/usr/bin/env node
/**
 * Bouwt de docs/design-prebuilds om tot inbedbare surfaces onder
 * public/prebuilds/, zodat het dashboard ze letterlijk kan tonen zonder
 * dat je twee navigaties over elkaar krijgt.
 *
 * Drie ingrepen, allemaal additief — de bron in docs/design blijft de
 * bron en wordt nooit gewijzigd:
 *
 *  1. Reviewer-chrome verbergen (.chrome, .notes) en de interne appbar
 *     (.appbar): het echte dashboard levert die navigatie al. De knoppen
 *     blijven in de DOM staan — punt 2 gebruikt ze.
 *  2. Beginstand uit de URL: we klikken de (verborgen) chrome-schakelaar
 *     die er al is, in plaats van de interne state-variabelen te patchen.
 *     Zo blijft de prebuild de baas over zijn eigen staat.
 *  3. Uitgaande navigatie doorgeven aan de parent via postMessage, i.p.v.
 *     intern van scherm wisselen. Zo volgt de echte tab mee.
 *  4. De base64-fonts eruit. Elke prebuild droeg dezelfde twee woff2-bestanden
 *     als data-URI mee: ~73 KB per bestand, in zes van de zeven identiek, en
 *     base64 blaast de al gecomprimeerde fontdata ook nog eens met een derde
 *     op. Ze worden hier één keer weggeschreven onder een inhouds-hash en
 *     vanuit één stylesheet geladen, zodat de browser ze over alle domeinen
 *     heen hergebruikt (zie de immutable-header in next.config.ts).
 *
 * Draaien:  npm run build:prebuilds
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "docs", "design");
const OUT = join(root, "public", "prebuilds");

/**
 * `nav` vertaalt een intent binnen de prebuild naar een echte dashboard-route.
 * De sleutels zijn de attribuutwaarden die de prebuilds zelf al gebruiken:
 * `data-goto`/`data-bridge` in v3.6, en de `hub_click:<doel>:<bron>`-conventie
 * uit bestand A en B.
 */
const TARGETS = [
  {
    src: "beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html",
    out: "beweging-v3.6.html",
    // Scherm E = Vandaag › Beweging is wat Kompas · Beweging toont.
    initial: { param: "screen", selector: (v) => `#screenSwitch button[data-go="${v}"]` },
    defaultParams: { screen: "e" },
    nav: {
      "goto:d": { tab: "agenda" },
      "goto:c": { tab: "voortgang", screen: "leefstijlprofiel", fav: "beweging" },
      "goto:f": { tab: "voortgang", screen: "favorieten", fav: "beweging" },
      "goto:b": { tab: "voortgang", screen: "favorieten", fav: "beweging", schap: "producten" },
      "bridge:e": { tab: "voortgang", screen: "favorieten", fav: "beweging", schap: "producten" },
    },
  },
  {
    src: "leefstijlprofiel-domein-keuze-prebuild-v3-2026-08.html",
    out: "leefstijlprofiel-v3.html",
    initial: { param: "domein", selector: (v) => `#swDomein button[data-domein="${v}"]` },
    defaultParams: { domein: "beweging" },
    nav: {
      "hub:favorieten": { tab: "voortgang", screen: "favorieten", useDomein: true },
      "hub:vandaag": { tab: "vandaag", useDomeinAsKompas: true },
    },
  },
  {
    src: "favorieten-schap-prebuild-v3-2026-08.html",
    out: "favorieten-schap-v3.html",
    initial: { param: "schaptab", selector: (v) => `#swTab button[data-tab="${v}"]` },
    defaultParams: { schaptab: "producten" },
    nav: {
      "hub:leefstijlprofiel": { tab: "voortgang", screen: "leefstijlprofiel", useDomein: true },
      "hub:vandaag": { tab: "vandaag", useDomeinAsKompas: true },
    },
  },

  /* De drie piramide-prebuilds. Alle drie dezelfde chrome-conventie
     (#frameSwitch met data-frame), en alle drie een VPNOTE-map die hun
     frames al aan echte routes koppelt — die map is hier overgenomen.
     Route: K/kompas → VQ/test → VR/resultaat → VL/voortgang. */
  {
    src: "slaap-piramide-v2-prebuild-2026-08.html",
    out: "slaap-v2.html",
    initial: { param: "frame", selector: (v) => `#frameSwitch button[data-frame="${v}"]` },
    defaultParams: { frame: "K" },
    nav: {
      "goto:MD": { tab: "agenda" },
      "goto:VL": { tab: "voortgang", screen: "leefstijlprofiel", fav: "slaap" },
      "goto:V1": { tab: "voortgang" },
    },
  },
  {
    src: "stress-piramide-prebuild-v1-2026-08.html",
    out: "stress-v1.html",
    initial: { param: "frame", selector: (v) => `#frameSwitch button[data-frame="${v}"]` },
    defaultParams: { frame: "K" },
    nav: {
      "goto:MD": { tab: "agenda" },
      "goto:SL": { tab: "voortgang", screen: "leefstijlprofiel", fav: "stress" },
    },
  },
  {
    src: "verbinding-piramide-prebuild-v1-2026-08.html",
    out: "verbinding-v1.html",
    initial: { param: "frame", selector: (v) => `#frameSwitch button[data-frame="${v}"]` },
    defaultParams: { frame: "K" },
    nav: {
      "goto:MD": { tab: "agenda" },
      "goto:VL": { tab: "voortgang", screen: "leefstijlprofiel", fav: "verbinding" },
    },
  },
  {
    src: "voeding-piramide-prebuild-v1.5-2026-08.html",
    out: "voeding-v1.5.html",
    initial: { param: "frame", selector: (v) => `#frameSwitch button[data-frame="${v}"]` },
    defaultParams: { frame: "K" },
    nav: {
      "goto:VL": { tab: "voortgang", screen: "leefstijlprofiel", fav: "voeding" },
    },
  },
];

const EMBED_STYLE = `
<style data-embed>
  /* Reviewer-chrome en de interne appbar horen niet in het product: het
     dashboard eromheen levert die navigatie al. Verbergen, niet slopen —
     de chrome-knoppen zetten hieronder nog de beginstand. */
  .chrome, .notes, .vpnote, .appbar { display: none !important; }
  .stage { padding: 0 !important; }
  /* Vloeiend i.p.v. de vaste 375/1280-wissel: de @container-regels in de
     prebuild moeten op de échte breedte reageren (mobiel/iPad/desktop). */
  .surface, .app { width: 100% !important; max-width: 100% !important;
                   border: 0 !important; border-radius: 0 !important;
                   box-shadow: none !important; }

  /* Eén schil voor álle surfaces (19 aug). Elke prebuild bracht zijn eigen
     achtergrond, randkleur en inktschaal mee — beweging op #1a2e1a, de rest
     op #132414, met drie varianten van --line ertussen. In het dashboard
     staan ze naast elkaar, dus draaien ze hier allemaal op de tokens van het
     leefstijlprofiel: dat scherm is de referentie. De rand eromheen zet
     PrebuildFrame, zodat elk domein exact hetzelfde kader krijgt. */
  :root, .surf-intake, .surf-dash {
    --shell:#132414 !important;
    --bg:#132414 !important;
    --panel:rgba(255,255,255,.045) !important;
    --panel-2:rgba(0,0,0,.20) !important;
    --line:rgba(255,255,255,.11) !important;
    --line-soft:rgba(255,255,255,.06) !important;
    --ink:#F1EFE8 !important;
    --soft:#CDD7D0 !important;
    --mut:#9FB0A6 !important;
    --subtle:#7E8C82 !important;
  }
  /* Niet transparant: dan liep de bijna-zwarte --shell als band onder de
     content door zodra die korter was dan het frame. */
  html, body, .stage { background:#132414 !important; }
  .surface, .app { background:#132414 !important; }

  /* Reviewer-restanten die buiten .notes vallen: stress en verbinding hangen
     hun ontwerpnotities als los <details> onder .stage. */
  body > details { display:none !important; }

  /* Voeding rendert renderK in een tweede .screen binnen de eerste; zonder
     dit telt de padding dubbel en springt juist dat domein verder in. */
  .screen .screen, .pad .pad { padding:0 !important; }

  /* Eén scherm, geen tweede scrollbalk (19 aug). De pagina zelf scrollt;
     de surface krijgt geen eigen overflow meer. Compactere maatvoering
     zodat een domein binnen één beeld past. */
  html, body { height: auto !important; overflow: visible !important; }
  .surface, .app { overflow: visible !important; }
  .pad, .screen { padding: 14px 16px 14px !important; }
  .stack { gap: 11px !important; }
  .cols { gap: 16px !important; }
  .kdome, .tile, .ktile, .panel { padding: 12px !important; }
  .kdome .kstat { margin-top: 10px !important; }
  .attnbar { margin-top: 10px !important; padding-top: 9px !important; }
  .actie { padding: 8px 0 !important; }
  .backrow { margin-bottom: 12px !important; }

  /* Op desktop staan de twee slot-knoppen naast elkaar in plaats van
     onder elkaar. Dat scheelt een knophoogte plus een gap — genoeg om
     elk domein binnen één beeld te houden — en leest als primair naast
     secundair. Alle vijf domeinen bouwen dit blok hetzelfde op: een
     .stack met btn-terra, btn-ghost en de voetnoot. */
  @container app (min-width: 760px) {
    .stack:has(> .btn-terra) { flex-direction: row !important; flex-wrap: wrap;
                               align-items: center; }
    .stack:has(> .btn-terra) > .btn-terra,
    .stack:has(> .btn-terra) > .btn-ghost { flex: 1 1 240px; width: auto !important; }
    .stack:has(> .btn-terra) > .footnote,
    .stack:has(> .btn-terra) > .kfoot { flex: 1 1 100%; min-width: 100%;
                                        max-width: none !important; }
  }

  /* Knoppen reageren zichtbaar: hover, actief én toetsenbord-focus.
     Voorheen had alleen een deel van de knoppen een hover-regel. */
  button, .btn, .mini-btn, .chip, a.btn-terra, a.btn-ghost, .opt, .sw {
    transition: background-color .15s ease, border-color .15s ease,
                color .15s ease, transform .08s ease, opacity .15s ease;
  }
  button:not([disabled]):hover, .chip:not([disabled]):hover,
  .mini-btn:not([disabled]):hover, .opt:hover,
  a.btn-terra:hover, a.btn-ghost:hover { filter: brightness(1.12); }
  button:not([disabled]):active, .chip:not([disabled]):active,
  .mini-btn:not([disabled]):active, .opt:active,
  a.btn-terra:active, a.btn-ghost:active { transform: translateY(1px); }
  button:focus-visible, a:focus-visible, .chip:focus-visible,
  .mini-btn:focus-visible, .opt:focus-visible {
    outline: 2px solid var(--sage-lt, #9CC5A9); outline-offset: 2px;
  }
  button[disabled] { opacity: .5; cursor: not-allowed; }

</style>`;

function embedRuntime(config) {
  return `
<script data-embed>
(function () {
  "use strict";
  var P = new URLSearchParams(location.search);
  var NAV = ${JSON.stringify(config.nav)};
  var DOMEIN = P.get("domein") || P.get("fav") || "beweging";

  /* Beginstand via de bestaande (verborgen) chrome-schakelaar: die roept de
     eigen paint() van de prebuild aan, dus we hoeven geen interne state te
     kennen. */
  var initValue = P.get(${JSON.stringify(config.initial.param)});
  if (initValue) {
    var sel = ${config.initial.selector.toString()};
    var btn = document.querySelector(sel(initValue));
    if (btn) btn.click();
  }

  /* "Terug naar Vandaag" is de terugweg van de prebuild zélf — slaap, stress
     en verbinding zetten hem boven hun kompas-scherm. Het dashboard heeft
     zijn eigen domein-nav, dus die regel is hier dubbelop. */
  function stripBacklinks() {
    var links = document.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/terug naar vandaag/i.test(a.textContent || "")) continue;
      var host = a.parentElement;
      a.remove();
      if (host && host.children.length === 0 && !host.textContent.trim()) host.remove();
    }
  }
  stripBacklinks();
  new MutationObserver(stripBacklinks).observe(document.body, {
    childList: true,
    subtree: true,
  });

  function routeFor(key) {
    var r = NAV[key];
    if (!r) return null;
    var out = { tab: r.tab };
    if (r.screen) out.screen = r.screen;
    if (r.schap) out.schap = r.schap;
    if (r.fav) out.fav = r.fav;
    if (r.useDomein) out.fav = DOMEIN;
    if (r.useDomeinAsKompas) out.kompas = DOMEIN;
    return out;
  }

  /* Capture-fase: we moeten vóór de eigen handler van de prebuild zijn,
     anders wisselt hij eerst intern van scherm. */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-goto],[data-bridge],[data-ev]");
    if (!el) return;

    var key = null;
    if (el.hasAttribute("data-goto")) key = "goto:" + el.getAttribute("data-goto");
    else if (el.hasAttribute("data-bridge")) key = "bridge:" + el.getAttribute("data-bridge");
    else {
      var ev = el.getAttribute("data-ev") || "";
      if (ev.indexOf("hub_click:") === 0) key = "hub:" + ev.split(":")[1];
    }

    var route = key && routeFor(key);
    if (!route) return;

    e.preventDefault();
    e.stopPropagation();
    parent.postMessage({ source: "psf-prebuild", route: route }, location.origin);
  }, true);
})();
</script>`;
}

/**
 * Haalt de `@font-face`-regels met een base64-bron uit de HTML, schrijft de
 * fonts als echte bestanden weg en geeft een vervangende stylesheet terug.
 * De hash zit in de bestandsnaam, dus de gebouwde bestanden mogen voor altijd
 * gecachet worden en een nieuwe fontversie krijgt vanzelf een nieuwe URL.
 */
const FONT_FACE_RE = /@font-face\s*\{[^{}]*?url\(\s*(["']?)data:(font\/[a-z0-9+-]+);base64,([A-Za-z0-9+/=]+)\1\s*\)[^{}]*?\}/gi;

const EXT_BY_MIME = {
  "font/woff2": "woff2",
  "font/woff": "woff",
  "font/ttf": "ttf",
  "font/otf": "otf",
};

/**
 * Slaap-v2 haalt zijn fonts van Google in plaats van ze in te bedden. Die
 * verzoeken worden door de CSP geblokkeerd (`style-src 'self'`), dus het
 * domein viel terug op systeemfonts en zag er anders uit dan de andere vier.
 * De links eruit, de gedeelde stylesheet erin — dan draaien alle zeven op
 * dezelfde letter, zonder geblokkeerd verzoek in de console.
 */
const GOOGLE_FONT_LINK_RE =
  /[ \t]*<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/gi;

const fontAssets = new Map();

function extractFonts(html) {
  const faces = [];
  const stripped = html.replace(FONT_FACE_RE, (face, _q, mime, base64) => {
    const ext = EXT_BY_MIME[mime.toLowerCase()];
    if (!ext) {
      return face;
    }
    const bytes = Buffer.from(base64, "base64");
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    const name = `font-${hash}.${ext}`;
    fontAssets.set(name, bytes);
    faces.push(
      face.replace(
        /url\(\s*(["']?)data:font\/[a-z0-9+-]+;base64,[A-Za-z0-9+/=]+\1\s*\)/i,
        `url("/prebuilds/fonts/${name}")`,
      ),
    );
    return "";
  });
  return { stripped, faces };
}

mkdirSync(OUT, { recursive: true });
rmSync(join(OUT, "fonts"), { recursive: true, force: true });

const built = [];
const allFaces = new Map();

for (const target of TARGETS) {
  const html = readFileSync(join(SRC, target.src), "utf8");
  if (!html.includes("</head>") || !html.includes("</body>")) {
    throw new Error(`${target.src}: verwacht </head> en </body>`);
  }
  const { stripped, faces } = extractFonts(html.replace(GOOGLE_FONT_LINK_RE, ""));
  for (const face of faces) {
    allFaces.set(face.replace(/\s+/g, " ").trim(), face);
  }
  built.push({ target, html: stripped, faceCount: faces.length });
}

// Eén stylesheet voor alle domeinen: de browser haalt hem één keer op en houdt
// hem vast, in plaats van per prebuild dezelfde fonts opnieuw te lezen.
const fontCss = [...allFaces.values()].join("\n\n") + "\n";
const fontCssName = `fonts-${createHash("sha256").update(fontCss).digest("hex").slice(0, 12)}.css`;

mkdirSync(join(OUT, "fonts"), { recursive: true });
for (const [name, bytes] of fontAssets) {
  writeFileSync(join(OUT, "fonts", name), bytes);
}
writeFileSync(join(OUT, "fonts", fontCssName), fontCss, "utf8");

// Preload naast de stylesheet: anders begint het ophalen van de fonts pas
// nadat die 346 bytes zijn geparsed, en `font-display:block` houdt de tekst
// tot dat moment onzichtbaar.
const FONT_LINK = [
  ...[...fontAssets.keys()].map(
    (name) =>
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="/prebuilds/fonts/${name}">`,
  ),
  `<link rel="stylesheet" href="/prebuilds/fonts/${fontCssName}">`,
].join("\n");

for (const { target, html, faceCount } of built) {
  const patched = html
    .replace("</head>", `${FONT_LINK}\n${EMBED_STYLE}\n</head>`)
    .replace("</body>", `${embedRuntime(target)}\n</body>`);
  writeFileSync(join(OUT, target.out), patched, "utf8");
  const params = new URLSearchParams(target.defaultParams).toString();
  console.log(
    `✓ ${target.out}  (?${params})  ${faceCount} font-face(s) uitgeplaatst`,
  );
}

const fontBytes = [...fontAssets.values()].reduce((n, b) => n + b.length, 0);
console.log(
  `✓ fonts/${fontCssName} + ${fontAssets.size} fontbestand(en), ${(fontBytes / 1024).toFixed(0)} KB, één keer gedeeld`,
);
