#!/usr/bin/env node
/**
 * Inserts/updates coverImage + coverImageAlt on each term in src/data/kennisbank.ts.
 * Skips a slug if public/images/kennisbank/<slug>.jpg is missing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "src/data/kennisbank.ts");
const imagesDir = path.join(root, "public/images/kennisbank");

/** @type {Record<string, string>} */
const ALTS = {
  biobeschikbaarheid:
    "Supplementcapsules en natuurlijke ingrediënten op een licht werkblad",
  chelaatvorm: "Poeders en capsules van mineralen op een rustig werkblad",
  adaptogens: "Gedroogde kruiden en wortels in natuurlijk licht",
  "epa-dha": "Gegrilde zalmfilet op een bord — bron van EPA en DHA",
  "circadiaan-ritme": "Ochtendzon boven een rustig landschap",
  adh: "Glas water op een tafel bij zacht daglicht",
  "efsa-claims": "Documenten en aantekeningen op een ordelijk werkblad",
  "derde-partij-testen": "Laboratoriumglaswerk in een heldere, rustige setting",
  slaaphygiene: "Netjes opgemaakt bed in een rustige slaapkamer",
  "eiwitbehoefte-na-40": "Eiwitrijke maaltijd met groenten en vlees of peulvruchten",
  "kalium-natrium-balans": "Verse groenten en fruit op een snijplank",
  healthspan: "Persoon die een pad oploopt in de buitenlucht",
  "hpa-as": "Persoon in rustige houding bij natuurlijk licht",
  cortisol: "Persoon in rustige meditatiehouding bij warm natuurlijk licht",
  melatonine: "Nachthemel met sterren boven een rustig landschap",
  mitochondrien: "Zonlicht door bomen in een rustig bos",
  "nervus-vagus": "Persoon in rustige ademhalingshouding bij natuurlijk licht",
  atp: "Iemand die krachttraining doet in een lichte ruimte",
  testosteron: "Persoon die buiten beweegt met natuurlijke energie",
  slaapschuld: "Slaapkamer in zacht ochtendlicht na een korte nacht",
  "sociale-verbinding": "Mensen in gesprek bij natuurlijk licht",
  magnesiumvormen: "Groene bladgroenten en zaden op een licht werkblad",
  overtrainingssyndroom: "Atleet in herstelmoment na intensieve training",
  "vitamine-d": "Zonlicht op zee of strand bij helder weer",
  "vitamine-k2": "Supplementen en oliecapsules op een werkblad",
  "vitamine-d-inname": "Capsule naast een maaltijd met vet in natuurlijk licht",
  insulineresistentie: "Gebalanceerde maaltijd met vezels en eiwit",
  "oxidatieve-stress": "Berglandschap in helder, fris daglicht",
  multivitamine: "Kleurrijke groenten, fruit en capsules op een werkblad",
  "ps-score-model": "Notitieboek en etiketonderzoek op een rustig werkblad",
  onderzoeksdosis: "Wetenschappelijke publicaties en notities op een bureau",
  claimdekking: "Supplementcapsules en notitieboek op een licht werkblad",
  etikettransparantie: "Supplementetiketten en capsules in helder licht",
  "onafhankelijke-toetsing": "Laboratoriumsetting met glaswerk en meetapparatuur",
};

let source = fs.readFileSync(dataPath, "utf8");
let patched = 0;
let skipped = 0;

/**
 * Find the end index of shortDefinition (after the closing quote + comma + newline)
 * starting from the term's slug position.
 */
function findShortDefinitionEnd(src, slugIdx) {
  const afterSlug = src.slice(slugIdx);
  // Match: shortDefinition: '...'  OR shortDefinition:\n      '...'
  const m = afterSlug.match(
    /shortDefinition:\s*'((?:\\'|[^'])*)',\n/,
  );
  if (!m || m.index === undefined) return null;
  return slugIdx + m.index + m[0].length;
}

for (const [slug, alt] of Object.entries(ALTS)) {
  const imageFile = path.join(imagesDir, `${slug}.jpg`);
  if (!fs.existsSync(imageFile)) {
    console.warn(`skip ${slug}: missing image`);
    skipped += 1;
    continue;
  }

  const coverImage = `/images/kennisbank/${slug}.jpg`;
  const coverBlock = `    coverImage: '${coverImage}',\n    coverImageAlt: ${JSON.stringify(alt)},\n`;

  const slugIdx = source.indexOf(`slug: '${slug}'`);
  if (slugIdx < 0) {
    console.warn(`skip ${slug}: slug not found`);
    skipped += 1;
    continue;
  }

  // Look ahead only within this term (~2kb) for existing cover
  const window = source.slice(slugIdx, slugIdx + 2500);
  const existingMatch = window.match(
    /    coverImage: '[^']*',\n    coverImageAlt: "[^"]*",\n/,
  );
  if (existingMatch && existingMatch.index !== undefined) {
    const absStart = slugIdx + existingMatch.index;
    source =
      source.slice(0, absStart) +
      coverBlock +
      source.slice(absStart + existingMatch[0].length);
    patched += 1;
    continue;
  }

  const end = findShortDefinitionEnd(source, slugIdx);
  if (end === null) {
    console.warn(`skip ${slug}: could not locate shortDefinition end`);
    skipped += 1;
    continue;
  }

  source = source.slice(0, end) + coverBlock + source.slice(end);
  patched += 1;
}

fs.writeFileSync(dataPath, source);
console.log(`patched: ${patched}, skipped: ${skipped}`);
