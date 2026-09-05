/**
 * Patch coverImage + coverImageAlt into all BlogArtikel data files.
 * Run after images exist in public/images/blog/<slug>.jpg
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BLOG_DIR = path.join(ROOT, "src/data/blog");

/** @type {Record<string, string>} */
const ALTS = {
  "cortisol-verlagen-natuurlijk":
    "Persoon in rustige houding bij natuurlijk licht, gericht op herstel van stress",
  "cortisol-en-slaap":
    "Slaapkamer in zachte avondlichting, rustig beddengoed",
  "ademhaling-tegen-stress":
    "Persoon die buiten yoga of ademhalingsoefeningen doet in de natuur",
  "stress-werk-grenzen-stellen":
    "Rustige moderne werkplek met natuurlijk licht",
  "cortisol-en-testosteron":
    "Man van middelbare leeftijd die krachttraining doet",
  "slaap-verbeteren-40-plus":
    "Netjes opgemaakt bed in een rustige slaapkamer",
  "slaaphygiene-mannen-40-plus":
    "Persoon die ontspannen ligt te rusten in een donkere slaapkamer",
  "magnesium-en-slaap":
    "Sterrenhemel boven bergen in de nacht",
  "melatonine-wanneer-wel-niet":
    "Nachtelijke sterrenhemel boven een donker landschap",
  "melatonine-na-40":
    "Zachte herfstzon door bomen, overgang van dag naar avond",
  "slaapritme-herstellen":
    "Ochtendlicht door een raam bij het ontwaken",
  "vitamine-d-en-slaap":
    "Berglandschap bij helder daglicht",
  "energie-verhogen-natuurlijk":
    "Persoon die een pad oploopt in de buitenlucht",
  "vitamine-d-tekort-herkennen":
    "Zonlicht over een groen natuurlandschap",
  "testosteron-en-energie-na-40":
    "Man die gewichten tilt in een sportschool",
  "omega-3-concentratie-energie":
    "Verse zalm op een bord, rijk aan omega-3",
  "vitamine-d-en-energie":
    "Zonnig strand met helder blauwe lucht",
  "eiwit-na-40":
    "Gezonde maaltijd met eiwitrijke ingrediënten in een kom",
  "eiwitinname-timing-mannen-40":
    "Kleurrijk bord met verse maaltijd, verdeeld over de dag",
  "middagdip-bloedsuiker-na-40":
    "Kop koffie naast een lichte snack op een tafel",
  "krachttraining-na-40":
    "Persoon die krachttraining doet met gewichten",
  "alcohol-slaap-energie-na-40":
    "Wijnglas op een tafel in avondlicht",
  "zout-kalium-bloeddruk-na-40":
    "Verse groenten en kruiden, rijk aan kalium",
  "zonnebrand-en-vitamine-d":
    "Abstracte warme zonlichttextuur",
  "vitamine-d-zon-nederland":
    "Persoon die buiten leest in zacht daglicht",
  "vitamine-d-meten-wanneer-zinvol":
    "Persoon die nadenkt bij aantekeningen of onderzoek",
  "vitamine-d-seizoenen-jaarritme":
    "Mensen in gesprek in een lichte, seizoensgebonden setting",
  "vitamine-d-aandoeningen-onderzoek":
    "Wetenschappelijke boeken en aantekeningen op een bureau",
  "ashwagandha-werking-mannen":
    "Gedroogde kruiden en wortels op een rustige ondergrond",
  "magnesium-en-slaapkwaliteit":
    "Verse bladgroenten en noten op een houten plank",
  "magnesium-in-combinatie-met-medicijnen":
    "Supplementpotjes en capsules op een rustige achtergrond",
  "creatine-en-herstel":
    "Man die na training herstelt in de sportschool",
  "creatine-bijwerkingen-nieren-haaruitval":
    "Atleet die een trainingsbeweging uitvoert",
  "creatine-dosering-en-laadfase":
    "Fitnessspullen en trainingsomgeving",
  "creatine-wanneer-innemen":
    "Sportschoolinterieur met trainingsapparatuur",
  "creatine-vormen-en-keurmerken":
    "Keukenwerkblad met potten en poeders",
  "creatine-water-vasthouden-en-gewicht":
    "Persoon die weegschaal of herstelmoment checkt na training",
  "creatine-en-brein-slaaptekort":
    "Persoon die geconcentreerd leest of nadenkt",
  "creatine-voor-vrouwen-na-40":
    "Vrouw die krachttraining of yoga doet",
  "vitamine-d-en-k2-samen":
    "Supplementcapsules en vitaminen op een neutrale ondergrond",
  "vitamine-d-hoge-doses-social-media":
    "Smartphone met social-mediabeeld, abstract",
  "zink-en-testosteron":
    "Bord met zinkrijke voeding zoals vlees en groenten",
  "omega-3-en-herstel":
    "Verse maaltijd met vette vis of omega-3-rijke producten",
  "multivitamine-zinvol-na-40":
    "Keuken met verse ingrediënten in plaats van een multi",
  "beste-omega-3-supplement":
    "Verse soep of maaltijd met gezonde vetten",
  "wat-is-omega-3":
    "Keukeninterieur met verse producten",
  "waar-let-je-op-bij-omega-3":
    "Laptop en notities: vergelijken en kiezen",
  "beste-magnesium":
    "Mensen die samen werken of overleggen over keuzes",
  "supplement-kiezen-waar-op-letten":
    "Bureau met checklist en documenten voor een zorgvuldige keuze",
};

function insertCoverFields(source, slug, alt) {
  if (/coverImage\s*:/.test(source)) {
    return source.replace(
      /coverImage:\s*"[^"]*",\s*\n\s*coverImageAlt:\s*"[^"]*",?/,
      `coverImage: "/images/blog/${slug}.jpg",\n  coverImageAlt: ${JSON.stringify(alt)},`,
    );
  }

  // After titel: "..." or titel: `...` (single line)
  const titelRe = /(titel:\s*(?:"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`),)/;
  if (!titelRe.test(source)) {
    throw new Error(`No titel field found for ${slug}`);
  }
  return source.replace(
    titelRe,
    `$1\n  coverImage: "/images/blog/${slug}.jpg",\n  coverImageAlt: ${JSON.stringify(alt)},`,
  );
}

function patchCornerstone(source) {
  let out = source;
  for (const [slug, alt] of Object.entries(ALTS)) {
    // Only patch objects that have this slug
    const slugMarker = `slug: "${slug}"`;
    if (!out.includes(slugMarker)) continue;
    // Insert after titel within that object — find from slug to next slug or end
    const idx = out.indexOf(slugMarker);
    const nextSlug = out.indexOf("slug: \"", idx + 1);
    const chunkEnd = nextSlug === -1 ? out.length : nextSlug;
    const before = out.slice(0, idx);
    let chunk = out.slice(idx, chunkEnd);
    const after = out.slice(chunkEnd);
    if (!/coverImage\s*:/.test(chunk)) {
      chunk = chunk.replace(
        /(titel:\s*"(?:\\.|[^"\\])*",)/,
        `$1\n    coverImage: "/images/blog/${slug}.jpg",\n    coverImageAlt: ${JSON.stringify(alt)},`,
      );
    }
    out = before + chunk + after;
  }
  return out;
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".ts"));
let patched = 0;

for (const file of files) {
  if (file === "index.ts" || file === "categorieen.ts" || file === "publiek-pijlers.ts") {
    continue;
  }
  const full = path.join(BLOG_DIR, file);
  let source = fs.readFileSync(full, "utf8");

  if (file === "cornerstone-supplementen.ts") {
    const next = patchCornerstone(source);
    if (next !== source) {
      fs.writeFileSync(full, next);
      patched += 1;
      console.log("patched", file);
    }
    continue;
  }

  const slugMatch = source.match(/slug:\s*"([^"]+)"/);
  if (!slugMatch) {
    console.warn("skip (no slug)", file);
    continue;
  }
  const slug = slugMatch[1];
  const alt = ALTS[slug];
  if (!alt) {
    console.warn("skip (no alt)", slug);
    continue;
  }
  const img = path.join(ROOT, "public/images/blog", `${slug}.jpg`);
  if (!fs.existsSync(img)) {
    console.warn("skip (no image file)", slug);
    continue;
  }
  const next = insertCoverFields(source, slug, alt);
  if (next !== source) {
    fs.writeFileSync(full, next);
    patched += 1;
    console.log("patched", file);
  } else {
    console.log("unchanged", file);
  }
}

console.log("done, patched files:", patched);
